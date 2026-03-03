# Yada — Launch Readiness Breakdown
_March 2026 — Solo Founder, Pre-Code_

---

## The Honest Truth First

You're asking what it takes to reach thousands of DAU competing with g123. The direct answer: it's achievable solo with AI tooling, but it will take 12–18 months of disciplined execution, and the bottleneck will never be code or legal — it will always be **game quality**. Players don't care about your architecture. They leave if the game isn't fun in the first 10 minutes.

Everything below serves one goal: ship a game that hooks players fast enough to retain them, with infrastructure that doesn't embarrass you or get you shut down.

---

## 1. Legal & Compliance — Non-Negotiables

These aren't optional and several have long lead times or real shutdown risk.

### Gacha / Loot Box Regulation
- **Belgium and Netherlands** have effectively banned randomized loot boxes with real-money value. Don't serve these markets at launch, or implement a "direct purchase" alternative path alongside gacha (players can buy specific characters for a fixed price).
- **UK** is under active review but not yet banned. Watch this closely. The Fair Play Pledge (pity disclosure, transparent odds) is your best legal shield.
- **US** has no federal loot box law as of 2026, but Washington state and others have proposed legislation. Disclosed odds + pity = defensible position.
- **Action:** Add geo-blocking or a direct-purchase alternative for BE/NL. Document your odds publicly before launch.

### Data & Privacy
- **GDPR** applies the moment a single EU resident plays. You need a compliant privacy policy, cookie consent banner, a way to handle data deletion requests, and a data processing agreement with any vendor that touches user data (your backend provider, analytics, payment processor).
- **COPPA** (US) requires age gating. If you have any mechanism that could identify a user as under 13, you need explicit parental consent flows. Simplest path: a ToS that states 13+ minimum and a date-of-birth check at registration.
- **Action:** Use a privacy policy generator (Termly or iubenda) as a starting point, but have a lawyer review before launch. Budget ~$500–1500 for this. It is worth it.

### Payment & Financial
- **Stripe** is the cleanest payment processor for web games but does require you to classify your business correctly. Gacha falls under digital goods / gaming. Enable Stripe Radar for fraud protection from day one.
- **Xsolla** is the gaming-native alternative — it handles global currencies, tax compliance in 200+ countries, and is what most mid-size browser games use. Higher fees (~5%) but dramatically less compliance headache.
- **Tax:** At meaningful revenue, you'll owe VAT in the EU on digital goods even as a US company. Xsolla handles this automatically. Stripe requires you to configure it manually.
- **Action:** Start with Stripe for simplicity. Migrate to Xsolla when you approach $10K/mo revenue or significant EU traffic.

### Intellectual Property
- **Trademark your brand name** before you launch publicly. INTA search + USPTO filing = ~$300 + attorney fees. Do this once you choose your real platform name.
- **Register your flagship IP characters as copyrights.** Already yours by creation in the US, but registration enables statutory damages in infringement suits. File when the designs are finalized.
- **Terms of Service** need to cover: user-generated content (if any), virtual currency (non-refundable, no cash value), account suspension rights, governing law.

---

## 2. Technical Architecture — Decisions to Lock First

You can't build until you've decided these. Each choice has cascading consequences.

### Game Engine (Lock This Week)
| Engine | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Phaser 3** | Most mature HTML5 RPG engine; huge community; Claude knows it well | 2D only; not ideal for 3D scenes | **Recommended** for your scope |
| **Cocos2d-JS** | g123 uses this; proven at scale; mobile-first | Smaller Western community; less Claude training data | Good if you want to study g123 internals |
| **PixiJS + custom** | Maximum performance for 2D | No built-in game systems; 3x more boilerplate | Only if you have strong engine dev background |
| **Godot 4 (web export)** | Full game engine; free; growing fast | Web export is still maturing; larger bundle sizes | Watch for 2026 — not ready for production yet |

**Recommendation:** Phaser 3. It has the most published gacha/RPG games built on it, Claude can help you with it directly, and it runs well at scale in browsers.

### Backend (Lock This Week)
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **PlayFab (Azure)** | Built-in economy, gacha, leaderboards, live ops, analytics, 10K DAU free tier | Azure dependency; some vendor lock-in | **Recommended** for solo founder |
| **Supabase + custom** | Open source, flexible, cheap | You build everything yourself — economy, gacha, analytics | Too much infrastructure work solo |
| **Firebase** | Easy to start | NoSQL only; not great for complex game economy; costs spike fast | Avoid for gacha |

**Recommendation:** PlayFab. It has a gacha/economy system built in, handles server-side RNG (critical for provably fair pulls), and has a 10K DAU free tier. You don't want to build a gacha economy backend from scratch — it's months of work and gets you nothing except maintenance burden.

### Critical Architecture Decisions
- **All gacha pulls must be server-side.** Client-side RNG is exploitable and destroys economy integrity. PlayFab handles this.
- **Pity counters must persist server-side.** Never in localStorage. A player who loses their pity counter will never spend again.
- **Asset delivery via CDN.** Cloudflare R2 or AWS S3 + CloudFront. A Phaser 3 game with 20 characters can easily be 100-300MB of assets. Players won't wait for a slow load.
- **Progressive asset loading.** Load the tutorial assets, then lazy-load everything else. First interaction in under 3 seconds.
- **Auth:** Discord OAuth + Google OAuth + guest mode. Guest accounts must be upgradeable to persistent accounts without losing progress. This is a retention-critical feature.

---

## 3. MVP Scope — What "Launch" Actually Means

This is where solo founders kill themselves by over-building. Here's the minimum viable gacha RPG that can generate real DAU and real revenue:

