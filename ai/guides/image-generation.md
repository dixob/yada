# Guide: Image Generation (fal.ai Flux)

> Workflow guide for generating character and banner art via fal.ai.
> Read this alongside the character's SOUL.md before running any image session.

---

## Model Selection

| Model | Cost | Use case |
|---|---|---|
| Flux.1 [schnell] | $0.003/MP | Rapid iteration, concept exploration, batch testing |
| Flux.1 [dev] | $0.025/MP | Quality character portraits, banner art |
| Flux.2 [pro] | $0.03/MP | Final marketing assets, key art |

**Default:** Start every new character with schnell for exploration. Move to dev once the seed is validated. Pro only for final hero assets.

---

## Prompt Construction

Base structure:
```
[CHARACTER FLUX SEED]
[scene description]
[mood/lighting direction]
[output format: portrait / landscape / square]
[negative prompt if needed]
```

Always start with the character's Flux seed from their SOUL.md. Never construct a character prompt from scratch — that's what the seed is for.

---

## Session Workflow

1. Load the character's SOUL.md — read "Visual Identity" and "Flux seed" sections
2. Load WORLD-BIBLE.md — check world visual language rules
3. Run 3–5 variations with schnell to establish direction
4. Log every rejection immediately in `ai/feedback/YYYY-MM-DD.md`
5. When an output is approved, update the character's SOUL.md:
   - Paste the winning prompt into "Flux seed (base)"
   - Add failed patterns to "Rejected prompt patterns"
6. Move to dev model for the approved direction
7. Deliver final asset to `game/public/assets/characters/[name]/`

---

## What to Log

Every rejected image gets one line:
```
[Character] image — [brief description of what was generated] — [why rejected in one phrase]
```

Examples:
- `[Character] image — front-facing portrait, neutral background — too static, loses personality`
- `[Character] image — dynamic pose, blue glow — color is wrong, contradicts their palette`

After 3 rejections with the same pattern, add it to the character's SOUL.md under "Rejected prompt patterns."

---

## Common Failure Modes

*(Grows as real sessions produce data)*
- [Add as you encounter them]

---

*File created: 2026-03-03*
