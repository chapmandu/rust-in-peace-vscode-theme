# Rust in Peace Theme for VS Code

A dark theme inspired by the album art of Megadeth's 1990 metal masterpiece, Rust in Peace.

![Screenshot](https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/screenshot.png)

<div style="text-align:center">

![Rust in Peace](https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main/assets/Megadeth-RustInPeace.jpg)

</div>

## Installation

1. Open **Extensions** sidebar panel in VS Code. `View → Extensions`
2. Search for `Megadeth` (Curse you rust-lang!!!)
3. Click **Install** to install it.
4. Code > Preferences > Color Theme > **Rust in Peace**

## Colour Palette

See [assets/palette.json](https://github.com/chapmandu/rust-in-peace-vscode-theme/blob/main/assets/palette.json)

## TODO

- Python static type annotations
- Palette image
- Screenshots of code samples

## Contributing

To work on the theme:

1. Clone this repo and open in VS Code
2. Open run `View → Run`
3. Click `Launch Extension`. This will open up another VS Code Editor
4. Target scopes using the "Developer: Inspection Editor Tokens and Scopes" command
5. Make changes to `src/rust-in-peace.yaml`, and run `npm run build`. You will see changes reflected in the other editor that opened in step 3.

Please provide screenshots of your changes before & after in Pull Requests.

## Scripts (Mainly for the publisher's use)

`npm run extension:install` - Builds and installs the extension locally

`npm run publish:minor` - Bump and publish

`npm run publish:patch` - Bump and publish

### Manual Publishing

1. Bump the version in `package.json`
2. `git commit -m 'Fire'` Commit the changes
3. `git tag v2.0.666` Tag the commit with the version number
4. `git push origin --tags` Push the tag
5. `git push` Push the changes
6. Create a [release](https://github.com/chapmandu/rust-in-peace-vscode-theme/releases) in Github with the same version number
7. Github actions will publish the extension to the marketplace
8. Profit!


Also check out the Slayer [Reign in Blood](https://marketplace.visualstudio.com/items?itemName=chapmandu.reign-in-blood) theme.
