const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

describe("gdtz CLI", () => {
  const cliPath = path.join(__dirname, "..", "index.js");

  describe("Help and Version", () => {
    test("should display help message with --help flag", () => {
      const output = execSync(`node ${cliPath} --help`, { encoding: "utf-8" });
      expect(output).toContain("Usage:");
      expect(output).toContain("gdtz");
      expect(output).toContain("Options:");
    });

    test("should display help message with -h flag", () => {
      const output = execSync(`node ${cliPath} -h`, { encoding: "utf-8" });
      expect(output).toContain("Usage:");
      expect(output).toContain("gdtz");
    });

    test("should display version with --version flag", () => {
      const output = execSync(`node ${cliPath} --version`, { encoding: "utf-8" });
      expect(output).toContain("gdtz v");
      expect(output).toMatch(/\d+\.\d+\.\d+/);
    });

    test("should display version with -v flag", () => {
      const output = execSync(`node ${cliPath} -v`, { encoding: "utf-8" });
      expect(output).toContain("gdtz v");
    });
  });

  describe("Error Handling", () => {
    test("should show error when no arguments provided", () => {
      expect(() => {
        execSync(`node ${cliPath}`, { encoding: "utf-8", stdio: "pipe" });
      }).toThrow();

      try {
        execSync(`node ${cliPath}`, { encoding: "utf-8", stdio: "pipe" });
      } catch (error) {
        expect(error.stderr || error.stdout).toContain("Error:");
        expect(error.stderr || error.stdout).toContain("required");
      }
    });

    test("should show error when only one commit provided", () => {
      expect(() => {
        execSync(`node ${cliPath} HEAD`, { encoding: "utf-8", stdio: "pipe" });
      }).toThrow();

      try {
        execSync(`node ${cliPath} HEAD`, { encoding: "utf-8", stdio: "pipe" });
      } catch (error) {
        expect(error.stderr || error.stdout).toContain("Error:");
        expect(error.stderr || error.stdout).toContain("required");
      }
    });

    test("should show error when not in a Git repository", () => {
      const os = require("os");
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gdtz-test-"));
      let caughtError = false;
      try {
        execSync(`node ${cliPath} HEAD~1 HEAD`, {
          encoding: "utf-8",
          cwd: tempDir,
          stdio: "pipe",
          env: { ...process.env, GIT_DIR: "" }
        });
      } catch (error) {
        caughtError = true;
        expect(error.stderr || error.stdout).toContain("Not a Git repository");
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      expect(caughtError).toBe(true);
    });

    test("should show error for invalid commit reference", () => {
      expect(() => {
        execSync(`node ${cliPath} invalid-commit-123 HEAD`, {
          encoding: "utf-8",
          stdio: "pipe"
        });
      }).toThrow();

      try {
        execSync(`node ${cliPath} invalid-commit-123 HEAD`, {
          encoding: "utf-8",
          stdio: "pipe"
        });
      } catch (error) {
        expect(error.stderr || error.stdout).toContain("does not exist");
      }
    });
  });

  describe("Functionality", () => {
    test("should create ZIP file for valid commits", () => {
      // Get the last two commits
      const commits = execSync("git log -2 --format=%H", { encoding: "utf-8" })
        .split("\n")
        .filter((c) => c);

      if (commits.length < 2) {
        console.log("Skipping test: Not enough commits in repository");
        return;
      }

      const [commitTo, commitFrom] = commits;

      try {
        const output = execSync(`node ${cliPath} ${commitFrom} ${commitTo}`, {
          encoding: "utf-8"
        });

        expect(output).toContain("Creating ZIP file:");
        expect(output).toContain("Success!");

        // Check if ZIP file was created
        const zipPattern = new RegExp(`changes_\\d{14}_${commitFrom}_${commitTo}\\.zip`);
        const files = fs.readdirSync(process.cwd());
        const zipFile = files.find((f) => zipPattern.test(f));

        expect(zipFile).toBeDefined();

        // Cleanup
        if (zipFile) {
          fs.unlinkSync(path.join(process.cwd(), zipFile));
        }
      } catch (error) {
        console.error("Error:", error.message);
        console.error("Stdout:", error.stdout);
        console.error("Stderr:", error.stderr);
        throw error;
      }
    });

    test("should handle --output option", () => {
      const commits = execSync("git log -2 --format=%H", { encoding: "utf-8" })
        .split("\n")
        .filter((c) => c);

      if (commits.length < 2) {
        console.log("Skipping test: Not enough commits in repository");
        return;
      }

      const [commitTo, commitFrom] = commits;
      const outputDir = fs.mkdtempSync(path.join(__dirname, "output-"));

      try {
        const output = execSync(`node ${cliPath} ${commitFrom} ${commitTo} --output ${outputDir}`, {
          encoding: "utf-8"
        });

        expect(output).toContain("Creating ZIP file:");
        expect(output).toContain("Success!");

        // Check if ZIP file was created in output directory
        const zipPattern = new RegExp(`changes_\\d{14}_${commitFrom}_${commitTo}\\.zip`);
        const files = fs.readdirSync(outputDir);
        const zipFile = files.find((f) => zipPattern.test(f));

        expect(zipFile).toBeDefined();
      } finally {
        // Cleanup
        fs.rmSync(outputDir, { recursive: true, force: true });
      }
    });
  });
});
