# Handoff File

_Last updated: 2026-03-03 (session 7)_

---

## Current Focus

**Worldbuilding session complete.** WORLD-BIBLE.md written, protagonist SOUL.md (Ash) created, BRAND.md visual direction locked. Next: write The Detective (Vera) SOUL.md, then begin GDD.

---

## Recent Decisions

All decisions logged in full in `decisions-log.md`. Summary of locked decisions:

- **Market:** North America only at launch (EU deferred — GDPR + gacha law complexity)
- **Monetization:** Gacha IAP + Battle Pass (ads as floor revenue only)
- **Platform scope:** Full stack — discovery portal + original IP games + third-party dev ecosystem
- **Differentiators:** Original IP ownership, Fair Play Pledge (ethical gacha), western-native identity
- **Tech stack:** Phaser 3 (game engine) + PlayFab (backend/economy) + Stripe (payments)
- **Codename:** Yada — real brand name TBD
- **Art approach:** AI-generated (fal.ai / Flux) — no hired artist at this stage ✅ INTEGRATED
- **Growth approach:** Organic / community-led — no paid UA until proven retention
- **Game format:** Card-expressed combat RPG (NOT full RPG, NOT deck-builder). Characters are the collectible. Cards express character abilities in turn-based combat. FGO/Granblue model.
- **Strategic mission:** Dual-purpose — applied AI research platform + sustainable indie business (~$5K/mo target, not floor)

---

## Completed This Session (Session 7 — 2026-03-03)

### ✅ WORLD-BIBLE.md — Full rewrite
- `characters/_world/WORLD-BIBLE.md` — setting, tone, The Resonance (0.003% activation, 41-year timeline, hair marker, emotional cost), four factions (The Index / Meridian / The Silence / The Unbound), visual language (desaturated urban + Resonance wrongness + fashion + silhouette rules), lore anchors, generation rules

### ✅ Protagonist Character — Ash
- `characters/Ash/SOUL.md` — working name, real name unknown in-game
- Visual: respirator mask, white/silver long hair, structured white jacket, cool violet eyes — mapped to art direction reference image 1
- Personality: Roy Mustang + Motoko Kusanagi. Controlled, economical, private.
- Resonance ability: CLASSIFIED — central narrative mystery. Combat cards labeled as tactical tools; mid-game revelation recontextualizes them as Resonance expressions.
- 10-chapter revelation pacing structure. Appeal register: controlled presence + partial concealment + visible competence.
- "What she'd NEVER say" list — enforces voice consistency in all generated dialogue.

### ✅ BRAND.md — Visual direction locked
- `ai/shared-context/BRAND.md` — visual direction section fully written: contemporary streetwear + anime-adjacent illustration, cool desaturated palette, mask/futuristic as primary register, quiet/melancholic secondary. Hair rule, mask rule, silhouette rule, "what it should NOT look like" list.

---

## Completed Previous Sessions (Sessions 1–6)

### Session 6 — fal.ai Integration + Format Decision + Worldbuilding Start
- `server/falai/client.js`, `server/falai/routes.js` — fal.ai server integration
- `server/package.json` — `@fal-ai/client: ^1.3.0` added
- `server/index.js` — `/api/image` routes registered
- `ai/guides/image-generation.md` — full rewrite with real API workflow
- Format locked: card-expressed combat RPG
- **Still needs:** `FAL_KEY=your_key_here` added to `server/.env`, then `npm install` in `server/`

### Session 5 — AI Advisor + Content Pipeline OS
- `yada-ai-advisor-report.docx` — 10 AI surfaces, 6 prioritized recommendations, 90-day roadmap
- `characters/TEMPLATE.md` — SOUL.md blank starter
- `ai/USER.md`, `ai/AGENTS.md`, `ai/shared-context/BRAND.md` (stub), `ai/shared-context/FEEDBACK-LOG.md`
- `ai/guides/image-generation.md` (stub, rewritten session 6), `ai/guides/dialogue.md`

