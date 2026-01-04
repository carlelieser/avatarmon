import { AppError, ErrorCodes, ErrorMessages } from '@/lib/errors';

describe('AppError', () => {
  it('should create error with all properties', () => {
    const error = new AppError(
      'Technical message',
      'NETWORK_OFFLINE',
      'No internet connection',
      true
    );

    expect(error.message).toBe('Technical message');
    expect(error.code).toBe('NETWORK_OFFLINE');
    expect(error.userMessage).toBe('No internet connection');
    expect(error.recoverable).toBe(true);
    expect(error.name).toBe('AppError');
  });

  it('should default recoverable to true', () => {
    const error = new AppError('msg', 'CODE', 'user msg');
    expect(error.recoverable).toBe(true);
  });

  it('should allow setting recoverable to false', () => {
    const error = new AppError('msg', 'CODE', 'user msg', false);
    expect(error.recoverable).toBe(false);
  });

  it('should extend Error class', () => {
    const error = new AppError('msg', 'CODE', 'user msg');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof AppError).toBe(true);
  });

  it('should have a stack trace', () => {
    const error = new AppError('msg', 'CODE', 'user msg');
    expect(error.stack).toBeDefined();
  });
});

describe('ErrorCodes', () => {
  it('should have network error codes', () => {
    expect(ErrorCodes.NETWORK_OFFLINE).toBe('NETWORK_OFFLINE');
    expect(ErrorCodes.API_ERROR).toBe('API_ERROR');
    expect(ErrorCodes.TIMEOUT).toBe('TIMEOUT');
  });

  it('should have validation error codes', () => {
    expect(ErrorCodes.INVALID_IMAGE).toBe('INVALID_IMAGE');
    expect(ErrorCodes.IMAGE_TOO_SMALL).toBe('IMAGE_TOO_SMALL');
    expect(ErrorCodes.INVALID_FORMAT).toBe('INVALID_FORMAT');
  });

  it('should have generation error codes', () => {
    expect(ErrorCodes.GENERATION_FAILED).toBe('GENERATION_FAILED');
    expect(ErrorCodes.GENERATION_TIMEOUT).toBe('GENERATION_TIMEOUT');
    expect(ErrorCodes.RATE_LIMITED).toBe('RATE_LIMITED');
    expect(ErrorCodes.DAILY_LIMIT_REACHED).toBe('DAILY_LIMIT_REACHED');
  });

  it('should have purchase error codes', () => {
    expect(ErrorCodes.PURCHASE_FAILED).toBe('PURCHASE_FAILED');
    expect(ErrorCodes.PURCHASE_CANCELLED).toBe('PURCHASE_CANCELLED');
    expect(ErrorCodes.RESTORE_FAILED).toBe('RESTORE_FAILED');
  });

  it('should have export error codes', () => {
    expect(ErrorCodes.EXPORT_FAILED).toBe('EXPORT_FAILED');
    expect(ErrorCodes.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
  });
});

describe('ErrorMessages', () => {
  it('should have user-friendly message for each error code', () => {
    Object.values(ErrorCodes).forEach((code) => {
      expect(ErrorMessages[code]).toBeDefined();
      expect(typeof ErrorMessages[code]).toBe('string');
      expect(ErrorMessages[code].length).toBeGreaterThan(0);
    });
  });

  it('should have descriptive network error messages', () => {
    expect(ErrorMessages[ErrorCodes.NETWORK_OFFLINE]).toContain('internet');
    expect(ErrorMessages[ErrorCodes.TIMEOUT]).toContain('timed out');
  });

  it('should have descriptive validation error messages', () => {
    expect(ErrorMessages[ErrorCodes.IMAGE_TOO_SMALL]).toContain('256');
    expect(ErrorMessages[ErrorCodes.INVALID_IMAGE]).toContain('image');
  });

  it('should have descriptive generation error messages', () => {
    expect(ErrorMessages[ErrorCodes.DAILY_LIMIT_REACHED]).toContain('limit');
    expect(ErrorMessages[ErrorCodes.GENERATION_FAILED].toLowerCase()).toContain('failed');
  });

  it('should have descriptive permission error messages', () => {
    expect(ErrorMessages[ErrorCodes.PERMISSION_DENIED].toLowerCase()).toContain('permission');
  });
});