### Flagship v0.1 — The Vertical Slice (Get This First)
Before you build anything else, build 15 minutes of a great game. One zone, one combat loop, 3 characters. No gacha yet. This is your proof of concept and your first retention test. If players don't want to keep going after 15 minutes, nothing else matters.

### Flagship v1.0 — Closed Beta Requirement
| System | What's Required | What's Not Required Yet |
|--------|----------------|-------------------------|
| Combat | Core loop — at least 30 min of engaging content | End-game content |
| Characters | 12–20 at launch (enough for meaningful pulls) | 50+ character roster |
| Gacha | 1 permanent banner + 1 limited banner | Multiple simultaneous banners |
| Monetization | Battle pass + gem packages + pity system | All cosmetic variants |
| Story | Acts 1–2 of main story | Full campaign |
| Daily engagement | Daily quests + login reward | Guild systems, PvP |
| Social | Player profile + basic achievements | Leaderboards, guilds, chat |
| Analytics | Funnel tracking, monetization events, session length | Full BI pipeline |

### What to Cut (Seriously)
- **Developer platform / third-party SDK:** Build this in Year 2. You need a proven game first.
- **Mid-tier titles 2 and 3:** Ship one great game before you spread across multiple.
- **PvP / guild systems:** Retention risk — bad implementation hurts more than helps. Post-launch.
- **Native app / PWA push notifications:** Nice to have, not launch-critical.

### The DAU Math
To hit thousands of DAU, you need roughly:
- 50,000+ registered users (5–10% 30-day D30 retention is realistic for quality gacha)
- Strong enough word-of-mouth or paid UA to sustain acquisition
- D1 retention above 40% (industry average for gacha is 35–45%)
- Enough content to keep D30 players engaged (daily quests, story chapters, limited banners)

---

## 4. AI Leverage — Your Actual Competitive Edge

This is where you beat g123, not by having more headcount, but by moving faster per person. Here's where AI actually works and where it doesn't.

### Where AI Gives You Real Leverage

**Code (High Value)**
Claude can write Phaser 3 game systems, PlayFab integration code, UI components, and battle pass logic directly. A skilled solo dev with Claude can output 3–5x the code of a solo dev without it. The key is writing clear specs before you prompt — garbage in, garbage out.

**QA Automation (High Value — your g123 angle)**
This is the AI research application you were building toward. Claude agents can generate test cases, simulate player sessions, catch economy exploits, and flag balance issues before they ship. For a gacha game, economy bugs (infinite currency, broken pity) are existential. AI-assisted QA is a genuine competitive moat.

**Content at Scale (High Value)**
Character dialogue, quest text, story chapters, item descriptions — all Claude-generatable from a design brief. A gacha game needs hundreds of thousands of words of content. AI gets you there without a writing team.

**Art Pipeline (Medium Value)**
AI image generation (Midjourney, Flux, Stable Diffusion) can produce character concept art, background environments, UI elements, and icon sets. This doesn't replace a lead artist — you still need someone with taste to direct and refine — but it cuts art costs from $200K+ to $20–50K range.

**Live Ops (Medium Value)**
Event planning, limited banner scripts, patch note drafts, balance analysis — Claude can assist with all of it. This is where g123's team has a staffing advantage you can narrow.

**Analytics Interpretation (Medium Value)**
Feeding your Amplitude/PlayFab data to Claude for retention analysis, funnel drop-off interpretation, and spend pattern analysis. Not a replacement for a data analyst, but functional for solo operations.

### Where AI Doesn't Help
- **Game feel.** No AI can tell you if your combat feels satisfying. You have to play it.
- **Art direction.** AI can generate; it can't curate. You need a visual identity that's consistent and intentional.
- **Community.** Discord moderation, player relationship building, responding to feedback — this is human work.

---

## 5. Sequencing — The Right Order

Given zero code today, here's the honest timeline to thousands of DAU:

**Months 1–2: Foundations**
- Lock tech stack (Phaser 3 + PlayFab)
- Finalize flagship IP concept and visual identity
- Set up legal scaffolding (ToS, Privacy Policy, entity formation if not done)
- Build first playable prototype — one combat encounter with one character

**Months 3–5: Vertical Slice**
- Playable 15-minute experience
- 3–5 characters, one zone, basic progression
- No gacha yet — validate the core loop first
- First 20–50 playtesters (friends, Reddit, Discord)

**Months 6–9: Closed Beta Build**
- Gacha system + pity (server-side via PlayFab)
- Battle pass v1
- 12–20 characters, 2 story acts, daily quests
- Discord community (start this at Month 3, not Month 9)
- Stripe payment integration
- First paid UA test ($500–1000 on Reddit/TikTok) to validate CAC

**Months 10–12: Open Beta**
- Fix everything the closed beta broke
- 50K+ registered target
- Xsolla migration if EU traffic is meaningful
- First limited-time banner / live ops event
- Analytics fully instrumented

**Month 13–18: v1.0 Launch**
- Stable DAU in thousands
- Content cadence locked (character every 6 weeks)
- Profitable or on a clear path

---

## Summary: The Honest Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Game isn't fun | 🔴 Existential | Ruthless playtesting before monetization |
| Economy exploit ships | 🔴 Existential | Server-side everything; AI QA |
| Legal action (EU gacha laws) | 🟠 High | Geo-block BE/NL; Fair Play Pledge; document odds |
| GDPR non-compliance | 🟠 High | Proper privacy policy + consent before first EU user |
| Burnout (solo) | 🟠 High | Scope ruthlessly; ship the vertical slice before adding systems |
| PlayFab costs at scale | 🟡 Medium | Free to 10K DAU; reassess at 25K+ |
| Art quality gap vs. g123 | 🟡 Medium | AI gen + strong art direction; original IP doesn't need anime-quality assets |

---

_Last updated: 2026-03-02_
