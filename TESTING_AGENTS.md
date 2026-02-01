# Testing Agent System Documentation

## Overview

Your project now has a comprehensive multi-agent testing system that automates code quality checks, unit testing, and end-to-end testing.

## Quick Start

1. **Install Playwright browsers** (first time only):
   \`\`\`bash
   npx playwright install
   \`\`\`

2. **Run all test agents**:
   \`\`\`bash
   npm run test:agents
   \`\`\`

3. **Review results** in the `test-results/` directory:
   - [TEST_REPORT.md](test-results/TEST_REPORT.md) - Comprehensive test report
   - [ACTION_PLAN.md](test-results/ACTION_PLAN.md) - Prioritized improvement plan

## The Six Agents

### 1. 🎯 Test Manager
**Coordinates all test agents**

The orchestrator that runs all other agents sequentially or in parallel, collects results, and manages the workflow.

**Key Features:**
- Runs agents in sequence or parallel
- Collects and aggregates results
- Provides summary statistics
- Handles errors gracefully

### 2. 🔍 Linter Agent
**Checks code quality and finds improvements**

Analyzes your source code for quality issues, code smells, and best practices violations.

**What it checks:**
- ESLint errors and warnings
- Code complexity (nested code, long functions)
- Console.log statements (debugging code)
- TODO/FIXME comments
- React-specific best practices
- Inline styles usage
- Missing keys in lists

**Output:** `test-results/lint-results.json`

### 3. 🧪 Unit Test Agent
**Creates and runs unit tests**

Automatically analyzes your codebase, generates unit tests for testable modules, and runs them with coverage reporting.

**What it tests:**
- Utility functions
- Service layer (database operations)
- Custom React hooks
- Business logic

**Generated files:**
- `vitest.config.js` - Vitest configuration
- `src/__tests__/setup.js` - Test environment setup
- `src/__tests__/*.test.js` - Generated unit tests

**Output:** `test-results/unit-test-results.json`

### 4. 🎭 E2E Test Agent
**Creates end-to-end tests with Playwright**

Analyzes your application structure and generates Playwright tests for user flows and interactions.

**What it tests:**
- Page loading for each route
- Navigation between pages
- Form submission and validation
- Console errors
- Basic functionality

**Generated files:**
- `playwright.config.js` - Playwright configuration
- `e2e-tests/*.spec.js` - Generated E2E tests

**Output:** `test-results/e2e-results.json`

### 5. 📊 Reporter Agent
**Generates comprehensive markdown reports**

Takes results from all agents and creates human-readable markdown reports with statistics and recommendations.

**Report includes:**
- Executive summary (pass/fail status)
- Detailed results from each agent
- Statistics and metrics
- Issue categorization
- Prioritized recommendations

**Output:** `test-results/TEST_REPORT.md`

### 6. 🔧 Coder Agent
**Analyzes results and creates improvement plans**

Processes test results, prioritizes issues, and generates actionable improvement plans.

**Provides:**
- Issue prioritization (high/medium/low)
- Category grouping (code-quality, testing, refactoring)
- Specific action items
- Implementation guidelines
- Best practices recommendations

**Output:**
- `test-results/ACTION_PLAN.md`
- `test-results/coder-analysis.json`

## Available Commands

### Run All Agents
\`\`\`bash
npm run test:agents
\`\`\`

### Run Agents in Parallel (Faster)
\`\`\`bash
npm run test:agents:parallel
\`\`\`

### Run Specific Agents
\`\`\`bash
# Only linter
npm run test:agents:lint

# Only unit tests
npm run test:agents:unit

# Skip E2E tests
npm run test:agents -- --no-e2e

# Skip unit tests
npm run test:agents -- --no-unittest
\`\`\`

### Run Tests Manually
\`\`\`bash
# Unit tests with Vitest
npm test

# Unit tests with UI
npm run test:ui

# Unit tests with coverage
npm run test:coverage

# E2E tests with Playwright
npm run test:e2e
\`\`\`

### Custom Output Directory
\`\`\`bash
npm run test:agents -- --output ./custom-results
\`\`\`

## Workflow

### Typical Development Workflow

1. **Write code** for your feature
2. **Run linter** to catch issues early:
   \`\`\`bash
   npm run test:agents:lint
   \`\`\`
3. **Fix linting issues** identified
4. **Run all agents** before committing:
   \`\`\`bash
   npm run test:agents
   \`\`\`
5. **Review reports** in `test-results/`
6. **Follow action plan** to address issues
7. **Commit** tested, lint-free code

### CI/CD Integration

Add to your GitHub Actions workflow:

\`\`\`yaml
- name: Install Dependencies
  run: npm install

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run Test Agents
  run: npm run test:agents

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
\`\`\`

## Generated Files Structure

After running the agents:

\`\`\`
domus/
├── test-results/              # All test results
│   ├── TEST_REPORT.md        # Main report (read this first!)
│   ├── ACTION_PLAN.md        # Improvement plan
│   ├── lint-results.json     # Raw lint data
│   ├── unit-test-results.json
│   ├── e2e-results.json
│   └── coder-analysis.json
├── e2e-tests/                 # Generated E2E tests
│   ├── home.spec.js
│   ├── dashboard.spec.js
│   ├── navigation.spec.js
│   └── forms.spec.js
├── src/__tests__/             # Generated unit tests
│   ├── setup.js
│   ├── idGenerator.test.js
│   ├── propertyService.test.js
│   └── ...
├── vitest.config.js          # Vitest configuration
└── playwright.config.js      # Playwright configuration
\`\`\`

## Understanding Reports

### TEST_REPORT.md Structure

1. **Executive Summary**
   - Overall pass/fail status
   - Issues count per agent
   - Quick overview

2. **Code Linting Results**
   - Errors and warnings
   - Code smells found
   - Suggestions for improvement

3. **Unit Test Results**
   - Test counts (passed/failed)
   - Coverage statistics
   - Failing tests details

4. **E2E Test Results**
   - Test execution results
   - Issues found during E2E tests
   - Browser compatibility

5. **Improvement Recommendations**
   - High priority (fix now)
   - Medium priority (fix soon)
   - Low priority (nice to have)

### ACTION_PLAN.md Structure

1. **Overview**
   - Total suggestions
   - Priority breakdown

2. **High Priority Actions**
   - Critical issues affecting stability
   - Affected files
   - Specific actions needed

3. **Medium Priority Actions**
   - Code quality improvements
   - Test coverage gaps

4. **Low Priority Actions**
   - Nice-to-have improvements
   - Long-term code health

5. **Implementation Guidelines**
   - How to approach fixes
   - Best practices

## Customization

### Configuration

Copy and customize the example config:

\`\`\`bash
cp agents/config.example.js agents/config.js
\`\`\`

Edit `agents/config.js` to:
- Enable/disable specific agents
- Set custom thresholds
- Configure output formats
- Set up auto-fix (future)

### Extending Agents

Each agent can be extended. For example, to add custom linting rules:

\`\`\`javascript
// agents/linter/src/linter.js
async checkCustomRules(content, filePath) {
  // Add your custom checks
  if (content.includes('eval(')) {
    this.lintResults.issues.push({
      type: 'error',
      message: 'eval() is dangerous',
      file: filePath,
      severity: 'error'
    });
  }
}
\`\`\`

## Best Practices

1. **Run regularly** - Don't let issues accumulate
2. **Start small** - Fix high-priority issues first
3. **Review generated tests** - They're starting points, improve them
4. **Commit often** - Small commits are easier to review
5. **Track coverage** - Aim for 80%+ code coverage
6. **Read reports** - They contain valuable insights

## Troubleshooting

### Common Issues

**Problem:** Playwright installation fails
\`\`\`bash
# Solution: Install with dependencies
npx playwright install --with-deps
\`\`\`

**Problem:** ESLint errors
\`\`\`bash
# Solution: Verify ESLint config
npx eslint --print-config src/App.jsx
\`\`\`

**Problem:** Too many issues on first run
\`\`\`bash
# Solution: Start with linter only
npm run test:agents:lint
\`\`\`

**Problem:** Tests fail in CI but pass locally
\`\`\`bash
# Solution: Ensure consistent environment
# Check Node version, dependencies, and browsers
\`\`\`

## Project Structure

\`\`\`
agents/
├── README.md                 # Full documentation
├── QUICKSTART.md             # Quick start guide
├── index.js                  # Main entry point
├── config.example.js         # Example configuration
├── test-manager/             # Orchestrator agent
│   └── src/testManager.js
├── linter/                   # Code quality agent
│   └── src/linter.js
├── unit-tester/              # Unit test agent
│   └── src/unitTester.js
├── e2e-tester/               # E2E test agent
│   └── src/e2eTester.js
├── reporter/                 # Report generator
│   └── src/reporter.js
└── coder/                    # Improvement analyzer
    └── src/coder.js
\`\`\`

## Additional Documentation

- **[agents/README.md](agents/README.md)** - Full technical documentation
- **[agents/QUICKSTART.md](agents/QUICKSTART.md)** - Quick start guide
- **[agents/config.example.js](agents/config.example.js)** - Configuration options

## Future Enhancements

Planned features:
- Auto-fixing capabilities
- Performance testing agent
- Accessibility testing agent
- Visual regression testing
- Security scanning agent
- Dependency audit agent
- Integration with Claude Code for AI-powered fixes

## Support

For questions or issues:
1. Check the [full documentation](agents/README.md)
2. Review [QUICKSTART.md](agents/QUICKSTART.md)
3. Look at generated test examples
4. Read the ACTION_PLAN.md for guidance

---

**Ready to test?** Run: `npm run test:agents`

🚀 Happy testing!
