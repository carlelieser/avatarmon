import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
  base64: true,
};

export interface UsePhotoPickerReturn {
  pickFromGallery: () => Promise<string | null>;
  takePhoto: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function usePhotoPicker(): UsePhotoPickerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync(
        IMAGE_PICKER_OPTIONS
      );

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].base64 ?? null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pick image';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].base64 ?? null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to take photo';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    pickFromGallery,
    takePhoto,
    isLoading,
    error,
  };
}
