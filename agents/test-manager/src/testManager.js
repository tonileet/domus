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
        e2e: config.agents?.e2e !== false
      },
      parallel: config.parallel || false,
      ...config
    };

    this.results = {
      linter: null,
      unittest: null,
      e2e: null,
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
    if (this.config.agents.linter) {
      this.results.linter = await this.runAgent('linter');
    }

    if (this.config.agents.unittest) {
      this.results.unittest = await this.runAgent('unittest');
    }

    if (this.config.agents.e2e) {
      this.results.e2e = await this.runAgent('e2e');
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
    console.log(`\n📋 Running ${agentType} agent...`);

    const agentPaths = {
      linter: '../../linter/src/linter.js',
      unittest: '../../unit-tester/src/unitTester.js',
      e2e: '../../e2e-tester/src/e2eTester.js'
    };

    const agentPath = path.join(path.dirname(new URL(import.meta.url).pathname), agentPaths[agentType]);

    try {
      const agentModule = await import(agentPath);
      const Agent = agentModule.default;
      const agent = new Agent({
        projectRoot: this.config.projectRoot,
        outputDir: this.config.outputDir
      });

      const result = await agent.run();
      console.log(`✅ ${agentType} agent completed`);
      return result;
    } catch (error) {
      console.error(`❌ ${agentType} agent failed:`, error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
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

    ['linter', 'unittest', 'e2e'].forEach(agent => {
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
