import {
  GenerationInput,
  PredictionResponse,
  PredictionStatus,
} from '@/types/avatar';
import { POLL_INTERVAL_MS, MAX_POLL_ATTEMPTS } from '@/constants/styles';

const API_BASE_URL = 'http://localhost:8082';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface PollOptions {
  onStatusChange?: (status: PredictionStatus) => void;
  signal?: AbortSignal;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed', response.status);
  }

  return data;
}

async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error'
    );
  }
}

export const api = {
  async generate(input: GenerationInput): Promise<PredictionResponse> {
    return fetchWithErrorHandling<PredictionResponse>(
      `${API_BASE_URL}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    );
  },

  async getStatus(id: string): Promise<PredictionResponse> {
    return fetchWithErrorHandling<PredictionResponse>(
      `${API_BASE_URL}/api/generate/${id}`
    );
  },

  async cancel(id: string): Promise<void> {
    await fetchWithErrorHandling<{ success: boolean }>(
      `${API_BASE_URL}/api/generate/${id}/cancel`,
      { method: 'POST' }
    );
  },

  async pollForCompletion(
    predictionId: string,
    options: PollOptions = {}
  ): Promise<string> {
    const { onStatusChange, signal } = options;
    let attempts = 0;

    const poll = async (): Promise<string> => {
      if (signal?.aborted) {
        throw new ApiError('Polling aborted');
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        throw new ApiError('Generation timed out');
      }

      const result = await this.getStatus(predictionId);

      onStatusChange?.(result.status);

      if (result.status === 'succeeded') {
        const output = result.output;
        if (Array.isArray(output)) {
          return output[0];
        }
        return output as string;
      }

      if (result.status === 'failed' || result.status === 'canceled') {
        throw new ApiError(result.error || 'Generation failed');
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      return poll();
    };

    return poll();
  },
};
