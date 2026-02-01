import { promises as fs } from 'fs';
import path from 'path';
import { ESLint } from 'eslint';

/**
 * Linter Agent
 * Checks source code for improvements and code quality issues
 */
class Linter {
  constructor(config = {}) {
    this.config = {
      projectRoot: config.projectRoot || process.cwd(),
      outputDir: config.outputDir || path.join(process.cwd(), 'test-results'),
      srcDir: config.srcDir || 'src',
      fix: config.fix || false,
      ...config
    };

    this.lintResults = {
      timestamp: new Date().toISOString(),
      success: true,
      issues: [],
      suggestions: [],
      stats: {
        errors: 0,
        warnings: 0,
        info: 0
      }
    };
  }

  /**
   * Run linter checks
   */
  async run() {
    console.log('🔍 Linter: Starting code quality checks...');

    try {
      await this.runESLint();
      await this.checkCodeSmells();
      await this.checkBestPractices();
      await this.saveResults();

      console.log('✅ Linter: Analysis completed');
      return this.lintResults;
    } catch (error) {
      console.error('❌ Linter error:', error.message);
      this.lintResults.success = false;
      this.lintResults.issues.push({
        type: 'error',
        message: error.message,
        file: 'unknown'
      });
      return this.lintResults;
    }
  }

  /**
   * Run ESLint on the codebase
   */
  async runESLint() {
    console.log('📋 Running ESLint...');

    try {
      const eslint = new ESLint({
        cwd: this.config.projectRoot,
        fix: this.config.fix
      });

      const srcPath = path.join(this.config.projectRoot, this.config.srcDir);
      const results = await eslint.lintFiles([`${srcPath}/**/*.{js,jsx}`]);

      // Apply fixes if requested
      if (this.config.fix) {
        await ESLint.outputFixes(results);
      }

      // Process results
      for (const result of results) {
        if (result.messages.length > 0) {
          for (const message of result.messages) {
            const issue = {
              type: this.getSeverity(message.severity),
              message: message.message,
              rule: message.ruleId,
              file: result.filePath.replace(this.config.projectRoot, ''),
              line: message.line,
              column: message.column
            };

            this.lintResults.issues.push(issue);

            // Update stats
            if (message.severity === 2) {
              this.lintResults.stats.errors++;
            } else if (message.severity === 1) {
              this.lintResults.stats.warnings++;
            }
          }
        }
      }

      const totalIssues = this.lintResults.stats.errors + this.lintResults.stats.warnings;
      console.log(`Found ${totalIssues} issues (${this.lintResults.stats.errors} errors, ${this.lintResults.stats.warnings} warnings)`);

      if (this.lintResults.stats.errors > 0) {
        this.lintResults.success = false;
      }
    } catch (error) {
      console.warn('ESLint execution failed:', error.message);
      this.lintResults.issues.push({
        type: 'error',
        message: `ESLint failed: ${error.message}`,
        file: 'unknown'
      });
    }
  }

