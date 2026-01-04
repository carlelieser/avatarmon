import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Camera, Paintbrush } from 'lucide-react-native';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';

type SourceType = 'photo' | 'builder';

interface SourceSelectorProps {
  selectedSource: SourceType | null;
  onSourceSelect: (source: SourceType) => void;
  testID?: string;
}

interface SourceOptionProps {
  type: SourceType;
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  testID?: string;
}

function SourceOption({
  type,
  icon,
  title,
  description,
  selected,
  onSelect,
  testID,
}: SourceOptionProps) {
  const backgroundColor = useColor(selected ? 'primary' : 'card');
  const textColor = useColor(selected ? 'primaryForeground' : 'text');
  const descColor = useColor(selected ? 'primaryForeground' : 'textMuted');
  const borderColor = useColor(selected ? 'primary' : 'border');

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderColor,
    borderWidth: selected ? 2 : 1,
  };

  return (
    <Pressable
      testID={testID}
      onPress={onSelect}
      style={[styles.option, cardStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}: ${description}`}
    >
      <View style={[styles.iconContainer, { opacity: selected ? 1 : 0.7 }]}>
        {icon}
      </View>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.description, { color: descColor }]}>{description}</Text>
    </Pressable>
  );
}

export function SourceSelector({
  selectedSource,
  onSourceSelect,
  testID,
}: SourceSelectorProps) {
  const labelColor = useColor('text');
  const iconColor = useColor('text');
  const selectedIconColor = useColor('primaryForeground');

  return (
    <View testID={testID} style={styles.container}>
      <Text style={[styles.label, { color: labelColor }]}>
        How would you like to create your avatar?
      </Text>
      <View style={styles.optionsContainer}>
        <SourceOption
          type="photo"
          icon={
            <Camera
              size={32}
              color={selectedSource === 'photo' ? selectedIconColor : iconColor}
            />
          }
          title="Upload Photo"
          description="Transform your selfie into an avatar"
          selected={selectedSource === 'photo'}
          onSelect={() => onSourceSelect('photo')}
          testID={testID ? `${testID}-photo` : undefined}
        />
        <SourceOption
          type="builder"
          icon={
            <Paintbrush
              size={32}
              color={selectedSource === 'builder' ? selectedIconColor : iconColor}
            />
          }
          title="Character Builder"
          description="Design your avatar from scratch"
          selected={selectedSource === 'builder'}
          onSelect={() => onSourceSelect('builder')}
          testID={testID ? `${testID}-builder` : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    width: '48%',
    padding: 20,
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
