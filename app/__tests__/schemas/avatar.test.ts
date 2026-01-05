import {
  PhotoSourceSchema,
  BuilderSourceSchema,
  AvatarSourceSchema,
  BackgroundConfigSchema,
  AvatarFormSchema,
  HexColorSchema,
  PhotoItemSchema,
  PhotosSchema,
  StyleModifiersSchema,
} from '@/schemas/avatar';
import type {
  BuilderSource,
  PhotoSource,
  PhotoItem,
  StyleModifiers,
} from '@/schemas/avatar';

describe('HexColorSchema', () => {
  it('should validate valid hex colors', () => {
    expect(HexColorSchema.safeParse('#FF5733').success).toBe(true);
    expect(HexColorSchema.safeParse('#000000').success).toBe(true);
    expect(HexColorSchema.safeParse('#FFFFFF').success).toBe(true);
    expect(HexColorSchema.safeParse('#abc123').success).toBe(true);
  });

  it('should reject invalid hex colors', () => {
    expect(HexColorSchema.safeParse('FF5733').success).toBe(false); // Missing #
    expect(HexColorSchema.safeParse('#FFF').success).toBe(false); // Too short
    expect(HexColorSchema.safeParse('#GGGGGG').success).toBe(false); // Invalid chars
    expect(HexColorSchema.safeParse('#FF573').success).toBe(false); // 5 chars
    expect(HexColorSchema.safeParse('invalid').success).toBe(false);
  });
});

describe('PhotoSourceSchema', () => {
  const validPhotoSource: PhotoSource = {
    type: 'photo',
    uri: 'file://photo.jpg',
    width: 512,
    height: 512,
    mimeType: 'image/jpeg',
  };

  it('should validate valid photo source', () => {
    const result = PhotoSourceSchema.safeParse(validPhotoSource);
    expect(result.success).toBe(true);
  });

  it('should reject photo with dimensions below 256px', () => {
    const smallWidth = { ...validPhotoSource, width: 200 };
    expect(PhotoSourceSchema.safeParse(smallWidth).success).toBe(false);

    const smallHeight = { ...validPhotoSource, height: 100 };
    expect(PhotoSourceSchema.safeParse(smallHeight).success).toBe(false);
  });

  it('should accept exactly 256px dimensions', () => {
    const minSize = { ...validPhotoSource, width: 256, height: 256 };
    expect(PhotoSourceSchema.safeParse(minSize).success).toBe(true);
  });

  it('should reject empty uri', () => {
    const emptyUri = { ...validPhotoSource, uri: '' };
    expect(PhotoSourceSchema.safeParse(emptyUri).success).toBe(false);
  });

  it('should only accept valid mime types', () => {
    const jpeg = { ...validPhotoSource, mimeType: 'image/jpeg' };
    const png = { ...validPhotoSource, mimeType: 'image/png' };
    const webp = { ...validPhotoSource, mimeType: 'image/webp' };
    const gif = { ...validPhotoSource, mimeType: 'image/gif' };

    expect(PhotoSourceSchema.safeParse(jpeg).success).toBe(true);
    expect(PhotoSourceSchema.safeParse(png).success).toBe(true);
    expect(PhotoSourceSchema.safeParse(webp).success).toBe(true);
    expect(PhotoSourceSchema.safeParse(gif).success).toBe(false);
  });

  it('should require type to be "photo"', () => {
    const wrongType = { ...validPhotoSource, type: 'builder' };
    expect(PhotoSourceSchema.safeParse(wrongType).success).toBe(false);
  });
});

