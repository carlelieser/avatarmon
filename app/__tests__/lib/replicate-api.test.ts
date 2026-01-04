/**
 * Tests for Replicate API integration
 *
 * Tests the server-side API handlers that communicate with Replicate.
 */

import { buildGenerationRequest } from '@/lib/replicate';
import { GenerationRequestSchema } from '@/schemas/api';
import type { BuilderSource } from '@/schemas/avatar';

// Mock Replicate client
const mockRun = jest.fn();
const mockGet = jest.fn();
const mockCancel = jest.fn();

jest.mock('replicate', () => {
  return jest.fn().mockImplementation(() => ({
    run: mockRun,
    predictions: {
      get: mockGet,
      cancel: mockCancel,
    },
  }));
});

describe('Replicate API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should validate correct generation request', () => {
      const request = {
        prompt: 'A beautiful anime style portrait with vibrant colors',
        negativePrompt: 'deformed, ugly, bad anatomy',
        style: 'anime',
        aspectRatio: '1:1',
      };

      const result = GenerationRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should reject request with too short prompt', () => {
      const request = {
        prompt: 'short',
        style: 'anime',
        aspectRatio: '1:1',
      };

      const result = GenerationRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject request with invalid style', () => {
      const request = {
        prompt: 'A beautiful portrait with vibrant colors',
        style: 'invalid-style',
        aspectRatio: '1:1',
      };

      const result = GenerationRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject request with invalid aspect ratio', () => {
      const request = {
        prompt: 'A beautiful portrait with vibrant colors',
        style: 'anime',
        aspectRatio: '16:9',
      };

      const result = GenerationRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should allow optional source image', () => {
      const request = {
        prompt: 'A beautiful anime style portrait with vibrant colors',
        style: 'anime',
        aspectRatio: '1:1',
        sourceImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      };

      const result = GenerationRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('Prompt Building', () => {
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

    it('should build valid request from builder source', () => {
      const request = buildGenerationRequest(
        mockBuilderSource,
        'anime',
        '1:1'
      );

      expect(request.prompt).toContain('portrait');
      expect(request.prompt).toContain('feminine');
      expect(request.prompt).toContain('anime');
      expect(request.style).toBe('anime');
      expect(request.aspectRatio).toBe('1:1');
    });

    it('should include negative prompt', () => {
      const request = buildGenerationRequest(
        mockBuilderSource,
        'anime',
        '1:1'
      );

      expect(request.negativePrompt).toBeDefined();
      expect(request.negativePrompt).toContain('deformed');
    });

    it('should handle photo source', () => {
      const request = buildGenerationRequest(
        { type: 'photo' },
        'pixar',
        '4:3',
        'base64ImageData'
      );

      expect(request.prompt).toContain('portrait transformation');
      expect(request.sourceImageBase64).toBe('base64ImageData');
    });

    it('should include style-specific prompts', () => {
      const animeRequest = buildGenerationRequest(
        mockBuilderSource,
        'anime',
        '1:1'
      );
      expect(animeRequest.prompt).toContain('anime');

      const pixarRequest = buildGenerationRequest(
        mockBuilderSource,
        'pixar',
        '1:1'
      );
      expect(pixarRequest.prompt).toContain('pixar');
    });

    it('should include accessories in prompt', () => {
      const sourceWithAccessories: BuilderSource = {
        ...mockBuilderSource,
        accessories: ['glasses', 'earrings'],
      };

      const request = buildGenerationRequest(
        sourceWithAccessories,
        'anime',
        '1:1'
      );

      expect(request.prompt).toContain('glasses');
      expect(request.prompt).toContain('earrings');
    });

    it('should include facial hair in prompt', () => {
      const sourceWithBeard: BuilderSource = {
        ...mockBuilderSource,
        gender: 'masculine',
        facialHair: 'full-beard',
      };

      const request = buildGenerationRequest(
        sourceWithBeard,
        'anime',
        '1:1'
      );

      expect(request.prompt).toContain('full beard');
    });
  });

  describe('Aspect Ratio Handling', () => {
    const mockBuilderSource: BuilderSource = {
      type: 'builder',
      gender: 'masculine',
      ageRange: 'adult',
      skinTone: 'medium',
      hairStyle: 'short',
      hairColor: 'black',
      eyeColor: 'brown',
      eyeShape: 'almond',
      facialHair: 'none',
      faceShape: 'square',
      accessories: [],
      expression: 'confident',
    };

    it('should support 1:1 aspect ratio', () => {
      const request = buildGenerationRequest(
        mockBuilderSource,
        'anime',
        '1:1'
      );
      expect(request.aspectRatio).toBe('1:1');
    });

    it('should support 3:4 aspect ratio', () => {
      const request = buildGenerationRequest(
        mockBuilderSource,
        'anime',
        '3:4'
      );
      expect(request.aspectRatio).toBe('3:4');
    });

    it('should support 4:3 aspect ratio', () => {
      const request = buildGenerationRequest(
        mockBuilderSource,
        'anime',
        '4:3'
      );
      expect(request.aspectRatio).toBe('4:3');
    });

    it('should support 9:16 aspect ratio', () => {
      const request = buildGenerationRequest(
        mockBuilderSource,
        'anime',
        '9:16'
      );
      expect(request.aspectRatio).toBe('9:16');
    });
  });

  describe('Style Configurations', () => {
    const mockBuilderSource: BuilderSource = {
      type: 'builder',
      gender: 'androgynous',
      ageRange: 'teen',
      skinTone: 'fair',
      hairStyle: 'medium',
      hairColor: 'blonde',
      eyeColor: 'blue',
      eyeShape: 'round',
      facialHair: 'none',
      faceShape: 'heart',
      accessories: [],
      expression: 'playful',
    };

    const styles = [
      'anime',
      'pixar',
      '3d-render',
      'pixel-art',
      'watercolor',
      'comic',
      'cyberpunk',
      'fantasy',
    ] as const;

    styles.forEach((style) => {
      it(`should generate valid request for ${style} style`, () => {
        const request = buildGenerationRequest(
          mockBuilderSource,
          style,
          '1:1'
        );

        expect(request.style).toBe(style);
        expect(request.prompt.length).toBeGreaterThan(10);
        expect(request.negativePrompt).toBeDefined();
      });
    });
  });
});
