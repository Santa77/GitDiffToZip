# Git Diff To Zip (gdtz)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

A lightweight **Git Diff to Zip** CLI tool that quickly bundles only the **changed files** between two commits into a single **ZIP** archive. Perfect for seamless updates or partial deployments.

## Features

- 🎯 **Exact Versions**: Uses `git show` to fetch the specific file content from your target commit
- 📦 **Binary & Text Friendly**: Safely handles binary files as well as plain text
- ⏰ **Timestamped Archives**: Automatically names the resulting ZIP with both commit hashes and a date/time stamp
- 🔍 **Smart Validation**: Validates Git repository, commit existence, and input arguments
- 🛠️ **CLI Options**: Support for `--help`, `--version`, and custom output directories
- 🖥️ **Cross-Platform**: Build binaries for Windows, Linux, and macOS using [pkg](https://www.npmjs.com/package/pkg)

## Installation

### Option 1: Clone and Install (for development)

```bash
git clone https://github.com/Santa77/GitDiffToZip.git
cd GitDiffToZip
npm install
```

### Option 2: Use Pre-built Binaries

Download the latest binaries from the [Releases](https://github.com/Santa77/GitDiffToZip/releases) page.

## Usage

### Basic Usage

```bash
gdtz <commitFrom> <commitTo>
```

### Examples

```bash
# Compare two specific commits
gdtz fd85df5d fe818bd8

# Compare HEAD with previous commit
gdtz HEAD~1 HEAD

# Specify custom output directory
gdtz fd85df5d fe818bd8 --output ./archives

# Show help
gdtz --help

# Show version
gdtz --version
```

### Output

The tool generates a ZIP file named in the format:

```
changes_<timestamp>_<commitFrom>_<commitTo>.zip
```

Example: `changes_20250127170910_fd85df5d_fe818bd8.zip`

### Options

- `-o, --output <path>` - Specify output directory (default: current directory)
- `-h, --help` - Show help message
- `-v, --version` - Show version number

## Building Executables

Use [pkg](https://www.npmjs.com/package/pkg) to create standalone binaries:

```bash
npm run build:win    # Builds build/gdtz.exe
npm run build:linux  # Builds build/gdtz-linux
npm run build:mac    # Builds build/gdtz-macos
npm run build:all    # Builds all platforms
```

All binaries will be located in the `build/` folder.

## Development

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Code Quality

```bash
npm run lint        # Check code with ESLint
npm run lint:fix    # Fix ESLint issues automatically
npm run format      # Format code with Prettier
```

## CI/CD (GitHub Actions)

Push a new version tag to trigger an automated build on GitHub Actions:

```bash
git tag v1.0.0
git push origin v1.0.0
```

A **GitHub Release** will be created automatically with the built binaries attached.

## Requirements

- Node.js >= 18.0.0
- Git must be installed and accessible in PATH
- Must be run from within a Git repository

## Troubleshooting

### "Not a Git repository" error

Make sure you're running the command from within a Git repository:

```bash
cd /path/to/your/git/repo
gdtz <commitFrom> <commitTo>
```

### "Commit does not exist" error

Verify that both commit references are valid:

```bash
git log --oneline  # View available commits
```

### Failed to extract files

Some files might be deleted in the target commit. The tool will warn about these but continue processing other files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues & Feedback

If you encounter any issues or have suggestions, please open an [issue](https://github.com/Santa77/GitDiffToZip/issues) on GitHub.
