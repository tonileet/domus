#!/usr/bin/env node
import TestManager from './test-manager/src/testManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Main entry point for the test agent system
 */
async function main() {
  const args = process.argv.slice(2);
  const config = parseArgs(args);

  console.log('🤖 Starting Test Agent System...\n');
  console.log('Configuration:', JSON.stringify(config, null, 2), '\n');

  const manager = new TestManager({
    projectRoot: config.projectRoot,
    outputDir: config.outputDir,
    agents: config.agents,
    parallel: config.parallel
  });

  try {
    const results = await manager.runAll();

    console.log('\n📊 Test Summary:');
    console.log(JSON.stringify(manager.getSummary(), null, 2));

    const success = results.linter?.success !== false &&
                   results.unittest?.success !== false &&
                   results.e2e?.success !== false;

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const config = {
    projectRoot: path.join(__dirname, '..'),
    outputDir: path.join(__dirname, '..', 'test-results'),
    agents: {
      linter: true,
      unittest: true,
      e2e: true
    },
    parallel: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--no-linter':
        config.agents.linter = false;
        break;
      case '--no-unittest':
        config.agents.unittest = false;
        break;
      case '--no-e2e':
        config.agents.e2e = false;
        break;
      case '--parallel':
        config.parallel = true;
        break;
      case '--output':
        config.outputDir = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return config;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
🤖 Test Agent System

Usage: node agents/index.js [options]

Options:
  --no-linter       Skip linter agent
  --no-unittest     Skip unit test agent
  --no-e2e          Skip E2E test agent
  --parallel        Run agents in parallel
  --output <dir>    Output directory for results
  -h, --help        Show this help message

Examples:
  node agents/index.js                    # Run all agents
  node agents/index.js --no-e2e           # Skip E2E tests
  node agents/index.js --parallel         # Run agents in parallel
  node agents/index.js --output ./results # Custom output directory
  `);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;
