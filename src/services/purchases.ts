/**
 * Purchases service — thin wrapper over `react-native-purchases` (RevenueCat) with
 * a deterministic in-memory MOCK fallback.
 *
 * Live mode is used when a RevenueCat public SDK key is configured (app.json
 * `extra.revenueCatIosKey` / `revenueCatAndroidKey`) AND the native module is
 * available. Otherwise the app runs a simulated store so the full purchase UX is
 * demoable in Expo Go / web without native billing.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  LOG_LEVEL
} from 'react-native-purchases';
import { ENTITLEMENT_ID, PRODUCTS, PRO_FEATURES } from '../lib/products';

export interface SimplePackage {
  identifier: string;
  productIdentifier: string;
  title: string;
  priceString: string;
  period: string;
  rcPackage?: PurchasesPackage; // present in live mode
}

export interface OfferingView {
  identifier: string;
  headline: string;
  features: string[];
  packages: SimplePackage[];
}

function keyForPlatform(): string | undefined {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;
  const key = Platform.OS === 'ios' ? extra.revenueCatIosKey : extra.revenueCatAndroidKey;
  return key && key.length > 0 ? key : undefined;
}

class PurchasesService {
  mock = true;
  private configured = false;
  private mockEntitled = false;

  /** Configure the RevenueCat SDK, or fall back to mock mode. */
  async configure(appUserId?: string): Promise<void> {
    if (this.configured) return;
    const apiKey = keyForPlatform();
    if (!apiKey) {
      this.mock = true;
      this.configured = true;
      return;
    }
    try {
      Purchases.setLogLevel(LOG_LEVEL.WARN);
      Purchases.configure({ apiKey, appUserID: appUserId ?? null });
      this.mock = false;
      this.configured = true;
    } catch {
      this.mock = true;
      this.configured = true;
    }
  }

  async isPro(): Promise<boolean> {
    if (this.mock) return this.mockEntitled;
    const info = await Purchases.getCustomerInfo();
    return this.hasEntitlement(info);
  }

  hasEntitlement(info: CustomerInfo): boolean {
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  }

  async getOffering(): Promise<OfferingView> {
    if (this.mock) return this.mockOffering();
    const offerings = await Purchases.getOfferings();
    const current: PurchasesOffering | null = offerings.current;
    if (!current) return this.mockOffering();
    return {
      identifier: current.identifier,
      headline: 'Unlock Peak Performance with HabitFlow Pro',
      features: PRO_FEATURES,
      packages: current.availablePackages.map((p) => ({
        identifier: p.identifier,
        productIdentifier: p.product.identifier,
        title: p.product.title,
        priceString: p.product.priceString,
        period: p.packageType,
        rcPackage: p
      }))
    };
  }

  /**
   * Purchase a package. Distinguishes a real error from a user cancellation so the
   * UI can stay quiet on cancel (a cancel is not a failure).
   */
  async purchase(pkg: SimplePackage): Promise<{ status: 'completed' | 'cancelled' | 'error'; isPro: boolean; reason?: string }> {
    if (this.mock || !pkg.rcPackage) {
      this.mockEntitled = true;
      return { status: 'completed', isPro: true };
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg.rcPackage);
      return { status: 'completed', isPro: this.hasEntitlement(customerInfo) };
    } catch (e: any) {
      if (e?.userCancelled) return { status: 'cancelled', isPro: await this.isPro() };
      return { status: 'error', isPro: await this.isPro(), reason: e?.message ?? 'purchase failed' };
    }
  }

  /** Restore prior purchases; returns whether Pro is now active. */
  async restore(): Promise<boolean> {
    if (this.mock) return this.mockEntitled;
    const info = await Purchases.restorePurchases();
    return this.hasEntitlement(info);
  }

  private mockOffering(): OfferingView {
    return {
      identifier: 'default_mock',
      headline: 'Unlock Peak Performance with HabitFlow Pro',
      features: PRO_FEATURES,
      packages: [
        { identifier: '$rc_annual', productIdentifier: PRODUCTS.ANNUAL.identifier, title: PRODUCTS.ANNUAL.title, priceString: '$39.99', period: 'ANNUAL' },
        { identifier: '$rc_monthly', productIdentifier: PRODUCTS.MONTHLY.identifier, title: PRODUCTS.MONTHLY.title, priceString: '$4.99', period: 'MONTHLY' },
        { identifier: '$rc_lifetime', productIdentifier: PRODUCTS.LIFETIME.identifier, title: PRODUCTS.LIFETIME.title, priceString: '$89.99', period: 'LIFETIME' }
      ]
    };
  }
}

export const purchases = new PurchasesService();
