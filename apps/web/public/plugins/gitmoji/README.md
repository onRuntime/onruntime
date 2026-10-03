# gitmoji

Claude Code plugin for the commit convention of onRuntime Studio.

## What enforces the convention

Two layers, both reading the same data:

- `skills/commit/SKILL.md` is picked up on its own whenever a commit is about to
  be created, so the convention applies without anyone running a command. It is
  also invocable as `/gitmoji:commit`
- `hooks/hooks.json` runs `scripts/validate-commit.mjs` before every
  `git commit` and refuses a message that breaks the convention, explaining why.
  It is the floor under the skill: an agent that never read the skill still ends
  up with a conforming message, at the cost of one round trip

## Where the convention lives

`convention.json` is the single source of truth: the structure, the allowed
types with their meaning, the rules, the footers that are refused, and the
examples. Adding a type or a rule means editing that file, and nothing else.

The emoji list is not kept here at all. It comes from the [`gitmojis`
package](https://www.npmjs.com/package/gitmojis), published from
[carloscuesta/gitmoji](https://github.com/carloscuesta/gitmoji), pinned in
`package-lock.json` and raised with `npm update gitmojis`. The hook imports it,
and `scripts/list-gitmojis.mjs` prints it for the skill.

Claude Code installs that dependency into the cached copy when it installs or
updates the plugin: a plugin root holding both a `package.json` and a
`package-lock.json` gets `npm ci --ignore-scripts`, with a 60-second budget.
A plugin loaded in place with `--plugin-dir` is never copied, so install it
yourself when working on the plugin:

```bash
npm install
```

Without it the hook still checks the structure, the type and the footers, and
only the emoji check goes quiet.

The skill and the hook therefore read the same convention and the same emoji
list, which cannot drift from what an agent is told.

## Checking the hook by hand

`scripts/validate-commit.mjs` takes a message or a whole shell command, and
prints a decision only when it refuses:

```bash
node scripts/validate-commit.mjs --message "🐛 fix stop the links from wrapping"
node scripts/validate-commit.mjs --command 'git commit -m "Update footer"'
```

Anything it cannot parse is let through: it enforces the convention, it never
stands between someone and their commit.
