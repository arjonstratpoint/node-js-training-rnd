# M01 Tasks — Dev Environment, Git & GitHub

Set up the toolchain, use the everyday Git workflow, and collaborate through GitHub pull requests.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully before starting anything.
- [ ] Set up your toolchain (VS Code, Git, a Node version manager, Bruno); confirm terminal basics;
      create a `.nvmrc` pinning the cohort's Node version.
- [ ] Create a public GitHub repo for this stage and connect your local remote.

## Build

- [ ] Practice the core Git commands solo: `init`/`clone`, `status`, `add`, `commit`, `log`, `diff`,
      `restore`, `stash` — then look up the difference between `revert` and `reset` rather than
      guessing.
- [ ] Add a `.gitignore` covering `node_modules`, `.env`, `*.db`, the generated Prisma client,
      `dist`, and `coverage`.
- [ ] Add a `.env.example` instead of ever committing a real `.env`.
- [ ] Write the `hello-node` script on a feature branch (not directly to `main`), committing with
      Conventional Commits as you go.
- [ ] Open a pull request for that branch; look up GitHub Flow if you haven't used it before.
- [ ] Look up merge vs rebase conceptually, then deliberately create a merge conflict (e.g. two of
      your own branches editing the same line) and resolve it.
- [ ] Merge the PR once it carries 3 or more Conventional Commits.

## Verify

- [ ] The PR is merged with 3+ Conventional Commits.
- [ ] `.gitignore` is present and covers the full Node-project list.
- [ ] `.env.example` is present.
- [ ] You can narrate `git revert` vs `git reset` out loud, unaided.
- [ ] Final self-review: every Definition of done checkbox in `brief.md` is actually satisfied.

## Write-up

- [ ] "What I built": capture the repo, the script, and the PR/merge flow as you finish each piece,
      not all at the end.
- [ ] "Why it's built this way (key decisions)": your branch/commit structure, what would differ
      if the repo had been private with a no-direct-push rule instead of public, and how you
      actually resolved the conflict.
- [ ] "How to build it (teach it to the next trainee)": write the branch → PR → merge guide, using
      your own example to show the reasoning, not just the commands.
- [ ] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words.
- [ ] "What tripped me up": anything that tripped you up in Git, GitHub auth, or the conflict
      resolution.
- [ ] "Checkpoint evidence": the merged PR link, `.gitignore`/`.env.example`, and your
      `revert` vs `reset` explanation.
- [ ] Close out "What I'd do differently".
