<div align="center">

<img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/logo.png" alt="Rust in Peace logo" width="120" />

# Rust in Peace

**A dark theme for VS Code, inspired by the album art of Megadeth's 1990 metal masterpiece, _Rust in Peace_.**

![Screenshot](https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/screenshot.png)

## Colour Palette

![Rust in Peace swatch](https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/swatch.png)

</div>

Hand-picked from the record's rusted, cobalt-blue cover art.
The complete palette, including ANSI terminal colours, lives in [`src/palette.json`](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/src/palette.json) — the single source of truth the VS Code theme is generated from.

## Installation

Install straight from the [**Visual Studio Marketplace**](https://marketplace.visualstudio.com/items?itemName=chapmandu.rust-in-peace), or from inside the editor:

1. Open the **Extensions** sidebar in VS Code — `View → Extensions`
2. Search for `Megadeth` _(curse you, rust-lang!!!)_
3. Click **Install**
4. `Code → Preferences → Color Theme → ` **Rust in Peace**

## Companion themes

The VS Code theme isn't the only target. [`src/palette.json`](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/src/palette.json) is the single source of truth, and matching themes for other tools are generated from it into [`themes/`](https://github.com/chapmandu/rust-in-peace-vscode-theme/tree/main/themes):

| Tool                                               | Generated file                       |
| -------------------------------------------------- | ------------------------------------ |
| [Helix](https://helix-editor.com/)                 | `themes/helix/rust-in-peace.toml`    |
| [Zellij](https://zellij.dev/)                      | `themes/zellij/rust-in-peace.kdl`    |
| [Ptyxis](https://gitlab.gnome.org/chergert/ptyxis) | `themes/ptyxis/rust-in-peace.palette` |

Copy the relevant file into your tool's theme directory, then select `rust-in-peace`. Run `just build-themes` (or `npm run build:themes`) to regenerate them all after a palette change.

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
| `just build-themes`  | Regenerate the companion themes (Helix, Zellij, Ptyxis)      |
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
