/**
 * Example configuration for the Test Agent System
 *
 * Copy this file to config.js and customize for your needs
 */

export default {
  // Project root directory
  projectRoot: process.cwd(),

  // Output directory for test results
  outputDir: './test-results',

  // Enable/disable specific agents
  agents: {
    linter: true,
    unittest: true,
    e2e: true
  },

  // Run agents in parallel (faster but more resource intensive)
  parallel: false,

  // Linter-specific configuration
  linter: {
    srcDir: 'src',
    fix: false,  // Set to true to auto-fix issues
    excludePatterns: [
      'node_modules',
      'dist',
      'build',
      '*.config.js'
    ]
  },

  // Unit test configuration
  unittest: {
    testsDir: './src/__tests__',
    coverage: {
      threshold: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    excludeFromTests: [
      'index.js',
      '*.config.js',
      '*.test.js',
      '*.spec.js'
    ]
  },

  // E2E test configuration
  e2e: {
    testsDir: './e2e-tests',
    baseURL: 'http://localhost:5173',
    browsers: ['chromium'], // Can add 'firefox', 'webkit'
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  // Reporter configuration
  reporter: {
    reportFile: 'TEST_REPORT.md',
    format: 'markdown',  // Future: could support JSON, HTML
    includeTimestamps: true,
    maxIssuesPerSection: 20
  },

  // Coder agent configuration
  coder: {
    autoFix: false,  // Future: enable auto-fixing
    generatePatches: false,  // Future: generate git patches
    priorityRules: {
      // Define what constitutes high/medium/low priority
      high: ['errors', 'failing-tests', 'security'],
      medium: ['warnings', 'code-smells', 'coverage'],
      low: ['suggestions', 'style', 'documentation']
    }
  }
};
