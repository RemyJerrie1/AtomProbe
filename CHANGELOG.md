# [1.2.0](https://github.com/RemyJerrie1/atomscope/compare/v1.1.2...v1.2.0) (2026-06-18)

### Features

- theme color switcher (4 accent presets, persisted) ([0bd5b07](https://github.com/RemyJerrie1/atomscope/commit/0bd5b072346db506fcc4a678ef61a529328a794f))

## [1.4.1](https://github.com/RemyJerrie1/AtomProbe/compare/v1.4.0...v1.4.1) (2026-07-05)


### Bug Fixes

* convert Tauri icons to RGBA PNG (tauri requires alpha channel) ([#42](https://github.com/RemyJerrie1/AtomProbe/issues/42)) ([52f8157](https://github.com/RemyJerrie1/AtomProbe/commit/52f81573cd39befecc7a2f1bcee7bcb1b412b2da))
* pin time crate to 0.3.36 — cookie 0.18.1 breaks on time 0.3.37+ API change ([#40](https://github.com/RemyJerrie1/AtomProbe/issues/40)) ([b0250b1](https://github.com/RemyJerrie1/AtomProbe/commit/b0250b1964e51ecf940dde900032b24678b976d7))
* run tauri icon in CI before build — iconPath was not a real tauri-action input ([#43](https://github.com/RemyJerrie1/AtomProbe/issues/43)) ([5ee45ff](https://github.com/RemyJerrie1/AtomProbe/commit/5ee45ff3345dbbfeca9ef6f6d86f70a5a426fe2a))

## [1.4.0](https://github.com/RemyJerrie1/AtomProbe/compare/v1.3.2...v1.4.0) (2026-07-01)


### Features

* add COOP/COEP/CORP headers for SharedArrayBuffer (Vercel + dev server) ([#24](https://github.com/RemyJerrie1/AtomProbe/issues/24)) ([cccb72c](https://github.com/RemyJerrie1/AtomProbe/commit/cccb72c9c63ac58b999c40268a804269813d2051))
* exclude ffmpeg wasm from SW precache (globIgnores + NetworkOnly) ([#27](https://github.com/RemyJerrie1/AtomProbe/issues/27)) ([97e3b3a](https://github.com/RemyJerrie1/AtomProbe/commit/97e3b3a7c50be4031b3187e9309b1849266b905a))
* PWA manifest, service worker, and app icons ([#26](https://github.com/RemyJerrie1/AtomProbe/issues/26)) ([f62b632](https://github.com/RemyJerrie1/AtomProbe/commit/f62b632aaf07aa8246ed803a2ee571b5758dfd9b))

## [1.3.2](https://github.com/RemyJerrie1/AtomProbe/compare/v1.3.1...v1.3.2) (2026-06-30)


### Bug Fixes

* i18n t() prop + OfflineBadge navigator.onLine init + FLOW.md URL ([#13](https://github.com/RemyJerrie1/AtomProbe/issues/13)) ([d5c3646](https://github.com/RemyJerrie1/AtomProbe/commit/d5c3646a6137f9b02e076bc30a812ade8876c309))

## [1.3.1](https://github.com/RemyJerrie1/AtomProbe/compare/v1.3.0...v1.3.1) (2026-06-26)


### Bug Fixes

* rename package name atomscope to atomprobe ([#10](https://github.com/RemyJerrie1/AtomProbe/issues/10)) ([53064f8](https://github.com/RemyJerrie1/AtomProbe/commit/53064f8f61f7076b988bec45fc5e764cac61a326))

## [1.3.0](https://github.com/RemyJerrie1/AtomProbe/compare/v1.2.0...v1.3.0) (2026-06-25)


### Features

* **phase-2:** add PWA OfflineBadge + InstallButton + Tauri detection ([d57bfa8](https://github.com/RemyJerrie1/AtomProbe/commit/d57bfa806716e547b65e8a576734bf3919f84f7e))

## [1.1.2](https://github.com/RemyJerrie1/atomscope/compare/v1.1.1...v1.1.2) (2026-06-16)

### Bug Fixes

- **i18n:** professional wording for faststart verdicts ([1c94c6e](https://github.com/RemyJerrie1/atomscope/commit/1c94c6ee233dd51e60af1d11d2797fc64ee7ac85))

## [1.1.1](https://github.com/RemyJerrie1/atomscope/compare/v1.1.0...v1.1.1) (2026-06-16)

### Bug Fixes

- **i18n:** more precise wording for fragmented mp4 messaging ([b3be4cb](https://github.com/RemyJerrie1/atomscope/commit/b3be4cb574855344e39b6e6e39d6ed33b4ed0911))

# [1.1.0](https://github.com/RemyJerrie1/atomscope/compare/v1.0.0...v1.1.0) (2026-06-16)

### Features

- handle fragmented mp4 + robust core load + clearer errors ([3d78d03](https://github.com/RemyJerrie1/atomscope/commit/3d78d035b367c326d0ad166e105e6401f2e33f5c))

# 1.0.0 (2026-06-16)

### Bug Fixes

- **ci:** prettier-format all files (green CI) + polish README ([ef7a8f6](https://github.com/RemyJerrie1/atomscope/commit/ef7a8f632e0b9518af59ee15a03067077e3f26af))

### Features

- **i18n:** English-default UI with zh toggle + English-only code/comments ([a991283](https://github.com/RemyJerrie1/atomscope/commit/a9912831ba54104ba46f0eba099c004968157f6f))
