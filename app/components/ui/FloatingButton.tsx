import { useColor } from '@/hooks/useColor';
import { ANIMATION, FONTS, GAP } from '@/theme/globals';
import * as Haptics from 'expo-haptics';
import { Sparkles, Crown } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Blur,
  Group,
} from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Text } from './text';
import { Spinner } from './spinner';

// Gradient color palette for the glow animation
const GRADIENT_COLORS = {
  light: [
    ['#6366f1', '#8b5cf6', '#a855f7'], // Indigo to purple
    ['#8b5cf6', '#a855f7', '#ec4899'], // Purple to pink
    ['#a855f7', '#ec4899', '#f43f5e'], // Pink to rose
    ['#ec4899', '#f43f5e', '#f97316'], // Rose to orange
    ['#f43f5e', '#f97316', '#eab308'], // Orange to yellow
    ['#f97316', '#eab308', '#22c55e'], // Yellow to green
    ['#eab308', '#22c55e', '#14b8a6'], // Green to teal
    ['#22c55e', '#14b8a6', '#06b6d4'], // Teal to cyan
    ['#14b8a6', '#06b6d4', '#3b82f6'], // Cyan to blue
    ['#06b6d4', '#3b82f6', '#6366f1'], // Blue to indigo
  ],
  dark: [
    ['#818cf8', '#a78bfa', '#c084fc'], // Light indigo to purple
    ['#a78bfa', '#c084fc', '#f472b6'], // Purple to pink
    ['#c084fc', '#f472b6', '#fb7185'], // Pink to rose
    ['#f472b6', '#fb7185', '#fb923c'], // Rose to orange
    ['#fb7185', '#fb923c', '#facc15'], // Orange to yellow
    ['#fb923c', '#facc15', '#4ade80'], // Yellow to green
    ['#facc15', '#4ade80', '#2dd4bf'], // Green to teal
    ['#4ade80', '#2dd4bf', '#22d3ee'], // Teal to cyan
    ['#2dd4bf', '#22d3ee', '#60a5fa'], // Cyan to blue
    ['#22d3ee', '#60a5fa', '#818cf8'], // Blue to indigo
  ],
};

const BLUR_AMOUNT = 30;
const BLUR_PADDING = BLUR_AMOUNT * 2; // Extra space for blur to spread
const GLOW_WIDTH = 200;
const GLOW_HEIGHT = 60;
const CANVAS_WIDTH = GLOW_WIDTH + BLUR_PADDING * 2;
const CANVAS_HEIGHT = GLOW_HEIGHT + BLUR_PADDING * 2;

interface FloatingButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  progress?: number;
  limitReached?: boolean;
}

