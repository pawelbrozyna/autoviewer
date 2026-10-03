# AutoViewer SEO Audit

Audit date: 3 October 2026. Based on the current codebase only (no live crawl, no keyword tool data). Search volumes are qualitative estimates and should be validated in Search Console and a keyword tool after launch.

No production code was changed for this audit.

---

## 0. Critical findings (read first)

1. **There is no `ALLOW_INDEXING` flag in the codebase.** Indexing is currently controlled by three unrelated mechanisms:
   - `app/page.tsx` serves a "coming soon" homepage with `noindex, nofollow` whenever `VERCEL_ENV === "production"`. This is hard-coded and will survive any env flag change.
   - `MAINTENANCE_MODE=true` (set on Vercel) rewrites every non-API URL to `/maintenance` (`noindex, nofollow`, HTTP 200).
   - Every other page sets `index: true` via `buildPageMetadata`, and `app/layout.tsx` sets `index: true` globally.
   - `robots.txt` and `sitemap.xml` are excluded from middleware, so they already advertise every page as crawlable while the pages themselves serve the coming-soon screen.
2. **The two most important search pages do not use the live report.** The homepage, `/check-a-vehicle` and `/example-report` use an inline lookup (`VehicleSearchForm inlineDvlaLookup`) that POSTs to `/api/vehicle`, which calls the **DVLA UAT (test) endpoint**. Users landing from search would get DVLA test data with no model, MOT history or mileage. The live DVSA flow (`/vehicle/[registration]`) is only reached from the secondary tool pages and compare.
3. **Demo wording is still live on every checker page**: `CheckerLandingPage` says "In demo mode, try AB12 CDE or CD34 EFG." `/example-report` is described as "demonstration data".
4. **No Open Graph image anywhere**, while Twitter cards are set to `summary_large_image`. Shares will render without an image.

---

## 1. Technical SEO

### robots.txt (`app/robots.ts`)
- Allows `/`, disallows `/vehicle/`, declares the sitemap and `host`.
- `host` is a Yandex-only directive; Google ignores it. Harmless.
- `/api/` is not disallowed. Low risk (POST and JSON), but add it for cleanliness.
- `/compare-cars?left=...&right=...` is crawlable and triggers two live DVSA lookups per hit. The canonical is correct, but bot traffic could burn API quota. Consider `Disallow: /compare-cars?`.
- There is no pre-launch mode. Before launch, robots.txt should either disallow everything or the pages should send `noindex`. Today it does neither consistently (see critical finding 1).

### sitemap.xml (`app/sitemap.ts`)
- Static list of 20 URLs. Good coverage of public pages, correctly excludes `/vehicle/*`, `/full-report` and `/maintenance`.
- `lastModified: new Date()` changes on every request, so it carries no signal. Use real per-page dates or omit it.
- `priority` and `changeFrequency` are ignored by Google. Harmless.
- Includes three overlapping pages (`/tax-mileage`, `/car-tax-check`, `/mileage-check`) and the orphaned `/vehicle-details`. See duplicates below.
- Includes `/example-report`, which is currently thin demo content with two H1s.

### Canonical URLs
- `buildPageMetadata` sets an absolute canonical on every page. Good.
- Canonicals depend on `NEXT_PUBLIC_SITE_URL` (fallback `https://autoviewer.co.uk`). Confirm the production value matches the final host, and that the other host (www vs apex) 308-redirects to it at the Vercel domain level.
- `/compare-cars` with query params canonicalises to `/compare-cars`. Good.
- `/vehicle/[registration]` canonicalises to itself and is `noindex`. Fine.

### Global noindex/index logic
- Root layout: `index: true, follow: true`.
- `buildPageMetadata`: `noIndex` option, used by `/vehicle/[registration]` and `/full-report`.
- Coming-soon homepage and `/maintenance`: `noindex, nofollow`.
- No environment-level control, and no `X-Robots-Tag` header for preview deployments. Preview URLs (`*.vercel.app`) render the full site with `index: true`; the canonical points to production, which mitigates but does not prevent indexing.
- Recommendation: one `ALLOW_INDEXING` flag that drives the default robots meta, robots.txt (`Disallow: /` when false) and an `X-Robots-Tag: noindex` header on non-production hosts. Remove the hard-coded `VERCEL_ENV` homepage switch.

