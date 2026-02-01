import { promises as fs } from 'fs';
import path from 'path';

/**
 * Reporter Agent
 * Generates comprehensive markdown test reports
 */
class Reporter {
  constructor(config = {}) {
    this.config = {
      outputDir: config.outputDir || path.join(process.cwd(), 'test-results'),
      reportFile: config.reportFile || 'TEST_REPORT.md',
      ...config
    };
  }

  /**
   * Generate comprehensive test report
   */
  async generate(results) {
    console.log('📊 Reporter: Generating test report...');

    try {
      const report = await this.buildReport(results);
      await this.saveReport(report);

      console.log('✅ Reporter: Report generated successfully');
      return report;
    } catch (error) {
      console.error('❌ Reporter error:', error.message);
      throw error;
    }
  }

  /**
   * Build the markdown report
   */
  async buildReport(results) {
    const timestamp = new Date(results.timestamp || Date.now()).toLocaleString();

    let report = `# Test Report

**Generated:** ${timestamp}

---

## 📋 Executive Summary

`;

    // Summary section
    const summary = this.buildSummary(results);
    report += summary;

    report += '\n---\n\n';

    // Linter results
    if (results.linter) {
      report += this.buildLinterSection(results.linter);
      report += '\n---\n\n';
    }

    // Unit test results
    if (results.unittest) {
      report += this.buildUnitTestSection(results.unittest);
      report += '\n---\n\n';
    }

    // E2E test results
    if (results.e2e) {
      report += this.buildE2ESection(results.e2e);
      report += '\n---\n\n';
    }

    // Recommendations
    report += this.buildRecommendations(results);

    return report;
  }

  /**
   * Build summary section
   */
  buildSummary(results) {
    const linterSuccess = results.linter?.success !== false;
    const unitSuccess = results.unittest?.success !== false;
    const e2eSuccess = results.e2e?.success !== false;

    const allSuccess = linterSuccess && unitSuccess && e2eSuccess;

    let summary = `### Overall Status: ${allSuccess ? '✅ PASS' : '❌ FAIL'}\n\n`;

    summary += '| Test Suite | Status | Issues |\n';
    summary += '|------------|--------|--------|\n';

    if (results.linter) {
      const issues = (results.linter.stats?.errors || 0) + (results.linter.stats?.warnings || 0);
      summary += `| Code Linting | ${linterSuccess ? '✅ Pass' : '❌ Fail'} | ${issues} |\n`;
    }

    if (results.unittest) {
      const issues = results.unittest.issues?.length || 0;
      summary += `| Unit Tests | ${unitSuccess ? '✅ Pass' : '❌ Fail'} | ${issues} |\n`;
    }

    if (results.e2e) {
      const issues = results.e2e.issues?.length || 0;
      summary += `| E2E Tests | ${e2eSuccess ? '✅ Pass' : '❌ Fail'} | ${issues} |\n`;
    }

    summary += '\n';

    return summary;
  }

  /**
   * Build linter section
   */
  buildLinterSection(linterResults) {
    let section = `## 🔍 Code Linting Results\n\n`;

    if (linterResults.success) {
      section += '**Status:** ✅ All checks passed\n\n';
    } else {
      section += '**Status:** ❌ Issues found\n\n';
    }

    // Statistics
    if (linterResults.stats) {
      section += '### Statistics\n\n';
      section += `- **Errors:** ${linterResults.stats.errors}\n`;
      section += `- **Warnings:** ${linterResults.stats.warnings}\n`;
      section += `- **Info:** ${linterResults.stats.info}\n\n`;
    }

    // Issues
    if (linterResults.issues && linterResults.issues.length > 0) {
      section += '### Issues Found\n\n';

      // Group by severity
      const errors = linterResults.issues.filter(i => i.type === 'error');
      const warnings = linterResults.issues.filter(i => i.type === 'warning');

      if (errors.length > 0) {
        section += '#### ❌ Errors\n\n';
        section += '| File | Line | Message | Rule |\n';
        section += '|------|------|---------|------|\n';
        errors.slice(0, 20).forEach(issue => {
          section += `| ${issue.file} | ${issue.line || '-'} | ${issue.message} | ${issue.rule || '-'} |\n`;
        });
        if (errors.length > 20) {
          section += `\n*... and ${errors.length - 20} more errors*\n`;
        }
        section += '\n';
      }

      if (warnings.length > 0) {
        section += '#### ⚠️  Warnings\n\n';
        section += '| File | Line | Message | Rule |\n';
        section += '|------|------|---------|------|\n';
        warnings.slice(0, 20).forEach(issue => {
          section += `| ${issue.file} | ${issue.line || '-'} | ${issue.message} | ${issue.rule || '-'} |\n`;
        });
        if (warnings.length > 20) {
          section += `\n*... and ${warnings.length - 20} more warnings*\n`;
        }
        section += '\n';
      }
    }

    // Suggestions
    if (linterResults.suggestions && linterResults.suggestions.length > 0) {
      section += '### 💡 Suggestions\n\n';
      linterResults.suggestions.slice(0, 10).forEach((suggestion, idx) => {
        section += `${idx + 1}. **${suggestion.file}**`;
        if (suggestion.line) section += ` (line ${suggestion.line})`;
        section += `\n   - ${suggestion.message}\n`;
      });
      if (linterResults.suggestions.length > 10) {
        section += `\n*... and ${linterResults.suggestions.length - 10} more suggestions*\n`;
      }
      section += '\n';
    }

    return section;
  }

