import { z } from 'zod';
import { GenerationRecordSchema } from './api';

export const UserStateSchema = z.object({
  // Purchase state
  hasPremium: z.boolean().default(false),
  purchaseDate: z.string().datetime().optional(),

  // Usage limits (free tier)
  generationsToday: z.number().int().min(0).default(0),
  lastGenerationDate: z.string().datetime().optional(),

  // History
  generations: z.array(GenerationRecordSchema).default([]),

  // Preferences
  preferredStyle: z.string().optional(),
  onboardingComplete: z.boolean().default(false),
});

export type UserState = z.infer<typeof UserStateSchema>;

// Constants
export const FREE_DAILY_LIMIT = 5;
export const MAX_HISTORY_ITEMS = 50;
