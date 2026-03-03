# Handoff File

_Last updated: 2026-03-03 (session 6)_

---

## Current Focus

**Worldbuilding session in progress.** Game format is locked (card-expressed combat RPG). Contemporary supernatural setting confirmed. First character concept under development. Session goal: fill in `characters/_world/WORLD-BIBLE.md`, create first character `characters/[Name]/SOUL.md`, and draft the core retention/gacha mechanics document.

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
- **Game format:** Card-expressed combat RPG (NOT full RPG, NOT deck-builder). Characters are the collectible. Cards express character abilities in turn-based combat. FGO/Granblue model. ← NEW SESSION 6

---

## Completed This Session (Session 6 — 2026-03-03)

### ✅ fal.ai Server Integration
- `server/falai/client.js` — fal.ai client wrapper, model catalog (schnell/dev/pro), `generateImage()` function
- `server/falai/routes.js` — Express router: `GET /api/image/models`, `POST /api/image/generate`
- `server/package.json` — `@fal-ai/client: ^1.3.0` added
- `server/index.js` — `/api/image` routes registered
- **Still needs:** `FAL_KEY=your_key_here` added to `server/.env` (get from https://fal.ai/dashboard/keys), then `npm install` in `server/`

### ✅ Image Generation Guide Updated
- `ai/guides/image-generation.md` — full rewrite with real API workflow, working curl examples, prompt templates for portrait/square/banner, seed-locking workflow, cost breakdown per image

### ✅ Strategic Format Decision
- Full RPG direction reconsidered after analysis of G123 portfolio (DxD = most popular title, card format)
- Locked: **card-expressed combat RPG** as flagship game format
- Rationale: 4–6 month MVP solo vs. 12–18 months for full RPG; Phaser 3 natural fit; FGO proves characters + narrative carry thin mechanics; existing gacha scaffold unchanged

### ✅ Decisions Log + Handoff Updated

---

## Completed Previous Sessions (Sessions 1–5)

### Session 5 — AI Advisor + Content Pipeline OS
- `yada-ai-advisor-report.docx` — 10 AI surfaces, 6 prioritized recommendations, 90-day roadmap
- `characters/TEMPLATE.md` — SOUL.md blank starter
- `characters/_world/WORLD-BIBLE.md` — stub (fill in worldbuilding session)
- `ai/USER.md`, `ai/AGENTS.md`, `ai/shared-context/BRAND.md`, `ai/shared-context/FEEDBACK-LOG.md`
- `ai/guides/image-generation.md`, `ai/guides/dialogue.md`

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
1. **Worldbuilding session** ← IN PROGRESS THIS SESSION
   - Fill `characters/_world/WORLD-BIBLE.md`
   - Create first character `characters/[Name]/SOUL.md`
   - Draft core retention + gacha mechanics doc
2. **fal.ai account activation** — add `FAL_KEY` to `server/.env`, run `npm install`
3. **Stripe dashboard** — create 6 products, copy price IDs into `server/.env`, configure webhook
4. **PlayFab economy setup** — upload `server/playfab/catalog-main.json`, enable player stats

**Someday / deferred:**
- Platform name (real brand name, not "Yada")
- IP / trademark filing — after concept is locked
- GDD — after worldbuilding session locks setting, characters, and core loop
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
- **World direction:** Contemporary + supernatural. Real world with hidden supernatural layer. "Resonance" phenomenon activates latent powers in people under extreme emotional duress. Player runs a covert agency (faction) that recruits these "Resonants"
- **First character archetypes identified:** Competent Loner (top-of-funnel converter), The Broken One (whale bait), Chaos Agent (virality/social). First character TBD — worldbuilding session in progress
- **Psychology layer:** Variable ratio reinforcement, near-miss effect, pity as sunk cost, free-to-play permission structure, character design archetypes — all documented in session 6 context. Bake into GDD when written.
- **P&L target:** Conservative scenario (~$5K/mo operating profit by Year 2) is the actual success target, not the floor
