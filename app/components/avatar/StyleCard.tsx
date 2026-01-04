import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type AccessibilityProps,
} from 'react-native';
import {
  Tv,
  Clapperboard,
  Box,
  Grid3X3,
  Palette,
  BookOpen,
  Cpu,
  Wand2,
  type LucideIcon,
} from 'lucide-react-native';
import type { Style } from '@/schemas/enums';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';

interface StyleCardProps extends AccessibilityProps {
  style: Style;
  label: string;
  selected: boolean;
  onSelect: (style: Style) => void;
  testID?: string;
}

const STYLE_ICONS: Record<Style, LucideIcon> = {
  anime: Tv,
  pixar: Clapperboard,
  '3d-render': Box,
  'pixel-art': Grid3X3,
  watercolor: Palette,
  comic: BookOpen,
  cyberpunk: Cpu,
  fantasy: Wand2,
};

export function StyleCard({
  style,
  label,
  selected,
  onSelect,
  testID,
  ...accessibilityProps
}: StyleCardProps) {
  const backgroundColor = useColor(selected ? 'primary' : 'card');
  const textColor = useColor(selected ? 'primaryForeground' : 'text');
  const borderColor = useColor(selected ? 'primary' : 'border');
  const iconColor = useColor(selected ? 'primaryForeground' : 'mutedForeground');

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderColor,
    borderWidth: selected ? 2 : 1,
  };

  const Icon = STYLE_ICONS[style];

  return (
    <Pressable
      testID={testID}
      onPress={() => onSelect(style)}
      style={[styles.card, cardStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...accessibilityProps}
    >
      <Icon size={32} color={iconColor} strokeWidth={1.5} />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

interface StyleCardGridProps {
  styles: Array<{ style: Style; label: string }>;
  selectedStyle: Style | null;
  onStyleSelect: (style: Style) => void;
  testID?: string;
}

export function StyleCardGrid({
  styles,
  selectedStyle,
  onStyleSelect,
  testID,
}: StyleCardGridProps) {
  return (
    <View style={gridStyles.container} testID={testID}>
      {styles.map((item) => (
        <StyleCard
          key={item.style}
          style={item.style}
          label={item.label}
          selected={selectedStyle === item.style}
          onSelect={onStyleSelect}
          testID={`style-card-${item.style}`}
          accessibilityLabel={`Select ${item.label} style`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: BORDER_RADIUS,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
  },
});

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
