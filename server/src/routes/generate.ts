import { Router, Request, Response } from 'express';
import Replicate from 'replicate';
import { GenerationRequestSchema } from '../schemas/api';
import type { GenerationResponse, GenerationStatus } from '../schemas/api';

const router = Router();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MODEL_ID = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

function getImageDimensions(aspectRatio: string): { width: number; height: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '3:4': { width: 768, height: 1024 },
    '4:3': { width: 1024, height: 768 },
    '9:16': { width: 576, height: 1024 },
  };
  return dimensions[aspectRatio] || dimensions['1:1'];
}

function mapReplicateStatus(status: string): GenerationStatus {
  const statusMap: Record<string, GenerationStatus> = {
    starting: 'queued',
    processing: 'processing',
    succeeded: 'completed',
    failed: 'failed',
    canceled: 'cancelled',
  };
  return statusMap[status] || 'queued';
}

function calculateProgress(logs: string | undefined, status: string): number {
  if (status === 'succeeded') return 100;
  if (status === 'starting') return 5;
  if (!logs) return 10;

  const stepMatch = logs.match(/Step (\d+)\/(\d+)/);
  if (stepMatch) {
    const current = parseInt(stepMatch[1], 10);
    const total = parseInt(stepMatch[2], 10);
    return Math.round((current / total) * 90) + 10;
  }

  return 50;
}

// POST /api/generate - Start generation
router.post('/', async (req: Request, res: Response) => {
  console.log('[API] Generate endpoint hit');
  try {
    const parseResult = GenerationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { prompt, negativePrompt, aspectRatio, sourceImageBase64 } = parseResult.data;
    const { width, height } = getImageDimensions(aspectRatio);

    const input: Record<string, unknown> = {
      prompt,
      negative_prompt: negativePrompt || '',
      width,
      height,
      num_outputs: 1,
      scheduler: 'K_EULER',
      num_inference_steps: 30,
      guidance_scale: 7.5,
      refine: 'expert_ensemble_refiner',
      high_noise_frac: 0.8,
    };

    if (sourceImageBase64) {
      input.image = sourceImageBase64;
      input.prompt_strength = 0.8;
    }

    const prediction = await replicate.predictions.create({
      version: MODEL_ID.split(':')[1],
      input,
    });

    const response: GenerationResponse = {
      id: prediction.id,
      status: 'queued',
      progress: 0,
    };

    res.json(response);
  } catch (error) {
    console.error('[API] Generation error:', error);
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

// GET /api/generate/:id - Check status
router.get('/:id', async (req: Request, res: Response) => {
  console.log('[API] Status endpoint hit');
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Missing ID parameter' });
      return;
    }

    const prediction = await replicate.predictions.get(id);
    const status = mapReplicateStatus(prediction.status);
    const progress = calculateProgress(prediction.logs, prediction.status);

    const response: GenerationResponse = {
      id: prediction.id,
      status,
      progress,
    };

    if (status === 'completed' && prediction.output) {
      const outputs = prediction.output as string[];
      response.imageUrl = outputs[0];
    }

    if (status === 'failed') {
      const errorMessage = typeof prediction.error === 'string'
        ? prediction.error
        : 'Generation failed';
      response.error = errorMessage;
    }

    if (prediction.metrics?.predict_time) {
      response.estimatedSeconds = Math.round(prediction.metrics.predict_time);
    }

    res.json(response);
  } catch (error) {
    console.error('[API] Status check error:', error);
    res.status(500).json({ error: 'Failed to get generation status' });
  }
});

// POST /api/generate/:id/cancel - Cancel generation
router.post('/:id/cancel', async (req: Request, res: Response) => {
  console.log('[API] Cancel endpoint hit');
  try {
    const { id } = req.params;

    await replicate.predictions.cancel(id);

    res.json({ success: true });
  } catch (error) {
    console.error('[API] Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel generation' });
  }
});

export default router;
