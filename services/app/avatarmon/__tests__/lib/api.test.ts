import { api, ApiError } from '@/lib/api';
import { Style } from '@/types/avatar';

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('generate', () => {
    const mockInput = {
      style: Style.Anime,
      references: ['base64image1', 'base64image2'],
      modifications: ['blue eyes'],
    };

    it('should call the generate endpoint with correct payload', async () => {
      const mockResponse = { id: 'pred_123', status: 'starting' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.generate(mockInput);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8082/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockInput),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw ApiError on failed request', async () => {
      const errorResponse = { error: 'Invalid input', details: [] };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(api.generate(mockInput)).rejects.toThrow(ApiError);
      await expect(api.generate(mockInput)).rejects.toThrow('Invalid input');
    });

    it('should throw ApiError on network failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(api.generate(mockInput)).rejects.toThrow(ApiError);
    });
  });

  describe('getStatus', () => {
    it('should fetch prediction status by id', async () => {
      const mockResponse = {
        id: 'pred_123',
        status: 'succeeded',
        output: 'https://example.com/image.png',
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.getStatus('pred_123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8082/api/generate/pred_123',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw ApiError when prediction not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Prediction not found' }),
      });

      await expect(api.getStatus('invalid_id')).rejects.toThrow(ApiError);
    });
  });

  describe('cancel', () => {
    it('should cancel a prediction', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await api.cancel('pred_123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8082/api/generate/pred_123/cancel',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should throw ApiError on cancel failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      await expect(api.cancel('pred_123')).rejects.toThrow(ApiError);
    });
  });

  describe('pollForCompletion', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return output when prediction succeeds', async () => {
      const mockOutput = 'https://example.com/result.png';
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'pred_123', status: 'processing' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'pred_123',
              status: 'succeeded',
              output: mockOutput,
            }),
        });

      const pollPromise = api.pollForCompletion('pred_123');

      await jest.advanceTimersByTimeAsync(2000);
      await jest.advanceTimersByTimeAsync(2000);

      const result = await pollPromise;
      expect(result).toBe(mockOutput);
    });

    it('should throw error when prediction fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'pred_123',
            status: 'failed',
            error: 'Generation failed',
          }),
      });

      await expect(api.pollForCompletion('pred_123')).rejects.toThrow(
        'Generation failed'
      );
    });

    it('should handle array output format', async () => {
      const mockOutput = ['https://example.com/result1.png'];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'pred_123',
            status: 'succeeded',
            output: mockOutput,
          }),
      });

      const result = await api.pollForCompletion('pred_123');
      expect(result).toBe(mockOutput[0]);
    });

    it('should call onStatusChange callback', async () => {
      const onStatusChange = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ id: 'pred_123', status: 'succeeded', output: 'url' }),
      });

      await api.pollForCompletion('pred_123', { onStatusChange });

      expect(onStatusChange).toHaveBeenCalledWith('succeeded');
    });
  });
});

describe('ApiError', () => {
  it('should have correct name and message', () => {
    const error = new ApiError('Test error', 400);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
  });
});
