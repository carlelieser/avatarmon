import { View, Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS } from '@/theme/globals';
import { Plus, X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface PhotoSlotProps {
  imageUri: string | null;
  onAdd: () => void;
  onRemove: () => void;
  index: number;
  isLoading?: boolean;
  size?: number;
}

export function PhotoSlot({
  imageUri,
  onAdd,
  onRemove,
  index,
  isLoading = false,
  size,
}: PhotoSlotProps) {
  const { width: screenWidth } = useWindowDimensions();
  const slotSize = size ?? Math.floor((screenWidth - 64) / 3); // 64 = padding + gaps

  const cardColor = useColor('card');
  const borderColor = useColor('border');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');

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

  const handlePress = () => {
    if (imageUri) {
      onRemove();
    } else {
      onAdd();
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading}
        style={[
          styles.container,
          {
            width: slotSize,
            height: slotSize,
            backgroundColor: cardColor,
            borderColor: imageUri ? primaryColor : borderColor,
            borderWidth: imageUri ? 2 : 1,
          },
        ]}
      >
        {imageUri ? (
          <>
            <Image
              source={{ uri: `data:image/jpeg;base64,${imageUri}` }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={[styles.removeButton, { backgroundColor: primaryColor }]}>
              <Icon name={X} size={14} color="#fff" />
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Icon name={Plus} size={24} color={mutedColor} />
            <Text variant="caption" style={{ marginTop: 4 }}>
              Photo {index + 1}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
