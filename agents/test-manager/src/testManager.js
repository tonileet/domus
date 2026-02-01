import { promises as fs } from 'fs';
import path from 'path';

/**
 * Test Manager Agent
 * Coordinates all test agents and manages the testing workflow
 */
class TestManager {
  constructor(config = {}) {
    this.config = {
      projectRoot: config.projectRoot || process.cwd(),
      outputDir: config.outputDir || path.join(process.cwd(), 'test-results'),
      agents: {
        linter: config.agents?.linter !== false,
        unittest: config.agents?.unittest !== false,
        e2e: config.agents?.e2e !== false,
        apitest: config.agents?.apitest !== false
      },
      parallel: config.parallel || false,
      failFast: config.failFast || false,
      timeout: config.timeout || 300000, // 5 minutes default
      retries: config.retries || 0,
      ...config
    };

    this.agentTimes = {};
    this.totalAgents = 0;
    this.completedAgents = 0;

    this.results = {
      linter: null,
      unittest: null,
      e2e: null,
      apitest: null,
      timestamp: null,
      summary: null
    };
  }

  /**
   * Run all test agents in sequence or parallel
   */
  async runAll() {
    console.log('🚀 Test Manager: Starting test suite...\n');
    this.results.timestamp = new Date().toISOString();

    await this.ensureOutputDir();

    try {
      if (this.config.parallel) {
        await this.runParallel();
      } else {
        await this.runSequential();
      }

      await this.generateFinalReport();
      await this.runCoderAgent();

      console.log('\n✅ Test Manager: All tests completed!');
      return this.results;
    } catch (error) {
      console.error('\n❌ Test Manager: Error during test execution:', error.message);
      throw error;
    }
  }

  /**
   * Run agents sequentially
   */
  async runSequential() {
    const agentOrder = ['linter', 'unittest', 'apitest', 'e2e'];
    this.totalAgents = agentOrder.filter(agent => this.config.agents[agent]).length;

    for (const agentType of agentOrder) {
      if (this.config.agents[agentType]) {
        this.results[agentType] = await this.runAgent(agentType);

        // Fail-fast: stop on first failure
        if (this.config.failFast && this.results[agentType]?.success === false) {
          console.log(`\n⚠️  Fail-fast enabled: Stopping due to ${agentType} failure`);
          break;
        }
      }
    }
  }

  /**
   * Run agents in parallel
   */
  async runParallel() {
    const promises = [];

    if (this.config.agents.linter) {
      promises.push(this.runAgent('linter').then(result => {
        this.results.linter = result;
      }));
    }

    if (this.config.agents.unittest) {
      promises.push(this.runAgent('unittest').then(result => {
        this.results.unittest = result;
      }));
    }

    if (this.config.agents.apitest) {
      promises.push(this.runAgent('apitest').then(result => {
        this.results.apitest = result;
      }));
    }

    if (this.config.agents.e2e) {
      promises.push(this.runAgent('e2e').then(result => {
        this.results.e2e = result;
      }));
    }

    await Promise.all(promises);
  }

  /**
   * Run a specific agent
   */
  async runAgent(agentType) {
    this.completedAgents++;
    const progress = `[${this.completedAgents}/${this.totalAgents}]`;
    console.log(`\n${progress} 📋 Running ${agentType} agent...`);

    const agentPaths = {
      linter: '../../linter/src/linter.js',
      unittest: '../../unit-tester/src/unitTester.js',
      e2e: '../../e2e-tester/src/e2eTester.js',
      apitest: '../../api-tester/src/apiTester.js'
    };

    const agentPath = path.join(path.dirname(new URL(import.meta.url).pathname), agentPaths[agentType]);
    const startTime = Date.now();

    try {
      const result = await this.runAgentWithRetry(agentPath, agentType);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      this.agentTimes[agentType] = elapsed;

      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${agentType} agent completed (${elapsed}s)`);
      return result;
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      this.agentTimes[agentType] = elapsed;
      console.error(`❌ ${agentType} agent failed after ${elapsed}s:`, error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run agent with timeout and retry logic
   */
  async runAgentWithRetry(agentPath, agentType) {
    let lastError;
    const maxAttempts = this.config.retries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        console.log(`   🔄 Retry ${attempt - 1}/${this.config.retries} for ${agentType}...`);
      }

      try {
        const result = await this.runAgentWithTimeout(agentPath, agentType);

        // Success - return immediately
        if (result.success) {
          return result;
        }

        // Failed but might retry
        lastError = result;
        if (attempt < maxAttempts) {
          await this.sleep(1000 * attempt); // Exponential backoff
        }
      } catch (error) {
        lastError = {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };

        if (attempt < maxAttempts) {
          await this.sleep(1000 * attempt);
        }
      }
    }

    return lastError;
  }

  /**
   * Run agent with timeout protection
   */
  async runAgentWithTimeout(agentPath, agentType) {
    const agentModule = await import(agentPath);
    const Agent = agentModule.default;
    const agent = new Agent({
      projectRoot: this.config.projectRoot,
      outputDir: this.config.outputDir
    });

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });

    // Race between agent execution and timeout
    return await Promise.race([
      agent.run(),
      timeoutPromise
    ]);
  }

  /**
   * Sleep helper for retry backoff
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate final test report
   */
  async generateFinalReport() {
    console.log('\n📊 Generating final test report...');

    const reporterPath = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      '../../reporter/src/reporter.js'
    );

    try {
      const reporterModule = await import(reporterPath);
      const Reporter = reporterModule.default;
      const reporter = new Reporter({
        outputDir: this.config.outputDir
      });

      await reporter.generate(this.results);
      console.log('✅ Final report generated');
    } catch (error) {
      console.error('❌ Reporter failed:', error.message);
    }
  }

  /**
   * Run coder agent to improve application based on test results
   */
  async runCoderAgent() {
    console.log('\n🔧 Running coder agent to analyze improvements...');

    const coderPath = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      '../../coder/src/coder.js'
    );

    try {
      const coderModule = await import(coderPath);
      const Coder = coderModule.default;
      const coder = new Coder({
        projectRoot: this.config.projectRoot,
        outputDir: this.config.outputDir
      });

      await coder.analyze(this.results);
      console.log('✅ Coder agent completed analysis');
    } catch (error) {
      console.error('❌ Coder agent failed:', error.message);
    }
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    try {
      await fs.mkdir(this.config.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error.message);
    }
  }

  /**
   * Get test results summary
   */
  getSummary() {
    const summary = {
      timestamp: this.results.timestamp,
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      agents: {}
    };

    ['linter', 'unittest', 'apitest', 'e2e'].forEach(agent => {
      if (this.results[agent]) {
        summary.agents[agent] = {
          success: this.results[agent].success,
          issues: this.results[agent].issues?.length || 0
        };
      }
    });

    return summary;
  }
}

export default TestManager;
