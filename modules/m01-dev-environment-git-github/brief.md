# M01 — Dev Environment, Git & GitHub

**Week 1 · Day 1 · 4 hours**

## Builds on

None — this is the first stage.

## Objective

Set up the toolchain, use the everyday Git workflow, and collaborate through GitHub pull requests.

## Scope

- Toolchain: VS Code, Git, Node through a version manager, `.nvmrc`, Bruno, terminal basics.
- The Git mental model: working tree → staging → commits. `init`, `clone`, `status`, `add`,
  `commit`, `log`, `diff`, `restore`, `stash`; `revert` vs `reset`.
- Branching and merging, resolving conflicts, merge vs rebase (conceptual only at this stage).
- `.gitignore` conventions for a Node project (`node_modules`, `.env`, `*.db`, the generated Prisma
  client, `dist`, `coverage`). Never commit secrets — commit a `.env.example` instead.
- GitHub: remotes, authentication (GitHub CLI, a credential manager, or SSH), Issues, pull requests,
  review comments, GitHub Flow, Conventional Commits, README basics.

## Stack constraints

- Free GitHub account.
- **Resolved: use a public training repo.** Branch protection on private repos depends on the
  GitHub plan, and a public repo avoids that dependency entirely — this is the program's default
  convention for every module from here on, not just this one.

## Deliverable

**A merged pull request on a public repo containing a `hello-node` script, with a resolved merge
conflict in its history.**

## Lab

*Goal: prove you can take a change through the full branch → PR → review → merge cycle, including
resolving a real conflict.*

**You do.**

1. Set up your toolchain (VS Code, Git, a Node version manager, Bruno) and create the public repo.
2. Write the `hello-node` script on a feature branch, committing with Conventional Commits as you
   go.
3. Add `.gitignore` and `.env.example`.
4. Open a pull request and get a peer review from your assigned partner.
5. With your pair, deliberately create a merge conflict, then resolve it together.
6. Merge once the PR carries 3 or more Conventional Commits.

**You build and capture.** The merged PR link, `.gitignore` and `.env.example` present in the repo,
and your own explanation of `git revert` vs `git reset`.

## Definition of done

- [ ] A merged pull request with 3 or more Conventional Commits.
- [ ] `.gitignore` present and covering the Node-project list above.
- [ ] `.env.example` present (even though there's nothing to configure yet — this is about the habit).
- [ ] You can narrate, in your own words, the difference between `git revert` and `git reset`.

## Logistics

- Your trainer assigns pairs for the merge-conflict exercise at the start of the session — this is a
  per-cohort roster decision, not something this brief can fix in advance.
