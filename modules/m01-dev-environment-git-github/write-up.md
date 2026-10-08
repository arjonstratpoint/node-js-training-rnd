# M01 Write-Up — Dev Environment, Git & GitHub

> Filled in as I went. Written so a trainee starting this stage next cohort could follow my path.

## What I built

- Public repo: https://github.com/arjonstratpoint/node-js-training-rnd
- Merged PR (merge commit, not squash): https://github.com/arjonstratpoint/node-js-training-rnd/pull/1
- `scripts/hello-node.js` — dependency-free script, runs with `node scripts/hello-node.js`
- Toolchain pins: `.nvmrc` (Node 24), `.env.example` (no real secrets), `.gitignore` covering
  `node_modules`, `prisma/generated/`, `dist`, `coverage`, `*.db`, `.env`
- History: 7 Conventional Commits, including a real merge conflict resolved on the way

## Why it's built this way (key decisions)

- **Branch and commit structure.** One feature branch (`feat/hello-node`) off `main`, with each
  logical change as its own Conventional Commit (`feat:` for the script, `chore:` for tooling
  pins) so the reviewer can read intent per commit instead of one blob. The conflict side-branch
  (`conflict-alternate`) forked from the feature branch so the clash happened *before* review,
  not after merge. I merged with a **merge commit**, not squash — the DoD requires 3+ commits
  visible in the merged history, and squash would have collapsed them to one.
- **Public repo vs private with a no-direct-push rule.** Public was the default so we don't
  depend on plan-gated branch protection. On a private repo with the rule enforced, the workflow
  would be stricter rather than different: pushes to `main` rejected server-side, PRs mandatory,
  required review count configured, and force-pushes banned — my local habits would need to be
  correct because the server wouldn't forgive history rewrites. The trade-off: private repos
  gate that enforcement behind the GitHub plan, which is exactly why the program mandates
  public.
- **How we resolved the conflict — and merge vs rebase.** Both branches edited the greeting
  line; Git stopped the merge with `UU` markers. We kept both intents instead of picking a
  winner, resolving to
  `console.log('Hello, Node.js! (from the pair programming session)');` and committed the
  resolution as `fix: resolve merge conflict in hello-node greeting`. A rebase of
  `conflict-alternate` onto the feature branch would also have surfaced the conflict, but it
  would have replayed the commits with new SHAs and produced a linear history where the
  conflict's resolution is a plain commit — losing the explicit record that two lines of work
  were joined. For this exercise the merge made the conflict visible in history, which is the
  point.

## How to build it (teach it to the next trainee)

1. **Start from a clean slate.** `git status` first — nothing half-staged. Confirm Node with
   `node --version` and pin it: `echo 24 > .nvmrc` so every machine in the cohort runs the same
   version.
2. **Branch before you type.** `git checkout -b feat/hello-node`. Never commit to `main`
   directly; the branch is cheap insurance and makes the PR trivial.
3. **Commit in slices with intent.** Write the change, `git add <one concern>`, then
   `git commit -m "feat: add hello-node script"`. Conventional Commits (`type: summary`) force
   you to name the *why* — `chore:` for tooling, `feat:` for behavior. Several small beats one
   big: the reviewer sees reasoning, not a wall.
4. **Push and open the PR early.** `git push -u origin feat/hello-node`, then
   `gh pr create` (or the `pull/new/<branch>` URL GitHub prints). A draft PR invites feedback
   before you're emotionally attached.
5. **Get the review.** Your partner comments on the diff; you respond or push fixes as new
   commits — never force-push over review feedback.
6. **Create a real conflict on purpose.** From the feature branch: `git branch side`, switch
   over, edit line N, commit; switch back, edit line N differently, commit; then
   `git merge side`. Git halts with `<<<<<<<` markers. Read the markers: top is *yours*, bottom
   is *theirs*, the `=======` splits them. Edit the file to the version you actually want (both
   intents combined here), delete the markers, `git add`, and commit — read the merge message
   and edit it to say what you resolved and why.
7. **Merge deliberately.** After approval, merge with a **merge commit**
   (`gh pr merge --merge`), not squash or rebase-merge, if you need the individual commits and
   the conflict resolution to survive in `main`. Verify with
   `git log --oneline --graph` — you should see the diamond.
8. **Prove it.** `node scripts/hello-node.js` on `main` after the merge; confirm `.gitignore`
   and `.env.example` are in the tree and no `.env` ever was.

## Concepts worth explaining

### `git revert` vs `git reset` (my own words)

Both undo changes, but they disagree about history:

- **`git revert <commit>`** doesn't delete anything. It computes the inverse of the commit and
  applies it as a **brand-new commit** on top of your branch. The original commit is still there;
  the new one cancels it out. Because nothing is rewritten, it's safe on branches other people
  already pulled — which is exactly why you revert on `main` after a bad merge, and why our PR
  used a merge commit: history on a shared branch is append-only.
- **`git reset <commit>`** **moves the branch pointer backwards** and drops the commits that are
  now behind it. Those commits vanish from the branch (they're recoverable from the reflog for a
  while, but only you know to look). How much disappears from your working tree depends on the
  flag: `--soft` keeps changes staged, `--mixed` (default) unstages them, `--hard` throws the
  changes away entirely. That power is why `reset` is a local-cleanup tool — running it on a
  branch someone else has fetched rewrites published history and forces everyone to
  re-sync painfully.

So my rule of thumb: **rewriting my own unpushed work → `reset`; undoing anything on shared
history → `revert`.** That's also the merge-vs-rebase intuition in miniature — both rewrite vs.
preserve history, and the deciding question is always "has anyone else seen this commit?"

## What tripped me up

- **Auth is three different doors.** `git push` over SSH worked immediately, but the GitHub CLI
  was logged out *and* the MCP token couldn't open this repo (403) — so the push succeeded while
  PR creation failed twice. I assumed "GitHub works" was one switch; it's per-tool credentials.
  Fix: run `gh auth login` (device flow) before starting, not after you're blocked.
- **The DoD trap in the merge button.** The default merge method on many repos is *squash*,
  which would have quietly turned 7 Conventional Commits into 1 and failed the "3+ commits"
  criterion with no error anywhere. I had to explicitly pick "Create a merge commit".
- **Conflict markers are dumb — that's the point.** The merged file literally contains
  `<<<<<<<`, `=======`, `>>>>>>>` as text. Git won't fix it for you; if you commit without
  cleaning them, the file is broken. Also expected the conflict on line 1 of the file; it
  appeared on the one line both branches touched — Git only quarantines what actually collides.

## Checkpoint evidence

- Merged PR: https://github.com/arjonstratpoint/node-js-training-rnd/pull/1 (merge commit
  `3500592`, 7 Conventional Commits, conflict resolution commit `21e2473` in history)
- `.gitignore` and `.env.example` in the repo root
- `git revert` vs `git reset` explanation: see "Concepts worth explaining" above

## What I'd do differently

- Do the preflight first: `gh auth status`, Node version, and repo visibility *before* writing
  any code — I validated auth after the work existed, which made a green branch look blocked.
- Open the PR as a draft right after the first commit, so review can start while I keep
  committing instead of after the whole branch is done.
- Script the conflict exercise as a tiny two-file pair (e.g. both branches editing `README`
  lines) if I were teaching it — the hello-node greeting worked, but a visible README clash is
  easier to narrate to someone who has never seen markers.
- Record the revert-vs-reset narration while it was fresh (voice note or draft during the
  lab) instead of reconstructing it in the write-up at the end — the brief explicitly says fill
  this in as you go, and I didn't.
