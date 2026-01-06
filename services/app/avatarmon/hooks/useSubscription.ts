import { useState, useEffect, useCallback, useRef } from 'react';
import { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import {
  configurePurchases,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  parseSubscriptionInfo,
  addCustomerInfoUpdateListener,
  SubscriptionInfo,
} from '@/lib/purchases';
import { FREE_GENERATIONS_LIMIT } from '@/constants/styles';

export interface UseSubscriptionReturn {
  isSubscribed: boolean;
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  packages: PurchasesPackage[];
  generationsUsed: number;
  generationsRemaining: number;
  canGenerate: boolean;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  incrementGenerations: () => void;
  refresh: () => Promise<void>;
}

// Persisted generation count (would use AsyncStorage in production)
let generationsUsedCount = 0;

export function useSubscription(): UseSubscriptionReturn {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    isSubscribed: false,
    isPremium: false,
    expirationDate: null,
    activeSubscriptionId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [generationsUsed, setGenerationsUsed] = useState(generationsUsedCount);

  const generationsRemaining = subscriptionInfo.isPremium
    ? Infinity
    : Math.max(0, FREE_GENERATIONS_LIMIT - generationsUsed);

  const canGenerate = subscriptionInfo.isPremium || generationsRemaining > 0;

  const updateSubscriptionInfo = useCallback((info: CustomerInfo) => {
    setSubscriptionInfo(parseSubscriptionInfo(info));
  }, []);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await configurePurchases();

      // Serialize calls to avoid 429 rate limit in Expo Go/browser mode
      const customerInfo = await getCustomerInfo();
      if (customerInfo) {
        updateSubscriptionInfo(customerInfo);
      }

      const offerings = await getOfferings();
      if (offerings?.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load subscription info';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [updateSubscriptionInfo]);

  const purchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        setError(null);

        const customerInfo = await purchasePackage(pkg);

        if (customerInfo) {
          updateSubscriptionInfo(customerInfo);
          return parseSubscriptionInfo(customerInfo).isPremium;
        }

        return false;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Purchase failed';
        setError(message);
        return false;
      }
    },
    [updateSubscriptionInfo]
  );

  const restore = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const customerInfo = await restorePurchases();

      if (customerInfo) {
        updateSubscriptionInfo(customerInfo);
        return parseSubscriptionInfo(customerInfo).isPremium;
      }

      return false;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to restore purchases';
      setError(message);
      return false;
    }
  }, [updateSubscriptionInfo]);

  const incrementGenerations = useCallback(() => {
    generationsUsedCount += 1;
    setGenerationsUsed(generationsUsedCount);
  }, []);

  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent double-initialization from React strict mode
    if (isInitialized.current) return;
    isInitialized.current = true;

    let unsubscribe: (() => void) | null = null;

    const initialize = async () => {
      await refresh();
      // Only add listener after Purchases is configured
      unsubscribe = addCustomerInfoUpdateListener(updateSubscriptionInfo);
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [refresh, updateSubscriptionInfo]);

  return {
    isSubscribed: subscriptionInfo.isSubscribed,
    isPremium: subscriptionInfo.isPremium,
    isLoading,
    error,
    packages,
    generationsUsed,
    generationsRemaining,
    canGenerate,
    purchase,
    restore,
    incrementGenerations,
    refresh,
  };
}
