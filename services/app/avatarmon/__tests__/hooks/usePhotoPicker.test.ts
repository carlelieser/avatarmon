import { renderHook, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePhotoPicker } from '@/hooks/usePhotoPicker';

jest.mock('expo-image-picker');

const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

const grantedPermission: ImagePicker.PermissionResponse = {
  status: ImagePicker.PermissionStatus.GRANTED,
  granted: true,
  canAskAgain: true,
  expires: 'never',
};

const deniedPermission: ImagePicker.PermissionResponse = {
  status: ImagePicker.PermissionStatus.DENIED,
  granted: false,
  canAskAgain: true,
  expires: 'never',
};

const successResult: ImagePicker.ImagePickerSuccessResult = {
  canceled: false,
  assets: [
    {
      uri: 'file://photo.jpg',
      base64: 'base64encodedimage',
      width: 100,
      height: 100,
      mimeType: 'image/jpeg',
      fileName: 'photo.jpg',
      type: 'image',
      assetId: null,
      exif: null,
      duration: null,
      fileSize: 1000,
    },
  ],
};

const canceledResult: ImagePicker.ImagePickerCanceledResult = {
  canceled: true,
  assets: null,
};

describe('usePhotoPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pickFromGallery', () => {
    it('should return base64 image when user selects a photo', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue(
        grantedPermission
      );
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue(successResult);

      const { result } = renderHook(() => usePhotoPicker());

      let photo: string | null = null;
      await act(async () => {
        photo = await result.current.pickFromGallery();
      });

      expect(photo).toBe('base64encodedimage');
      expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaTypes: ['images'],
          base64: true,
          quality: 0.8,
        })
      );
    });

    it('should return null when user cancels selection', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue(
        grantedPermission
      );
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue(canceledResult);

      const { result } = renderHook(() => usePhotoPicker());

      let photo: string | null = null;
      await act(async () => {
        photo = await result.current.pickFromGallery();
      });

      expect(photo).toBeNull();
    });

    it('should return null when permission is denied', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue(
        deniedPermission
      );

      const { result } = renderHook(() => usePhotoPicker());

      let photo: string | null = null;
      await act(async () => {
        photo = await result.current.pickFromGallery();
      });

      expect(photo).toBeNull();
      expect(mockImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('should set isLoading during operation', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue(
        grantedPermission
      );

      let resolvePickerPromise: (value: ImagePicker.ImagePickerResult) => void;
      const pickerPromise = new Promise<ImagePicker.ImagePickerResult>(
        (resolve) => {
          resolvePickerPromise = resolve;
        }
      );
      mockImagePicker.launchImageLibraryAsync.mockReturnValue(pickerPromise);

      const { result } = renderHook(() => usePhotoPicker());

      expect(result.current.isLoading).toBe(false);

      const pickPromise = act(async () => {
        return result.current.pickFromGallery();
      });

      // Loading should be true while waiting
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePickerPromise!(successResult);
      });

      await pickPromise;
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('takePhoto', () => {
    it('should return base64 image when user takes a photo', async () => {
      const cameraResult: ImagePicker.ImagePickerSuccessResult = {
        canceled: false,
        assets: [
          {
            uri: 'file://camera-photo.jpg',
            base64: 'camerabase64image',
            width: 100,
            height: 100,
            mimeType: 'image/jpeg',
            fileName: 'camera-photo.jpg',
            type: 'image',
            assetId: null,
            exif: null,
            duration: null,
            fileSize: 1000,
          },
        ],
      };

      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue(
        grantedPermission
      );
      mockImagePicker.launchCameraAsync.mockResolvedValue(cameraResult);

      const { result } = renderHook(() => usePhotoPicker());

      let photo: string | null = null;
      await act(async () => {
        photo = await result.current.takePhoto();
      });

      expect(photo).toBe('camerabase64image');
      expect(mockImagePicker.launchCameraAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          base64: true,
          quality: 0.8,
        })
      );
    });

    it('should return null when camera permission is denied', async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue(
        deniedPermission
      );

      const { result } = renderHook(() => usePhotoPicker());

      let photo: string | null = null;
      await act(async () => {
        photo = await result.current.takePhoto();
      });

      expect(photo).toBeNull();
      expect(mockImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should set error when picker throws', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue(
        grantedPermission
      );
      mockImagePicker.launchImageLibraryAsync.mockRejectedValue(
        new Error('Picker failed')
      );

      const { result } = renderHook(() => usePhotoPicker());

      await act(async () => {
        await result.current.pickFromGallery();
      });

      expect(result.current.error).toBe('Picker failed');
    });

    it('should clear error on successful pick', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue(
        grantedPermission
      );
      mockImagePicker.launchImageLibraryAsync
        .mockRejectedValueOnce(new Error('First failed'))
        .mockResolvedValueOnce(successResult);

      const { result } = renderHook(() => usePhotoPicker());

      await act(async () => {
        await result.current.pickFromGallery();
      });
      expect(result.current.error).toBe('First failed');

      await act(async () => {
        await result.current.pickFromGallery();
      });
      expect(result.current.error).toBeNull();
    });
  });
});
