import { Style, StyleMetadata } from '@/types/avatar';

export const STYLES: StyleMetadata[] = [
  {
    id: Style.Anime,
    displayName: 'Anime',
    description: 'Japanese animation style with expressive eyes',
    previewColor: '#FF6B9D',
    icon: 'Sparkles',
  },
  {
    id: Style.Pixar,
    displayName: 'Pixar',
    description: '3D animated movie style with soft features',
    previewColor: '#4ECDC4',
    icon: 'Film',
  },
  {
    id: Style.ThreeDimensionalRender,
    displayName: '3D Render',
    description: 'Photorealistic 3D rendering',
    previewColor: '#7C3AED',
    icon: 'Box',
  },
  {
    id: Style.PixelArt,
    displayName: 'Pixel Art',
    description: 'Retro 8-bit video game style',
    previewColor: '#10B981',
    icon: 'Grid3x3',
  },
  {
    id: Style.Watercolor,
    displayName: 'Watercolor',
    description: 'Soft painted watercolor aesthetic',
    previewColor: '#60A5FA',
    icon: 'Droplets',
  },
  {
    id: Style.Comic,
    displayName: 'Comic',
    description: 'Bold lines and vibrant comic book style',
    previewColor: '#F59E0B',
    icon: 'Zap',
  },
  {
    id: Style.Cyberpunk,
    displayName: 'Cyberpunk',
    description: 'Neon-lit futuristic aesthetic',
    previewColor: '#EC4899',
    icon: 'Cpu',
  },
  {
    id: Style.Fantasy,
    displayName: 'Fantasy',
    description: 'Magical and ethereal fantasy art',
    previewColor: '#8B5CF6',
    icon: 'Wand2',
  },
];

export const STYLE_MAP: Record<Style, StyleMetadata> = STYLES.reduce(
  (acc, style) => {
    acc[style.id] = style;
    return acc;
  },
  {} as Record<Style, StyleMetadata>
);

export const getStyleMetadata = (style: Style): StyleMetadata => {
  return STYLE_MAP[style];
};

export const FREE_GENERATIONS_LIMIT = 3;
export const POLL_INTERVAL_MS = 2000;
export const MAX_POLL_ATTEMPTS = 150;
export const MAX_PHOTOS = 3;
export const MIN_PHOTOS = 1;
