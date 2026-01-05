import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Sparkles, Zap, Image as ImageIcon } from 'lucide-react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useColor } from '@/hooks/useColor';
import { useSubscriptionStore } from '@/store/subscription-store';
import { PRICING } from '@/schemas/subscription';
import { BORDER_RADIUS, FONTS, SPACING } from '@/theme/globals';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
}

export function Paywall({ visible, onClose }: PaywallProps) {
  const backgroundColor = useColor('background');
  const cardColor = useColor('card');
  const primaryColor = useColor('primary');
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');
  const borderColor = useColor('border');
  const greenColor = useColor('green');

  const { packages, purchase, restore, isLoading } = useSubscriptionStore();

  const [selectedPeriod, setSelectedPeriod] = React.useState<'monthly' | 'yearly'>('yearly');

  const monthlyPackage = packages.find((pkg) =>
    pkg.identifier.toLowerCase().includes('monthly')
  );
  const yearlyPackage = packages.find((pkg) =>
    pkg.identifier.toLowerCase().includes('yearly')
  );

  const handlePurchase = async () => {
    const pkg = selectedPeriod === 'yearly' ? yearlyPackage : monthlyPackage;
    if (!pkg) return;

    const success = await purchase(pkg);
    if (success) {
      onClose();
    }
  };

  const handleRestore = async () => {
    const restored = await restore();
    if (restored) {
      onClose();
    }
  };

  const features = [
    { icon: Zap, text: 'Unlimited generations' },
    { icon: ImageIcon, text: '2048px HD exports' },
    { icon: Sparkles, text: 'No watermarks' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text variant="heading" style={styles.title}>
            Go Premium
          </Text>
          <Text variant="caption" style={styles.subtitle}>
            Unlock the full Avatarmon experience
          </Text>

          {/* Features */}
          <View style={styles.features}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View
                  style={[styles.featureIcon, { backgroundColor: primaryColor + '20' }]}
                >
                  <feature.icon size={20} color={primaryColor} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* Plan Selection */}
          <View style={styles.plans}>
            {/* Yearly Plan */}
            <Pressable
              onPress={() => setSelectedPeriod('yearly')}
              style={[
                styles.planCard,
                {
                  backgroundColor: cardColor,
                  borderColor: selectedPeriod === 'yearly' ? primaryColor : borderColor,
                  borderWidth: selectedPeriod === 'yearly' ? 2 : 1,
                },
              ]}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: textColor }]}>Yearly</Text>
                {selectedPeriod === 'yearly' && (
                  <View style={[styles.checkCircle, { backgroundColor: primaryColor }]}>
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={[styles.planPrice, { color: textColor }]}>
                {yearlyPackage?.product.priceString ?? PRICING.yearly.price}
              </Text>
              <Text style={[styles.planPeriod, { color: mutedColor }]}>per year</Text>
              <View style={[styles.savingsBadge, { backgroundColor: greenColor + '20' }]}>
                <Text style={[styles.savingsText, { color: greenColor }]}>
                  Save {PRICING.yearly.savings}
                </Text>
              </View>
            </Pressable>

            {/* Monthly Plan */}
            <Pressable
              onPress={() => setSelectedPeriod('monthly')}
              style={[
                styles.planCard,
                {
                  backgroundColor: cardColor,
                  borderColor: selectedPeriod === 'monthly' ? primaryColor : borderColor,
                  borderWidth: selectedPeriod === 'monthly' ? 2 : 1,
                },
              ]}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: textColor }]}>Monthly</Text>
                {selectedPeriod === 'monthly' && (
                  <View style={[styles.checkCircle, { backgroundColor: primaryColor }]}>
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={[styles.planPrice, { color: textColor }]}>
                {monthlyPackage?.product.priceString ?? PRICING.monthly.price}
              </Text>
              <Text style={[styles.planPeriod, { color: mutedColor }]}>per month</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            onPress={handlePurchase}
            loading={isLoading}
            disabled={isLoading}
          >
            Subscribe Now
          </Button>

          <TouchableOpacity onPress={handleRestore} disabled={isLoading}>
            <Text style={[styles.restoreText, { color: mutedColor }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>

          <Text style={[styles.legalText, { color: mutedColor }]}>
            Cancel anytime. Subscription auto-renews until cancelled.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
  features: {
    gap: SPACING.lg,
    marginBottom: SPACING.xxxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 17,
    fontFamily: FONTS.medium,
  },
  plans: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  planCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  planName: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPrice: {
    fontSize: 28,
    fontFamily: FONTS.bold,
  },
  planPeriod: {
    fontSize: 13,
    marginTop: 2,
  },
  savingsBadge: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
  },
  savingsText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  footer: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  legalText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
