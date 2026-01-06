export enum Style {
  Anime = 'anime',
  Pixar = 'pixar',
  ThreeDimensionalRender = '3d-render',
  PixelArt = 'pixel-art',
  Watercolor = 'watercolor',
  Comic = 'comic',
  Cyberpunk = 'cyberpunk',
  Fantasy = 'fantasy',
}

export type PredictionStatus =
  | 'starting'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

export type WizardStep = 'upload' | 'style' | 'generating' | 'results';

export interface WizardState {
  step: WizardStep;
  photos: string[];
  selectedStyle: Style | null;
  modifications: string[];
  predictionId: string | null;
  predictionStatus: PredictionStatus | null;
  generatedImageUrl: string | null;
  error: string | null;
}

export type WizardAction =
  | { type: 'ADD_PHOTO'; payload: string }
  | { type: 'REMOVE_PHOTO'; payload: number }
  | { type: 'SELECT_STYLE'; payload: Style }
  | { type: 'ADD_MODIFICATION'; payload: string }
  | { type: 'REMOVE_MODIFICATION'; payload: number }
  | { type: 'START_GENERATION'; payload: string }
  | { type: 'UPDATE_STATUS'; payload: PredictionStatus }
  | { type: 'GENERATION_COMPLETE'; payload: string }
  | { type: 'GENERATION_FAILED'; payload: string }
  | { type: 'CANCEL_GENERATION' }
  | { type: 'RESET' }
  | { type: 'GO_TO_STEP'; payload: WizardStep };

export interface GenerationInput {
  style: Style;
  references: string[];
  modifications: string[];
}

export interface PredictionResponse {
  id: string;
  status: PredictionStatus;
  output?: string | string[];
  error?: string;
}

export interface StyleMetadata {
  id: Style;
  displayName: string;
  description: string;
  previewColor: string;
  icon: string;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  isPremium: boolean;
  generationsRemaining: number | null;
  expirationDate: Date | null;
}

export const initialWizardState: WizardState = {
  step: 'upload',
  photos: [],
  selectedStyle: null,
  modifications: [],
  predictionId: null,
  predictionStatus: null,
  generatedImageUrl: null,
  error: null,
};

export function wizardReducer(
  state: WizardState,
  action: WizardAction
): WizardState {
  switch (action.type) {
    case 'ADD_PHOTO':
      if (state.photos.length >= 3) return state;
      return { ...state, photos: [...state.photos, action.payload], error: null };

    case 'REMOVE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter((_, index) => index !== action.payload),
      };

    case 'SELECT_STYLE':
      return { ...state, selectedStyle: action.payload };

    case 'ADD_MODIFICATION':
      return {
        ...state,
        modifications: [...state.modifications, action.payload],
      };

    case 'REMOVE_MODIFICATION':
      return {
        ...state,
        modifications: state.modifications.filter(
          (_, index) => index !== action.payload
        ),
      };

    case 'START_GENERATION':
      return {
        ...state,
        step: 'generating',
        predictionId: action.payload,
        predictionStatus: 'starting',
        error: null,
      };

    case 'UPDATE_STATUS':
      return { ...state, predictionStatus: action.payload };

    case 'GENERATION_COMPLETE':
      return {
        ...state,
        step: 'results',
        predictionStatus: 'succeeded',
        generatedImageUrl: action.payload,
      };

    case 'GENERATION_FAILED':
      return {
        ...state,
        step: 'style',
        predictionStatus: 'failed',
        error: action.payload,
        predictionId: null,
      };

    case 'CANCEL_GENERATION':
      return {
        ...state,
        step: 'style',
        predictionStatus: 'canceled',
        predictionId: null,
      };

    case 'RESET':
      return initialWizardState;

    case 'GO_TO_STEP':
      return { ...state, step: action.payload, error: null };

    default:
      return state;
  }
}
