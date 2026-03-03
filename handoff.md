# Handoff File

_Last updated: 2026-03-03 (session 3)_

---

## Current Focus

Phase 1 setup — getting the technical foundation in place before any game or IP work. Next immediate task is the **art direction & game concept session** (first creative working session to lock visual identity and flagship concept). All infra tasks (Phaser 3, PlayFab, Stripe) are queued and unblocked.

---

## Recent Decisions

All decisions are logged in full in `decisions-log.md`. Summary of locked decisions:

- **Market:** North America only at launch (EU deferred — GDPR + gacha law complexity)
- **Monetization:** Gacha IAP + Battle Pass (ads as floor revenue only)
- **Platform scope:** Full stack — discovery portal + original IP games + third-party dev ecosystem
- **Differentiators:** Original IP ownership, Fair Play Pledge (ethical gacha), western-native identity
- **Tech stack:** Phaser 3 (game engine) + PlayFab (backend/economy) + Stripe (payments)
- **Codename:** Yada — real brand name TBD
- **IP/trademark:** Deferred until flagship concept is locked in art direction session

---

## Open Threads

**Active tasks (in priority order):**
1. Art direction & game concept session — lock visual identity, genre tone, flagship concept (art style, character aesthetic, world/setting, combat feel, player fantasy)
2. Set up Phaser 3 dev environment — scaffold project, confirm local tooling
3. Create PlayFab account + new title — economy/gacha config, confirm free tier
4. ~~Create Stripe account~~ → **DONE (partial)** — integration scaffold built at `server/`. Remaining: create products in dashboard, fill in `STRIPE_PRICE_*` env vars, configure webhook endpoint URL, get `STRIPE_WEBHOOK_SECRET`

**Someday / deferred:**
- Platform name (real brand name, not "Yada")
- IP / trademark filing — after concept is locked
- GDPR / EU gacha compliance — Phase 2
- Developer platform / third-party SDK — Year 2
- Xsolla migration — revisit at ~$10K/mo or significant EU traffic

---

## Context / Notes

- **Workspace:** `C:\Users\rober\yada\` — moved off OneDrive this session. GitHub remote is `https://github.com/dixob/yada`, push access configured (token in `.env`, credential store set, `safe.directory` added for this path).
- **GitHub push:** Now works directly from Cowork — no manual steps needed going forward.
- **Skill files** (`yada-gdd`, `yada-ip-brief`) live in the Cowork skills system — accessible via skill invocations as normal.
- **Memory** is intact at `memory/` — glossary, project context, and company context are all current.
- Solo founder, no team. All decisions are Robert's to make unilaterally.
- **Stripe scaffold:** `server/` directory contains full Node.js/Express integration — config, checkout, webhooks, PlayFab bridge. Test keys are in `server/.env`. Still needs: products created in dashboard, price IDs filled in, webhook secret added.
