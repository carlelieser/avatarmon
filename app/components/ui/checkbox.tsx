import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { ANIMATION, BORDER_RADIUS, DISABLED_OPACITY } from '@/theme/globals';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface CheckboxProps {
  checked: boolean;
  label?: string;
  error?: string;
  disabled?: boolean;
  labelStyle?: TextStyle;
  onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({
  checked,
  error,
  disabled = false,
  label,
  labelStyle,
  onCheckedChange,
}: CheckboxProps) {
  const primary = useColor('primary');
  const primaryForegroundColor = useColor('primaryForeground');
  const danger = useColor('red');
  const borderColor = useColor('border');

  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, ANIMATION.pressIn);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION.pressOut);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            opacity: disabled ? DISABLED_OPACITY : 1,
            paddingVertical: 4,
          },
          animatedStyle,
        ]}
      >
        <View
          style={{
            width: BORDER_RADIUS,
            height: BORDER_RADIUS,
            borderRadius: BORDER_RADIUS,
            borderWidth: 1.5,
            borderColor: checked ? primary : borderColor,
            backgroundColor: checked ? primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: label ? 8 : 0,
          }}
        >
          {checked && (
            <Check
              size={16}
              color={primaryForegroundColor}
              strokeWidth={3}
              strokeLinecap='round'
            />
          )}
        </View>
        {label && (
          <Text
            variant='caption'
            numberOfLines={1}
            ellipsizeMode='tail'
            style={[
              {
                color: error ? danger : primary,
              },
              labelStyle,
            ]}
            pointerEvents='none'
          >
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}
