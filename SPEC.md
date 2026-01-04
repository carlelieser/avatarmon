# Avatarmon — Product Specification

**Version:** 1.0.0  
**Last Updated:** January 3, 2025  
**Status:** Draft

---

## 1. Executive Summary

Avatarmon is a mobile application that enables users to generate stylized AI avatars through two input methods: photo upload with style transfer, or a comprehensive character builder form. The app targets casual users seeking personalized profile pictures, social media content, and digital identity assets.

**Business Model:** Freemium with one-time purchase. Free users receive watermarked, low-resolution exports. A single IAP unlocks full-quality exports permanently.

---

## 2. Tech Stack

| Layer            | Technology             | Version | Purpose                 |
|------------------|------------------------|---------|-------------------------|
| Framework        | Expo                   | SDK 52+ | Cross-platform runtime  |
| Language         | TypeScript             | 5.x     | Type safety             |
| UI Library       | BNA UI                 | Latest  | Component system        |
| Routing          | Expo Router            | v4      | File-based navigation   |
| Validation       | Zod                    | 3.x     | Schema validation       |
| State            | Zustand                | 5.x     | Global state management |
| Forms            | React Hook Form        | 7.x     | Form state + validation |
| AI Backend       | Replicate              | -       | Image generation API    |
| Payments         | RevenueCat             | -       | IAP management          |
| Storage          | expo-file-system       | -       | Local file persistence  |
| Images           | expo-image-picker      | -       | Photo selection         |
| Image Processing | expo-image-manipulator | -       | Resize, watermark       |

---

## 3. User Stories

### 3.1 Core Flows

| ID    | As a...   | I want to...                                     | So that...                                       |
|-------|-----------|--------------------------------------------------|--------------------------------------------------|
| US-01 | User      | Upload a photo and select a style                | I can see myself rendered in that art style      |
| US-02 | User      | Build a character from scratch using form inputs | I can create an avatar without uploading a photo |
| US-03 | User      | Preview my generated avatar before exporting     | I can regenerate if unsatisfied                  |
| US-04 | User      | Export my avatar to camera roll                  | I can use it on other platforms                  |
| US-05 | Free User | See a preview with watermark                     | I understand what I'm getting                    |
| US-06 | User      | Make a one-time purchase                         | I can unlock HD exports permanently              |
| US-07 | User      | View my generation history                       | I can access previous avatars                    |

### 3.2 Edge Cases

| ID    | Scenario                                | Expected Behavior                                       |
|-------|-----------------------------------------|---------------------------------------------------------|
| EC-01 | Generation fails                        | Show error toast, offer retry, no charge to daily limit |
| EC-02 | Network offline                         | Disable generate button, show offline banner            |
| EC-03 | Invalid photo (too small, wrong format) | Validate on selection, show specific error              |
| EC-04 | Purchase interrupted                    | RevenueCat handles restoration                          |
| EC-05 | API rate limited                        | Queue request, show estimated wait time                 |

---

## 4. Information Architecture

### 4.1 Screen Map

```
/                       → HomeScreen (style gallery + CTA)
/create                 → CreatorScreen (photo upload OR form builder)
/create/customize       → CustomizeScreen (post-photo style selection)
/preview                → PreviewScreen (result + export options)
/history                → HistoryScreen (saved generations)
/settings               → SettingsScreen (purchase, restore, about)
```

### 4.2 Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         TABS                                │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Home      │   Create    │   History   │   Settings       │
│   (index)   │             │             │                  │
└──────┬──────┴──────┬──────┴──────┬──────┴────────┬─────────┘
       │             │             │               │
       │             ▼             │               │
       │      ┌─────────────┐     │               │
       │      │  Customize  │     │               │
       │      │   (modal)   │     │               │
       │      └──────┬──────┘     │               │
       │             │             │               │
       │             ▼             │               │
       │      ┌─────────────┐     │               │
       └─────►│   Preview   │◄────┘               │
              │   (modal)   │                     │
              └──────┬──────┘                     │
                     │                            │
                     ▼                            │
              ┌─────────────┐                     │
              │   Paywall   │◄────────────────────┘
              │   (modal)   │
              └─────────────┘
