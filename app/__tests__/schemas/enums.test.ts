import { z } from 'zod';
import {
  StyleEnum,
  GenderEnum,
  AgeRangeEnum,
  SkinToneEnum,
  HairStyleEnum,
  HairColorEnum,
  EyeColorEnum,
  EyeShapeEnum,
  FacialHairEnum,
  FaceShapeEnum,
  AccessoryEnum,
  ExpressionEnum,
  BackgroundTypeEnum,
  AspectRatioEnum,
} from '@/schemas/enums';

describe('StyleEnum', () => {
  const validStyles = [
    'anime',
    'pixar',
    '3d-render',
    'pixel-art',
    'watercolor',
    'comic',
    'cyberpunk',
    'fantasy',
  ];

  it.each(validStyles)('should validate "%s" as a valid style', (style) => {
    expect(StyleEnum.safeParse(style).success).toBe(true);
  });

  it('should reject invalid style values', () => {
    expect(StyleEnum.safeParse('invalid-style').success).toBe(false);
    expect(StyleEnum.safeParse('').success).toBe(false);
    expect(StyleEnum.safeParse(123).success).toBe(false);
  });

  it('should have exactly 8 styles', () => {
    expect(StyleEnum.options.length).toBe(8);
  });
});

describe('GenderEnum', () => {
  const validGenders = ['masculine', 'feminine', 'androgynous'];

  it.each(validGenders)('should validate "%s" as a valid gender', (gender) => {
    expect(GenderEnum.safeParse(gender).success).toBe(true);
  });

  it('should reject invalid gender values', () => {
    expect(GenderEnum.safeParse('male').success).toBe(false);
    expect(GenderEnum.safeParse('female').success).toBe(false);
  });
});

describe('AgeRangeEnum', () => {
  const validAgeRanges = [
    'child',
    'teen',
    'young-adult',
    'adult',
    'middle-aged',
    'elder',
  ];

  it.each(validAgeRanges)('should validate "%s" as a valid age range', (age) => {
    expect(AgeRangeEnum.safeParse(age).success).toBe(true);
  });

  it('should reject invalid age range values', () => {
    expect(AgeRangeEnum.safeParse('young').success).toBe(false);
    expect(AgeRangeEnum.safeParse('old').success).toBe(false);
  });
});

describe('SkinToneEnum', () => {
  const validSkinTones = [
    'porcelain',
    'fair',
    'light',
    'medium',
    'olive',
    'tan',
    'brown',
    'dark',
    'deep',
  ];

  it.each(validSkinTones)('should validate "%s" as a valid skin tone', (tone) => {
    expect(SkinToneEnum.safeParse(tone).success).toBe(true);
  });

  it('should have exactly 9 skin tones', () => {
    expect(SkinToneEnum.options.length).toBe(9);
  });
});

describe('HairStyleEnum', () => {
  const validHairStyles = [
    'bald',
    'buzzcut',
    'short',
    'medium',
    'long',
    'very-long',
    'curly',
    'wavy',
    'straight',
    'afro',
    'braided',
    'dreadlocks',
    'ponytail',
    'bun',
    'mohawk',
    'undercut',
  ];

  it.each(validHairStyles)('should validate "%s" as a valid hair style', (style) => {
    expect(HairStyleEnum.safeParse(style).success).toBe(true);
  });

  it('should have exactly 16 hair styles', () => {
    expect(HairStyleEnum.options.length).toBe(16);
  });
});

describe('HairColorEnum', () => {
  const validHairColors = [
    'black',
    'dark-brown',
    'brown',
    'light-brown',
    'blonde',
    'platinum',
    'red',
    'auburn',
    'ginger',
    'gray',
    'white',
    'blue',
    'pink',
    'purple',
    'green',
    'rainbow',
  ];

  it.each(validHairColors)('should validate "%s" as a valid hair color', (color) => {
    expect(HairColorEnum.safeParse(color).success).toBe(true);
  });

  it('should have exactly 16 hair colors', () => {
    expect(HairColorEnum.options.length).toBe(16);
  });
});

