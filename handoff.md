# Handoff File

_Last updated: 2026-03-03 (session 4)_

---

## Current Focus

Technical foundation is complete. Next immediate task is the **art direction & game concept session** — the first creative working session to lock visual identity, flagship IP concept, and visual style. All infra scaffolds are built and committed. **Operator strategy: frugal mode** — no artist spend (AI-generated art pipeline), no paid UA initially (organic/community-led growth).

---

## Recent Decisions

All decisions logged in full in `decisions-log.md`. Summary of locked decisions:

- **Market:** North America only at launch (EU deferred — GDPR + gacha law complexity)
- **Monetization:** Gacha IAP + Battle Pass (ads as floor revenue only)
- **Platform scope:** Full stack — discovery portal + original IP games + third-party dev ecosystem
- **Differentiators:** Original IP ownership, Fair Play Pledge (ethical gacha), western-native identity
- **Tech stack:** Phaser 3 (game engine) + PlayFab (backend/economy) + Stripe (payments)
- **Codename:** Yada — real brand name TBD
- **IP/trademark:** Deferred until flagship concept is locked in art direction session
- **Art approach:** AI-generated (fal.ai / Flux) — no hired artist at this stage
- **Growth approach:** Organic / community-led — no paid UA until proven retention

---

## Completed This Session (Session 4 — 2026-03-03)

### ✅ Phaser 3 Game Client Scaffold (commit `78778d6`)
13 files committed and pushed. Full client architecture:
- `game/package.json` — Phaser 3.87 + Vite 5.4, type: module
- `game/vite.config.js` — port 8080, `/api` proxy → Express :3000, Phaser split chunk
- `game/src/config.js` — GAME constants: PULL_COST=160, HARD_PITY=90, SOFT_PITY_START=74
- `game/src/main.js` — Phaser.Game, AUTO renderer, 7 scenes registered
- `game/src/scenes/` — Boot, Preloader, MainMenu (localStorage login), Game
- `game/src/ui/HUD.js` — gem + stamina, registry event listener
- `game/src/ui/GachaScreen.js` — pity state, x1/x10 pull buttons
- `game/src/ui/ShopScreen.js` — 6 product cards, Stripe redirect, gem refresh on resume
- `game/src/api/client.js` — fetch wrapper: loginPlayer, getProfile, executePull, getPityState, startCheckout, openBillingPortal

### ✅ Competitive Analysis + P&L Forecast
- File: `yada-competitive-analysis.docx`
- Sections: G123/CTW profile ($90.4M FY2025 rev, +32% YoY), Plarium, HoYoverse, feature matrix, positioning gap analysis, 3-scenario P&L (Conservative/Base/Bull) across 3 years
- Base case: Year 2 = $346K revenue / $158K net income; Year 3 = $1.11M / $598K net income
- Note: P&L cost assumptions should be revised for frugal mode (AI art replaces artist line; no UA budget initially)

### ✅ yada-ai-advisor Skill
- Skill package: `yada-ai-advisor.skill` — install via Cowork skill manager
- What it does: scans codebase, identifies AI surfaces, web-searches current tooling/pricing, produces prioritized .docx recommendations report
- Invoke by saying: "run the AI advisor" or any AI tooling question
- First report already generated: `yada-ai-advisor-report.docx`
- Top recommendations: Cursor ($20/mo) → Claude Haiku for NPC text → fal.ai Flux for image gen (~$0.008/image) → Vercel AI SDK for content pipeline → Braintrust for eval

---

## Open Threads

**Active tasks (in priority order):**
1. **Art direction & game concept session** — lock visual identity, genre tone, flagship IP (art style, character aesthetic, world/setting, combat feel, player fantasy). AI art pipeline means we can iterate fast in session.
2. **Stripe dashboard** — create 6 products, copy price IDs into `server/.env` (`STRIPE_PRICE_*` vars), configure webhook endpoint URL, add `STRIPE_WEBHOOK_SECRET`
3. **PlayFab economy setup** — create Economy catalog "Main" (upload `server/playfab/catalog-main.json`), enable player statistics (`pity_counter_*`, `total_pulls`, `player_level`)
4. **fal.ai account** — set up as core art pipeline tool (not optional — this is the artist replacement). Test Flux image gen with character reference workflow.

**Someday / deferred:**
- Platform name (real brand name, not "Yada")
- IP / trademark filing — after concept is locked
- GDPR / EU gacha compliance — Phase 2
- Developer platform / third-party SDK — Year 2
- Xsolla migration — revisit at ~$10K/mo or significant EU traffic
- Braintrust eval setup — Phase 2 (after content is generating)
- Pinecone personalization — post-launch

---

## Context / Notes

- **Workspace:** `C:\Users\rober\yada\` — GitHub remote is `https://github.com/dixob/yada`, push access configured (token in `.env`, credential store set, `safe.directory` added).
- **GitHub push:** Works directly from Cowork — no manual steps needed.
- **Skills available:** `yada-gdd`, `yada-ip-brief`, `yada-ai-advisor` — all accessible via skill invocations.
- **Memory** is intact at `memory/` — glossary, project context, and company context are all current.
- **Solo founder, no team.** All decisions are Robert's to make unilaterally.
- **Stripe scaffold:** `server/` — full Node.js/Express integration. Test keys in `server/.env`. Needs: products in dashboard, price IDs, webhook secret.
- **PlayFab scaffold:** `server/playfab/` — gacha, economy, player, client, routes, banner config, catalog JSON. Title ID: `AEE34`. Needs: catalog upload, player stats enabled.
- **Phaser client:** `game/` — runs locally with `npm run dev` (port 8080). Proxies `/api` to Express :3000.
- **Frugal mode decision (this session):** No hired artist — fal.ai/Flux for all art generation. No paid UA initially — organic/community growth. Revise P&L conservative scenario for planning; it's the most accurate model for current trajectory.
- **Psychology of gacha hooks** — documented in session. Key mechanisms: variable ratio reinforcement, near-miss effect, dopamine anticipation loop, loss aversion/FOMO, pity as sunk cost, completion compulsion, social proof, escalating commitment. All compatible with Fair Play Pledge. This informs retention mechanics design in GDD.
