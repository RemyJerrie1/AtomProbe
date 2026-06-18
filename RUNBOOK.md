# Runbook

Ops for the flow in [FLOW.md](FLOW.md).

## Ship to dev

```bash
git switch dev && git pull --ff-only origin dev
git switch -c feat/<slug>            # or fix/ refactor/
# ... Conventional Commits ...
git push -u origin feat/<slug>
gh pr create --base dev --head feat/<slug> --title "feat: <slug>"
# CI green → squash merge. release-please updates its release PR on dev.
```

## Cut a version

Merge the open **release-please PR** on `dev` (title like `chore(main): release x.y.z`).
→ tag + GitHub Release + CHANGELOG.

## Promote dev → uat

```bash
git switch dev && git pull --ff-only origin dev
git switch -c release/uat-$(date +%y%m%d)-<slug> && git push -u origin HEAD
gh pr create --base uat --head $(git branch --show-current) --title "release: uat <slug>"
# CI green → squash merge → CI opens backmerge PR (uat→dev) → merge it
```

## Promote uat → prod

```bash
git switch uat && git pull --ff-only origin uat
git switch -c release/prod-$(date +%y%m%d)-<slug> && git push -u origin HEAD
gh pr create --base prod --head $(git branch --show-current) --title "release: prod <slug>"
# squash merge → CI opens backmerge PRs (prod→uat, prod→dev) → merge both
```

## Hotfix

```bash
git switch -c hotfix/prod-<slug> prod    # or hotfix/uat-<slug> from uat
# ... fix: ... → push → gh pr create --base prod (or uat) → squash → merge backmerge PRs
```

## Rollback prod

- Fastest: Vercel → **Instant Rollback** to the last good deployment.
- Code: `git revert <bad>` on `dev` → promote dev→uat→prod. Never force-push.

## Verify

```bash
git fetch origin --tags && git ls-remote --tags origin | tail -1
gh pr list                # any pending release-please / backmerge PRs?
```

## Gotchas

- **Merge the backmerge PRs** or branches drift → phantom conflict next promote.
- Conventional commit type drives the version; squash → PR title = the commit message.
- Backmerge / release-please PRs need **Settings → Actions → Allow GitHub Actions to create PRs** = on.
- App "re-mux failed / Failed to fetch": ffmpeg core CDN blocked → auto-falls back unpkg→jsdelivr.