### Metadata setup
- Title template `%s | AutoViewer`. Homepage uses `absoluteTitle`. Good pattern.
- The brand is duplicated in some titles:
  - "About AutoViewer - UK Vehicle Checks Made Clear | AutoViewer"
  - "Contact AutoViewer | AutoViewer"
  - "AutoViewer Full Report | AutoViewer" (noindex, but still visible in tabs)
- Homepage title "Free Car Check UK - MOT, Tax, Mileage & Vehicle History | AutoViewer" is about 68 characters and will truncate on mobile. Suggest "Free Car Check UK: MOT, Tax & Mileage History | AutoViewer".
- Descriptions are natural and the right length. Good.

### Open Graph / Twitter
- `og:title`, `og:description`, `og:url`, `og:site_name` and `og:locale` are present on all pages via the helper.
- `og:title` omits the brand, because the helper passes the raw title. Minor.
- **No `og:image` or `twitter:image`.** Add `app/opengraph-image.png` (1200x630) as a site default, plus per-section images for tools and guides if possible.

### Structured data
- Present:
  - `Organization` and `WebSite` on every page (root layout).
  - `WebApplication` with a free `Offer` on tool pages.
  - `BreadcrumbList` on guides only.
- `WebSite.potentialAction` `SearchAction` targets `/vehicle/{registration}`, which is blocked in robots and noindexed, and Google retired the sitelinks search box in 2024. Remove it.
- Tool pages show visual breadcrumbs (`PageHero`) but emit no `BreadcrumbList`. Add it.
- Guides have no `Article` schema, author, `datePublished` or `dateModified`, and no visible "last updated" date. Add these for trust.
- FAQ blocks exist on tool pages without `FAQPage` schema. FAQ rich results are now limited to authoritative government and health sites, so this is optional and low priority.

### 404 handling
- No `app/not-found.tsx`, so the default Next.js 404 is used: no helpful links, weak UX.
- `/vehicle/[registration]` with an invalid or unknown registration renders an error state with **HTTP 200** (a soft 404). The page is noindexed so the SEO impact is small, but returning `notFound()` for invalid formats is cleaner.
- The header links to `/sign-in` when `authEnabled` is on, and that route does not exist. Confirm it stays off.

### Redirects
- `next.config.ts` has no redirects. Next.js handles trailing slashes by redirecting `/path/` to `/path`.
- Middleware:
  - `/maintenance` redirects to `/` when maintenance is off (307). Fine.
  - The `?admin=` parameter redirects. Fine, but make sure `?admin=true` URLs are never linked publicly.
- Needed at the domain level: www to apex (or the reverse), and http to https (Vercel default).

### Duplicate and overlapping pages
| Pages | Problem | Suggestion |
|---|---|---|
| `/tax-mileage`, `/car-tax-check`, `/mileage-check` | Three pages for two intents. `/tax-mileage` is in the nav; the other two are "focused guides" reachable only from it. They compete with each other. | Keep `/car-tax-check` and `/mileage-check` as the indexable intent pages (they match real queries). Either retire `/tax-mileage` with a 301 to `/car-tax-check` and update the nav, or noindex it. |
| `/` and `/check-a-vehicle` | Both target "free car check / vehicle check" with the same inline lookup. | Homepage targets the brand plus "free car check"; `/check-a-vehicle` targets "vehicle check by registration" and "car history check". Differentiate copy and H1s. |
| `/vehicle-details` and `/check-a-vehicle` | Near-identical intent ("vehicle details by registration"). `/vehicle-details` has zero internal links. | Merge into `/check-a-vehicle` (301), or reposition as "car specs by registration" with genuinely different content. |
| `/example-report` | Reuses the full homepage hero (duplicate H1 and copy), then a demo report. | Rebuild as "Sample vehicle report" without the homepage hero, or noindex until rebuilt. |

