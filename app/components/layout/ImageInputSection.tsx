import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';

interface ImageInputSectionProps {
  photoUri: string | null;
  onPhotoSelected: (asset: ImagePicker.ImagePickerAsset) => void;
  onPhotoClear: () => void;
}

export function ImageInputSection({
  photoUri,
  onPhotoSelected,
  onPhotoClear,
}: ImageInputSectionProps) {
  const backgroundColor = useColor('backgroundSecondary');
  const borderColor = useColor('border');
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');
  const primaryForeground = useColor('primaryForeground');

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoSelected(result.assets[0]);
    }
  };

  if (photoUri) {
    return (
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>Source Image</Text>
        <View style={styles.selectedContainer}>
          <View style={[styles.thumbnail, { borderColor }]}>
            <Image
              source={{ uri: photoUri }}
              style={styles.thumbnailImage}
              contentFit="cover"
            />
            <Pressable
              style={[styles.removeButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
              onPress={onPhotoClear}
            >
              <X size={16} color="#fff" />
            </Pressable>
          </View>
          <Pressable
            style={[styles.changeButton, { borderColor }]}
            onPress={handlePickImage}
          >
            <ImagePlus size={20} color={primaryColor} />
            <Text style={[styles.changeText, { color: primaryColor }]}>
              Change Image
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: textColor }]}>Source Image</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.inputButton, { backgroundColor, borderColor }]}
          onPress={handlePickImage}
        >
          <ImagePlus size={24} color={primaryColor} />
          <Text style={[styles.buttonText, { color: textColor }]}>Gallery</Text>
        </Pressable>
        <Pressable
          style={[styles.inputButton, styles.primaryButton, { backgroundColor: primaryColor }]}
          onPress={handlePickImage}
        >
          <Camera size={24} color={primaryForeground} />
          <Text style={[styles.buttonText, { color: primaryForeground }]}>Camera</Text>
        </Pressable>
      </View>
      <Text style={[styles.hint, { color: mutedColor }]}>
        Or use the character builder below
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  changeText: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
});
