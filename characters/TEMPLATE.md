# SOUL.md — [Character Name]

> One sentence. Who this character is to someone who has never seen the game.

---

## Core Identity

**Name:** [Full name. Include title or honorific if they have one.]
**Archetype:** [e.g., "the reluctant hero", "the trickster sage", "the fallen general", "the loyal rival"]
**Personality reference:** [One fictional character they echo — this gives Claude instant behavioral context from training data. e.g., "Roy Mustang energy: brilliant, composed, with a hidden weight of guilt."]
**Role in game:** [Playable / NPC / Gacha-pull character / Story anchor / Boss]
**Rarity tier:** [Common / Rare / Epic / Legendary — affects how they're written and how their art budget is allocated]

---

## Visual Identity

**Aesthetic:** [2–3 words. e.g., "dark fantasy knight", "neon street alchemist", "baroque celestial mage"]
**Signature colors:** [Primary + accent. e.g., "deep crimson and tarnished gold"]
**Signature features:** [The one visual thing that makes them recognizable at a glance — an accessory, a scar, a silhouette shape, a weapon]
**What their art should NOT be:** [Anything that's been rejected — starts empty, fills in as you run fal.ai batches]

**Flux seed (base):**
```
[Paste the fal.ai prompt fragment that produced your first approved image here.
 Leave blank until after the first image generation session.]
```

**Rejected prompt patterns:**
- *(none yet — add as you reject outputs)*

---

## Voice & Dialogue

**How they speak:** [2–3 sentences describing their verbal register. e.g., "Short sentences. Never explains herself. Speaks in statements, not questions. Military cadence that occasionally breaks into dry sarcasm."]

**Signature phrases:** [2–4 lines they might actually say. Make them feel earned, not generic.]
- "[Example line 1]"
- "[Example line 2]"
- "[Example line 3]"

**What they'd NEVER say:**
*(These are the guardrails. Every generation gets checked against this list.)*
- [e.g., "Anything with an exclamation point — they're too controlled"]
- [e.g., "Motivational poster language — 'believe in yourself', 'you can do it'"]
- [e.g., "Anime speech tics or honorifics — this is a Western IP"]
- [Add more as corrections accumulate]

---

## Role in World

**Where they come from:** [1–3 sentences. Tight backstory. The version you'd tell in a gacha card description, not a novel.]

**What they want:** [Core motivation — simple, human, specific. The thing that drives every decision.]

**What stands in their way:** [The central tension. Internal or external or both.]

**Arc direction:** [Where do they go over the course of the story? One sentence.]

---

## Relationships

| Character | Relationship | Dynamic |
|-----------|-------------|---------|
| [Name]    | [e.g., rival / mentor / estranged ally] | [One line that captures the tension or bond] |
| [Name]    | | |

---

## Content Generation Notes

These notes feed directly into AI generation tasks. Update them every time you run a generation session.

**For dialogue generation (Claude Haiku):**
Prepend this section's entire content to every dialogue prompt. The model needs the "What they'd NEVER say" list explicitly in context.

**For image generation (fal.ai Flux):**
Use the Flux seed as your base prompt. Append scene-specific details after it. If the seed hasn't been established yet, start with: `[Aesthetic] character, [signature colors], [signature features], digital illustration, high detail, cinematic lighting`

**Running rejection log:**
*(Add a line here each time you reject an output and briefly note why — this becomes your prompt refinement over time)*
- *(none yet)*

---

*File created: [YYYY-MM-DD]*
*Last updated: [YYYY-MM-DD]*
*Approved images: 0*
*Rejected images: 0*
*Approved dialogue lines: 0*
