export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  // Network
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  API_ERROR: 'API_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Validation
  INVALID_IMAGE: 'INVALID_IMAGE',
  IMAGE_TOO_SMALL: 'IMAGE_TOO_SMALL',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Generation
  GENERATION_FAILED: 'GENERATION_FAILED',
  GENERATION_TIMEOUT: 'GENERATION_TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',

  // Purchase
  PURCHASE_FAILED: 'PURCHASE_FAILED',
  PURCHASE_CANCELLED: 'PURCHASE_CANCELLED',
  RESTORE_FAILED: 'RESTORE_FAILED',

  // Export
  EXPORT_FAILED: 'EXPORT_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.NETWORK_OFFLINE]:
    'No internet connection. Please check your network.',
  [ErrorCodes.API_ERROR]: 'Something went wrong. Please try again.',
  [ErrorCodes.TIMEOUT]: 'The request timed out. Please try again.',

  [ErrorCodes.INVALID_IMAGE]: 'Please select a valid image file.',
  [ErrorCodes.IMAGE_TOO_SMALL]: 'Image must be at least 256×256 pixels.',
  [ErrorCodes.INVALID_FORMAT]:
    'Invalid file format. Please use JPEG, PNG, or WebP.',

  [ErrorCodes.GENERATION_FAILED]:
    'Failed to generate avatar. Please try again.',
  [ErrorCodes.GENERATION_TIMEOUT]:
    'Generation timed out. Please try again.',
  [ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
  [ErrorCodes.DAILY_LIMIT_REACHED]:
    "You've reached your daily limit. Upgrade to Premium for unlimited generations.",

  [ErrorCodes.PURCHASE_FAILED]:
    'Purchase failed. Please try again.',
  [ErrorCodes.PURCHASE_CANCELLED]: 'Purchase was cancelled.',
  [ErrorCodes.RESTORE_FAILED]:
    'Failed to restore purchases. Please try again.',

  [ErrorCodes.EXPORT_FAILED]: 'Failed to export avatar. Please try again.',
  [ErrorCodes.PERMISSION_DENIED]:
    'Permission denied. Please allow access in Settings.',
};
