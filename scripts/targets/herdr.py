"""herdr theme config fragment.

Recolours herdr's catppuccin base theme to the album palette through the
[theme.custom] override tokens (a Catppuccin-flavoured vocabulary); any token
not overridden falls through to catppuccin. The primary accent is the cover's
electric tube blue, matching the Zellij tuning, and panel_bg sits sunken
below content as VS Code's chrome does.

Design: one Token table maps herdr's vocabulary onto palette paths, each with
an inline note that lands in the generated file as a comment.
"""

from __future__ import annotations

from dataclasses import dataclass

from scripts.palette import Palette, resolve_palette_path


@dataclass(frozen=True)
class Token:
    """A herdr override token mapped to a palette path, with an optional note."""

    name: str
    ref: str
    comment: str | None = None


# Order follows herdr's own struct.
TOKENS = [
    Token("accent", "syntax.keyword", "primary accent — tube blue, the theme signature"),
    Token(
        "panel_bg", "bg.sunken", "tab + status bar band — sunken below content, as VS Code chrome"
    ),  # noqa: E501
    Token("surface0", "bg.overlay", "raised surface — selected rows, inactive tab chips"),
    Token("surface1", "ui.button", "highest surface — VS Code button blue"),
    Token("surface_dim", "bg.surface", "base surface — active row, dividers, seams"),
    Token("overlay0", "fg.comment", "muted UI lines, borders"),
    Token("overlay1", "fg.muted", "brighter UI lines"),
    Token("text", "fg.base", "primary text"),
    Token("subtext0", "fg.muted", "secondary text"),
    Token("mauve", "syntax.constant", "softened violet — constants"),
    Token("green", "syntax.function", "glowing hand green"),
    Token("yellow", "syntax.string", "logo gold"),
    Token("red", "syntax.error", "rust / logo-edge red"),
    Token("blue", "syntax.info", "bright tube blue"),
    Token("teal", "syntax.builtin", "sky cyan"),
    Token("peach", "syntax.type", "logo orange"),
]

HEADER = """\
# rust-in-peace — a herdr theme from the Megadeth "Rust in Peace" cover palette.
# Generated from src/palette.json by scripts/targets/herdr.py (just build-themes).
# Do not edit by hand: edit the palette and rebuild.
# Merge this into your herdr config: https://herdr.dev/docs/configuration/#theme
#
# Recolours the catppuccin base theme via [theme.custom] overrides; any token
# not set here falls through to catppuccin. The accent is the cover's electric
# tube blue (the theme signature); panel_bg sits sunken below content, as VS
# Code's chrome does.
# Tip: set panel_bg = "reset" to let panels follow your terminal background."""


def generate(palette: Palette) -> str:
    """Generate the herdr theme config fragment from the palette."""
    width = max(len(token.name) for token in TOKENS)

    lines = []
    for token in TOKENS:
        hex_colour = resolve_palette_path(palette, token.ref)
        line = f'{token.name.ljust(width)} = "{hex_colour}"'
        lines.append(f"{line} # {token.comment}" if token.comment else line)

    return "\n".join(
        [HEADER, "", "[theme]", 'name = "catppuccin"', "", "[theme.custom]", *lines, ""]
    )
