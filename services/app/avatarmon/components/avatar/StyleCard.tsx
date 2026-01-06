import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS } from '@/theme/globals';
import { Style, StyleMetadata } from '@/types/avatar';
import {
  Sparkles,
  Film,
  Box,
  Grid3x3,
  Droplets,
  Zap,
  Cpu,
  Wand2,
  Check,
  LucideIcon,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Film,
  Box,
  Grid3x3,
  Droplets,
  Zap,
  Cpu,
  Wand2,
};

interface StyleCardProps {
  style: StyleMetadata;
  isSelected: boolean;
  onSelect: () => void;
}

export function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  const cardColor = useColor('card');
  const borderColor = useColor('border');
  const primaryColor = useColor('primary');
  const textColor = useColor('text');

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const IconComponent = ICON_MAP[style.icon] || Sparkles;

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            backgroundColor: cardColor,
            borderColor: isSelected ? primaryColor : borderColor,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: style.previewColor + '20' },
          ]}
        >
          <Icon
            name={IconComponent}
            size={28}
            color={style.previewColor}
          />
        </View>

        <Text variant="subtitle" style={styles.name}>
          {style.displayName}
        </Text>

        <Text variant="caption" numberOfLines={2} style={styles.description}>
          {style.description}
        </Text>

        {isSelected && (
          <View
            style={[styles.checkmark, { backgroundColor: primaryColor }]}
          >
            <Icon name={Check} size={14} color="#fff" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 12,
  },
  container: {
    borderRadius: BORDER_RADIUS,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    fontSize: 13,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
