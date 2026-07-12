"""Helix TOML theme.

Inherits tokyonight (tokyonight_day for the light flavor) for UI structure
and recolours syntax to the album palette, mirroring the VS Code theme's
token philosophy.

Design: the output has two layers. The ROLES block is static text — syntax
roles reference palette *names* ("aqua", "orange"), so it never changes with
the source palette. The [palette] block beneath it defines those names, and
every one derives from the shared palette: identity colours resolve from
palette paths (diff and diagnostic slots take the VS Code theme's colour for
the equivalent UI element), while Helix-only shades are declared mix/adjust
formulas over palette anchors (scripts/color.py).
"""

from __future__ import annotations

from dataclasses import dataclass

from scripts.color import ColorFn, adjusted, mixed
from scripts.palette import resolve_palette_path
from scripts.variants import Flavor

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

    A named colour resolved from a palette path, or derived from palette
    anchors via a ColorFn (scripts/color.py) for Helix-specific shades the
    core palette doesn't carry directly.
    """

    name: str
    ref: str | ColorFn
    comment: str | None = None


BLANK = None  # a blank line, preserving the grouping in the output

# Diagnostic hints and tokyonight's teal share one slate blue: info sunk
# toward the selection surface.
SLATE = mixed("bg.selection", "syntax.info", 0.70)

# Helix's named colours, grouped as in the output (BLANK = blank line).
# Slots with a VS Code UI equivalent take that element's colour; the rest
# derive from the semantically-nearest palette anchors.
PALETTE: list[Entry | None] = [
    Entry("red", "syntax.error", "rust / logo-edge red"),
    Entry("orange", "syntax.type", "logo orange — types, parameters"),
    Entry("yellow", "syntax.string", "logo gold — strings"),
    Entry("light-green", "syntax.function", "glowing hand green — functions"),
    Entry("green", mixed("fg.muted", "syntax.info", 0.40), "pale tube glow (unused member slot)"),
    Entry("aqua", "syntax.keyword", "electric tube blue — keywords, operators"),
    Entry("teal", SLATE, "slate blue — markup, hints"),
    Entry("turquoise", adjusted("fg.muted", lightness=-5), "muted hangar blue"),
    Entry("light-cyan", adjusted("syntax.info", saturation=5, lightness=15), "ice glow"),
    Entry("cyan", "syntax.builtin", "sky cyan — builtins"),
    Entry("blue", "syntax.info", "bright tube blue — UI accents, labels"),
    Entry("purple", "syntax.constant", "softened violet — constants, headings"),
    Entry("magenta", "ansi.magenta", "sarcophagus pink — select mode"),
    Entry("comment", "fg.comment", "muted blue shading"),
    Entry("black", "bg.surface", "raised surface blue"),
    BLANK,
    Entry("add", "syntax.function", "as VS Code gitDecoration.added"),
    Entry("change", "syntax.builtin", "as VS Code gitDecoration.modified"),
    Entry("delete", "syntax.error", "as VS Code gitDecoration.deleted"),
    BLANK,
    Entry("error", "syntax.error", "as VS Code editorError"),
    Entry("info", "syntax.builtin", "as VS Code editorInfo"),
    Entry("hint", SLATE),
    BLANK,
    Entry("fg", "fg.base", "pale blue highlight white"),
    Entry("fg-dark", "fg.muted"),
    Entry(
        "fg-gutter",
        mixed("bg.base", "fg.ink", 0.10),
        "whitespace marks — flattened editorWhitespace",
    ),
    Entry("fg-linenr", "fg.comment", "as VS Code editorLineNumber"),
    Entry("fg-selected", "bg.selection", "menu selection bg — as VS Code list selection"),
    Entry("border", "bg.border"),
    Entry("border-highlight", "syntax.keyword"),
    Entry("bg", "bg.base", "hangar deep blue"),
    Entry("bg-inlay", mixed("bg.base", "bg.selection", 0.50), "flattened list.focusBackground"),
    Entry("bg-selection", "bg.selection"),
    Entry("bg-menu", "bg.sunken", "statusline, popups"),
    Entry("bg-focus", "bg.overlay"),
]

HEADER = """\
# {slug} — a Helix theme from the Megadeth "Rust in Peace" cover palette.
# Generated from the src/ palettes by scripts/targets/helix.py (just build-themes).
# Do not edit by hand: edit the palette and rebuild.
inherits = "{inherits}"

# Syntax roles mirror the rust-in-peace VSCode theme (original structure):
#   keywords / operators / delimiters / tags = electric tube blue
#   functions / decorators = glow green      strings  = logo gold
#   types / parameters     = logo orange     constants = violet
#   builtins               = sky cyan        comments  = muted blue
# UI structure comes from the inherited base theme. Every colour in
# [palette] derives from the shared source of truth: identity slots map
# straight to it (diffs and diagnostics follow the VSCode theme's UI
# elements), Helix-only shades via declared mix/adjust formulas."""


def generate(flavor: Flavor) -> str:
    """Generate the Helix TOML theme for one flavor."""
    palette = flavor.palette
    width = max(len(entry.name) for entry in PALETTE if entry is not None)

    palette_lines = []
    for entry in PALETTE:
        if entry is None:
            palette_lines.append("")
            continue
        ref = entry.ref
        hex_colour = ref(palette) if callable(ref) else resolve_palette_path(palette, ref)
        line = f'{entry.name.ljust(width)} = "{hex_colour}"'
        palette_lines.append(f"{line} # {entry.comment}" if entry.comment else line)

    inherits = "tokyonight_day" if flavor.appearance == "light" else "tokyonight"
    header = HEADER.format(slug=flavor.slug, inherits=inherits)
    return "\n".join([header, "", ROLES, "", "[palette]", *palette_lines, ""])