describe('EyeColorEnum', () => {
  const validEyeColors = [
    'brown',
    'dark-brown',
    'hazel',
    'amber',
    'green',
    'blue',
    'gray',
    'violet',
    'heterochromia',
  ];

  it.each(validEyeColors)('should validate "%s" as a valid eye color', (color) => {
    expect(EyeColorEnum.safeParse(color).success).toBe(true);
  });

  it('should have exactly 9 eye colors', () => {
    expect(EyeColorEnum.options.length).toBe(9);
  });
});

describe('EyeShapeEnum', () => {
  const validEyeShapes = [
    'almond',
    'round',
    'hooded',
    'monolid',
    'downturned',
    'upturned',
  ];

  it.each(validEyeShapes)('should validate "%s" as a valid eye shape', (shape) => {
    expect(EyeShapeEnum.safeParse(shape).success).toBe(true);
  });

  it('should have exactly 6 eye shapes', () => {
    expect(EyeShapeEnum.options.length).toBe(6);
  });
});

describe('FacialHairEnum', () => {
  const validFacialHair = [
    'none',
    'stubble',
    'short-beard',
    'full-beard',
    'long-beard',
    'goatee',
    'mustache',
    'soul-patch',
    'mutton-chops',
  ];

  it.each(validFacialHair)('should validate "%s" as valid facial hair', (hair) => {
    expect(FacialHairEnum.safeParse(hair).success).toBe(true);
  });

  it('should have exactly 9 facial hair options', () => {
    expect(FacialHairEnum.options.length).toBe(9);
  });
});

describe('FaceShapeEnum', () => {
  const validFaceShapes = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond'];

  it.each(validFaceShapes)('should validate "%s" as a valid face shape', (shape) => {
    expect(FaceShapeEnum.safeParse(shape).success).toBe(true);
  });

  it('should have exactly 6 face shapes', () => {
    expect(FaceShapeEnum.options.length).toBe(6);
  });
});

describe('AccessoryEnum', () => {
  const validAccessories = [
    'glasses',
    'sunglasses',
    'monocle',
    'earrings',
    'ear-gauges',
    'nose-ring',
    'lip-piercing',
    'eyebrow-piercing',
    'hat',
    'beanie',
    'headband',
    'headphones',
    'over-ear-headphones',
    'necklace',
    'choker',
    'scarf',
    'mask',
  ];

  it.each(validAccessories)('should validate "%s" as a valid accessory', (accessory) => {
    expect(AccessoryEnum.safeParse(accessory).success).toBe(true);
  });

  it('should have exactly 17 accessories', () => {
    expect(AccessoryEnum.options.length).toBe(17);
  });
});

describe('ExpressionEnum', () => {
  const validExpressions = [
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
  ];

  it.each(validExpressions)('should validate "%s" as a valid expression', (expression) => {
    expect(ExpressionEnum.safeParse(expression).success).toBe(true);
  });

  it('should have exactly 12 expressions', () => {
    expect(ExpressionEnum.options.length).toBe(12);
  });
});

describe('BackgroundTypeEnum', () => {
  const validBackgrounds = [
    'solid',
    'gradient',
    'abstract',
    'nature',
    'urban',
    'studio',
    'transparent',
  ];

  it.each(validBackgrounds)('should validate "%s" as a valid background type', (bg) => {
    expect(BackgroundTypeEnum.safeParse(bg).success).toBe(true);
  });

  it('should have exactly 7 background types', () => {
    expect(BackgroundTypeEnum.options.length).toBe(7);
  });
});

describe('AspectRatioEnum', () => {
  const validRatios = ['1:1', '3:4', '4:3', '9:16'];

  it.each(validRatios)('should validate "%s" as a valid aspect ratio', (ratio) => {
    expect(AspectRatioEnum.safeParse(ratio).success).toBe(true);
  });

  it('should have exactly 4 aspect ratios', () => {
    expect(AspectRatioEnum.options.length).toBe(4);
  });

  it('should reject invalid aspect ratios', () => {
    expect(AspectRatioEnum.safeParse('16:9').success).toBe(false);
    expect(AspectRatioEnum.safeParse('2:1').success).toBe(false);
  });
});
