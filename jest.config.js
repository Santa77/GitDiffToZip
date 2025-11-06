module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: ["index.js"],
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
