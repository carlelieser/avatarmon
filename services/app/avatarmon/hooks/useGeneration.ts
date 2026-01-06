import { useState, useCallback, useRef } from 'react';
import { api, ApiError } from '@/lib/api';
import {
  GenerationInput,
  PredictionStatus,
} from '@/types/avatar';

export interface UseGenerationReturn {
  generate: (input: GenerationInput) => Promise<string | null>;
  cancel: () => Promise<void>;
  status: PredictionStatus | null;
  imageUrl: string | null;
  error: string | null;
  isGenerating: boolean;
  reset: () => void;
}

export function useGeneration(): UseGenerationReturn {
  const [status, setStatus] = useState<PredictionStatus | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const predictionIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (input: GenerationInput): Promise<string | null> => {
      try {
        setIsGenerating(true);
        setStatus('starting');
        setError(null);
        setImageUrl(null);

        abortControllerRef.current = new AbortController();

        const prediction = await api.generate(input);
        predictionIdRef.current = prediction.id;

        const resultUrl = await api.pollForCompletion(prediction.id, {
          onStatusChange: setStatus,
          signal: abortControllerRef.current.signal,
        });

        setImageUrl(resultUrl);
        setStatus('succeeded');
        return resultUrl;
      } catch (err) {
        if (err instanceof ApiError && err.message === 'Polling aborted') {
          setStatus('canceled');
          return null;
        }

        const message =
          err instanceof Error ? err.message : 'Generation failed';
        setError(message);
        setStatus('failed');
        return null;
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const cancel = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (predictionIdRef.current) {
      try {
        await api.cancel(predictionIdRef.current);
      } catch {
        // Ignore cancel errors
      }
    }

    setIsGenerating(false);
    setStatus('canceled');
    predictionIdRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setStatus(null);
    setImageUrl(null);
    setError(null);
    setIsGenerating(false);
    predictionIdRef.current = null;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    generate,
    cancel,
    status,
    imageUrl,
    error,
    isGenerating,
    reset,
  };
}
