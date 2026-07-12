"""Zellij KDL theme.

Emits the six-slot style block Zellij expects for every UI component, in its
`r g b` colour notation (0 = unset, inherit the terminal default). Chrome
follows VS Code: tabs and mode pills wear the deep skull-violet status bar,
the selected one pops in the cover's bright violet, and the focused frame is
the keyword tube blue.

Design: components are pure data — a dict of styles whose slots reference
palette paths — rendered by one small `_render`. TEXT/SELECTED are shared
bases for every plain-text, table, and list component.
"""

from __future__ import annotations

from scripts.palette import Palette, hex_to_rgb, resolve_palette_path

# A Zellij colour value: a palette path (`syntax.info`), or 0 — Zellij's
# sentinel for "unset / inherit the terminal default".
type Ref = str | int

# The six-slot style block Zellij expects for every UI component.
type Style = dict[str, Ref]

# Primary foreground on the sunken bar chrome (as VS Code's tab strip), with
# the four emphasis accents in type / info / function / constant order.
TEXT: Style = {
    "base": "fg.base",
    "background": "bg.sunken",
    "emphasis_0": "syntax.type",
    "emphasis_1": "syntax.info",
    "emphasis_2": "syntax.function",
    "emphasis_3": "syntax.constant",
}

# Selected rows: TEXT lifted onto the VS Code list-selection surface.
SELECTED: Style = {**TEXT, "background": "bg.selection"}

# UI-component styles, in file order.
COMPONENTS: dict[str, Style] = {
    "text_unselected": TEXT,
    "text_selected": SELECTED,
    "ribbon_selected": {
        "base": "bg.base",
        "background": "syntax.constant",
        "emphasis_0": "syntax.error",
        "emphasis_1": "syntax.type",
        "emphasis_2": "syntax.string",
        "emphasis_3": "fg.comment",
    },
    "ribbon_unselected": {
        "base": "fg.base",
        "background": "ui.statusBar",
        "emphasis_0": "syntax.string",
        "emphasis_1": "fg.base",
        "emphasis_2": "fg.muted",
        "emphasis_3": "syntax.info",
    },
    "table_title": {
        "base": "syntax.info",
        "background": 0,
        "emphasis_0": "syntax.type",
        "emphasis_1": "syntax.info",
        "emphasis_2": "syntax.function",
        "emphasis_3": "syntax.constant",
    },
    "table_cell_selected": SELECTED,
    "table_cell_unselected": TEXT,
    "list_selected": SELECTED,
    "list_unselected": TEXT,
    "frame_selected": {
        "base": "syntax.keyword",
        "background": 0,
        "emphasis_0": "syntax.type",
        "emphasis_1": "syntax.info",
        "emphasis_2": "syntax.constant",
        "emphasis_3": 0,
    },
    "frame_unselected": {
        "base": "fg.comment",  # muted UI-line blue, as VS Code's focusBorder family
        "background": 0,
        "emphasis_0": "syntax.type",
        "emphasis_1": "syntax.info",
        "emphasis_2": "syntax.constant",
        "emphasis_3": "syntax.constant",
    },
    "frame_highlight": {
        "base": "syntax.type",
        "background": 0,
        "emphasis_0": "syntax.constant",
        "emphasis_1": "syntax.type",
        "emphasis_2": "syntax.type",
        "emphasis_3": "syntax.type",
    },
    "exit_code_success": {
        "base": "syntax.function",
        "background": 0,
        "emphasis_0": "syntax.info",
        "emphasis_1": "bg.surface",
        "emphasis_2": "syntax.constant",
        "emphasis_3": "fg.comment",
    },
    "exit_code_error": {
        "base": "syntax.error",
        "background": 0,
        "emphasis_0": "syntax.string",
        "emphasis_1": 0,
        "emphasis_2": 0,
        "emphasis_3": 0,
    },
}

# The ten multiplayer cursor colours, in slot order (0 = no colour).
MULTIPLAYER: list[Ref] = [
    "syntax.constant",  # player_1
    "syntax.info",  # player_2
    0,  # player_3
    "syntax.string",  # player_4
    "syntax.function",  # player_5
    0,  # player_6
    "syntax.error",  # player_7
    0,  # player_8
    0,  # player_9
    0,  # player_10
]

HEADER = """\
// rust-in-peace — a Zellij theme from the Megadeth "Rust in Peace" cover palette.
// Generated from src/palette.json by scripts/targets/zellij.py (just build-themes).
// Do not edit by hand: edit the palette and rebuild.
//
// Chrome follows VS Code: tabs and mode pills wear the deep skull-violet
// status bar, the selected one pops in the cover's bright violet, and the
// focused frame is the keyword tube blue. Colours are `r g b`; 0 means unset,
// inheriting the terminal default. Every colour tracks the shared palette;
// the unfocused frame wears VS Code's muted UI-line comment blue."""


def _render(palette: Palette, ref: Ref) -> str:
    """Render a Ref to a Zellij colour token: `r g b`, or `0` for the sentinel."""
    if ref == 0:
        return "0"
    assert isinstance(ref, str)
    return " ".join(str(channel) for channel in hex_to_rgb(resolve_palette_path(palette, ref)))


def generate(palette: Palette) -> str:
    """Generate the Zellij KDL theme from the palette."""
    indent = "    "

    component_lines = []
    for name, style in COMPONENTS.items():
        component_lines.append(f"{indent * 2}{name} {{")
        component_lines += [
            f"{indent * 3}{slot} {_render(palette, ref)}" for slot, ref in style.items()
        ]
        component_lines.append(f"{indent * 2}}}")

    multiplayer_lines = [
        f"{indent * 2}multiplayer_user_colors {{",
        *(
            f"{indent * 3}player_{i + 1} {_render(palette, ref)}"
            for i, ref in enumerate(MULTIPLAYER)
        ),
        f"{indent * 2}}}",
    ]

    return "\n".join(
        [
            HEADER,
            "themes {",
            f"{indent}rust-in-peace {{",
            *component_lines,
            *multiplayer_lines,
            f"{indent}}}",
            "}",
            "",
        ]
    )
