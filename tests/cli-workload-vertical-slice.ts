import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

async function runE2ETest() {
  console.log('==> Starting Cloud107 Vertical Slice E2E Test...');
  const testBinPath = join(process.cwd(), 'test-payload.sh');

  try {
    console.log('[1/6] Creating test binary payload...');
    const scriptContent = `#!/bin/sh
echo "Cloud107 E2E Test Payload Executing..."
echo "Environment check: OK"
exit 0
`;
    await writeFile(testBinPath, scriptContent, { mode: 0o755 });

    console.log('[2/6] Computing expected SHA-256 hash...');
    const fileBuffer = await import('fs').then(fs => fs.readFileSync(testBinPath));
    const hash = createHash('sha256').update(fileBuffer).digest('hex');
    const urn = `pkg:cloud107/test/payload@1.0.0?arch=x86_64&os=linux&hash=sha256:${hash}`;
    console.log(`      Generated URN: ${urn}`);

    console.log('[3/6] Testing `c107 artifact verify`...');
    await runCli(['artifact', 'verify', testBinPath, '--urn', urn]);

    console.log('Artifact verification path passed.');
    console.log('Note: workload deployment requires the Express integration environment and is not exercised by this test.');
  } catch (error: any) {
    console.error(`\nTest failed: ${error.message}`);
    process.exit(1);
  } finally {
    await unlink(testBinPath).catch(() => {});
  }
}

function runCli(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['tsx', 'src/cli/c107.ts', ...args], {
      stdio: 'inherit',
      shell: true
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`CLI command exited with code ${code}`));
    });
  });
}

runE2ETest();