### Core Web Vitals and performance risks
- **Every route is dynamic.** The root layout calls `cookies()` and `headers()`, which opts all pages out of static rendering and CDN caching. TTFB will be higher than necessary on pages that could be fully static (guides, tools, legal). This is the biggest performance lever. Move the maintenance and admin logic out of the root layout (middleware already handles it).
- Homepage hero: `header.png` with `fill priority sizes="70vw"`, hidden on mobile. Good for mobile LCP. Check the file size (PNG) and consider AVIF/WebP.
- Inter is loaded in 5 weights. Acceptable with `display: swap`, but 3 to 4 weights would be enough.
- Google Analytics loads on every page. Make sure it uses `afterInteractive` or `lazyOnload`.
- `/vehicle/[registration]` waits for live DVSA (0.5-2 s, longer on a cold token). It is noindexed, but user experience matters. Consider streaming with a skeleton.
- Client components (`FAQ`, `VehicleComparison` with `useLayoutEffect`, `VehicleSummaryMobile`) are small. Low risk.

### Mobile SEO
- Mobile-first layouts throughout; `lang="en-GB"`; Next.js default viewport. Good.
- Search inputs are large and prominent. Good.
- `md:whitespace-nowrap` on hero H1s applies only at desktop widths. Fine.

### Crawlability
- Primary nav and footer are plain `<Link>`s, so they are crawlable.
- Orphans and weak pages:
  - `/vehicle-details`: 0 inbound links
  - `/recall-check`: homepage feature grid only
  - `/car-tax-check` and `/mileage-check`: `/tax-mileage` only
  - `/guides/cat-s-vs-cat-n`: `/guides` only
- Report pages are reached by form submit (`router.push`), not links. Good for crawl control.

---

## 2. Current pages

Legend for "Index?": Yes = deserves indexing; Fix = index after fixes; No = keep noindex.

### `/` Homepage
- **Title:** Free Car Check UK - MOT, Tax, Mileage & Vehicle History | AutoViewer (production currently: "AutoViewer is coming soon", noindex, nofollow)
- **Description:** Free UK car check for MOT history, tax, mileage, recalls and vehicle details. Simple, fast and built for used car buyers.
- **H1:** "Make a smarter buying decision."
- **Intent / topic:** brand plus "free car check", "car check UK"
- **Index?** Fix
- **Links in:** logo, every page. **Links out:** nav, feature grid (MOT history, tax & mileage, recall check, running costs, check a vehicle), example report section, compare section.
- **Issues:**
  - H1 contains no topic words.
  - The search uses the DVLA UAT inline lookup, not the live report.
  - Hard-coded coming-soon logic.
  - Title is long.
- **Improve:**
  - H1 like "Free car check: MOT, tax and mileage history".
  - Send searches to `/vehicle/[reg]`.
  - Add a short "what the free check includes and what it does not" section (finance, write-off, stolen), which builds trust.
  - Link to the top guides.

### `/check-a-vehicle`
- **Title:** Vehicle Check by Registration - Free UK Car Check
- **Description:** Enter a UK registration for a free vehicle check covering MOT history, tax status, mileage readings, recalls and key vehicle details.
- **H1:** Vehicle check by registration
- **Intent / topic:** "vehicle check", "car check by registration", "car history check", "reg check"
- **Index?** Fix
- **Links in:** nav, footer, related tools, guides, report back link. **Links out:** MOT history, tax & mileage, compare.
- **Issues:**
  - DVLA UAT inline lookup.
  - "In demo mode" copy.
  - About 250 words of templated copy.
  - FAQ says finance and write-off checks "would require a separate commercial provider", which is honest but gives no next step.
- **Improve:**
  - Live flow.
  - A clear "free vs not included" comparison table.
  - Link to the write-off guide and the checklist.
  - About 500-700 words of genuinely useful copy.

### `/mot-history`
- **Title:** MOT History Check - Free UK MOT Checker
- **Description:** Free MOT history check by UK registration. See pass and fail results, mileage at test and recorded defects.
- **H1:** MOT history check
- **Intent / topic:** "mot history check", "check mot history", "mot check"
- **Index?** Yes
- **Links in:** nav, footer, related tools, advisories guide, report. **Links out:** tax & mileage, check a vehicle, advisories guide.
- **Issues:**
  - Demo copy.
  - The head term is dominated by GOV.UK, so realistic wins are long-tail ("mot history with advisories", "mot mileage history").
- **Improve:**
  - Emphasise what GOV.UK does not do well: plain-English advisory interpretation, repeated-issue detection, a mileage chart and a buyer score.
  - Add a "first MOT due" explanation (data is now live).

