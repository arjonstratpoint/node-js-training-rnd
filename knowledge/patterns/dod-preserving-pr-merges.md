# Pattern: DoD-preserving PR merges and GitHub auth paths

- **Merge method matters.** When acceptance criteria require "3+ Conventional Commits in a merged
  PR", use a **merge commit** — squash merging collapses the history and silently fails the DoD.
- **Auth paths differ per tool.** SSH push (`git@github.com`) can work while `gh` CLI is logged
  out and the GitHub MCP token lacks access to the repo (403). Plan PR creation on the weakest
  link: run `gh auth login` up front, or leave the `pull/new/<branch>` URL the remote prints as
  the fallback.
- **Deliberate conflict recipe:** branch from the feature HEAD, edit the same line on both
  branches with different text, merge, resolve by combining intent — commit message prefixed
  `fix:` keeps it a Conventional Commit.
