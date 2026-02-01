import { promises as fs } from 'fs';
import path from 'path';

/**
 * Coder Agent
 * Analyzes test results and generates improvement suggestions
 */
class Coder {
  constructor(config = {}) {
    this.config = {
      projectRoot: config.projectRoot || process.cwd(),
      outputDir: config.outputDir || path.join(process.cwd(), 'test-results'),
      autoFix: config.autoFix || false,
      ...config
    };

    this.improvements = {
      timestamp: new Date().toISOString(),
      suggestions: [],
      fixes: [],
      summary: null
    };
  }

  /**
   * Analyze test results and generate improvements
   */
  async analyze(results) {
    console.log('🔧 Coder: Analyzing test results...');

    try {
      await this.analyzeLinterResults(results.linter);
      await this.analyzeUnitTestResults(results.unittest);
      await this.analyzeE2EResults(results.e2e);
      await this.generateImprovementPlan();
      await this.saveAnalysis();

      console.log('✅ Coder: Analysis completed');
      return this.improvements;
    } catch (error) {
      console.error('❌ Coder error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze linter results
   */
  async analyzeLinterResults(linterResults) {
    if (!linterResults) return;

    console.log('🔍 Analyzing linter results...');

    // Critical errors
    if (linterResults.stats?.errors > 0) {
      this.improvements.suggestions.push({
        priority: 'high',
        category: 'code-quality',
        title: 'Fix Linting Errors',
        description: `Found ${linterResults.stats.errors} linting errors that need immediate attention.`,
        action: 'Review and fix all ESLint errors',
        files: this.extractUniqueFiles(linterResults.issues.filter(i => i.type === 'error'))
      });
    }

    // Warnings
    if (linterResults.stats?.warnings > 10) {
      this.improvements.suggestions.push({
        priority: 'medium',
        category: 'code-quality',
        title: 'Address Linting Warnings',
        description: `Found ${linterResults.stats.warnings} warnings that should be reviewed.`,
        action: 'Gradually address warnings to improve code quality',
        files: this.extractUniqueFiles(linterResults.issues.filter(i => i.type === 'warning'))
      });
    }

    // Specific issues
    const consoleLogs = linterResults.suggestions?.filter(s =>
      s.message.includes('console.log')
    ) || [];

    if (consoleLogs.length > 5) {
      this.improvements.suggestions.push({
        priority: 'low',
        category: 'code-cleanup',
        title: 'Remove Debug Console Logs',
        description: `Found ${consoleLogs.length} console.log statements that should be removed.`,
        action: 'Replace console.log with proper logging or remove',
        files: this.extractUniqueFiles(consoleLogs)
      });
    }

    // Code complexity
    const complexCode = linterResults.suggestions?.filter(s =>
      s.message.includes('nested') || s.message.includes('complex')
    ) || [];

    if (complexCode.length > 0) {
      this.improvements.suggestions.push({
        priority: 'medium',
        category: 'refactoring',
        title: 'Reduce Code Complexity',
        description: 'Some files have deeply nested or complex code.',
        action: 'Refactor complex functions into smaller, more manageable pieces',
        files: this.extractUniqueFiles(complexCode)
      });
    }
  }

  /**
   * Analyze unit test results
   */
  async analyzeUnitTestResults(unitResults) {
    if (!unitResults) return;

    console.log('🧪 Analyzing unit test results...');

    // Failed tests
    if (unitResults.success === false) {
      this.improvements.suggestions.push({
        priority: 'high',
        category: 'testing',
        title: 'Fix Failing Unit Tests',
        description: 'Some unit tests are failing.',
        action: 'Investigate and fix all failing unit tests',
        details: unitResults.issues
      });
    }

    // Coverage
    if (unitResults.coverage) {
      const linesCoverage = parseFloat(unitResults.coverage.lines) || 0;

      if (linesCoverage < 80) {
        this.improvements.suggestions.push({
          priority: 'medium',
          category: 'testing',
          title: 'Increase Test Coverage',
          description: `Current coverage is ${linesCoverage}%. Target is 80%+.`,
          action: 'Add tests for uncovered code paths',
          recommendations: [
            'Focus on critical business logic first',
            'Add edge case tests',
            'Test error handling paths',
            'Consider property-based testing for complex logic'
          ]
        });
      }
    }

    // Missing tests
    if (!unitResults.tests || unitResults.tests.length === 0) {
      this.improvements.suggestions.push({
        priority: 'high',
        category: 'testing',
        title: 'Add Unit Tests',
        description: 'No unit tests found in the project.',
        action: 'Create unit tests for critical functions and modules',
        recommendations: [
          'Start with utility functions',
          'Test service layer logic',
          'Add tests for custom hooks',
          'Test error scenarios'
        ]
      });
    }
  }

  /**
   * Analyze E2E test results
   */
  async analyzeE2EResults(e2eResults) {
    if (!e2eResults) return;

    console.log('🎭 Analyzing E2E test results...');

    // Failed tests
    if (e2eResults.success === false) {
      this.improvements.suggestions.push({
        priority: 'high',
        category: 'e2e-testing',
        title: 'Fix Failing E2E Tests',
        description: 'End-to-end tests are failing.',
        action: 'Debug and fix E2E test failures',
        details: e2eResults.issues,
        recommendations: [
          'Check if the application is running correctly',
          'Verify selectors are still valid',
          'Check for timing issues',
          'Review recent code changes'
        ]
      });
    }

    // Test coverage gaps
    if (e2eResults.errors && e2eResults.errors.length > 0) {
      this.improvements.suggestions.push({
        priority: 'medium',
        category: 'e2e-testing',
        title: 'Address E2E Test Errors',
        description: 'Errors occurred during E2E test execution.',
        action: 'Review and fix E2E test errors',
        details: e2eResults.errors
      });
    }
  }

  /**
   * Generate improvement plan
   */
  async generateImprovementPlan() {
    console.log('📋 Generating improvement plan...');

    // Sort by priority
    const highPriority = this.improvements.suggestions.filter(s => s.priority === 'high');
    const mediumPriority = this.improvements.suggestions.filter(s => s.priority === 'medium');
    const lowPriority = this.improvements.suggestions.filter(s => s.priority === 'low');

    this.improvements.summary = {
      totalSuggestions: this.improvements.suggestions.length,
      byPriority: {
        high: highPriority.length,
        medium: mediumPriority.length,
        low: lowPriority.length
      },
      byCategory: this.groupByCategory(this.improvements.suggestions)
    };

    // Generate action plan
    const plan = this.generateActionPlan(highPriority, mediumPriority, lowPriority);
    await this.saveActionPlan(plan);
  }

  /**
   * Generate action plan
   */
  generateActionPlan(high, medium, low) {
    let plan = `# Action Plan for Code Improvements

**Generated:** ${new Date().toLocaleString()}

## Overview

This document outlines recommended improvements based on test results and code analysis.

**Total Suggestions:** ${this.improvements.suggestions.length}
- High Priority: ${high.length}
- Medium Priority: ${medium.length}
- Low Priority: ${low.length}

---

## High Priority Actions

These should be addressed immediately as they affect code stability and functionality.

`;

    if (high.length === 0) {
      plan += '*No high priority issues found!*\n\n';
    } else {
      high.forEach((item, idx) => {
        plan += this.formatSuggestion(idx + 1, item);
      });
    }

    plan += `---

## Medium Priority Actions

These should be addressed in the near term to improve code quality.

`;

    if (medium.length === 0) {
      plan += '*No medium priority issues found!*\n\n';
    } else {
      medium.forEach((item, idx) => {
        plan += this.formatSuggestion(idx + 1, item);
      });
    }

    plan += `---

## Low Priority Actions

These are nice-to-have improvements for long-term code health.

`;

    if (low.length === 0) {
      plan += '*No low priority issues found!*\n\n';
    } else {
      low.forEach((item, idx) => {
        plan += this.formatSuggestion(idx + 1, item);
      });
    }

    plan += `---

## Implementation Guidelines

1. **Start with high priority items** - These have the most impact
2. **Work systematically** - Complete one category before moving to the next
3. **Test after each change** - Run relevant tests to ensure no regressions
4. **Commit frequently** - Make small, atomic commits for each fix
5. **Update documentation** - Keep docs in sync with code changes

## Next Steps

1. Review this action plan
2. Prioritize items based on your project goals
3. Create tickets/issues for tracking
4. Assign items to team members
5. Set deadlines for high-priority items
6. Schedule regular reviews

---

*Generated by Coder Agent*
`;

    return plan;
  }

  /**
   * Format a suggestion for the action plan
   */
  formatSuggestion(num, suggestion) {
    let text = `### ${num}. ${suggestion.title}\n\n`;
    text += `**Category:** ${suggestion.category}\n\n`;
    text += `**Description:** ${suggestion.description}\n\n`;
    text += `**Action:** ${suggestion.action}\n\n`;

    if (suggestion.files && suggestion.files.length > 0) {
      text += '**Affected Files:**\n';
      suggestion.files.slice(0, 10).forEach(file => {
        text += `- ${file}\n`;
      });
      if (suggestion.files.length > 10) {
        text += `- *... and ${suggestion.files.length - 10} more files*\n`;
      }
      text += '\n';
    }

    if (suggestion.recommendations) {
      text += '**Recommendations:**\n';
      suggestion.recommendations.forEach(rec => {
        text += `- ${rec}\n`;
      });
      text += '\n';
    }

    if (suggestion.details) {
      text += '<details>\n<summary>Details</summary>\n\n';
      if (Array.isArray(suggestion.details)) {
        suggestion.details.slice(0, 5).forEach(detail => {
          text += `- ${detail}\n`;
        });
        if (suggestion.details.length > 5) {
          text += `- *... and ${suggestion.details.length - 5} more*\n`;
        }
      } else {
        text += `${suggestion.details}\n`;
      }
      text += '\n</details>\n\n';
    }

    return text;
  }

  /**
   * Extract unique files from issues
   */
  extractUniqueFiles(issues) {
    if (!issues) return [];
    const files = issues.map(i => i.file).filter(Boolean);
    return [...new Set(files)];
  }

  /**
   * Group suggestions by category
   */
  groupByCategory(suggestions) {
    const grouped = {};
    suggestions.forEach(s => {
      if (!grouped[s.category]) {
        grouped[s.category] = 0;
      }
      grouped[s.category]++;
    });
    return grouped;
  }

  /**
   * Save action plan
   */
  async saveActionPlan(plan) {
    const planPath = path.join(this.config.outputDir, 'ACTION_PLAN.md');
    await fs.writeFile(planPath, plan);
    console.log(`📄 Action plan saved to ${planPath}`);
  }

  /**
   * Save analysis
   */
  async saveAnalysis() {
    const analysisPath = path.join(this.config.outputDir, 'coder-analysis.json');
    await fs.writeFile(analysisPath, JSON.stringify(this.improvements, null, 2));
    console.log(`📊 Analysis saved to ${analysisPath}`);
  }
}

export default Coder;
