import { api, ApiError } from '@/lib/api';
import type { GenerationRequest } from '@/schemas/api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('api', () => {
  describe('generate', () => {
    const validRequest: GenerationRequest = {
      prompt: 'portrait of a young adult with short brown hair',
      style: 'anime',
      aspectRatio: '1:1',
    };

    it('should call correct endpoint with POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'test-id', status: 'queued' }),
      });

      await api.generate(validRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should send request body as JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'test-id', status: 'queued' }),
      });

      await api.generate(validRequest);

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body).toEqual(validRequest);
    });

    it('should return generation response on success', async () => {
      const expectedResponse = { id: 'test-id', status: 'queued' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedResponse),
      });

      const result = await api.generate(validRequest);

      expect(result).toEqual(expectedResponse);
    });

    it('should throw ApiError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      await expect(api.generate(validRequest)).rejects.toThrow(ApiError);
    });

    it('should include error message from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid request' }),
      });

      try {
        await api.generate(validRequest);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Invalid request');
        expect((error as ApiError).status).toBe(400);
      }
    });

    it('should handle non-JSON error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Not JSON')),
      });

      await expect(api.generate(validRequest)).rejects.toThrow(ApiError);
    });
  });

  describe('getStatus', () => {
    it('should call correct endpoint with generation ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'test-id',
            status: 'completed',
            imageUrl: 'https://example.com/image.png',
          }),
      });

      await api.getStatus('test-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate/test-id'),
        expect.any(Object)
      );
    });

    it('should return status response', async () => {
      const expectedResponse = {
        id: 'test-id',
        status: 'processing',
        progress: 50,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedResponse),
      });

      const result = await api.getStatus('test-id');

      expect(result).toEqual(expectedResponse);
    });

    it('should throw ApiError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' }),
      });

      await expect(api.getStatus('invalid-id')).rejects.toThrow(ApiError);
    });
  });

  describe('cancel', () => {
    it('should call correct endpoint with POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.cancel('test-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate/test-id/cancel'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should not throw on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await expect(api.cancel('test-id')).resolves.toBeUndefined();
    });

    it('should throw ApiError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Cannot cancel' }),
      });

      await expect(api.cancel('test-id')).rejects.toThrow(ApiError);
    });
  });
});

describe('ApiError', () => {
  it('should have correct properties', () => {
    const error = new ApiError('Test error', 404, 'NOT_FOUND');

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.name).toBe('ApiError');
  });

  it('should extend Error', () => {
    const error = new ApiError('Test', 500);

    expect(error instanceof Error).toBe(true);
    expect(error instanceof ApiError).toBe(true);
  });
});
