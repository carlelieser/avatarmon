import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { PhotoSlot } from './PhotoSlot';
import { usePhotoPicker } from '@/hooks/usePhotoPicker';
import { MAX_PHOTOS, MIN_PHOTOS } from '@/constants/styles';
import { Camera, ImageIcon } from 'lucide-react-native';

interface PhotoUploadSectionProps {
  photos: string[];
  onAddPhoto: (base64: string) => void;
  onRemovePhoto: (index: number) => void;
  onContinue: () => void;
}

export function PhotoUploadSection({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onContinue,
}: PhotoUploadSectionProps) {
  const { pickFromGallery, takePhoto, isLoading, error } = usePhotoPicker();

  const canContinue = photos.length >= MIN_PHOTOS;

  const handleAddPhoto = async (source: 'gallery' | 'camera') => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum Photos', `You can only add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const base64 = source === 'gallery' ? await pickFromGallery() : await takePhoto();

    if (base64) {
      onAddPhoto(base64);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose a source for your reference photo',
      [
        { text: 'Camera', onPress: () => handleAddPhoto('camera') },
        { text: 'Gallery', onPress: () => handleAddPhoto('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text variant="title" style={styles.title}>
          Upload Photos
        </Text>
        <Text variant="caption" style={styles.description}>
          Add 1-3 reference photos for the best results. Your likeness will be preserved.
        </Text>

        <View style={styles.quickActions}>
          <Button
            variant="outline"
            size="sm"
            icon={Camera}
            onPress={() => handleAddPhoto('camera')}
            disabled={photos.length >= MAX_PHOTOS || isLoading}
            style={styles.quickButton}
          >
            Camera
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={ImageIcon}
            onPress={() => handleAddPhoto('gallery')}
            disabled={photos.length >= MAX_PHOTOS || isLoading}
            style={styles.quickButton}
          >
            Gallery
          </Button>
        </View>
      </View>

      <View style={styles.slotsContainer}>
        {[0, 1, 2].map((index) => (
          <PhotoSlot
            key={index}
            index={index}
            imageUri={photos[index] ?? null}
            onAdd={showPhotoOptions}
            onRemove={() => onRemovePhoto(index)}
            isLoading={isLoading}
          />
        ))}
      </View>

      {error && (
        <Text variant="caption" style={styles.error}>
          {error}
        </Text>
      )}

      <View style={styles.footer}>
        <Button
          onPress={onContinue}
          disabled={!canContinue}
          loading={isLoading}
        >
          Continue
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  quickButton: {
    minWidth: 120,
  },
  footer: {
    marginTop: 16,
  },
});