### Session 4 — Phaser 3 Client + Competitive Analysis
- `game/` — full Phaser 3 client scaffold (13 files, committed)
- `yada-competitive-analysis.docx` — G123 profile, P&L 3-scenario model
- `yada-ai-advisor.skill` — skill package

### Sessions 1–3 — Server Scaffold
- `server/` — Express + PlayFab + Stripe full integration
- PlayFab Title ID: `AEE34`

---

## Open Threads

**Active tasks (in priority order):**
1. **The Detective (Vera) SOUL.md** ← NEXT — first recruit character, relationship with Ash established in WORLD-BIBLE
2. **GDD** — ready to write after Vera is complete; worldbuilding foundation is now solid enough
3. **fal.ai account activation** — add `FAL_KEY` to `server/.env`, run `npm install` in `server/`
4. **Stripe dashboard** — create 6 products, copy price IDs into `server/.env`, configure webhook
5. **PlayFab economy setup** — upload `server/playfab/catalog-main.json`, enable player stats

**Someday / deferred:**
- Platform name (real brand name, not "Yada")
- IP / trademark filing — after concept is locked and GDD is written
- Additional characters — The Architect, The Performer, others per archetype plan
- GDPR / EU gacha compliance — Phase 2
- Developer platform / third-party SDK — Year 2
- Xsolla migration — revisit at ~$10K/mo or significant EU traffic
- Braintrust eval setup — Phase 2 (after content is generating)
- Pinecone personalization — post-launch

---

## Context / Notes

- **Workspace:** `C:\Users\rober\yada\` — GitHub remote is `https://github.com/dixob/yada`, push access configured
- **GitHub push:** Works directly from Cowork — no manual steps needed
- **Skills available:** `yada-gdd`, `yada-ip-brief`, `yada-ai-advisor` — all accessible via skill invocations
- **Memory** intact at `memory/` — glossary, project context, and company context all current
- **Solo founder, no team.** All decisions are Robert's to make unilaterally
- **Frugal mode:** No hired artist (fal.ai/Flux), no paid UA (organic/community growth)
- **Game format locked:** Card-expressed combat RPG. Think FGO mechanics + original western IP + contemporary supernatural setting
- **Player role:** Commander/leader. Characters serve/challenge the player. Pull motivation = building the roster + earning character loyalty
- **World direction:** Contemporary + supernatural. Real world with hidden supernatural layer. "Resonance" phenomenon activates latent powers in people under extreme emotional duress. Player runs The Index — a covert agency that recruits "Resonants" before Meridian, The Silence, or The Unbound do.
- **First character archetypes:** Competent Loner (top-of-funnel converter), The Broken One (whale bait), Chaos Agent (virality/social). Ash is the protagonist/Commander. Vera (The Detective) is first recruit.
- **Psychology layer:** Variable ratio reinforcement, near-miss effect, pity as sunk cost, free-to-play permission structure, character design archetypes — all documented in session 6 context. Bake into GDD when written.
- **P&L target:** Conservative scenario (~$5K/mo operating profit by Year 2) is the actual success target, not the floor
- **Pull rates:** 1.5% SSR / 12.5% SR / 86% R. Hard pity at 90, soft pity starts at 74. Guaranteed rate-up at hard pity (no 50/50 trap). No equipment gacha (Fair Play Pledge).
- **Gacha layers:** Characters (primary pull) → Resonance Depth 1–5 dupe system (whale driver) → Memory Fragments (F2P narrative retention layer)
- **Art direction locked:** Contemporary streetwear + anime-adjacent illustration + cool desaturated palette. Primary register = mask/futuristic. Resonance = environmental wrongness, not sparkles. See WORLD-BIBLE.md and BRAND.md for full rules.
- **Ash visual identity:** Respirator mask, white/silver long hair windswept, structured white tactical jacket with dark harness straps, cool violet-gray eyes. Resonance color: deep violet/indigo. Art direction mapped to reference image 1 from session 7.
