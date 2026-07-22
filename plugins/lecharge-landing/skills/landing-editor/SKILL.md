---
name: landing-editor
description: Use when the user wants to change the LeCharge landing site (lecharge.co): add a blog post, add or edit a landing section, or update copy. Makes on-brand edits on a branch and opens a pull request. Assumes deploy-on-merge CI already exists.
allowed-tools:
  - Read
  - Write
  - Bash
---

# LeCharge landing editor

Make on-brand edits to `LumaSystems/landing` safely. Follow the brand rules from
`using-lecharge`: Spanish copy, never an em dash, design tokens exactly. Your design
reference is in `assets/` (`components.css`, `tokens.css`, `COMPONENTS.md`).

## Guardrails (do not break these)

- Never commit or push to `main`. Always work on a new branch and open a pull request.
- Never touch CI/deploy configuration. The pipeline is owned by the LeCharge team.
- If GitHub access or auth is missing, stop and point the user to `SETUP.md`.

## Step 1: Confirm prerequisites

Check the repo is available and auth works: `gh auth status`. If it fails, read
`SETUP.md` to the user and stop.

## Step 2: Get the repo and branch

Clone or update `LumaSystems/landing`, then create a branch named for the change,
for example `content/blog-carga-rapida` or `section/casos-de-uso`. Never edit on `main`.

## Step 3: Make the change on brand

- New blog post: start from `templates/blog-post.html`. New section: start from
  `templates/landing-section.html`. Match the existing file structure of the landing repo.
- Fill every `{{placeholder}}` with Spanish copy. Reuse the site's existing classes
  (see `assets/components.css` and `assets/COMPONENTS.md`). Do not add new colors or fonts.
- Re-read the output and confirm there is not a single em dash.

## Step 4: Open the pull request

Commit on the branch, push, and open a PR with `gh pr create`, a Spanish title and a
short description of the change. Tell the user: once a maintainer merges to `main`, the
CI deploys it to lecharge.co automatically.

## Step 5: Hand off

Give the user the PR link and a one-line Spanish summary of what changed.
