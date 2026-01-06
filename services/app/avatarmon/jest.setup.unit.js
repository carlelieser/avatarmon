// Unit test setup - for TypeScript tests and hooks

// Mock fetch
global.fetch = jest.fn();

// Mock React Native
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
}));

// Mock expo-media-library
jest.mock('expo-media-library', () => ({
  saveToLibraryAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  downloadAsync: jest.fn(),
  documentDirectory: '/mock/document/directory/',
  cacheDirectory: '/mock/cache/directory/',
}));

// Mock react-native-purchases
jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  getCustomerInfo: jest.fn(),
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  addCustomerInfoUpdateListener: jest.fn(() => ({ remove: jest.fn() })),
  LOG_LEVEL: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
  },
}));
