# Part 2 submission links

Paste these into the Part 1 workflow document.

| Item | Link |
| --- | --- |
| Deployed web app (Vercel) | https://part2-load-automation.vercel.app |
| GitHub repo | https://github.com/bharuchi/part2-load-automation |
| Loom walkthrough (≤ 3 min) | _record and paste Loom URL here_ |

## Candidate email (hardcoded)

`taha_bharuchi@hotmail.com`

## Verified behavior

- **Fetch Loads** → `GET /api/fetch-loads` → Walmart `GET /api/sap/loads`
- Sanitization: trim whitespace, Freight Order → BOL, MMDDYYYY → DDMMYYYY, weight → integer lbs, AMBIENT → Dry Van 53', else → Reefer 53'
- **Sanitize & Push** → `POST /api/push-loads` → SHV `POST /api/sor/loads` (upsert by `load_number`)
- Mode/weight filters from Part 1 are intentionally **not** applied — all open tenders are fetched and pushed
- GitHub → Vercel auto-deploy confirmed on push to `main`
