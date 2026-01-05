import { Router, Request, Response } from 'express';
import Replicate from 'replicate';
import { GenerationRequestSchema } from '../schemas/api';
import type { GenerationResponse, GenerationStatus } from '../schemas/api';

const router = Router();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// FLUX Kontext multi-image model
const MODEL_ID = 'flux-kontext-apps/multi-image-list:02f073c63abec2c72f0638164a25a64bd0ca70bce780c0ac75c6851252bb4c70';

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

    const { prompt, negativePrompt, aspectRatio, sourceImageBase64, sourceImagesBase64, seed } =
      parseResult.data;

    // Get images: prefer new array format, fall back to legacy single image
    const images = sourceImagesBase64 || (sourceImageBase64 ? [sourceImageBase64] : []);

    if (images.length === 0) {
      res.status(400).json({
        error: 'No images provided',
        details: 'At least one source image is required',
      });
      return;
    }

    // Build input for FLUX Kontext model
    const input: Record<string, unknown> = {
      prompt: `${prompt}${negativePrompt ? `. Avoid: ${negativePrompt}` : ''}`,
      input_images: images,
      aspect_ratio: aspectRatio,
      output_format: 'png',
      safety_tolerance: 2,
    };

    if (seed) {
      input.seed = seed;
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
      const output = prediction.output;
      // Handle both array and single string output formats from Replicate
      if (Array.isArray(output) && output.length > 0) {
        response.imageUrl = String(output[0]);
      } else if (typeof output === 'string') {
        response.imageUrl = output;
      }
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
