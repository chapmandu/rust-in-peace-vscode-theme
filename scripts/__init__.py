"""Build scripts for the Rust in Peace theme.

Entry points, run from the repo root with `uv run python -m scripts.<name>`
(wrapped by the just recipes; `build` also by `npm run build` for vsce's
prepublish hook):

- build         VS Code theme JSONs + README art and generated sections
- build_ports   downstream editor/terminal themes (Helix, Herdr, Ptyxis, Zed, Zellij)
- lint          theme keys checked against the VS Code reference (network)

src/palette.json is the single source of truth; every output derives from it.
Each module's docstring describes its own design.
"""