  /**
   * Check for common code smells
   */
  async checkCodeSmells() {
    console.log('🔬 Checking for code smells...');

    const srcPath = path.join(this.config.projectRoot, this.config.srcDir);
    const files = await this.getAllFiles(srcPath, ['.js', '.jsx']);

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        await this.analyzeFile(file, content);
      } catch (error) {
        console.warn(`Could not analyze ${file}:`, error.message);
      }
    }
  }

  /**
   * Analyze a single file for code smells
   */
  async analyzeFile(filePath, content) {
    const relativePath = filePath.replace(this.config.projectRoot, '');
    const lines = content.split('\n');

    // Check file length
    if (lines.length > 300) {
      this.lintResults.suggestions.push({
        type: 'suggestion',
        message: `File is very long (${lines.length} lines). Consider breaking it into smaller modules.`,
        file: relativePath,
        severity: 'info'
      });
      this.lintResults.stats.info++;
    }

    // Check for console.log (potential debugging code)
    const consoleLogPattern = /console\.(log|debug|info)/g;
    let match;
    let lineNum = 0;
    for (const line of lines) {
      lineNum++;
      if ((match = consoleLogPattern.exec(line)) !== null) {
        this.lintResults.suggestions.push({
          type: 'suggestion',
          message: 'Found console.log - consider removing before production',
          file: relativePath,
          line: lineNum,
          severity: 'info'
        });
        this.lintResults.stats.info++;
      }
    }

    // Check for TODO/FIXME comments
    const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi;
    lineNum = 0;
    for (const line of lines) {
      lineNum++;
      if ((match = todoPattern.exec(line)) !== null) {
        this.lintResults.suggestions.push({
          type: 'suggestion',
          message: `Found ${match[1]} comment`,
          file: relativePath,
          line: lineNum,
          severity: 'info'
        });
      }
    }

    // Check for deeply nested code
    for (let i = 0; i < lines.length; i++) {
      const indentation = lines[i].match(/^(\s*)/)[1].length;
      if (indentation > 24) { // More than 6 levels (assuming 4 spaces)
        this.lintResults.suggestions.push({
          type: 'suggestion',
          message: 'Deeply nested code detected. Consider refactoring.',
          file: relativePath,
          line: i + 1,
          severity: 'info'
        });
        this.lintResults.stats.info++;
        break; // Only report once per file
      }
    }

    // Check for long functions
    // This is a simplified check - in production you'd parse the AST using functionPattern
    // const functionPattern = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\()/g;
  }

  /**
   * Check React-specific best practices
   */
  async checkBestPractices() {
    console.log('📚 Checking React best practices...');

    const srcPath = path.join(this.config.projectRoot, this.config.srcDir);
    const componentFiles = await this.getAllFiles(srcPath, ['.jsx']);

    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const relativePath = file.replace(this.config.projectRoot, '');

        // Check for missing key prop in lists
        if (content.includes('.map(') && !content.includes('key=')) {
          this.lintResults.suggestions.push({
            type: 'suggestion',
            message: 'Using .map() without key prop - ensure all list items have unique keys',
            file: relativePath,
            severity: 'warning'
          });
        }

        // Check for inline styles (potential performance issue)
        const inlineStylePattern = /style=\{\{/g;
        const inlineStyleCount = (content.match(inlineStylePattern) || []).length;
        if (inlineStyleCount > 5) {
          this.lintResults.suggestions.push({
            type: 'suggestion',
            message: `Found ${inlineStyleCount} inline styles. Consider using CSS modules or styled-components for better performance.`,
            file: relativePath,
            severity: 'info'
          });
        }

        // Check for proper hook usage
        if (content.includes('useState') || content.includes('useEffect')) {
          const lines = content.split('\n');
          let inCondition = false;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('if (') || lines[i].includes('if(')) {
              inCondition = true;
            }
            if (inCondition && (lines[i].includes('useState') || lines[i].includes('useEffect'))) {
              this.lintResults.issues.push({
                type: 'error',
                message: 'Hooks should not be called conditionally',
                file: relativePath,
                line: i + 1,
                severity: 'error'
              });
              this.lintResults.stats.errors++;
            }
            if (lines[i].includes('}')) {
              inCondition = false;
            }
          }
        }
      } catch (error) {
        console.warn(`Could not analyze ${file}:`, error.message);
      }
    }
  }

  /**
   * Get all files with specific extensions recursively
   */
  async getAllFiles(dir, extensions) {
    const files = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            files.push(...await this.getAllFiles(fullPath, extensions));
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error.message);
    }

    return files;
  }

  /**
   * Get severity level string
   */
  getSeverity(level) {
    switch (level) {
      case 2: return 'error';
      case 1: return 'warning';
      default: return 'info';
    }
  }

  /**
   * Save lint results
   */
  async saveResults() {
    const resultsPath = path.join(this.config.outputDir, 'lint-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(this.lintResults, null, 2));
    console.log(`📊 Results saved to ${resultsPath}`);
  }
}

export default Linter;
