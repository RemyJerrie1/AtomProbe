# Branch flow

```
feat/* ──PR──▶ dev ──release/uat PR──▶ uat ──release/prod PR──▶ prod
                │                                                  │
                └── release-please cuts version here   backmerge PRs ◀┘ (prod→uat→dev)
```

| branch          | role                                                  |
| --------------- | ----------------------------------------------------- |
| `dev` (default) | integration; **release-please** cuts the version here |
| `uat`           | acceptance                                            |
| `prod`          | production — Vercel **production** branch             |

## Versioning — release-please (on `dev`)

`release-please` keeps a **release PR** open on `dev` that accumulates Conventional-Commit
changes + version bump + `CHANGELOG.md`. **Merging that release PR** cuts the tag + GitHub Release.
`feat`=minor, `fix`/`perf`=patch. `uat`/`prod` deploy the dev-cut version — they do not release.

## Branch naming

- `feat/<slug>` · `fix/<slug>` · `refactor/<slug>` — from `dev`, PR into `dev`
- `release/uat-YYMMDD-<slug>` — from `dev` tip, PR into `uat`
- `release/prod-YYMMDD-<slug>` — from `uat` tip, PR into `prod`
- `hotfix/uat-<slug>` (from `uat`) · `hotfix/prod-<slug>` (from `prod`) — PR into that env
- `backmerge/*` — opened by CI

## Promote (PR + squash, CI must be green)

- **dev → uat**: cut `release/uat-*` from `dev` tip → PR into `uat` → squash merge
- **uat → prod**: cut `release/prod-*` from `uat` tip → PR into `prod` → squash merge

## Backmerge (CI opens PRs, you merge)

- push to `uat` → CI opens **uat → dev** PR
- push to `prod` → CI opens **prod → uat** and **prod → dev** PRs
- Merge them, or branches drift → phantom conflicts on the next promote.

## Deploy

Vercel **Production Branch = `prod`**; `dev` / `uat` = previews.

> Needs **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests** = on
> (for the release-please PR and the backmerge PRs).
