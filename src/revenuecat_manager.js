/**
 * RevenueCatManager - 2026 Modern Monetization & Entitlements Engine for HabitFlow Pro
 * Supports:
 * - RevenueCat Paywalls v2 (interactive components, countdown timers, Exit Offers)
 * - In-App Customer Center (self-service billing, retention surveys, plan upgrades)
 * - Cross-platform Unified Entitlements (iOS, Android, React Native Web Billing via Stripe)
 * - Server-side Webhook Event Lifecycle (INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION)
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
    },
    EXIT_OFFER_MONTHLY: {
      identifier: 'habitflow_249_1m_rescue',
      title: 'HabitFlow Pro Special 50% Off First Month',
      priceUSD: 2.49,
      period: 'P1M',
      trialPeriodDays: 0
    }
  }
};

export class RevenueCatManager {
  constructor(apiKey = 'appl_mock_revenuecat_key') {
    this.apiKey = apiKey;
    this.userId = 'anon_' + Math.random().toString(36).substring(2, 11);
    this.activeEntitlements = new Set();
    this.purchaseHistory = [];
    this.activeOffering = 'default_v2_interactive';
    this.subscriptionState = {
      status: 'FREE',
      autoRenew: false,
      expirationDate: null,
      activePlanId: null
    };
  }

  /**
   * Initialize customer info and active subscriptions
   */
  async getCustomerInfo() {
    const isPro = this.isPro();
    return {
      userId: this.userId,
      entitlements: {
        active: {
          [REVENUECAT_CONFIG.ENTITLEMENT_ID]: isPro ? {
            identifier: REVENUECAT_CONFIG.ENTITLEMENT_ID,
            isActive: true,
            expirationDate: this.subscriptionState.expirationDate || new Date(Date.now() + 30 * 86400000).toISOString(),
            productIdentifier: this.subscriptionState.activePlanId || 'habitflow_3999_1y',
            willRenew: this.subscriptionState.autoRenew
          } : null
        }
      },
      isPro,
      managementUrl: `https://app.revenuecat.com/manage/${this.userId}`
    };
  }

  /**
   * Check if user possesses active 'pro_access' entitlement
   */
  isPro() {
    return this.activeEntitlements.has(REVENUECAT_CONFIG.ENTITLEMENT_ID);
  }

  /**
   * Fetch current offerings including Paywalls v2 metadata
   */
  getOfferings() {
    return {
      current: {
        identifier: this.activeOffering,
        paywall: {
          template: 'dynamic_interactive_v2',
          headline: 'Unlock Peak Performance with HabitFlow Pro',
          subheadline: 'Join 40,000+ top performers building atomic habits daily',
          badgeText: '7-DAY FREE TRIAL AVAILABLE',
          countdownSeconds: 86400, // 24hr countdown banner
          features: [
            'Unlimited Daily Habits & Routines',
            'Adaptive AI Behavioral Coach & Habit Stacking',
            'Full Streak Shielding & Predictive Burnout Alerts',
            'Bi-directional Apple Health & Google Health Sync',
            'Cross-device Cloud Sync (iOS, Android, Web)'
          ],
          exitOffer: {
            title: 'Wait! Claim 50% Off Pro',
            subtitle: 'Get your first month for just $2.49 (Normally $4.99)',
            ctaText: 'Claim 50% Discount',
            packageIdentifier: '$rc_exit_offer'
          }
        },
        availablePackages: [
          {
            identifier: '$rc_annual',
            packageType: 'ANNUAL',
            product: REVENUECAT_CONFIG.PRODUCTS.ANNUAL,
            badge: 'MOST POPULAR — SAVE 33%'
          },
          {
            identifier: '$rc_monthly',
            packageType: 'MONTHLY',
            product: REVENUECAT_CONFIG.PRODUCTS.MONTHLY,
            badge: 'FLEXIBLE'
          },
          {
            identifier: '$rc_lifetime',
            packageType: 'LIFETIME',
            product: REVENUECAT_CONFIG.PRODUCTS.LIFETIME,
            badge: 'PAY ONCE FOREVER'
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
    } else if (packageIdentifier === '$rc_exit_offer' || packageIdentifier.includes('rescue')) {
      selectedProduct = REVENUECAT_CONFIG.PRODUCTS.EXIT_OFFER_MONTHLY;
    } else {
      throw new Error(`Invalid package identifier: ${packageIdentifier}`);
    }

    // Grant entitlement
    this.activeEntitlements.add(REVENUECAT_CONFIG.ENTITLEMENT_ID);
    this.subscriptionState = {
      status: 'ACTIVE',
      autoRenew: selectedProduct.period !== 'LIFETIME',
      expirationDate: selectedProduct.period === 'LIFETIME' ? null : new Date(Date.now() + 30 * 86400000).toISOString(),
      activePlanId: selectedProduct.identifier
    };

    const transaction = {
      transactionId: 'txn_' + Date.now(),
      productIdentifier: selectedProduct.identifier,
      purchasedAt: new Date().toISOString(),
      amountUSD: selectedProduct.priceUSD,
      platform: 'universal_store'
    };
    this.purchaseHistory.push(transaction);

    return {
      customerInfo: await this.getCustomerInfo(),
      transaction
    };
  }

  /**
   * Customer Center self-service details for subscription management
   */
  getCustomerCenterData() {
    const isPro = this.isPro();
    return {
      userId: this.userId,
      isSubscribed: isPro,
      planTitle: isPro ? (this.subscriptionState.activePlanId || 'HabitFlow Pro') : 'Free Tier',
      status: this.subscriptionState.status,
      autoRenew: this.subscriptionState.autoRenew,
      expirationDate: this.subscriptionState.expirationDate,
      purchaseHistory: this.purchaseHistory,
      availableActions: isPro ? ['CHANGE_PLAN', 'RESTORE_PURCHASES', 'CANCEL_SUBSCRIPTION', 'SUBMIT_FEEDBACK'] : ['UPGRADE_TO_PRO']
    };
  }

  /**
   * Simulate React Native Web Billing checkout URL (RevenueCat Web Billing via Stripe)
   */
  createWebCheckoutUrl(packageIdentifier) {
    const returnUrl = encodeURIComponent('https://habitflow.app/billing/success');
    return `https://checkout.revenuecat.com/v1/sessions?user_id=${this.userId}&package=${packageIdentifier}&return_url=${returnUrl}`;
  }

  /**
   * Process RevenueCat Webhook Events (e.g. renewals, cancellations, expiration)
   */
  handleWebhookEvent(event) {
    const { type, event_timestamp_ms, app_user_id } = event;
    console.log(`📡 [RevenueCat Webhook] Received ${type} event for ${app_user_id}`);

    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        this.activeEntitlements.add(REVENUECAT_CONFIG.ENTITLEMENT_ID);
        this.subscriptionState.status = 'ACTIVE';
        this.subscriptionState.autoRenew = true;
        return { handled: true, entitlementActive: true };

      case 'CANCELLATION':
        // Canceled auto-renewal, but stays active until period ends
        this.subscriptionState.autoRenew = false;
        return { handled: true, willExpireAtEndOfPeriod: true };

      case 'EXPIRATION':
        this.activeEntitlements.delete(REVENUECAT_CONFIG.ENTITLEMENT_ID);
        this.subscriptionState.status = 'EXPIRED';
        this.subscriptionState.autoRenew = false;
        return { handled: true, entitlementActive: false };

      case 'BILLING_ISSUE':
        this.subscriptionState.status = 'GRACE_PERIOD';
        return { handled: true, warning: 'Payment retry in progress' };

      default:
        return { handled: false, message: `Unknown webhook type: ${type}` };
    }
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
