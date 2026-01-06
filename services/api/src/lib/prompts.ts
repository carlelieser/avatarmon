import { Style } from '@avatarmon/shared';

export const prompts: Record<Style, string> = {
    [Style.Anime]:
        'anime style portrait, cel shaded, vibrant colors, detailed expressive eyes, clean linework, studio ghibli quality, soft gradients, high quality anime art, professional illustration',
    [Style.Pixar]:
        '3d pixar disney style character portrait, soft subsurface scattering skin, big expressive cartoon eyes, smooth rounded features, warm studio lighting, family friendly, render quality',
    [Style.ThreeDimensionalRender]:
        'octane render 3d character portrait, volumetric lighting, subsurface scattering, highly detailed textures, professional 3d art, artstation quality, cinematic lighting',
    [Style.PixelArt]:
        '16-bit pixel art portrait, retro game character sprite, clean crisp pixels, limited color palette, nostalgic gaming aesthetic, snes era style, iconic character design',
    [Style.Watercolor]:
        'watercolor portrait painting, soft wet edges, delicate artistic brushstrokes, subtle color bleeding, fine art gallery quality, traditional media aesthetic, elegant composition',
    [Style.Comic]:
        'marvel comic book style portrait, bold black ink outlines, dramatic cel shading, dynamic color blocks, superhero art aesthetic, professional comic illustration, halftone dots',
    [Style.Cyberpunk]:
        'cyberpunk portrait, neon rim lighting, futuristic tech implants, chrome metallic accents, blade runner aesthetic, rain reflections, moody atmospheric, high tech low life',
    [Style.Fantasy]:
        'epic fantasy art portrait, magical ethereal glow, mystical lighting, intricate details, artstation trending, painterly brushwork, enchanted atmosphere, legendary character',
};
