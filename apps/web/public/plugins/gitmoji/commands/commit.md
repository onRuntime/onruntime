---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(curl:*)
description: Create a git commit following the gitmoji convention
argument-hint: [optional commit message hint]
---

# Gitmoji Conventional Commits

Generate commit messages following the gitmoji convention by onRuntime Studio.

## Commands you can use

These are the commands available for building the commit:

- `git status --short` — compact list of changed files
- `git diff --staged --stat` / `git diff --stat` — per-file change overview
- `git diff --staged <path>` / `git diff <path>` — full diff of a specific file
- `git log --oneline -5` — recent commits, for style reference

Only the compact summaries are pre-run for you at the end of this prompt (so a huge
diff never buries the rules and types). To read the actual changes of a file before
committing it, run its full `git diff <path>` yourself.

## Commit Structure

```
<gitmoji> <type> <description> [(#<issue number>)]

[optional body]

[optional footer(s)]
```

## Rules

1. Write in **lowercase**
2. Use **imperative mood** ("add" not "added")
3. One logical change per commit
4. Keep description concise

## Types

The `<type>` **MUST** be exactly one of the values below. The gitmoji and the type
are two independent choices: pick the gitmoji freely from the full list for
expressiveness, but never derive the type from the gitmoji's name or description.
When no type obviously fits, collapse to the nearest general one.

| Type | Description |
| --- | --- |
| `add` | Add a new feature |
| `fix` | Fix a bug |
| `improve` | Improve something |
| `update` | Update something |
| `remove` | Remove something |
| `refactor` | Refactor something |
| `rename` | Rename something |
| `move` | Move a file or folder |
| `upgrade` | Upgrade dependencies |
| `downgrade` | Downgrade dependencies |
| `release` | Release / version tag |

## Your Task

Using the git context and gitmoji list provided **below**, create commits following the gitmoji convention.

If the user provided a hint: $ARGUMENTS

**Important**:
- Use the gitmoji list below to select the correct emoji.
- Look at the recent commits below for tone/wording style only. They are **not**
  authoritative for the type slot: older commits may use a type not in the table
  above. The Types table is the only source of truth for `<type>`.
- The context below shows only compact **summaries** (`--short` / `--stat`). Before
  committing a file, read its full diff yourself with `git diff <path>` (or
  `git diff --staged <path>`). Never commit a file you haven't fully read.
- Split changes into multiple commits if needed. One commit = one logical change.
- Do NOT sign commits. No "Generated with Claude Code", no "Co-Authored-By", no footer.

1. Analyze the changes and group them by logical units
2. For each group:
   - Stage only the relevant files
   - Choose the correct gitmoji from the list below based on the type of change
   - Write a concise commit message
   - **Before committing, verify the second token of the message is exactly one
     of the allowed types in the Types table. If it is not, fix it.**
   - Create the commit
3. Repeat for each logical group of changes

---

## Available Gitmojis

!`curl -s https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json | jq -r '.gitmojis[] | "\(.emoji) | \(.description)"'`

## Git Context

- Current git status: !`git status --short`
- Staged changes (summary): !`git diff --staged --stat`
- Unstaged changes (summary): !`git diff --stat`
- Current branch: !`git branch --show-current`
- Recent commits for style reference: !`git log --oneline -5`
