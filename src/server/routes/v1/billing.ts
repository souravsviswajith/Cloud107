import { Router } from 'express';
interface BillingQuery {
  From: Date;
  To: Date;
  NodeId?: string;
  WorkspaceId?: string;
}

interface BillingLineItem {
  ResourceId: string;
  ResourceType: string;
  Description: string;
  Amount: number;
  Currency: string;
  From: Date;
  To: Date;
}

interface BillingSnapshot {
  ProviderId: string;
  Currency: string;
  TotalAmount: number;
  From: Date;
  To: Date;
  SampledAt: Date;
  Items: readonly BillingLineItem[];
}

interface BillingProvider {
  ProviderId: string;
  DisplayName: string;
  getSnapshotAsync(query: BillingQuery): Promise<BillingSnapshot>;
}

const router = Router();

/**
 * Billing adapter registry.
 *
 * A provider is injected by the host/runtime in a future integration.
 * The route intentionally returns an unavailable state until an authoritative
 * provider is registered; it never estimates cost from resource metrics.
 */
let billingProvider: BillingProvider | null = null;

export function registerBillingProvider(provider: BillingProvider): void {
  billingProvider = provider;
}

router.get('/', async (req, res, next) => {
  try {
    if (!billingProvider) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BILLING_PROVIDER_UNAVAILABLE',
          message: 'No billing provider is connected.',
        },
      });
    }

    const now = new Date();
    const from = req.query.from ? new Date(String(req.query.from)) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const to = req.query.to ? new Date(String(req.query.to)) : now;

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BILLING_RANGE',
          message: 'Billing range must contain valid ISO timestamps.',
        },
      });
    }

    const snapshot = await billingProvider.getSnapshotAsync({
      From: from,
      To: to,
      NodeId: req.query.nodeId ? String(req.query.nodeId) : undefined,
      WorkspaceId: req.query.workspaceId ? String(req.query.workspaceId) : undefined,
    } as BillingQuery);

    return res.json({
      success: true,
      data: {
        providerId: billingProvider.ProviderId,
        displayName: billingProvider.DisplayName,
        currency: snapshot.Currency,
        totalAmount: snapshot.TotalAmount,
        from: snapshot.From,
        to: snapshot.To,
        sampledAt: snapshot.SampledAt,
        items: snapshot.Items,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
