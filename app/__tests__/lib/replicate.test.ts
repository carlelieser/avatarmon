import {
  buildPromptFromBuilder,
  buildGenerationRequest,
  buildModifierPrompt,
  STYLE_PROMPTS,
} from '@/lib/replicate';
import type { BuilderSource, StyleModifiers } from '@/schemas/avatar';
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

describe('buildModifierPrompt', () => {
  it('should return empty string for undefined modifiers', () => {
    expect(buildModifierPrompt(undefined)).toBe('');
  });

  it('should return empty string for empty modifiers', () => {
    expect(buildModifierPrompt({})).toBe('');
  });

  it('should include hair color when provided', () => {
    const modifiers: StyleModifiers = { hairColor: 'blue' };
    const prompt = buildModifierPrompt(modifiers);
    expect(prompt).toContain('blue hair');
  });

  it('should include expression when provided', () => {
    const modifiers: StyleModifiers = { expression: 'smiling' };
    const prompt = buildModifierPrompt(modifiers);
    expect(prompt).toContain('smiling expression');
  });

  it('should include facial hair when provided and not none', () => {
    const modifiers: StyleModifiers = { facialHair: 'full-beard' };
    const prompt = buildModifierPrompt(modifiers);
    expect(prompt).toContain('full beard');
  });

  it('should NOT include facial hair when set to none', () => {
    const modifiers: StyleModifiers = { facialHair: 'none' };
    const prompt = buildModifierPrompt(modifiers);
    expect(prompt).toBe('');
  });

  it('should include accessories when provided', () => {
    const modifiers: StyleModifiers = { accessories: ['glasses', 'hat'] };
    const prompt = buildModifierPrompt(modifiers);
    expect(prompt).toContain('wearing glasses, hat');
  });

  it('should combine multiple modifiers', () => {
    const modifiers: StyleModifiers = {
      hairColor: 'pink',
      expression: 'playful',
      accessories: ['sunglasses'],
    };
    const prompt = buildModifierPrompt(modifiers);
    expect(prompt).toContain('pink hair');
    expect(prompt).toContain('playful expression');
    expect(prompt).toContain('wearing sunglasses');
  });

  it('should handle hyphenated values correctly', () => {
    const modifiers: StyleModifiers = { facialHair: 'short-beard' };
    const prompt = buildModifierPrompt(modifiers);
    expect(prompt).toContain('short beard');
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

  // New tests for updated buildGenerationRequest with multiple images
  it('should accept sourceImagesBase64 array', () => {
    const images = ['base64image1', 'base64image2'];
    const request = buildGenerationRequest(
      { type: 'photo' },
      'anime',
      '1:1',
      images
    );
    expect(request.sourceImagesBase64).toEqual(images);
  });

  it('should include style modifiers in prompt when provided', () => {
    const modifiers: StyleModifiers = {
      hairColor: 'blue',
      expression: 'smiling',
    };
    const request = buildGenerationRequest(
      { type: 'photo' },
      'anime',
      '1:1',
      ['base64image'],
      modifiers
    );
    expect(request.prompt).toContain('blue hair');
    expect(request.prompt).toContain('smiling expression');
  });

  it('should work without style modifiers', () => {
    const request = buildGenerationRequest(
      { type: 'photo' },
      'pixar',
      '4:3',
      ['base64image']
    );
    expect(request.prompt).toContain('portrait transformation');
    expect(request.sourceImagesBase64).toEqual(['base64image']);
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
