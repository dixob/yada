/**
 * falai/routes.js
 *
 * Express router for fal.ai image generation endpoints.
 * Mount in server/index.js at /api/image.
 *
 * These are dev/admin routes for the art direction pipeline.
 * Not exposed to players — protect with FAL_ADMIN_SECRET in production
 * or keep behind a local-only middleware.
 *
 * Endpoints:
 *   POST /api/image/generate   — generate image(s) from prompt
 *   GET  /api/image/models     — list available models + costs
 */

const express = require('express');
const router = express.Router();
const { generateImage, MODELS, IMAGE_SIZES } = require('./client');

// ---------------------------------------------------------------------------
// Simple admin guard — set FAL_ADMIN_SECRET in .env to enable
// If not set, the routes are open (fine for localhost dev)
// ---------------------------------------------------------------------------
function adminGuard(req, res, next) {
  const secret = process.env.FAL_ADMIN_SECRET;
  if (!secret) return next(); // no secret set → open in dev
  if (req.headers['x-admin-secret'] === secret) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// ---------------------------------------------------------------------------
// GET /api/image/models
// Returns the model catalog so the art session knows what's available.
// ---------------------------------------------------------------------------
router.get('/models', (req, res) => {
  res.json({
    models: Object.entries(MODELS).map(([key, m]) => ({
      key,
      id: m.id,
      label: m.label,
      costPerMp: m.costPerMp,
      use: m.use,
    })),
    imageSizes: IMAGE_SIZES,
  });
});

// ---------------------------------------------------------------------------
// POST /api/image/generate
// ---------------------------------------------------------------------------
/**
 * Generate one or more images via fal.ai Flux.
 *
 * Request body:
 *   {
 *     prompt:     string (required) — full prompt including character seed
 *     model?:     "schnell" | "dev" | "pro"  (default: "schnell")
 *     imageSize?: "portrait" | "square" | "banner"  (default: "portrait")
 *     numImages?: 1–4  (default: 1)
 *     seed?:      number | null  (default: null — random)
 *     characterName?: string  (optional — logged only, not sent to fal.ai)
 *   }
 *
 * Response:
 *   {
 *     images: [{ url, width, height, content_type }],
 *     seed: number | null,
 *     modelUsed: string,
 *     modelLabel: string,
 *     prompt: string,
 *     imageSize: string
 *   }
 *
 * Tip: Save the seed from a good result and set it in the character's
 * SOUL.md "Flux seed" field — this locks the style for future sessions.
 */
router.post('/generate', adminGuard, async (req, res) => {
  const {
    prompt,
    model = 'schnell',
    imageSize = 'portrait',
    numImages = 1,
    seed = null,
    characterName,
  } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'prompt is required and must be a non-empty string' });
  }

  if (!process.env.FAL_KEY) {
    return res.status(500).json({
      error: 'FAL_KEY is not configured. Add it to server/.env — get your key at https://fal.ai/dashboard/keys',
    });
  }

  try {
    console.log(`[fal.ai] Generating${characterName ? ` for "${characterName}"` : ''} — model: ${model}, size: ${imageSize}`);
    const result = await generateImage({ prompt, model, imageSize, numImages, seed });
    console.log(`[fal.ai] Done — seed: ${result.seed}, images: ${result.images.length}`);
    res.json(result);
  } catch (err) {
    console.error('[fal.ai] Generation error:', err.message);
    res.status(500).json({ error: 'Image generation failed', detail: err.message });
  }
});

module.exports = router;
