# Show available recipes
default:
    just --list

[private]
c:
    just --choose

# Install the global publishing tool (vsce)
[group('setup')]
setup:
    brew install vsce

# Lint the TypeScript build scripts (ESLint)
[group('code quality')]
eslint:
    npm run eslint

# Type-check the scripts without emitting
[group('code quality')]
typecheck:
    npm run typecheck

# Check theme keys against the VS Code reference (network-dependent)
[group('code quality')]
lint:
    npm run lint

# Audit for unused code and dependencies (needs the fallow CLI — https://fallow.dev)
[group('code quality')]
fallow:
    npx fallow audit

# Run the full code-quality suite
[group('code quality')]
check: eslint typecheck lint fallow

# Generate theme/rust-in-peace.json from the YAML source
[group('build')]
build:
    npm run build

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
