# Git Diff To Zip : gdtz

A lightweight **Git Diff to Zip** tool that quickly bundles only the **changed files** between two commits into a single **ZIP**. Perfect for seamless updates or partial deployments.

## Features

- **Exact Versions**: Uses `git show` to fetch the specific file content from your target commit.
- **Binary & Text Friendly**: Safely handles binary files as well as plain text.
- **Timestamped Archive**: Automatically names the resulting ZIP with both commit hashes and a date/time stamp.
- **Cross-Platform**: Build binaries for Windows, Linux, and macOS using [pkg](https://www.npmjs.com/package/pkg).

## Installation

1. **Clone** this repository:
   ```bash
   git clone https://github.com/your-username/gdtz.git
   ```
2. **Install** dependencies:
   ```bash
   cd gdtz
   npm install
   ```

## Usage (Node.js)

```bash
node index.js <commitFrom> <commitTo>
```

For example:

```bash
node index.js fd85df5d fe818bd8
```

This generates a ZIP named like:

```
changes_fd85df5d_fe818bd8_20250127170910.zip
```

## Building Executables

Use [pkg](https://www.npmjs.com/package/pkg) to create standalone binaries:

```bash
npm run build:win   # Builds gdtz-win.exe
npm run build:linux # Builds gdtz-linux
npm run build:mac   # Builds gdtz-macos
```

All binaries will be located in the `build/` folder.

## CI/CD (GitHub Actions)

- Push a **new tag** (e.g., `v1.0.0`) to trigger an automated build on GitHub Actions:
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```
- A **GitHub Release** is created/updated with the built binaries attached.

> **Questions or feedback?** Feel free to open an [issue](https://github.com/your-username/gdtz/issues). Contributions are welcome!

