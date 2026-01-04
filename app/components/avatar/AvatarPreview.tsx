import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS } from '@/theme/globals';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AvatarPreviewProps {
  imageUrl: string | null;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16';
  showPlaceholder?: boolean;
  placeholderText?: string;
  testID?: string;
}

const ASPECT_RATIOS = {
  '1:1': 1,
  '3:4': 3 / 4,
  '4:3': 4 / 3,
  '9:16': 9 / 16,
};

export function AvatarPreview({
  imageUrl,
  aspectRatio = '1:1',
  showPlaceholder = true,
  placeholderText = 'Your avatar will appear here',
  testID,
}: AvatarPreviewProps) {
  const backgroundColor = useColor('backgroundSecondary');
  const borderColor = useColor('border');
  const textColor = useColor('textMuted');

  const ratio = ASPECT_RATIOS[aspectRatio];
  const previewWidth = SCREEN_WIDTH - 48;
  const previewHeight = previewWidth / ratio;

  if (!imageUrl && showPlaceholder) {
    return (
      <View
        testID={testID}
        style={[
          styles.container,
          {
            width: previewWidth,
            height: previewHeight,
            backgroundColor,
            borderColor,
          },
        ]}
      >
        <Text style={[styles.placeholder, { color: textColor }]}>
          {placeholderText}
        </Text>
      </View>
    );
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          width: previewWidth,
          height: previewHeight,
          borderColor,
        },
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
