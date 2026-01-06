import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, CORNERS } from '@/theme/globals';
import { useSubscription } from '@/hooks/useSubscription';
import { X, Check, Sparkles, Zap, Infinity } from 'lucide-react-native';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: Infinity, text: 'Unlimited avatar generations' },
  { icon: Zap, text: 'Priority processing' },
  { icon: Sparkles, text: 'Access to all art styles' },
];

export function Paywall({ visible, onClose }: PaywallProps) {
  const backgroundColor = useColor('background');
  const cardColor = useColor('card');
  const primaryColor = useColor('primary');
  const borderColor = useColor('border');

  const { packages, purchase, restore, isLoading } = useSubscription();

  const handlePurchase = async () => {
    if (packages.length > 0) {
      const success = await purchase(packages[0]);
      if (success) {
        onClose();
      }
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Icon name={X} size={24} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={[styles.badge, { backgroundColor: primaryColor + '20' }]}>
            <Icon name={Sparkles} size={20} color={primaryColor} />
            <Text style={[styles.badgeText, { color: primaryColor }]}>
              PREMIUM
            </Text>
          </View>

          <Text variant="heading" style={styles.title}>
            Unlock Unlimited Avatars
          </Text>

          <Text variant="body" style={styles.subtitle}>
            Create as many avatars as you want with our premium subscription
          </Text>

          <View style={[styles.featuresCard, { backgroundColor: cardColor }]}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.feature}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: primaryColor + '20' },
                  ]}
                >
                  <Icon name={feature.icon} size={20} color={primaryColor} />
                </View>
                <Text variant="body" style={styles.featureText}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.priceCard, { borderColor }]}>
            <Text variant="caption">Monthly</Text>
            <Text variant="heading" style={styles.price}>
              $4.99
            </Text>
            <Text variant="caption">per month</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            onPress={handlePurchase}
            loading={isLoading}
            style={styles.purchaseButton}
          >
            Subscribe Now
          </Button>

          <Button variant="ghost" onPress={handleRestore} disabled={isLoading}>
            Restore Purchases
          </Button>

          <Text variant="caption" style={styles.terms}>
            Cancel anytime. Terms and conditions apply.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: CORNERS,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  featuresCard: {
    width: '100%',
    borderRadius: BORDER_RADIUS,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  priceCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: BORDER_RADIUS,
    borderWidth: 2,
  },
  price: {
    marginVertical: 4,
  },
  footer: {
    padding: 24,
    gap: 12,
  },
  purchaseButton: {
    marginBottom: 4,
  },
  terms: {
    textAlign: 'center',
    marginTop: 8,
  },
});