### `/tax-mileage`
- **Title:** Tax & Mileage Check
- **Description:** Check a UK vehicle's tax status and recorded mileage in one place using its registration number.
- **H1:** Tax & mileage check
- **Intent / topic:** combined, low-volume query
- **Index?** No (or 301)
- **Links in:** nav, footer, many related lists. **Links out:** car tax check, mileage check, MOT history, check a vehicle.
- **Issues:**
  - Cannibalises `/car-tax-check` and `/mileage-check`.
  - Tax status depends on DVLA, and the production DVLA key is currently rejected, so tax shows "Not available".
- **Improve:** consolidate as described in section 1, and replace the nav item with "Mileage Check" or "Car Tax Check".

### `/car-tax-check`
- **Title:** Car Tax Check - Check VED & SORN Status
- **Description:** Check car tax and SORN status by UK registration. Confirm whether a vehicle is taxed, untaxed or declared SORN.
- **H1:** Car tax check
- **Intent / topic:** "car tax check", "is my car taxed", "check sorn status"
- **Index?** Fix
- **Links in:** tax & mileage only. **Links out:** tax & mileage, running costs, MOT history.
- **Issues:**
  - The core data (tax status) is unavailable without a production DVLA key.
  - GOV.UK dominates the head term.
  - Weak internal links.
- **Improve:**
  - Do not index until DVLA production data works. A tax check page that shows "Not available" will not satisfy intent.
  - Then add VED band context and link to the planned VED calculator.

### `/mileage-check`
- **Title:** Car Mileage Check - View MOT Mileage History
- **Description:** Check car mileage history from MOT readings. Spot possible inconsistencies before you buy a used car.
- **H1:** Car mileage check
- **Intent / topic:** "mileage check", "car mileage history", "check if car has been clocked"
- **Index?** Yes
- **Links in:** tax & mileage only. **Links out:** tax & mileage, MOT history, check a vehicle.
- **Issues:** under-linked; templated copy; demo copy.
- **Improve:**
  - Put it in the nav (replacing Tax & Mileage).
  - Add a "how to spot clocking" section and link to a future clocking guide.
  - Explain average UK annual mileage as context.

### `/recall-check`
- **Title:** Vehicle Recall Check - UK Safety Recalls
- **Description:** Check available manufacturer safety recall information for a UK vehicle registration.
- **H1:** Vehicle recall check
- **Intent / topic:** "car recall check", "vehicle recall check uk"
- **Index?** Fix
- **Links in:** homepage feature grid only. **Links out:** check a vehicle, MOT history, checklist.
- **Issues:**
  - DVSA usually returns the recall flag as "Unknown", so most lookups show "Data not available".
  - The page promises more than the data delivers.
- **Improve:**
  - Be explicit that the flag comes from DVSA where available.
  - Link to the official GOV.UK recall checker as the authoritative next step.
  - Index only if the copy is honest about coverage.

### `/vehicle-details`
- **Title:** Vehicle Details by Registration
- **Description:** Look up UK vehicle details by registration including make, model, fuel type, colour and year of manufacture where available.
- **H1:** Vehicle details by registration
- **Intent / topic:** "car details by reg", "vehicle specs by registration"
- **Index?** No (merge)
- **Links in:** none. **Links out:** check a vehicle, tax & mileage, running costs.
- **Issues:** orphan; duplicates `/check-a-vehicle`.
- **Improve:** 301 to `/check-a-vehicle`, or reposition later as a specs page once a spec data source exists.

### `/compare-cars`
- **Title:** Compare Cars by Registration
- **Description:** Compare two UK cars side by side using their registrations. Spot differences in year, fuel, mileage, tax and more.
- **H1:** Compare cars by registration
- **Intent / topic:** "compare cars by registration", "compare two cars", "car comparison uk"
- **Index?** Yes
- **Links in:** nav, footer, related tools, report. **Links out:** check a vehicle, running costs, MOT history.
- **Issues:**
  - "Compare cars" head terms are dominated by spec sites (Parkers, Auto Express), but "by registration" is a genuine gap.
  - Query URLs trigger live lookups.
  - Thin copy (about 215 words).
- **Improve:**
  - Explain what is compared and how to read the buyer score.
  - Add a worked example.
  - Consider `Disallow: /compare-cars?`.

