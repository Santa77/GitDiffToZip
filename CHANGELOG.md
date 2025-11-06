# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive input validation
  - Git repository check
  - Commit existence validation
- CLI options support
  - `--help` / `-h` flag for usage information
  - `--version` / `-v` flag for version display
  - `--output` / `-o` flag for custom output directory
- ESLint configuration for code quality
- Prettier configuration for code formatting
- Jest configuration for testing
- Comprehensive README with badges, examples, and troubleshooting
- CHANGELOG.md for tracking changes
- .npmignore for cleaner npm package
- Enhanced error handling with descriptive messages
- Progress reporting (file count, success/fail counts)

### Changed

- Updated all console messages from Slovak to English
- Improved package.json with complete metadata
  - Added keywords, author, repository, bugs, homepage
  - Added engines field (Node.js >= 18.0.0)
  - Added test, lint, and format scripts
- Updated Node.js target from node16 to node18 in build scripts
- Upgraded adm-zip from ^0.5.9 to ^0.5.16
- Enhanced temporary directory naming to avoid conflicts (using timestamp + PID)
- Output ZIP path now supports custom directories via --output option
- Improved error messages with proper formatting

### Fixed

- Better cleanup on error conditions
- Proper handling of missing files during extraction

## [0.0.2] - 2025-01-27

### Changed

- Fixed version number in package.json
- Changed ZIP file name structure

## [0.0.1] - Initial Release

### Added

- Initial implementation of Git diff to ZIP functionality
- Support for comparing two Git commits
- ZIP archive creation with timestamped names
- Cross-platform binary builds (Windows, Linux, macOS)
- GitHub Actions CI/CD workflow
- Basic documentation

[Unreleased]: https://github.com/Santa77/GitDiffToZip/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/Santa77/GitDiffToZip/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/Santa77/GitDiffToZip/releases/tag/v0.0.1
