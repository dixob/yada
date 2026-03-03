# Tasks

## Active

- [ ] **Set up Phaser 3 dev environment** - initialize project scaffold, confirm tooling works locally
- [ ] **PlayFab — finish economy config** - remaining items after initial setup
  - [ ] Create Economy catalog "Main" (can JSON upload via `server/playfab/catalog-main.json`)
  - [ ] Enable player statistics: pity_counter_*, total_pulls, player_level
- [ ] **Stripe — create products in dashboard** - create all 6 IAP products (Starter Pack, Battle Pass, Gem Packs x4), copy price IDs into `server/.env` (`STRIPE_PRICE_*` vars)
- [ ] **Stripe — configure webhook endpoint** - add `https://your-domain.com/api/stripe/webhook` in Stripe Dashboard → Developers → Webhooks, copy signing secret into `STRIPE_WEBHOOK_SECRET` in `server/.env`
- [ ] **Art direction & game concept session** - collaborative working session with Claude to lock visual identity, genre tone, and flagship concept
  - Covers: art style, character aesthetic, world/setting, combat feel, player fantasy

## Waiting On

## Someday

- [ ] **Name the platform** - choose real brand name (codename is Yada)
- [ ] **IP / trademark filing** - defer until flagship concept is locked
- [ ] **GDPR / EU gacha compliance** - revisit when expanding beyond US
- [ ] **Developer platform / third-party SDK** - Year 2 priority
- [ ] **Xsolla migration** - revisit at ~$10K/mo revenue or significant EU traffic

## Done

- [x] **Create Stripe account** - scaffold built at `server/` (config, checkout, webhooks, PlayFab bridge). Test keys saved to `server/.env`.
- [x] **Create PlayFab account + new title** - Title ID AEE34, secret key saved to `server/.env`. Currencies (GE, ST) created. Full server scaffold at `server/playfab/` (client, economy, player, gacha, routes).
