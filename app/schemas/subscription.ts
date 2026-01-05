import { z } from 'zod';

export const SubscriptionTierSchema = z.enum(['free', 'premium']);
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

export const SubscriptionPeriodSchema = z.enum(['monthly', 'yearly']);
export type SubscriptionPeriod = z.infer<typeof SubscriptionPeriodSchema>;

export const SubscriptionStateSchema = z.object({
  tier: SubscriptionTierSchema.default('free'),
  isActive: z.boolean().default(false),
  expirationDate: z.string().datetime().optional(),
  period: SubscriptionPeriodSchema.optional(),
  willRenew: z.boolean().default(false),
});

export type SubscriptionState = z.infer<typeof SubscriptionStateSchema>;

// RevenueCat product identifiers - must match App Store Connect / Google Play Console
export const PRODUCT_IDS = {
  MONTHLY: process.env.EXPO_PUBLIC_PRODUCT_ID_MONTHLY ?? 'avatarmon_premium_monthly',
  YEARLY: process.env.EXPO_PUBLIC_PRODUCT_ID_YEARLY ?? 'avatarmon_premium_yearly',
} as const;

// RevenueCat entitlement identifier
export const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_ENTITLEMENT_ID ?? 'premium';

// Pricing (for display purposes - actual prices come from store)
export const PRICING = {
  monthly: {
    price: '$4.99',
    period: 'month',
  },
  yearly: {
    price: '$39.99',
    period: 'year',
    savings: '33%',
  },
} as const;

// Tier limits
export const TIER_LIMITS = {
  free: {
    dailyGenerations: 2,
    exportResolution: 512,
    hasWatermark: true,
    exportFormat: 'jpeg' as const,
  },
  premium: {
    dailyGenerations: Infinity,
    exportResolution: 2048,
    hasWatermark: false,
    exportFormat: 'png' as const,
  },
} as const;
