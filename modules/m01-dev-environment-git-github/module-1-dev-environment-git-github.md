# STRATPOINT ENGINEERING TRAINING

## Node.js Foundations — Self-Paced

**Module 1 — Dev Environment, Git & GitHub**

**Time estimate: 4 hours**

**Part 1 of the Node.js Engineering Program**

**Prepares you for Part 2: AI-Assisted Engineering (FlowBoard)**

---

## Module 1: Dev Environment, Git & GitHub

**Time estimate: 4 hours**

### Learning Goals

- Install and pin the toolchain: VS Code, Git, Node through a version manager, Bruno, and the
  terminal basics.
- Explain the Git mental model: working tree → staging area → commits.
- Use the everyday commands: `init`, `clone`, `status`, `add`, `commit`, `log`, `diff`,
  `restore`, `stash`.
- Tell `git revert` apart from `git reset`, and know when each is safe.
- Create a branch, open a pull request, get a peer review, and merge it.
- Create and resolve a real merge conflict, and explain merge vs rebase conceptually.
- Write a `.gitignore` and `.env.example` for a Node project — and never commit secrets.

### Concept

Git is a **distributed version control system**: every clone carries the full history, so you can
branch, commit, and inspect without talking to a server. The server (GitHub) is where you share
and review work, not where you do it.

The thing to internalise first is the **three places a change can live**:

- **Working tree** — the files on disk as you edit them.
- **Staging area (index)** — changes you have marked with `git add`, queued for the next commit.
- **Commits** — immutable snapshots you have saved to the branch's history.

`git status` tells you which changes are in which place. Almost every confusing moment in Git is
just not knowing where your change currently is.

Branches are cheap: a branch is a movable pointer to a commit, not a copy of the files. That is
why the workflow you will learn here is *always branch first*. You do work on a **feature branch**,
open a **pull request** to propose merging it, get a **review**, then **merge** it. This is
**GitHub Flow**, and it is the shape of every module in this program: feature branch → PR →
Conventional Commits → review → merge.

Two ideas make the collaboration work:

- **Conventional Commits** — `type: summary` (for example `feat: add hello-node script`) so intent
  is legible in history and review.
- **The merge commit** — a commit that joins two lines of history. It is how a resolved conflict
  leaves a visible record that two branches were combined.

### Read These

- 🔗 Git — Git Basics: Getting a Git Repository:
  https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository
- 🔗 Git — Reset demystified (the definitive `reset` vs `revert` vs `restore` explainer):
  https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified
- 🔗 Git — Rebasing (read it, even though this module only uses merge):
  https://git-scm.com/book/en/v2/Git-Branching-Rebasing
- 🔗 GitHub Flow: https://docs.github.com/en/get-started/using-github/github-flow
- 🔗 Conventional Commits 1.0.0: https://www.conventionalcommits.org/en/v1.0.0/
- 🔗 GitHub — authentication: https://docs.github.com/en/authentication
- 🔗 GitHub CLI manual: https://cli.github.com/manual/
- 🔗 Node version manager (nvm): https://github.com/nvm-sh/nvm
- 🔗 Bruno (manual API testing): https://docs.usebruno.com/

### Walkthrough: Hello, Node

#### 1. Pin the toolchain

Install VS Code, Git, a Node version manager (nvm, fnm, nvm-windows or Volta), and Bruno.

Every machine in the cohort runs the **same** Node version, and the pin lives in the repo so it
travels with the code:

```bash
node --version        # confirm Node is on your PATH
echo 24 > .nvmrc      # Node 24 LTS — the cohort's pinned version
nvm use               # now your shell matches the pin
```

Check that Git knows who you are — this is the identity stamped on every commit:

```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

> **Three doors to GitHub.** Authentication is not one switch. `git push` over SSH, the `gh`
> CLI, and any tool token are **separate credentials**. Run `gh auth status` now, before you are
> blocked at PR time — do not discover this after the work exists.

#### 2. Create the repo and the script

Create the directory, initialize Git, and add the script:

```bash
mkdir -p scripts
touch scripts/hello-node.js
cat > scripts/hello-node.js << 'EOF'
#!/usr/bin/env node
console.log('Hello, Node.js!');
EOF
chmod +x scripts/hello-node.js
node scripts/hello-node.js
# Hello, Node.js!
```

```bash
node scripts/hello-node.js
# Hello, Node.js!
```

#### 3. Make your first commits

Stage and commit one concern at a time, naming the *why* with Conventional Commits:

```bash
git add scripts/hello-node.js
git commit -m "feat: add hello-node script"