### `/running-costs`
- **Title:** Car Running Costs Calculator UK
- **Description:** Estimate UK car running costs including fuel, road tax, insurance and maintenance. See annual car costs, monthly car costs and cost per mile.
- **H1:** Car running costs calculator
- **Intent / topic:** "car running costs calculator", "cost per mile calculator", "how much does it cost to run a car uk"
- **Index?** Yes
- **Links in:** nav, footer, related tools, feature grid. **Links out:** tax & mileage, check a vehicle, compare, MOT history.
- **Issues:** fuel price is a manual constant (172.5p); needs a visible "prices updated" date.
- **Improve:**
  - Show the update date.
  - Spin off a dedicated fuel cost calculator.
  - Follow the hero, seoSection, faqSection and relatedSection structure for new calculators.

### `/guides`
- **Title:** Used Car Buying Guides
- **Description:** Practical UK used car buying guides covering MOT advisories, write-off categories and a clear pre-purchase checklist.
- **H1:** Clear guidance for UK used car buyers
- **Index?** Yes (hub)
- **Issues:** only 3 guides; no categories.
- **Improve:** group by "Before you buy", "Understanding MOT" and "Write-offs and history".

### `/guides/used-car-buying-checklist`
- **Title:** Used Car Buying Checklist. **H1:** Used car buying checklist
- **Description:** A practical UK used car buying checklist covering registration checks, MOT history, mileage, finance, documents and the test drive.
- **Intent / topic:** "used car buying checklist", "what to check when buying a used car"
- **Index?** Yes
- **Links in:** guides, Cat S guide, recall related. **Links out:** check a vehicle, advisories guide.
- **Issues:** about 300 words, thin against competitors; no printable version; no date or author.
- **Improve:**
  - Expand to a real checklist (documents, V5C checks, test drive, questions to ask the seller).
  - Add a printable PDF.
  - Add an updated date.

### `/guides/mot-advisories-explained`
- **Title / H1:** MOT Advisories Explained
- **Description:** Understand MOT advisories, minor, major and dangerous defects - and what used car buyers should do about them.
- **Intent / topic:** "mot advisories meaning", "what is an mot advisory", "minor vs major defect"
- **Index?** Yes
- **Links in:** MOT history (body and related), checklist. **Links out:** MOT history.
- **Issues:** about 280 words.
- **Improve:** add examples of common advisories (tyres, brakes, corrosion) with rough repair-cost context. This is a strong long-tail page.

### `/guides/cat-s-vs-cat-n`
- **Title:** Cat S vs Cat N Explained
- **Description:** Clear explanation of Cat S and Cat N insurance write-off categories for UK used car buyers.
- **Intent / topic:** "cat s vs cat n", "what is cat n", "cat s meaning"
- **Index?** Yes
- **Links in:** guides only. **Links out:** check a vehicle, checklist.
- **Issues:**
  - Under-linked.
  - Should state clearly that AutoViewer's free check does not include write-off data.
- **Improve:**
  - Link from `/check-a-vehicle` and the report's "not included" note.
  - Cover Cat A, B, S and N in a table.

### `/example-report`
- **Title:** Full Example Vehicle Report
- **Description:** Explore a complete AutoViewer vehicle report using demonstration data.
- **H1:** two H1s ("Make a smarter buying decision." from the reused hero, and "Full example vehicle report")
- **Intent / topic:** "sample car history report", "vehicle report example"
- **Index?** No (until rebuilt)
- **Issues:** duplicate hero; "demonstration data" wording; DVLA UAT inline lookup.
- **Improve:** a standalone "Sample report" page with an annotated walkthrough. Index it then.

### `/about`, `/contact`, `/privacy`, `/terms`
- **Index?** Yes (low priority). Linked from the footer.
- **Issues:** brand duplicated in the About and Contact titles.
- **Improve:**
  - About: who runs AutoViewer, data sources and the independence statement. This is good for trust.

### `/full-report` (noindex)
- "Learn about the planned AutoViewer Full Report". Keep noindex until the product exists.

### `/vehicle/[registration]` (noindex, disallowed)
- See section 5.

### `/maintenance` (noindex, nofollow)
- Correct as is.

---

## 3. Search opportunity (UK)

Positioning reality:
- GOV.UK owns the official head terms: "check mot history", "check if a vehicle is taxed", "vehicle enquiry".
- HPI, Experian AutoCheck, the RAC, the AA, carVertical, Total Car Check, CarCheck.co.uk and MotorCheck own the paid "car history check" space with strong domains.
- A new domain wins first on long-tail intents, plain-English interpretation and free tools that GOV.UK does not provide.

