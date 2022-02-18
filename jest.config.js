module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ["src/**/*.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/.jest/setEnvVars.js"],
};
