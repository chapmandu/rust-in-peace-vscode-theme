import pytest
from coloraide import Color

from scripts.color import adjusted, mixed
from scripts.palette import Palette

PALETTE: Palette = {
    "bg": {"base": "#000000"},
    "fg": {"ink": "#ffffff"},
    "syntax": {"keyword": "#5e9fe0"},
}


def test_mixed_endpoints() -> None:
    assert mixed("bg.base", "fg.ink", 0)(PALETTE) == "#000000"
    assert mixed("bg.base", "fg.ink", 1)(PALETTE) == "#ffffff"


def test_mixed_midpoint() -> None:
    assert mixed("bg.base", "fg.ink", 0.5)(PALETTE) == "#808080"


def test_adjusted_shifts_lightness() -> None:
    darker = adjusted("syntax.keyword", lightness=-20)(PALETTE)
    assert Color(darker).convert("hsl")["lightness"] < Color("#5e9fe0").convert("hsl")["lightness"]


def test_adjusted_clamps_at_bounds() -> None:
    assert adjusted("fg.ink", lightness=+50)(PALETTE) == "#ffffff"
    assert adjusted("bg.base", saturation=-50, lightness=-50)(PALETTE) == "#000000"


def test_unknown_path_raises() -> None:
    with pytest.raises(ValueError, match="nope.nothing"):
        mixed("nope.nothing", "fg.ink", 0.5)(PALETTE)