### Core commercial pages (convert to report usage, later premium)
| Topic | Example queries | Page | Realistic? |
|---|---|---|---|
| Free car check | free car check, free car check uk, car check by reg | `/` | Hard head term; brand plus long-tail first |
| Vehicle / car history check | car history check, vehicle history check uk, reg check | `/check-a-vehicle` | Medium-hard; win with "free" plus clarity |
| Vehicle report | vehicle report uk, sample car history report | `/check-a-vehicle`, `/sample-report` | Medium |
| Write-off check | check if car is written off, cat s check | Future `/write-off-check` (premium) | Only with a data provider |
| Finance check | check if car has outstanding finance | Future `/finance-check` (premium) | Only with a data provider |
| Stolen check | check if car is stolen uk | Future `/stolen-car-check` (premium) | Only with a data provider |

### Free-tool pages (best ranking chances)
| Topic | Example queries | Page | Notes |
|---|---|---|---|
| MOT history | mot history check, mot history with advisories | `/mot-history` | Long-tail first |
| Mileage | car mileage check, mileage history, clocked car check | `/mileage-check` | Good fit, DVSA data is live |
| MOT due date | when is my mot due, mot due date check, first mot due | New `/mot-due-date` | Easy, data available now |
| Plate age | what year is my number plate, number plate age checker | New `/number-plate-age` | High volume, no API needed |
| Car tax (VED) calculator | car tax calculator, how much is my car tax, ved bands | New `/car-tax-calculator` | Strong fit with the calculator approach |
| Running costs | car running costs calculator, cost per mile | `/running-costs` | Already built |
| Fuel cost | fuel cost calculator uk, journey fuel cost | New `/fuel-cost-calculator` | Easy spin-off |
| ULEZ / CAZ | ulez checker, is my car ulez compliant | New `/ulez-check` | Needs DVLA production (Euro status); TfL is authoritative |
| Compare by reg | compare two cars by registration | `/compare-cars` | Genuine gap |
| Recalls | car recall check | `/recall-check` | Limited data; link to GOV.UK |

### Supporting informational pages
- MOT advisories explained (exists), and common advisories and what they cost.
- Cat S vs Cat N (exists), plus "write-off categories explained" (A, B, S, N).
- Used car buying checklist (exists), plus "how to check a car's history before buying" (pillar).
- How to spot a clocked car / mileage discrepancies.
- What SORN means and buying a SORN car.
- What to check on a V5C logbook.
- First MOT: when it is due and what is tested.

### Pages we should NOT build
- Indexable registration pages (`/vehicle/AB12CDE`), for the reasons in section 5.
- Thousands of make/model pages without unique data ("Ford Fiesta car check").
- Location pages ("car check London", "MOT check Manchester").
- "Free HPI check" or any page implying finance, write-off or stolen data we do not have.
- Keeper or owner name lookups. These are illegal and a privacy risk.
- Car valuation pages without a valuation data source.
- Generic news or listicle blog content ("10 best family cars").

---

## 4. Site architecture for launch

```text
/                               Home: free car check (search -> live report)
├── /check-a-vehicle            Vehicle / car history check (main tool landing)
│   └── /vehicle/[reg]          Live report (noindex, disallowed)
├── Free checks
│   ├── /mot-history
│   ├── /mileage-check
│   ├── /mot-due-date           (new)
│   ├── /recall-check
│   └── /car-tax-check          (index once DVLA production works)
├── Calculators and tools
│   ├── /running-costs
│   ├── /car-tax-calculator     (new)
│   ├── /fuel-cost-calculator   (new)
│   ├── /number-plate-age       (new)
│   └── /compare-cars
├── /sample-report              (rebuilt /example-report)
├── /guides                     Hub, grouped by topic
│   ├── Before you buy: checklist, how to check car history, V5C checks
│   ├── Understanding MOT: advisories, first MOT, common fails
│   └── History and write-offs: Cat S vs Cat N, write-off categories, clocking
└── Company: about, contact, privacy, terms
```

