"""Downstream theme targets.

Each module renders one editor/terminal config from the shared palettes and
exposes `generate(flavor) -> str` (Zed, whose format is a theme family,
takes the whole flavor list). Targets are deliberately self-contained: a
format's token tables, role mappings, and templating live in its module
alone. New targets register in scripts/build_ports.py.
"""
