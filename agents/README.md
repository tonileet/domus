# Test Agent System

A comprehensive multi-agent testing system for automated code quality, unit testing, and end-to-end testing.

## Overview

This system consists of six specialized agents that work together to ensure code quality:

### 1. Test Manager
**Location:** [test-manager/src/testManager.js](test-manager/src/testManager.js)

The orchestrator that coordinates all other agents. It can run agents sequentially or in parallel and collects results from all agents.

### 2. Linter Agent
**Location:** [linter/src/linter.js](linter/src/linter.js)

Checks source code for:
- ESLint errors and warnings
- Code smells (deeply nested code, long files)
- Best practices violations
- TODO/FIXME comments
- Console.log statements

### 3. Unit Test Agent
**Location:** [unit-tester/src/unitTester.js](unit-tester/src/unitTester.js)

Creates and runs unit tests using Vitest:
- Analyzes codebase to identify testable modules
- Generates test files for utilities, services, and hooks
- Runs tests with coverage reporting
- Uses React Testing Library for component tests

### 4. E2E Test Agent
**Location:** [e2e-tester/src/e2eTester.js](e2e-tester/src/e2eTester.js)

Creates and runs end-to-end tests using Playwright:
- Analyzes application routes and pages
- Generates tests for each route
- Tests navigation flows
- Tests forms and user interactions
- Checks for console errors

### 5. Reporter Agent
**Location:** [reporter/src/reporter.js](reporter/src/reporter.js)

Generates comprehensive markdown test reports:
- Executive summary with pass/fail status
- Detailed results from each agent
- Statistics and metrics
- Prioritized recommendations

### 6. Coder Agent
**Location:** [coder/src/coder.js](coder/src/coder.js)

Analyzes test results and provides improvement suggestions:
- Prioritizes issues (high, medium, low)
- Groups issues by category
- Generates actionable improvement plans
- Provides implementation guidelines

## Installation

Dependencies are already installed. If you need to reinstall:

