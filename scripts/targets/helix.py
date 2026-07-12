"""Helix TOML theme.

Inherits tokyonight for UI structure and recolours syntax to the album
palette, mirroring the VS Code theme's token philosophy.

Design: the output has two layers. The ROLES block is static text — syntax
roles reference palette *names* ("aqua", "orange"), so it never changes with
the source palette. The [palette] block beneath it defines those names:
shared identity colours resolve from palette paths and track the source of
truth, while Helix-only shades (diffs, diagnostics, gutter chrome) stay
literal hex.
"""

from __future__ import annotations

from dataclasses import dataclass

from scripts.palette import Palette, resolve_palette_path

# Static: roles reference the palette names defined in the [palette] block below.
ROLES = """\
keyword = { fg = "aqua" }
"keyword.control" = { fg = "aqua" }
"keyword.control.import" = { fg = "aqua" }
"keyword.control.return" = { fg = "aqua" }
"keyword.function" = { fg = "aqua" }
"keyword.operator" = { fg = "aqua" }
"keyword.directive" = { fg = "aqua" }
operator = { fg = "aqua" }
punctuation = { fg = "fg" }
"punctuation.delimiter" = { fg = "aqua" }
tag = { fg = "aqua" }
"constant.character.escape" = { fg = "aqua" }

function = { fg = "light-green" }
"function.builtin" = { fg = "cyan" }
"function.macro" = { fg = "light-green" }
attribute = { fg = "light-green", modifiers = ["italic"] }

string = { fg = "yellow" }
"string.regexp" = { fg = "yellow" }

type = { fg = "orange", modifiers = ["italic"] }
"type.builtin" = { fg = "orange", modifiers = ["italic"] }
constructor = { fg = "orange" }
"variable.parameter" = { fg = "orange", modifiers = ["italic"] }

constant = { fg = "purple" }
"constant.builtin" = { fg = "purple" }
"variable.builtin" = { fg = "cyan", modifiers = ["italic"] }
"variable.other.member" = { fg = "fg" }
namespace = { fg = "fg" }

"comment.block.documentation" = { fg = "comment", modifiers = ["italic"] }
"comment.line.documentation" = { fg = "comment", modifiers = ["italic"] }

"markup.heading" = { fg = "purple", modifiers = ["bold"] }
"markup.link" = { fg = "cyan", underline = { style = "line" } }
"markup.list" = { fg = "cyan" }
"markup.raw" = { fg = "light-green" }
"markup.quote" = { fg = "yellow", modifiers = ["italic"] }

"diff.plus" = { fg = "light-green" }
"diff.minus" = { fg = "red" }
"diff.delta" = { fg = "orange" }"""


@dataclass(frozen=True)
class Entry:
    """A [palette] entry.

    A named colour resolved from a palette path, or a literal `#rrggbb` for
    Helix-specific shades the core palette doesn't carry.
    """

    name: str
    ref: str
    comment: str | None = None


BLANK = None  # a blank line, preserving the grouping in the output

# Helix's named colours, grouped as in the output (BLANK = blank line).
PALETTE: list[Entry | None] = [
    Entry("red", "syntax.error", "rust / logo-edge red"),
    Entry("orange", "syntax.type", "logo orange — types, parameters"),
    Entry("yellow", "syntax.string", "logo gold — strings"),
    Entry("light-green", "syntax.function", "glowing hand green — functions"),
    Entry("green", "#9cbee6", "pale tube glow (unused member slot)"),
    Entry("aqua", "syntax.keyword", "electric tube blue — keywords, operators"),
    Entry("teal", "#5f8fc4", "slate blue — markup, hints"),
    Entry("turquoise", "#9db4d8", "muted hangar blue"),
    Entry("light-cyan", "#c8e6ff", "ice glow"),
    Entry("cyan", "syntax.builtin", "sky cyan — builtins"),
    Entry("blue", "syntax.info", "bright tube blue — UI accents, labels"),
    Entry("purple", "syntax.constant", "softened violet — constants, headings"),
    Entry("magenta", "ansi.magenta", "sarcophagus pink — select mode"),
    Entry("comment", "fg.comment", "muted blue shading"),
    Entry("black", "bg.surface", "raised surface blue"),
    BLANK,
    Entry("add", "#5cb454"),
    Entry("change", "#5878c4"),
    Entry("delete", "#a04a3a"),
    BLANK,
    Entry("error", "#e05a3e", "deep rust"),
    Entry("info", "#55aef5"),
    Entry("hint", "#5f8fc4"),
    BLANK,
    Entry("fg", "fg.base", "pale blue highlight white"),
    Entry("fg-dark", "fg.muted"),
    Entry("fg-gutter", "#33406f", "line numbers, whitespace marks"),
    Entry("fg-linenr", "#7484b8"),
    Entry("fg-selected", "#232d5c", "menu selection bg"),
    Entry("border", "bg.border"),
    Entry("border-highlight", "syntax.keyword"),
    Entry("bg", "bg.base", "hangar deep blue"),
    Entry("bg-inlay", "#101d40"),
    Entry("bg-selection", "bg.selection"),
    Entry("bg-menu", "bg.sunken", "statusline, popups"),
    Entry("bg-focus", "bg.overlay"),
]

HEADER = """\
# rust-in-peace — a Helix theme from the Megadeth "Rust in Peace" cover palette.
# Generated from src/palette.json by scripts/targets/helix.py (just build-themes).
# Do not edit by hand: edit the palette and rebuild.
inherits = "tokyonight"

# Syntax roles mirror the rust-in-peace VSCode theme (original structure):
#   keywords / operators / delimiters / tags = electric tube blue
#   functions / decorators = glow green      strings  = logo gold
#   types / parameters     = logo orange     constants = violet
#   builtins               = sky cyan        comments  = muted blue
# UI structure comes from the inherited base theme. Identity colours in
# [palette] track the shared source of truth; Helix-only shades (diffs,
# diagnostics, gutter chrome) are local literals."""


def generate(palette: Palette) -> str:
    """Generate the Helix TOML theme from the palette."""
    width = max(len(entry.name) for entry in PALETTE if entry is not None)

    palette_lines = []
    for entry in PALETTE:
        if entry is None:
            palette_lines.append("")
            continue
        is_literal = entry.ref.startswith("#")
        hex_colour = entry.ref if is_literal else resolve_palette_path(palette, entry.ref)
        line = f'{entry.name.ljust(width)} = "{hex_colour}"'
        palette_lines.append(f"{line} # {entry.comment}" if entry.comment else line)

    return "\n".join([HEADER, "", ROLES, "", "[palette]", *palette_lines, ""])