echo 24 > .nvmrc
git add .nvmrc
git commit -m "chore: pin node version in .nvmrc"
```

Inspect what you have done — this is the habit that replaces guessing:

```bash
git status
git log --oneline
git diff            # working tree vs staging
git diff --staged   # staging vs last commit
```

#### 4. Connect the public remote

Create a **public** repo on GitHub (the program's convention — branch protection on private
repos depends on your GitHub plan). Then connect and push:

```bash
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

### Walkthrough Part 2: Branch → PR → Review → Merge

#### 1. Branch before you type

```bash
git checkout -b feat/greeting
```

Never commit straight to `main`. The branch is cheap insurance and makes the PR trivial.

#### 2. Commit in slices with intent

```bash
# edit scripts/hello-node.js to print a friendlier greeting
git add scripts/hello-node.js
git commit -m "feat: reword hello-node greeting"
```

#### 3. Push and open the PR

```bash
git push -u origin feat/greeting
gh pr create --fill        # or use the pull/new/<branch> URL GitHub prints
```

Open it as a **draft** if you are still working — review can start before you are done.

#### 4. Get the review

Your partner comments on the diff. Respond or push fixes as **new commits** — never force-push
over review feedback. Each review response is itself a commit, so the conversation stays legible.

#### 5. Leave the PR open — the conflict drill comes next

Do **not** merge yet. Part 3 uses this same feature branch to create and resolve a real conflict,
and the merge happens once that resolution is part of the PR. Keeping the branch open is exactly
what puts the conflict — and its resolution — *inside* the PR's history.

### Walkthrough Part 3: Create and Resolve a Conflict

A conflict is not a failure; it is Git refusing to guess. Do this **with your pair**, before
merge, so the clash is visible in history.

```bash
git checkout -b conflict-alternate feat/greeting
# edit the same line of scripts/hello-node.js differently
git add scripts/hello-node.js
git commit -m "feat: reword greeting on alternate branch"

git checkout feat/greeting
# edit the SAME line differently again
git add scripts/hello-node.js
git commit -m "feat: reword hello-node greeting"

git merge conflict-alternate
# CONFLICT (content): Merge conflict in scripts/hello-node.js
```

Open the file. Git has written the markers **into the text** — it will not resolve them for you:

```
<<<<<<< HEAD
console.log('Hello, Node.js!');
=======
console.log('Hello, Node!');
>>>>>>> conflict-alternate
```

Read them: top is **yours** (`HEAD`), bottom is **theirs**, `=======` splits the two. Editing the
file to combine both intents:

```js
console.log('Hello, Node.js! (from the pair programming session)');
```

Then delete every marker, stage, and commit the resolution:

```bash
git add scripts/hello-node.js
git commit -m "fix: resolve merge conflict in hello-node greeting"
git merge --continue      # only if Git left you mid-merge
```

Push the resolution onto the same feature branch — the open PR updates automatically:

```bash
git push
```

Get the review sign-off, then merge.

#### Merge — with a merge commit

**Pick "Create a merge commit", not squash or rebase-merge:**

```bash
gh pr merge --merge
```

> **The DoD trap.** Many repos default to **squash**, which collapses all your commits into one.
> That silently fails the "3 or more Conventional Commits in the merged history" criterion — with
> no error anywhere. Be explicit about the merge method.

Verify the diamond — and the conflict resolution — survived in history:

```bash
git log --oneline --graph
```

The conflict resolution is now its own commit in `main` — which is the point of the exercise.

> **Merge vs rebase, conceptually.** Rebasing `conflict-alternate` onto `feat/greeting` would
> also surface the conflict, but it replays the commits with **new SHAs** and produces a linear
> history. Merge keeps both parents and records the join. The deciding question is always: *has
> anyone else seen this commit?* If yes, do not rewrite it — merge.

### What This Walkthrough Showed You

- The three places a change lives: **working tree → staging → commit**, read with `git status`.
- `git checkout -b` branches off the current commit; a branch is a pointer, not a copy.
- `git add` stages one concern; `git commit -m "type: summary"` records intent.
- `git diff` (unstaged) and `git diff --staged` (staged) show what is about to be committed.
- `git restore` and `git stash` undo or shelve working-tree changes without touching history.
- `<<<<<<<` / `=======` / `>>>>>>>` are literal text; resolving means editing and re-staging.
- `git merge` keeps both histories and records the join as a merge commit.

### About the Public Training Repo

This program has you work in a **public** repo on purpose. Branch protection rules (required
reviewers, no direct pushes to `main`) are gated behind paid GitHub plans on private repos — a
public repo sidesteps that dependency entirely, so the same workflow works for everyone, and it is
the default for every module from here on, not just this one. Your Node.js code lives in this repo,
not in the training content repo; link it from the header of your write-up.

### EXERCISE 1.1 — A Node `.gitignore` and `.env.example`

Create a `.gitignore` that covers the whole Node-project list, and a `.env.example`:

