"""Build scripts for the Rust in Peace theme.

Entry points, run from the repo root with `uv run python -m scripts.<name>`
(wrapped by the npm scripts and just recipes):

- build         VS Code theme JSONs + README art and generated sections
- build_themes  downstream editor/terminal themes (Helix, Herdr, Ptyxis, Zed, Zellij)
- lint          theme keys checked against the VS Code reference (network)

src/palette.json is the single source of truth; every output derives from it.
Each module's docstring describes its own design.
"""
