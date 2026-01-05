import { create } from 'zustand';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import type { SubscriptionState } from '@/schemas/subscription';
import { TIER_LIMITS } from '@/schemas/subscription';
import {
  initializePurchases,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  parseCustomerInfo,
  addCustomerInfoUpdateListener,
} from '@/lib/purchases';

interface SubscriptionStore {
  // State
  subscription: SubscriptionState;
  isLoading: boolean;
  error: string | null;
  packages: PurchasesPackage[];

  // Computed
  isPremium: () => boolean;
  getDailyLimit: () => number;
  getExportResolution: () => number;
  hasWatermark: () => boolean;

  // Actions
  initialize: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: {
    tier: 'free',
    isActive: false,
    willRenew: false,
  },
  isLoading: false,
  error: null,
  packages: [],

  isPremium: () => get().subscription.tier === 'premium' && get().subscription.isActive,

  getDailyLimit: () => {
    const tier = get().isPremium() ? 'premium' : 'free';
    return TIER_LIMITS[tier].dailyGenerations;
  },

  getExportResolution: () => {
    const tier = get().isPremium() ? 'premium' : 'free';
    return TIER_LIMITS[tier].exportResolution;
  },

  hasWatermark: () => {
    const tier = get().isPremium() ? 'premium' : 'free';
    return TIER_LIMITS[tier].hasWatermark;
  },

  initialize: async () => {
    set({ isLoading: true, error: null });

    try {
      await initializePurchases();

      try {
        const customerInfo = await getCustomerInfo();
        const subscription = parseCustomerInfo(customerInfo);
        set({ subscription });

        // Listen for subscription updates
        addCustomerInfoUpdateListener((info: CustomerInfo) => {
          const updatedSubscription = parseCustomerInfo(info);
          console.log('[Listener] Customer info updated:', updatedSubscription);
          set({ subscription: updatedSubscription });
        });
      } catch (customerError) {
        // RevenueCat not configured yet - use free tier
        console.warn('Could not get customer info:', customerError);
      }

      // Load available packages
      await get().loadOfferings();
    } catch (error) {
      // RevenueCat not configured - app still works with free tier
      console.warn('RevenueCat not initialized:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadOfferings: async () => {
    try {
      const offering = await getOfferings();
      if (offering?.availablePackages) {
        set({ packages: offering.availablePackages });
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  },

  purchase: async (pkg: PurchasesPackage) => {
    // Prevent duplicate purchase attempts
    if (get().isLoading) {
      console.warn('[Purchase] Already in progress, ignoring duplicate request');
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const customerInfo = await purchasePackage(pkg);

      if (customerInfo) {
        const subscription = parseCustomerInfo(customerInfo);
        console.log('[Purchase] customerInfo entitlements:', JSON.stringify(customerInfo.entitlements, null, 2));
        console.log('[Purchase] parsed subscription:', subscription);
        set({ subscription });

        // In sandbox mode, entitlements may not be immediately available
        // Fetch fresh customer info after a short delay to ensure we have the latest state
        if (!subscription.isActive) {
          console.log('[Purchase] Entitlement not immediately active, refreshing...');
          await new Promise((resolve) => setTimeout(resolve, 500));
          await get().refresh();
        }

        return true;
      }

      return false;
    } catch (error: any) {
      // Silently handle "operation already in progress" - don't show user error
      if (error?.code === 'OperationAlreadyInProgressError' ||
          error?.message?.includes('already in progress')) {
        console.warn('[Purchase] RevenueCat operation already in progress');
        return false;
      }
      set({ error: 'Purchase failed. Please try again.' });
      console.error('Purchase error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  restore: async () => {
    set({ isLoading: true, error: null });

    try {
      const customerInfo = await restorePurchases();
      const subscription = parseCustomerInfo(customerInfo);
      set({ subscription });

      return subscription.isActive;
    } catch (error) {
      set({ error: 'Failed to restore purchases' });
      console.error('Restore error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    try {
      const customerInfo = await getCustomerInfo();
      const subscription = parseCustomerInfo(customerInfo);
      console.log('[Refresh] Customer info:', subscription);
      set({ subscription });
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    }
  },
}));