```

---

## 5. Data Models

### 5.1 Enums

```typescript
// schemas/enums.ts
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
```

### 5.2 Core Schemas

```typescript
// schemas/avatar.ts
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
const HexColorSchema = z
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
  
  // Facial hair (conditional)
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
  secondaryColor: HexColorSchema.optional(), // For gradients
});

// Complete avatar form
export const AvatarFormSchema = z.object({
  source: AvatarSourceSchema,
  style: StyleEnum,
  background: BackgroundConfigSchema,
  aspectRatio: AspectRatioEnum.default('1:1'),
});

// Type exports
export type PhotoSource = z.infer<typeof PhotoSourceSchema>;
export type BuilderSource = z.infer<typeof BuilderSourceSchema>;
export type AvatarSource = z.infer<typeof AvatarSourceSchema>;
export type BackgroundConfig = z.infer<typeof BackgroundConfigSchema>;
export type AvatarForm = z.infer<typeof AvatarFormSchema>;
```

### 5.3 API Schemas

```typescript
// schemas/api.ts
import { z } from 'zod';
import { StyleEnum, AspectRatioEnum } from './enums';

// Generation request (client → server)
export const GenerationRequestSchema = z.object({
  prompt: z.string().min(10).max(1000),
  negativePrompt: z.string().max(500).optional(),
  style: StyleEnum,
  aspectRatio: AspectRatioEnum,
  seed: z.number().int().positive().optional(),
  sourceImageBase64: z.string().optional(), // For img2img
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
  localUri: z.string().optional(), // Cached locally
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
```

### 5.4 User State Schema

```typescript
// schemas/user.ts
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
```

---

## 6. State Management

### 6.1 Store Definition

```typescript
// store/avatar-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AvatarForm,
  AvatarSource,
  BackgroundConfig,
} from '@/schemas/avatar';
import {
  GenerationRecord,
  GenerationStatus,
} from '@/schemas/api';
import {
  UserState,
  FREE_DAILY_LIMIT,
  MAX_HISTORY_ITEMS,
} from '@/schemas/user';
import { Style, AspectRatio } from '@/schemas/enums';

interface AvatarState {
  // Form state (transient)
  currentForm: Partial<AvatarForm>;
  
  // Generation state (transient)
  generationId: string | null;
  generationStatus: GenerationStatus | null;
  generationProgress: number;
  generationError: string | null;
  previewUrl: string | null;
  
  // User state (persisted)
  user: UserState;
  
  // Actions - Form
  setSource: (source: AvatarSource) => void;
  setStyle: (style: Style) => void;
  setBackground: (config: BackgroundConfig) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  resetForm: () => void;
  
  // Actions - Generation
  startGeneration: (id: string) => void;
  updateGenerationStatus: (status: GenerationStatus, progress?: number) => void;
  setGenerationResult: (url: string) => void;
  setGenerationError: (error: string) => void;
  clearGeneration: () => void;
  
  // Actions - History
  saveToHistory: (record: GenerationRecord) => void;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // Actions - User
  setPremium: (isPremium: boolean) => void;
  incrementDailyUsage: () => void;
  resetDailyUsage: () => void;
  
  // Computed
  canGenerate: () => boolean;
  remainingGenerations: () => number;
}

const initialUserState: UserState = {
  hasPremium: false,
  generationsToday: 0,
  generations: [],
  onboardingComplete: false,
};

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentForm: {},
      generationId: null,
      generationStatus: null,
      generationProgress: 0,
      generationError: null,
      previewUrl: null,
      user: initialUserState,
      
      // Form actions
      setSource: (source) =>
        set((state) => ({
          currentForm: { ...state.currentForm, source },
        })),
      
      setStyle: (style) =>
        set((state) => ({
          currentForm: { ...state.currentForm, style },
        })),
      
      setBackground: (background) =>
        set((state) => ({
          currentForm: { ...state.currentForm, background },
        })),
      
      setAspectRatio: (aspectRatio) =>
        set((state) => ({
          currentForm: { ...state.currentForm, aspectRatio },
        })),
      
      resetForm: () =>
        set({ currentForm: {} }),
      
      // Generation actions
      startGeneration: (id) =>
        set({
          generationId: id,
          generationStatus: 'queued',
          generationProgress: 0,
          generationError: null,
          previewUrl: null,
        }),
      
      updateGenerationStatus: (status, progress) =>
        set((state) => ({
          generationStatus: status,
          generationProgress: progress ?? state.generationProgress,
        })),
      
      setGenerationResult: (url) =>
        set({
          generationStatus: 'completed',
          generationProgress: 100,
          previewUrl: url,
        }),
      
      setGenerationError: (error) =>
        set({
          generationStatus: 'failed',
          generationError: error,
        }),
      
      clearGeneration: () =>
        set({
          generationId: null,
          generationStatus: null,
          generationProgress: 0,
          generationError: null,
          previewUrl: null,
        }),
      
      // History actions
      saveToHistory: (record) =>
        set((state) => ({
          user: {
            ...state.user,
            generations: [
              record,
              ...state.user.generations,
            ].slice(0, MAX_HISTORY_ITEMS),
          },
        })),
      
      deleteFromHistory: (id) =>
        set((state) => ({
          user: {
            ...state.user,
            generations: state.user.generations.filter((g) => g.id !== id),
          },
        })),
      
      clearHistory: () =>
        set((state) => ({
          user: { ...state.user, generations: [] },
        })),
      
      // User actions
      setPremium: (hasPremium) =>
        set((state) => ({
          user: {
            ...state.user,
            hasPremium,
            purchaseDate: hasPremium ? new Date().toISOString() : undefined,
          },
        })),
      
      incrementDailyUsage: () =>
        set((state) => ({
          user: {
            ...state.user,
            generationsToday: state.user.generationsToday + 1,
            lastGenerationDate: new Date().toISOString(),
          },
        })),
      
      resetDailyUsage: () =>
        set((state) => ({
          user: { ...state.user, generationsToday: 0 },
        })),
      
      // Computed
      canGenerate: () => {
        const { user } = get();
        if (user.hasPremium) return true;
        return user.generationsToday < FREE_DAILY_LIMIT;
      },
      
      remainingGenerations: () => {
        const { user } = get();
        if (user.hasPremium) return Infinity;
        return Math.max(0, FREE_DAILY_LIMIT - user.generationsToday);
      },
    }),
    {
      name: 'avatar-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user state
    }
  )
);
```

---

## 7. API Layer

### 7.1 Replicate Service

```typescript
// lib/replicate.ts
import { Style } from '@/schemas/enums';
import { BuilderSource } from '@/schemas/avatar';
import { GenerationRequest } from '@/schemas/api';

