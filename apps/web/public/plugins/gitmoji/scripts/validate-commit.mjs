#!/usr/bin/env node
// PreToolUse hook: refuses a `git commit` whose message does not follow the
// gitmoji convention, and tells the agent what the convention is.
//
// The convention itself lives in convention.json and gitmojis.json. This file
// holds the shell parsing and the slot checks, never the rules: a type, a
// forbidden footer or an example is added by editing the JSON.
//
// Reads the hook payload on stdin, writes a decision on stdout. Anything it
// cannot understand is let through: the hook enforces the convention, it never
// stands between someone and their commit.
//
// Also runnable by hand, which is how its cases are checked:
//   node scripts/validate-commit.mjs --message "🐛 fix the links wrapping"
//   node scripts/validate-commit.mjs --command 'git commit -m "Update footer"'

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Every path in convention.json is relative to the plugin root, so it is
// resolved in one place and never re-derived from this script's own directory.
const PLUGIN_ROOT = new URL("../", import.meta.url);
const at = (path) => new URL(path.replace(/^\.\//, ""), PLUGIN_ROOT);
const load = (path) => JSON.parse(readFileSync(at(path), "utf8"));

const CONVENTION_FILE = "./convention.json";

// `g` and `y` would carry lastIndex from one .test() to the next, so a footer
// caught on one message would be missed on the following one.
const STATEFUL_FLAGS = /[gy]/g;

function compile(footers) {
  return footers.map((footer) => ({
    label: footer.label,
    expression: new RegExp(
      footer.pattern,
      (footer.flags ?? "").replace(STATEFUL_FLAGS, ""),
    ),
  }));
}

// The official list is the `gitmojis` package, published from
// carloscuesta/gitmoji, so this plugin keeps no copy of it. Variation selectors
// are dropped: ⚡ and ⚡️ are the same gitmoji.
//
// The import is dynamic so that a missing dependency, which Claude Code
// installs but a `--plugin-dir` checkout does not, only turns the emoji check
// off instead of taking the whole hook down with it.
async function loadGitmojis() {
  try {
    const { gitmojis } = await import("gitmojis");
    const emojis = new Set(
      gitmojis.map((gitmoji) => gitmoji.emoji.replace(/️/g, "")),
    );
    return emojis.size > 0 ? emojis : null;
  } catch {
    return null;
  }
}

// A heredoc body is lifted out before tokenizing, so the rest of the command
// stays free of newlines and of the quoting that belongs to the message.
function extractHeredocs(command) {
  const bodies = [];
  const opener = /<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/g;
  let rewritten = "";
  let cursor = 0;
  let match;

  while ((match = opener.exec(command)) !== null) {
    const delimiter = match[2];
    const newline = command.indexOf("\n", opener.lastIndex);
    if (newline === -1) continue;

    const rest = command.slice(newline + 1);
    const terminator = new RegExp(`^[ \\t]*${delimiter}[ \\t]*$`, "m").exec(
      rest,
    );
    const body = terminator ? rest.slice(0, terminator.index) : rest;
    const end = terminator
      ? newline + 1 + terminator.index + terminator[0].length
      : command.length;

    rewritten +=
      command.slice(cursor, match.index) + `__CC_HEREDOC_${bodies.length}__`;
    bodies.push(body.replace(/\n$/, ""));
    cursor = end;
    opener.lastIndex = end;
  }

  return { command: rewritten + command.slice(cursor), bodies };
}

// Quote-aware split. Keeps `$(…)` in one piece and emits the shell operators as
// their own tokens so the command can be cut into simple commands afterwards.
function tokenize(input) {
  const tokens = [];
  let current = "";
  let started = false;
  let i = 0;

  const flush = () => {
    if (started) tokens.push(current);
    current = "";
    started = false;
  };

  while (i < input.length) {
    const char = input[i];

    if (char === "\\" && i + 1 < input.length) {
      current += input[i + 1];
      started = true;
      i += 2;
      continue;
    }

    if (char === "'") {
      const end = input.indexOf("'", i + 1);
      current += end === -1 ? input.slice(i + 1) : input.slice(i + 1, end);
      started = true;
      i = end === -1 ? input.length : end + 1;
      continue;
    }

    if (char === '"') {
      let j = i + 1;
      while (j < input.length && input[j] !== '"') {
        if (input[j] === "\\" && j + 1 < input.length) {
          current += input[j + 1];
          j += 2;
          continue;
        }
        current += input[j];
        j++;
      }
      started = true;
      i = j + 1;
      continue;
    }

    if (char === "$" && input[i + 1] === "(") {
      let depth = 0;
      let j = i + 1;
      for (; j < input.length; j++) {
        if (input[j] === "(") depth++;
        else if (input[j] === ")" && --depth === 0) break;
      }
      current += input.slice(i, j + 1);
      started = true;
      i = j + 1;
      continue;
    }

    if (char === "&" && input[i + 1] === "&") {
      flush();
      tokens.push("&&");
      i += 2;
      continue;
    }

    if (char === "|" && input[i + 1] === "|") {
      flush();
      tokens.push("||");
      i += 2;
      continue;
    }

    if (char === ";" || char === "|" || char === "&" || char === "\n") {
      flush();
      tokens.push(";");
      i++;
      continue;
    }

    if (/\s/.test(char)) {
      flush();
      i++;
      continue;
    }

    current += char;
    started = true;
    i++;
  }

  flush();
  return tokens;
}

function splitSimpleCommands(tokens) {
  const operators = new Set(["&&", "||", ";"]);
  const commands = [[]];
  for (const token of tokens) {
    if (operators.has(token)) commands.push([]);
    else commands[commands.length - 1].push(token);
  }
  return commands.filter((command) => command.length > 0);
}

function resolveHeredoc(value, bodies) {
  const substitution = /^\$\(\s*cat\s+__CC_HEREDOC_(\d+)__\s*\)$/.exec(value);
  if (substitution) return bodies[Number(substitution[1])];

  const direct = /^__CC_HEREDOC_(\d+)__$/.exec(value);
  if (direct) return bodies[Number(direct[1])];

  return null;
}

function isGitCommit(command) {
  const words = command.filter(
    (token) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(token),
  );
  if (words.length < 2) return false;
  return words[0].split("/").pop() === "git" && words.includes("commit");
}

// A token the shell will expand into something this script cannot know: a
// variable, a command substitution, backticks. Quoting is lost by the time a
// token reaches here, so `'$MSG'` is treated the same as `"$MSG"`, and the
// message is let through unchecked rather than validated as literal text.
function isUnexpanded(value) {
  return value.includes("$") || value.includes("`");
}

// The message of one `git commit`, or null when there is nothing this script
// can check with certainty: no -m at all (an editor opens), --amend --no-edit,
// --fixup, -C, a message the shell still has to build, a relative -F path.
function messageOf(command, bodies) {
  const parts = [];

  for (let i = 0; i < command.length; i++) {
    const token = command[i];
    let value;

    if (token === "-m" || token === "--message") {
      value = command[i + 1];
      i++;
    } else if (token.startsWith("--message=")) {
      value = token.slice("--message=".length);
    } else {
      // -m glued to its value (-mfix), or grouped short flags ending in m (-am).
      const short = /^-([a-zA-Z]*)m(.*)$/.exec(token);
      if (!short) continue;
      if (short[2]) {
        value = short[2];
      } else {
        value = command[i + 1];
        i++;
      }
    }

    if (value === undefined) return null;

    const body = resolveHeredoc(value, bodies);
    if (body !== null) {
      parts.push(body);
      continue;
    }

    if (isUnexpanded(value)) return null;
    parts.push(value);
  }

  // git joins every -m with a blank line, so the second one carries the body
  // and its footers. Checking only the first would leave them unseen.
  if (parts.length > 0) return parts.join("\n\n");

  // `git commit -F - <<'EOF'` and `git commit --file=-`: the heredoc is stdin.
  for (const token of command) {
    const body = resolveHeredoc(token, bodies);
    if (body !== null) return body;
  }

  // `git commit -F message.txt`. Only an absolute path can be read with
  // certainty: a relative one resolves against the directory the command will
  // run in, which this process does not know, so reading it here could check
  // the wrong file and quote a stranger's text back into the refusal.
  for (let i = 0; i < command.length; i++) {
    const token = command[i];
    const file =
      token === "-F" || token === "--file"
        ? command[i + 1]
        : token.startsWith("--file=")
          ? token.slice("--file=".length)
          : null;
    if (file === null || file === undefined) continue;
    if (!file.startsWith("/") || isUnexpanded(file)) return null;
    try {
      return readFileSync(file, "utf8");
    } catch {
      return null;
    }
  }

  return null;
}

// "Update footer links" breaks the lowercase rule; "CLAUDE.md with docs" and
// "Node.js to v21" do not, they carry an identifier's own casing. Both start
// with a capital, so the rule looks at the shape of the first word instead:
// a plain capitalised word, no inner capital, no dot. Measured against the 765
// conforming commits of this repository, it refuses none of them.
function isSentenceCased(description) {
  return /^\p{Lu}\p{Ll}+$/u.test(description.split(/\s+/)[0]);
}

// The <type> is the verb of the subject, so a description opening on another
// verb stacks two sentences: "fix stop the footer from wrapping" says "fix"
// and "stop the footer" at once, the shape a `fix:` prefix leads to.
// convention.json lists only verbs that are not also an ordinary noun, so
// "add open graph image" and "fix scroll behavior" keep their first word.
// Measured against the 938 subjects of this repository, it catches nine, and
// every one of them is a real second verb.
function secondVerb(description, secondVerbs) {
  const word = description
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return secondVerbs.has(word) ? word : null;
}

function validate(message, rules, gitmojis) {
  const subject = message.split("\n")[0].trim();
  if (!subject) return [];

  const problems = [];
  const words = subject.split(/\s+/);

  // Without the gitmoji every slot shifts by one, so read the rest from where
  // it actually starts: the problems reported then name the real words.
  const hasGitmoji = /\p{Extended_Pictographic}/u.test(words[0]);
  const type = hasGitmoji ? words[1] : words[0];
  const description = words.slice(hasGitmoji ? 2 : 1).join(" ");

  if (!hasGitmoji) {
    problems.push("the subject does not start with a gitmoji");
  } else if (gitmojis !== null && !gitmojis.has(words[0].replace(/️/g, ""))) {
    problems.push(
      `${words[0]} is not one of the ${gitmojis.size} official gitmojis`,
    );
  }

  if (!type) {
    problems.push("the subject has no <type> and no <description>");
  } else if (!rules.types.includes(type)) {
    problems.push(
      `"${type}" is not an allowed type (the <type> slot takes one of the types below)`,
    );
  } else if (!description) {
    problems.push("the subject has no <description>");
  } else {
    if (isSentenceCased(description)) {
      problems.push(
        `the description reads as a capitalised sentence: "${description}"`,
      );
    }

    const second = secondVerb(description, rules.secondVerbs);
    if (second) {
      problems.push(
        `the description opens on "${second}", a second verb, while "${type}" ` +
          `is already the verb of the subject`,
      );
    }
  }

  for (const footer of rules.footers) {
    if (footer.expression.test(message)) {
      problems.push(`the message carries ${footer.label}`);
    }
  }

  return problems;
}

function indent(text) {
  return text
    .split("\n")
    .map((line) => (line === "" ? "" : `  ${line}`))
    .join("\n");
}

function reason(message, problems, rules) {
  const { convention } = rules;
  const types = convention.types
    .map((type) => `  ${type.name.padEnd(11)}${type.description}`)
    .join("\n");

  return `This commit does not follow the gitmoji convention, so it was not created.

Message:
${indent(message)}

What is wrong:
${problems.map((problem) => `  - ${problem}`).join("\n")}

Expected structure:

${indent(convention.structure)}

The <type> slot takes one of these, and nothing else:

${types}

Rules:
${convention.rules.map((rule) => `  - ${rule}`).join("\n")}

The <type> is the verb, so the description carries on from it instead of
starting over. The same change, written both ways:

${convention.counterExamples
  .map((pair) => `  not  ${pair.wrong}\n  but  ${pair.right}`)
  .join("\n\n")}

Examples:
${convention.examples.map((example) => `  ${example}`).join("\n")}

Rewrite the message and commit again. The full convention is in
${fileURLToPath(at(CONVENTION_FILE))}, and the emoji has to be one of those
printed by \`node ${fileURLToPath(at("./scripts/list-gitmojis.mjs"))}\`.`;
}

function deny(message, problems, rules) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason(message, problems, rules),
      },
    }),
  );
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) return resolve("");
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function messagesIn(rawCommand) {
  const { command, bodies } = extractHeredocs(rawCommand);
  return splitSimpleCommands(tokenize(command))
    .filter(isGitCommit)
    .map((simpleCommand) => messageOf(simpleCommand, bodies))
    .filter((message) => typeof message === "string" && message.trim() !== "");
}

