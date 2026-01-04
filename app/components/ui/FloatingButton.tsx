import { useColor } from '@/hooks/useColor';
import { FONTS } from '@/theme/globals';
import * as Haptics from 'expo-haptics';
import { Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Text } from './text';
import { Spinner } from './spinner';

interface FloatingButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  progress?: number;
}

export function FloatingButton({
  onPress,
  disabled = false,
  loading = false,
  progress = 0,
}: FloatingButtonProps) {
  const primaryColor = useColor('primary');
  const mutedColor = useColor('muted');
  const primaryForeground = useColor('primaryForeground');
  const mutedForeground = useColor('mutedForeground');

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Subtle pulsing glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const handlePressIn = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const backgroundColor = disabled ? mutedColor : primaryColor;
  const textColor = disabled ? mutedForeground : primaryForeground;

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          animatedGlowStyle,
          { backgroundColor: primaryColor },
        ]}
      />

      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <Animated.View
          style={[
            styles.button,
            animatedButtonStyle,
            { backgroundColor },
          ]}
        >
          {loading ? (
            <View style={styles.loadingContent}>
              <Spinner size="sm" color={textColor} />
              <Text style={[styles.text, { color: textColor }]}>
                {progress > 0 ? `${progress}%` : 'Generating...'}
              </Text>
            </View>
          ) : (
            <View style={styles.content}>
              <Sparkles size={22} color={textColor} />
              <Text style={[styles.text, { color: textColor }]}>
                Generate
              </Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 56,
    borderRadius: 28,
    bottom: 0,
    transform: [{ scaleX: 1.1 }, { scaleY: 1.3 }],
    filter: 'blur(20px)',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
  },
});
