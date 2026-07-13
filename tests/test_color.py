import pytest

from scripts.color import mixed
from scripts.palette import Palette

PALETTE: Palette = {
    "bg": {"base": "#000000"},
    "fg": {"ink": "#ffffff"},
}


def test_mixed_endpoints() -> None:
    assert mixed("bg.base", "fg.ink", 0)(PALETTE) == "#000000"
    assert mixed("bg.base", "fg.ink", 1)(PALETTE) == "#ffffff"


def test_mixed_midpoint() -> None:
    assert mixed("bg.base", "fg.ink", 0.5)(PALETTE) == "#808080"


def test_unknown_path_raises() -> None:
    with pytest.raises(ValueError, match="nope.nothing"):
        mixed("nope.nothing", "fg.ink", 0.5)(PALETTE)
