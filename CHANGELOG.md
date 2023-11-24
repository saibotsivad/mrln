# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

Change categories are:

* `Added` for new features.
* `Changed` for changes in existing functionality.
* `Deprecated` for once-stable features removed in upcoming releases.
* `Removed` for deprecated features removed in this release.
* `Fixed` for any bug fixes.
* `Security` to invite users to upgrade in case of vulnerabilities.

## [2.0.0](https://github.com/saibotsivad/mrln/compare/v1.0.1...v2.0.0) - 2023-11-23
### Change
- **BREAKING:** If an existing symlink is found and it doesn't match the computed, an error will be thrown.
- **BREAKING:** Using relative symlinks instead of absolute.
- Migration path:
  - If you have not committed symlinks accidentally, nothing in normal CI/CD needs to change.
  - For local development, you will need to delete existing symlinks, since v1.0.1 pointed them to an absolute path.

## [1.0.1](https://github.com/saibotsivad/mrln/compare/v1.0.0...v1.0.1) - 2022-09-06
### Change
- Updated documentation for clarity.
- Update demo to show more things.

## [1.0.0](https://github.com/saibotsivad/mrln/compare/v0.0.0...v1.0.0) - 2022-09-05
### Added
- All the main symlink functionality.
- A nice helper to set up `jsconfig.json` files.

## [0.0.0](https://github.com/saibotsivad/mrln/tree/v0.0.0) - 2022-09-03
### Added
- Created the base project from [saibotsivad/init](https://github.com/saibotsivad/init).

[Unreleased]: https://github.com/saibotsivad/mrln/compare/v0.0.0...HEAD
[0.0.1]: https://github.com/saibotsivad/mrln/compare/v0.0.0...v0.0.1
