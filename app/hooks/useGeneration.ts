import { useCallback, useRef } from 'react';
import { useAvatarStore } from '@/store/avatar-store';
import { api } from '@/lib/api';
import { buildGenerationRequest } from '@/lib/replicate';
import { AppError, ErrorCodes, ErrorMessages } from '@/lib/errors';
import { AvatarFormSchema } from '@/schemas/avatar';
import type { GenerationStatus } from '@/schemas/api';

const POLL_INTERVAL = 2000;
const GENERATION_TIMEOUT = 5 * 60 * 1000;

interface UseGenerationResult {
  generate: () => Promise<void>;
  cancel: () => Promise<void>;
  retry: () => Promise<void>;
  isGenerating: boolean;
  progress: number;
  status: GenerationStatus | null;
  previewUrl: string | null;
  error: string | null;
}

export function useGeneration(): UseGenerationResult {
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentForm = useAvatarStore((state) => state.currentForm);
  const generationId = useAvatarStore((state) => state.generationId);
  const generationStatus = useAvatarStore((state) => state.generationStatus);
  const generationProgress = useAvatarStore((state) => state.generationProgress);
  const generationError = useAvatarStore((state) => state.generationError);
  const previewUrl = useAvatarStore((state) => state.previewUrl);
  const startGeneration = useAvatarStore((state) => state.startGeneration);
  const updateGenerationStatus = useAvatarStore((state) => state.updateGenerationStatus);
  const setGenerationResult = useAvatarStore((state) => state.setGenerationResult);
  const setGenerationError = useAvatarStore((state) => state.setGenerationError);
  const clearGeneration = useAvatarStore((state) => state.clearGeneration);
  const canGenerate = useAvatarStore((state) => state.canGenerate);
  const incrementDailyUsage = useAvatarStore((state) => state.incrementDailyUsage);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    (id: string, resolve: () => void, reject: (error: Error) => void) => {
      console.log('[Poll] Starting polling for:', id);
      pollingRef.current = setInterval(async () => {
        try {
          console.log('[Poll] Checking status...');
          const response = await api.getStatus(id);
          console.log('[Poll] Status response:', response);

          updateGenerationStatus(response.status, response.progress);

          if (response.status === 'completed') {
            stopPolling();
            if (response.imageUrl) {
              setGenerationResult(response.imageUrl);
              incrementDailyUsage();
            }
            resolve();
          } else if (response.status === 'failed' || response.status === 'cancelled') {
            stopPolling();
            const errorMessage = response.error || ErrorMessages[ErrorCodes.GENERATION_FAILED];
            setGenerationError(errorMessage);
            reject(
              new AppError(
                'Generation failed',
                ErrorCodes.GENERATION_FAILED,
                errorMessage
              )
            );
          }
        } catch (error) {
          console.error('[Poll] Error:', error);
          stopPolling();
          const errorMessage = ErrorMessages[ErrorCodes.API_ERROR];
          setGenerationError(errorMessage);
          reject(
            new AppError('API error', ErrorCodes.API_ERROR, errorMessage)
          );
        }
      }, POLL_INTERVAL);
    },
    [
      updateGenerationStatus,
      setGenerationResult,
      setGenerationError,
      incrementDailyUsage,
      stopPolling,
    ]
  );

  const generate = useCallback(async (): Promise<void> => {
    console.log('[Generate] Starting generation...');
    console.log('[Generate] canGenerate:', canGenerate());

    if (!canGenerate()) {
      console.log('[Generate] Daily limit reached');
      throw new AppError(
        'Daily limit reached',
        ErrorCodes.DAILY_LIMIT_REACHED,
        ErrorMessages[ErrorCodes.DAILY_LIMIT_REACHED]
      );
    }

    console.log('[Generate] Current form:', JSON.stringify(currentForm).slice(0, 500));
    const parseResult = AvatarFormSchema.safeParse(currentForm);
    console.log('[Generate] Form validation:', parseResult.success, parseResult.error?.issues);

    if (!parseResult.success) {
      console.log('[Generate] Form validation failed');
      throw new AppError(
        'Invalid form',
        ErrorCodes.INVALID_IMAGE,
        'Please complete all required fields'
      );
    }

    const form = parseResult.data;
    console.log('[Generate] Form validated, building request...');

    try {
      console.log('[Generate] Building generation request...');
      const request = buildGenerationRequest(
        form.source,
        form.style,
        form.aspectRatio
      );
      console.log('[Generate] Request built, calling API...');

      const response = await api.generate(request);
      console.log('[Generate] API response:', response);
      console.log('[Generate] Response ID:', response.id);
      console.log('[Generate] Calling startGeneration...');
      startGeneration(response.id);
      console.log('[Generate] startGeneration completed, setting up polling...');

      return new Promise<void>((resolve, reject) => {
        timeoutRef.current = setTimeout(() => {
          stopPolling();
          const errorMessage = ErrorMessages[ErrorCodes.GENERATION_TIMEOUT];
          setGenerationError(errorMessage);
          reject(
            new AppError(
              'Generation timeout',
              ErrorCodes.GENERATION_TIMEOUT,
              errorMessage
            )
          );
        }, GENERATION_TIMEOUT);

        pollStatus(response.id, resolve, reject);
      });
    } catch (error) {
      console.error('[Generate] Caught error:', error);
      if (error instanceof AppError) {
        throw error;
      }

      const errorMessage = ErrorMessages[ErrorCodes.API_ERROR];
      setGenerationError(errorMessage);
      throw new AppError('API error', ErrorCodes.API_ERROR, errorMessage);
    }
  }, [
    currentForm,
    canGenerate,
    startGeneration,
    setGenerationError,
    pollStatus,
    stopPolling,
  ]);

  const cancel = useCallback(async (): Promise<void> => {
    const currentGenerationId = useAvatarStore.getState().generationId;
    if (!currentGenerationId) {
      return;
    }

    stopPolling();

    try {
      await api.cancel(currentGenerationId);
    } finally {
      clearGeneration();
    }
  }, [stopPolling, clearGeneration]);

  const retry = useCallback(async (): Promise<void> => {
    clearGeneration();
    return generate();
  }, [clearGeneration, generate]);

  const isGenerating =
    generationId !== null &&
    generationStatus !== null &&
    generationStatus !== 'completed' &&
    generationStatus !== 'failed' &&
    generationStatus !== 'cancelled';

  return {
    generate,
    cancel,
    retry,
    isGenerating,
    progress: generationProgress,
    status: generationStatus,
    previewUrl,
    error: generationError,
  };
}
