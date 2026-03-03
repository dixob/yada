# Guide: Character Dialogue Generation (Claude Haiku)

> Workflow guide for generating in-game dialogue via Claude Haiku.
> Read this alongside the character's SOUL.md before any dialogue session.

---

## Model

`claude-haiku-4-5-20251001` — $1.00/M input tokens, $5.00/M output tokens.

---

## Prompt Construction

Every dialogue generation prompt must include, in order:

1. The character's full SOUL.md content (or the Voice & Dialogue section at minimum)
2. The FEEDBACK-LOG.md cross-content corrections
3. The scene context (what's happening in-game when this line is triggered)
4. The specific dialogue type (see types below)
5. The request

**Minimum viable prompt:**
```
[Paste character's SOUL.md — Voice & Dialogue section]

Cross-content corrections (apply to all outputs):
[Paste FEEDBACK-LOG.md]

Scene: [What's happening. One sentence.]
Dialogue type: [See types below]
Deliver: [Number] variations.
```

---

## Dialogue Types

| Type | Where used | Typical length | Notes |
|---|---|---|---|
| Battle start | Combat screen | 1 line | High energy, character-defining |
| Battle win | Post-combat | 1 line | Reflects their relationship to victory |
| Battle lose | Post-combat | 1 line | Reveals their character under pressure |
| Gacha pull | Pull screen | 1 line | First impression — must feel premium |
| Story line | Narrative scenes | 1–3 sentences | Full voice, follows scene context |
| Idle | Main screen, loop | 1 line | Low energy but in-character |
| Level up | Progression | 1 line | Reaction to growth |
| Seasonal | Events | 1 line | Must stay in-character while fitting the event |

---

## Quality Check (before accepting any output)

Run every generated line against the character's SOUL.md:
- [ ] Consistent with "How they speak" description?
- [ ] Doesn't violate any item on "What they'd NEVER say"?
- [ ] Passes the FEEDBACK-LOG.md standing corrections?
- [ ] Sounds like THIS character, not a generic gacha character?

If any check fails, reject and log.

---

## What to Log

Every rejected line gets one entry in `ai/feedback/YYYY-MM-DD.md`:
```
Dialogue ([Character], [type]) — "[rejected line]" — [why rejected]
```

---

*File created: 2026-03-03*
