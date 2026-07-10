<div align="center">

<img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/logo.png" alt="Rust in Peace logo" width="120" />

# Rust in Peace

**A dark theme for VS Code, inspired by the album art of Megadeth's 1990 metal masterpiece, _Rust in Peace_.**

![Screenshot](https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/screenshot.png)

## Colour Palette

</div>

The complete palette, including ANSI terminal colours, lives in [`src/palette.json`](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/src/palette.json) — the single source of truth the VS Code theme, its lighter variants, and everything below are generated from at build time.

<!-- GENERATED PALETTE START (npm run build — do not edit by hand) -->
<div align="center">

<img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/Megadeth-RustInPeace.jpg" alt="Rust in Peace album cover" width="260"/>

_Hand-picked from the record's rusted, cobalt-blue cover art._

<img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/swatches/rust-in-peace.svg" alt="Rust in Peace" width="720"/>

<table>
<tr>
<td align="center"><strong>Hangar 18</strong><br/><img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/swatches/rust-in-peace-hangar-18.svg" alt="Rust in Peace Hangar 18" width="400"/></td>
<td align="center"><strong>Polaris</strong><br/><img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/swatches/rust-in-peace-polaris.svg" alt="Rust in Peace Polaris" width="400"/></td>
</tr>
</table>

</div>

| Colour | Rust in Peace | Hangar 18 | Polaris |
| --- | --- | --- | --- |
| `bg.base` | `#101530` | `#141b3d` | `#1a224e` |
| `bg.surface` | `#1c2547` | `#202b52` | `#263361` |
| `bg.overlay` | `#202a58` | `#242f63` | `#293671` |
| `bg.selection` | `#17204a` | `#1b2556` | `#202c66` |
| `bg.sunken` | `#0a0e22` | `#0e1430` | `#141c43` |
| `bg.border` | `#070a1a` | `#0b1028` | `#10173d` |
| `fg.base` | `#d3e0f0` | `#d3e0f0` | `#d3e0f0` |
| `fg.muted` | `#aebfda` | `#b0c0db` | `#afc0db` |
| `fg.comment` | `#6570a8` | `#6a75ab` | `#707aae` |
| `syntax.keyword` | `#5e9fe0` | `#639dd8` | `#699ccf` |
| `syntax.builtin` | `#99c5f0` | `#98c1ea` | `#98bee2` |
| `syntax.info` | `#84bef5` | `#85bbed` | `#87b7e5` |
| `syntax.function` | `#95de73` | `#95d776` | `#95cf79` |
| `syntax.string` | `#e8e274` | `#e0db77` | `#d8d37a` |
| `syntax.type` | `#f2c074` | `#eabc77` | `#e1b87a` |
| `syntax.constant` | `#9a63de` | `#9f70d8` | `#a179d0` |
| `syntax.error` | `#eb8667` | `#e2876b` | `#d98970` |
| `ui.button` | `#2a5ca8` | `#3462a8` | `#3f6aaa` |
| `ui.statusBar` | `#3b2654` | `#422e5b` | `#4c3864` |

<details>
<summary><strong>ANSI terminal colours</strong></summary>

| Colour | Rust in Peace | Hangar 18 | Polaris |
| --- | --- | --- | --- |
| `ansi.black` | `#1c2547` | `#202b52` | `#263361` |
| `ansi.red` | `#eb8667` | `#e2876b` | `#d98970` |
| `ansi.green` | `#95de73` | `#95d776` | `#95cf79` |
| `ansi.yellow` | `#e8e274` | `#e0db77` | `#d8d37a` |
| `ansi.blue` | `#9a63de` | `#9f70d8` | `#a179d0` |
| `ansi.magenta` | `#eb8db7` | `#e48db4` | `#dd8eb1` |
| `ansi.cyan` | `#84bef5` | `#85bbed` | `#87b7e5` |
| `ansi.white` | `#d3e0f0` | `#d3e0f0` | `#d3e0f0` |
| `ansi.brightBlack` | `#6570a8` | `#6a75ab` | `#707aae` |
| `ansi.brightRed` | `#f0a48d` | `#e9a38d` | `#e1a28e` |
| `ansi.brightGreen` | `#b0e696` | `#aee096` | `#acd996` |
| `ansi.brightYellow` | `#ede893` | `#e6e293` | `#dfdb93` |
| `ansi.brightBlue` | `#b085e5` | `#ae86de` | `#ab88d7` |
| `ansi.brightMagenta` | `#f0aac9` | `#eaa8c5` | `#e4a6c1` |
| `ansi.brightCyan` | `#a3cef8` | `#a1caf2` | `#a0c6eb` |
| `ansi.brightWhite` | `#eef4fb` | `#eef4fb` | `#eef4fb` |

</details>
<!-- GENERATED PALETTE END -->

## Installation

Install straight from the [**Visual Studio Marketplace**](https://marketplace.visualstudio.com/items?itemName=chapmandu.rust-in-peace), or from inside the editor:

1. Open the **Extensions** sidebar in VS Code — `View → Extensions`
2. Search for `Megadeth` _(curse you, rust-lang!!!)_
3. Click **Install**
4. `Code → Preferences → Color Theme → ` **Rust in Peace** — or one of its lighter variants, **Hangar 18** (a subtle lift) and **Polaris** (lighter still)

## Companion themes

The VS Code theme isn't the only target. [`src/palette.json`](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/src/palette.json) is the single source of truth, and matching themes for other tools are generated from it into [`themes/`](https://github.com/chapmandu/rust-in-peace-vscode-theme/tree/main/themes):

| Tool                                               | Generated file                        |
| -------------------------------------------------- | ------------------------------------- |
| [Helix](https://helix-editor.com/)                 | `themes/helix/rust-in-peace.toml`     |
| [Herdr](https://herdr.dev/)                        | `themes/herdr/rust-in-peace.toml`     |
| [Zed](https://zed.dev/)                            | `themes/zed/rust-in-peace.json`       |
| [Zellij](https://zellij.dev/)                      | `themes/zellij/rust-in-peace.kdl`     |
| [Ptyxis](https://gitlab.gnome.org/chergert/ptyxis) | `themes/ptyxis/rust-in-peace.palette` |

Copy the relevant file into your tool's theme directory, then select `rust-in-peace`. Run `just build-themes` (or `npm run build:themes`) to regenerate them all after a palette change.

> Herdr has no standalone theme files — its file is a config fragment to merge into `~/.config/herdr/config.toml`, recolouring the `catppuccin` base theme.

To add another target, drop a generator in `scripts/targets/` and register it in `scripts/build-themes.ts`; it reuses the shared palette loader and resolver in `scripts/palette.ts`.

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
| `just check`         | Run the full code-quality suite (eslint, typecheck, lint)    |
| `just fallow`        | Audit for unused code and dependencies                       |
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

<div align="center">

[![CI](https://github.com/chapmandu/rust-in-peace-vscode-theme/actions/workflows/ci.yml/badge.svg)](https://github.com/chapmandu/rust-in-peace-vscode-theme/actions/workflows/ci.yml)

</div>

---

<div align="center">

Also check out the Slayer [**Reign in Blood**](https://marketplace.visualstudio.com/items?itemName=chapmandu.reign-in-blood) theme.

</div>
