<div align="center">

<img src="https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/logo.png" alt="Rust in Peace logo" width="120" />

# Rust in Peace

**A dark theme for VS Code, inspired by the album art of Megadeth's 1990 metal masterpiece, _Rust in Peace_.**

![Screenshot](https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/screenshot.png)

## Colour Palette

![Rust in Peace swatch](https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/swatch.png)

</div>

Hand-picked from the record's rusted, cobalt-blue cover art.
The complete palette, including ANSI terminal colours, lives in [`assets/palette.json`](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/assets/palette.json).

## Installation

Install straight from the [**Visual Studio Marketplace**](https://marketplace.visualstudio.com/items?itemName=chapmandu.rust-in-peace), or from inside the editor:

1. Open the **Extensions** sidebar in VS Code — `View → Extensions`
2. Search for `Megadeth` _(curse you, rust-lang!!!)_
3. Click **Install**
4. `Code → Preferences → Color Theme → ` **Rust in Peace**



## Contributing

To work on the theme:

1. Clone this repo and open it in VS Code
2. Open `View → Run`
3. Click **Launch Extension** — this opens a second VS Code window
4. Target scopes with the **Developer: Inspect Editor Tokens and Scopes** command
5. Edit `src/rust-in-peace.yaml` and run `npm run build`; changes appear live in the window from step 3

> Please include **before & after** screenshots of your changes in pull requests.

<details>
<summary><strong>Maintainer & publishing notes</strong></summary>

### Scripts

| Script                      | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `npm run extension:install` | Builds and installs the extension locally |
| `npm run publish:minor`     | Bump the minor version and publish        |
| `npm run publish:patch`     | Bump the patch version and publish        |

### Manual publishing

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
