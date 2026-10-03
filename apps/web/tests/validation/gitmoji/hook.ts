import assert from "node:assert";
import { execFileSync } from "node:child_process";
import test, { describe } from "node:test";
import { VALIDATOR } from ".";

// What the hook does with a `git commit`, read the way the Bash tool hands it
// over. "refused" means the hook denies the tool call; "allowed" covers both a
// conforming message and a command the script cannot read with certainty,
// which it must let through rather than guess at.
type Expectation = "refused" | "allowed";

const heredoc = (message: string) =>
  `git commit -m "$(cat <<'EOF'\n${message}\nEOF\n)"`;

const CASES: [Expectation, string, string][] = [
  // Conforming subjects
  ["allowed", "a conforming subject", `git commit -m "🐛 fix stop the footer from wrapping"`],
  ["allowed", "an issue number", `git commit -m "✨ add dark mode toggle (#42)"`],
  ["allowed", "a real commit of this repository", `git commit -m "⚡️ improve stop the conversion link from delaying the click"`],
  ["allowed", "a scoped package release", `git commit -m "🔖 release @onruntime/translations v0.3.0"`],
  ["allowed", "the initial commit", `git commit -m "🎉 initial commit"`],
  ["allowed", "an emoji without its variation selector", `git commit -m "♻ refactor extract the footer links"`],
  ["allowed", "a zwj emoji", `git commit -m "🧑‍💻 improve the developer experience"`],

  // Structure
  ["refused", "a plain sentence", `git commit -m "Update footer links"`],
  ["refused", "conventional commits", `git commit -m "fix: footer links wrap"`],
  ["refused", "no gitmoji", `git commit -m "fix stop the footer from wrapping"`],
  ["refused", "a type outside the convention", `git commit -m "🐛 bugfix stop the footer from wrapping"`],
  ["refused", "a type read off the gitmoji's name", `git commit -m "🎨 style reformat the footer"`],
  ["refused", "nothing but a gitmoji and a type", `git commit -m "🐛 fix"`],
  ["refused", "an emoji outside the official list", `git commit -m "🦄 add a unicorn"`],
  ["refused", "a plausible but unofficial emoji", `git commit -m "🔄 update stuff"`],
  ["refused", "an emoji merged upstream but not released", `git commit -m "🦖 add backwards compatibility"`],

  // Lowercase, as the convention words it. An identifier keeps its own casing;
  // a capitalised ordinary word is the shape this rule is after.
  ["refused", "a capitalised first word", `git commit -m "🐛 fix Stop the footer from wrapping"`],
  ["allowed", "a file name's own casing", `git commit -m "📝 update CLAUDE.md with the plugin documentation"`],
  ["allowed", "a product's own casing", `git commit -m "⬆️ upgrade Node.js to v21"`],
  ["allowed", "an identifier mid-description", `git commit -m "💄 add className support to the safari component"`],

  // Agent signatures, and the human co-author the documentation shows
  ["refused", "an agent credited with no surname", heredoc("📝 add contributors\n\nCo-Authored-By: Claude <noreply@anthropic.com>")],
  ["refused", "an agent credited with a full name", heredoc("📝 add contributors\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>")],
  ["refused", "a generated-with footer", heredoc("✨ add a thing\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)")],
  ["allowed", "a human co-author", heredoc("📝 update documentation contributors\n\n- Add @jerembdn as a contributor\n\nCo-authored-by: Younes Bessa <younes@onruntime.com>")],
  ["allowed", "a human whose first name is Claude", heredoc("📝 add contributors\n\nCo-authored-by: Claude Dubois <claude.dubois@onruntime.com>")],
  ["refused", "an agent footer in a second -m", `git commit -m "🐛 fix a thing" -m "Co-Authored-By: Claude <noreply@anthropic.com>"`],
  ["allowed", "an ordinary body in a second -m", `git commit -m "📝 add the hook documentation" -m "Second paragraph, capitalised."`],

  // Bodies are free text, only the subject carries the structure
  ["allowed", "capitals in the body", heredoc("✨ add plural arguments\n\nUpper case is fine here.\nSo is Stripe.")],
  ["allowed", "a list in the body", heredoc("🌐 update the locale urls\n\n- fr\n- en")],

  // Flag shapes
  ["allowed", "grouped short flags", `git commit -am "🔧 update the eslint config"`],
  ["refused", "grouped short flags, offending", `git commit -am "Add the eslint config"`],
  ["allowed", "-m glued to its value", `git commit -m"🚀 release deploy the site"`],
  ["refused", "-m glued to its value, offending", `git commit -m"Deploy the site"`],
  ["allowed", "--message=", `git commit --message="🔥 remove the dead footer code"`],
  ["refused", "--message=, offending", `git commit --message="Remove the dead footer code"`],

  // Nothing to check, so nothing is refused
  ["allowed", "no message at all", `git commit`],
  ["allowed", "an amend that keeps the message", `git commit --amend --no-edit`],
  ["allowed", "a fixup", `git commit --fixup=HEAD~1`],
  ["allowed", "a reused message", `git commit -C HEAD`],
  ["allowed", "a merge", `git merge --no-ff feature`],
  ["allowed", "another git command", `git status --short`],

  // A message the shell still has to build cannot be read, so it is let
  // through: refusing it would block a legitimate commit.
  ["allowed", "a message in a shell variable", `git commit -m "$MSG"`],
  ["allowed", "a command substitution", `git commit -m "$(cat .git/MSG)"`],
  ["allowed", "ansi-c quoting", `git commit -m $'🐛 fix stop the footer from wrapping'`],
  ["allowed", "a relative -F path", `cd sub && git commit -F msg.txt`],

  // Not a commit at all
  ["allowed", "a commit inside a string", `echo "git commit -m 'Bad message'"`],
  ["allowed", "the word commit in another command", `grep -rn commit src/`],

  // Shapes that reach the validator
  ["refused", "a leading environment assignment", `GIT_AUTHOR_NAME=x git commit -m "Update things"`],
  ["refused", "an absolute git path", `/usr/bin/git commit -m "Update things"`],
  ["refused", "git -C", `git -C /tmp commit -m "Update things"`],
  ["refused", "the second commit of a chain", `git commit -m "🐛 fix a thing" && git commit -m "And another"`],
  ["allowed", "a commit after staging", `git add . && git commit -m "♻️ refactor extract the footer links"`],
];

