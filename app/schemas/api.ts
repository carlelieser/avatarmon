import { z } from 'zod';
import { StyleEnum, AspectRatioEnum } from './enums';

// Generation request (client → server)
export const GenerationRequestSchema = z.object({
  prompt: z.string().min(10).max(1000),
  negativePrompt: z.string().max(500).optional(),
  style: StyleEnum,
  aspectRatio: AspectRatioEnum,
  seed: z.number().int().positive().optional(),
  sourceImageBase64: z.string().optional(),
});

// Generation job status
export const GenerationStatusEnum = z.enum([
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);

// Generation response (server → client)
export const GenerationResponseSchema = z.object({
  id: z.string().uuid(),
  status: GenerationStatusEnum,
  progress: z.number().min(0).max(100).optional(),
  estimatedSeconds: z.number().optional(),
  imageUrl: z.string().url().optional(),
  error: z.string().optional(),
});

// Stored generation record
export const GenerationRecordSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  localUri: z.string().optional(),
  prompt: z.string(),
  style: StyleEnum,
  aspectRatio: AspectRatioEnum,
  createdAt: z.string().datetime(),
  exportedAt: z.string().datetime().optional(),
  isPremiumExport: z.boolean().default(false),
});

// Type exports
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export type GenerationStatus = z.infer<typeof GenerationStatusEnum>;
export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;
export type GenerationRecord = z.infer<typeof GenerationRecordSchema>;