\`\`\`bash
npm install --save-dev @playwright/test vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
\`\`\`

Install Playwright browsers:

\`\`\`bash
npx playwright install
\`\`\`

## Usage

### Run All Agents

\`\`\`bash
npm run test:agents
\`\`\`

Or directly:

\`\`\`bash
node agents/index.js
\`\`\`

### Run Specific Agents

\`\`\`bash
# Skip E2E tests
npm run test:agents -- --no-e2e

# Only run linter
npm run test:agents -- --no-unittest --no-e2e

# Run agents in parallel (faster)
npm run test:agents -- --parallel
\`\`\`

### Custom Output Directory

\`\`\`bash
npm run test:agents -- --output ./custom-results
\`\`\`

### Individual Agent Usage

You can also import and use agents individually:

\`\`\`javascript
import Linter from './agents/linter/src/linter.js';

const linter = new Linter({
  projectRoot: '/path/to/project',
  outputDir: './results',
  fix: false
});

const results = await linter.run();
\`\`\`

## Configuration

Each agent accepts a configuration object:

### Test Manager

\`\`\`javascript
{
  projectRoot: './path',      // Project root directory
  outputDir: './results',     // Output directory for results
  agents: {                   // Enable/disable agents
    linter: true,
    unittest: true,
    e2e: true
  },
  parallel: false             // Run agents in parallel
}
\`\`\`

### Linter

\`\`\`javascript
{
  projectRoot: './path',
  outputDir: './results',
  srcDir: 'src',              // Source directory to lint
  fix: false                  // Auto-fix issues
}
\`\`\`

### Unit Tester

\`\`\`javascript
{
  projectRoot: './path',
  outputDir: './results',
  testsDir: './src/__tests__', // Where to create tests
  srcDir: 'src'
}
\`\`\`

### E2E Tester

\`\`\`javascript
{
  projectRoot: './path',
  outputDir: './results',
  testsDir: './e2e-tests',    // Where to create tests
  baseURL: 'http://localhost:5173'
}
\`\`\`

### Reporter

\`\`\`javascript
{
  outputDir: './results',
  reportFile: 'TEST_REPORT.md'
}
\`\`\`

### Coder

\`\`\`javascript
{
  projectRoot: './path',
  outputDir: './results',
  autoFix: false              // Automatically fix issues (future)
}
\`\`\`

## Output Files

After running, the following files are generated in the output directory:

- **TEST_REPORT.md** - Comprehensive test report with all results
- **ACTION_PLAN.md** - Prioritized improvement plan from Coder agent
- **lint-results.json** - Raw linter results
- **unit-test-results.json** - Raw unit test results
- **e2e-results.json** - Raw E2E test results
- **coder-analysis.json** - Raw coder analysis

## Generated Test Files

The agents will create:

- **vitest.config.js** - Vitest configuration
- **playwright.config.js** - Playwright configuration
- **src/__tests__/setup.js** - Test setup file
- **src/__tests__/*.test.js** - Unit test files
- **e2e-tests/*.spec.js** - E2E test files

## Workflow

1. **Test Manager** starts and coordinates agents
2. **Linter** analyzes code quality and finds issues
3. **Unit Tester** generates and runs unit tests
4. **E2E Tester** generates and runs end-to-end tests
5. **Reporter** creates comprehensive markdown report
6. **Coder** analyzes all results and creates action plan

## Example Output

After running, you'll see:

\`\`\`
🚀 Test Manager: Starting test suite...

📋 Running linter agent...
🔍 Linter: Starting code quality checks...
✅ Linter: Analysis completed

📋 Running unittest agent...
🧪 Unit Tester: Starting unit test generation...
✅ Unit Tester: Tests completed

📋 Running e2e agent...
🎭 E2E Tester: Starting end-to-end tests...
✅ E2E Tester: Tests completed

📊 Generating final test report...
✅ Final report generated

🔧 Running coder agent to analyze improvements...
✅ Coder agent completed analysis

✅ Test Manager: All tests completed!
\`\`\`

## CI/CD Integration

Add to your CI/CD pipeline:

\`\`\`yaml
# GitHub Actions example
- name: Run Test Agents
  run: npm run test:agents

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
\`\`\`

## Customization

### Adding Custom Checks

You can extend any agent by modifying its source file. For example, to add custom linting rules:

\`\`\`javascript
// In agents/linter/src/linter.js
async checkCustomRules(content, filePath) {
  // Add your custom checks here
}
\`\`\`

### Creating Custom Agents

Follow the same pattern as existing agents:

1. Create a new directory under `agents/`
2. Create an agent class with a `run()` method
3. Register it in the Test Manager

## Troubleshooting

### Playwright Installation Issues

\`\`\`bash
npx playwright install --with-deps
\`\`\`

### ESLint Errors

Make sure your ESLint configuration is valid:

\`\`\`bash
npx eslint --print-config src/App.jsx
\`\`\`

### Test Generation Issues

The agents will skip modules they can't analyze and continue. Check the console output for warnings.

## Best Practices

1. **Run regularly** - Integrate into your development workflow
2. **Review reports** - Don't ignore the generated reports
3. **Fix high-priority issues first** - Use the ACTION_PLAN.md
4. **Customize for your needs** - Adjust thresholds and rules
5. **Keep tests updated** - Review generated tests and improve them

## Architecture

\`\`\`
agents/
├── index.js                 # Main entry point
├── test-manager/            # Orchestrator
│   └── src/testManager.js
├── linter/                  # Code quality checker
│   └── src/linter.js
├── unit-tester/             # Unit test generator
│   └── src/unitTester.js
├── e2e-tester/              # E2E test generator
│   └── src/e2eTester.js
├── reporter/                # Report generator
│   └── src/reporter.js
└── coder/                   # Improvement analyzer
    └── src/coder.js
\`\`\`

## Future Enhancements

- Auto-fixing capabilities in Coder agent
- Performance testing agent
- Accessibility testing agent
- Visual regression testing
- Security scanning agent
- Dependency audit agent

## Contributing

To add features or fix bugs:

1. Modify the relevant agent file
2. Test your changes
3. Update this README
4. Submit your changes

## License

Same as the main project.
