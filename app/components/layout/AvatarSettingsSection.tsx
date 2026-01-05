import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Checkbox } from '@/components/ui/checkbox';
import { AttributeSelect, ColorPicker, StyleCardGrid } from '@/components/avatar';
import type { StyleModifiers } from '@/schemas/avatar';
import type { Style } from '@/schemas/enums';

// Background color presets
const BACKGROUND_COLORS = [
  { color: '#ffffff', label: 'White' },
  { color: '#f5f5f5', label: 'Light Gray' },
  { color: '#e0e0e0', label: 'Gray' },
  { color: '#1a1a1a', label: 'Dark' },
  { color: '#000000', label: 'Black' },
  { color: '#6366f1', label: 'Indigo' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#ef4444', label: 'Red' },
  { color: '#f97316', label: 'Orange' },
  { color: '#eab308', label: 'Yellow' },
  { color: '#22c55e', label: 'Green' },
  { color: '#14b8a6', label: 'Teal' },
  { color: '#3b82f6', label: 'Blue' },
];

const STYLES: Array<{ style: Style; label: string }> = [
  { style: 'anime', label: 'Anime' },
  { style: 'pixar', label: 'Pixar' },
  { style: '3d-render', label: '3D Render' },
  { style: 'pixel-art', label: 'Pixel Art' },
  { style: 'watercolor', label: 'Watercolor' },
  { style: 'comic', label: 'Comic' },
  { style: 'cyberpunk', label: 'Cyberpunk' },
  { style: 'fantasy', label: 'Fantasy' },
];

// Hair color options with hex values for ColorPicker (includes fantasy colors)
const HAIR_COLOR_OPTIONS = [
  { color: '#1a1a1a', label: 'Black', value: 'black' },
  { color: '#3d2314', label: 'Dark Brown', value: 'dark-brown' },
  { color: '#6b4423', label: 'Brown', value: 'brown' },
  { color: '#9a7b4f', label: 'Light Brown', value: 'light-brown' },
  { color: '#e8d5a3', label: 'Blonde', value: 'blonde' },
  { color: '#f5f5dc', label: 'Platinum', value: 'platinum' },
  { color: '#a52a2a', label: 'Red', value: 'red' },
  { color: '#6b3a3a', label: 'Auburn', value: 'auburn' },
  { color: '#d4652f', label: 'Ginger', value: 'ginger' },
  { color: '#808080', label: 'Gray', value: 'gray' },
  { color: '#f5f5f5', label: 'White', value: 'white' },
  { color: '#4a90d9', label: 'Blue', value: 'blue' },
  { color: '#ff69b4', label: 'Pink', value: 'pink' },
  { color: '#9b59b6', label: 'Purple', value: 'purple' },
  { color: '#2ecc71', label: 'Green', value: 'green' },
];

const EXPRESSION_OPTIONS = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'happy', label: 'Happy' },
  { value: 'smiling', label: 'Smiling' },
  { value: 'laughing', label: 'Laughing' },
  { value: 'confident', label: 'Confident' },
  { value: 'serious', label: 'Serious' },
  { value: 'thoughtful', label: 'Thoughtful' },
  { value: 'mysterious', label: 'Mysterious' },
  { value: 'playful', label: 'Playful' },
];

const FACIAL_HAIR_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'stubble', label: 'Stubble' },
  { value: 'short-beard', label: 'Short Beard' },
  { value: 'full-beard', label: 'Full Beard' },
  { value: 'long-beard', label: 'Long Beard' },
  { value: 'goatee', label: 'Goatee' },
  { value: 'mustache', label: 'Mustache' },
  { value: 'soul-patch', label: 'Soul Patch' },
];

const ACCESSORY_OPTIONS = [
  { value: 'glasses', label: 'Glasses' },
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'nose-ring', label: 'Nose Ring' },
  { value: 'hat', label: 'Hat' },
  { value: 'beanie', label: 'Beanie' },
  { value: 'headband', label: 'Headband' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'necklace', label: 'Necklace' },
  { value: 'scarf', label: 'Scarf' },
];

const ASPECT_RATIO_OPTIONS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '3:4', label: 'Portrait (3:4)' },
  { value: '4:3', label: 'Landscape (4:3)' },
  { value: '9:16', label: 'Story (9:16)' },
];

const BACKGROUND_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'nature', label: 'Nature' },
  { value: 'urban', label: 'Urban' },
  { value: 'studio', label: 'Studio' },
  { value: 'transparent', label: 'Transparent' },
];

interface CategoryProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function Category({ title, children, defaultExpanded = false }: CategoryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);

  const backgroundColor = useColor('card');
  const borderColor = useColor('border');
  const textColor = useColor('text');
  const iconColor = useColor('icon');

  const handleToggle = () => {
    setExpanded(!expanded);
    rotation.value = withTiming(expanded ? 0 : 180, { duration: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.category, { backgroundColor, borderColor }]}>
      <Pressable style={styles.categoryHeader} onPress={handleToggle}>
        <Text style={[styles.categoryTitle, { color: textColor }]}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={20} color={iconColor} />
        </Animated.View>
      </Pressable>
      {expanded && <View style={styles.categoryContent}>{children}</View>}
    </View>
  );
}

