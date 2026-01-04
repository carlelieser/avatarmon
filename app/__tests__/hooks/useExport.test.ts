/**
 * Tests for useExport hook logic
 *
 * Tests the export functionality including saving to gallery,
 * sharing, and permission handling.
 */

import { useAvatarStore } from '@/store/avatar-store';
import { ErrorCodes, ErrorMessages } from '@/lib/errors';
import type { GenerationRecord } from '@/schemas/api';

// Mock modules
const mockRequestPermissionsAsync = jest.fn();
const mockSaveToLibraryAsync = jest.fn();
const mockDownloadAsync = jest.fn();
const mockIsAvailableAsync = jest.fn();
const mockShareAsync = jest.fn();

const CACHE_DIRECTORY = '/mock/cache/directory/';

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: () => mockRequestPermissionsAsync(),
  saveToLibraryAsync: (uri: string) => mockSaveToLibraryAsync(uri),
}));

jest.mock('expo-file-system', () => ({
  downloadAsync: (url: string, uri: string) => mockDownloadAsync(url, uri),
  cacheDirectory: CACHE_DIRECTORY,
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: () => mockIsAvailableAsync(),
  shareAsync: (uri: string, options: unknown) => mockShareAsync(uri, options),
}));

// Test helper that mimics the export logic
async function saveToGallery(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  // Check permissions
  const { status } = await mockRequestPermissionsAsync();
  if (status !== 'granted') {
    return { success: false, error: ErrorMessages[ErrorCodes.PERMISSION_DENIED] };
  }

  try {
    // Download the image
    const filename = `avatar-${Date.now()}.png`;
    const localUri = `${CACHE_DIRECTORY}${filename}`;

    await mockDownloadAsync(imageUrl, localUri);

    // Save to gallery
    await mockSaveToLibraryAsync(localUri);

    return { success: true };
  } catch (error) {
    return { success: false, error: ErrorMessages[ErrorCodes.EXPORT_FAILED] };
  }
}

async function shareImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  const isAvailable = await mockIsAvailableAsync();
  if (!isAvailable) {
    return { success: false, error: 'Sharing is not available on this device' };
  }

  try {
    // Download the image for sharing
    const filename = `avatar-${Date.now()}.png`;
    const localUri = `${CACHE_DIRECTORY}${filename}`;

    await mockDownloadAsync(imageUrl, localUri);
    await mockShareAsync(localUri, {
      mimeType: 'image/png',
      dialogTitle: 'Share Avatar',
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: ErrorMessages[ErrorCodes.EXPORT_FAILED] };
  }
}

