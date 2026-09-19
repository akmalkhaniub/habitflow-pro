import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { purchases, type OfferingView, type SimplePackage } from '../services/purchases';
import { analytics } from '../services/analytics';

export type BuyOutcome = { status: 'completed' | 'cancelled' | 'error'; isPro: boolean; reason?: string };

interface PurchasesValue {
  ready: boolean;
  isPro: boolean;
  mock: boolean;
  offering: OfferingView | null;
  purchasing: boolean;
  buy: (pkg: SimplePackage) => Promise<BuyOutcome>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesValue | null>(null);

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [offering, setOffering] = useState<OfferingView | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const refresh = useCallback(async () => {
    setIsPro(await purchases.isPro());
    setOffering(await purchases.getOffering());
  }, []);

  useEffect(() => {
    (async () => {
      await purchases.configure();
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const buy = useCallback(async (pkg: SimplePackage): Promise<BuyOutcome> => {
    setPurchasing(true);
    analytics.track({ name: 'purchase_started', packageId: pkg.productIdentifier });
    try {
      const result = await purchases.purchase(pkg);
      setIsPro(result.isPro);
      if (result.status === 'completed') analytics.track({ name: 'purchase_completed', packageId: pkg.productIdentifier, mock: purchases.mock });
      else if (result.status === 'cancelled') analytics.track({ name: 'purchase_cancelled', packageId: pkg.productIdentifier });
      else analytics.track({ name: 'purchase_failed', packageId: pkg.productIdentifier, reason: result.reason ?? 'unknown' });
      return result;
    } finally {
      setPurchasing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    const ok = await purchases.restore();
    setIsPro(await purchases.isPro());
    analytics.track({ name: 'restore_completed', isPro: ok });
    return ok;
  }, []);

  const value = useMemo<PurchasesValue>(
    () => ({ ready, isPro, mock: purchases.mock, offering, purchasing, buy, restore, refresh }),
    [ready, isPro, offering, purchasing, buy, restore, refresh]
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export function usePurchases(): PurchasesValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within a PurchasesProvider');
  return ctx;
}
