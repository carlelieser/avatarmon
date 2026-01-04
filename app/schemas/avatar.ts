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

// Photo source input
export const PhotoSourceSchema = z.object({
  type: z.literal('photo'),
  uri: z.string().min(1),
  width: z.number().min(256),
  height: z.number().min(256),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

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

// Combined source (discriminated union)
export const AvatarSourceSchema = z.discriminatedUnion('type', [
  PhotoSourceSchema,
  BuilderSourceSchema,
]);

// Background configuration
export const BackgroundConfigSchema = z.object({
  type: BackgroundTypeEnum,
  primaryColor: HexColorSchema.optional(),
  secondaryColor: HexColorSchema.optional(),
});

// Complete avatar form
export const AvatarFormSchema = z.object({
  source: AvatarSourceSchema,
  style: StyleEnum,
  background: BackgroundConfigSchema.default({ type: 'solid' }),
  aspectRatio: AspectRatioEnum.default('1:1'),
});

// Type exports
export type PhotoSource = z.infer<typeof PhotoSourceSchema>;
export type BuilderSource = z.infer<typeof BuilderSourceSchema>;
export type AvatarSource = z.infer<typeof AvatarSourceSchema>;
export type BackgroundConfig = z.infer<typeof BackgroundConfigSchema>;
export type AvatarForm = z.infer<typeof AvatarFormSchema>;
