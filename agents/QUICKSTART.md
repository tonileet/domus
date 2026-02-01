# Quick Start Guide - Test Agent System

Get up and running with the test agent system in 5 minutes.

## Prerequisites

- Node.js installed
- Project dependencies installed (`npm install`)

## Step 1: Install Playwright Browsers

First time setup only:

\`\`\`bash
npx playwright install
\`\`\`

This downloads the necessary browser binaries for E2E testing.

## Step 2: Run the Test Agents

Run all agents with a single command:

\`\`\`bash
npm run test:agents
\`\`\`

This will:
1. ✅ Lint your code for quality issues
2. ✅ Generate and run unit tests
3. ✅ Generate and run E2E tests
4. ✅ Create a comprehensive test report
5. ✅ Generate an action plan for improvements

## Step 3: Review the Results

After the agents finish, check the [test-results](../test-results/) directory:

### Main Reports

1. **TEST_REPORT.md** - Start here! Comprehensive overview of all test results
   - Executive summary with pass/fail status
   - Detailed results from each agent
   - Statistics and metrics

2. **ACTION_PLAN.md** - Prioritized improvement plan
   - High priority issues to fix immediately
   - Medium priority improvements
   - Low priority nice-to-haves
   - Implementation guidelines

### Raw Data (JSON)

- `lint-results.json` - All linting issues
- `unit-test-results.json` - Unit test results
- `e2e-results.json` - E2E test results
- `coder-analysis.json` - Coder agent analysis

## Step 4: Fix Issues

Follow the action plan:

1. Start with **high priority** items in ACTION_PLAN.md
2. Run tests after each fix: `npm run test:agents`
3. Repeat until all critical issues are resolved

## Common Commands

\`\`\`bash
# Run all agents
npm run test:agents

# Run agents in parallel (faster)
npm run test:agents:parallel

# Run only linter
npm run test:agents:lint

# Run only unit tests
npm run test:agents:unit

# Skip E2E tests (fastest)
npm run test:agents -- --no-e2e

# Custom output directory
npm run test:agents -- --output ./custom-results
\`\`\`

## Understanding the Output

### Console Output

While running, you'll see real-time progress:

\`\`\`
🚀 Test Manager: Starting test suite...

📋 Running linter agent...
Found 5 issues (2 errors, 3 warnings)

📋 Running unittest agent...
Found 8 modules to test
Generated 8 test files

📋 Running e2e agent...
Found 6 routes
Generated 8 test files

✅ Test Manager: All tests completed!
\`\`\`

### Exit Codes

- `0` - All tests passed
- `1` - Some tests failed (check the reports)

## Tips

### First Run

The first run will:
- Generate test files in `src/__tests__/`
- Generate E2E tests in `e2e-tests/`
- Create config files (`vitest.config.js`, `playwright.config.js`)

These files are starting points - review and improve them!

### Continuous Testing

Add to your workflow:

\`\`\`bash
# Before committing
npm run test:agents:lint

# Before pushing
npm run test:agents

# In CI/CD
npm run test:agents -- --parallel
\`\`\`

### Customization

Want to customize? See [config.example.js](config.example.js) for all options.

\`\`\`bash
cp agents/config.example.js agents/config.js
# Edit agents/config.js with your preferences
\`\`\`

## Example Workflow

1. **Write code** - Develop your feature
2. **Run agents** - `npm run test:agents`
3. **Fix issues** - Address high-priority items
4. **Review tests** - Improve generated tests
5. **Commit** - Code is now tested and lint-free!

## Troubleshooting

### "Cannot find module" errors

Make sure you've installed dependencies:

\`\`\`bash
npm install
\`\`\`

### Playwright errors

Install browsers:

\`\`\`bash
npx playwright install --with-deps
\`\`\`

### ESLint errors

Check your ESLint config is valid:

\`\`\`bash
npx eslint --print-config src/App.jsx
\`\`\`

### Too many issues?

Start with just the linter:

\`\`\`bash
npm run test:agents:lint
\`\`\`

Fix linting issues first, then add unit and E2E tests.

## Next Steps

1. ✅ Run the agents regularly (daily/before commits)
2. ✅ Review and improve generated tests
3. ✅ Add custom test cases
4. ✅ Integrate into CI/CD pipeline
5. ✅ Keep code coverage above 80%

## Need Help?

- Check the [full documentation](README.md)
- Review example configuration: [config.example.js](config.example.js)
- Look at generated tests for examples
- Read the ACTION_PLAN.md for specific guidance

## What Each Agent Does

### 🔍 Linter
- Runs ESLint on your code
- Checks for code smells
- Finds console.logs, TODOs
- Detects complex/nested code

### 🧪 Unit Tester
- Finds testable modules (utils, services, hooks)
- Generates test files
- Runs tests with coverage
- Reports failing tests

### 🎭 E2E Tester
- Analyzes your app routes
- Generates page tests
- Tests navigation
- Tests forms
- Checks for console errors

### 📊 Reporter
- Collects all results
- Creates markdown report
- Provides statistics
- Suggests improvements

### 🔧 Coder
- Analyzes test results
- Prioritizes issues
- Creates action plan
- Suggests fixes

---

Ready to start? Run:

\`\`\`bash
npm run test:agents
\`\`\`

🚀 Happy testing!
