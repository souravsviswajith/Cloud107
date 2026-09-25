import { Router } from 'express';
import { getCurrentEnvironment } from '../../../cli/update/pipeline';
import { listCheckpoints } from '../../../cli/update/checkpoint';

const router = Router();

router.get('/status', (_req, res, next) => {
  try {
    const environment = getCurrentEnvironment();
    const checkpoints = listCheckpoints();

    return res.json({
      success: true,
      data: {
        currentVersion: environment.version,
        platform: environment.platform,
        architecture: environment.arch,
        nodeVersion: environment.nodeVersion,
        schemaVersion: environment.schemaVersion,
        checkpointCount: checkpoints.length,
        latestCheckpoint: checkpoints[0]
          ? {
              id: checkpoints[0].id,
              targetVersion: checkpoints[0].targetVersion,
              status: checkpoints[0].status,
              timestamp: checkpoints[0].timestamp,
            }
          : null,
        updateManager: {
          mode: 'source-first',
          verification: 'Ed25519 manifest + SHA-256 artifacts',
          rollback: 'checkpoint-based fail-closed',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
