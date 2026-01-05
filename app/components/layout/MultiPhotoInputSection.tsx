import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';
import type { PhotoItem } from '@/schemas/avatar';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, Plus, X } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';

const MAX_PHOTOS = 3;

interface MultiPhotoInputSectionProps {
  photos: PhotoItem[];
  onPhotoAdd: (asset: ImagePicker.ImagePickerAsset) => void;
  onPhotoRemove: (index: number) => void;
}

export function MultiPhotoInputSection({
  photos,
  onPhotoAdd,
  onPhotoRemove,
}: MultiPhotoInputSectionProps) {
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
      onPhotoAdd(result.assets[0]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoAdd(result.assets[0]);
    }
  };

  const canAddMore = photos.length < MAX_PHOTOS;

  // Empty state - show buttons to add first photo
  if (photos.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>
          Your Photos (1-3 required)
        </Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.inputButton, { backgroundColor, borderColor }]}
            onPress={handlePickImage}
          >
            <ImagePlus size={24} color={primaryColor} />
            <Text style={[styles.buttonText, { color: textColor }]}>Gallery</Text>
          </Pressable>
          <Pressable
            style={[
              styles.inputButton,
              styles.primaryButton,
              { backgroundColor: primaryColor },
            ]}
            onPress={handleTakePhoto}
          >
            <Camera size={24} color={primaryForeground} />
            <Text style={[styles.buttonText, { color: primaryForeground }]}>
              Camera
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.hint, { color: mutedColor }]}>
          Add 1-3 photos for best results. Different angles improve accuracy.
        </Text>
      </View>
    );
  }

  // Has photos - show grid with add button
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: textColor }]}>
          Your Photos ({photos.length}/{MAX_PHOTOS})
        </Text>
      </View>

      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <View key={photo.uri} style={[styles.photoItem, { borderColor }]}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.photoImage}
              contentFit="cover"
            />
            <Pressable
              style={styles.removeButton}
              onPress={() => onPhotoRemove(index)}
            >
              <X size={14} color="#fff" />
            </Pressable>
            {index === 0 && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Main</Text>
              </View>
            )}
          </View>
        ))}

        {canAddMore && (
          <Pressable
            style={[styles.addButton, { backgroundColor, borderColor }]}
            onPress={handlePickImage}
          >
            <Plus size={28} color={mutedColor} />
            <Text style={[styles.addButtonText, { color: mutedColor }]}>Add</Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.hint, { color: mutedColor }]}>
        {photos.length === 1
          ? 'Add more photos from different angles for better results.'
          : photos.length === 2
            ? 'One more photo can improve accuracy further.'
            : 'Great! 3 photos gives the best likeness.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoItem: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONTS.semiBold,
  },
  addButton: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
});
