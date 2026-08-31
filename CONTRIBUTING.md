# Contributing

Thanks for taking the time to contribute! This document covers the branching workflow, commit conventions, and how to get a pull request merged.

## Branch structure

This project uses three types of branches:

| Branch        | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `master`      | Production-ready code only                                     |
| `development` | Integration branch where features come together before release |
| `feature/*`   | Individual features, fixes, or changes                         |

**Never commit directly to `master`.** All changes come in through the development branch or a feature branch, and a pull request.

## Getting started

1. Fork the repo
2. Make sure your local `development` branch is up to date:
   ```bash
   git checkout development
   git pull
   ```
3. Create a feature branch off `development`:
   ```bash
   git checkout -b feature/short-description
   ```

## Branch naming

Use a prefix that describes the type of change, followed by a short, hyphenated description:

- `feature/add-login-page`
- `fix/navbar-overflow-bug`
- `docs/update-readme`
- `chore/bump-dependencies`

Avoid vague names like `feature/updates` or `fix/bug`.

## Making changes

1. Keep commits focused: one logical change per commit where possible.
2. Write clear commit messages:

   ```
   Add validation to signup form

   - Require email format check
   - Show inline error messages
   ```

3. Commit and push to your feature branch:
   ```bash
   git add .
   git commit -m "Add validation to signup form"
   git push -u origin feature/short-description
   ```

## Submitting a pull request

1. Push your branch to GitHub if you haven't already.
2. Open a pull request **targeting `development`** (not `master`).
3. Fill out the PR description:
   - What does this change do?
   - Why is it needed?
   - Any testing steps or screenshots, if relevant.
4. Link any related issues (e.g. `Closes #12`).
5. Request a review. Address any feedback with additional commits on the same branch. No need to open a new PR.

Once approved, a maintainer will merge the PR into `development`.

## Releases

Periodically, `development` is merged into `master` via its own pull request once it's been tested and is considered stable. This triggers a production deploy. Only maintainers perform this merge.

## After your PR is merged

You can safely delete your feature branch:

```bash
git branch -d feature/short-description
git push origin --delete feature/short-description
```

## Code style

Before committing, run the linter and make sure it passes:

```bash
bun run lint
```

Fix any issues it reports. Follow the existing code style in the file you're editing.

## Questions or issues

If something's unclear or you run into a problem, open an issue before starting work on a large change. It helps avoid duplicated effort and lets maintainers weigh in early.
