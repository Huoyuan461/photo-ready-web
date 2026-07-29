# GitHub Operating System For Shanmu Software

This project now contains a lightweight open-source company operating model for the B2C product business.

## Departments

Use these department labels and owners consistently:

| Department | Lead | Default labels | Main responsibility |
| --- | --- | --- | --- |
| Growth | Founder / Growth Operator | `dept:growth`, `funnel`, `content` | traffic, funnel, launch, retention |
| Product | Founder / Product Lead | `dept:product`, `roadmap`, `pricing` | scope, pricing, roadmap |
| Engineering | Codex + Founder | `dept:engineering`, `automation`, `infra` | product build, automation, releases |
| Customer Success | Part-time Support / Ops | `dept:success`, `delivery`, `support` | delivery, QA, refund handling |
| Finance & Admin | Founder / Admin | `dept:finance`, `billing`, `reporting` | payouts, refunds, revenue logs |

## GitHub Project Field Model

Create a GitHub Project with these single-select fields:

- `Stage`: Intake, Qualified, Paid, Production, QA, Delivered, Retention
- `Department`: Growth, Product, Engineering, Customer Success, Finance & Admin
- `Revenue Type`: One-time, Subscription, Digital Pack
- `Priority`: P0, P1, P2

Recommended project views:

1. `Order Pipeline` board grouped by `Stage`
2. `Department Queue` board grouped by `Department`
3. `Revenue Reporting` table filtered by paid orders

## Issue Templates

Use these templates already committed in `.github/ISSUE_TEMPLATE/`:

- `order-intake.yml`
- `feature-request.yml`

`order-intake.yml` is the canonical manual fallback when an order did not come from the app.

## Automation Flows

### 1. App-driven order intake

The app route `POST /api/orders` does this:

- generates a normalized `orderId`
- assigns the stage owner department from the live pipeline
- writes an order snapshot to `data/orders.jsonl`
- writes an audit event to `data/order-events.jsonl`
- writes `data/github-order-issues.jsonl`
- returns a GitHub issue title, labels, and markdown body

The app route `GET /api/orders` returns the latest snapshot for each order so the
dashboard can render the current queue, including legacy local records.

The app route `PATCH /api/orders/[orderId]` supports the operating actions used
inside `/ops`:

- `advance`
- `rewind`
- `move`
- `complete`
- `reopen`

### 2. GitHub-driven normalization

The workflow `.github/workflows/order-intake-sync.yml` listens for issues with the `order-intake` label and adds a standardized operational comment.

### 2.5 Direct sync from the app

You can push a generated order payload into a real GitHub issue in two ways:

- POST `/api/github/sync-order`
- `npm run push:order:github -- <orderId>`

Required environment variables:

- `GITHUB_TOKEN`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`

Optional GitHub Project automation:

- `GITHUB_AUTO_SYNC_ORDERS=true`
- `GITHUB_PROJECT_ID`
- `GITHUB_PROJECT_STAGE_FIELD_ID`
- `GITHUB_PROJECT_DEPARTMENT_FIELD_ID`
- `GITHUB_PROJECT_REVENUE_FIELD_ID`
- `GITHUB_PROJECT_STAGE_OPTIONS_JSON`
- `GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON`
- `GITHUB_PROJECT_REVENUE_OPTIONS_JSON`

When these values are present, the sync layer can:

- create or update the matching GitHub issue
- remember the local order to GitHub issue mapping
- add the issue to a GitHub Project v2
- update single-select fields for stage, department, and revenue type
- auto-sync after order creation or stage transition when enabled
- expose a GitHub bootstrap manifest through `/api/github/bootstrap`
- inspect the GitHub Project field schema through `/api/github/project-schema`
- generate a copy-ready env template through `/api/github/env-template`

### 3. Retention follow-up

The workflow `.github/workflows/retention-followup.yml` can be triggered manually after delivery to post a retention checklist to the issue.

Additional workflow skeletons committed in this repo:

- `.github/workflows/order-paid-transition.yml`
- `.github/workflows/delivery-qa-comment.yml`

These give you a starter operating model for moving a paid order into
fulfillment and for posting QA and delivery checklists without waiting for a
fully custom GitHub App.

## App Queue Behavior

Inside `/ops`, each live order card now exposes:

- current stage and owning department
- next operational action
- one-click advance to the next stage
- rewind for exception recovery
- manual stage override for edge cases
- product-aware fulfillment automation that can run the remaining standard stages
- complete / reopen controls
- per-order GitHub sync
- recent event timeline from local order history

This means the app is now the local source of truth for day-to-day execution,
while GitHub remains the outward-facing project and issue system.

## Recommended Project Option Keys

Use these keys in your JSON env maps so the app can translate local order state
into GitHub Project options:

- Stage keys: `new`, `qualified`, `paid`, `production`, `qa`, `delivery`, `retention`
- Department keys: `growth`, `product`, `engineering`, `customer-success`, `finance`
- Revenue keys: `one-time`, `subscription`, `digital-pack`

## Recommended Operating Rhythm

### Daily

- Growth reviews new intakes and funnel anomalies
- Finance confirms payout and refund mismatches
- Customer Success clears QA and delivery blockers

### Weekly

- Product reviews conversion feedback and top issue clusters
- Engineering reviews automation gaps and release tasks
- Growth reviews retention and referral conversion

## Order Completion Definition

An order is considered complete only when all of the following are true:

1. Payment is confirmed
2. The deliverable or download entitlement is ready
3. Customer Success has cleared QA
4. Delivery confirmation is sent
5. A retention follow-up or upsell task exists

That definition is the same in the app dashboard and GitHub workflow.
