/**
 * Integration tests for the avatar generation flow
 *
 * Tests the complete generation workflow from form submission
 * through API calls to final result storage.
 */

import { useAvatarStore } from '@/store/avatar-store';
import { api } from '@/lib/api';
import { buildGenerationRequest } from '@/lib/replicate';
import { ErrorCodes, ErrorMessages } from '@/lib/errors';
import type { BuilderSource, AvatarForm } from '@/schemas/avatar';
import type { GenerationResponse, GenerationRecord } from '@/schemas/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    generate: jest.fn(),
    getStatus: jest.fn(),
    cancel: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('Avatar Generation Flow', () => {
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

  describe('Complete Generation Workflow', () => {
    it('should complete full generation from form to result', async () => {
      const generationId = 'gen-123';
      const imageUrl = 'https://example.com/avatar.png';

      mockApi.generate.mockResolvedValue({
        id: generationId,
        status: 'queued',
        progress: 0,
      });

      mockApi.getStatus.mockResolvedValue({
        id: generationId,
        status: 'completed',
        progress: 100,
        imageUrl,
      });

      const store = useAvatarStore.getState();

      // Step 1: Set form values
      store.setSource(mockBuilderSource);
      store.setStyle('anime');
      store.setBackground({ type: 'solid', primaryColor: '#ffffff' });
      store.setAspectRatio('1:1');

      // Step 2: Verify form is valid
      const form = useAvatarStore.getState().currentForm;
      expect(form.source).toBeDefined();
      expect(form.style).toBe('anime');

      // Step 3: Build request
      const request = buildGenerationRequest(
        mockBuilderSource,
        'anime',
        '1:1'
      );
      expect(request.prompt).toContain('anime');

      // Step 4: Start generation
      const response = await mockApi.generate(request);
      store.startGeneration(response.id);
      expect(useAvatarStore.getState().generationId).toBe(generationId);
      expect(useAvatarStore.getState().generationStatus).toBe('queued');

      // Step 5: Poll for completion
      const statusResponse = await mockApi.getStatus(generationId);
      store.updateGenerationStatus(statusResponse.status, statusResponse.progress);

      // Step 6: Set result
      if (statusResponse.imageUrl) {
        store.setGenerationResult(statusResponse.imageUrl);
      }

      // Step 7: Verify final state
      const finalState = useAvatarStore.getState();
      expect(finalState.generationStatus).toBe('completed');
      expect(finalState.previewUrl).toBe(imageUrl);
    });

    it('should track daily usage after successful generation', async () => {
      const store = useAvatarStore.getState();

      expect(store.user.generationsToday).toBe(0);

      // Simulate successful generation
      store.incrementDailyUsage();

      expect(useAvatarStore.getState().user.generationsToday).toBe(1);
      expect(useAvatarStore.getState().canGenerate()).toBe(true);
    });

    it('should save generation to history', () => {
      const record: GenerationRecord = {
        id: 'gen-123',
        imageUrl: 'https://example.com/avatar.png',
        thumbnailUrl: 'https://example.com/avatar-thumb.png',
        prompt: 'test prompt',
        style: 'anime',
        aspectRatio: '1:1',
        createdAt: new Date().toISOString(),
        isPremiumExport: false,
      };

      const store = useAvatarStore.getState();
      store.saveToHistory(record);

      const history = useAvatarStore.getState().user.generations;
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('gen-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle generation failure gracefully', async () => {
      const generationId = 'gen-fail';

      mockApi.generate.mockResolvedValue({
        id: generationId,
        status: 'queued',
        progress: 0,
      });

      mockApi.getStatus.mockResolvedValue({
        id: generationId,
        status: 'failed',
        error: 'Content moderation failed',
      });

      const store = useAvatarStore.getState();

      // Start generation
      const response = await mockApi.generate({
        prompt: 'test',
        style: 'anime',
        aspectRatio: '1:1',
      });
      store.startGeneration(response.id);

      // Get failed status
      const statusResponse = await mockApi.getStatus(generationId);
      if (statusResponse.status === 'failed') {
        store.setGenerationError(statusResponse.error || 'Generation failed');
      }

      const finalState = useAvatarStore.getState();
      expect(finalState.generationStatus).toBe('failed');
      expect(finalState.generationError).toBe('Content moderation failed');
    });

    it('should handle API errors', async () => {
      mockApi.generate.mockRejectedValue(new Error('Network error'));

      const store = useAvatarStore.getState();

      try {
        await mockApi.generate({
          prompt: 'test',
          style: 'anime',
          aspectRatio: '1:1',
        });
      } catch (error) {
        store.setGenerationError(ErrorMessages[ErrorCodes.API_ERROR]);
      }

      expect(useAvatarStore.getState().generationError).toBe(
        ErrorMessages[ErrorCodes.API_ERROR]
      );
    });
  });

  describe('Daily Limits', () => {
    it('should enforce daily limit for free users', () => {
      const store = useAvatarStore.getState();

      // Use up daily limit
      for (let i = 0; i < 5; i++) {
        store.incrementDailyUsage();
      }

      expect(useAvatarStore.getState().canGenerate()).toBe(false);
      expect(useAvatarStore.getState().remainingGenerations()).toBe(0);
    });

    it('should allow unlimited generations for premium users', () => {
      const store = useAvatarStore.getState();
      store.setPremium(true);

      // Use many generations
      for (let i = 0; i < 100; i++) {
        store.incrementDailyUsage();
      }

      expect(useAvatarStore.getState().canGenerate()).toBe(true);
      expect(useAvatarStore.getState().remainingGenerations()).toBe(Infinity);
    });

    it('should reset daily usage', () => {
      const store = useAvatarStore.getState();

      store.incrementDailyUsage();
      store.incrementDailyUsage();
      expect(useAvatarStore.getState().user.generationsToday).toBe(2);

      store.resetDailyUsage();
      expect(useAvatarStore.getState().user.generationsToday).toBe(0);
    });
  });

  describe('Cancel Generation', () => {
    it('should cancel active generation', async () => {
      const generationId = 'gen-to-cancel';

      mockApi.cancel.mockResolvedValue(undefined);

      const store = useAvatarStore.getState();
      store.startGeneration(generationId);

      expect(useAvatarStore.getState().generationId).toBe(generationId);

      await mockApi.cancel(generationId);
      store.clearGeneration();

      const finalState = useAvatarStore.getState();
      expect(finalState.generationId).toBeNull();
      expect(finalState.generationStatus).toBeNull();
    });
  });

  describe('History Management', () => {
    it('should maintain history order (newest first)', () => {
      const store = useAvatarStore.getState();

      const record1: GenerationRecord = {
        id: 'gen-1',
        imageUrl: 'https://example.com/1.png',
        thumbnailUrl: 'https://example.com/1-thumb.png',
        prompt: 'prompt 1',
        style: 'anime',
        aspectRatio: '1:1',
        createdAt: '2024-01-01T00:00:00Z',
        isPremiumExport: false,
      };

      const record2: GenerationRecord = {
        id: 'gen-2',
        imageUrl: 'https://example.com/2.png',
        thumbnailUrl: 'https://example.com/2-thumb.png',
        prompt: 'prompt 2',
        style: 'pixar',
        aspectRatio: '1:1',
        createdAt: '2024-01-02T00:00:00Z',
        isPremiumExport: false,
      };

      store.saveToHistory(record1);
      store.saveToHistory(record2);

      const history = useAvatarStore.getState().user.generations;
      expect(history[0].id).toBe('gen-2'); // Newest first
      expect(history[1].id).toBe('gen-1');
    });

    it('should limit history to 50 items', () => {
      const store = useAvatarStore.getState();

      for (let i = 0; i < 60; i++) {
        store.saveToHistory({
          id: `gen-${i}`,
          imageUrl: `https://example.com/${i}.png`,
          thumbnailUrl: `https://example.com/${i}-thumb.png`,
          prompt: `prompt ${i}`,
          style: 'anime',
          aspectRatio: '1:1',
          createdAt: new Date().toISOString(),
          isPremiumExport: false,
        });
      }

      expect(useAvatarStore.getState().user.generations.length).toBe(50);
    });

    it('should delete specific items from history', () => {
      const store = useAvatarStore.getState();

      store.saveToHistory({
        id: 'to-delete',
        imageUrl: 'https://example.com/delete.png',
        thumbnailUrl: 'https://example.com/delete-thumb.png',
        prompt: 'delete me',
        style: 'anime',
        aspectRatio: '1:1',
        createdAt: new Date().toISOString(),
        isPremiumExport: false,
      });

      store.saveToHistory({
        id: 'to-keep',
        imageUrl: 'https://example.com/keep.png',
        thumbnailUrl: 'https://example.com/keep-thumb.png',
        prompt: 'keep me',
        style: 'pixar',
        aspectRatio: '1:1',
        createdAt: new Date().toISOString(),
        isPremiumExport: false,
      });

      store.deleteFromHistory('to-delete');

      const history = useAvatarStore.getState().user.generations;
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('to-keep');
    });
  });

  describe('Premium Features', () => {
    it('should track premium status', () => {
      const store = useAvatarStore.getState();

      expect(store.user.hasPremium).toBe(false);

      store.setPremium(true);
      expect(useAvatarStore.getState().user.hasPremium).toBe(true);
      expect(useAvatarStore.getState().user.purchaseDate).toBeDefined();

      store.setPremium(false);
      expect(useAvatarStore.getState().user.hasPremium).toBe(false);
    });
  });
});
