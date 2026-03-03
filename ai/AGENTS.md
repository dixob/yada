# AGENTS.md — Yada AI Content Pipeline

> Session startup rules for all AI-assisted content generation.
> This file defines the load order and discipline that prevents regressions.

---

## Every Content Generation Session

Before generating any content, read these files in order:

1. `ai/USER.md` — Robert's voice preferences and Yada brand rules
2. `ai/shared-context/BRAND.md` — Yada identity, fair play pledge, visual direction
3. `ai/shared-context/FEEDBACK-LOG.md` — Cross-content corrections that apply everywhere

For **character-specific content**, also read:

4. `characters/[CharacterName]/SOUL.md` — Who this character is, their voice, and their guardrails
5. `characters/_world/WORLD-BIBLE.md` — The shared world context

For **image generation (fal.ai Flux)**, also read:

6. The character's "Flux seed" and "Rejected prompt patterns" sections in their SOUL.md

---

## Content Type Routing

| Content type | Required files |
|---|---|
| Character dialogue | USER + BRAND + FEEDBACK-LOG + Character SOUL |
| Banner / card art (fal.ai) | USER + BRAND + Character SOUL (Flux seed section) |
| Marketing / platform copy | USER + BRAND + FEEDBACK-LOG |
| Lore / world text | USER + BRAND + FEEDBACK-LOG + WORLD-BIBLE + Character SOUL (if character-specific) |
| In-game UI copy | USER + BRAND + FEEDBACK-LOG |
| Story content | All files |

---

## Memory Rules

**Logging rejections:**
- Every rejected output gets a one-line entry in `ai/feedback/YYYY-MM-DD.md`
- Format: `[Content type] — [What was generated] — [Why rejected]`
- Example: `Dialogue (Kael) — "You can do it!" — Too motivational-poster. Breaks his register.`

**Promoting to permanent memory:**
- If the same correction is given 3+ times across any sessions, it moves to `ai/shared-context/FEEDBACK-LOG.md`
- If the correction is character-specific, it goes into that character's SOUL.md under "What they'd NEVER say" or "Rejected prompt patterns"

**Updating generation seeds:**
- When a fal.ai image is approved, update the character's "Flux seed (base)" in their SOUL.md
- When a fal.ai image is rejected, add the failure pattern to "Rejected prompt patterns"

---

## Safety Rules

- Never generate content that contradicts a character's "What they'd NEVER say" list
- Never generate images that match a character's "Rejected prompt patterns" list
- Fair play pledge language applies to all player-facing copy — transparent odds, pity acknowledged, no dark patterns
- Original IP only — no references to licensed properties

---

## Current Pipeline Status

| Surface | Status | Tool | Notes |
|---|---|---|---|
| Image generation | Greenfield | fal.ai Flux | fal.ai account setup pending |
| Character dialogue | Greenfield | Claude Haiku | Integration not started |
| Banner copy | Greenfield | Claude Haiku | Integration not started |
| Lore generation | Greenfield | Claude Haiku | Integration not started |
| Content eval | Greenfield | Braintrust | Not started |

---

*File created: 2026-03-03*
*Last updated: 2026-03-03*