interface AvatarSettingsSectionProps {
  selectedStyle: Style | null;
  onStyleSelect: (style: Style) => void;
  styleModifiers?: Partial<StyleModifiers>;
  onModifierChange: (key: keyof StyleModifiers, value: string) => void;
  onAccessoriesChange: (accessories: string[]) => void;
  backgroundType: string;
  onBackgroundChange: (value: string) => void;
  primaryColor?: string;
  onPrimaryColorChange?: (color: string) => void;
  secondaryColor?: string;
  onSecondaryColorChange?: (color: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
}

export function AvatarSettingsSection({
  selectedStyle,
  onStyleSelect,
  styleModifiers,
  onModifierChange,
  onAccessoriesChange,
  backgroundType,
  onBackgroundChange,
  primaryColor,
  onPrimaryColorChange,
  secondaryColor,
  onSecondaryColorChange,
  aspectRatio,
  onAspectRatioChange,
}: AvatarSettingsSectionProps) {
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');

  return (
    <View style={styles.container}>
      {/* Style Selection - Always visible */}
      <View style={styles.styleSection}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Style</Text>
        <StyleCardGrid
          styles={STYLES}
          selectedStyle={selectedStyle}
          onStyleSelect={onStyleSelect}
        />
      </View>

      {/* Style Suggestions Header */}
      <View style={styles.modifiersHeader}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Style Suggestions
        </Text>
        <Text style={[styles.optionalLabel, { color: mutedColor }]}>
          Optional
        </Text>
      </View>

      {/* Hair Color - For fantasy colors */}
      <Category title="Hair Color">
        <ColorPicker
          label="Color"
          colors={HAIR_COLOR_OPTIONS}
          selectedColor={styleModifiers?.hairColor ?? ''}
          onColorSelect={(v) => onModifierChange('hairColor', v)}
        />
        <Text style={[styles.modifierHint, { color: mutedColor }]}>
          Override natural hair color (e.g., for fantasy colors)
        </Text>
      </Category>

      {/* Expression Category */}
      <Category title="Expression">
        <AttributeSelect
          label="Expression"
          options={EXPRESSION_OPTIONS}
          value={styleModifiers?.expression ?? ''}
          onChange={(v) => onModifierChange('expression', v)}
        />
        <AttributeSelect
          label="Facial Hair"
          options={FACIAL_HAIR_OPTIONS}
          value={styleModifiers?.facialHair ?? ''}
          onChange={(v) => onModifierChange('facialHair', v)}
        />
      </Category>

      {/* Accessories Category */}
      <Category title="Accessories">
        <View style={styles.accessoriesGrid}>
          {ACCESSORY_OPTIONS.map((option) => {
            const isSelected = styleModifiers?.accessories?.includes(option.value as any) ?? false;
            const currentAccessories = styleModifiers?.accessories ?? [];
            return (
              <View key={option.value} style={styles.accessoryItem}>
                <Checkbox
                  checked={isSelected}
                  label={option.label}
                  disabled={!isSelected && currentAccessories.length >= 3}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onAccessoriesChange([...currentAccessories, option.value]);
                    } else {
                      onAccessoriesChange(currentAccessories.filter((a) => a !== option.value));
                    }
                  }}
                />
              </View>
            );
          })}
        </View>
        <Text style={[styles.accessoryHint, { color: mutedColor }]}>
          Select up to 3 accessories
        </Text>
      </Category>

      {/* Output Category */}
      <Category title="Output">
        <AttributeSelect
          label="Aspect Ratio"
          options={ASPECT_RATIO_OPTIONS}
          value={aspectRatio}
          onChange={onAspectRatioChange}
        />
      </Category>

      {/* Background Category */}
      <Category title="Background">
        <AttributeSelect
          label="Type"
          options={BACKGROUND_OPTIONS}
          value={backgroundType}
          onChange={onBackgroundChange}
        />
        {(backgroundType === 'solid' || backgroundType === 'gradient') && onPrimaryColorChange && (
          <ColorPicker
            label="Primary Color"
            colors={BACKGROUND_COLORS}
            selectedColor={primaryColor || '#ffffff'}
            onColorSelect={onPrimaryColorChange}
            allowCustom
          />
        )}
        {backgroundType === 'gradient' && onSecondaryColorChange && (
          <ColorPicker
            label="Secondary Color"
            colors={BACKGROUND_COLORS}
            selectedColor={secondaryColor || '#6366f1'}
            onColorSelect={onSecondaryColorChange}
            allowCustom
          />
        )}
      </Category>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 12,
  },
  styleSection: {
    marginBottom: 8,
  },
  modifiersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  optionalLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  modifierHint: {
    fontSize: 12,
    marginTop: 8,
  },
  category: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  categoryContent: {
    padding: 16,
    paddingTop: 0,
  },
  accessoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accessoryItem: {
    width: '48%',
  },
  accessoryHint: {
    fontSize: 12,
    marginTop: 8,
  },
});
