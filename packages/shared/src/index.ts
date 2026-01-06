import { z } from 'zod';

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

export const InputSchema = z.object({
    style: z.enum(Style),
    references: z.array(z.string()).describe('list of reference images to use (base64)'),
    modifications: z.array(z.string()).describe('list of modifications to apply'),
});
