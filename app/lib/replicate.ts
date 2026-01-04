import type { Style } from '@/schemas/enums';
import type { BuilderSource } from '@/schemas/avatar';
import type { GenerationRequest } from '@/schemas/api';

export const STYLE_PROMPTS: Record<Style, { positive: string; negative: string }> = {
  anime: {
    positive:
      'anime style portrait, cel shaded, vibrant colors, detailed eyes, studio ghibli quality, high quality anime art',
    negative: 'realistic, photograph, 3d render, western cartoon',
  },
  pixar: {
    positive:
      '3d pixar style character portrait, soft subsurface scattering, disney quality, smooth skin, big expressive eyes, studio lighting',
    negative: 'anime, 2d, flat, realistic photograph',
  },
  '3d-render': {
    positive:
      'octane render portrait, 3d character, volumetric lighting, subsurface scattering, highly detailed, artstation quality',
    negative: 'anime, 2d, cartoon, photograph',
  },
  'pixel-art': {
    positive:
      '16-bit pixel art portrait, retro game character, clean pixels, limited color palette, nostalgic',
    negative: 'realistic, smooth, high resolution, photograph',
  },
  watercolor: {
    positive:
      'watercolor portrait painting, soft edges, artistic brushstrokes, delicate colors, fine art quality',
    negative: 'digital, sharp edges, photograph, anime',
  },
  comic: {
    positive:
      'marvel comic book style portrait, bold ink lines, dramatic shading, dynamic coloring, superhero art style',
    negative: 'realistic, photograph, anime, soft',
  },
  cyberpunk: {
    positive:
      'cyberpunk portrait, neon lighting, futuristic, chrome accents, blade runner aesthetic, high tech',
    negative: 'medieval, fantasy, natural, soft lighting',
  },
  fantasy: {
    positive:
      'fantasy art portrait, magical lighting, ethereal glow, detailed, artstation, epic fantasy illustration',
    negative: 'modern, urban, realistic photograph, mundane',
  },
};

export function buildPromptFromBuilder(source: BuilderSource): string {
  const descriptors: string[] = [
    'portrait',
    source.gender,
    source.ageRange.replace(/-/g, ' '),
    `${source.faceShape} face shape`,
    `${source.skinTone} skin tone`,
    `${source.hairStyle} ${source.hairColor} hair`,
    `${source.eyeColor} ${source.eyeShape} eyes`,
  ];

  if (source.facialHair !== 'none') {
    descriptors.push(source.facialHair.replace(/-/g, ' '));
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

  const request: GenerationRequest = {
    prompt: `${basePrompt}, ${styleConfig.positive}`,
    negativePrompt: `${styleConfig.negative}, deformed, ugly, bad anatomy, blurry, low quality`,
    style,
    aspectRatio: aspectRatio as GenerationRequest['aspectRatio'],
  };

  if (sourceImageBase64) {
    request.sourceImageBase64 = sourceImageBase64;
  }

  return request;
}
