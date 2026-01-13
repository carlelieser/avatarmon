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

    try {
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
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create prediction';
        res.status(500).json({ error: message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const prediction = await replicate.predictions.get(id);

        res.json({
            id: prediction.id,
            status: prediction.status,
            output: prediction.output,
            error: prediction.error,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get prediction';
        res.status(500).json({ error: message });
    }
});

router.post('/:id/cancel', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await replicate.predictions.cancel(id);
        res.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to cancel prediction';
        res.status(500).json({ error: message });
    }
});

export default router;
