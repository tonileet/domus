import { spawn } from 'child_process';
import path from 'path';

class ApiTester {
    constructor(config = {}) {
        this.config = {
            projectRoot: config.projectRoot || process.cwd(),
            outputDir: config.outputDir || path.join(process.cwd(), 'test-results'),
            ...config
        };
    }

    async run() {
        console.log('Running API Tests...');

        return new Promise((resolve) => {
            const serverDir = path.join(this.config.projectRoot, 'server');
            const testProcess = spawn('npm', ['test'], {
                cwd: serverDir,
                api: { env: { ...process.env, CI: 'true' } } // Force CI mode if supported by tools
            });

            let output = '';
            let errorOutput = '';

            testProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                output += chunk;
                process.stdout.write(chunk); // Stream to console
            });

            testProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                errorOutput += chunk;
                process.stderr.write(chunk);
            });

            testProcess.on('close', (code) => {
                const success = code === 0;

                // Simple parsing of Vitest output for summary
                // Looking for "Tests  114 passed (114)"
                const passedMatch = output.match(/Tests\s+(\d+)\s+passed/);
                const failedMatch = output.match(/Tests\s+(\d+)\s+failed/);

                const passedCount = passedMatch ? parseInt(passedMatch[1]) : 0;
                const failedCount = failedMatch ? parseInt(failedMatch[1]) : 0;

                resolve({
                    success,
                    output,
                    error: code !== 0 ? errorOutput : null,
                    stats: {
                        passed: passedCount,
                        failed: failedCount,
                        total: passedCount + failedCount
                    },
                    timestamp: new Date().toISOString()
                });
            });

            testProcess.on('error', (err) => {
                resolve({
                    success: false,
                    output,
                    error: err.message,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }
}

export default ApiTester;
