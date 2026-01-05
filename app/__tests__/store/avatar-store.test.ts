import { useAvatarStore } from '@/store/avatar-store';
import type { BuilderSource, PhotoItem, StyleModifiers } from '@/schemas/avatar';
import type { GenerationRecord } from '@/schemas/api';
import { FREE_DAILY_LIMIT, MAX_HISTORY_ITEMS } from '@/schemas/user';

const validPhoto: PhotoItem = {
  uri: 'file://photo.jpg',
  width: 512,
  height: 512,
  mimeType: 'image/jpeg',
};

const validPhoto2: PhotoItem = {
  uri: 'file://photo2.jpg',
  width: 600,
  height: 600,
  mimeType: 'image/png',
};

const validPhoto3: PhotoItem = {
  uri: 'file://photo3.jpg',
  width: 800,
  height: 800,
  mimeType: 'image/webp',
};

// Reset store before each test
beforeEach(() => {
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

describe('useAvatarStore', () => {
  describe('Form Actions', () => {
    it('should set style', () => {
      useAvatarStore.getState().setStyle('anime');

      expect(useAvatarStore.getState().currentForm.style).toBe('anime');
    });

    it('should set background', () => {
      const background = { type: 'solid' as const, primaryColor: '#FFFFFF' };

      useAvatarStore.getState().setBackground(background);

      expect(useAvatarStore.getState().currentForm.background).toEqual(background);
    });

    it('should set aspect ratio', () => {
      useAvatarStore.getState().setAspectRatio('3:4');

      expect(useAvatarStore.getState().currentForm.aspectRatio).toBe('3:4');
    });

    it('should reset form', () => {
      useAvatarStore.getState().setStyle('anime');
      useAvatarStore.getState().setAspectRatio('1:1');

      useAvatarStore.getState().resetForm();

      expect(useAvatarStore.getState().currentForm).toEqual({});
    });
  });

  describe('Photo Actions', () => {
    it('should add photo to empty photos array', () => {
      useAvatarStore.getState().addPhoto(validPhoto);

      expect(useAvatarStore.getState().currentForm.photos).toHaveLength(1);
      expect(useAvatarStore.getState().currentForm.photos?.[0]).toEqual(validPhoto);
    });

    it('should add multiple photos', () => {
      useAvatarStore.getState().addPhoto(validPhoto);
      useAvatarStore.getState().addPhoto(validPhoto2);

      expect(useAvatarStore.getState().currentForm.photos).toHaveLength(2);
    });

    it('should not add more than 3 photos', () => {
      useAvatarStore.getState().addPhoto(validPhoto);
      useAvatarStore.getState().addPhoto(validPhoto2);
      useAvatarStore.getState().addPhoto(validPhoto3);
      useAvatarStore.getState().addPhoto({
        ...validPhoto,
        uri: 'file://photo4.jpg',
      });

      expect(useAvatarStore.getState().currentForm.photos).toHaveLength(3);
    });

    it('should remove photo by index', () => {
      useAvatarStore.getState().addPhoto(validPhoto);
      useAvatarStore.getState().addPhoto(validPhoto2);

      useAvatarStore.getState().removePhoto(0);

      const photos = useAvatarStore.getState().currentForm.photos;
      expect(photos).toHaveLength(1);
      expect(photos?.[0]).toEqual(validPhoto2);
    });

    it('should handle removing from empty array', () => {
      useAvatarStore.getState().removePhoto(0);

      // Photos is undefined when no photos have been added
      expect(useAvatarStore.getState().currentForm.photos).toBeUndefined();
    });

    it('should handle invalid index', () => {
      useAvatarStore.getState().addPhoto(validPhoto);

      useAvatarStore.getState().removePhoto(5);

      expect(useAvatarStore.getState().currentForm.photos).toHaveLength(1);
    });
  });

  describe('Style Modifiers Actions', () => {
    it('should set style modifiers', () => {
      const modifiers: Partial<StyleModifiers> = { hairColor: 'blue' };

      useAvatarStore.getState().setStyleModifiers(modifiers);

      expect(useAvatarStore.getState().currentForm.styleModifiers?.hairColor).toBe(
        'blue'
      );
    });

    it('should merge style modifiers', () => {
      useAvatarStore.getState().setStyleModifiers({ hairColor: 'blue' });
      useAvatarStore.getState().setStyleModifiers({ expression: 'smiling' });

      const modifiers = useAvatarStore.getState().currentForm.styleModifiers;
      expect(modifiers?.hairColor).toBe('blue');
      expect(modifiers?.expression).toBe('smiling');
    });

    it('should override existing modifier values', () => {
      useAvatarStore.getState().setStyleModifiers({ hairColor: 'blue' });
      useAvatarStore.getState().setStyleModifiers({ hairColor: 'pink' });

      expect(useAvatarStore.getState().currentForm.styleModifiers?.hairColor).toBe(
        'pink'
      );
    });

    it('should set accessories array', () => {
      useAvatarStore.getState().setStyleModifiers({
        accessories: ['glasses', 'hat'],
      });

      expect(useAvatarStore.getState().currentForm.styleModifiers?.accessories).toEqual(
        ['glasses', 'hat']
      );
    });

    it('should clear style modifiers', () => {
      useAvatarStore.getState().setStyleModifiers({
        hairColor: 'blue',
        expression: 'smiling',
      });

      useAvatarStore.getState().clearStyleModifiers();

      expect(useAvatarStore.getState().currentForm.styleModifiers).toBeUndefined();
    });
  });

  describe('Generation Actions', () => {
    it('should start generation with correct initial state', () => {
      useAvatarStore.getState().startGeneration('test-id-123');

      const state = useAvatarStore.getState();
      expect(state.generationId).toBe('test-id-123');
      expect(state.generationStatus).toBe('queued');
      expect(state.generationProgress).toBe(0);
      expect(state.generationError).toBeNull();
      expect(state.previewUrl).toBeNull();
    });

    it('should update generation status and progress', () => {
      useAvatarStore.getState().startGeneration('test-id');
      useAvatarStore.getState().updateGenerationStatus('processing', 50);

      const state = useAvatarStore.getState();
      expect(state.generationStatus).toBe('processing');
      expect(state.generationProgress).toBe(50);
    });

    it('should update status without changing progress when not provided', () => {
      useAvatarStore.getState().startGeneration('test-id');
      useAvatarStore.getState().updateGenerationStatus('processing', 30);
      useAvatarStore.getState().updateGenerationStatus('processing');

      expect(useAvatarStore.getState().generationProgress).toBe(30);
    });

    it('should set generation result', () => {
      useAvatarStore.getState().startGeneration('test-id');
      useAvatarStore.getState().setGenerationResult('https://example.com/image.png');

      const state = useAvatarStore.getState();
      expect(state.generationStatus).toBe('completed');
      expect(state.generationProgress).toBe(100);
      expect(state.previewUrl).toBe('https://example.com/image.png');
    });

    it('should set generation error', () => {
      useAvatarStore.getState().startGeneration('test-id');
      useAvatarStore.getState().setGenerationError('Generation failed');

      const state = useAvatarStore.getState();
      expect(state.generationStatus).toBe('failed');
      expect(state.generationError).toBe('Generation failed');
    });

    it('should clear generation state', () => {
      useAvatarStore.getState().startGeneration('test-id');
      useAvatarStore.getState().setGenerationResult('https://example.com/image.png');
      useAvatarStore.getState().clearGeneration();

      const state = useAvatarStore.getState();
      expect(state.generationId).toBeNull();
      expect(state.generationStatus).toBeNull();
      expect(state.generationProgress).toBe(0);
      expect(state.generationError).toBeNull();
      expect(state.previewUrl).toBeNull();
    });
  });

  describe('User Actions', () => {
    it('should increment daily usage', () => {
      useAvatarStore.getState().incrementDailyUsage();

      expect(useAvatarStore.getState().user.generationsToday).toBe(1);
      expect(useAvatarStore.getState().user.lastGenerationDate).toBeDefined();
    });

    it('should increment daily usage multiple times', () => {
      useAvatarStore.getState().incrementDailyUsage();
      useAvatarStore.getState().incrementDailyUsage();
      useAvatarStore.getState().incrementDailyUsage();

      expect(useAvatarStore.getState().user.generationsToday).toBe(3);
    });

    it('should reset daily usage', () => {
      useAvatarStore.getState().incrementDailyUsage();
      useAvatarStore.getState().incrementDailyUsage();
      useAvatarStore.getState().resetDailyUsage();

      expect(useAvatarStore.getState().user.generationsToday).toBe(0);
    });

    it('should set premium status to true', () => {
      useAvatarStore.getState().setPremium(true);

      const user = useAvatarStore.getState().user;
      expect(user.hasPremium).toBe(true);
      expect(user.purchaseDate).toBeDefined();
    });

    it('should set premium status to false', () => {
      useAvatarStore.getState().setPremium(true);
      useAvatarStore.getState().setPremium(false);

      const user = useAvatarStore.getState().user;
      expect(user.hasPremium).toBe(false);
      expect(user.purchaseDate).toBeUndefined();
    });
  });

  describe('History Actions', () => {
    const createRecord = (id: string): GenerationRecord => ({
      id,
      imageUrl: `https://example.com/${id}.png`,
      thumbnailUrl: `https://example.com/${id}-thumb.png`,
      prompt: 'test prompt',
      style: 'anime',
      aspectRatio: '1:1',
      createdAt: new Date().toISOString(),
      isPremiumExport: false,
    });

    it('should save to history', () => {
      const record = createRecord('uuid-1');
      useAvatarStore.getState().saveToHistory(record);

      expect(useAvatarStore.getState().user.generations).toHaveLength(1);
      expect(useAvatarStore.getState().user.generations[0]).toEqual(record);
    });

    it('should prepend new records to history', () => {
      const record1 = createRecord('uuid-1');
      const record2 = createRecord('uuid-2');

      useAvatarStore.getState().saveToHistory(record1);
      useAvatarStore.getState().saveToHistory(record2);

      const generations = useAvatarStore.getState().user.generations;
      expect(generations[0].id).toBe('uuid-2');
      expect(generations[1].id).toBe('uuid-1');
    });

    it('should limit history to MAX_HISTORY_ITEMS', () => {
      for (let i = 0; i < 60; i++) {
        useAvatarStore.getState().saveToHistory(createRecord(`uuid-${i}`));
      }

      expect(useAvatarStore.getState().user.generations.length).toBe(MAX_HISTORY_ITEMS);
    });

    it('should delete from history', () => {
      useAvatarStore.getState().saveToHistory(createRecord('uuid-1'));
      useAvatarStore.getState().saveToHistory(createRecord('uuid-2'));

      useAvatarStore.getState().deleteFromHistory('uuid-1');

      const generations = useAvatarStore.getState().user.generations;
      expect(generations.length).toBe(1);
      expect(generations[0].id).toBe('uuid-2');
    });

    it('should clear history', () => {
      useAvatarStore.getState().saveToHistory(createRecord('uuid-1'));
      useAvatarStore.getState().saveToHistory(createRecord('uuid-2'));

      useAvatarStore.getState().clearHistory();

      expect(useAvatarStore.getState().user.generations).toEqual([]);
    });
  });

  describe('Computed Values', () => {
    it('should return true for canGenerate when under daily limit', () => {
      expect(useAvatarStore.getState().canGenerate()).toBe(true);
    });

    it('should return false for canGenerate when at daily limit', () => {
      for (let i = 0; i < FREE_DAILY_LIMIT; i++) {
        useAvatarStore.getState().incrementDailyUsage();
      }

      expect(useAvatarStore.getState().canGenerate()).toBe(false);
    });

    it('should return false for canGenerate when over daily limit', () => {
      for (let i = 0; i < FREE_DAILY_LIMIT + 2; i++) {
        useAvatarStore.getState().incrementDailyUsage();
      }

      expect(useAvatarStore.getState().canGenerate()).toBe(false);
    });

    it('should always return true for canGenerate when premium', () => {
      useAvatarStore.getState().setPremium(true);
      for (let i = 0; i < 10; i++) {
        useAvatarStore.getState().incrementDailyUsage();
      }

      expect(useAvatarStore.getState().canGenerate()).toBe(true);
    });

    it('should return correct remaining generations for free user', () => {
      expect(useAvatarStore.getState().remainingGenerations()).toBe(FREE_DAILY_LIMIT);

      useAvatarStore.getState().incrementDailyUsage();
      useAvatarStore.getState().incrementDailyUsage();

      expect(useAvatarStore.getState().remainingGenerations()).toBe(FREE_DAILY_LIMIT - 2);
    });

    it('should return 0 remaining when at limit', () => {
      for (let i = 0; i < FREE_DAILY_LIMIT; i++) {
        useAvatarStore.getState().incrementDailyUsage();
      }

      expect(useAvatarStore.getState().remainingGenerations()).toBe(0);
    });

    it('should return Infinity remaining for premium users', () => {
      useAvatarStore.getState().setPremium(true);

      expect(useAvatarStore.getState().remainingGenerations()).toBe(Infinity);
    });
  });
});
