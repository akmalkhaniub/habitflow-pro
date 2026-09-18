/**
 * RevenueCat product / entitlement configuration for HabitFlow Pro.
 * Mirrors what you configure in the RevenueCat dashboard.
 */

export const ENTITLEMENT_ID = 'pro_access';
export const OFFERING_ID = 'default';

export const FREE_HABIT_LIMIT = 3;

export interface ProductInfo {
  identifier: string;
  title: string;
  priceUSD: number;
  period: 'P1M' | 'P1Y' | 'LIFETIME';
  trialPeriodDays: number;
}

export const PRODUCTS: Record<'MONTHLY' | 'ANNUAL' | 'LIFETIME', ProductInfo> = {
  MONTHLY: { identifier: 'habitflow_499_1m', title: 'HabitFlow Pro Monthly', priceUSD: 4.99, period: 'P1M', trialPeriodDays: 0 },
  ANNUAL: { identifier: 'habitflow_3999_1y', title: 'HabitFlow Pro Annual', priceUSD: 39.99, period: 'P1Y', trialPeriodDays: 7 },
  LIFETIME: { identifier: 'habitflow_8999_lifetime', title: 'HabitFlow Pro Lifetime', priceUSD: 89.99, period: 'LIFETIME', trialPeriodDays: 0 }
};

export const PRO_FEATURES = [
  'Unlimited daily habits & routines',
  'Adaptive AI behavioral coach & habit stacking',
  'Full streak shielding & predictive burnout alerts',
  'Cross-device cloud sync (iOS, Android)'
];