const STYLE_PROMPTS: Record<Style, { positive: string; negative: string }> = {
  'anime': {
    positive: 'anime style portrait, cel shaded, vibrant colors, detailed eyes, studio ghibli quality, high quality anime art',
    negative: 'realistic, photograph, 3d render, western cartoon',
  },
  'pixar': {
    positive: '3d pixar style character portrait, soft subsurface scattering, disney quality, smooth skin, big expressive eyes, studio lighting',
    negative: 'anime, 2d, flat, realistic photograph',
  },
  '3d-render': {
    positive: 'octane render portrait, 3d character, volumetric lighting, subsurface scattering, highly detailed, artstation quality',
    negative: 'anime, 2d, cartoon, photograph',
  },
  'pixel-art': {
    positive: '16-bit pixel art portrait, retro game character, clean pixels, limited color palette, nostalgic',
    negative: 'realistic, smooth, high resolution, photograph',
  },
  'watercolor': {
    positive: 'watercolor portrait painting, soft edges, artistic brushstrokes, delicate colors, fine art quality',
    negative: 'digital, sharp edges, photograph, anime',
  },
  'comic': {
    positive: 'marvel comic book style portrait, bold ink lines, dramatic shading, dynamic coloring, superhero art style',
    negative: 'realistic, photograph, anime, soft',
  },
  'cyberpunk': {
    positive: 'cyberpunk portrait, neon lighting, futuristic, chrome accents, blade runner aesthetic, high tech',
    negative: 'medieval, fantasy, natural, soft lighting',
  },
  'fantasy': {
    positive: 'fantasy art portrait, magical lighting, ethereal glow, detailed, artstation, epic fantasy illustration',
    negative: 'modern, urban, realistic photograph, mundane',
  },
};

