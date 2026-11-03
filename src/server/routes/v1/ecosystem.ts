import { Router } from 'express';
import { Career107LocalAdapter } from '../../../core/career107-local-adapter';
import { EcosystemIntegrationRegistry } from '../../../core/ecosystem-integration';
import { errorResponse, successResponse } from '../../utils/response';

export function createEcosystemRouter(
  registry = new EcosystemIntegrationRegistry(),
  career107 = process.env.CAREER107_BASE_URL
    ? new Career107LocalAdapter(process.env.CAREER107_BASE_URL)
    : null,
): Router {
  const router = Router();

  router.get('/integrations', (req, res) => {
    return res.json(successResponse({
      schemaVersion: 1,
      integrations: registry.list(),
    }, req));
  });

  router.get('/integrations/:integrationId', (req, res) => {
    const integration = registry.resolve(req.params.integrationId);

    if (!integration) {
      return res.status(404).json(errorResponse('Integration not found', 404, req));
    }

    return res.json(successResponse(integration, req));
  });

  router.get('/career107/health', async (req, res) => {
    if (!career107) {
      return res.status(503).json(errorResponse(
        'Career107 local runtime is not configured',
        503,
        req,
      ));
    }

    try {
      return res.json(successResponse(await career107.health(), req));
    } catch {
      return res.status(503).json(errorResponse(
        'Career107 local runtime is unavailable',
        503,
        req,
      ));
    }
  });

  router.get('/career107/catalog', async (req, res) => {
    if (!career107) {
      return res.status(503).json(errorResponse(
        'Career107 local runtime is not configured',
        503,
        req,
      ));
    }

    try {
      return res.json(successResponse(await career107.catalog(), req));
    } catch {
      return res.status(503).json(errorResponse(
        'Career107 local runtime is unavailable',
        503,
        req,
      ));
    }
  });

  return router;
}

export const ecosystemRouter = createEcosystemRouter();
