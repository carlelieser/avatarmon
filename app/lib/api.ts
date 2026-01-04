import type { GenerationRequest, GenerationResponse } from '@/schemas/api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

console.log('[Client] API_BASE:', API_BASE);

export class ApiError extends Error {
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
  const url = `${API_BASE}${endpoint}`;
  console.log('[Client] Making request to:', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('[Client] Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.log('[Client] Error response:', error);
      throw new ApiError(
        error.message || 'Request failed',
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    console.error('[Client] Fetch error:', error);
    throw error;
  }
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
  cancel: async (id: string): Promise<void> => {
    await request(`/api/generate/${id}/cancel`, { method: 'POST' });
  },
};
