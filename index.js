#!/usr/bin/env node

/**
 * gdtz - Node.js utility to create a ZIP archive of changed files
 * between two Git commits.
 *
 * Usage:
 *   gdtz <commitFrom> <commitTo> [options]
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const AdmZip = require("adm-zip");

const VERSION = "0.0.2";

function printUsage() {
  console.log(`
gdtz - Git Diff to Zip v${VERSION}

Usage:
  gdtz <commitFrom> <commitTo> [options]

Options:
  -o, --output <path>    Specify output directory (default: current directory)
  -h, --help             Show this help message
  -v, --version          Show version number

Examples:
  gdtz fd85df5d fe818bd8
  gdtz fd85df5d fe818bd8 --output ./archives
  gdtz HEAD~1 HEAD

Repository: https://github.com/Santa77/GitDiffToZip
`);
}

function printVersion() {
  console.log(`gdtz v${VERSION}`);
}

// Check if we're in a Git repository
function isGitRepository() {
  try {
    execSync("git rev-parse --git-dir", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Validate that a commit reference exists
function commitExists(commitRef) {
  try {
    execSync(`git cat-file -t ${commitRef}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Parse command line arguments
function parseArguments(args) {
  const parsed = {
    commitFrom: null,
    commitTo: null,
    outputDir: process.cwd(),
    help: false,
    version: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      parsed.help = true;
    } else if (arg === "-v" || arg === "--version") {
      parsed.version = true;
    } else if (arg === "-o" || arg === "--output") {
      if (i + 1 < args.length) {
        parsed.outputDir = args[++i];
      } else {
        console.error("Error: --output requires a path argument");
        process.exit(1);
      }
    } else if (!arg.startsWith("-")) {
      if (!parsed.commitFrom) {
        parsed.commitFrom = arg;
      } else if (!parsed.commitTo) {
        parsed.commitTo = arg;
      }
    }
  }

  return parsed;
}

// 1) Parse arguments
const args = parseArguments(process.argv.slice(2));

if (args.help) {
  printUsage();
  process.exit(0);
}

if (args.version) {
  printVersion();
  process.exit(0);
}

const { commitFrom, commitTo, outputDir } = args;

if (!commitFrom || !commitTo) {
  console.error("Error: Both <commitFrom> and <commitTo> arguments are required\n");
  printUsage();
  process.exit(1);
}

// Validate we're in a Git repository
if (!isGitRepository()) {
  console.error(
    "Error: Not a Git repository. Please run this command from within a Git repository."
  );
  process.exit(1);
}

// Validate commits exist
if (!commitExists(commitFrom)) {
  console.error(`Error: Commit '${commitFrom}' does not exist`);
  process.exit(1);
}

if (!commitExists(commitTo)) {
  console.error(`Error: Commit '${commitTo}' does not exist`);
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  try {
    fs.mkdirSync(outputDir, { recursive: true });
  } catch (err) {
    console.error(`Error: Cannot create output directory '${outputDir}': ${err.message}`);
    process.exit(1);
  }
}

// 2) Create timestamp in format yyyyMMddHHmmss
function getTimestamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}
const timeStamp = getTimestamp();

// Output ZIP archive name
const outputZipName = `changes_${timeStamp}_${commitFrom}_${commitTo}.zip`;
const outputZip = path.join(outputDir, outputZipName);

console.log(`Creating ZIP file: ${outputZipName}`);
if (outputDir !== process.cwd()) {
  console.log(`Output directory: ${outputDir}`);
}

// 3) Get list of changed files
let changedFiles;
try {
  changedFiles = execSync(`git diff --name-only ${commitFrom} ${commitTo}`, { encoding: "utf-8" })
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
} catch (err) {
  console.error(`Error: Failed to get list of changed files: ${err.message}`);
  process.exit(1);
}

if (changedFiles.length === 0) {
  console.log(`No changed files between ${commitFrom} and ${commitTo}.`);
  process.exit(0);
}

console.log(`Found ${changedFiles.length} changed file(s)`);

// 4) Create temporary directory for extracted files
const tmpDir = path.join(os.tmpdir(), `gdtz_${timeStamp}_${process.pid}`);
try {
  fs.mkdirSync(tmpDir, { recursive: true });
} catch (err) {
  console.error(`Error: Cannot create temporary directory: ${err.message}`);
  process.exit(1);
}

console.log(`Extracting files...`);

// 5) For each changed file, download content from commitTo (git show)
let successCount = 0;
let failCount = 0;

changedFiles.forEach((file) => {
  const destFile = path.join(tmpDir, file);

  // Create subdirectories
  const destDir = path.dirname(destFile);
  fs.mkdirSync(destDir, { recursive: true });

  try {
    // Read binary content from `git show commitTo:file`
    const data = execSync(`git show ${commitTo}:${file}`, { encoding: "buffer" });
    // Write to file
    fs.writeFileSync(destFile, data);
    successCount++;
  } catch (err) {
    console.warn(
      `[WARNING] Failed to extract file '${file}' from commit ${commitTo}: ${err.message}`
    );
    failCount++;
  }
});

if (successCount > 0) {
  console.log(`Successfully extracted ${successCount} file(s)`);
}
if (failCount > 0) {
  console.warn(`Failed to extract ${failCount} file(s)`);
}

// 6) Create ZIP archive (adm-zip)
console.log("Creating ZIP archive...");
try {
  const zip = new AdmZip();
  zip.addLocalFolder(tmpDir); // add entire temporary directory
  zip.writeZip(outputZip);
} catch (err) {
  console.error(`Error: Failed to create ZIP archive: ${err.message}`);
  // Clean up temporary directory before exit
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (cleanupErr) {
    // Ignore cleanup errors on failure
  }
  process.exit(1);
}

// 7) Delete temporary directory
try {
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch (err) {
  console.warn(`Warning: Failed to remove temporary directory: ${err.message}`);
}

// Done
console.log(`\nSuccess! Created archive: ${outputZip}`);