Internal linking rules:
- **Every tool page** links to `/check-a-vehicle` plus 2 related tools plus 1-2 relevant guides. Put the guide links in body copy, not just "Related tools".
- **Every guide** links to the tool that answers it, e.g. advisories to `/mot-history`, clocking to `/mileage-check`, Cat S to `/check-a-vehicle`, with a note on what the free check covers.
- **Report pages** link out to the relevant tools and guides. They already have "Related checks"; add the advisories and checklist guides there.
- **Nav:** Check a Vehicle, MOT History, Mileage Check, Compare Cars, Calculators (dropdown or hub), Guides. Drop "Tax & Mileage".
- **Footer:** add the second-tier tools (recall check, car tax check, plate age, calculators), which fixes the orphans.
- Add a "What the free check does not include" block (finance, write-off, stolen) linking to the relevant guides.

---

## 5. Programmatic SEO: registration report URLs

**Recommendation: keep `/vehicle/[registration]` noindex and disallowed. Do not index.**

- **Privacy:** a registration is tied to a person's vehicle and location history. Publicly indexable pages combining a plate with MOT mileage and dates invite complaints and GDPR scrutiny, even if the data is "public".
- **Data terms:** check the DVSA MOT History API terms on storing and republishing data before any public, cacheable page is built from it.
- **Thin and duplicate content:** every page has the same template with different numbers, and most UK plates would never be searched. This is classic thin programmatic content and risks a site-wide quality signal.
- **Crawl volume and cost:** there are millions of possible plates. Each crawl triggers live DVSA calls (rate limits, quota and latency), and the robots disallow is what protects the API today.
- **Soft 404s:** invalid or unknown plates currently return HTTP 200.
- **The robots and noindex combination:** with `Disallow: /vehicle/`, Google cannot see the `noindex`. If external sites link to report URLs, Google may show URL-only results. Acceptable for now, because the URLs are not linked or in the sitemap. Add an `X-Robots-Tag: noindex` header on `/vehicle/*` as a backstop. If URL-only results appear in Search Console, temporarily allow crawling so the noindex is seen.

**Legitimate programmatic opportunity (later):** aggregated, non-personal pages built from DVSA bulk data, e.g. "Ford Fiesta MOT pass rate and most common failures by year". These carry unique statistical value. Build a small, high-quality set (top 30-50 models) only after the core pages rank.

---

## 6. Content gaps (prioritised)

Scores: Intent and Usefulness are High/Med/Low; Build is Easy/Med/Hard.

| # | Page / tool | Intent | Useful | Commercial | Build | Notes |
|---|---|---|---|---|---|---|
| 1 | Number plate age checker | High | High | Med | Easy | Static logic, no API, strong top-of-funnel |
| 2 | Car tax (VED) calculator | High | High | Med | Med | CO2 bands, list price over £40k, post-2017 rules |
| 3 | MOT due date checker | High | High | High | Easy | DVSA expiry and first MOT due already live |
| 4 | Sample vehicle report (rebuild) | Med | High | High | Easy | Annotated walkthrough, replaces example-report |
| 5 | How to check a car's history (pillar) | High | High | High | Easy | Hub linking every check |
| 6 | Mileage clocking guide | Med | High | High | Easy | Supports `/mileage-check` |
| 7 | Fuel cost calculator | High | Med | Low | Easy | Spin-off of running costs |
| 8 | ULEZ / CAZ checker | High | High | Med | Med | Needs DVLA production Euro status |
| 9 | Write-off categories explained (A/B/S/N) | Med | High | High | Easy | Extends Cat S vs N |
| 10 | Common MOT advisories and costs | Med | High | Med | Med | 5-8 sections, not hundreds of pages |
| 11 | First MOT explained | Med | Med | Med | Easy | Pairs with the MOT due date tool |
| 12 | What to check on a V5C logbook | Med | High | Med | Easy | Supports the checklist |
| 13 | SORN explained / buying a SORN car | Med | Med | Low | Easy | Supports car tax check |
| 14 | Outstanding finance check (page) | High | High | High | Hard | Only with a provider; honest guide until then |
| 15 | Write-off / stolen check (page) | High | High | High | Hard | Same as above |
| 16 | Model MOT pass-rate pages (top 30-50) | Med | High | Med | Hard | DVSA bulk data, later |

---

## 7. Launch checklist: switching indexing on

`ALLOW_INDEXING` does not exist yet. Steps 1-2 create it.