function decide(command: string): Expectation {
  const payload = JSON.stringify({
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: { command },
  });

  const output = execFileSync("node", [VALIDATOR], {
    input: payload,
    encoding: "utf8",
  });

  if (output.trim() === "") return "allowed";

  const { hookSpecificOutput } = JSON.parse(output);
  assert.strictEqual(
    hookSpecificOutput.permissionDecision,
    "deny",
    `the hook answered ${hookSpecificOutput.permissionDecision} instead of deny`,
  );
  return "refused";
}

export function hookTests() {
  describe("Gitmoji commit hook", () => {
    // One test over the whole table: every mismatch is reported at once, so a
    // change that shifts several cases is read in one go.
    test(`${CASES.length} commit commands are decided as expected`, () => {
      const wrong: string[] = [];

      for (const [expected, label, command] of CASES) {
        const actual = decide(command);
        if (actual !== expected) {
          wrong.push(`${label}: expected ${expected}, got ${actual}\n  ${command}`);
        }
      }

      assert.deepStrictEqual(wrong, [], `\n${wrong.join("\n")}`);
    });

    // Without this, a regression that stops the hook refusing anything at all
    // would leave every other test in this file green.
    test("the table covers both decisions", () => {
      const refused = CASES.filter(([expected]) => expected === "refused");
      const allowed = CASES.filter(([expected]) => expected === "allowed");

      assert.ok(refused.length >= 15, `only ${refused.length} refusal cases`);
      assert.ok(allowed.length >= 15, `only ${allowed.length} allowed cases`);
    });
  });
}
