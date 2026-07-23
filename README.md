# SHV Load Builder

Two-button Vercel web app for the Part 2 Runbook case.

## Behavior

- **Fetch Loads** calls Walmart's open-tender API with the hardcoded candidate email (`taha_bharuchi@hotmail.com`), then maps and sanitizes every returned tender.
- **Sanitize & Push** posts the resulting batch to SHV's SOR API. SHV treats each post as an upsert keyed by `load_number`.
- Part 1 mode/weight filters are **not** applied — every open tender is fetched and pushed.

## Project layout

```
index.html / styles.css / app.js   # frontend
api/fetch-loads.js                 # proxy + sanitize Walmart tenders
api/push-loads.js                  # proxy push to SHV
api/_shared.js                     # email, field mapping, upstream auth
```

## Run locally

```bash
npx vercel dev
```

## Deploy

See `DEPLOY.md`. After deploy, paste the production URL and Loom link into `SUBMISSION.md` and the Part 1 workflow document.