1. Implement a single `ALLOW_INDEXING` flag that controls:
   - the default robots meta
   - robots.txt (`Disallow: /` when false)
   - an `X-Robots-Tag: noindex` header on non-production hosts

   Remove the hard-coded `VERCEL_ENV === "production"` coming-soon homepage and the matching layout switch.
2. On Vercel:
   - `MAINTENANCE_MODE=false`
   - `ALLOW_INDEXING=true` (production only)
   - `NEXT_PUBLIC_SITE_URL` set to the final host
   - `USE_MOCK_DATA=false`
3. Confirm the www and apex redirect (308) to the canonical host.
4. Spot-check live:
   - `/robots.txt` allows the site, disallows `/vehicle/` and `/api/`, and lists the sitemap.
   - `/sitemap.xml` has only indexable URLs on the canonical host.
   - View source on `/`, `/check-a-vehicle`, `/mot-history` and a guide: `index, follow`, a correct canonical, and `og:image` present.
   - `/vehicle/AB12CDE` is `noindex`.
   - A made-up URL returns a real 404.
5. Run one live registration through the homepage search and confirm it reaches the live DVSA report.
6. In Search Console:
   - verify the domain property
   - submit the sitemap
   - URL-inspect and request indexing for the homepage and the top 5 tool pages
7. Add Bing Webmaster Tools (import from Search Console).
8. For the first 2 weeks, watch:
   - coverage ("Indexed, though blocked" for `/vehicle/`)
   - Core Web Vitals
   - DVSA API usage from bots
   - queries per page, to catch cannibalisation

---

## Summary

### Biggest SEO strengths
- Clean metadata helper: canonical, Open Graph and Twitter on every page; `en-GB` locale.
- Registration report pages are already `noindex` and disallowed, a sensible privacy-first default.
- Honest, official-source positioning and no keyword stuffing; copy reads naturally.
- Mobile-first layouts and a prominent search on every tool page.
- A sensible starting tool set (MOT, mileage, compare, running costs) plus a related-tools system to build internal links on.
- Sitemap and robots in place; breadcrumb schema on guides; `WebApplication` schema on tools.

### Biggest SEO weaknesses
- No real indexing switch; the production homepage is hard-coded to noindex, nofollow.
- Homepage and `/check-a-vehicle` searches use DVLA UAT test data instead of the live report.
- Templated, thin tool and guide copy (200-300 words), with leftover demo wording.
- Overlapping pages (`/tax-mileage`, `/car-tax-check`, `/mileage-check`, `/vehicle-details`) and orphaned pages.
- No Open Graph image, no custom 404, and an obsolete `SearchAction` schema.
- All routes are dynamic because the root layout reads cookies and headers.

### Top 5 things to fix before indexing
1. Build the `ALLOW_INDEXING` switch and remove the hard-coded coming-soon homepage logic.
2. Route homepage and `/check-a-vehicle` searches to the live `/vehicle/[reg]` report (drop the DVLA UAT inline lookup).
3. Remove all demo wording; rebuild or noindex `/example-report`.
4. Add a default `og:image`, fix duplicated brand titles, give the homepage a topical H1, remove `SearchAction`, and add a custom `not-found.tsx`.
5. Resolve cannibalisation and orphans:
   - retire `/tax-mileage`
   - merge `/vehicle-details`
   - put `/mileage-check` in the nav
   - link `/recall-check`, `/car-tax-check` and the Cat S guide properly

   Hold `/car-tax-check` back until DVLA production data works.

### Top 5 pages/tools to build next
1. Number plate age checker
2. Car tax (VED) calculator
3. MOT due date checker
4. "How to check a car's history" pillar guide, with write-off categories explained
5. Sample vehicle report (rebuilt, annotated)

### What should stay noindex
- `/vehicle/[registration]` (also disallowed in robots, plus an `X-Robots-Tag` backstop)
- `/full-report` until the paid product exists
- `/maintenance` and the coming-soon state
- `/example-report` until rebuilt as a proper sample report
- `/tax-mileage` and `/vehicle-details` if they are kept rather than redirected
- `/car-tax-check` until DVLA production tax data is available
- All preview deployments (`*.vercel.app`) and `/api/*`
- `/compare-cars` query-string variants (canonicalised; optionally disallow `/compare-cars?`)