export function FloatingButton({
  onPress,
  disabled = false,
  loading = false,
  progress = 0,
  limitReached = false,
}: FloatingButtonProps) {
  const primaryColor = useColor('primary');
  const mutedColor = useColor('muted');
  const primaryForeground = useColor('primaryForeground');
  const mutedForeground = useColor('mutedForeground');
  const backgroundColor = useColor('background');

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const colorProgress = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Determine color scheme based on background color
  const isDark = backgroundColor === '#0a0a0a';
  const gradientColors = isDark ? GRADIENT_COLORS.dark : GRADIENT_COLORS.light;

  useEffect(() => {
    // Pulsing glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Color cycling animation
    colorProgress.value = withRepeat(
      withTiming(gradientColors.length, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 5000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [isDark]);

  const handlePressIn = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    scale.value = withSpring(0.95, ANIMATION.pressIn);
    glowOpacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION.pressOut);
    glowOpacity.value = withTiming(0.5, { duration: 200 });
  };

  const handlePress = () => {
    if (loading) return;
    if (!disabled || limitReached) {
      onPress();
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isVisuallyDisabled = disabled && !limitReached;
  const buttonBgColor = isVisuallyDisabled ? mutedColor : primaryColor;
  const textColor = isVisuallyDisabled ? mutedForeground : primaryForeground;

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContent}>
          <Spinner size="sm" color={textColor} />
          <Text style={[styles.text, { color: textColor }]}>
            {progress > 0 ? `${progress}%` : 'Generating...'}
          </Text>
        </View>
      );
    }

    if (limitReached) {
      return (
        <View style={styles.content}>
          <Crown size={22} color={textColor} />
          <Text style={[styles.text, { color: textColor }]}>Upgrade</Text>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <Sparkles size={22} color={textColor} />
        <Text style={[styles.text, { color: textColor }]}>Generate</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Skia Canvas for GPU-accelerated gradient glow with blur */}
      {!isVisuallyDisabled && (
        <View style={styles.canvasContainer}>
          <Canvas style={styles.canvas}>
            <AnimatedGlow
              gradientColors={gradientColors}
              colorProgress={colorProgress}
              rotation={rotation}
              opacity={glowOpacity}
            />
          </Canvas>
        </View>
      )}

      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isVisuallyDisabled || loading}
      >
        <Animated.View
          style={[styles.button, animatedButtonStyle, { backgroundColor: buttonBgColor }]}
        >
          {renderContent()}
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Animated glow component using Skia - renders all colors with staggered rotations
function AnimatedGlow({
  gradientColors,
  colorProgress,
  rotation,
  opacity,
}: {
  gradientColors: string[][];
  colorProgress: SharedValue<number>;
  rotation: SharedValue<number>;
  opacity: SharedValue<number>;
}) {
  const totalColors = gradientColors.length;

  return (
    <Group>
      {gradientColors.map((colors, index) => (
        <BlendedGlowLayer
          key={index}
          colors={colors}
          index={index}
          totalColors={totalColors}
          colorProgress={colorProgress}
          rotation={rotation}
          baseOpacity={opacity}
        />
      ))}
    </Group>
  );
}

// Each color layer has its own rotation angle offset and fades based on color cycle
function BlendedGlowLayer({
  colors,
  index,
  totalColors,
  colorProgress,
  rotation,
  baseOpacity,
}: {
  colors: string[];
  index: number;
  totalColors: number;
  colorProgress: SharedValue<number>;
  rotation: SharedValue<number>;
  baseOpacity: SharedValue<number>;
}) {
  // Calculate this layer's opacity based on its position in the color cycle
  // Multiple layers are visible at once, creating blended gradient effect
  const layerOpacity = useDerivedValue(() => {
    const progress = colorProgress.value % totalColors;

    // Calculate distance from current progress to this color index
    // Use circular distance so colors wrap around
    let distance = Math.abs(progress - index);
    if (distance > totalColors / 2) {
      distance = totalColors - distance;
    }

    // Colors within range 2 are visible (so ~4-5 colors blend at once)
    const visibilityRange = 2.5;
    if (distance > visibilityRange) {
      return 0;
    }

    // Smooth falloff - closer colors are more opaque
    const falloff = 1 - (distance / visibilityRange);
    return falloff * falloff * baseOpacity.value * 0.5;
  });

  // Center of the glow shape (accounting for padding)
  const glowX = BLUR_PADDING;
  const glowY = BLUR_PADDING;
  const centerX = glowX + GLOW_WIDTH / 2;
  const centerY = glowY + GLOW_HEIGHT / 2;

  // Each color gets a unique rotation offset based on its index
  // This staggers the gradients around the button
  const baseAngleOffset = (index / totalColors) * 360;

  // Animate the gradient direction with layer-specific offset
  const gradientStart = useDerivedValue(() => {
    const angle = ((rotation.value + baseAngleOffset) * Math.PI) / 180;
    const radius = Math.max(GLOW_WIDTH, GLOW_HEIGHT) / 2;
    return vec(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    );
  });

  const gradientEnd = useDerivedValue(() => {
    const angle = ((rotation.value + baseAngleOffset) * Math.PI) / 180;
    const radius = Math.max(GLOW_WIDTH, GLOW_HEIGHT) / 2;
    return vec(
      centerX - Math.cos(angle) * radius,
      centerY - Math.sin(angle) * radius
    );
  });

  return (
    <Group opacity={layerOpacity}>
      <Group>
        <Blur blur={BLUR_AMOUNT} />
        <RoundedRect
          x={glowX}
          y={glowY}
          width={GLOW_WIDTH}
          height={GLOW_HEIGHT}
          r={GLOW_HEIGHT / 2}
        >
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={colors}
          />
        </RoundedRect>
      </Group>
    </Group>
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
  canvasContainer: {
    position: 'absolute',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    // Center the canvas behind the button (offset by blur padding)
    top: -BLUR_PADDING + (60 - GLOW_HEIGHT) / 2,
    left: '50%',
    marginLeft: -CANVAS_WIDTH / 2,
  },
  canvas: {
    flex: 1,
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
    gap: GAP.button,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GAP.button,
  },
  text: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
  },
});
