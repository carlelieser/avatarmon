import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { ENTITLEMENT_ID, PRODUCT_IDS } from '@/schemas/subscription';
import type { SubscriptionState, SubscriptionPeriod } from '@/schemas/subscription';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

let isConfigured = false;

export async function initializePurchases(): Promise<void> {
  if (isConfigured) return;

  if (!API_KEY) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      Purchases.setLogHandler((level, message) => {
        console.log(`[RevenueCat ${level}] ${message}`);
      });
    }

    await Purchases.configure({ apiKey: API_KEY });
    isConfigured = true;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled) {
      return null;
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export function parseCustomerInfo(customerInfo: CustomerInfo): SubscriptionState {
  console.log('[parseCustomerInfo] Looking for entitlement:', ENTITLEMENT_ID);
  console.log('[parseCustomerInfo] Active entitlements:', Object.keys(customerInfo.entitlements.active));
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

  if (!entitlement) {
    return {
      tier: 'free',
      isActive: false,
      willRenew: false,
    };
  }

  const period = determinePeriod(entitlement.productIdentifier);

  return {
    tier: 'premium',
    isActive: true,
    expirationDate: entitlement.expirationDate ?? undefined,
    period,
    willRenew: entitlement.willRenew,
  };
}

function determinePeriod(productId: string): SubscriptionPeriod | undefined {
  if (productId === PRODUCT_IDS.MONTHLY) return 'monthly';
  if (productId === PRODUCT_IDS.YEARLY) return 'yearly';
  return undefined;
}

export function addCustomerInfoUpdateListener(
  listener: (info: CustomerInfo) => void
): void {
  Purchases.addCustomerInfoUpdateListener(listener);
}
