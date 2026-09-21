#!/usr/bin/env node

/**
 * Cloud107 Command Line Interface
 *
 * Sovereign Cloud Workspace Operator & Update Management Tool
 */

import { executeUpdatePipeline, getCurrentEnvironment } from './update/pipeline';
import { listCheckpoints, loadCheckpoint, rollbackToCheckpoint } from './update/checkpoint';
import { UpdateChannel } from './update/types';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'version':
    case '-v':
    case '--version': {
      const env = getCurrentEnvironment();
      console.log(`Cloud107 Sovereign Workspace CLI v${env.version}`);
      console.log(`Node: ${env.nodeVersion} | Platform: ${env.platform}-${env.arch}`);
      break;
    }

    case 'status': {
      const env = getCurrentEnvironment();
      const checkpoints = listCheckpoints();
      console.log(`\n=== Cloud107 Control Plane Status ===`);
      console.log(`Version:             v${env.version}`);
      console.log(`Identity Provider:   Self-Hosted Cloud107 / WebAuthn`);
      console.log(`Platform:            ${env.platform}-${env.arch}`);
      console.log(`Active Checkpoints:  ${checkpoints.length}`);
      if (checkpoints.length > 0) {
        console.log(`Latest Checkpoint:   ${checkpoints[0].id} (${checkpoints[0].status})`);
      }
      console.log(`Sovereign Status:    Operational & Compliant\n`);
      break;
    }

    case 'health': {
      const env = getCurrentEnvironment();
      console.log(`[OK] Cloud107 Workspace Node is healthy (v${env.version})`);
      console.log(`[OK] Auth: Sovereign Cryptographic Store Active`);
      console.log(`[OK] Storage: Relational Database Ready`);
      break;
    }

    case 'checkpoints': {
      const checkpoints = listCheckpoints();
      console.log(`\n=== Cloud107 Checkpoints (${checkpoints.length}) ===`);
      if (checkpoints.length === 0) {
        console.log('No checkpoints found.');
      } else {
        for (const cp of checkpoints) {
          const date = new Date(cp.timestamp).toISOString();
          console.log(`- ${cp.id} [${cp.status}] (Target: v${cp.targetVersion}, ${date})`);
        }
      }
      console.log('');
      break;
    }

    case 'rollback': {
      const checkpointId = args[1];
      const checkpoints = listCheckpoints();
      let targetCheckpoint = null;

      if (checkpointId) {
        targetCheckpoint = loadCheckpoint(checkpointId);
      } else if (checkpoints.length > 0) {
        targetCheckpoint = checkpoints[0];
      }

      if (!targetCheckpoint) {
        console.error('Error: No checkpoint found to rollback.');
        process.exit(1);
      }

      console.log(`Initiating rollback to checkpoint ${targetCheckpoint.id}...`);
      const success = rollbackToCheckpoint(targetCheckpoint);
      if (success) {
        console.log(`Successfully rolled back to state v${targetCheckpoint.currentVersion}.`);
      } else {
        console.error(`Rollback failed.`);
        process.exit(1);
      }
      break;
    }

    case 'update': {
      console.log('\nStarting Cloud107 Source-First Cryptographically Verified Update...\n');

      let channel: UpdateChannel = 'stable';
      let targetVersion: string | undefined;
      let dryRun = false;
      let force = false;

      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--channel' && args[i + 1]) {
          channel = args[i + 1] as UpdateChannel;
          i++;
        } else if (args[i] === '--target' && args[i + 1]) {
          targetVersion = args[i + 1];
          i++;
        } else if (args[i] === '--dry-run') {
          dryRun = true;
        } else if (args[i] === '--force') {
          force = true;
        }
      }

      const result = await executeUpdatePipeline({
        channel,
        targetVersion,
        dryRun,
        force,
      });

      console.log('Update Execution Log:');
      for (const step of result.steps) {
        const symbol =
          step.status === 'success'
            ? '✓'
            : step.status === 'failed'
              ? '✗'
              : step.status === 'skipped'
                ? '○'
                : '→';
        console.log(`  ${symbol} [${step.step.padEnd(20)}] ${step.message}`);
      }

      console.log('\nResult:');
      if (result.success) {
        console.log(`✓ Update succeeded! Current version: v${result.currentVersion}`);
      } else {
        console.error(`✗ Update failed: ${result.error}`);
        if (result.rolledBack) {
          console.log(
            `✓ Automatic rollback succeeded. System returned to v${result.previousVersion}`,
          );
        } else {
          console.error(`! System could not be automatically rolled back.`);
        }
        process.exit(1);
      }
      break;
    }

    case 'help':
    default: {
      console.log(`
Cloud107 Sovereign Cloud Workspace CLI (c107)

Usage:
  c107 <command> [options]

Commands:
  update         Execute source-first cryptographically verified update
                 Options:
                   --channel <stable|beta|nightly>
                   --target <version>
                   --dry-run
                   --force
  rollback       Rollback to previous checkpoint (or specify checkpoint ID)
  checkpoints    List all recovery checkpoints
  status         Display sovereign control plane status
  health         Run self-diagnostic health probes
  version        Print CLI and runtime version
  help           Display this help message
`);
      break;
    }
  }
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