  /**
   * Build unit test section
   */
  buildUnitTestSection(unitResults) {
    let section = `## 🧪 Unit Test Results\n\n`;

    if (unitResults.success) {
      section += '**Status:** ✅ All tests passed\n\n';
    } else {
      section += '**Status:** ❌ Some tests failed\n\n';
    }

    // Test summary
    if (unitResults.tests && unitResults.tests.length > 0) {
      section += '### Test Summary\n\n';
      section += `- **Total Tests:** ${unitResults.tests.length}\n`;
      const passed = unitResults.tests.filter(t => t.status === 'passed').length;
      const failed = unitResults.tests.filter(t => t.status === 'failed').length;
      section += `- **Passed:** ${passed}\n`;
      section += `- **Failed:** ${failed}\n\n`;
    }

    // Coverage
    if (unitResults.coverage) {
      section += '### Coverage\n\n';
      section += `- **Lines:** ${unitResults.coverage.lines || 'N/A'}%\n`;
      section += `- **Functions:** ${unitResults.coverage.functions || 'N/A'}%\n`;
      section += `- **Branches:** ${unitResults.coverage.branches || 'N/A'}%\n\n`;
    }

    // Issues
    if (unitResults.issues && unitResults.issues.length > 0) {
      section += '### Issues\n\n';
      unitResults.issues.forEach((issue, idx) => {
        section += `${idx + 1}. ${issue}\n`;
      });
      section += '\n';
    }

    // Recommendations
    section += '### Recommendations\n\n';
    section += '- Review and fix failing tests\n';
    section += '- Increase test coverage to at least 80%\n';
    section += '- Add edge case tests for critical functions\n';
    section += '- Consider adding integration tests\n\n';

    return section;
  }

  /**
   * Build E2E test section
   */
  buildE2ESection(e2eResults) {
    let section = `## 🎭 End-to-End Test Results\n\n`;

    if (e2eResults.success) {
      section += '**Status:** ✅ All E2E tests passed\n\n';
    } else {
      section += '**Status:** ❌ Some E2E tests failed\n\n';
    }

    // Test summary
    if (e2eResults.tests && e2eResults.tests.length > 0) {
      section += '### Test Summary\n\n';
      section += `- **Total Tests:** ${e2eResults.tests.length}\n`;
      const passed = e2eResults.tests.filter(t => t.status === 'passed').length;
      const failed = e2eResults.tests.filter(t => t.status === 'failed').length;
      section += `- **Passed:** ${passed}\n`;
      section += `- **Failed:** ${failed}\n\n`;
    }

    // Issues
    if (e2eResults.issues && e2eResults.issues.length > 0) {
      section += '### Issues Found\n\n';
      e2eResults.issues.forEach((issue, idx) => {
        section += `${idx + 1}. ${issue}\n`;
      });
      section += '\n';
    }

    // Errors
    if (e2eResults.errors && e2eResults.errors.length > 0) {
      section += '### Errors\n\n';
      section += '```\n';
      e2eResults.errors.forEach(error => {
        section += `${error}\n`;
      });
      section += '```\n\n';
    }

    section += '### Recommendations\n\n';
    section += '- Fix failing E2E tests\n';
    section += '- Add tests for critical user flows\n';
    section += '- Ensure all major features are covered\n';
    section += '- Test on multiple browsers/devices\n\n';

    return section;
  }

  /**
   * Build recommendations section
   */
  buildRecommendations(results) {
    let section = `## 🎯 Improvement Recommendations\n\n`;

    section += '### High Priority\n\n';

    const priorities = [];

    // Check for critical errors
    if (results.linter?.stats?.errors > 0) {
      priorities.push('**Fix all linting errors** - These can lead to runtime issues');
    }

    if (results.unittest?.success === false) {
      priorities.push('**Fix failing unit tests** - Broken tests indicate code issues');
    }

    if (results.e2e?.success === false) {
      priorities.push('**Fix failing E2E tests** - User-facing features are broken');
    }

    if (priorities.length === 0) {
      priorities.push('No critical issues found');
    }

    priorities.forEach((priority, idx) => {
      section += `${idx + 1}. ${priority}\n`;
    });

    section += '\n### Medium Priority\n\n';

    const medium = [];

    if (results.linter?.stats?.warnings > 5) {
      medium.push('**Address linting warnings** - Improve code quality and maintainability');
    }

    if (results.linter?.suggestions && results.linter.suggestions.length > 0) {
      medium.push('**Review code suggestions** - Optimize code structure and patterns');
    }

    if (results.unittest?.coverage && parseFloat(results.unittest.coverage.lines) < 80) {
      medium.push('**Increase test coverage** - Target at least 80% code coverage');
    }

    if (medium.length === 0) {
      medium.push('Continue monitoring code quality metrics');
    }

    medium.forEach((item, idx) => {
      section += `${idx + 1}. ${item}\n`;
    });

    section += '\n### Best Practices\n\n';
    section += '1. Run tests before committing code\n';
    section += '2. Keep test coverage above 80%\n';
    section += '3. Address linting errors immediately\n';
    section += '4. Review and update tests regularly\n';
    section += '5. Monitor E2E test results for user experience issues\n\n';

    return section;
  }

  /**
   * Save report to file
   */
  async saveReport(report) {
    const reportPath = path.join(this.config.outputDir, this.config.reportFile);
    await fs.writeFile(reportPath, report);
    console.log(`📄 Report saved to ${reportPath}`);
  }
}

export default Reporter;
