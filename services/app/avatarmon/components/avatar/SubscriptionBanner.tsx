import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useColor } from '@/hooks/useColor';
import { CORNERS } from '@/theme/globals';
import { Crown, ChevronRight } from 'lucide-react-native';

interface SubscriptionBannerProps {
  isPremium: boolean;
  generationsRemaining: number;
  onUpgrade: () => void;
}

export function SubscriptionBanner({
  isPremium,
  generationsRemaining,
  onUpgrade,
}: SubscriptionBannerProps) {
  const cardColor = useColor('card');
  const primaryColor = useColor('primary');
  const mutedColor = useColor('textMuted');
  const orangeColor = useColor('orange');

  if (isPremium) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: primaryColor + '15' },
        ]}
      >
        <View style={styles.content}>
          <Icon name={Crown} size={18} color={primaryColor} />
          <Text style={[styles.text, { color: primaryColor }]}>
            Premium Member
          </Text>
        </View>
      </View>
    );
  }

  const isLow = generationsRemaining <= 1;

  return (
    <Pressable
      onPress={onUpgrade}
      style={[
        styles.container,
        {
          backgroundColor: isLow
            ? orangeColor + '15'
            : cardColor,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            { color: isLow ? orangeColor : mutedColor },
          ]}
        >
          {generationsRemaining === 0
            ? 'No free generations left'
            : `${generationsRemaining} free generation${generationsRemaining > 1 ? 's' : ''} remaining`}
        </Text>
      </View>
      <View style={styles.upgradeButton}>
        <Text
          style={[
            styles.upgradeText,
            { color: primaryColor },
          ]}
        >
          Upgrade
        </Text>
        <Icon name={ChevronRight} size={16} color={primaryColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: CORNERS,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