export function buildPromptFromBuilder(source: BuilderSource): string {
  const descriptors: string[] = [
    'portrait',
    source.gender,
    source.ageRange.replace('-', ' '),
    `${source.faceShape} face shape`,
    `${source.skinTone} skin tone`,
    `${source.hairStyle} ${source.hairColor} hair`,
    `${source.eyeColor} ${source.eyeShape} eyes`,
  ];
  
  if (source.facialHair !== 'none') {
    descriptors.push(source.facialHair.replace('-', ' '));
  }
  
  if (source.accessories.length > 0) {
    descriptors.push(`wearing ${source.accessories.join(', ')}`);
  }
  
  descriptors.push(`${source.expression} expression`);
  
  return descriptors.join(', ');
}

export function buildGenerationRequest(
  source: BuilderSource | { type: 'photo' },
  style: Style,
  aspectRatio: string,
  sourceImageBase64?: string
): GenerationRequest {
  const styleConfig = STYLE_PROMPTS[style];
  
  let basePrompt: string;
  if (source.type === 'photo') {
    basePrompt = 'portrait transformation';
  } else {
    basePrompt = buildPromptFromBuilder(source);
  }
  
  return {
    prompt: `${basePrompt}, ${styleConfig.positive}`,
    negativePrompt: `${styleConfig.negative}, deformed, ugly, bad anatomy, blurry, low quality`,
    style,
    aspectRatio: aspectRatio as any,
    sourceImageBase64,
  };
}
```

### 7.2 API Client

```typescript
// lib/api.ts
import { GenerationRequest, GenerationResponse } from '@/schemas/api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || 'Request failed',
      response.status,
      error.code
    );
  }
  
  return response.json();
}

