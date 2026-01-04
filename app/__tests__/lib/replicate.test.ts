import {
  buildPromptFromBuilder,
  buildGenerationRequest,
  STYLE_PROMPTS,
} from '@/lib/replicate';
import type { BuilderSource } from '@/schemas/avatar';
import type { Style } from '@/schemas/enums';

describe('buildPromptFromBuilder', () => {
  const baseSource: BuilderSource = {
    type: 'builder',
    gender: 'masculine',
    ageRange: 'young-adult',
    faceShape: 'oval',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'brown',
    eyeColor: 'brown',
    eyeShape: 'almond',
    facialHair: 'none',
    expression: 'neutral',
    accessories: [],
  };

  it('should include all basic descriptors in prompt', () => {
    const prompt = buildPromptFromBuilder(baseSource);
    expect(prompt).toContain('portrait');
    expect(prompt).toContain('masculine');
    expect(prompt).toContain('young adult');
    expect(prompt).toContain('oval face shape');
    expect(prompt).toContain('medium skin tone');
    expect(prompt).toContain('short brown hair');
    expect(prompt).toContain('brown almond eyes');
    expect(prompt).toContain('neutral expression');
  });

  it('should include facial hair when not none', () => {
    const source = { ...baseSource, facialHair: 'full-beard' as const };
    const prompt = buildPromptFromBuilder(source);
    expect(prompt).toContain('full beard');
  });

  it('should NOT include facial hair when none', () => {
    const prompt = buildPromptFromBuilder(baseSource);
    expect(prompt).not.toContain('none');
  });

  it('should include accessories when present', () => {
    const source: BuilderSource = {
      ...baseSource,
      accessories: ['glasses', 'earrings'],
    };
    const prompt = buildPromptFromBuilder(source);
    expect(prompt).toContain('wearing glasses, earrings');
  });

  it('should NOT include accessories text when empty', () => {
    const prompt = buildPromptFromBuilder(baseSource);
    expect(prompt).not.toContain('wearing');
  });

  it('should handle hyphenated enum values correctly', () => {
    const source = {
      ...baseSource,
      ageRange: 'middle-aged' as const,
      facialHair: 'short-beard' as const,
    };
    const prompt = buildPromptFromBuilder(source);
    expect(prompt).toContain('middle aged');
    expect(prompt).toContain('short beard');
  });

  it('should handle all gender options', () => {
    const genders = ['masculine', 'feminine', 'androgynous'] as const;
    genders.forEach((gender) => {
      const source = { ...baseSource, gender };
      const prompt = buildPromptFromBuilder(source);
      expect(prompt).toContain(gender);
    });
  });

  it('should handle all expression options', () => {
    const expressions = [
      'neutral',
      'happy',
      'smiling',
      'laughing',
      'confident',
      'serious',
      'thoughtful',
      'mysterious',
      'playful',
      'winking',
      'surprised',
      'determined',
    ] as const;
    expressions.forEach((expression) => {
      const source = { ...baseSource, expression };
      const prompt = buildPromptFromBuilder(source);
      expect(prompt).toContain(`${expression} expression`);
    });
  });
});

describe('buildGenerationRequest', () => {
  const builderSource: BuilderSource = {
    type: 'builder',
    gender: 'feminine',
    ageRange: 'adult',
    faceShape: 'heart',
    skinTone: 'fair',
    hairStyle: 'long',
    hairColor: 'blonde',
    eyeColor: 'blue',
    eyeShape: 'round',
    facialHair: 'none',
    expression: 'smiling',
    accessories: [],
  };

  it('should combine base prompt with style-specific prompts', () => {
    const request = buildGenerationRequest(builderSource, 'anime', '1:1');

    expect(request.prompt).toContain('feminine');
    expect(request.prompt).toContain('anime style');
    expect(request.negativePrompt).toContain('realistic');
  });

  it('should include correct aspect ratio', () => {
    const request = buildGenerationRequest(
      { type: 'photo' },
      'pixar',
      '3:4'
    );
    expect(request.aspectRatio).toBe('3:4');
  });

  it('should include style in request', () => {
    const request = buildGenerationRequest(builderSource, 'comic', '1:1');
    expect(request.style).toBe('comic');
  });

  it('should include sourceImageBase64 for photo type', () => {
    const request = buildGenerationRequest(
      { type: 'photo' },
      'comic',
      '1:1',
      'base64encodedimage'
    );
    expect(request.sourceImageBase64).toBe('base64encodedimage');
  });

  it('should not include sourceImageBase64 when not provided', () => {
    const request = buildGenerationRequest(builderSource, 'anime', '1:1');
    expect(request.sourceImageBase64).toBeUndefined();
  });

  it('should use "portrait transformation" for photo type', () => {
    const request = buildGenerationRequest({ type: 'photo' }, 'pixar', '1:1');
    expect(request.prompt).toContain('portrait transformation');
  });

  it('should include negative prompts for quality', () => {
    const request = buildGenerationRequest(builderSource, 'anime', '1:1');
    expect(request.negativePrompt).toContain('deformed');
    expect(request.negativePrompt).toContain('ugly');
    expect(request.negativePrompt).toContain('blurry');
    expect(request.negativePrompt).toContain('low quality');
  });
});

describe('STYLE_PROMPTS', () => {
  const styles: Style[] = [
    'anime',
    'pixar',
    '3d-render',
    'pixel-art',
    'watercolor',
    'comic',
    'cyberpunk',
    'fantasy',
  ];

  it.each(styles)('should have positive and negative prompts for %s', (style) => {
    expect(STYLE_PROMPTS[style]).toBeDefined();
    expect(STYLE_PROMPTS[style].positive).toBeTruthy();
    expect(STYLE_PROMPTS[style].negative).toBeTruthy();
    expect(typeof STYLE_PROMPTS[style].positive).toBe('string');
    expect(typeof STYLE_PROMPTS[style].negative).toBe('string');
  });

  it('should have unique positive prompts for each style', () => {
    const positivePrompts = styles.map((s) => STYLE_PROMPTS[s].positive);
    const uniquePrompts = new Set(positivePrompts);
    expect(uniquePrompts.size).toBe(styles.length);
  });

  it('anime style should include anime-specific terms', () => {
    expect(STYLE_PROMPTS.anime.positive).toContain('anime');
    expect(STYLE_PROMPTS.anime.negative).toContain('realistic');
  });

  it('pixar style should include 3D animation terms', () => {
    expect(STYLE_PROMPTS.pixar.positive).toContain('pixar');
    expect(STYLE_PROMPTS.pixar.positive).toContain('3d');
  });

  it('pixel-art style should include retro terms', () => {
    expect(STYLE_PROMPTS['pixel-art'].positive).toContain('pixel');
    expect(STYLE_PROMPTS['pixel-art'].negative).toContain('realistic');
  });

  it('cyberpunk style should include futuristic terms', () => {
    expect(STYLE_PROMPTS.cyberpunk.positive).toContain('cyberpunk');
    expect(STYLE_PROMPTS.cyberpunk.positive).toContain('neon');
  });
});
