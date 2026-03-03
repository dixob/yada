# Guide: Image Generation (fal.ai Flux)

> Workflow guide for generating character and banner art via fal.ai.
> Read this alongside the character's SOUL.md before running any image session.

---

## Setup (one time)

1. Get your API key: https://fal.ai/dashboard/keys
2. Add to `server/.env`:
   ```
   FAL_KEY=your_key_here
   ```
3. Install the SDK (run once from `server/`):
   ```bash
   npm install
   ```
4. Start the server: `npm run dev`

The image API is now live at `http://localhost:3000/api/image/`.

---

## Model Selection

| Key | Model | Cost/MP | Steps | Use |
|-----|-------|---------|-------|-----|
| `schnell` | Flux.1 schnell | $0.003 | 4 | Rapid iteration, concept exploration |
| `dev` | Flux.1 dev | $0.025 | 28 | Quality character portraits, banner art |
| `pro` | Flux Pro 1.1 | $0.04 | auto | Final marketing assets, hero key art |

**Rule:** Always start with `schnell`. Move to `dev` once the direction is validated. `pro` only for shipping assets.

**Approx cost per image** (portrait_4_3 = ~0.79 MP):
- schnell: ~$0.002/image
- dev: ~$0.02/image
- pro: ~$0.03/image

---

## API Reference

### Check available models
```bash
curl http://localhost:3000/api/image/models
```

### Generate an image
```bash
curl -X POST http://localhost:3000/api/image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "YOUR_PROMPT_HERE",
    "model": "schnell",
    "imageSize": "portrait",
    "numImages": 1,
    "characterName": "CharacterName"
  }'
```

**imageSize options:**
- `portrait` — 768×1024 (character portraits, most common)
- `square` — 1024×1024 (icons, avatars, gacha card art)
- `banner` — 1024×576 (GachaScreen banner, marketing)

**Response:**
```json
{
  "images": [{ "url": "https://fal.media/...", "width": 768, "height": 1024 }],
  "seed": 1234567890,
  "modelUsed": "fal-ai/flux/schnell",
  "prompt": "...",
  "imageSize": "portrait_4_3"
}
```

**Locking a style with seed:** When you get an output you like, save `seed` into the character's SOUL.md "Flux seed" field. Re-using the same seed + same base prompt will reproduce close variants of that style.

---

## Prompt Construction

Base structure — always follow this order:
```
[SUBJECT + CORE IDENTITY]
[VISUAL DETAILS: hair, eyes, outfit, colors]
[POSE / EXPRESSION]
[SCENE / BACKGROUND]
[MOOD / LIGHTING]
[STYLE QUALIFIERS]
[negative prompt: ...]
```

**Style qualifiers that work well for gacha character art:**
```
anime style, cel shading, vibrant colors, clean linework,
game character art, detailed illustration, professional quality
```

**Style qualifiers for a western-original feel (not anime-coded):**
```
western animation style, graphic novel, bold design,
clean stylized illustration, character concept art, vibrant palette
```

**Prompt template — character portrait:**
```
[CHARACTER FLUX SEED from SOUL.md],
[pose description], [expression],
[background: simple / gradient / environmental],
[lighting: soft rim light / dramatic / golden hour],
anime style, game character art, vibrant colors, clean linework,
detailed illustration
negative prompt: blurry, low quality, deformed hands, extra limbs,
bad anatomy, watermark, text, duplicate
```

**Banner art template (GachaScreen):**
```
[CHARACTER FLUX SEED],
dynamic action pose, dramatic lighting,
[world environment in background],
epic composition, gacha banner art, vibrant colors,
anime style, high detail, cinematic
negative prompt: blurry, watermark, text, low quality, multiple characters
```

---

## Session Workflow

1. **Load context:** Read character SOUL.md (Visual Identity + Flux seed) + WORLD-BIBLE.md (visual language rules)
2. **Exploration phase (schnell):** Run 3–5 variations, adjust prompt between each
3. **Log rejections immediately** in `ai/feedback/YYYY-MM-DD.md` — one line per rejected image
4. **Lock direction:** When an output is approved:
   - Paste the winning prompt into SOUL.md → "Flux seed (base)"
   - Record the `seed` value from the API response
   - Add failed patterns to SOUL.md → "Rejected prompt patterns"
5. **Refine (dev model):** Switch to `dev` for higher quality output using locked prompt
6. **Final asset:** Run `pro` for any asset going into production (marketing, key art)
7. **Deliver:** Save final image to `game/public/assets/characters/[name]/`

---

## What to Log

Every rejected image gets one line in `ai/feedback/YYYY-MM-DD.md`:
```
[Character] [size] [model] — [what was generated] — [why rejected]
```

Examples:
```
[Kael] portrait schnell — front-facing neutral — too static, no personality
[Kael] portrait schnell — dynamic pose blue glow — wrong color, contradicts palette
[Banner] banner dev — character centered evenly — no visual hierarchy, too flat
```

After 3 rejections with the same pattern → promote to `ai/shared-context/FEEDBACK-LOG.md`.
That correction then applies to all future generations automatically.

---

## Common Failure Modes

*(Grows as real sessions produce data)*

- **Anime hands / deformed fingers** → add `deformed hands, extra limbs, bad anatomy` to negative prompt
- **Muddy colors in schnell** → normal at 4 steps; switch to `dev` for final version
- **Style drifts toward generic anime** → add `western` or `graphic novel` qualifiers to assert western-original identity
- **Background too busy** → add `simple background` or `gradient background` to isolate character
- **Character loses identity across prompts** → you haven't locked a seed yet; run more schnell variants first

---

*File updated: 2026-03-03*
