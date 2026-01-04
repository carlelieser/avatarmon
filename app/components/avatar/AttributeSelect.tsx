import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';

interface AttributeOption {
  value: string;
  label: string;
  icon?: string;
}

interface AttributeSelectProps {
  label: string;
  options: AttributeOption[];
  value: string;
  onChange: (value: string) => void;
  layout?: 'horizontal' | 'grid' | 'list';
  testID?: string;
}

export function AttributeSelect({
  label,
  options,
  value,
  onChange,
  layout = 'horizontal',
  testID,
}: AttributeSelectProps) {
  const labelColor = useColor('text');
  const backgroundColor = useColor('backgroundSecondary');
  const selectedBgColor = useColor('primary');
  const textColor = useColor('text');
  const selectedTextColor = useColor('primaryForeground');
  const borderColor = useColor('border');

  const getOptionStyle = (isSelected: boolean): ViewStyle => ({
    backgroundColor: isSelected ? selectedBgColor : backgroundColor,
    borderColor: isSelected ? selectedBgColor : borderColor,
  });

  const renderOption = (option: AttributeOption) => {
    const isSelected = value === option.value;

    return (
      <Pressable
        key={option.value}
        testID={testID ? `${testID}-option-${option.value}` : undefined}
        onPress={() => onChange(option.value)}
        style={[
          styles.option,
          layout === 'grid' ? styles.gridOption : styles.horizontalOption,
          getOptionStyle(isSelected),
        ]}
        accessibilityRole="button"
        accessibilityLabel={option.label}
        accessibilityState={{ selected: isSelected }}
      >
        {option.icon && <Text style={styles.optionIcon}>{option.icon}</Text>}
        <Text
          style={[
            styles.optionLabel,
            { color: isSelected ? selectedTextColor : textColor },
          ]}
          numberOfLines={1}
        >
          {option.label}
        </Text>
      </Pressable>
    );
  };

  const containerStyle: ViewStyle = layout === 'grid'
    ? styles.gridContainer
    : styles.horizontalContainer;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      {layout === 'horizontal' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          testID={testID ? `${testID}-options` : undefined}
        >
          {options.map(renderOption)}
        </ScrollView>
      ) : (
        <View
          style={containerStyle}
          testID={testID ? `${testID}-options` : undefined}
        >
          {options.map(renderOption)}
        </View>
      )}
    </View>
  );
}

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
  scrollContent: {
    gap: 8,
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderRadius: BORDER_RADIUS / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  gridOption: {
    width: '30%',
    aspectRatio: 1.5,
  },
  optionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
