/**
 * RevenueCatManager - Monetization & Entitlements Engine for HabitFlow Pro
 * Interacts with RevenueCat SDK / Webhooks, manages subscriptions, offerings, and paywall state.
 */

export const REVENUECAT_CONFIG = {
  ENTITLEMENT_ID: 'pro_access',
  PRODUCTS: {
    MONTHLY: {
      identifier: 'habitflow_499_1m',
      title: 'HabitFlow Pro Monthly',
      priceUSD: 4.99,
      period: 'P1M',
      trialPeriodDays: 0
    },
    ANNUAL: {
      identifier: 'habitflow_3999_1y',
      title: 'HabitFlow Pro Annual',
      priceUSD: 39.99,
      period: 'P1Y',
      trialPeriodDays: 7
    },
    LIFETIME: {
      identifier: 'habitflow_8999_lifetime',
      title: 'HabitFlow Pro Lifetime',
      priceUSD: 89.99,
      period: 'LIFETIME',
      trialPeriodDays: 0
    }
  }
};

export class RevenueCatManager {
  constructor(apiKey = 'appl_mock_revenuecat_key') {
    this.apiKey = apiKey;
    this.userId = 'anon_' + Math.random().toString(36).substr(2, 9);
    this.activeEntitlements = new Set();
    this.purchaseHistory = [];
    this.activeOffering = 'default';
  }

  /**
   * Initialize customer info and active subscriptions
   */
  async getCustomerInfo() {
    return {
      userId: this.userId,
      entitlements: {
        active: {
          [REVENUECAT_CONFIG.ENTITLEMENT_ID]: this.activeEntitlements.has(REVENUECAT_CONFIG.ENTITLEMENT_ID) ? {
            identifier: REVENUECAT_CONFIG.ENTITLEMENT_ID,
            isActive: true,
            expirationDate: new Date(Date.now() + 30 * 86400000).toISOString()
          } : null
        }
      },
      isPro: this.isPro()
    };
  }

  /**
   * Check if user possesses active 'pro_access' entitlement
   */
  isPro() {
    return this.activeEntitlements.has(REVENUECAT_CONFIG.ENTITLEMENT_ID);
  }

  /**
   * Fetch current offerings for the paywall
   */
  getOfferings() {
    return {
      current: {
        identifier: this.activeOffering,
        availablePackages: [
          {
            identifier: '$rc_annual',
            packageType: 'ANNUAL',
            product: REVENUECAT_CONFIG.PRODUCTS.ANNUAL
          },
          {
            identifier: '$rc_monthly',
            packageType: 'MONTHLY',
            product: REVENUECAT_CONFIG.PRODUCTS.MONTHLY
          },
          {
            identifier: '$rc_lifetime',
            packageType: 'LIFETIME',
            product: REVENUECAT_CONFIG.PRODUCTS.LIFETIME
          }
        ]
      }
    };
  }

  /**
   * Purchase a package and grant entitlement
   */
  async purchasePackage(packageIdentifier) {
    let selectedProduct = null;

    if (packageIdentifier.includes('annual') || packageIdentifier === '$rc_annual') {
      selectedProduct = REVENUECAT_CONFIG.PRODUCTS.ANNUAL;
    } else if (packageIdentifier.includes('monthly') || packageIdentifier === '$rc_monthly') {
      selectedProduct = REVENUECAT_CONFIG.PRODUCTS.MONTHLY;
    } else if (packageIdentifier.includes('lifetime') || packageIdentifier === '$rc_lifetime') {
      selectedProduct = REVENUECAT_CONFIG.PRODUCTS.LIFETIME;
    } else {
      throw new Error(`Invalid package identifier: ${packageIdentifier}`);
    }

    // Grant entitlement
    this.activeEntitlements.add(REVENUECAT_CONFIG.ENTITLEMENT_ID);

    const transaction = {
      transactionId: 'txn_' + Date.now(),
      productIdentifier: selectedProduct.identifier,
      purchasedAt: new Date().toISOString(),
      amountUSD: selectedProduct.priceUSD
    };
    this.purchaseHistory.push(transaction);

    return {
      customerInfo: await this.getCustomerInfo(),
      transaction
    };
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases() {
    return this.getCustomerInfo();
  }

  /**
   * Feature gate validation
   * Free tier: Up to 3 habits
   * Pro tier: Unlimited habits + AI Coach
   */
  canCreateHabit(currentHabitCount) {
    if (this.isPro()) return true;
    return currentHabitCount < 3;
  }

  canAccessAICoach() {
    return this.isPro();
  }
}
