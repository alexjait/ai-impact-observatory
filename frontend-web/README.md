This is the `frontend-web` application for the AI Impact Observatory MVP.

## Local development

The frontend expects the Nest backend to be available at `http://localhost:3001`.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## First implemented wave

- public home
- activity catalog with filters
- activity detail
- methodology page
- login and register
- Google auth entry point
- social signup completion screen
- auth conflict screen
- forgot and reset password screens
- evidence detail route
- private proposal inbox
- new activity proposal form
- new evidence proposal form
- edit activity and evidence proposals while they remain pending
- real comments and reporting in public detail pages
- authenticated profile screen backed by the real session cookie
- real backoffice dashboard for operational roles
- moderation queue UI for proposals, reported comments and seed activities
- editorial workspace UI for imported activities
- dedicated backoffice CRUD screens for activities and evidence
- bilingual editorial summary update from the browser
- official AI status and editorial status update from the browser
- evidence reliability marking from the editorial workspace
- activity and evidence creation/editing with bilingual structural fields, taxonomies, source metadata and archive/publish actions
- moderation and editorial filtering with pagination
- visible moderation search with inline proposal detail
- richer bilingual source context inside the editorial workspace
- editorial list filters for summary, evidence, AI status and taxonomy
- previous / next editorial navigation inside the active lane
- multi-select editorial queue with bulk status actions
- editorial readiness board and queue diagnostics for faster seed review
- workspace shortcuts to save and keep moving through the editorial lane
- follow-through panel with direct shortcuts to target lanes and ready queues
- public catalog cleanup with lighter tone, stronger layout, visible active filters and pagination
- clearer public cards with activity key and more resilient text handling
- richer moderation queue cards for comments, showing related activity or evidence context
- clickable moderation target blocks that open the related public activity detail
- activity detail CTA to propose new evidence with preselected activity
- clearer activity summary copy and lighter public contribution copy
- optional hiding of public comments/reporting from backoffice while keeping evidence contribution available
- evidence proposal form simplified to one input locale with automatic translation to the other locale
- proposal inbox statuses localized and correction flows re-opened for editing

## Notes

- Browser auth calls are sent directly to the backend with `credentials: include`.
- The backend must allow CORS with credentials for `http://localhost:3000`.
- Locale is handled as a query parameter for this first wave: `?locale=en` or `?locale=es`.
- Proposal forms now submit against the live MVP contribution endpoints.
- The proposal inbox uses locale-aware contribution endpoints and shows real proposal statuses.
- A reproducible browser smoke is available with `npm run smoke:ui`.
- A dedicated backoffice browser smoke is available with `npm run smoke:backoffice`.
- The smoke now covers anonymous guard checks, disabled Google messaging, social-signup missing-context error, login with `returnTo`, proposal submission, proposal editing, activity comment, Spanish public detail, evidence comment, reply, report, screenshots and JSON execution report.
- The public catalog now exposes active filters, quick entry views and pagination without changing backend contracts.
- Public activity and evidence detail pages now respect the backoffice switch that hides public comments and reports.
- The backoffice smoke covers dashboard access, moderation of a seeded evidence proposal, resolution of a reported comment, editorial workspace entry and bilingual summary save.
- The backoffice smoke now also covers anonymous backoffice guard, visible queue search, inline proposal inspection, editorial queue filtering, guarded bulk approval feedback, successful bulk editorial action and lane-aware workspace copy.
- The backoffice smoke now also verifies that reported comments can be found by related activity and show enriched target context.
- The UI smoke now also covers activity-detail-to-evidence-proposal navigation with the related activity preselected.
- Backoffice screens require `EDITOR`, `MODERATOR` or `ADMIN` roles on the authenticated account.
- Editorial screens preserve queue state when you move from the list into a workspace and back again.
- Backoffice now includes dedicated routes for catalog CRUD:
  - `/backoffice/activities`
  - `/backoffice/activities/new`
  - `/backoffice/activities/:id`
  - `/backoffice/evidence`
  - `/backoffice/evidence/new`
  - `/backoffice/evidence/:id`

## Pending next waves

- contribution flow polish around editing and moderation changes
- richer moderation detail and deeper editorial workflows
- locale routes instead of query-param locale