```bash
cat > .gitignore << 'EOF'
# .gitignore
node_modules/
.env
*.db
prisma/generated/
dist/
coverage/
EOF
```

```bash
cat > .env.example << 'EOF'
# .env.example — committed; a real .env is never committed
# Copy to .env and fill in locally.
PORT=3000
EOF
```

Commit the habit, not just the file:

```bash
git add .gitignore .env.example
git commit -m "chore: add .gitignore and .env.example"
```

> If your project ever outputs the generated Prisma client somewhere other than
> `prisma/generated/`, add that path too — a `.gitignore` that misses the generated client will
> happily commit thousands of generated files.

### EXERCISE 1.2 — `revert` vs `reset` drill

Prove the difference to yourself on **your own** branch only.

`git reset` *moves the branch pointer backwards* and drops commits (recoverable from the reflog
for a while):

```bash
git checkout -b reset-drill
echo "oops" >> notes.txt
git add notes.txt && git commit -m "chore: add bad note"
git reset --hard HEAD~1      # commit vanishes from the branch
git log --oneline
```

`git revert` *keeps the history* and adds a new commit that cancels the old one:

```bash
git checkout main
git checkout -b revert-drill
echo "oops" >> notes.txt
git add notes.txt && git commit -m "chore: add bad note"
git revert HEAD              # creates a NEW commit that undoes the change
git log --oneline
```

Rule of thumb: **rewriting your own unpushed work → `reset`; undoing anything on shared history
→ `revert`.** In the walkthrough we merged with a merge commit for the same reason — history on
a shared branch is append-only.

### EXERCISE 1.3 — `stash` and `restore`

Practise saving and discarding work without committing:

```bash
# edit a file, then shelve the change
git stash push -m "wip greeting tweak"
git stash list
git stash pop                # bring it back

# throw away an uncommitted edit entirely
git restore scripts/hello-node.js
```

### EXERCISE 1.4 — A full Issue → PR cycle

Do the loop once more, driven by a GitHub Issue:

1. Open an Issue describing a small change (for example, "add a `--name` argument to
   `hello-node`").
2. Create a feature branch and make the change in **two or more** Conventional Commits.
3. Open a PR that references the issue (`Closes #<n>`).
4. Get a peer review from your assigned partner — respond with new commits.
5. Merge with a **merge commit**. Confirm the Issue closed and the commits survived.

### Self-Check

1. What are the three places a change can live in Git, and which command shows you where it is?
2. What is the difference between `git revert` and `git reset`?
3. Why does the program require a merge commit instead of a squash for this module's PR?
4. What must be in a Node project's `.gitignore`, and why is `.env.example` committed instead of
   `.env`?
5. When a merge conflict appears, what do the `<<<<<<<`, `=======` and `>>>>>>>` markers mean, and
   what is the last step before you can commit?

### Module 1 Deliverable

Commit these inside your public training repo:

- ☐ A merged pull request carrying **3 or more Conventional Commits** (merge commit, not squash).
- ☐ A `.gitignore` covering `node_modules`, `.env`, `*.db`, the generated Prisma client, `dist`,
  and `coverage`.
- ☐ A `.env.example` present (even though there is nothing to configure yet — this is about the
  habit).
- ☐ A merge conflict **created and resolved** on the way, visible in history.
- ☐ Your own written explanation of `git revert` vs `git reset`.
- ☐ The merged PR link captured in your write-up.

### Appendix: Self-Check Answers

1. **Working tree** (files on disk), the **staging area / index** (changes marked with
   `git add`), and **commits** (saved snapshots). `git status` shows where each change is.
2. `git revert <commit>` computes the inverse of a commit and applies it as a **new commit** —
   nothing is rewritten, so it is safe on shared branches. `git reset <commit>` **moves the branch
   pointer backwards** and drops the commits behind it; it is a local-cleanup tool, not something
   to run on history others have fetched. `--soft` keeps changes staged, `--mixed` (default)
   unstages them, `--hard` discards them.
3. The Definition of done requires 3 or more Conventional Commits *in the merged history*. A
   squash merge collapses those commits into one, so they no longer exist in `main` — the
   criterion fails with no error. A merge commit preserves every commit and the conflict
   resolution.
4. `node_modules`, `.env`, `*.db`, the generated Prisma client, `dist`, and `coverage` — these are
   dependencies, secrets, local data, generated code, and build output, none of which belong in
   version control. `.env` can hold secrets, so it is ignored; `.env.example` holds only the
   variable *names* with placeholder values, so the next person knows what to set without ever
   seeing a real secret.
5. Top (`<<<<<<<`) is your side (`HEAD`), bottom (`>>>>>>>`) is the incoming side, and `=======`
   splits them. You edit the file to the version you actually want, delete **all** three markers,
   then `git add` the file before committing the resolution.
