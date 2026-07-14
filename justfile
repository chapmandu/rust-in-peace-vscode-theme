# Show available recipes
default:
    just --list

[private]
c:
    just --choose

# Provision the toolchain (mise) and Python dependencies (uv)
[group('setup')]
setup:
    mise install
    uv sync
    npm install

# Lint and format-check the Python build scripts (ruff)
[group('code quality')]
ruff:
    uv run ruff check scripts tests
    uv run ruff format --check scripts tests

# Type-check the scripts without emitting
[group('code quality')]
typecheck:
    uv run mypy

# Run the build-script unit tests
[group('code quality')]
test:
    uv run pytest

# Check theme keys against the VS Code reference (network-dependent)
[group('code quality')]
lint:
    uv run python -m scripts.lint

# Find dead code in the build scripts (vulture; config in pyproject.toml)
[group('code quality')]
deadcode:
    uv run vulture

# Fail on copy-pasted code (jscpd)
[group('code quality')]
dupes:
    npm run dupes

# Scan the git history for leaked secrets (gitleaks)
[group('code quality')]
secrets:
    gitleaks git --redact --no-banner

# Run the full code-quality suite
[group('code quality')]
check: ruff typecheck test lint deadcode dupes secrets

# Generate the theme JSONs, README sections and artwork, and downstream themes
[group('build')]
build: && build-themes
    npm run build

# Generate the downstream terminal/editor themes into themes/
[group('build')]
build-themes:
    uv run python -m scripts.build_themes

# Package the extension to ./bin/rust-in-peace.vsix
[group('build')]
package:
    npm run package

# Build, package, and install the extension into local VS Code
[group('build')]
install: build package
    code --install-extension ./bin/rust-in-peace.vsix

# Bump patch version, tag, and push to trigger a release
[group('release')]
[confirm("Bump patch, push a v* tag, and publish to the Marketplace? [y/N]")]
publish-patch:
    npm version patch
    git push --follow-tags

# Bump minor version, tag, and push to trigger a release
[group('release')]
[confirm("Bump minor, push a v* tag, and publish to the Marketplace? [y/N]")]
publish-minor:
    npm version minor
    git push --follow-tags
