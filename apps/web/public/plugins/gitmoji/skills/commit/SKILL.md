---
name: commit
description: Create git commits that follow the gitmoji convention by onRuntime Studio, where every subject reads "<gitmoji> <type> <description>".
when_to_use: Use before creating any git commit, whether the user asked for one ("commit this", "commit my changes", "ship it") or a task just ended with changes worth committing. Also use when a commit message has to be written, rewritten, or amended, and when a commit was refused for not following the convention.
argument-hint: [optional commit message hint]
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/list-gitmojis.mjs)
---

# Gitmoji Conventional Commits

The commit convention of onRuntime Studio. It applies to **every** commit you
create in a repository that enables this plugin, not only to the ones made by
invoking this skill.

A `PreToolUse` hook checks each `git commit` against the same two files you are
about to read, and refuses the ones that break the convention. Reading them
costs less than a refused commit.

## Read the convention

Before writing a message, get both halves of it:

- Read `${CLAUDE_PLUGIN_ROOT}/convention.json` — the structure, the allowed
  types with their meaning, the rules, the footers that are refused, and
  examples. It is data, not prose
- Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/list-gitmojis.mjs` — the official
  gitmoji list, the only emojis allowed in the first slot. It comes from the
  `gitmojis` package, so it is the published list and not a copy. Never invent
  an emoji that it does not print

Nothing in this file repeats their content, so the convention cannot drift
between what you read and what the hook enforces.

## Commit

If the user passed a hint along with the invocation, take it as the starting
point for the description: $ARGUMENTS

1. Read the state of the repository yourself:
   - `git status --short` — compact list of changed files
   - `git diff --staged --stat` / `git diff --stat` — per-file change overview
   - `git log --oneline -5` — recent commits, for tone and wording only. They
     are **not** authoritative for the type slot: older commits may use a type
     that is no longer in `convention.json`
2. Group the changes by logical unit
3. For each group:
   - Stage only the relevant files
   - Read the full diff of what you are about to commit with `git diff <path>`
     (or `git diff --staged <path>`). Never commit a file you haven't read
   - Pick the gitmoji that describes the change, then pick the type. They are
     independent choices
   - Write the subject, then check it against `convention.json` before
     committing: the `<type>` it takes, and the one sentence the type and the
     description have to read as
   - Create the commit
4. Repeat for each remaining group
