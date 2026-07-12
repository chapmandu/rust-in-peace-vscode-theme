import pytest

from scripts.readme import fmt, inject, squiggle_path


def test_fmt_drops_float_noise() -> None:
    assert fmt(64.0) == "64"
    assert fmt(64.5) == "64.5"
    assert fmt(7.800000000000001) == "7.8"


def test_squiggle_path_repeats_wave_segments() -> None:
    assert squiggle_path(64, 66, 12) == "M 64 66 q 3 3 6 0 t 6 0"


def test_squiggle_path_has_at_least_one_segment() -> None:
    assert squiggle_path(0, 0, 1) == "M 0 0 q 3 3 6 0"


README = """intro
<!-- GENERATED X START (npm run build — do not edit by hand) -->
stale
<!-- GENERATED X END -->
outro"""


def test_inject_replaces_marker_region() -> None:
    updated = inject(README, "X", "fresh")
    assert "fresh" in updated
    assert "stale" not in updated
    assert updated.startswith("intro")
    assert updated.endswith("outro")


def test_inject_missing_markers_raises() -> None:
    with pytest.raises(ValueError, match="missing"):
        inject("no markers here", "X", "block")
