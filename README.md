<!-- GENERATED HERO START (npm run build — do not edit by hand) -->
<div align="center">

<img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/banner.png" alt="Rust in Peace — a dark theme for VS Code" width="1280"/>

<br/>

**A dark theme for VS Code, inspired by the album art of Megadeth's 1990 metal masterpiece, _Rust in Peace_.**

[![CI](https://github.com/chapmandu/rust-in-peace-vscode-theme/actions/workflows/ci.yml/badge.svg)](https://github.com/chapmandu/rust-in-peace-vscode-theme/actions/workflows/ci.yml)
[![Marketplace](https://flat.badgen.net/vs-marketplace/v/chapmandu.rust-in-peace?label=marketplace&labelColor=0a0e22&color=2a5ca8)](https://marketplace.visualstudio.com/items?itemName=chapmandu.rust-in-peace)
[![Installs](https://flat.badgen.net/vs-marketplace/i/chapmandu.rust-in-peace?label=installs&labelColor=0a0e22&color=391565)](https://marketplace.visualstudio.com/items?itemName=chapmandu.rust-in-peace)

<br/>

</div>
<!-- GENERATED HERO END -->

<br/>

## Colour Palette

The complete palette, including ANSI terminal colours, lives in [`src/palette.json`](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/src/palette.json) — the single source of truth the VS Code theme, its lighter variants, and everything below are generated from at build time.

<!-- GENERATED PALETTE START (npm run build — do not edit by hand) -->
<div align="center">

<br/>

<img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/Megadeth-RustInPeace.jpg" alt="Rust in Peace album cover" width="260"/>

_Hand-picked from the record's rusted, cobalt-blue cover art._

<br/>

<table>
<tr>
<td align="center" width="50%"><strong>Rust in Peace</strong><br/><img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/generated/rust-in-peace.png" alt="Rust in Peace" width="400"/></td>
<td align="center" width="50%"><strong>Hangar 18</strong><br/><img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/generated/rust-in-peace-hangar-18.png" alt="Rust in Peace Hangar 18" width="400"/></td>
</tr>
</table>

<br/>

<table>
<tr>
<td align="center" width="50%"><strong>Polaris</strong><br/><img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/generated/rust-in-peace-polaris.png" alt="Rust in Peace Polaris" width="400"/></td>
<td align="center" width="50%"><strong>Dawn Patrol</strong><br/><img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/generated/rust-in-peace-dawn-patrol.png" alt="Rust in Peace Dawn Patrol" width="400"/></td>
</tr>
</table>

<br/>

</div>
<!-- GENERATED PALETTE END -->

<br/>

## Installation

Install straight from the [**Visual Studio Marketplace**](https://marketplace.visualstudio.com/items?itemName=chapmandu.rust-in-peace), or from inside the editor:

1. Open the **Extensions** sidebar in VS Code — `View → Extensions`
2. Search for `Megadeth` _(curse you, rust-lang!!!)_
3. Click **Install**
4. `Code → Preferences → Color Theme → ` **Rust in Peace** — or one of its lighter variants, **Hangar 18** (a subtle lift) and **Polaris** (lighter still), or **Dawn Patrol**, the light theme

<br/>

## Companion themes

The VS Code theme isn't the only target. [`src/palette.json`](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/src/palette.json) is the single source of truth, and matching themes for other tools are generated from it into [`themes/`](https://github.com/chapmandu/rust-in-peace-vscode-theme/tree/main/themes). Every target ships all four variants — core, Hangar 18, Polaris, and Dawn Patrol (light) — as separate files, except Zed, whose single file is a theme family carrying all four:

| Tool                                               | Generated files                                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [Helix](https://helix-editor.com/)                 | [`themes/helix/*.toml`](https://github.com/chapmandu/rust-in-peace-vscode-theme/tree/main/themes/helix)                   |
| [Herdr](https://herdr.dev/)                        | [`themes/herdr/*.toml`](https://github.com/chapmandu/rust-in-peace-vscode-theme/tree/main/themes/herdr)                   |
| [Zed](https://zed.dev/)                            | [`themes/zed/rust-in-peace.json`](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/themes/zed/rust-in-peace.json) |
| [Zellij](https://zellij.dev/)                      | [`themes/zellij/*.kdl`](https://github.com/chapmandu/rust-in-peace-vscode-theme/tree/main/themes/zellij)                  |
| [Ptyxis](https://gitlab.gnome.org/chergert/ptyxis) | [`themes/ptyxis/*.palette`](https://github.com/chapmandu/rust-in-peace-vscode-theme/tree/main/themes/ptyxis)              |

Copy the relevant file into your tool's theme directory, then select `rust-in-peace` (or a variant slug). Run `just build-themes` (or `npm run build:themes`) to regenerate them all after a palette change.

> Herdr has no standalone theme files — its files are config fragments to merge into `~/.config/herdr/config.toml`, recolouring the `tokyo-night` base theme (`tokyo-night-day` for Dawn Patrol).

To add another target, drop a generator in `scripts/targets/` and register it in `scripts/build_themes.py`; it reuses the shared palette loader and resolver in `scripts/palette.py`.

<br/>

## Contributing

To work on the theme:

1. Clone this repo and open it in VS Code
2. Open `View → Run`
3. Click **Launch Extension** — this opens a second VS Code window
4. Target scopes with the **Developer: Inspect Editor Tokens and Scopes** command
5. Edit `src/rust-in-peace.yml` and run `npm run build`; changes appear live in the window from step 3

Colours live in `src/palette.json`; `src/rust-in-peace.yml` maps them onto VS Code keys via `{{group.key}}` placeholders. Edit the palette to shift a colour everywhere at once.

> Please include **before & after** screenshots of your changes in pull requests.

<details>
<summary><strong>Maintainer & publishing notes</strong></summary>

### Recipes

Local tasks run through [`just`](https://github.com/casey/just) — run `just` to list them all.

| Recipe               | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `just check`         | Run the full code-quality suite (lint, types, tests + coverage, dead code, duplication, secrets) |
| `just build`         | Regenerate the theme JSON from the YAML source               |
| `just build-themes`  | Regenerate the companion themes (Helix, Herdr, Zed, Zellij, Ptyxis) |
| `just install`       | Build, package, and install the extension into local VS Code |
| `just publish-patch` | Bump the patch version, tag, and push to publish             |
| `just publish-minor` | Bump the minor version, tag, and push to publish             |

### Manual publishing

`just publish-patch` / `just publish-minor` cover steps 1–5 below; run them by hand if you'd rather not use `just`.

1. Bump the version in `package.json`
2. `git commit -m 'Fire'` — commit the changes
3. `git tag v2.0.666` — tag the commit with the version number
4. `git push origin --tags` — push the tag
5. `git push` — push the changes
6. Create a [release](https://github.com/chapmandu/rust-in-peace-vscode-theme/releases) on GitHub with the same version number
7. GitHub Actions publishes the extension to the marketplace
8. Profit!

</details>

<br/>

---

<div align="center">

Also check out the Slayer [**Reign in Blood**](https://marketplace.visualstudio.com/items?itemName=chapmandu.reign-in-blood) theme.

</div>
