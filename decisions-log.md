# Decisions Log — Project Yada

Running log of all major strategic and product decisions. Append new entries at the bottom with date and rationale.

---

## Format

```
### [YYYY-MM-DD] — Decision Title
**Decision:** What was decided
**Rationale:** Why
**Alternatives considered:** What else was on the table
**Status:** Final / Revisit by [date]
```

---

## Log

### 2026-03-02 — Target Market: North America + Western Europe First

**Decision:** Launch targeting North America and Western Europe, not Japan or Southeast Asia.
**Rationale:** G123 dominates Japan. SEA is high-growth but lower ARPU and requires different localization. NA/WE has the highest ARPU for gacha, clear whitespace in original-IP browser RPG, and is Robert's home market.
**Alternatives considered:** Global launch from day 1 (rejected — too resource-intensive for solo founder), Japan first (rejected — G123's home turf), SEA first (rejected — lower ARPU, different cultural fit).
**Status:** Final

---

### 2026-03-02 — Primary Monetization: Gacha IAP + Battle Pass

**Decision:** Core revenue model is gacha IAP (character banners) with a battle pass as the conversion engine. Ads are floor revenue only.
**Rationale:** Gacha market growing at 15% CAGR vs. 6% for HTML5 overall. G123 has proven the model on browser. Western market adoption accelerating. Ad-only models (Poki, CrazyGames) have low LTV.
**Alternatives considered:** Ad-only (rejected — low ARPU ceiling), subscription-only (rejected — too high friction for F2P acquisition), premium (rejected — conflicts with browser-game instant-play UX).
**Status:** Final

---

### 2026-03-02 — Platform Scope: Full Stack (Discovery + Publishing + Dev Ecosystem)

**Decision:** Build the full platform — not just one game, but a game portal with original IP titles plus a third-party developer ecosystem.
**Rationale:** Competing with G123 requires platform-level scale. A single game is a product; a platform is a business. Developer ecosystem creates compounding catalog growth without 100% internal dev cost.
**Alternatives considered:** Single game studio only (rejected — too narrow, no platform moat), publisher-only like G123 (rejected — no IP equity, licensing risk), ad-based portal like Poki (rejected — wrong monetization model).
**Status:** Final

---

### 2026-03-02 — Strategic Differentiation: Original IP + Fair Play Pledge + Western Identity

**Decision:** Core differentiators vs. G123 are: (1) original IP we own outright, (2) a "Fair Play Pledge" on gacha ethics, (3) western-native art style and cultural identity.
**Rationale:** G123 cannot pivot to original IP (structurally locked into licensing). No platform in this space owns the "ethical gacha" brand in the West. Western players are underserved by Japanese-first design.
**Status:** Final

---

### 2026-03-02 — Project Codename: Yada

**Decision:** Internal codename is "Yada" pending selection of a real brand name.
**Rationale:** Needs a handle for memory, files, and planning references. Platform name candidates TBD.
**Status:** Codename only — real name TBD

---

### 2026-03-02 — Tech Stack: Phaser 3 + PlayFab

**Decision:** Game engine is Phaser 3. Backend is PlayFab (Azure).
**Rationale:** Phaser 3 is the most mature HTML5 RPG engine with strong community support and solid AI code-gen coverage. PlayFab has a built-in gacha/economy system, server-side RNG (critical for provably fair pulls), and a 10K DAU free tier — avoids building a game economy backend from scratch as a solo founder.
**Alternatives considered:** Cocos2d-JS (g123's stack — less Western community), PixiJS custom (too much boilerplate), Godot 4 web export (web target still maturing).
**Status:** Final

---

### 2026-03-02 — Launch Scope: US Only (Phase 1)

**Decision:** Launch targeting the US market only. GDPR and EU gacha regulation deferred.
**Rationale:** Simplifies legal and compliance surface area. US has no federal gacha law and no GDPR equivalent. Allows faster launch without expensive international legal scaffolding. EU expansion planned for Phase 2.
**Alternatives considered:** US + Western Europe simultaneously (rejected — GDPR compliance and BE/NL gacha law require significant upfront legal work not worth it pre-traction).
**Status:** Final — revisit at meaningful EU traffic

---

### 2026-03-02 — Payment Processor: Stripe

**Decision:** Stripe for payment processing at launch.
**Rationale:** Simplest integration for a US-only launch. Lower fees than Xsolla (~2.9% vs ~5%). Excellent developer tooling.
**Alternatives considered:** Xsolla (better for global/EU at scale — revisit at ~$10K/mo revenue), PayPal (weaker for recurring/subscription).
**Status:** Final — revisit Xsolla migration at scale

---

### 2026-03-02 — IP Strategy: Defer Concepting

**Decision:** Flagship IP concept and trademark filing deferred. Art direction to be determined via collaborative working session.
**Rationale:** Tech stack and scope decisions take priority. IP filing requires a finalized concept and brand name. Art direction needs to be right before building anything visual.
**Status:** Deferred — art direction session scheduled as next active task

---

---

### 2026-03-03 — Strategic Mission Clarification

**Decision:** Yada is explicitly a dual-purpose project: (1) a platform for Robert to conduct applied AI research and prove research value, and (2) a sustainable indie game business targeting ~$5K/month in returns.

**Rationale:** Growth is desirable but not the primary goal. The research mission requires a live game with real player data — enough to run statistically meaningful AI experiments (personalization, content generation quality, retention mechanic testing, spend pattern analysis). ~3K–7K MAU provides adequate signal. $5K/mo covers operating costs and sustains the founder without external funding pressure.

**Implications:**
- Success criteria is "small but profitable and representative," not "maximize revenue"
- VC / external capital not needed or wanted — keeps research autonomy intact
- Player base needs enough behavioral diversity (whales, dolphins, minnows) to support AI research, so some growth is still necessary — but as a research enabler, not a business target
- Conservative P&L scenario (~$5K/mo operating profit by Year 2) is the actual target mode, not the floor
- Frugal operating model (AI art, organic UA) is correct and aligned with mission
- Platform should be designed to instrument AI experiments from day one (data capture, A/B frameworks, LLM evaluation hooks)

**Status:** Final — core strategic frame for all subsequent decisions
