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

export const AspectRatioEnum = z.enum([
  '1:1',
  '3:4',
  '4:3',
  '9:16',
]);

export type Style = z.infer<typeof StyleEnum>;
export type AspectRatio = z.infer<typeof AspectRatioEnum>;