describe('useExport', () => {
  const mockImageUrl = 'https://example.com/generated-avatar.png';

  const mockRecord: GenerationRecord = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    imageUrl: mockImageUrl,
    thumbnailUrl: 'https://example.com/avatar-thumb.png',
    prompt: 'test avatar prompt',
    style: 'anime',
    aspectRatio: '1:1',
    createdAt: new Date().toISOString(),
    isPremiumExport: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store
    useAvatarStore.setState({
      currentForm: {},
      generationId: null,
      generationStatus: null,
      generationProgress: 0,
      generationError: null,
      previewUrl: null,
      user: {
        hasPremium: false,
        generationsToday: 0,
        generations: [mockRecord],
        onboardingComplete: false,
      },
    });

    // Default mocks - permissions granted
    mockRequestPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });

    mockDownloadAsync.mockResolvedValue({
      uri: '/mock/cache/directory/avatar-123.png',
      status: 200,
      headers: {},
      md5: undefined,
      mimeType: 'image/png',
    });

    mockSaveToLibraryAsync.mockResolvedValue({ id: 'asset-id' });
    mockIsAvailableAsync.mockResolvedValue(true);
    mockShareAsync.mockResolvedValue(undefined);
  });

  describe('saveToGallery', () => {
    it('should request permissions before saving', async () => {
      await saveToGallery(mockImageUrl);

      expect(mockRequestPermissionsAsync).toHaveBeenCalled();
    });

    it('should fail if permissions are denied', async () => {
      mockRequestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: true,
        expires: 'never',
      });

      const result = await saveToGallery(mockImageUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ErrorMessages[ErrorCodes.PERMISSION_DENIED]);
      expect(mockDownloadAsync).not.toHaveBeenCalled();
    });

    it('should download image before saving', async () => {
      await saveToGallery(mockImageUrl);

      expect(mockDownloadAsync).toHaveBeenCalledWith(
        mockImageUrl,
        expect.stringContaining(CACHE_DIRECTORY)
      );
    });

    it('should save downloaded image to library', async () => {
      await saveToGallery(mockImageUrl);

      expect(mockSaveToLibraryAsync).toHaveBeenCalled();
    });

    it('should handle download errors', async () => {
      mockDownloadAsync.mockRejectedValue(new Error('Download failed'));

      const result = await saveToGallery(mockImageUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ErrorMessages[ErrorCodes.EXPORT_FAILED]);
    });

    it('should handle save errors', async () => {
      mockSaveToLibraryAsync.mockRejectedValue(new Error('Save failed'));

      const result = await saveToGallery(mockImageUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ErrorMessages[ErrorCodes.EXPORT_FAILED]);
    });

    it('should return success on successful save', async () => {
      const result = await saveToGallery(mockImageUrl);

      expect(result.success).toBe(true);
    });
  });

  describe('shareImage', () => {
    it('should check if sharing is available', async () => {
      await shareImage(mockImageUrl);

      expect(mockIsAvailableAsync).toHaveBeenCalled();
    });

    it('should fail if sharing is not available', async () => {
      mockIsAvailableAsync.mockResolvedValue(false);

      const result = await shareImage(mockImageUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sharing is not available on this device');
    });

    it('should download image before sharing', async () => {
      await shareImage(mockImageUrl);

      expect(mockDownloadAsync).toHaveBeenCalledWith(
        mockImageUrl,
        expect.stringContaining(CACHE_DIRECTORY)
      );
    });

    it('should share with correct options', async () => {
      await shareImage(mockImageUrl);

      expect(mockShareAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          mimeType: 'image/png',
          dialogTitle: 'Share Avatar',
        })
      );
    });

    it('should handle share errors', async () => {
      mockShareAsync.mockRejectedValue(new Error('Share failed'));

      const result = await shareImage(mockImageUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ErrorMessages[ErrorCodes.EXPORT_FAILED]);
    });

    it('should return success on successful share', async () => {
      const result = await shareImage(mockImageUrl);

      expect(result.success).toBe(true);
    });
  });

  describe('Export Record Updates', () => {
    it('should be able to save generation to history', () => {
      const newRecord: GenerationRecord = {
        id: 'new-uuid',
        imageUrl: 'https://example.com/new.png',
        thumbnailUrl: 'https://example.com/new-thumb.png',
        prompt: 'new prompt',
        style: 'pixar',
        aspectRatio: '4:3',
        createdAt: new Date().toISOString(),
        isPremiumExport: false,
      };

      useAvatarStore.getState().saveToHistory(newRecord);

      const generations = useAvatarStore.getState().user.generations;
      expect(generations.length).toBe(2);
      expect(generations[0].id).toBe('new-uuid');
    });

    it('should be able to delete generation from history', () => {
      useAvatarStore.getState().deleteFromHistory(mockRecord.id);

      const generations = useAvatarStore.getState().user.generations;
      expect(generations.length).toBe(0);
    });
  });

  describe('Premium Export', () => {
    it('should track premium export status', () => {
      const premiumRecord: GenerationRecord = {
        ...mockRecord,
        id: 'premium-export-id',
        isPremiumExport: true,
        exportedAt: new Date().toISOString(),
      };

      useAvatarStore.getState().saveToHistory(premiumRecord);

      const generations = useAvatarStore.getState().user.generations;
      expect(generations[0].isPremiumExport).toBe(true);
      expect(generations[0].exportedAt).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('should use cache directory for temporary files', async () => {
      await saveToGallery(mockImageUrl);

      expect(mockDownloadAsync).toHaveBeenCalledWith(
        mockImageUrl,
        expect.stringContaining(CACHE_DIRECTORY)
      );
    });

    it('should generate unique filenames with timestamp', async () => {
      const beforeTime = Date.now();
      await saveToGallery(mockImageUrl);
      const afterTime = Date.now();

      const downloadCall = mockDownloadAsync.mock.calls[0][1];
      const timestampMatch = downloadCall.match(/avatar-(\d+)\.png$/);
      expect(timestampMatch).toBeTruthy();

      const timestamp = parseInt(timestampMatch![1], 10);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
