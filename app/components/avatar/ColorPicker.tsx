import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  type ViewStyle,
  type AccessibilityProps,
} from 'react-native';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';

interface ColorSwatchProps extends AccessibilityProps {
  color: string;
  value?: string;
  selected: boolean;
  onSelect: (value: string) => void;
  label?: string;
  labelColor?: string;
  testID?: string;
}

export function ColorSwatch({
  color,
  value,
  selected,
  onSelect,
  label,
  labelColor,
  testID,
  ...accessibilityProps
}: ColorSwatchProps) {
  const borderColor = useColor('border');
  const selectedBorderColor = useColor('primary');
  const defaultLabelColor = useColor('textMuted');

  const swatchStyle: ViewStyle = {
    backgroundColor: color,
    borderColor: selected ? selectedBorderColor : borderColor,
    borderWidth: selected ? 3 : 1,
  };

  return (
    <View style={styles.swatchContainer}>
      <Pressable
        testID={testID}
        onPress={() => onSelect(value ?? color)}
        style={[styles.swatch, swatchStyle]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        {...accessibilityProps}
      />
      {label && (
        <Text
          style={[styles.swatchLabel, { color: labelColor ?? defaultLabelColor }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

type ColorOption = string | { color: string; label?: string; value?: string };

interface ColorPickerProps {
  label: string;
  colors: ColorOption[];
  selectedColor: string;
  onColorSelect: (value: string) => void;
  allowCustom?: boolean;
  testID?: string;
}

export function ColorPicker({
  label,
  colors,
  selectedColor,
  onColorSelect,
  allowCustom = false,
  testID,
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState('');
  const labelColor = useColor('text');
  const inputBgColor = useColor('backgroundSecondary');
  const inputBorderColor = useColor('border');
  const mutedColor = useColor('textMuted');

  const normalizedColors = colors.map((c) =>
    typeof c === 'string'
      ? { color: c, label: undefined, value: c }
      : { ...c, value: c.value ?? c.color }
  );

  const handleCustomSubmit = () => {
    if (customColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      onColorSelect(customColor);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View style={styles.colorsContainer} testID={testID}>
        {normalizedColors.map((item) => (
          <ColorSwatch
            key={item.value}
            color={item.color}
            value={item.value}
            label={item.label}
            selected={selectedColor === item.value}
            onSelect={onColorSelect}
            testID={`color-swatch-${item.value}`}
            accessibilityLabel={item.label || `Color ${item.color}`}
          />
        ))}
      </View>
      {allowCustom && (
        <View style={styles.customContainer}>
          <TextInput
            style={[
              styles.customInput,
              {
                backgroundColor: inputBgColor,
                borderColor: inputBorderColor,
                color: labelColor,
              },
            ]}
            placeholder="#FFFFFF"
            placeholderTextColor={mutedColor}
            value={customColor}
            onChangeText={setCustomColor}
            onSubmitEditing={handleCustomSubmit}
            autoCapitalize="characters"
            maxLength={7}
          />
          {customColor.match(/^#[0-9A-Fa-f]{6}$/) && (
            <View
              style={[styles.customPreview, { backgroundColor: customColor }]}
            />
          )}
        </View>
      )}
    </View>
  );
}

const SWATCH_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FONTS.semiBold,
    marginBottom: 12,
    includeFontPadding: false,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatchContainer: {
    alignItems: 'center',
    width: SWATCH_SIZE + 12,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
  },
  swatchLabel: {
    fontSize: 10,
    lineHeight: 12,
    marginTop: 4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  customContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  customInput: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS / 2,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  customPreview: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS / 2,
    marginLeft: 8,
  },
});
