import { z } from 'zod';
import { StyleEnum, AspectRatioEnum } from './enums';

export const GenerationRequestSchema = z.object({
  prompt: z.string().min(10).max(1000),
  negativePrompt: z.string().max(500).optional(),
  style: StyleEnum,
  aspectRatio: AspectRatioEnum,
  seed: z.number().int().positive().optional(),
  sourceImageBase64: z.string().optional(),
});

export const GenerationStatusEnum = z.enum([
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);

export const GenerationResponseSchema = z.object({
  id: z.string().uuid(),
  status: GenerationStatusEnum,
  progress: z.number().min(0).max(100).optional(),
  estimatedSeconds: z.number().optional(),
  imageUrl: z.string().url().optional(),
  error: z.string().optional(),
});

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export type GenerationStatus = z.infer<typeof GenerationStatusEnum>;
export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;
