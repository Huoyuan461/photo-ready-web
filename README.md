# PhotoReady Launch Workspace

`PhotoReady` is the first-launch web workspace for the B2C product plan in this repository. It is built as an English-first Next.js app and includes:

- a launch landing page
- a unified product catalog page at `/products`
- a live upload preview flow
- a local history page
- pricing and policy pages
- a founder-facing implementation plan page at `/ops`
- SEO starter pages for passport, LinkedIn, and resume-photo demand
- side-product storefront pages for PFMEA and lean packs
- local lead and analytics capture
- an optional bridge to the existing Python ID photo service in `../证件照制作Demo`
- a legacy ops dashboard at `/ops/legacy`

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- local JSONL capture in `data/`

## Local run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Implementation plan

Open `http://localhost:3000/ops` to review:

- the 12-month B2C execution roadmap
- channel priority and launch sequence
- revenue model and KPI targets
- staffing forecast from 1 person to a small team
- weekly Codex-driven execution rhythm

If you still want the earlier internal operations workspace, open:

- `http://localhost:3000/ops/legacy`

## Marketing skills and agent workflows

This project now includes:

- `photo-ready-web/.agents/skills/` copied from `coreyhaines31/marketingskills`
- `~/.codex/agents/` populated from `msitarzewski/agency-agents`

Supporting docs added in this repo:

- `docs/INDEPENDENT_SITE_ARCHITECTURE.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/AGENCY_AGENT_STACK.md`
- `docs/IMAGE2_LOGO_BRIEF.md`

## Optional enhanced cleanup

If you want stronger portrait cleanup than the browser draft preview:

1. Start the Python service in `../证件照制作Demo`
2. Keep `ID_ENGINE_URL=http://127.0.0.1:8767/api/process`
3. Use the `Try enhanced cleanup` action on `/preview`

## Environment

Copy `.env.example` to `.env.local` and fill what you need:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_COMPANY_LEGAL_NAME`
- `LEMON_SQUEEZY_CHECKOUT_URL`
- `LEMON_SQUEEZY_SUBSCRIPTION_URL`
- `LEMON_SQUEEZY_PFMEA_PACK_URL`
- `LEMON_SQUEEZY_LEAN_KIT_URL`
- `LEMON_SQUEEZY_OFFICE_CHECKLISTS_URL`
- `POSTHOG_KEY`
- `POSTHOG_HOST`
- `ID_ENGINE_URL`
- `DATA_DIR`
- `GITHUB_TOKEN`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_AUTO_SYNC_ORDERS`
- `GITHUB_PROJECT_ID`
- `GITHUB_PROJECT_STAGE_FIELD_ID`
- `GITHUB_PROJECT_DEPARTMENT_FIELD_ID`
- `GITHUB_PROJECT_REVENUE_FIELD_ID`
- `GITHUB_PROJECT_STAGE_OPTIONS_JSON`
- `GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON`
- `GITHUB_PROJECT_REVENUE_OPTIONS_JSON`

## Deployment

GitHub Pages is not the final hosting option for this app because it depends on API routes and server-side image processing.
Use the GitHub-first deployment guide instead:

- `docs/GITHUB_FIRST_DEPLOYMENT.md`
- GitHub Actions workflows in `.github/workflows/`

## Data files

During local development the app writes:

- `data/leads.jsonl`
- `data/analytics.jsonl`
- `data/orders.jsonl`
- `data/order-events.jsonl`
- `data/github-order-issues.jsonl`

This is intentional for first-launch validation. Replace it before public deployment.

## Legacy GitHub sync

The legacy ops dashboard can optionally push the latest generated order handoff into a
real GitHub issue, and can also keep a GitHub Project in sync with stage,
department, and revenue type when the project variables are configured.

Browser path:

- create an order on `/ops/legacy`
- advance or move the order through the queue if needed
- click `Push to GitHub` on that order card

CLI path:

```bash
npm run push:order:github -- ord_260724_xvor
```

This requires:

- `GITHUB_TOKEN`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`

Optional project automation:

- set `GITHUB_AUTO_SYNC_ORDERS=true` to sync after order creation and stage changes
- configure `GITHUB_PROJECT_ID`
- configure `GITHUB_PROJECT_STAGE_FIELD_ID`
- configure `GITHUB_PROJECT_DEPARTMENT_FIELD_ID`
- configure `GITHUB_PROJECT_REVENUE_FIELD_ID`
- provide JSON maps such as `GITHUB_PROJECT_STAGE_OPTIONS_JSON={"new":"<option-id>"}` and `GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON={"growth":"<option-id>"}`
- use `GET /api/github/bootstrap` to get the repository labels, Project fields, workflow inventory, and setup steps
- use `GET /api/github/bootstrap-package` to get a copy-ready bootstrap text package
- run `npm run export:github:bootstrap` to write a local Markdown bootstrap bundle into `data/exports/`
- use `GET /api/github/project-schema` to inspect Project fields and suggested mappings
- use `GET /api/github/env-template` to generate a copy-ready env snippet after Project lookup succeeds
- use `GET /api/ops/daily-report` or `npm run export:ops:report` for a markdown daily operating summary
- use `GET /api/ops/handoff-bundle` or `npm run export:handoff:bundle` for a combined founder/team handoff bundle
