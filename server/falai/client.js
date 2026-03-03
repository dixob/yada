/**
 * falai/client.js
 *
 * fal.ai client wrapper for the Yada image generation pipeline.
 *
 * Requires: FAL_KEY in server/.env
 * Get your key at: https://fal.ai/dashboard/keys
 *
 * This is a dev/admin tool — not a player-facing endpoint.
 * Used during art direction sessions to generate character and banner art.
 */

const { fal } = require('@fal-ai/client');

// ---------------------------------------------------------------------------
// Configure the fal.ai client with your API key
// ---------------------------------------------------------------------------
fal.config({
  credentials: process.env.FAL_KEY,
});

// ---------------------------------------------------------------------------
// Model catalog
// ---------------------------------------------------------------------------
const MODELS = {
  schnell: {
    id: 'fal-ai/flux/schnell',
    label: 'Flux.1 schnell',
    costPerMp: 0.003,
    defaultSteps: 4,
    use: 'Rapid iteration, concept exploration',
  },
  dev: {
    id: 'fal-ai/flux/dev',
    label: 'Flux.1 dev',
    costPerMp: 0.025,
    defaultSteps: 28,
    use: 'Quality character portraits, banner art',
  },
  pro: {
    id: 'fal-ai/flux-pro/v1.1',
    label: 'Flux Pro 1.1',
    costPerMp: 0.04,
    defaultSteps: null, // Pro manages steps internally
    use: 'Final marketing assets, key art',
  },
};

// ---------------------------------------------------------------------------
// Image size presets
// ---------------------------------------------------------------------------
const IMAGE_SIZES = {
  portrait:  'portrait_4_3',    // 768x1024 — character portraits
  square:    'square_hd',       // 1024x1024 — icons, avatars
  banner:    'landscape_16_9',  // 1024x576  — banner art, GachaScreen
};

// ---------------------------------------------------------------------------
// generateImage
// Core generation function. Returns fal.ai result.
// ---------------------------------------------------------------------------
async function generateImage({ prompt, model = 'schnell', imageSize = 'portrait', numImages = 1, seed = null }) {
  const modelConfig = MODELS[model];
  if (!modelConfig) {
    throw new Error(`Unknown model "${model}". Valid: schnell, dev, pro`);
  }

  const falImageSize = IMAGE_SIZES[imageSize] || imageSize; // accept raw fal size strings too

  const input = {
    prompt,
    image_size: falImageSize,
    num_images: Math.min(Math.max(numImages, 1), 4), // clamp 1–4
    ...(seed !== null && { seed }),
    ...(modelConfig.defaultSteps && { num_inference_steps: modelConfig.defaultSteps }),
  };

  const result = await fal.subscribe(modelConfig.id, {
    input,
    logs: false,
  });

  return {
    images: result.data.images,
    seed: result.data.seed ?? null,
    modelUsed: modelConfig.id,
    modelLabel: modelConfig.label,
    prompt,
    imageSize: falImageSize,
  };
}

module.exports = { fal, generateImage, MODELS, IMAGE_SIZES };
