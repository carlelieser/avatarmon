import { useState, useCallback } from 'react';
import { cacheDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export interface UseExportReturn {
  saveToDevice: (imageUrl: string) => Promise<boolean>;
  shareImage: (imageUrl: string) => Promise<boolean>;
  isSaving: boolean;
  isSharing: boolean;
  error: string | null;
}

export function useExport(): UseExportReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadImage = async (imageUrl: string): Promise<string | null> => {
    const filename = `avatar_${Date.now()}.png`;
    const localUri = `${cacheDirectory}${filename}`;

    try {
      const downloadResult = await downloadAsync(imageUrl, localUri);
      return downloadResult.uri;
    } catch {
      return null;
    }
  };

  const saveToDevice = useCallback(
    async (imageUrl: string): Promise<boolean> => {
      try {
        setIsSaving(true);
        setError(null);

        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status !== 'granted') {
          setError('Permission to access media library was denied');
          return false;
        }

        const localUri = await downloadImage(imageUrl);

        if (!localUri) {
          setError('Failed to download image');
          return false;
        }

        await MediaLibrary.saveToLibraryAsync(localUri);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to save image';
        setError(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const shareImage = useCallback(
    async (imageUrl: string): Promise<boolean> => {
      try {
        setIsSharing(true);
        setError(null);

        const isAvailable = await Sharing.isAvailableAsync();

        if (!isAvailable) {
          setError('Sharing is not available on this device');
          return false;
        }

        const localUri = await downloadImage(imageUrl);

        if (!localUri) {
          setError('Failed to download image');
          return false;
        }

        await Sharing.shareAsync(localUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your avatar',
        });

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to share image';
        setError(message);
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  return {
    saveToDevice,
    shareImage,
    isSaving,
    isSharing,
    error,
  };
}
