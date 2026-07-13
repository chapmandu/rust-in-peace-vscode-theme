"""Entry point: check the theme's colour keys against VS Code's theme-color reference.

Run as `python -m scripts.lint` (wrapped by `npm run lint` / `just lint`;
network-dependent). Keys the theme sets that the reference no longer lists
are warnings and fail the run; keys the theme leaves to VS Code's defaults
are informational only.

Design: the reference page has no machine-readable form, so the supported
keys are scraped from its <code> spans and filtered heuristically (no spaces,
no hex examples, no quoted values). If the page layout changes, the scrape
fails loudly rather than passing an empty set.
"""

from __future__ import annotations

import re
import sys
import urllib.request

from scripts.generate import generate

THEME_COLOR_REFERENCE_URL = "https://code.visualstudio.com/api/references/theme-color"

# <code> spans shorter than this are stray fragments, not theme keys.
MIN_KEY_LENGTH = 5

# <code> spans on the reference page that aren't theme keys.
NOT_THEME_KEYS = frozenset(
    {
        "workbench.colorCustomizations",
        "editor.tokenColorCustomizations",
    }
)

LEVEL_COLORS = {
    "INFO": "\x1b[36m",  # cyan
    "WARN": "\x1b[33m",  # yellow
    "ERROR": "\x1b[31m",  # red
}
RESET = "\x1b[0m"


def log(level: str, message: str) -> None:
    """Print a colour-coded log line (errors go to stderr)."""
    line = f"{LEVEL_COLORS[level]}{level}{RESET}: {message}"
    print(line, file=sys.stderr if level == "ERROR" else sys.stdout)


def scrape_theme_available_keys() -> set[str]:
    """Scrape the supported colour keys from the reference page's <code> spans."""
    with urllib.request.urlopen(THEME_COLOR_REFERENCE_URL) as response:  # noqa: S310 — fixed https URL
        page = response.read().decode("utf-8")

    matches = re.findall(r"<code>(.+?)</code>", page)
    if not matches:
        raise RuntimeError(
            "Couldn't find any matches with <code>...</code>, maybe docs have changed?"
        )

    return {
        key
        for key in matches
        if " " not in key  # prose, not a key
        and not key.startswith("#")  # hex colour examples
        and "&quot;" not in key  # quoted setting values
        and len(key) >= MIN_KEY_LENGTH
        and key not in NOT_THEME_KEYS
    }


def main() -> None:
    """Report unset and unsupported theme keys; exit 1 if any are unsupported."""
    supported_keys = scrape_theme_available_keys()
    theme_keys = set(generate().base["colors"])

    # Keys the theme leaves to VS Code's defaults — informational only.
    for key in sorted(supported_keys - theme_keys):
        log("INFO", f'"{key}" not set; using VS Code\'s default')

    # Keys the theme sets that the reference no longer lists — a hard failure.
    unsupported_keys = sorted(theme_keys - supported_keys)
    for key in unsupported_keys:
        log("WARN", f'"{key}" is unsupported, probably deprecated')

    if unsupported_keys:
        log("ERROR", f"{len(unsupported_keys)} unsupported theme key(s); see warnings above")
        sys.exit(1)


if __name__ == "__main__":
    main()
