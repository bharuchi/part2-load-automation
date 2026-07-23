# Loom script — SHV Load Builder (under 3 minutes)

## Before recording

1. Open the deployed SHV Load Builder in one tab.
2. Keep the Walmart and SHV API documentation open in background tabs if you want to reference them.
3. Start the Loom recording with the app visible.

## Script

“Hi, I’m Taha. For this case, I automated the workflow of taking open Walmart freight tenders and building them in SHV’s TMS.

The app has two actions. The first is **Fetch Loads**. This calls the Walmart tender API using the candidate email as the bearer token. It fetches every open tender, rather than filtering based on mode or weight.

Before anything is sent to SHV, the app sanitizes every record based on the workflow rules. The Walmart load number becomes the SHV load number; the Walmart freight order number becomes the BOL number; city and state values map to their matching SHV fields; and Walmart’s MMDDYYYY dates are converted into the DDMMYYYY format that SHV requires.

It also converts a formatted weight such as ‘41,860 lbs’ into the number 41860. For equipment, AMBIENT becomes Dry Van 53’, while freezer and refrigerated modes become Reefer 53’. This keeps the payload valid while allowing every fetched record to be processed, as requested in the case.

After reviewing the sanitized preview table, I click **Sanitize & Push**. The app sends the complete batch to SHV’s SOR API. SHV handles these requests as upserts by load number, so a retry safely overwrites the same record instead of creating a duplicate.

I kept the candidate email on the server side of the app rather than exposing it in the browser request. I also included visible counts for fetched, ready, and accepted loads, plus clear API error feedback.

I enjoyed the exercise because it turned a repetitive side-by-side workflow into a small, inspectable system with explicit transformations and safe retry behavior. Thanks for watching.”

## Recording checklist

- Start on the ready state, then click **Fetch Loads**.
- Pause briefly on the sanitized preview; call out BOL, dates, weight, and equipment mappings.
- Click **Sanitize & Push** and show the accepted count or response.
- Keep the recording under three minutes.