describe('BuilderSourceSchema', () => {
  const validBuilderSource: BuilderSource = {
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

  it('should validate a complete builder source', () => {
    const result = BuilderSourceSchema.safeParse(validBuilderSource);
    expect(result.success).toBe(true);
  });

  it('should reject builder source missing required fields', () => {
    const { gender, ...incomplete } = validBuilderSource;
    const result = BuilderSourceSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('should limit accessories to maximum of 3', () => {
    const tooManyAccessories = {
      ...validBuilderSource,
      accessories: ['glasses', 'earrings', 'hat', 'necklace'],
    };
    const result = BuilderSourceSchema.safeParse(tooManyAccessories);
    expect(result.success).toBe(false);
  });

  it('should allow up to 3 accessories', () => {
    const maxAccessories = {
      ...validBuilderSource,
      accessories: ['glasses', 'earrings', 'hat'],
    };
    const result = BuilderSourceSchema.safeParse(maxAccessories);
    expect(result.success).toBe(true);
  });

  it('should default accessories to empty array', () => {
    const { accessories, ...noAccessories } = validBuilderSource;
    const result = BuilderSourceSchema.parse(noAccessories);
    expect(result.accessories).toEqual([]);
  });

  it('should validate all gender options', () => {
    const genders = ['masculine', 'feminine', 'androgynous'] as const;
    genders.forEach((gender) => {
      const source = { ...validBuilderSource, gender };
      expect(BuilderSourceSchema.safeParse(source).success).toBe(true);
    });
  });

  it('should validate all expression options', () => {
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
      const source = { ...validBuilderSource, expression };
      expect(BuilderSourceSchema.safeParse(source).success).toBe(true);
    });
  });
});

describe('AvatarSourceSchema', () => {
  const photoSource: PhotoSource = {
    type: 'photo',
    uri: 'file://photo.jpg',
    width: 512,
    height: 512,
    mimeType: 'image/jpeg',
  };

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
    accessories: ['glasses'],
  };

  it('should discriminate and validate photo type', () => {
    const result = AvatarSourceSchema.safeParse(photoSource);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('photo');
    }
  });

  it('should discriminate and validate builder type', () => {
    const result = AvatarSourceSchema.safeParse(builderSource);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('builder');
    }
  });

  it('should reject invalid type', () => {
    const invalid = { type: 'unknown', data: 'something' };
    const result = AvatarSourceSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('BackgroundConfigSchema', () => {
  it('should validate solid background with primary color', () => {
    const result = BackgroundConfigSchema.safeParse({
      type: 'solid',
      primaryColor: '#FF5733',
    });
    expect(result.success).toBe(true);
  });

  it('should validate gradient background with both colors', () => {
    const result = BackgroundConfigSchema.safeParse({
      type: 'gradient',
      primaryColor: '#FF5733',
      secondaryColor: '#33FF57',
    });
    expect(result.success).toBe(true);
  });

  it('should validate background without colors', () => {
    const result = BackgroundConfigSchema.safeParse({
      type: 'transparent',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid hex color format', () => {
    const result = BackgroundConfigSchema.safeParse({
      type: 'solid',
      primaryColor: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should validate all background types', () => {
    const types = [
      'solid',
      'gradient',
      'abstract',
      'nature',
      'urban',
      'studio',
      'transparent',
    ] as const;
    types.forEach((type) => {
      const result = BackgroundConfigSchema.safeParse({ type });
      expect(result.success).toBe(true);
    });
  });
});

describe('PhotoItemSchema', () => {
  const validPhotoItem: PhotoItem = {
    uri: 'file://photo.jpg',
    width: 512,
    height: 512,
    mimeType: 'image/jpeg',
  };

  it('should validate valid photo item', () => {
    const result = PhotoItemSchema.safeParse(validPhotoItem);
    expect(result.success).toBe(true);
  });

  it('should reject photo with dimensions below 256px', () => {
    const smallWidth = { ...validPhotoItem, width: 200 };
    expect(PhotoItemSchema.safeParse(smallWidth).success).toBe(false);

    const smallHeight = { ...validPhotoItem, height: 100 };
    expect(PhotoItemSchema.safeParse(smallHeight).success).toBe(false);
  });

  it('should accept exactly 256px dimensions', () => {
    const minSize = { ...validPhotoItem, width: 256, height: 256 };
    expect(PhotoItemSchema.safeParse(minSize).success).toBe(true);
  });

  it('should reject empty uri', () => {
    const emptyUri = { ...validPhotoItem, uri: '' };
    expect(PhotoItemSchema.safeParse(emptyUri).success).toBe(false);
  });

  it('should only accept valid mime types', () => {
    const jpeg = { ...validPhotoItem, mimeType: 'image/jpeg' };
    const png = { ...validPhotoItem, mimeType: 'image/png' };
    const webp = { ...validPhotoItem, mimeType: 'image/webp' };
    const gif = { ...validPhotoItem, mimeType: 'image/gif' };

    expect(PhotoItemSchema.safeParse(jpeg).success).toBe(true);
    expect(PhotoItemSchema.safeParse(png).success).toBe(true);
    expect(PhotoItemSchema.safeParse(webp).success).toBe(true);
    expect(PhotoItemSchema.safeParse(gif).success).toBe(false);
  });
});

describe('PhotosSchema', () => {
  const validPhoto: PhotoItem = {
    uri: 'file://photo.jpg',
    width: 512,
    height: 512,
    mimeType: 'image/jpeg',
  };

  it('should require at least 1 photo', () => {
    expect(PhotosSchema.safeParse([]).success).toBe(false);
  });

  it('should accept 1 photo', () => {
    expect(PhotosSchema.safeParse([validPhoto]).success).toBe(true);
  });

  it('should accept 2 photos', () => {
    expect(PhotosSchema.safeParse([validPhoto, validPhoto]).success).toBe(true);
  });

  it('should accept 3 photos', () => {
    expect(
      PhotosSchema.safeParse([validPhoto, validPhoto, validPhoto]).success
    ).toBe(true);
  });

  it('should reject more than 3 photos', () => {
    expect(
      PhotosSchema.safeParse([validPhoto, validPhoto, validPhoto, validPhoto])
        .success
    ).toBe(false);
  });

  it('should reject invalid photo in array', () => {
    const invalidPhoto = { ...validPhoto, width: 100 };
    expect(PhotosSchema.safeParse([validPhoto, invalidPhoto]).success).toBe(
      false
    );
  });
});

describe('StyleModifiersSchema', () => {
  it('should accept empty object', () => {
    const result = StyleModifiersSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial modifiers', () => {
    const result = StyleModifiersSchema.safeParse({ hairColor: 'blue' });
    expect(result.success).toBe(true);
  });

  it('should accept full modifiers', () => {
    const modifiers: StyleModifiers = {
      hairColor: 'pink',
      expression: 'smiling',
      facialHair: 'stubble',
      accessories: ['glasses', 'hat'],
    };
    const result = StyleModifiersSchema.safeParse(modifiers);
    expect(result.success).toBe(true);
  });

  it('should limit accessories to maximum of 3', () => {
    const tooMany = {
      accessories: ['glasses', 'earrings', 'hat', 'necklace'],
    };
    expect(StyleModifiersSchema.safeParse(tooMany).success).toBe(false);
  });

  it('should allow up to 3 accessories', () => {
    const maxAccessories = {
      accessories: ['glasses', 'earrings', 'hat'],
    };
    expect(StyleModifiersSchema.safeParse(maxAccessories).success).toBe(true);
  });

  it('should validate hair color options', () => {
    const colors = ['blue', 'pink', 'purple', 'rainbow'] as const;
    colors.forEach((hairColor) => {
      const result = StyleModifiersSchema.safeParse({ hairColor });
      expect(result.success).toBe(true);
    });
  });

  it('should validate expression options', () => {
    const expressions = ['smiling', 'serious', 'playful'] as const;
    expressions.forEach((expression) => {
      const result = StyleModifiersSchema.safeParse({ expression });
      expect(result.success).toBe(true);
    });
  });
});

describe('AvatarFormSchema', () => {
  const validPhoto: PhotoItem = {
    uri: 'file://photo.jpg',
    width: 512,
    height: 512,
    mimeType: 'image/jpeg',
  };

  it('should validate complete avatar form with photos', () => {
    const form = {
      photos: [validPhoto],
      style: 'anime',
      background: { type: 'solid', primaryColor: '#FFFFFF' },
      aspectRatio: '1:1',
    };
    const result = AvatarFormSchema.safeParse(form);
    expect(result.success).toBe(true);
  });

  it('should require at least 1 photo', () => {
    const form = {
      photos: [],
      style: 'anime',
      background: { type: 'solid' },
    };
    const result = AvatarFormSchema.safeParse(form);
    expect(result.success).toBe(false);
  });

  it('should accept form with style modifiers', () => {
    const form = {
      photos: [validPhoto],
      style: 'anime',
      styleModifiers: { hairColor: 'blue', expression: 'smiling' },
      background: { type: 'solid' },
    };
    const result = AvatarFormSchema.safeParse(form);
    expect(result.success).toBe(true);
  });

  it('should accept form without style modifiers', () => {
    const form = {
      photos: [validPhoto],
      style: 'anime',
      background: { type: 'solid' },
    };
    const result = AvatarFormSchema.safeParse(form);
    expect(result.success).toBe(true);
  });

  it('should default aspectRatio to 1:1', () => {
    const form = {
      photos: [validPhoto],
      style: 'anime',
      background: { type: 'solid' },
    };
    const result = AvatarFormSchema.parse(form);
    expect(result.aspectRatio).toBe('1:1');
  });

  it('should validate all style options', () => {
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
      const form = {
        photos: [validPhoto],
        style,
        background: { type: 'solid' },
      };
      const result = AvatarFormSchema.safeParse(form);
      expect(result.success).toBe(true);
    });
  });

  it('should validate all aspect ratios', () => {
    const ratios = ['1:1', '3:4', '4:3', '9:16'] as const;
    ratios.forEach((aspectRatio) => {
      const form = {
        photos: [validPhoto],
        style: 'anime',
        background: { type: 'solid' },
        aspectRatio,
      };
      const result = AvatarFormSchema.safeParse(form);
      expect(result.success).toBe(true);
    });
  });

  it('should accept multiple photos with modifiers', () => {
    const form = {
      photos: [validPhoto, validPhoto, validPhoto],
      style: 'pixar',
      styleModifiers: {
        hairColor: 'rainbow',
        accessories: ['glasses'],
      },
      background: { type: 'gradient', primaryColor: '#000000' },
      aspectRatio: '4:3',
    };
    const result = AvatarFormSchema.safeParse(form);
    expect(result.success).toBe(true);
  });
});
