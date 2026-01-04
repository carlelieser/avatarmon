import { z } from 'zod';

export const StyleEnum = z.enum([
  'anime',
  'pixar',
  '3d-render',
  'pixel-art',
  'watercolor',
  'comic',
  'cyberpunk',
  'fantasy',
]);

export const GenderEnum = z.enum([
  'masculine',
  'feminine',
  'androgynous',
]);

export const AgeRangeEnum = z.enum([
  'child',
  'teen',
  'young-adult',
  'adult',
  'middle-aged',
  'elder',
]);

export const SkinToneEnum = z.enum([
  'porcelain',
  'fair',
  'light',
  'medium',
  'olive',
  'tan',
  'brown',
  'dark',
  'deep',
]);

export const HairStyleEnum = z.enum([
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
]);

export const HairColorEnum = z.enum([
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
]);

export const EyeColorEnum = z.enum([
  'brown',
  'dark-brown',
  'hazel',
  'amber',
  'green',
  'blue',
  'gray',
  'violet',
  'heterochromia',
]);

export const EyeShapeEnum = z.enum([
  'almond',
  'round',
  'hooded',
  'monolid',
  'downturned',
  'upturned',
]);

export const FacialHairEnum = z.enum([
  'none',
  'stubble',
  'short-beard',
  'full-beard',
  'long-beard',
  'goatee',
  'mustache',
  'soul-patch',
  'mutton-chops',
]);

export const FaceShapeEnum = z.enum([
  'oval',
  'round',
  'square',
  'heart',
  'oblong',
  'diamond',
]);

export const AccessoryEnum = z.enum([
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
]);

export const ExpressionEnum = z.enum([
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
]);

export const BackgroundTypeEnum = z.enum([
  'solid',
  'gradient',
  'abstract',
  'nature',
  'urban',
  'studio',
  'transparent',
]);

export const AspectRatioEnum = z.enum([
  '1:1',
  '3:4',
  '4:3',
  '9:16',
]);

// Type exports
export type Style = z.infer<typeof StyleEnum>;
export type Gender = z.infer<typeof GenderEnum>;
export type AgeRange = z.infer<typeof AgeRangeEnum>;
export type SkinTone = z.infer<typeof SkinToneEnum>;
export type HairStyle = z.infer<typeof HairStyleEnum>;
export type HairColor = z.infer<typeof HairColorEnum>;
export type EyeColor = z.infer<typeof EyeColorEnum>;
export type EyeShape = z.infer<typeof EyeShapeEnum>;
export type FacialHair = z.infer<typeof FacialHairEnum>;
export type FaceShape = z.infer<typeof FaceShapeEnum>;
export type Accessory = z.infer<typeof AccessoryEnum>;
export type Expression = z.infer<typeof ExpressionEnum>;
export type BackgroundType = z.infer<typeof BackgroundTypeEnum>;
export type AspectRatio = z.infer<typeof AspectRatioEnum>;
