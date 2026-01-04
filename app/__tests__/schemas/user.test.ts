import {
  UserStateSchema,
  FREE_DAILY_LIMIT,
  MAX_HISTORY_ITEMS,
} from '@/schemas/user';

describe('UserStateSchema', () => {
  it('should provide default values for new user', () => {
    const result = UserStateSchema.parse({});
    expect(result.hasPremium).toBe(false);
    expect(result.generationsToday).toBe(0);
    expect(result.generations).toEqual([]);
    expect(result.onboardingComplete).toBe(false);
  });

  it('should validate premium user state', () => {
    const result = UserStateSchema.safeParse({
      hasPremium: true,
      purchaseDate: '2025-01-03T10:00:00.000Z',
      generationsToday: 10,
      generations: [],
    });
    expect(result.success).toBe(true);
  });

  it('should validate user with generation history', () => {
    const result = UserStateSchema.safeParse({
      hasPremium: false,
      generationsToday: 3,
      generations: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          imageUrl: 'https://example.com/image.png',
          thumbnailUrl: 'https://example.com/thumb.png',
          prompt: 'portrait',
          style: 'anime',
          aspectRatio: '1:1',
          createdAt: '2025-01-03T10:00:00.000Z',
          isPremiumExport: false,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional purchaseDate', () => {
    const result = UserStateSchema.safeParse({
      hasPremium: true,
      purchaseDate: '2025-01-03T10:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.purchaseDate).toBe('2025-01-03T10:00:00.000Z');
    }
  });

  it('should accept optional lastGenerationDate', () => {
    const result = UserStateSchema.safeParse({
      lastGenerationDate: '2025-01-03T10:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional preferredStyle', () => {
    const result = UserStateSchema.safeParse({
      preferredStyle: 'anime',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredStyle).toBe('anime');
    }
  });

  it('should default onboardingComplete to false', () => {
    const result = UserStateSchema.parse({});
    expect(result.onboardingComplete).toBe(false);
  });

  it('should accept onboardingComplete as true', () => {
    const result = UserStateSchema.safeParse({
      onboardingComplete: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.onboardingComplete).toBe(true);
    }
  });

  it('should reject negative generationsToday', () => {
    const result = UserStateSchema.safeParse({
      generationsToday: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid datetime formats', () => {
    const badPurchaseDate = UserStateSchema.safeParse({
      purchaseDate: 'not-a-date',
    });
    expect(badPurchaseDate.success).toBe(false);

    const badLastGenDate = UserStateSchema.safeParse({
      lastGenerationDate: 'invalid',
    });
    expect(badLastGenDate.success).toBe(false);
  });
});

describe('Constants', () => {
  it('should have FREE_DAILY_LIMIT set to 5', () => {
    expect(FREE_DAILY_LIMIT).toBe(5);
  });

  it('should have MAX_HISTORY_ITEMS set to 50', () => {
    expect(MAX_HISTORY_ITEMS).toBe(50);
  });
});
