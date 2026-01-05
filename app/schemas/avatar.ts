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
} from './enums';

// Hex color validation
export const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color');

// Photo source input (legacy - for backward compatibility)
export const PhotoSourceSchema = z.object({
  type: z.literal('photo'),
  uri: z.string().min(1),
  width: z.number().min(256),
  height: z.number().min(256),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

// Photo item (without type discriminator - for photos array)
export const PhotoItemSchema = z.object({
  uri: z.string().min(1),
  width: z.number().min(256),
  height: z.number().min(256),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

// Required photos array (1-3 photos for better likeness)
export const PhotosSchema = z.array(PhotoItemSchema).min(1).max(3);

// Builder source input
export const BuilderSourceSchema = z.object({
  type: z.literal('builder'),

  // Face structure
  gender: GenderEnum,
  ageRange: AgeRangeEnum,
  faceShape: FaceShapeEnum,
  skinTone: SkinToneEnum,

  // Hair
  hairStyle: HairStyleEnum,
  hairColor: HairColorEnum,

  // Eyes
  eyeColor: EyeColorEnum,
  eyeShape: EyeShapeEnum,

  // Facial hair
  facialHair: FacialHairEnum,

  // Expression
  expression: ExpressionEnum,

  // Accessories (max 3)
  accessories: z.array(AccessoryEnum).max(3).default([]),
});

// Combined source (discriminated union) - legacy for backward compatibility
export const AvatarSourceSchema = z.discriminatedUnion('type', [
  PhotoSourceSchema,
  BuilderSourceSchema,
]);

// Style modifiers (optional enhancements applied on top of photo-based avatars)
export const StyleModifiersSchema = z.object({
  hairColor: HairColorEnum.optional(),
  expression: ExpressionEnum.optional(),
  facialHair: FacialHairEnum.optional(),
  accessories: z.array(AccessoryEnum).max(3).optional(),
});

// Background configuration
export const BackgroundConfigSchema = z.object({
  type: BackgroundTypeEnum,
  primaryColor: HexColorSchema.optional(),
  secondaryColor: HexColorSchema.optional(),
});

// Complete avatar form (updated: photos required, styleModifiers optional)
export const AvatarFormSchema = z.object({
  photos: PhotosSchema,
  styleModifiers: StyleModifiersSchema.optional(),
  style: StyleEnum,
  background: BackgroundConfigSchema.default({ type: 'solid' }),
  aspectRatio: AspectRatioEnum.default('1:1'),
});

// Type exports
export type PhotoSource = z.infer<typeof PhotoSourceSchema>;
export type PhotoItem = z.infer<typeof PhotoItemSchema>;
export type BuilderSource = z.infer<typeof BuilderSourceSchema>;
export type AvatarSource = z.infer<typeof AvatarSourceSchema>;
export type StyleModifiers = z.infer<typeof StyleModifiersSchema>;
export type BackgroundConfig = z.infer<typeof BackgroundConfigSchema>;
export type AvatarForm = z.infer<typeof AvatarFormSchema>;
