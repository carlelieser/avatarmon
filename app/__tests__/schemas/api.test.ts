import {
  GenerationRequestSchema,
  GenerationStatusEnum,
  GenerationResponseSchema,
  GenerationRecordSchema,
} from '@/schemas/api';

describe('GenerationRequestSchema', () => {
  it('should validate request with required fields', () => {
    const result = GenerationRequestSchema.safeParse({
      prompt: 'portrait of a young adult with short brown hair',
      style: 'anime',
      aspectRatio: '1:1',
    });
    expect(result.success).toBe(true);
  });

  it('should reject prompt shorter than 10 characters', () => {
    const result = GenerationRequestSchema.safeParse({
      prompt: 'short',
      style: 'anime',
      aspectRatio: '1:1',
    });
    expect(result.success).toBe(false);
  });

  it('should reject prompt longer than 1000 characters', () => {
    const longPrompt = 'a'.repeat(1001);
    const result = GenerationRequestSchema.safeParse({
      prompt: longPrompt,
      style: 'anime',
      aspectRatio: '1:1',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional negative prompt', () => {
    const result = GenerationRequestSchema.safeParse({
      prompt: 'portrait of a young adult',
      negativePrompt: 'blurry, low quality',
      style: 'anime',
      aspectRatio: '1:1',
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative prompt longer than 500 characters', () => {
    const longNegative = 'a'.repeat(501);
    const result = GenerationRequestSchema.safeParse({
      prompt: 'portrait of a young adult',
      negativePrompt: longNegative,
      style: 'anime',
      aspectRatio: '1:1',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional seed', () => {
    const result = GenerationRequestSchema.safeParse({
      prompt: 'portrait of a young adult',
      style: 'anime',
      aspectRatio: '1:1',
      seed: 12345,
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative seed', () => {
    const result = GenerationRequestSchema.safeParse({
      prompt: 'portrait of a young adult',
      style: 'anime',
      aspectRatio: '1:1',
      seed: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional sourceImageBase64', () => {
    const result = GenerationRequestSchema.safeParse({
      prompt: 'portrait transformation',
      style: 'pixar',
      aspectRatio: '3:4',
      sourceImageBase64: 'base64encodedimage',
    });
    expect(result.success).toBe(true);
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
    ];
    styles.forEach((style) => {
      const result = GenerationRequestSchema.safeParse({
        prompt: 'portrait of a person',
        style,
        aspectRatio: '1:1',
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('GenerationStatusEnum', () => {
  const validStatuses = ['queued', 'processing', 'completed', 'failed', 'cancelled'];

  it.each(validStatuses)('should validate "%s" as a valid status', (status) => {
    expect(GenerationStatusEnum.safeParse(status).success).toBe(true);
  });

  it('should reject invalid status', () => {
    expect(GenerationStatusEnum.safeParse('pending').success).toBe(false);
    expect(GenerationStatusEnum.safeParse('running').success).toBe(false);
  });
});

describe('GenerationResponseSchema', () => {
  it('should validate queued response', () => {
    const result = GenerationResponseSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'queued',
    });
    expect(result.success).toBe(true);
  });

  it('should validate processing response with progress', () => {
    const result = GenerationResponseSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'processing',
      progress: 50,
    });
    expect(result.success).toBe(true);
  });

  it('should validate completed response with imageUrl', () => {
    const result = GenerationResponseSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'completed',
      progress: 100,
      imageUrl: 'https://example.com/image.png',
    });
    expect(result.success).toBe(true);
  });

  it('should validate failed response with error', () => {
    const result = GenerationResponseSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'failed',
      error: 'Generation failed due to content policy',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = GenerationResponseSchema.safeParse({
      id: 'not-a-uuid',
      status: 'queued',
    });
    expect(result.success).toBe(false);
  });

  it('should reject progress outside 0-100 range', () => {
    const negative = GenerationResponseSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'processing',
      progress: -10,
    });
    expect(negative.success).toBe(false);

    const over100 = GenerationResponseSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'processing',
      progress: 150,
    });
    expect(over100.success).toBe(false);
  });

  it('should reject invalid imageUrl', () => {
    const result = GenerationResponseSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'completed',
      imageUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('GenerationRecordSchema', () => {
  const validRecord = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    imageUrl: 'https://example.com/image.png',
    thumbnailUrl: 'https://example.com/thumb.png',
    prompt: 'portrait of a young adult',
    style: 'anime',
    aspectRatio: '1:1',
    createdAt: '2025-01-03T10:00:00.000Z',
    isPremiumExport: false,
  };

  it('should validate complete generation record', () => {
    const result = GenerationRecordSchema.safeParse(validRecord);
    expect(result.success).toBe(true);
  });

  it('should accept optional localUri', () => {
    const result = GenerationRecordSchema.safeParse({
      ...validRecord,
      localUri: 'file:///local/path/image.png',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional exportedAt', () => {
    const result = GenerationRecordSchema.safeParse({
      ...validRecord,
      exportedAt: '2025-01-03T11:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should default isPremiumExport to false', () => {
    const { isPremiumExport, ...withoutPremium } = validRecord;
    const result = GenerationRecordSchema.parse(withoutPremium);
    expect(result.isPremiumExport).toBe(false);
  });

  it('should reject invalid datetime format', () => {
    const result = GenerationRecordSchema.safeParse({
      ...validRecord,
      createdAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid URLs', () => {
    const badImageUrl = GenerationRecordSchema.safeParse({
      ...validRecord,
      imageUrl: 'not-a-url',
    });
    expect(badImageUrl.success).toBe(false);

    const badThumbUrl = GenerationRecordSchema.safeParse({
      ...validRecord,
      thumbnailUrl: 'not-a-url',
    });
    expect(badThumbUrl.success).toBe(false);
  });
});