async function main() {
  const argv = process.argv.slice(2);

  const convention = load(CONVENTION_FILE);
  const rules = {
    convention,
    types: convention.types.map((type) => type.name),
    secondVerbs: new Set(convention.secondVerbs),
    footers: compile(convention.forbiddenFooters),
  };

  const gitmojis = await loadGitmojis();

  const direct = argv.indexOf("--message");
  if (direct !== -1 && argv[direct + 1] !== undefined) {
    const message = argv[direct + 1];
    const problems = validate(message, rules, gitmojis);
    if (problems.length > 0) deny(message, problems, rules);
    return;
  }

  let rawCommand = null;
  const explicit = argv.indexOf("--command");
  if (explicit !== -1 && argv[explicit + 1] !== undefined) {
    rawCommand = argv[explicit + 1];
  } else {
    try {
      const payload = JSON.parse(await readStdin());
      if (payload?.tool_name !== undefined && payload.tool_name !== "Bash") {
        return;
      }
      rawCommand = payload?.tool_input?.command ?? null;
    } catch {
      return; // Not a payload this hook understands.
    }
  }

  if (typeof rawCommand !== "string" || !rawCommand.includes("commit")) return;

  for (const message of messagesIn(rawCommand)) {
    const problems = validate(message, rules, gitmojis);
    if (problems.length > 0) {
      deny(message, problems, rules);
      return; // One decision per tool call.
    }
  }
}

main().catch(() => {
  // A broken hook must never block a commit.
});
