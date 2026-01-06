import { Router, Request, Response } from 'express';
import { InputSchema } from '@avatarmon/shared';
import { replicate } from '../lib/replicate';
import { prompts } from '../lib/prompts';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const result = InputSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            error: 'Invalid input',
            details: result.error.issues,
        });
        return;
    }

    const { style, references, modifications } = result.data;

    const prompt = [prompts[style], ...modifications].join(', ');

    const prediction = await replicate.predictions.create({
        model: process.env.REPLICATE_MODEL_ID!,
        input: {
            prompt,
            input_images: references,
        },
    });

    res.json({
        id: prediction.id,
        status: prediction.status,
    });
});

router.post('/:id/cancel', async (req: Request, res: Response) => {
    const { id } = req.params;
    await replicate.predictions.cancel(id);

    res.json({ success: true });
});

export default router;
