# Tasks

## Active

- [ ] **Set up Phaser 3 dev environment** - initialize project scaffold, confirm tooling works locally
- [ ] **Create PlayFab account + new title** - set up economy/gacha config, confirm free tier active
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
