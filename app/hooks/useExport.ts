import { useCallback, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AppError, ErrorCodes, ErrorMessages } from '@/lib/errors';

interface ExportResult {
  success: boolean;
  localUri?: string;
  error?: string;
}

interface UseExportResult {
  saveToGallery: (imageUrl: string) => Promise<ExportResult>;
  share: (imageUrl: string) => Promise<ExportResult>;
  isSaving: boolean;
  isSharing: boolean;
  error: string | null;
  clearError: () => void;
}

function generateFilename(): string {
  return `avatar-${Date.now()}.png`;
}

async function downloadImage(imageUrl: string): Promise<string> {
  const filename = generateFilename();
  const cacheDir = Paths.cache;
  const file = new File(cacheDir, filename);

  // Fetch the image and write to file
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new AppError(
      'Failed to download image',
      ErrorCodes.EXPORT_FAILED,
      ErrorMessages[ErrorCodes.EXPORT_FAILED]
    );
  }

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  await file.write(new Uint8Array(arrayBuffer));

  return file.uri;
}

export function useExport(): UseExportResult {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const saveToGallery = useCallback(
    async (imageUrl: string): Promise<ExportResult> => {
      setIsSaving(true);
      setError(null);

      try {
        // Request permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          const errorMessage = ErrorMessages[ErrorCodes.PERMISSION_DENIED];
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        // Download image
        const localUri = await downloadImage(imageUrl);

        // Save to gallery
        await MediaLibrary.saveToLibraryAsync(localUri);

        return { success: true, localUri };
      } catch (err) {
        const errorMessage =
          err instanceof AppError
            ? err.userMessage
            : ErrorMessages[ErrorCodes.EXPORT_FAILED];
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const share = useCallback(async (imageUrl: string): Promise<ExportResult> => {
    setIsSharing(true);
    setError(null);

    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        const errorMessage = 'Sharing is not available on this device';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Download image
      const localUri = await downloadImage(imageUrl);

      // Share
      await Sharing.shareAsync(localUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Avatar',
      });

      return { success: true, localUri };
    } catch (err) {
      const errorMessage =
        err instanceof AppError
          ? err.userMessage
          : ErrorMessages[ErrorCodes.EXPORT_FAILED];
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    saveToGallery,
    share,
    isSaving,
    isSharing,
    error,
    clearError,
  };
}
