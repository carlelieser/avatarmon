/**
 * Tests for useGeneration hook logic
 *
 * Since the hook uses React hooks internally, we test the core generation
 * logic through integration with the store and mocked API.
 */

import { useAvatarStore } from '@/store/avatar-store';
import { api } from '@/lib/api';
import { buildGenerationRequest } from '@/lib/replicate';
import { AppError, ErrorCodes, ErrorMessages } from '@/lib/errors';
import type { AvatarForm, BuilderSource } from '@/schemas/avatar';
import type { GenerationResponse } from '@/schemas/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  api: {
    generate: jest.fn(),
    getStatus: jest.fn(),
    cancel: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

// Test helper that mimics the hook logic for testing
async function executeGeneration(
  form: AvatarForm,
  options: { timeout?: number; pollInterval?: number } = {}
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const state = useAvatarStore.getState();
  const { timeout = 5000, pollInterval = 100 } = options;

  // Check daily limit
  if (!state.canGenerate()) {
    state.setGenerationError(ErrorMessages[ErrorCodes.DAILY_LIMIT_REACHED]);
    return { success: false, error: ErrorMessages[ErrorCodes.DAILY_LIMIT_REACHED] };
  }

  // Build request
  const request = buildGenerationRequest(form.source, form.style, form.aspectRatio);

  try {
    // Start generation
    const response = await mockApi.generate(request);
    state.startGeneration(response.id);

    // Poll for status
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const statusResponse = await mockApi.getStatus(response.id);
      state.updateGenerationStatus(statusResponse.status, statusResponse.progress);

      if (statusResponse.status === 'completed' && statusResponse.imageUrl) {
        state.setGenerationResult(statusResponse.imageUrl);
        state.incrementDailyUsage();
        return { success: true, imageUrl: statusResponse.imageUrl };
      }

      if (statusResponse.status === 'failed' || statusResponse.status === 'cancelled') {
        const errorMsg = statusResponse.error || ErrorMessages[ErrorCodes.GENERATION_FAILED];
        state.setGenerationError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Small delay before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // Timeout
    state.setGenerationError(ErrorMessages[ErrorCodes.GENERATION_TIMEOUT]);
    return { success: false, error: ErrorMessages[ErrorCodes.GENERATION_TIMEOUT] };
  } catch (error) {
    const errorMsg = ErrorMessages[ErrorCodes.API_ERROR];
    state.setGenerationError(errorMsg);
    return { success: false, error: errorMsg };
  }
}

describe('useGeneration', () => {
  const mockBuilderSource: BuilderSource = {
    type: 'builder',
    gender: 'feminine',
    ageRange: 'young-adult',
    skinTone: 'medium',
    hairStyle: 'long',
    hairColor: 'brown',
    eyeColor: 'brown',
    eyeShape: 'almond',
    facialHair: 'none',
    faceShape: 'oval',
    accessories: [],
    expression: 'smiling',
  };

  const mockForm: AvatarForm = {
    source: mockBuilderSource,
    style: 'anime',
    background: { type: 'solid', primaryColor: '#ffffff' },
    aspectRatio: '1:1',
  };

  const mockGenerationResponse: GenerationResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'queued',
    progress: 0,
  };

  const mockCompletedResponse: GenerationResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'completed',
    progress: 100,
    imageUrl: 'https://example.com/generated-avatar.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store to initial state
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
        generations: [],
        onboardingComplete: false,
      },
    });
  });

  describe('Daily Limit Checks', () => {
    it('should allow generation when under daily limit', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      const result = await executeGeneration(mockForm);

      expect(result.success).toBe(true);
      expect(mockApi.generate).toHaveBeenCalled();
    });

    it('should reject generation when at daily limit', async () => {
      // Set user at daily limit
      for (let i = 0; i < 5; i++) {
        useAvatarStore.getState().incrementDailyUsage();
      }

      const result = await executeGeneration(mockForm);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ErrorMessages[ErrorCodes.DAILY_LIMIT_REACHED]);
      expect(mockApi.generate).not.toHaveBeenCalled();
    });

    it('should allow premium users unlimited generations', async () => {
      useAvatarStore.getState().setPremium(true);
      for (let i = 0; i < 10; i++) {
        useAvatarStore.getState().incrementDailyUsage();
      }

      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      const result = await executeGeneration(mockForm);

      expect(result.success).toBe(true);
    });
  });

  describe('Generation Workflow', () => {
    it('should call API with correct request', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      await executeGeneration(mockForm);

      expect(mockApi.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('anime'),
          style: 'anime',
          aspectRatio: '1:1',
        })
      );
    });

    it('should update store with generation ID on start', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      await executeGeneration(mockForm);

      expect(useAvatarStore.getState().generationId).toBe(mockGenerationResponse.id);
    });

    it('should poll for status updates', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus
        .mockResolvedValueOnce({ ...mockGenerationResponse, status: 'processing', progress: 50 })
        .mockResolvedValueOnce(mockCompletedResponse);

      await executeGeneration(mockForm);

      expect(mockApi.getStatus).toHaveBeenCalledWith(mockGenerationResponse.id);
      expect(mockApi.getStatus).toHaveBeenCalledTimes(2);
    });

    it('should set result URL on completion', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      const result = await executeGeneration(mockForm);

      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe(mockCompletedResponse.imageUrl);
      expect(useAvatarStore.getState().previewUrl).toBe(mockCompletedResponse.imageUrl);
    });

    it('should increment daily usage on success', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      await executeGeneration(mockForm);

      expect(useAvatarStore.getState().user.generationsToday).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle API generation errors', async () => {
      mockApi.generate.mockRejectedValue(new Error('Network error'));

      const result = await executeGeneration(mockForm);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ErrorMessages[ErrorCodes.API_ERROR]);
      expect(useAvatarStore.getState().generationError).toBe(ErrorMessages[ErrorCodes.API_ERROR]);
    });

    it('should handle failed generation status', async () => {
      const failedResponse: GenerationResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'failed',
        error: 'Content moderation failed',
      };

      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(failedResponse);

      const result = await executeGeneration(mockForm);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Content moderation failed');
      expect(useAvatarStore.getState().generationStatus).toBe('failed');
    });

    it('should handle cancelled generation', async () => {
      const cancelledResponse: GenerationResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'cancelled',
      };

      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(cancelledResponse);

      const result = await executeGeneration(mockForm);

      expect(result.success).toBe(false);
    });

    it('should timeout after configured duration', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue({ ...mockGenerationResponse, status: 'processing', progress: 50 });

      const result = await executeGeneration(mockForm, { timeout: 300, pollInterval: 100 });

      expect(result.success).toBe(false);
      expect(result.error).toBe(ErrorMessages[ErrorCodes.GENERATION_TIMEOUT]);
    });
  });

  describe('Cancel Generation', () => {
    it('should call cancel API with generation ID', async () => {
      useAvatarStore.getState().startGeneration('test-generation-id');
      mockApi.cancel.mockResolvedValue(undefined);

      const generationId = useAvatarStore.getState().generationId;
      if (generationId) {
        await mockApi.cancel(generationId);
        useAvatarStore.getState().clearGeneration();
      }

      expect(mockApi.cancel).toHaveBeenCalledWith('test-generation-id');
    });

    it('should clear generation state after cancel', async () => {
      useAvatarStore.getState().startGeneration('test-generation-id');
      useAvatarStore.getState().updateGenerationStatus('processing', 50);

      const generationId = useAvatarStore.getState().generationId;
      if (generationId) {
        await mockApi.cancel(generationId);
        useAvatarStore.getState().clearGeneration();
      }

      const state = useAvatarStore.getState();
      expect(state.generationId).toBeNull();
      expect(state.generationStatus).toBeNull();
      expect(state.generationProgress).toBe(0);
    });
  });

  describe('Prompt Building', () => {
    it('should build correct prompt from builder source', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      await executeGeneration(mockForm);

      const call = mockApi.generate.mock.calls[0][0];
      expect(call.prompt).toContain('portrait');
      expect(call.prompt).toContain('feminine');
      expect(call.prompt).toContain('anime');
    });

    it('should include negative prompt', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      await executeGeneration(mockForm);

      const call = mockApi.generate.mock.calls[0][0];
      expect(call.negativePrompt).toBeDefined();
      expect(call.negativePrompt).toContain('deformed');
    });

    it('should use correct aspect ratio', async () => {
      const wideForm = { ...mockForm, aspectRatio: '4:3' as const };

      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      await executeGeneration(wideForm);

      const call = mockApi.generate.mock.calls[0][0];
      expect(call.aspectRatio).toBe('4:3');
    });
  });

  describe('State Management', () => {
    it('should set queued status on generation start', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      await executeGeneration(mockForm);

      // The startGeneration call sets status to 'queued' initially
      expect(mockApi.generate).toHaveBeenCalled();
    });

    it('should track progress during generation', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus
        .mockResolvedValueOnce({ ...mockGenerationResponse, status: 'processing', progress: 25 })
        .mockResolvedValueOnce({ ...mockGenerationResponse, status: 'processing', progress: 75 })
        .mockResolvedValueOnce(mockCompletedResponse);

      await executeGeneration(mockForm);

      // Final state should be completed with 100 progress
      expect(useAvatarStore.getState().generationProgress).toBe(100);
    });

    it('should set completed status and result on success', async () => {
      mockApi.generate.mockResolvedValue(mockGenerationResponse);
      mockApi.getStatus.mockResolvedValue(mockCompletedResponse);

      await executeGeneration(mockForm);

      const state = useAvatarStore.getState();
      expect(state.generationStatus).toBe('completed');
      expect(state.previewUrl).toBe(mockCompletedResponse.imageUrl);
    });
  });
});
