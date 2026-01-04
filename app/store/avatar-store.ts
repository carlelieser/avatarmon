import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AvatarForm,
  AvatarSource,
  BackgroundConfig,
} from '@/schemas/avatar';
import type { GenerationRecord, GenerationStatus } from '@/schemas/api';
import type { UserState } from '@/schemas/user';
import { FREE_DAILY_LIMIT, MAX_HISTORY_ITEMS } from '@/schemas/user';
import type { Style, AspectRatio } from '@/schemas/enums';

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

      resetForm: () => set({ currentForm: {} }),

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
            generations: [record, ...state.user.generations].slice(
              0,
              MAX_HISTORY_ITEMS
            ),
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
      partialize: (state) => ({ user: state.user }),
    }
  )
);
