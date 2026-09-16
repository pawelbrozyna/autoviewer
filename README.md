# AutoViewer

Fast, trustworthy UK vehicle checks for used-car buyers.

**Live domain:** [https://autoviewer.co.uk](https://autoviewer.co.uk)

AutoViewer helps people check MOT history, tax/SORN status, mileage readings, available recall indications and core vehicle details - presented clearly, without clutter, dark patterns or fake urgency.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Lucide React icons
- `next/font` (Inter)
- `next/image`

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful scripts:

```bash
npm run lint
npm run build
npm start
```

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (default `https://autoviewer.co.uk`) |
| `NEXT_PUBLIC_ENABLE_AUTH` | Show Sign in UI when `true` (no fake auth implemented) |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID (cookieless Consent Mode; omit to disable) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Hostinger SMTP connection settings (server-only) |
| `SMTP_USER`, `SMTP_PASSWORD` | Hostinger SMTP credentials (server-only) |
| `MAIL_REPORTS_FROM`, `MAIL_SUPPORT_FROM`, `MAIL_REPLY_TO` | Report and support sender identities (server-only) |
| `MAINTENANCE_MODE` | `true` shows coming-soon page to public visitors (bypass with `?admin=true`) |
| `USE_MOCK_DATA` | `true` returns clearly labelled demo vehicles |
| `DVLA_API_KEY` | DVLA Vehicle Enquiry Service key (server-only) |
| `DVLA_API_URL` | DVLA VES endpoint |
| `DVSA_MOT_CLIENT_ID` / `SECRET` / `TENANT_ID` | MOT History API OAuth credentials |
| `DVSA_MOT_API_KEY` | MOT History API key |
| `DVSA_MOT_API_URL` | MOT API base URL |
| `DVSA_MOT_SCOPE` | OAuth scope (default `https://tapi.dvsa.gov.uk/.default`) |

Never put government API keys in client code.

## Mock mode

With `USE_MOCK_DATA=true` (default locally), these demo registrations work:

- `AB12 CDE` - sample Volkswagen Golf
- `CD34 EFG` - sample Ford Focus

Demo results are labelled **Demo data** / **Example report** and are not live government information.

## Project structure

```text
app/                 Routes, layout, sitemap, robots, API
components/
  layout/            Header, footer, brand logo
  ui/                Shared UI primitives
  vehicle/           Registration, MOT, mileage, comparison
  tools/             Checker landing + running costs
  home/              Homepage sections
  guides/            Guide layout
lib/
  api/               DVLA, DVSA, mock, vehicle service, provenance interface
  vehicle/           Registration helpers, score, mileage
  seo/               Metadata + JSON-LD helpers
  analytics.ts       GA4 event helpers (safe when GA ID unset)
types/               Shared domain types
public/              header.png, autoviewer.png
```

## Available routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/check-a-vehicle` | Main registration checker |
| `/mot-history` | MOT landing page |
| `/car-tax-check` | Tax / SORN landing page |
| `/mileage-check` | Mileage landing page |
| `/recall-check` | Recall landing page |
| `/vehicle-details` | Specs landing page |
| `/compare-cars` | Side-by-side comparison |
| `/running-costs` | Ownership cost calculator |
| `/guides/*` | Buying guides |
| `/vehicle/[registration]` | Result page (`noindex,follow`) |
| `/about` `/contact` `/privacy` `/terms` | Company / legal |

API: `GET /api/vehicle?registration=AV19SWF`

## Configuring DVLA / DVSA later

1. Register for the **current** MOT History API:  
   [https://documentation.history.mot.api.gov.uk/](https://documentation.history.mot.api.gov.uk/)
2. Register / obtain DVLA Vehicle Enquiry Service access:  
   [https://developer-portal.driver-vehicle-licensing.api.gov.uk/](https://developer-portal.driver-vehicle-licensing.api.gov.uk/)
3. Add credentials to `.env.local`
4. Set `USE_MOCK_DATA=false`

Adapters live in:

- `lib/api/dvla.ts`
- `lib/api/dvsa.ts`

Domain mapping stays in `lib/api/vehicle-service.ts` so UI code does not depend on raw provider payloads.

Future commercial provenance (finance / stolen / write-off) uses:

- `lib/api/provenance.ts`
- `VehicleProvenanceProvider` in `types/vehicle.ts`

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import into Vercel
3. Set environment variables in the Vercel project settings
4. Deploy

Set `NEXT_PUBLIC_SITE_URL=https://autoviewer.co.uk` in production.

## SEO notes

- Indexable landing pages own search intents (MOT, tax, mileage, etc.)
- `/vehicle/[registration]` is `noindex,follow` to avoid thin duplicate URLs
- `app/sitemap.ts` excludes vehicle result pages
- `app/robots.ts` disallows `/vehicle/`
- JSON-LD includes Organization, WebSite and tool WebApplication where accurate
- No fake AggregateRating / review markup

## Disclaimer

AutoViewer is an independent service and is not affiliated with or endorsed by DVLA, DVSA or vehicle manufacturers. MOT and vehicle data may be sourced from official UK government datasets and services. Information is guidance only and not a substitute for inspection or professional advice.
