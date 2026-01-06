import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  LOG_LEVEL,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
const REVENUECAT_APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;
const REVENUECAT_GOOGLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;

export const ENTITLEMENT_ID = 'premium';

export interface SubscriptionInfo {
  isSubscribed: boolean;
  isPremium: boolean;
  expirationDate: Date | null;
  activeSubscriptionId: string | null;
}

let isConfigured = false;
let configurePromise: Promise<void> | null = null;

export async function configurePurchases(): Promise<void> {
  if (isConfigured) return;

  // Prevent concurrent configuration attempts
  if (configurePromise) return configurePromise;

  const apiKey =
    REVENUECAT_API_KEY ||
    (Platform.OS === 'ios' ? REVENUECAT_APPLE_API_KEY : REVENUECAT_GOOGLE_API_KEY);

  if (!apiKey) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  configurePromise = (async () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      await Purchases.configure({ apiKey });
      isConfigured = true;
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
    } finally {
      configurePromise = null;
    }
  })();

  return configurePromise;
}

export function isPurchasesConfigured(): boolean {
  return isConfigured;
}

// Request deduplication to avoid 429 errors in Expo Go/browser mode
let customerInfoPromise: Promise<CustomerInfo | null> | null = null;
let offeringsPromise: Promise<PurchasesOfferings | null> | null = null;

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;

  // Return existing promise if request is in flight
  if (customerInfoPromise) return customerInfoPromise;

  customerInfoPromise = (async () => {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error: unknown) {
      // Ignore "request in flight" errors - another call will complete
      const rcError = error as { code?: number; info?: { backendErrorCode?: number } };
      if (rcError?.code === 16 && rcError?.info?.backendErrorCode === 7638) {
        console.debug('RevenueCat: getCustomerInfo request already in flight, skipping');
        return null;
      }
      console.error('Failed to get customer info:', error);
      return null;
    } finally {
      customerInfoPromise = null;
    }
  })();

  return customerInfoPromise;
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!isConfigured) return null;

  // Return existing promise if request is in flight
  if (offeringsPromise) return offeringsPromise;

  offeringsPromise = (async () => {
    try {
      return await Purchases.getOfferings();
    } catch (error: unknown) {
      // Ignore "request in flight" errors - another call will complete
      const rcError = error as { code?: number; info?: { backendErrorCode?: number } };
      if (rcError?.code === 16 && rcError?.info?.backendErrorCode === 7638) {
        console.debug('RevenueCat: getOfferings request already in flight, skipping');
        return null;
      }
      console.error('Failed to get offerings:', error);
      return null;
    } finally {
      offeringsPromise = null;
    }
  })();

  return offeringsPromise;
}

export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error) {
    console.error('Purchase failed:', error);
    return null;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return null;
  }
}

export function parseSubscriptionInfo(
  customerInfo: CustomerInfo | null
): SubscriptionInfo {
  if (!customerInfo) {
    return {
      isSubscribed: false,
      isPremium: false,
      expirationDate: null,
      activeSubscriptionId: null,
    };
  }

  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  const isPremium = !!entitlement;

  return {
    isSubscribed: isPremium,
    isPremium,
    expirationDate: entitlement?.expirationDate
      ? new Date(entitlement.expirationDate)
      : null,
    activeSubscriptionId: entitlement?.productIdentifier ?? null,
  };
}

export function addCustomerInfoUpdateListener(
  listener: (info: CustomerInfo) => void
): () => void {
  if (!isConfigured) {
    return () => {};
  }
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}
