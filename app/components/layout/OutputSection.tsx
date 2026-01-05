import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';
import { Image } from 'expo-image';
import { ImageIcon } from 'lucide-react-native';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { GenerationProgress } from '@/components/avatar/GenerationProgress';
import type { GenerationStatus } from '@/schemas/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OutputSectionProps {
  imageUrl: string | null;
  isGenerating: boolean;
  progress: number;
  status: GenerationStatus | null;
  onPress?: () => void;
}

export function OutputSection({
  imageUrl,
  isGenerating,
  progress,
  status,
  onPress,
}: OutputSectionProps) {
  const backgroundColor = useColor('backgroundSecondary');
  const borderColor = useColor('border');
  const textColor = useColor('textMuted');
  const iconColor = useColor('icon');

  const previewSize = SCREEN_WIDTH - 48;

  if (isGenerating && status) {
    return (
      <View style={styles.wrapper}>
        <View
          style={[
            styles.container,
            styles.generatingContainer,
            {
              width: previewSize,
              height: previewSize,
              backgroundColor,
              borderColor,
            },
          ]}
        >
          <GenerationProgress status={status} progress={progress} />
        </View>
      </View>
    );
  }

  if (imageUrl) {
    return (
      <View style={styles.wrapper}>
        <Pressable onPress={onPress}>
          <View
            style={[
              styles.container,
              {
                width: previewSize,
                height: previewSize,
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
        </Pressable>
        <Text style={[styles.hint, { color: textColor }]}>
          Tap to preview
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          styles.emptyState,
          {
            width: previewSize,
            height: previewSize,
            backgroundColor,
            borderColor,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: borderColor }]}>
          <ImageIcon size={48} color={iconColor} />
        </View>
        <Text style={[styles.emptyTitle, { color: textColor }]}>
          Your avatar will appear here
        </Text>
        <Text style={[styles.emptySubtitle, { color: textColor }]}>
          Select an image and customize your settings below
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 8,
  },
  container: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingContainer: {
    overflow: 'visible',
    padding: 24,
  },
  emptyState: {
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
  },
});
