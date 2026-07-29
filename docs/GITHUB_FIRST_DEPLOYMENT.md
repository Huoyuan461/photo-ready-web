# GitHub-First Deployment

Date: 2026-07-29

This project cannot use GitHub Pages as the final host because it includes Next.js API routes and server-side image processing.
The GitHub-first path is:

1. GitHub repository as the source of truth
2. GitHub Actions for build and deployment automation
3. Vercel as the runtime host for the Next.js app

## 1) Local prep

Run these commands from the project root:

```bash
cd /Users/huoyuan/Documents/软件开发公司/photo-ready-web
npm ci
npm run lint
npm run build
```

## 2) Create the GitHub repo and push

Use your own GitHub repo URL in the `origin` line:

```bash
git remote add origin https://github.com/<your-username>/photo-ready-web.git
git branch -M main
git add .
git commit -m "Prepare GitHub-first launch" || true
git push -u origin main
```

If the repo already exists locally with a different remote, inspect it first:

```bash
git remote -v
```

## 3) Connect Vercel

In Vercel, import the GitHub repository and set these environment variables:

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
- `IMAGE_PROVIDER`
- `OPENAI_IMAGE_TIMEOUT_MS`
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

## 4) Deployment automation

If your GitHub credentials have `workflow` scope, you can add GitHub Actions deployment later.
Without that scope, keep the repository as the source of truth and deploy through Vercel import or another Next.js host.

Recommended secrets for later automation:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 5) Production checks

After deployment, verify:

- `/` loads correctly
- `/products` loads correctly
- `/preview` can upload and generate
- `/pricing`, `/privacy`, `/refund`, and `/support` load correctly
- mobile layout does not overlap
- checkout links resolve
