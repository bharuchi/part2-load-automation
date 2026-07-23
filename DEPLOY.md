# Vercel deployment

## Option A — GitHub + Vercel (recommended for auto-deploy)

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project** → import the repo.
3. Framework Preset: **Other**. Root directory: project root.
4. Deploy. Every push to `main` auto-deploys.
5. Copy the production URL into `SUBMISSION.md` and the Part 1 workflow document.

## Option B — Vercel CLI

```bash
npx vercel login
npx vercel
npx vercel --prod
```

## Candidate email

Hardcoded in `api/_shared.js` and shown in the UI:

`taha_bharuchi@hotmail.com`