export const api = {
  // Start generation
  generate: (data: GenerationRequest): Promise<GenerationResponse> =>
    request('/api/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Poll status
  getStatus: (id: string): Promise<GenerationResponse> =>
    request(`/api/generate/${id}`),
  
  // Cancel generation
  cancel: (id: string): Promise<void> =>
    request(`/api/generate/${id}/cancel`, { method: 'POST' }),
};
```

### 7.3 Server Endpoints (Expo API Routes)

```typescript
// app/api/generate+api.ts
import Replicate from 'replicate';
import { GenerationRequestSchema } from '@/schemas/api';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const ASPECT_RATIO_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '3:4': { width: 768, height: 1024 },
  '4:3': { width: 1024, height: 768 },
  '9:16': { width: 576, height: 1024 },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = GenerationRequestSchema.parse(body);
    
    const dimensions = ASPECT_RATIO_DIMENSIONS[data.aspectRatio];
    
    const prediction = await replicate.predictions.create({
      model: 'stability-ai/sdxl',
      input: {
        prompt: data.prompt,
        negative_prompt: data.negativePrompt,
        width: dimensions.width,
        height: dimensions.height,
        num_outputs: 1,
        scheduler: 'K_EULER',
        num_inference_steps: 30,
        guidance_scale: 7.5,
        seed: data.seed,
        ...(data.sourceImageBase64 && {
          image: `data:image/png;base64,${data.sourceImageBase64}`,
          prompt_strength: 0.8,
        }),
      },
    });
    
    return Response.json({
      id: prediction.id,
      status: 'queued',
    });
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/generate/[id]+api.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prediction = await replicate.predictions.get(params.id);
    
    const statusMap: Record<string, string> = {
      starting: 'queued',
      processing: 'processing',
      succeeded: 'completed',
      failed: 'failed',
      canceled: 'cancelled',
    };
    
    return Response.json({
      id: prediction.id,
      status: statusMap[prediction.status] || 'processing',
      progress: prediction.status === 'succeeded' ? 100 : undefined,
      imageUrl: prediction.output?.[0],
      error: prediction.error,
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
```

---

## 8. Export System

### 8.1 Export Configuration

```typescript
// lib/export.ts
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';

export const EXPORT_TIERS = {
  free: {
    maxResolution: 512,
    format: 'jpeg' as const,
    quality: 0.7,
    watermark: true,
  },
  premium: {
    maxResolution: 2048,
    format: 'png' as const,
    quality: 1.0,
    watermark: false,
  },
} as const;

export type ExportTier = keyof typeof EXPORT_TIERS;

interface ExportOptions {
  imageUrl: string;
  tier: ExportTier;
  filename?: string;
}

interface ExportResult {
  localUri: string;
  savedToGallery: boolean;
}

export async function exportAvatar(options: ExportOptions): Promise<ExportResult> {
  const { imageUrl, tier, filename } = options;
  const config = EXPORT_TIERS[tier];
  
  // Download image
  const downloadPath = `${FileSystem.cacheDirectory}avatar_temp.png`;
  await FileSystem.downloadAsync(imageUrl, downloadPath);
  
  // Process image
  const actions: ImageManipulator.Action[] = [
    { resize: { width: config.maxResolution } },
  ];
  
  const result = await ImageManipulator.manipulateAsync(
    downloadPath,
    actions,
    {
      format: config.format === 'png'
        ? ImageManipulator.SaveFormat.PNG
        : ImageManipulator.SaveFormat.JPEG,
      compress: config.quality,
    }
  );
  
  // Apply watermark if free tier
  let finalUri = result.uri;
  if (config.watermark) {
    finalUri = await applyWatermark(result.uri);
  }
  
  // Save to gallery
  const { status } = await MediaLibrary.requestPermissionsAsync();
  let savedToGallery = false;
  
  if (status === 'granted') {
    const asset = await MediaLibrary.createAssetAsync(finalUri);
    savedToGallery = !!asset;
  }
  
  // Move to permanent storage
  const permanentPath = `${FileSystem.documentDirectory}avatars/${filename || Date.now()}.${config.format}`;
  await FileSystem.makeDirectoryAsync(
    `${FileSystem.documentDirectory}avatars`,
    { intermediates: true }
  );
  await FileSystem.moveAsync({ from: finalUri, to: permanentPath });
  
  return {
    localUri: permanentPath,
    savedToGallery,
  };
}

async function applyWatermark(imageUri: string): Promise<string> {
  // Implementation using expo-image-manipulator or canvas
  // Add "Made with Avatarmon" watermark
  // Return processed image URI
  return imageUri; // Placeholder
}
```

---

## 9. UI Components

### 9.1 BNA UI Setup

```bash
# Initialize BNA UI
npx bna-ui init

# Add required components
npx bna-ui add button
npx bna-ui add card
npx bna-ui add input
npx bna-ui add checkbox
npx bna-ui add skeleton
npx bna-ui add image
npx bna-ui add badge
npx bna-ui add separator
npx bna-ui add sheet
npx bna-ui add progress
npx bna-ui add toast
npx bna-ui add avatar
```

### 9.2 Custom Components Required

| Component            | Purpose                                  |
|----------------------|------------------------------------------|
| `StyleCard`          | Selectable style option with preview     |
| `StyleGrid`          | Grid layout for style selection          |
| `AttributeSelect`    | Dropdown for enum attributes             |
| `ColorPicker`        | Skin tone / hair color selection         |
| `AccessoryPicker`    | Multi-select for accessories (max 3)     |
| `PhotoUploader`      | Image picker with preview and validation |
| `GenerationProgress` | Status display during generation         |
| `ExportSheet`        | Bottom sheet with export options         |
| `PaywallModal`       | Premium upgrade prompt                   |
| `HistoryItem`        | Saved generation card                    |

### 9.3 Screen Layouts

#### Creator Screen Structure

```
ScrollView (vertical)
├── Card: Source Selector
│   └── SegmentedControl [Photo | Builder]
│
├── [If Photo]
│   └── Card: Photo Upload
│       ├── PhotoUploader
│       └── Text: Requirements (min 256px, jpg/png/webp)
│
├── Card: Style Selection
│   └── StyleGrid (2 columns)
│       └── StyleCard × 8
│
├── [If Builder]
│   ├── Card: Face
│   │   ├── AttributeSelect: Gender
│   │   ├── AttributeSelect: Age Range
│   │   ├── AttributeSelect: Face Shape
│   │   └── ColorPicker: Skin Tone
│   │
│   ├── Card: Hair
│   │   ├── AttributeSelect: Style
│   │   └── ColorPicker: Color
│   │
│   ├── Card: Eyes
│   │   ├── ColorPicker: Color
│   │   └── AttributeSelect: Shape
│   │
│   ├── Card: Details
│   │   ├── AttributeSelect: Facial Hair
│   │   ├── AccessoryPicker: Accessories (max 3)
│   │   └── AttributeSelect: Expression
│   │
│   └── Card: Background
│       ├── AttributeSelect: Type
│       └── ColorPicker: Colors (if applicable)
│
├── Card: Output Settings
│   └── SegmentedControl: Aspect Ratio [1:1 | 3:4 | 4:3 | 9:16]
│
└── Button: Generate Avatar (full width, success variant)
```

---

## 10. File Structure

```
avatarmon/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home
│   │   ├── create.tsx             # Creator
│   │   ├── history.tsx            # History
│   │   └── settings.tsx           # Settings
│   ├── preview.tsx                # Modal: Preview
│   ├── paywall.tsx                # Modal: Paywall
│   ├── api/
│   │   ├── generate+api.ts
│   │   └── generate/
│   │       └── [id]+api.ts
│   └── _layout.tsx
│
├── components/
│   ├── ui/                        # BNA UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── avatar/
│   │   ├── StyleCard.tsx
│   │   ├── StyleGrid.tsx
│   │   ├── AttributeSelect.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── AccessoryPicker.tsx
│   │   ├── PhotoUploader.tsx
│   │   ├── GenerationProgress.tsx
│   │   └── HistoryItem.tsx
│   └── sheets/
│       ├── ExportSheet.tsx
│       └── PaywallSheet.tsx
│
├── hooks/
│   ├── useGeneration.ts           # Generation lifecycle
│   ├── useExport.ts               # Export logic
│   ├── usePurchase.ts             # RevenueCat wrapper
│   └── useFormValidation.ts       # Zod + RHF integration
│
├── lib/
│   ├── api.ts                     # API client
│   ├── replicate.ts               # Prompt building
│   ├── export.ts                  # Export utilities
│   └── storage.ts                 # AsyncStorage helpers
│
├── schemas/
│   ├── enums.ts                   # All enum definitions
│   ├── avatar.ts                  # Form schemas
│   ├── api.ts                     # API schemas
│   └── user.ts                    # User state schema
│
├── store/
│   └── avatar-store.ts            # Zustand store
│
├── theme/
│   ├── colors.ts                  # BNA UI theme
│   └── index.ts
│
├── constants/
│   ├── styles.ts                  # Style metadata (names, icons, previews)
│   └── limits.ts                  # Free tier limits, pricing
│
└── assets/
    ├── images/
    │   └── style-previews/        # Preview images for each style
    └── fonts/
```

---

## 11. Monetization

### 11.1 Pricing

| Tier    | Price            | Features                                           |
|---------|------------------|----------------------------------------------------|
| Free    | $0               | 5 generations/day, 512px export, watermarked       |
| Premium | $4.99 (one-time) | Unlimited generations, 2048px export, no watermark |

### 11.2 RevenueCat Configuration

```typescript
// lib/purchase.ts
import Purchases, { PurchasesPackage } from 'react-native-purchases';

const REVENUE_CAT_API_KEY = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS!,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID!,
};

export const ENTITLEMENTS = {
  premium: 'premium',
} as const;

export const PRODUCTS = {
  premiumUnlock: 'avatar_premium_unlock',
} as const;

export async function initializePurchases() {
  await Purchases.configure({
    apiKey: Platform.OS === 'ios'
      ? REVENUE_CAT_API_KEY.ios
      : REVENUE_CAT_API_KEY.android,
  });
}

export async function checkPremiumStatus(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;
}

export async function purchasePremium(): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const package_ = offerings.current?.availablePackages.find(
    (p) => p.product.identifier === PRODUCTS.premiumUnlock
  );
  
  if (!package_) throw new Error('Product not found');
  
  const { customerInfo } = await Purchases.purchasePackage(package_);
  return customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;
}

export async function restorePurchases(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;
}
```

---

## 12. Error Handling

### 12.1 Error Types

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  // Network
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  API_ERROR: 'API_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Validation
  INVALID_IMAGE: 'INVALID_IMAGE',
  IMAGE_TOO_SMALL: 'IMAGE_TOO_SMALL',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Generation
  GENERATION_FAILED: 'GENERATION_FAILED',
  GENERATION_TIMEOUT: 'GENERATION_TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',
  
  // Purchase
  PURCHASE_FAILED: 'PURCHASE_FAILED',
  PURCHASE_CANCELLED: 'PURCHASE_CANCELLED',
  RESTORE_FAILED: 'RESTORE_FAILED',
  
  // Export
  EXPORT_FAILED: 'EXPORT_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.NETWORK_OFFLINE]: 'No internet connection. Please check your network.',
  [ErrorCodes.INVALID_IMAGE]: 'Please select a valid image file.',
  [ErrorCodes.IMAGE_TOO_SMALL]: 'Image must be at least 256×256 pixels.',
  [ErrorCodes.DAILY_LIMIT_REACHED]: 'You\'ve reached your daily limit. Upgrade to Premium for unlimited generations.',
  [ErrorCodes.GENERATION_FAILED]: 'Failed to generate avatar. Please try again.',
  [ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
  // ... etc
};
```

---

## 13. Testing Strategy

### 13.1 Unit Tests

| Area           | Coverage                         |
|----------------|----------------------------------|
| Zod Schemas    | Validation edge cases            |
| Prompt Builder | All style/attribute combinations |
| Store Actions  | State mutations                  |
| Export Logic   | Resolution/watermark logic       |

### 13.2 Integration Tests

| Flow                    | Assertions                                 |
|-------------------------|--------------------------------------------|
| Photo Upload → Generate | Image validation, API call, result display |
| Builder Form → Generate | Form validation, prompt construction       |
| Generate → Export       | Status polling, export tiers               |
| Purchase Flow           | RevenueCat integration, entitlement check  |

### 13.3 E2E Tests (Maestro)

```yaml
# .maestro/generate-avatar.yaml
appId: com.example.avatarcreator
---
- launchApp
- tapOn: "Create"
- tapOn: "Builder"
- tapOn: "Anime"
- scrollUntilVisible:
    element: "Generate Avatar"
- tapOn: "Generate Avatar"
- assertVisible: "Generating..."
- waitForAnimationEnd
- assertVisible: "Export"
```

---

## 14. Launch Checklist

### 14.1 Pre-Launch

- [ ] App Store assets (screenshots, preview video)
- [ ] Privacy policy and terms of service
- [ ] RevenueCat products configured
- [ ] Replicate API limits verified
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (Posthog/Amplitude) configured
- [ ] Deep linking configured
- [ ] Push notifications (optional)

### 14.2 App Store Requirements

| Platform | Requirement                                    |
|----------|------------------------------------------------|
| iOS      | App Review guidelines compliance, age rating   |
| Android  | Content rating questionnaire, data safety form |

---

## Appendix A: Style Metadata

```typescript
// constants/styles.ts
import { Style } from '@/schemas/enums';

export interface StyleMetadata {
  id: Style;
  name: string;
  description: string;
  previewImage: string;
  icon: string;
}

export const STYLES: StyleMetadata[] = [
  {
    id: 'anime',
    name: 'Anime',
    description: 'Japanese animation style with vibrant colors',
    previewImage: require('@/assets/images/style-previews/anime.png'),
    icon: '🎌',
  },
  {
    id: 'pixar',
    name: 'Pixar',
    description: '3D animated movie character style',
    previewImage: require('@/assets/images/style-previews/pixar.png'),
    icon: '🎬',
  },
  {
    id: '3d-render',
    name: '3D Render',
    description: 'Photorealistic 3D character render',
    previewImage: require('@/assets/images/style-previews/3d-render.png'),
    icon: '🖥️',
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    description: 'Retro 16-bit game character',
    previewImage: require('@/assets/images/style-previews/pixel-art.png'),
    icon: '👾',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft artistic painting style',
    previewImage: require('@/assets/images/style-previews/watercolor.png'),
    icon: '🎨',
  },
  {
    id: 'comic',
    name: 'Comic',
    description: 'Bold comic book illustration',
    previewImage: require('@/assets/images/style-previews/comic.png'),
    icon: '💥',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic neon-lit aesthetic',
    previewImage: require('@/assets/images/style-previews/cyberpunk.png'),
    icon: '🌆',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Magical ethereal portrait',
    previewImage: require('@/assets/images/style-previews/fantasy.png'),
    icon: '✨',
  },
];
```

---

*End of specification.*