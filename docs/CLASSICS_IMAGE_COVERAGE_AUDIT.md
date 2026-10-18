# Classics / interesting UK-market image coverage audit

Audit date: 17 October 2026. Repository: C:\Github\autoviewer. All 100 supplied suggestions are retained in their original order. This is a planning audit, not a catalogue import or a generation of assets. No final catalogue IDs, matcher changes or image files are created.

## Results

| Measure | Count |
| --- | ---: |
| Proposed models | 100 |
| Already fully covered within stated representative-image scope | 4 |
| Partially covered | 9 |
| Completely missing | 87 |
| Duplicate suggestions requiring no new asset or scope repair | 4 |
| Suggestions with some existing reusable imagery | 13 |
| Duplicated suggestions within the supplied list | 0 |
| Total recommended generation/body/visual records, including existing assets | 251 |
| Existing visual records reused in this plan | 15 |
| Recommended NEW image records | **236** |
| Additional generation/body/visual splits beyond one record per suggestion | 151 |
| Suggestions needing more than one image record | 60 |

The 9 partial suggestions include BMW E81/E87: no second hatch asset is recommended, but the 2012 E81 year scope is not correctly represented by current matching. 13 suggestions have reusable imagery; only 4 are fully covered. 96 suggestions therefore remain incomplete, of which 87 have no suitable existing visual coverage.

“Splits” counts extra visual buckets, not chassis generations: sum(recommended records minus one) across the 100 rows. 141 new records are additional to the first new record for each suggestion needing assets. These figures must not be added to the new-record total.

## Scope and counting rules

- Exact catalogue availability, matcher behaviour and actual image silhouette were audited separately. IDs mean the existing catalogue **priority** field; the source has no separate persistent ID. JSON proposal indices are list positions, not allocated catalogue IDs.
- Status: exact_existing = suitable named generation/body imagery with no missing mandatory visual bucket; broader_existing = a broader but sufficient representative family; partial_existing = some imagery exists but bodies/epochs or identity/year scope remain missing; missing = no suitable image for the requested identity. A placeholder or wrong-generation image is not coverage. “Exact” here is an audit status, distinct from the resolver's year-range match label.
- Broad model names include materially distinct passenger silhouettes and pronounced front/rear redesigns, not every engine, wheel, badge, upholstery, model-year or mild facelift. Similar 3/5-door hatchbacks share one family view; estates, saloons, low-roof coupes and convertibles are separated where silhouette changes. Roof position is not another generation.
- Facelift splits are editorial visual judgements based on documented body/front/rear changes; they are not a claim that every factory update deserves an image. Notes explain retained and rejected splits. No universal facelift rule is proposed.
- Ordinary unspecified models do not promise every RS/AMG/M/VXR/special bodykit. Explicitly named performance cars are researched as their own visual identities. Factory ZS180, Stagea 260RS and different Copen body-panel designs are included where the parent proposal spans materially different appearances.
- Approximate years describe visual/UK sales epochs; launch year, manufacture year and model year can differ. Transition years may overlap. Later import registrations do not identify production generations. They are not ready-made matcher eligibility ranges.
- Unqualified reused names are bounded explicitly in each row: modern MG TF; classic MG ZS; modern S-Type; 1990s Griffith; UK second-generation Probe; 1999-2018 Crown Athlete; JDM GT-wagon/B4-saloon Legacy families; 1981-on Hijet standard vans/trucks; familiar Delica passenger imports. Deferred global generations, rebadges and specialist conversions are not included in totals. This is not a worldwide all-derivative encyclopaedia.
- Copen and GranTurismo include later named generations because the proposals do not specify a chassis. All 236 candidate choices remain a review queue, not permission to produce images. Per-record scopeReviewRequired flags identify ambiguous parent names.

## Local evidence

Read data/vehicle-images.json, lib/vehicle/images.ts and docs/vehicle-image-generation.md; enumerated and hashed every file in public/cars/. Current library: 1099 active records, 0 pending rows, 1094 physical files and 1094 distinct referenced filenames. All active filenames exist; no unreferenced image files were found. Shared filenames explain the difference between records and assets.

All 15 reused assets were inspected visually, including combined-body rows. Compound bodyType metadata is not evidence that both silhouettes have images. Existing documentation specifies 1000×750 WebP, white studio, front three-quarter view, vehicle facing left; it does not authorise a new alias or a generic performance-body substitution.

Matcher findings: make aliases include Mercedes→Mercedes-Benz and Opel→Vauxhall. BMW numbered engines can alias to Series, but neither XKR→XK8 nor Altezza→Lexus IS nor SportKa→Ka exists. Same-model prefix matching can return ordinary Corolla for Corolla T-Sport. Body hints do not reject the sole year-matching row; chassis text does not automatically override a conflicting single year-range match. Pending records do not participate in live matching. No matcher change is made here.

## All 100 proposals

Recommended total includes reusable existing assets; new count is the actual new-record queue. Detailed scopes and notes follow in the same numbered order.

| # | Make | Proposed model | Status | Existing coverage IDs | Existing filenames | Recommended total | New needed |
| --- | --- | --- | --- | --- | --- | ---: | ---: |
| 1 | Rover | Rover 75 | missing | — | — | 4 | 4 |
| 2 | Rover | Rover 200 | missing | — | — | 5 | 5 |
| 3 | Rover | Rover 25 | missing | — | — | 2 | 2 |
| 4 | Rover | Rover 45 | missing | — | — | 4 | 4 |
| 5 | MG | MG ZT | missing | — | — | 4 | 4 |
| 6 | MG | MG ZS | missing | — | — | 6 | 6 |
| 7 | MG | MG TF | missing | — | — | 1 | 1 |
| 8 | Austin | Austin Maestro | missing | — | — | 1 | 1 |
| 9 | Austin | Austin Montego | missing | — | — | 2 | 2 |
| 10 | Triumph | Triumph Dolomite | missing | — | — | 1 | 1 |
| 11 | Triumph | Triumph 2000/2500 | missing | — | — | 4 | 4 |
| 12 | Jaguar | Jaguar XJ40 | missing | — | — | 1 | 1 |
| 13 | Jaguar | Jaguar X300 | missing | — | — | 1 | 1 |
| 14 | Jaguar | Jaguar S-Type | missing | — | — | 2 | 2 |
| 15 | Jaguar | Jaguar XKR X100 | missing | — | — | 4 | 4 |
| 16 | TVR | TVR Chimaera | missing | — | — | 3 | 3 |
| 17 | TVR | TVR Griffith | missing | — | — | 1 | 1 |
| 18 | TVR | TVR Cerbera | missing | — | — | 2 | 2 |
| 19 | Lotus | Lotus Elise S1 | missing | — | — | 1 | 1 |
| 20 | Lotus | Lotus Elise S2 | missing | — | — | 1 | 1 |
| 21 | Ford | Ford Fiesta Mk4 | missing | — | — | 1 | 1 |
| 22 | Ford | Ford Fiesta Mk5 | missing | — | — | 1 | 1 |
| 23 | Ford | Ford Focus Mk1 | partial_existing | #471 | `ford-focus-mk1-facelift-2002-2004.webp` | 6 | 5 |
| 24 | Ford | Ford Focus Mk2 | partial_existing | #8, #7 | `ford-focus-mk2-2005-2008.webp`<br>`ford-focus-mk2-5-2008-2011.webp` | 8 | 6 |
| 25 | Ford | Ford Puma Mk1 | missing | — | — | 1 | 1 |
| 26 | Ford | Ford Cougar | missing | — | — | 1 | 1 |
| 27 | Ford | Ford Probe | missing | — | — | 1 | 1 |
| 28 | Ford | Ford StreetKa | missing | — | — | 1 | 1 |
| 29 | Ford | Ford SportKa | missing | — | — | 1 | 1 |
| 30 | Ford | Ford Galaxy Mk2 | exact_existing | #575 | `ford-galaxy-mk2-2006-2015.webp` | 1 | 0 |
| 31 | Vauxhall | Vauxhall Corsa B | missing | — | — | 1 | 1 |
| 32 | Vauxhall | Vauxhall Corsa C | exact_existing | #453 | `vauxhall-corsa-c-2000-2006.webp` | 1 | 0 |
| 33 | Vauxhall | Vauxhall Astra F | missing | — | — | 4 | 4 |
| 34 | Vauxhall | Vauxhall Astra J | partial_existing | #16 | `vauxhall-astra-j-2009-2015.webp` | 3 | 2 |
| 35 | Vauxhall | Vauxhall Vectra B | missing | — | — | 6 | 6 |
| 36 | Vauxhall | Vauxhall Vectra C | partial_existing | #586 | `vauxhall-vectra-c-facelift-2005-2008.webp` | 6 | 5 |
| 37 | Vauxhall | Vauxhall Omega | missing | — | — | 4 | 4 |
| 38 | Vauxhall | Vauxhall Meriva A | broader_existing | #507 | `vauxhall-meriva-a-facelift-2006-2010.webp` | 1 | 0 |
| 39 | Vauxhall | Vauxhall Signum | missing | — | — | 2 | 2 |
| 40 | Vauxhall | Vauxhall Tigra | missing | — | — | 2 | 2 |
| 41 | BMW | BMW Z3 | missing | — | — | 2 | 2 |
| 42 | BMW | BMW Z4 E85 | missing | — | — | 1 | 1 |
| 43 | BMW | BMW 1 Series E81/E87 | partial_existing | #960 | `bmw-1-series-e87-2004-2011.webp` | 1 | 0 |
| 44 | BMW | BMW 6 Series E63/E64 | partial_existing | #879 | `bmw-6-series-e63-2004-2010.webp` | 2 | 1 |
| 45 | BMW | BMW 7 Series E38 | missing | — | — | 1 | 1 |
| 46 | BMW | BMW 7 Series E65 | missing | — | — | 2 | 2 |
| 47 | Mercedes-Benz | Mercedes CLK C208 | missing | — | — | 1 | 1 |
| 48 | Mercedes-Benz | Mercedes CLK C209 | missing | — | — | 1 | 1 |
| 49 | Mercedes-Benz | Mercedes CL C215 | missing | — | — | 1 | 1 |
| 50 | Mercedes-Benz | Mercedes CLS C219 | missing | — | — | 1 | 1 |
| 51 | Mercedes-Benz | Mercedes SLK R170 | missing | — | — | 1 | 1 |
| 52 | Mercedes-Benz | Mercedes SLK R171 | missing | — | — | 1 | 1 |
| 53 | Mercedes-Benz | Mercedes G-Class W463 | partial_existing | #1093, #1094 | `mercedes-benz-g-class-w463-1990-2012.webp`<br>`mercedes-benz-g-class-w463-2012-2018.webp` | 4 | 2 |
| 54 | Audi | Audi A2 | missing | — | — | 1 | 1 |
| 55 | Audi | Audi S3 8L | missing | — | — | 1 | 1 |
| 56 | Audi | Audi S4 B5 | missing | — | — | 2 | 2 |
| 57 | Audi | Audi RS4 B7 | missing | — | — | 3 | 3 |
| 58 | Audi | Audi Q7 4L | missing | — | — | 2 | 2 |
| 59 | Volkswagen | Volkswagen Bora | missing | — | — | 1 | 1 |
| 60 | Volkswagen | Volkswagen Beetle A5 | missing | — | — | 2 | 2 |
| 61 | Toyota | Toyota Starlet EP91 | missing | — | — | 1 | 1 |
| 62 | Toyota | Toyota Glanza V | missing | — | — | 1 | 1 |
| 63 | Toyota | Toyota Corolla T-Sport | partial_existing | #593 | `toyota-corolla-e120-2002-2007.webp` | 2 | 1 |
| 64 | Toyota | Toyota Altezza | missing | — | — | 2 | 2 |
| 65 | Toyota | Toyota Aristo | missing | — | — | 2 | 2 |
| 66 | Toyota | Toyota Crown Athlete | missing | — | — | 6 | 6 |
| 67 | Nissan | Nissan Elgrand E51 | missing | — | — | 2 | 2 |
| 68 | Nissan | Nissan Elgrand E52 | missing | — | — | 2 | 2 |
| 69 | Nissan | Nissan Stagea WC34 | missing | — | — | 3 | 3 |
| 70 | Nissan | Nissan Cube Z11 | missing | — | — | 2 | 2 |
| 71 | Nissan | Nissan Figaro | missing | — | — | 1 | 1 |
| 72 | Nissan | Nissan Pao | missing | — | — | 1 | 1 |
| 73 | Honda | Honda S2000 | missing | — | — | 2 | 2 |
| 74 | Honda | Honda Prelude Mk4 | missing | — | — | 1 | 1 |
| 75 | Honda | Honda Prelude Mk5 | missing | — | — | 1 | 1 |
| 76 | Honda | Honda Accord Type R | missing | — | — | 2 | 2 |
| 77 | Mitsubishi | Mitsubishi FTO | missing | — | — | 2 | 2 |
| 78 | Mitsubishi | Mitsubishi 3000GT | missing | — | — | 2 | 2 |
| 79 | Mazda | Mazda Bongo Friendee | missing | — | — | 4 | 4 |
| 80 | Subaru | Subaru Legacy GT / B4 | missing | — | — | 11 | 11 |
| 81 | Bentley | Bentley Arnage | missing | — | — | 2 | 2 |
| 82 | Bentley | Bentley Brooklands | missing | — | — | 2 | 2 |
| 83 | Bentley | Bentley Mulsanne | partial_existing | #945 | `bentley-mulsanne-2010-2020.webp` | 4 | 3 |
| 84 | Rolls-Royce | Rolls-Royce Silver Spirit | missing | — | — | 2 | 2 |
| 85 | Rolls-Royce | Rolls-Royce Silver Seraph | missing | — | — | 1 | 1 |
| 86 | Aston Martin | Aston Martin Virage | missing | — | — | 4 | 4 |
| 87 | Aston Martin | Aston Martin Rapide | missing | — | — | 2 | 2 |
| 88 | Maserati | Maserati Quattroporte V | missing | — | — | 2 | 2 |
| 89 | Maserati | Maserati GranTurismo | missing | — | — | 5 | 5 |
| 90 | Porsche | Porsche Cayman 987 | missing | — | — | 2 | 2 |
| 91 | Land Rover | Land Rover Freelander 1 | missing | — | — | 4 | 4 |
| 92 | Land Rover | Land Rover Freelander 2 | exact_existing | #499 | `land-rover-freelander-2-l359-2006-2014.webp` | 1 | 0 |
| 93 | Suzuki | Suzuki Jimny JB43 | missing | — | — | 2 | 2 |
| 94 | Suzuki | Suzuki Ignis Sport | missing | — | — | 1 | 1 |
| 95 | Isuzu | Isuzu Trooper | missing | — | — | 6 | 6 |
| 96 | Daihatsu | Daihatsu Copen | missing | — | — | 6 | 6 |
| 97 | Daihatsu | Daihatsu Hijet | missing | — | — | 12 | 12 |
| 98 | Mitsubishi | Mitsubishi Delica | missing | — | — | 6 | 6 |
| 99 | Volvo | Volvo C30 | missing | — | — | 2 | 2 |
| 100 | Volvo | Volvo 850 | missing | — | — | 2 | 2 |

## Generation/body scope and rationale for every model

Each line states generation/chassis, approximate years and body. “Reuse” retains an existing asset; “NEW” is included in the candidate JSON.

### 1. Rover 75

**Make/model:** Rover / 75. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| R40 original | 1999–2004 | saloon | NEW |
| R41 Tourer original | 2001–2004 | estate | NEW |
| R40 facelift | 2004–2005 | saloon | NEW |
| R41 Tourer facelift | 2004–2005 | estate | NEW |

Tourer and saloon need different silhouettes; one-piece 2004 lamps/front justify a facelift split. Exclude limousine/V8 bespoke grille from generic scope. [source 1](https://www.75ztcommunity.co.uk/xpdfdocuments/colinNI/buyerguide.pdf)

Current resolver samples: 75 (2001, saloon) → placeholder. These are observations, not promises of safe coverage.

### 2. Rover 200

**Make/model:** Rover / 200. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 5; **new:** 5.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| SD3 | 1984–1989 | saloon | NEW |
| R8 | 1989–1995 | hatchback | NEW |
| R8 Tomcat | 1992–1998 | coupe | NEW |
| R8 Cabriolet | 1992–1999 | convertible | NEW |
| R3 | 1995–1999 | hatchback | NEW |

Three unrelated generations; R8 coupe/cabriolet continued after hatch replacement, later cars often badged simply Coupe/Cabriolet. R8 grille/detail changes do not justify extra epochs. 400 saloon/Tourer excluded. [source 1](https://rover200.org.uk/cars/models), [source 2](https://www.rover-coupe.com/knowledge-base/history/history-of-the-coupe-1992-1996-series-1-cars/)

Current resolver samples: 200 (1986, saloon) → placeholder. These are observations, not promises of safe coverage.

### 3. Rover 25

**Make/model:** Rover / 25. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| R3 original | 1999–2004 | hatchback | NEW |
| R3 facelift | 2004–2005 | hatchback | NEW |

2004 lamp/front redesign merits two images; no separate 3/5-door, engine or Commerce trim images. Streetwise is outside the named scope. [source 1](https://rover200.org.uk/cars/models)

Current resolver samples: 25 (2001, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 4. Rover 45

**Make/model:** Rover / 45. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| HH-R original | 1999–2004 | hatchback | NEW |
| HH-R original | 1999–2004 | saloon | NEW |
| HH-R facelift | 2004–2005 | hatchback | NEW |
| HH-R facelift | 2004–2005 | saloon | NEW |

Two bodies and the 2004 front/rear redesign; no estate existed. Not the earlier Rover 400. [source 1](https://en.wikipedia.org/wiki/Rover_400_/_45)

Current resolver samples: 45 (2001, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 5. MG ZT

**Make/model:** MG / ZT. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| X10 original | 2001–2004 | saloon | NEW |
| X11 ZT-T original | 2001–2004 | estate | NEW |
| X10 facelift | 2004–2005 | saloon | NEW |
| X11 ZT-T facelift | 2004–2005 | estate | NEW |

ZT-T belongs in the family but needs an estate image. Do not collapse onto Rover 75; ZT bumpers/grille differ. 260 engine alone does not add an image. [source 1](https://www.75ztcommunity.co.uk/xpdfdocuments/colinNI/buyerguide.pdf)

Current resolver samples: ZT (2002, saloon) → placeholder. These are observations, not promises of safe coverage.

### 6. MG ZS

**Make/model:** MG / ZS. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 6; **new:** 6.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| X20 original | 2001–2004 | hatchback | NEW |
| X20 original | 2001–2004 | saloon | NEW |
| X20 facelift | 2004–2005 | hatchback | NEW |
| X20 facelift | 2004–2005 | saloon | NEW |
| X20 facelift ZS180 bodykit | 2004–2005 | hatchback | NEW |
| X20 facelift ZS180 bodykit | 2004–2005 | saloon | NEW |

Classic 2001-05 car only, not the unrelated 2017-on crossover. 180 bodykit/spoiler is a materially distinctive derivative: add its two body silhouettes below, rather than substituting the kit on all ordinary ZS cars. [source 1](https://www.mgownersclub.co.uk/mg-guides/mg-zs-saloon)

Current resolver samples: ZS (2002, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 7. MG TF

**Make/model:** MG / TF. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| TF modern | 2002–2011 | roadster | NEW |

Modern TF only, including interrupted/restarted production; not the 1953-55 TF nor MGF. Later production/LE badges alone do not create new visual generations. [source 1](https://en.wikipedia.org/wiki/MG_F_/_MG_TF)

Current resolver samples: TF (2006, roadster) → placeholder. These are observations, not promises of safe coverage.

### 8. Austin Maestro

**Make/model:** Austin / Maestro. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| LM10 | 1983–1994 | hatchback | NEW |

Austin-era family; some late cars were sold without Austin badges. MG Maestro/Turbo bodykit and later overseas production are outside scope. [source 1](https://en.wikipedia.org/wiki/Austin_Maestro)

Current resolver samples: Maestro (1988, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 9. Austin Montego

**Make/model:** Austin / Montego. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| LM11 | 1984–1993 | saloon | NEW |
| LM11 | 1984–1994 | estate | NEW |

Two bodies; grille/wheel/interior revisions alone do not need more images. Late cars may lack Austin branding; MG variants excluded. [source 1](https://en.wikipedia.org/wiki/Austin_Montego)

Current resolver samples: Montego (1988, saloon) → placeholder. These are observations, not promises of safe coverage.

### 10. Triumph Dolomite

**Make/model:** Triumph / Dolomite. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Dolomite | 1972–1980 | saloon | NEW |

Sprint shares the basic body: wheels/roof finish do not force a second image. Not the pre-war Dolomite or earlier short-nose Toledo. [source 1](https://en.wikipedia.org/wiki/Triumph_Dolomite)

Current resolver samples: Dolomite (1976, saloon) → placeholder. These are observations, not promises of safe coverage.

### 11. Triumph 2000/2500

**Make/model:** Triumph / 2000/2500. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Mk1 | 1963–1969 | saloon | NEW |
| Mk1 | 1965–1969 | estate | NEW |
| Mk2 | 1969–1977 | saloon | NEW |
| Mk2 | 1969–1977 | estate | NEW |

2000, 2.5 PI, 2500TC/S are engine/grade members of two body generations. Do not invent a 2500-only generation or duplicate 1974 grille updates. [source 1](https://triumph2000register.co.uk/docs/T2000_BuyersGuideW.pdf)

Current resolver samples: 2000/2500 (1966, saloon) → placeholder. These are observations, not promises of safe coverage.

### 12. Jaguar XJ40

**Make/model:** Jaguar / XJ. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| XJ40 | 1986–1994 | saloon | NEW |

XJ40 is a chassis/generation, not an XJ trim. XJ6/Sovereign rectangular-vs-round lamp options warrant later reference selection, not a new generation per badge. Existing Series 1-3 XJ is not equivalent. [source 1](https://www.jaguarheritage.com/vehicles/1994%20Jaguar%20Sovereign%204.0%20%28XJ40%29.pdf)

Current resolver samples: XJ40 (1990, saloon) → placeholder; XJ (1990, saloon) → placeholder. These are observations, not promises of safe coverage.

### 13. Jaguar X300

**Make/model:** Jaguar / XJ. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| X300 | 1994–1997 | saloon | NEW |

Distinct round-lamp nose from XJ40; do not include later V8 X308 under X300. XJR bumpers are derivative scope, not automatically every X300. [source 1](https://www.jaguarheritage.com/uploads/RG001O-Jaguar-and-Daimler-XJ-Series-XJ40-X300-v.2-31-03-2020.pdf)

Current resolver samples: X300 (1995, saloon) → placeholder; XJ (1995, saloon) → placeholder. These are observations, not promises of safe coverage.

### 14. Jaguar S-Type

**Make/model:** Jaguar / S-Type. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| X200/X202 | 1999–2004 | saloon | NEW |
| X204 facelift | 2004–2007 | saloon | NEW |

Interpret as modern S-Type, not 1963-68 classic. 2002 mechanical/interior revision is not an extra image; 2004 revised rear/nose is a visual epoch. [source 1](https://en.wikipedia.org/wiki/Jaguar_S-Type_(1999))

Current resolver samples: S-Type (2001, saloon) → placeholder. These are observations, not promises of safe coverage.

### 15. Jaguar XKR X100

**Make/model:** Jaguar / XKR. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| X100 | 1998–2004 | coupe | NEW |
| X100 | 1998–2004 | convertible | NEW |
| X100 facelift | 2004–2006 | coupe | NEW |
| X100 facelift | 2004–2006 | convertible | NEW |

XK8 #770 is related, but XKR has bonnet vents/mesh grille and no existing XKR alias. 2004 bumper/sill redesign retained separately; 4.0 to 4.2 engine change alone is not a split. [source 1](https://en.wikipedia.org/wiki/Jaguar_XK_(X100))

Current resolver samples: XKR X100 (2001, coupe) → placeholder; XKR (2001, coupe) → placeholder. These are observations, not promises of safe coverage.

### 16. TVR Chimaera

**Make/model:** TVR / Chimaera. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 3; **new:** 3.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Original nose | 1993–1996 | roadster | NEW |
| Revised nose | 1996–2001 | roadster | NEW |
| Faired-headlamp Mk3 | 2001–2003 | roadster | NEW |

The club documents the 1996 nose/grille revision and 2001 faired-in headlamps: three visual epochs, not one per engine. 1992 show debut is not the 1993 production start. [source 1](https://www.tvr-car-club.co.uk/tvr-chimaera.html)

Current resolver samples: Chimaera (1994, roadster) → placeholder. These are observations, not promises of safe coverage.

### 17. TVR Griffith

**Make/model:** TVR / Griffith. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| 1990s Griffith | 1992–2002 | roadster | NEW |

1990s car, not 1960s Griffith 200/400 or modern revival. Pre-cat/500 changes are not separate body generations. [source 1](https://www.tvr-car-club.co.uk/tvr-griffith.html)

Current resolver samples: Griffith (1997, roadster) → placeholder. These are observations, not promises of safe coverage.

### 18. TVR Cerbera

**Make/model:** TVR / Cerbera. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Original lamps | 1996–2000 | coupe | NEW |
| Revised lamps | 2000–2006 | coupe | NEW |

Factory 2000 lamp/roof revisions justify two visual epochs. Do not create separate 4.2, 4.5 and Speed Six images solely for engine. [source 1](https://www.tvr-car-club.co.uk/tvr-cerbera.html)

Current resolver samples: Cerbera (1998, coupe) → placeholder. These are observations, not promises of safe coverage.

### 19. Lotus Elise S1

**Make/model:** Lotus / Elise. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| S1 Type 111 | 1996–2001 | roadster | NEW |

One S1 roadster family; 111S and engine badges do not add body records. Not Exige. [source 1](https://www.lotuscars.com/en-GB/lotus-story/road-cars/elise)

Current resolver samples: Elise S1 (1998, roadster) → placeholder; Elise (1998, roadster) → placeholder. These are observations, not promises of safe coverage.

### 20. Lotus Elise S2

**Make/model:** Lotus / Elise. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| S2 Type 111 | 2001–2010 | roadster | NEW |

S2 means the sharp multi-lamp 2001-10 body. The 2010/11 facelift is commonly S3 and is outside this explicitly named S2 row; do not silently pool it. [source 1](https://www.lotuscars.com/en-GB/lotus-story/road-cars/elise)

Current resolver samples: Elise S2 (2005, roadster) → placeholder; Elise (2005, roadster) → placeholder. These are observations, not promises of safe coverage.

### 21. Ford Fiesta Mk4

**Make/model:** Ford / Fiesta. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| UK Mk4 BE91 | 1995–1999 | hatchback | NEW |

UK naming: pre-facelift BE91. 3/5-door share a representative hatch image. The current Mk6 entry is 2005-08 and cannot cover this car. [source 1](https://en.wikipedia.org/wiki/Ford_Fiesta_(fourth_generation))

Current resolver samples: Fiesta Mk4 (1997, hatchback) → placeholder; Fiesta (1997, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 22. Ford Fiesta Mk5

**Make/model:** Ford / Fiesta. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| UK Mk5 BE91 facelift | 1999–2002 | hatchback | NEW |

UK Mk5 is the New Edge facelift of Mk4, not the globally numbered fifth-generation 2002-08 car. Two list rows, two genuinely different fronts, no duplicated epoch. [source 1](https://en.wikipedia.org/wiki/Ford_Fiesta_(fourth_generation))

Current resolver samples: Fiesta Mk5 (2000, hatchback) → placeholder; Fiesta (2000, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 23. Ford Focus Mk1

**Make/model:** Ford / Focus. **Status:** partial_existing. **Ambiguous/combined name:** no. **Recommended:** 6; **new:** 5.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Mk1 original | 1998–2001 | hatchback | NEW |
| Mk1 original | 1998–2001 | saloon | NEW |
| Mk1 original | 1998–2001 | estate | NEW |
| Mk1 facelift | 2001–2004 | hatchback | NEW |
| Mk1 facelift | 2001–2004 | saloon | NEW |
| Mk1 facelift | 2001–2004 | estate | Reuse #471 |

Existing #471 is visibly an estate despite hatchback-estate metadata. Facelift appeared late 2001 for MY2002; existing row starts 2002. Pre-facelift has different headlamps/bumper; ordinary 3/5-door hatches share one image. RS/ST distinct derivatives are not promised by ordinary records. [source 1](https://en.wikipedia.org/wiki/Ford_Focus_(first_generation))

Current resolver samples: Focus Mk1 (1999, hatchback) → #471 Mk1 facelift; Focus (1999, hatchback) → #471 Mk1 facelift; Focus Mk1 (2002, hatchback) → #471 Mk1 facelift; Focus (2002, hatchback) → #471 Mk1 facelift. These are observations, not promises of safe coverage.

### 24. Ford Focus Mk2

**Make/model:** Ford / Focus. **Status:** partial_existing. **Ambiguous/combined name:** no. **Recommended:** 8; **new:** 6.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Mk2 | 2005–2008 | hatchback | Reuse #8 |
| Mk2 | 2005–2008 | saloon | NEW |
| Mk2 | 2005–2008 | estate | NEW |
| Mk2 CC | 2006–2008 | convertible | NEW |
| Mk2.5 facelift | 2008–2011 | hatchback | Reuse #7 |
| Mk2.5 facelift | 2008–2011 | saloon | NEW |
| Mk2.5 facelift | 2008–2011 | estate | NEW |
| Mk2.5 CC facelift | 2008–2010 | convertible | NEW |

Mk2 includes the major 2008 facelift and separate CC silhouette. #8 and #7 cover hatchbacks only. Model-year transitions overlap approximately; not new matching rules. [source 1](https://en.wikipedia.org/wiki/Ford_Focus_(second_generation))

Current resolver samples: Focus Mk2 (2006, hatchback) → #8 Mk2; Focus (2006, hatchback) → #8 Mk2; Focus Mk2 (2009, hatchback) → #7 Mk2.5; Focus (2009, hatchback) → #7 Mk2.5. These are observations, not promises of safe coverage.

### 25. Ford Puma Mk1

**Make/model:** Ford / Puma. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Mk1 coupe | 1997–2002 | coupe | NEW |

Original coupe, not the 2019 crossover. Racing Puma has wider bodywork and should remain a separately scoped derivative if later requested. [source 1](https://en.wikipedia.org/wiki/Ford_Puma_(sport_compact))

Current resolver samples: Puma Mk1 (1999, coupe) → placeholder; Puma (1999, coupe) → placeholder. These are observations, not promises of safe coverage.

### 26. Ford Cougar

**Make/model:** Ford / Cougar. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| MC | 1998–2002 | coupe | NEW |

One UK Cougar coupe family; minor late bumper/lamp updates do not warrant a second representative image. Not classic US Mercury Cougars. [source 1](https://en.wikipedia.org/wiki/Ford_Cougar)

Current resolver samples: Cougar (2000, coupe) → placeholder. These are observations, not promises of safe coverage.

### 27. Ford Probe

**Make/model:** Ford / Probe. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Mk2 UK | 1994–1997 | coupe | NEW |

UK-market second generation only; the 1989-92 North American Mk1 is excluded from this UK scope and must not be inferred from a bare imported Probe. [source 1](https://en.wikipedia.org/wiki/Ford_Probe)

Current resolver samples: Probe (1995, coupe) → placeholder. These are observations, not promises of safe coverage.

### 28. Ford StreetKa

**Make/model:** Ford / StreetKa. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| StreetKa | 2003–2006 | roadster | NEW |

Distinct roadster shell; no automatic alias to Ka. Production ended before some registrations; year bounds approximate. [source 1](https://en.wikipedia.org/wiki/Ford_Ka)

Current resolver samples: StreetKa (2004, roadster) → placeholder. These are observations, not promises of safe coverage.

### 29. Ford SportKa

**Make/model:** Ford / SportKa. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| SportKa | 2003–2008 | hatchback | NEW |

Ordinary Ka #983 is related but SportKa has distinct sports bumpers and no matching alias; one derivative record, not one per trim. [source 1](https://en.wikipedia.org/wiki/Ford_Ka)

Current resolver samples: SportKa (2005, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 30. Ford Galaxy Mk2

**Make/model:** Ford / Galaxy. **Status:** exact_existing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 0.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Mk2 | 2006–2015 | mpv | Reuse #575 |

Already represented, including 2010 refresh: bumper/grille detail does not justify another family image. Mk1 facelift sometimes mislabelled Mk2; use 2006-on body. [source 1](https://en.wikipedia.org/wiki/Ford_Galaxy)

Current resolver samples: Galaxy Mk2 (2010, mpv) → #575 Mk2; Galaxy (2010, mpv) → #575 Mk2. These are observations, not promises of safe coverage.

### 31. Vauxhall Corsa B

**Make/model:** Vauxhall / Corsa. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| B | 1993–2000 | hatchback | NEW |

Ordinary UK hatchback; 1997 detail facelift and 3/5-door differences do not require extra epochs. Imported saloon/pickup excluded. [source 1](https://en.wikipedia.org/wiki/Opel_Corsa)

Current resolver samples: Corsa B (1996, hatchback) → placeholder; Corsa (1996, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 32. Vauxhall Corsa C

**Make/model:** Vauxhall / Corsa. **Status:** exact_existing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 0.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| C | 2000–2006 | hatchback | Reuse #453 |

Existing image suffices for this hatch family; modest 2003 lamp/grille changes are not a mandatory extra image. [source 1](https://en.wikipedia.org/wiki/Opel_Corsa)

Current resolver samples: Corsa C (2003, hatchback) → #453 C; Corsa (2003, hatchback) → #453 C. These are observations, not promises of safe coverage.

### 33. Vauxhall Astra F

**Make/model:** Vauxhall / Astra. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| F UK Mk3 | 1991–1998 | hatchback | NEW |
| F UK Mk3 | 1991–1998 | saloon | NEW |
| F UK Mk3 | 1991–1998 | estate | NEW |
| F Cabriolet | 1993–2000 | convertible | NEW |

Astra F is UK Mk3, not existing Mk1/Mk2/G. Four silhouettes; 1994 grille revisions alone do not justify doubling them. GSi bodykit is outside ordinary scope. [source 1](https://en.wikipedia.org/wiki/Vauxhall_Astra)

Current resolver samples: Astra F (1994, hatchback) → placeholder; Astra (1994, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 34. Vauxhall Astra J

**Make/model:** Vauxhall / Astra. **Status:** partial_existing. **Ambiguous/combined name:** yes. **Recommended:** 3; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| J | 2009–2015 | hatchback | Reuse #16 |
| J Sports Tourer | 2010–2015 | estate | NEW |
| J GTC | 2011–2018 | coupe-hatchback | NEW |

Existing 5-door does not depict the lower/wider 3-door GTC or estate. 2012 mild hatch refresh not another image. Overseas J saloon not routinely sold as UK Vauxhall; deferred. VXR not represented by ordinary GTC. [source 1](https://en.wikipedia.org/wiki/Vauxhall_Astra)

Current resolver samples: Astra J (2012, hatchback) → #16 J; Astra (2012, hatchback) → #16 J. These are observations, not promises of safe coverage.

### 35. Vauxhall Vectra B

**Make/model:** Vauxhall / Vectra. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 6; **new:** 6.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| B original | 1995–1999 | hatchback | NEW |
| B original | 1995–1999 | saloon | NEW |
| B original | 1996–1999 | estate | NEW |
| B facelift | 1999–2002 | hatchback | NEW |
| B facelift | 1999–2002 | saloon | NEW |
| B facelift | 1999–2002 | estate | NEW |

1999 revised lamps/bumpers plus three bodies. Engine/trim/SRi labels alone add no records. [source 1](https://en.wikipedia.org/wiki/Opel_Vectra)

Current resolver samples: Vectra B (1997, hatchback) → placeholder; Vectra (1997, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 36. Vauxhall Vectra C

**Make/model:** Vauxhall / Vectra. **Status:** partial_existing. **Ambiguous/combined name:** no. **Recommended:** 6; **new:** 5.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| C | 2002–2005 | hatchback | NEW |
| C | 2002–2005 | saloon | NEW |
| C | 2003–2005 | estate | NEW |
| C facelift | 2005–2008 | hatchback | NEW |
| C facelift | 2005–2008 | saloon | Reuse #586 |
| C facelift | 2005–2008 | estate | NEW |

Existing #586 looks like the notchback saloon, despite hatchback-estate metadata; retain that asset, recommend the absent silhouettes and early nose. VXR is outside ordinary scope. [source 1](https://en.wikipedia.org/wiki/Opel_Vectra)

Current resolver samples: Vectra C (2003, hatchback) → #586 C facelift; Vectra (2003, hatchback) → #586 C facelift; Vectra C (2006, hatchback) → #586 C facelift; Vectra (2006, hatchback) → #586 C facelift. These are observations, not promises of safe coverage.

### 37. Vauxhall Omega

**Make/model:** Vauxhall / Omega. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| B original | 1994–1999 | saloon | NEW |
| B original | 1994–1999 | estate | NEW |
| B facelift | 1999–2003 | saloon | NEW |
| B facelift | 1999–2003 | estate | NEW |

UK Omega is B/B2 only. Opel Omega A was Vauxhall Carlton, not another Vauxhall Omega generation. No fictional Omega C. [source 1](https://www.rac.co.uk/drive/car-reviews/vauxhall/carlton/carlton-1986-1994/), [source 2](https://en.wikipedia.org/wiki/Opel_Omega)

Current resolver samples: Omega (1996, saloon) → placeholder. These are observations, not promises of safe coverage.

### 38. Vauxhall Meriva A

**Make/model:** Vauxhall / Meriva. **Status:** broader_existing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 0.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| A representative family | 2003–2010 | mpv | Reuse #507 |

#507 is labelled 2006-10 facelift, but its silhouette is a sufficient broader A-family representative: the 2006 grille/bumper refresh is modest, not a new mandatory image. The unchanged matcher already supplies this same-generation fallback for 2003-05. Meriva B is not equivalent; VXR bodykit excluded. [source 1](https://www.rac.co.uk/drive/car-reviews/vauxhall/meriva/meriva-2003-2010/)

Current resolver samples: Meriva A (2006, mpv) → #507 A facelift; Meriva (2006, mpv) → #507 A facelift. These are observations, not promises of safe coverage.

### 39. Vauxhall Signum

**Make/model:** Vauxhall / Signum. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Original | 2003–2005 | hatchback | NEW |
| Facelift | 2005–2008 | hatchback | NEW |

Distinct long-roof executive hatch, not a Vectra estate alias. Major 2005 nose update mirrors Vectra C. [source 1](https://en.wikipedia.org/wiki/Opel_Signum)

Current resolver samples: Signum (2004, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 40. Vauxhall Tigra

**Make/model:** Vauxhall / Tigra. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| A | 1994–2000 | coupe | NEW |
| B TwinTop | 2004–2009 | roadster | NEW |

Two unrelated shells: fixed-roof 2+2 versus folding-hardtop two-seater. Roof open/closed does not create two records for TwinTop. [source 1](https://en.wikipedia.org/wiki/Opel_Tigra)

Current resolver samples: Tigra (1997, coupe) → placeholder. These are observations, not promises of safe coverage.

### 41. BMW Z3

**Make/model:** BMW / Z3. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E36/7 | 1995–2002 | roadster | NEW |
| E36/8 | 1998–2002 | coupe | NEW |

Roadster and shooting-brake coupe are materially different. 1999 rear-wing/lamp refresh can share the family view; M bumpers/engine alone not another generic bucket. [source 1](https://en.wikipedia.org/wiki/BMW_Z3)

Current resolver samples: Z3 (1998, roadster) → placeholder. These are observations, not promises of safe coverage.

### 42. BMW Z4 E85

**Make/model:** BMW / Z4. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E85 | 2002–2008 | roadster | NEW |

E85 means roadster only; E86 coupe is not part of this explicit chassis request. 2006 detail facelift not mandatory for a representative image. [source 1](https://en.wikipedia.org/wiki/BMW_Z4_(E85))

Current resolver samples: Z4 E85 (2005, roadster) → placeholder; Z4 (2005, roadster) → placeholder. These are observations, not promises of safe coverage.

### 43. BMW 1 Series E81/E87

**Make/model:** BMW / 1 Series. **Status:** partial_existing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 0.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E81/E87 hatch family | 2004–2012 | hatchback | Reuse #960 |

E87 five-door (2004-11); E81 three-door (2007-12). Similar roof/body silhouette: reuse one hatch family, not two images merely for door count. Catalogue ends 2011; 2012 E81 currently resolves to the wrong F20 generation and needs identity/year-scope review, not another asset. E82/E88 excluded. [source 1](https://www.press.bmwgroup.com/united-kingdom/article/attachment/T0014727EN_GB/31234)

Current resolver samples: 1 Series E81/E87 (2008, hatchback) → #960 E87; 1 Series (2008, hatchback) → #960 E87. These are observations, not promises of safe coverage.

### 44. BMW 6 Series E63/E64

**Make/model:** BMW / 6 Series. **Status:** partial_existing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E63 | 2003–2010 | coupe | Reuse #879 |
| E64 | 2004–2010 | convertible | NEW |

#879 is visibly E63 coupe, not both bodies despite coupe-roadster metadata. Add the E64 soft-top; 2007 bumper/light details do not force four images. Existing yearFrom 2004 misses late-2003 coupe launch. [source 1](https://en.wikipedia.org/wiki/BMW_6_Series_(E63))

Current resolver samples: 6 Series E63/E64 (2006, coupe) → #879 E63/E64; 6 Series (2006, coupe) → #879 E63/E64. These are observations, not promises of safe coverage.

### 45. BMW 7 Series E38

**Make/model:** BMW / 7 Series. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E38/E38L | 1994–2001 | saloon | NEW |

One saloon shape; wheelbase and modest 1998 lamp detail do not require extra images. No 7 Series currently catalogued. [source 1](https://en.wikipedia.org/wiki/BMW_7_Series_(E38))

Current resolver samples: 7 Series E38 (1997, saloon) → placeholder; 7 Series (1997, saloon) → placeholder. These are observations, not promises of safe coverage.

### 46. BMW 7 Series E65

**Make/model:** BMW / 7 Series. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E65/E66 original | 2001–2005 | saloon | NEW |
| E65/E66 facelift | 2005–2008 | saloon | NEW |

E65 SWB/E66 LWB share image family; 2005 restyled front/rear is a material visual split. No separate engine/760Li bucket. [source 1](https://www.press.bmwgroup.com/south-africa/article/detail/T0063518EN/the-bmw-7-series-2005)

Current resolver samples: 7 Series E65 (2003, saloon) → placeholder; 7 Series (2003, saloon) → placeholder. These are observations, not promises of safe coverage.

### 47. Mercedes CLK C208

**Make/model:** Mercedes-Benz / CLK. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| C208 | 1997–2002 | coupe | NEW |

Explicit C208 coupe scope. A208 convertible is a separate body/chassis, not silently included. Later CLK/AMG bodykits not implied. [source 1](https://en.wikipedia.org/wiki/Mercedes-Benz_CLK-Class_(C208))

Current resolver samples: CLK C208 (1999, coupe) → placeholder; CLK (1999, coupe) → placeholder. These are observations, not promises of safe coverage.

### 48. Mercedes CLK C209

**Make/model:** Mercedes-Benz / CLK. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| C209 | 2002–2009 | coupe | NEW |

Explicit C209 coupe; A209 cabriolet excluded. 2005 detail revisions not another generation image. [source 1](https://en.wikipedia.org/wiki/Mercedes-Benz_CLK-Class_(C209))

Current resolver samples: CLK C209 (2005, coupe) → placeholder; CLK (2005, coupe) → placeholder. These are observations, not promises of safe coverage.

### 49. Mercedes CL C215

**Make/model:** Mercedes-Benz / CL. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| C215 | 1999–2006 | coupe | NEW |

One large coupe silhouette. Modest 2002 lamps/bumper revision does not compel a split; CL is not CLA or CLS. [source 1](https://en.wikipedia.org/wiki/Mercedes-Benz_CL-Class_(C215))

Current resolver samples: CL C215 (2002, coupe) → placeholder; CL (2002, coupe) → placeholder. These are observations, not promises of safe coverage.

### 50. Mercedes CLS C219

**Make/model:** Mercedes-Benz / CLS. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| C219 | 2004–2010 | four-door-coupe | NEW |

One low-roof four-door shape; not C218 or an ordinary E-Class alias. [source 1](https://en.wikipedia.org/wiki/Mercedes-Benz_CLS-Class_(C219))

Current resolver samples: CLS C219 (2007, four-door-coupe) → placeholder; CLS (2007, four-door-coupe) → placeholder. These are observations, not promises of safe coverage.

### 51. Mercedes SLK R170

**Make/model:** Mercedes-Benz / SLK. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| R170 | 1996–2004 | roadster | NEW |

One folding-hardtop roadster family. 2000 bumpers/side skirts are modest; no roof-open/closed duplicate. [source 1](https://en.wikipedia.org/wiki/Mercedes-Benz_SLK-Class_(R170))

Current resolver samples: SLK R170 (2000, roadster) → placeholder; SLK (2000, roadster) → placeholder. These are observations, not promises of safe coverage.

### 52. Mercedes SLK R171

**Make/model:** Mercedes-Benz / SLK. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| R171 | 2004–2011 | roadster | NEW |

Distinct F1-style nose from R170; 2008 detail facelift shares one image. AMG-specific nose not a generic SLK. [source 1](https://en.wikipedia.org/wiki/Mercedes-Benz_SLK-Class_(R171))

Current resolver samples: SLK R171 (2007, roadster) → placeholder; SLK (2007, roadster) → placeholder. These are observations, not promises of safe coverage.

### 53. Mercedes G-Class W463

**Make/model:** Mercedes-Benz / G-Class. **Status:** partial_existing. **Ambiguous/combined name:** yes. **Recommended:** 4; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| W463 original LWB | 1990–2012 | suv-five-door | Reuse #1093 |
| W463 facelift LWB | 2012–2018 | suv-five-door | Reuse #1094 |
| W463 original SWB | 1990–2011 | suv-three-door | NEW |
| W463 Cabriolet | 1990–2013 | convertible-suv | NEW |

Existing two 5-door epochs are duplicates of that part of the proposal; short hardtop/soft-top silhouette absent. SWB station wagon ended in 2011: no invented 2012 facelift SWB. W463A #1095 is a later wider body, outside original scope. #1094 also needs visual QA: AMG-like bumper under a G350 badge. Do not alias AMG G63 or G580 EQ to ordinary W463. [source 1](https://en.wikipedia.org/wiki/Mercedes-Benz_G-Class)

Current resolver samples: G-Class W463 (2001, suv-five-door) → #1093 W463; G-Class (2001, suv-five-door) → #1093 W463; G-Class W463 (2015, suv-five-door) → #1094 W463 facelift; G-Class (2015, suv-five-door) → #1094 W463 facelift. These are observations, not promises of safe coverage.

### 54. Audi A2

**Make/model:** Audi / A2. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| 8Z | 1999–2005 | hatchback | NEW |

One aluminium MPV-like hatch silhouette, not A1. Minor grille changes do not need a second image. [source 1](https://en.wikipedia.org/wiki/Audi_A2)

Current resolver samples: A2 (2002, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 55. Audi S3 8L

**Make/model:** Audi / S3. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| 8L | 1999–2003 | hatchback | NEW |

Distinct sports bumpers; no S3 row/alias to A3. Modest 2000 lamps do not justify another generation. Only 3-door 8L S3. [source 1](https://en.wikipedia.org/wiki/Audi_S3)

Current resolver samples: S3 8L (2001, hatchback) → placeholder; S3 (2001, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 56. Audi S4 B5

**Make/model:** Audi / S4. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| B5 | 1997–2001 | saloon | NEW |
| B5 Avant | 1997–2002 | estate | NEW |

Two bodies; no ordinary A4 fallback or generation by engine. 1999 detail lamps/bumpers remain one family per body. [source 1](https://en.wikipedia.org/wiki/Audi_S4)

Current resolver samples: S4 B5 (1999, saloon) → placeholder; S4 (1999, saloon) → placeholder. These are observations, not promises of safe coverage.

### 57. Audi RS4 B7

**Make/model:** Audi / RS4. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 3; **new:** 3.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| B7 | 2006–2008 | saloon | NEW |
| B7 Avant | 2006–2008 | estate | NEW |
| B7 Cabriolet | 2006–2008 | convertible | NEW |

Three genuinely different body silhouettes with RS arches/nose. Ordinary A4 B7 #962 is not RS4 coverage. [source 1](https://en.wikipedia.org/wiki/Audi_RS_4)

Current resolver samples: RS4 B7 (2007, saloon) → placeholder; RS4 (2007, saloon) → placeholder. These are observations, not promises of safe coverage.

### 58. Audi Q7 4L

**Make/model:** Audi / Q7. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| 4L original | 2006–2009 | suv | NEW |
| 4L facelift | 2009–2015 | suv | NEW |

Earlier taller body, not current 4M #495. 2009 LED/lamp and bumper redesign merits a second front view. [source 1](https://en.wikipedia.org/wiki/Audi_Q7)

Current resolver samples: Q7 4L (2007, suv) → placeholder; Q7 (2007, suv) → placeholder. These are observations, not promises of safe coverage.

### 59. Volkswagen Bora

**Make/model:** Volkswagen / Bora. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| 1J | 1998–2005 | saloon | NEW |

UK Bora saloon only. Estate was marketed as Golf Estate in the UK; overseas Bora Variant is not an additional UK Bora bucket. [source 1](https://en.wikipedia.org/wiki/Volkswagen_Bora)

Current resolver samples: Bora (2001, saloon) → placeholder. These are observations, not promises of safe coverage.

### 60. Volkswagen Beetle A5

**Make/model:** Volkswagen / Beetle. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| A5/5C | 2011–2019 | hatchback-coupe | NEW |
| A5/5C Cabriolet | 2013–2019 | convertible | NEW |

A5 is the flattened 2011 car, not 1998 New Beetle 9C or air-cooled Type 1 #820. Two roof/body forms; 2016 bumper detail not a third generation. [source 1](https://en.wikipedia.org/wiki/Volkswagen_Beetle_(A5))

Current resolver samples: Beetle A5 (2015, hatchback-coupe) → placeholder; Beetle (2015, hatchback-coupe) → placeholder. These are observations, not promises of safe coverage.

### 61. Toyota Starlet EP91

**Make/model:** Toyota / Starlet. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| P90 EP91 ordinary | 1996–1999 | hatchback | NEW |

Ordinary UK front/bonnet only. Glanza V is also EP91 but is not a duplicate image suggestion because turbo bonnet/front differ. [source 1](https://global.toyota/en/detail/7913298)

Current resolver samples: Starlet EP91 (1997, hatchback) → placeholder; Starlet (1997, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 62. Toyota Glanza V

**Make/model:** Toyota / Glanza V. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| EP91 Glanza V | 1996–1999 | hatchback | NEW |

Sport derivative of Starlet, distinct turbo bonnet/intakes and bumper. Modest 1998 revisions do not need another image; modern Indian Glanza unrelated. [source 1](https://global.toyota/en/detail/7913298)

Current resolver samples: Glanza V (1997, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 63. Toyota Corolla T-Sport

**Make/model:** Toyota / Corolla T-Sport. **Status:** partial_existing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E120 T-Sport original | 2002–2004 | hatchback | Reuse #593 |
| E120 T-Sport facelift | 2004–2005 | hatchback | NEW |

Existing ordinary E120 resembles the early T-Sport shell but is broader coverage, not a verified performance row. Facelift sports kit warrants one new asset. No automatic Compressor/2ZZ-powered global RunX merge. [source 1](https://media.toyota.co.uk/toyota-corolla-compressor-supercharged-superstar/), [source 2](https://mag.toyota.co.uk/toyota-corolla-generations-2000-2006/)

Current resolver samples: Corolla T-Sport (2003, hatchback) → #593 E120. These are observations, not promises of safe coverage.

### 64. Toyota Altezza

**Make/model:** Toyota / Altezza. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| XE10 | 1998–2005 | saloon | NEW |
| XE10 Gita | 2001–2005 | estate | NEW |

Gita must be separate. Lexus IS XE10 #657 is a related potential asset-reuse donor, not an existing cross-make matcher alias; Toyota grille/badging needs its own decision. [source 1](https://www.toyota-global.com/company/history_of_toyota/75years/vehicle_lineage/car/id60000183/index.html)

Current resolver samples: Altezza (2001, saloon) → placeholder. These are observations, not promises of safe coverage.

### 65. Toyota Aristo

**Make/model:** Toyota / Aristo. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| S140 JZS147/UZS143 | 1991–1997 | saloon | NEW |
| S160 JZS160/JZS161 | 1997–2005 | saloon | NEW |

Two distinct bodies; JZS161 turbo does not itself force another image. Existing Lexus GS is S190 (newer generation), so cannot be counted as an equivalent. [source 1](https://toyota.jp/ucar/catalog/brand-TOYOTA/car-ARISTO/)

Current resolver samples: Aristo (1994, saloon) → placeholder. These are observations, not promises of safe coverage.

### 66. Toyota Crown Athlete

**Make/model:** Toyota / Crown Athlete. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 6; **new:** 6.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| S170 Athlete | 1999–2003 | saloon | NEW |
| S170 Athlete Estate | 1999–2007 | estate | NEW |
| S180 Athlete | 2003–2008 | saloon | NEW |
| S200 Athlete | 2008–2012 | saloon | NEW |
| S210 Athlete original | 2012–2015 | saloon | NEW |
| S210 Athlete facelift | 2015–2018 | saloon | NEW |

Count modern UK-import Athlete families 1999-2018: four generations, S170 estate and substantial 2015 grille split. Athlete V estate turbo ended earlier than ordinary Athlete estate. Royal/Majesta, earlier Athlete-badged specials and later S220 RS are not pooled. [source 1](https://global.toyota/en/mobility/toyota-brand/gallery/crown.html), [source 2](https://en.wikipedia.org/wiki/Toyota_Crown)

Current resolver samples: Crown Athlete (2001, saloon) → placeholder. These are observations, not promises of safe coverage.

### 67. Nissan Elgrand E51

**Make/model:** Nissan / Elgrand. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E51 original | 2002–2004 | mpv | NEW |
| E51 facelift | 2004–2010 | mpv | NEW |

Two factory nose/lamp epochs. Highway Star/Rider/Autech grilles differ: these are representative mainline images, not universal trim/bodykit coverage; do not make extra records merely per trim badge. [source 1](https://en.wikipedia.org/wiki/Nissan_Elgrand), [source 2](https://global.nissannews.com/en/releases/020521-01?origin=channel-NNG243)

Current resolver samples: Elgrand E51 (2003, mpv) → placeholder; Elgrand (2003, mpv) → placeholder. These are observations, not promises of safe coverage.

### 68. Nissan Elgrand E52

**Make/model:** Nissan / Elgrand. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| E52 original | 2010–2014 | mpv | NEW |
| E52 Highway Star facelift | 2014–2026 | mpv | NEW |

Major 2014 grille/lamps apply to Highway Star; 250XG retained older design. One universal facelift year rule would be unsafe. 2020 grille insert revision is not another mandatory generation; endpoint is audit-year bound, not a claim production ended. [source 1](https://en.wikipedia.org/wiki/Nissan_Elgrand), [source 2](https://global.nissannews.com/en/releases/100804-01-e)

Current resolver samples: Elgrand E52 (2012, mpv) → placeholder; Elgrand (2012, mpv) → placeholder. These are observations, not promises of safe coverage.

### 69. Nissan Stagea WC34

**Make/model:** Nissan / Stagea. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 3; **new:** 3.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| WC34 Series 1 | 1996–1998 | estate | NEW |
| WC34 Series 2 | 1998–2001 | estate | NEW |
| WGNC34 Autech 260RS | 1997–2001 | estate | NEW |

Two nose/lamp treatments. Factory Autech 260RS has a distinctive bodykit and needs a separate derivative image below; no modified Skyline-front conversions. [source 1](https://en.wikipedia.org/wiki/Nissan_Stagea)

Current resolver samples: Stagea WC34 (1997, estate) → placeholder; Stagea (1997, estate) → placeholder. These are observations, not promises of safe coverage.

### 70. Nissan Cube Z11

**Make/model:** Nissan / Cube. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Z11 | 2002–2008 | mpv | NEW |
| Z11G Cube Cubic | 2003–2008 | mpv-long | NEW |

One standard Cube; longer Cube Cubic Z11G is a separate silhouette below, not a trim. Cosmetic grille updates do not create a new generation. [source 1](https://www.nissan-global.com/EN/HERITAGE_COLLECTION/466_cube_2wd_sx.html)

Current resolver samples: Cube Z11 (2005, mpv) → placeholder; Cube (2005, mpv) → placeholder. These are observations, not promises of safe coverage.

### 71. Nissan Figaro

**Make/model:** Nissan / Figaro. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| FK10 | 1991–1991 | convertible | NEW |

One retractable canvas-roof coupe; colours are not generations. Some later UK registration dates are imports, not later production. [source 1](https://en.wikipedia.org/wiki/Nissan_Figaro)

Current resolver samples: Figaro (1991, convertible) → placeholder. These are observations, not promises of safe coverage.

### 72. Nissan Pao

**Make/model:** Nissan / Pao. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| PK10 | 1989–1991 | hatchback | NEW |

Canvas/fixed roof detail can share one representative hatch image. Not Micra, Be-1 or Figaro. [source 1](https://en.wikipedia.org/wiki/Nissan_Pao)

Current resolver samples: Pao (1990, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 73. Honda S2000

**Make/model:** Honda / S2000. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| AP1 original | 1999–2003 | roadster | NEW |
| AP1 UK facelift | 2003–2009 | roadster | NEW |

UK facelift stays AP1/2.0; do not rename all later cars AP2 (US/Japan 2.2 variant). Revised lamps/bumpers justify two visuals; no roof-open/closed duplicate. [source 1](https://global.honda/en/newsroom/news/2009/4090127eng.html?from=rich_r), [source 2](https://en.wikipedia.org/wiki/Honda_S2000)

Current resolver samples: S2000 (2001, roadster) → placeholder. These are observations, not promises of safe coverage.

### 74. Honda Prelude Mk4

**Make/model:** Honda / Prelude. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| BA8/BA9/BB1-BB4 | 1991–1996 | coupe | NEW |

UK availability starts 1992; manufacture-year scope starts 1991 in Japan. Engine/4WS revisions do not split the body. [source 1](https://en.wikipedia.org/wiki/Honda_Prelude)

Current resolver samples: Prelude Mk4 (1993, coupe) → placeholder; Prelude (1993, coupe) → placeholder. These are observations, not promises of safe coverage.

### 75. Honda Prelude Mk5

**Make/model:** Honda / Prelude. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| BB5-BB9 | 1996–2001 | coupe | NEW |

One angular fifth-generation coupe. Type S/SiR grade badges are not extra bodies. [source 1](https://en.wikipedia.org/wiki/Honda_Prelude)

Current resolver samples: Prelude Mk5 (1998, coupe) → placeholder; Prelude (1998, coupe) → placeholder. These are observations, not promises of safe coverage.

### 76. Honda Accord Type R

**Make/model:** Honda / Accord Type R. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| CH1 original | 1998–2001 | saloon | NEW |
| CH1 facelift | 2001–2002 | saloon | NEW |

UK/European CH1 with factory wing; not Japanese CL1/CL7 Euro R and not ordinary Mk8 #559. Facelift front/bumpers retained as distinct visual treatment. [source 1](https://global.honda/en/stories/048.html)

Current resolver samples: Accord Type R (1999, saloon) → placeholder. These are observations, not promises of safe coverage.

### 77. Mitsubishi FTO

**Make/model:** Mitsubishi / FTO. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| DE2A/DE3A original | 1994–1997 | coupe | NEW |
| DE2A/DE3A facelift | 1997–2000 | coupe | NEW |

1997 front bumper/foglamp layout changes materially. Engine/GX/GPX labels alone do not add records. [source 1](https://en.wikipedia.org/wiki/Mitsubishi_FTO)

Current resolver samples: FTO (1995, coupe) → placeholder. These are observations, not promises of safe coverage.

### 78. Mitsubishi 3000GT

**Make/model:** Mitsubishi / 3000GT. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Z16A UK pop-up lamps | 1992–1994 | coupe | NEW |
| Z16A UK fixed lamps | 1994–2000 | coupe | NEW |

UK specification has two principal faces. Do not blindly import every later JDM GTO/US VR-4 bumper or Spyder into UK 3000GT scope. [source 1](https://www.rac.co.uk/drive/car-reviews/mitsubishi/3000gt/3000gt-1992-1999/), [source 2](https://forum.gto.club/t/gto-3000gt-model-differences/17692)

Current resolver samples: 3000GT (1993, coupe) → placeholder. These are observations, not promises of safe coverage.

### 79. Mazda Bongo Friendee

**Make/model:** Mazda / Bongo Friendee. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| SG original tin-top | 1995–1999 | mpv | NEW |
| SG original Auto Free Top | 1995–1999 | camper-mpv | NEW |
| SG facelift tin-top | 1999–2005 | mpv | NEW |
| SG facelift Auto Free Top | 1999–2005 | camper-mpv | NEW |

Separate factory AFT roof silhouette from tin-top, plus 1999 nose. Show AFT roof closed but recognisable; do not add every aftermarket camper conversion or generic Bongo commercial van. [source 1](https://newsroom.mazda.com/en/publicity/release/2001/200109/0920e.html), [source 2](https://en.wikipedia.org/wiki/Mazda_Bongo)

Current resolver samples: Bongo Friendee (1997, mpv) → placeholder. These are observations, not promises of safe coverage.

### 80. Subaru Legacy GT / B4

**Make/model:** Subaru / Legacy GT / B4. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 11; **new:** 11.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| BF GT | 1989–1993 | estate | NEW |
| BG GT | 1993–1998 | estate | NEW |
| BE B4 | 1998–2003 | saloon | NEW |
| BH GT | 1998–2003 | estate | NEW |
| BL B4 original | 2003–2006 | saloon | NEW |
| BP GT original | 2003–2006 | estate | NEW |
| BL B4 facelift | 2006–2009 | saloon | NEW |
| BP GT facelift | 2006–2009 | estate | NEW |
| BM B4/GT | 2009–2014 | saloon | NEW |
| BR GT | 2009–2014 | estate | NEW |
| BN B4 | 2014–2020 | saloon | NEW |

GT is a grade and B4 a sedan name, not a single generation. Scope JDM/UK-import GT wagons and B4 sedans; B4 can be non-turbo (do not depict a bonnet scoop universally). Earlier turbo sedans were RS, not automatically B4. Outback/Lancaster and global NA GT permutations excluded. [source 1](https://en.wikipedia.org/wiki/Subaru_Legacy), [source 2](https://ucar.subaru.jp/php/catalog/type.php?car_cd=10451010), [source 3](https://www.subaru.co.jp/en/news/archives/press/2005/05_03_15e.html)

Current resolver samples: Legacy GT / B4 (1991, estate) → placeholder. These are observations, not promises of safe coverage.

### 81. Bentley Arnage

**Make/model:** Bentley / Arnage. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Original | 1998–2004 | saloon | NEW |
| Facelift | 2004–2009 | saloon | NEW |

2005-model-year separate round headlamps/nose merit a split. Green/Red Label and R/T engines alone are not extra body generations; long-wheelbase limousines excluded. [source 1](https://en.wikipedia.org/wiki/Bentley_Arnage)

Current resolver samples: Arnage (2001, saloon) → placeholder. These are observations, not promises of safe coverage.

### 82. Bentley Brooklands

**Make/model:** Bentley / Brooklands. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| SZ saloon | 1992–1998 | saloon | NEW |
| Brooklands Coupe | 2008–2011 | coupe | NEW |

Two unrelated uses: 1992 launch/1993 model-year angular saloon and later two-door coupe. Must not be one 1992-2011 generation. [source 1](https://en.wikipedia.org/wiki/Bentley_Brooklands), [source 2](https://www.bentleymotors.com/uk/en/about-bentley/history-and-heritage.html)

Current resolver samples: Brooklands (1995, saloon) → placeholder. These are observations, not promises of safe coverage.

### 83. Bentley Mulsanne

**Make/model:** Bentley / Mulsanne. **Status:** partial_existing. **Ambiguous/combined name:** yes. **Recommended:** 4; **new:** 3.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| SZ rectangular lamps | 1980–1989 | saloon | NEW |
| SZ Mulsanne S round lamps | 1989–1992 | saloon | NEW |
| Modern original | 2010–2016 | saloon | Reuse #945 |
| Modern facelift | 2016–2020 | saloon | NEW |

Two unrelated generations. Split SZ at the 1989 round-headlamp change, not at the 1987 introduction of the S badge; retain modern facelift nose separately. #945 is modern original only, despite Mk1/2010-20 broad metadata. Speed badges and EWB length do not automatically demand extra images. [source 1](https://www.rrsilverspirit.com/models/), [source 2](https://en.wikipedia.org/wiki/Bentley_Mulsanne_(1980%E2%80%931992)), [source 3](https://www.bentleymotors.com/en/about-bentley/history-and-heritage/mulsanne.html)

Current resolver samples: Mulsanne (1984, saloon) → placeholder; Mulsanne (2013, saloon) → #945 Mk1. These are observations, not promises of safe coverage.

### 84. Rolls-Royce Silver Spirit

**Make/model:** Rolls-Royce / Silver Spirit. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| SZ Spirit I-III | 1980–1995 | saloon | NEW |
| SZ New Silver Spirit | 1995–1997 | saloon | NEW |

I/II/III largely retain the same exterior family; late lower bonnet/grille/bumpers justify second visual. Often called IV unofficially; not an official four-series naming rule. Silver Spur/LWB and coachbuilt limousines are different names excluded. [source 1](https://www.rrsilverspirit.com/models/), [source 2](https://en.wikipedia.org/wiki/Rolls-Royce_Silver_Spirit)

Current resolver samples: Silver Spirit (1987, saloon) → placeholder. These are observations, not promises of safe coverage.

### 85. Rolls-Royce Silver Seraph

**Make/model:** Rolls-Royce / Silver Seraph. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Silver Seraph | 1998–2002 | saloon | NEW |

One standard saloon. Park Ward LWB is a separately named derivative excluded; do not reuse Phantom VII. [source 1](https://www.rrsilverspirit.com/models/), [source 2](https://en.wikipedia.org/wiki/Rolls-Royce_Silver_Seraph)

Current resolver samples: Silver Seraph (2000, saloon) → placeholder. These are observations, not promises of safe coverage.

### 86. Aston Martin Virage

**Make/model:** Aston Martin / Virage. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| V8 Virage | 1989–1995 | coupe | NEW |
| V8 Virage Volante | 1992–1996 | convertible | NEW |
| VH Virage | 2011–2012 | coupe | NEW |
| VH Virage Volante | 2011–2012 | convertible | NEW |

Two unrelated generations, each coupe/Volante. Later V8 Coupe/V8 Volante renamed successors and bespoke Works 6.3 widebody conversions excluded. Do not use DB9 #897 as an automatic alias. [source 1](https://en.wikipedia.org/wiki/Aston_Martin_Virage), [source 2](https://media.astonmartin.com/virage/)

Current resolver samples: Virage (1992, coupe) → placeholder. These are observations, not promises of safe coverage.

### 87. Aston Martin Rapide

**Make/model:** Aston Martin / Rapide. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| Rapide original | 2010–2013 | liftback | NEW |
| Rapide S | 2013–2020 | liftback | NEW |

Full-height grille changes S front materially. AMR cosmetics not another mandatory base-family image; historic Lagonda Rapide is another marque/model, not included. [source 1](https://media.astonmartin.com/rapide-2/), [source 2](https://astonmartins.com/car/rapide-s/)

Current resolver samples: Rapide (2011, liftback) → placeholder. These are observations, not promises of safe coverage.

### 88. Maserati Quattroporte V

**Make/model:** Maserati / Quattroporte. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| M139 original | 2003–2008 | saloon | NEW |
| M139 facelift | 2008–2012 | saloon | NEW |

Fifth generation only. 2008 lamp/grille revision a visual epoch; DuoSelect/automatic and 4.2/4.7 changes alone not splits. [source 1](https://www.evo.co.uk/maserati/quattroporte/6204/maserati-quattroporte-v-2003-2012-review-specs-and-buying-guide)

Current resolver samples: Quattroporte V (2005, saloon) → placeholder; Quattroporte (2005, saloon) → placeholder. These are observations, not promises of safe coverage.

### 89. Maserati GranTurismo

**Make/model:** Maserati / GranTurismo. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 5; **new:** 5.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| M145 original | 2007–2012 | coupe | NEW |
| M145 Sport nose | 2012–2017 | coupe | NEW |
| M145 facelift | 2017–2019 | coupe | NEW |
| M189 ICE | 2023–2026 | coupe | NEW |
| M189 Folgore | 2023–2026 | coupe | NEW |

Two chassis generations; first-generation 2012 Sport and 2017 redesigned noses differ visually. New Folgore has distinct closed/aero front from ICE; Modena/Trofeo trim differences alone not another bucket. GranCabrio is a different named body excluded. 2026 is audit scope, not production end. [source 1](https://www.media.stellantis.com/us-en/maserati/press/maserati-granturismo-and-grancabrio-range-come-home-a-new-chapter-begins-in-modena), [source 2](https://www.maserati.com/global/en/models/granturismo), [source 3](https://www.media.stellantis.com/uk-en/maserati/press/maserati-granturismo-sport-world-debut-at-the-geneva-international-motor-show-2012)

Current resolver samples: GranTurismo (2009, coupe) → placeholder. These are observations, not promises of safe coverage.

### 90. Porsche Cayman 987

**Make/model:** Porsche / Cayman. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| 987.1 | 2005–2008 | coupe | NEW |
| 987.2 | 2009–2012 | coupe | NEW |

Porsche dates facelift from autumn 2008 for MY2009. Revised front/rear lamps/bumpers merit two; S/PDK engine specs alone no extra records, no Boxster alias. [source 1](https://www.porsche.com/usa/accessoriesandservice/classic/models/987c/987c/)

Current resolver samples: Cayman 987 (2006, coupe) → placeholder; Cayman (2006, coupe) → placeholder. These are observations, not promises of safe coverage.

### 91. Land Rover Freelander 1

**Make/model:** Land Rover / Freelander 1. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 4; **new:** 4.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| L314 original | 1997–2003 | suv-five-door | NEW |
| L314 original | 1997–2003 | suv-three-door | NEW |
| L314 facelift | 2003–2006 | suv-five-door | NEW |
| L314 facelift | 2003–2006 | suv-three-door | NEW |

2003 calendar-year/MY2004 major nose update; three-door removable-roof silhouette differs from five-door. Hardback/softback can use one closed-roof three-door view; no two images solely roof position. [source 1](https://en.wikipedia.org/wiki/Land_Rover_Freelander)

Current resolver samples: Freelander 1 (2000, suv-five-door) → placeholder. These are observations, not promises of safe coverage.

### 92. Land Rover Freelander 2

**Make/model:** Land Rover / Freelander 2. **Status:** exact_existing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 0.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| L359 | 2006–2014 | suv | Reuse #499 |

Existing five-door represents the single generation. 2010/2012 lamp/grille detail does not force additional records; never substitute for L314. [source 1](https://en.wikipedia.org/wiki/Land_Rover_Freelander)

Current resolver samples: Freelander 2 (2010, suv) → #499 L359. These are observations, not promises of safe coverage.

### 93. Suzuki Jimny JB43

**Make/model:** Suzuki / Jimny. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| JB43 original | 2000–2012 | suv-three-door | NEW |
| JB43 facelift | 2012–2018 | suv-three-door | NEW |

JB43 is M13A-era wide-body Sierra, not every 1998-on Jimny (JB33) or kei JB23. 2012 bonnet/bumper visual change deserves two. Santana soft-tops require a confirmed actual JB43 identity before recommending an extra chassis-specific image. [source 1](https://en.wikipedia.org/wiki/Suzuki_Jimny)

Current resolver samples: Jimny JB43 (2006, suv-three-door) → placeholder; Jimny (2006, suv-three-door) → placeholder. These are observations, not promises of safe coverage.

### 94. Suzuki Ignis Sport

**Make/model:** Suzuki / Ignis Sport. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 1; **new:** 1.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| HT81S Sport | 2003–2005 | hatchback | NEW |

Distinct three-door sports shell/bodykit from newer MF crossover #271. Ordinary Ignis and Swift Sport are not aliases. [source 1](https://en.wikipedia.org/wiki/Suzuki_Ignis)

Current resolver samples: Ignis Sport (2004, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 95. Isuzu Trooper

**Make/model:** Isuzu / Trooper. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 6; **new:** 6.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| UBS Mk1 SWB | 1981–1991 | suv-three-door | NEW |
| UBS Mk1 LWB | 1984–1991 | suv-five-door | NEW |
| UBS Mk2 original SWB | 1992–1998 | suv-three-door | NEW |
| UBS Mk2 original LWB | 1991–1998 | suv-five-door | NEW |
| UBS Mk2 facelift SWB | 1998–2002 | suv-three-door | NEW |
| UBS Mk2 facelift LWB | 1998–2002 | suv-five-door | NEW |

Two generations; major second-generation 1998 nose update, plus SWB/LWB silhouettes. Bighorn/Monterey may be related but no current equivalent catalogue alias. Engine badges not separate records. [source 1](https://en.wikipedia.org/wiki/Isuzu_Trooper)

Current resolver samples: Trooper (1986, suv-three-door) → placeholder. These are observations, not promises of safe coverage.

### 96. Daihatsu Copen

**Make/model:** Daihatsu / Copen. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 6; **new:** 6.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| L880/L881 | 2002–2012 | roadster | NEW |
| LA400 Robe | 2014–2026 | roadster | NEW |
| LA400 XPLAY | 2014–2024 | roadster | NEW |
| LA400 Cero | 2015–2026 | roadster | NEW |
| LA400 GR Sport | 2019–2026 | roadster | NEW |
| LA400 Copen Coupe | 2019–2019 | coupe | NEW |

Original UK car plus JDM-import second generation. Robe/XPLAY/Cero/GR have different actual front/body panels, not wheel/seat trims; Copen Coupe is fixed-roof limited production. L880 660 and L881 1.3 share one silhouette. Later variants are lower-priority imports. [source 1](https://www.daihatsu.com/news/2021/20210407-2.html), [source 2](https://www.daihatsu.com/news/2016/20160404-2.html), [source 3](https://en.wikipedia.org/wiki/Daihatsu_Copen)

Current resolver samples: Copen (2007, roadster) → placeholder. These are observations, not promises of safe coverage.

### 97. Daihatsu Hijet

**Make/model:** Daihatsu / Hijet. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 12; **new:** 12.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| S65/S70 | 1981–1986 | van | NEW |
| S65/S70 | 1981–1986 | pickup | NEW |
| S80/S85 export family | 1986–2007 | van | NEW |
| S80/S85 export family | 1986–2007 | pickup | NEW |
| S100/S110 JDM | 1994–1998 | van | NEW |
| S100/S110 JDM | 1994–1998 | pickup | NEW |
| S200/S210 Cargo | 1999–2004 | van | NEW |
| S200/S201/S210/S211 Truck | 1999–2014 | pickup | NEW |
| S320/S321/S330/S331 Cargo original | 2004–2017 | van | NEW |
| S321/S331 Cargo facelift | 2017–2021 | van | NEW |
| S500/S510 Truck | 2014–2026 | pickup | NEW |
| S700/S710 Cargo | 2021–2026 | van | NEW |

UK-relevant 1981-on vans/pickups plus later JDM import families: passenger Atrai and specialist conversions excluded. Export S85/Piaggio-built lineage persisted after newer JDM generations; do not apply one global year cutoff. 2026 is audit bound, not claimed production end. Pre-1981 global generations deferred as outside this working UK scope. [source 1](https://en.wikipedia.org/wiki/Daihatsu_Hijet), [source 2](https://www.daihatsu.com/news/2020/20201102-2.pdf), [source 3](https://www.daihatsu.com/company/history/main_1985.html)

Current resolver samples: Hijet (1983, van) → placeholder. These are observations, not promises of safe coverage.

### 98. Mitsubishi Delica

**Make/model:** Mitsubishi / Delica. **Status:** missing. **Ambiguous/combined name:** yes. **Recommended:** 6; **new:** 6.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| L300 second generation | 1979–1986 | mpv | NEW |
| L300 Star Wagon third generation | 1986–1999 | mpv | NEW |
| L400 Space Gear original | 1994–1997 | mpv | NEW |
| L400 Space Gear facelift | 1997–2007 | mpv | NEW |
| D5 original | 2007–2019 | mpv | NEW |
| D5 facelift | 2019–2026 | mpv | NEW |

Scope the familiar UK-import passenger families, not every commercial Delica since 1968. L300/L400/D5 differ materially; L400 1997 and D5 2019 fronts need separate views. D2/D3/Delica Mini rebadges and commercial pickups/vans are deferred, not merged. Petrol D5 retained old face after diesel facelift: fuel/year alone cannot identify it. [source 1](https://en.wikipedia.org/wiki/Mitsubishi_Delica), [source 2](https://www.mitsubishi-motors.com/en/newsrelease/images/download/pdf/p_230406_p_1422.pdf)

Current resolver samples: Delica (1982, mpv) → placeholder. These are observations, not promises of safe coverage.

### 99. Volvo C30

**Make/model:** Volvo / C30. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| P14 original | 2006–2009 | hatchback | NEW |
| P14 facelift | 2009–2013 | hatchback | NEW |

One generation, two materially different noses (MY2010 facelift). R-Design trim alone does not add another image. [source 1](https://www.volvocars.com/uk/media/models/c30/2006/), [source 2](https://en.wikipedia.org/wiki/Volvo_C30)

Current resolver samples: C30 (2007, hatchback) → placeholder. These are observations, not promises of safe coverage.

### 100. Volvo 850

**Make/model:** Volvo / 850. **Status:** missing. **Ambiguous/combined name:** no. **Recommended:** 2; **new:** 2.

| Generation / chassis | Approx years | Body | Decision |
| --- | --- | --- | --- |
| P80 | 1991–1997 | saloon | NEW |
| P80 | 1993–1997 | estate | NEW |

Two body silhouettes. Minor 1994 lamp/bumper changes share the same body family. T-5R/R factory bodykit is a distinct derivative, not implied by the generic request. [source 1](https://en.wikipedia.org/wiki/Volvo_850)

Current resolver samples: 850 (1994, saloon) → placeholder. These are observations, not promises of safe coverage.

## Duplicate suggestions and misleading apparent overlaps

Fully covered suggestions: Ford Galaxy Mk2 (#575); Vauxhall Corsa C (#453); Vauxhall Meriva A (#507); Land Rover Freelander 2 (#499). Do not create duplicate rows/assets for these.

Partly redundant suggestions: Ford Focus Mk1; Ford Focus Mk2; Vauxhall Astra J; Vauxhall Vectra C; BMW 1 Series E81/E87; BMW 6 Series E63/E64; Mercedes G-Class W463; Toyota Corolla T-Sport; Bentley Mulsanne. Reuse their existing pieces; add only the missing scopes in the JSON. BMW E81/E87 needs scope review, not another essentially identical hatch image.

No duplicate list entries were found. Fiesta Mk4/Mk5 are different visual phases of BE91, not duplicate pictures. Starlet EP91/Glanza V share a chassis but have visibly different ordinary/turbo fronts. XJ40/X300, Elise S1/S2, Focus Mk1/Mk2, Vectra B/C, Mercedes chassis pairs, Elgrand E51/E52 and Freelander 1/2 are real distinct visual families. Shared platform does not authorise shared images for MG/Rover or Toyota/Lexus.

## Ambiguities and corrections to review before any additions

- **BMW E81/E87:** E81 three-door runs to 2012, E87 five-door ends 2011. One representative hatch is enough visually, but a 2012 E81 currently resolves to F20. This is a scope/matcher issue, not a reason to invent a new generation.
- **BMW E63/E64:** #879 is a coupe. The compound coupe-roadster label cannot cover E64 soft-top; yearFrom 2004 also misses the 2003 coupe start.
- **Focus Mk1:** #471 is an estate. Hatchbacks currently receive it too. The facelift appeared late 2001 (MY2002); the catalogue starts 2002, so boundary-year decisions need actual vehicle clues.
- **Vectra C:** #586 visually resembles the saloon but says hatchback-estate. Reuse the asset as the pictured silhouette after metadata review, rather than generating a second identical saloon.
- **Bentley Mulsanne:** #945 is the original modern nose, not 1980s SZ or 2016-on facelift. Do not label the entire worldwide name history Mk1. SZ round lamps start around 1989, not simply when S was introduced.
- **G-Class:** #1094 has AMG-like bumper/intake treatment despite G350 badging. Review the image's derivative fidelity before claiming exact standard-G350 depiction; replacement/repair under the existing row is not counted as a NEW catalogue record here. No post-2011 SWB facelift is recommended.
- **Classic MG ZS:** modern crossover rows #274/#604 are unrelated. With a 2003 year the matcher correctly returns placeholder; with no year it can show a modern ZS. That is not classic coverage.
- **Performance:** ordinary Corolla #593 currently matches T-Sport text, but cannot guarantee the later T-Sport bodykit. XKR has no XK8 alias; S3/S4/RS4 cannot inherit unrelated ordinary A images. ZS180/260RS bodykits need positive identity evidence if ever catalogued.
- **Triumph 2000/2500:** four buckets from two generations × two bodies; engine and injection names do not multiply them.
- **Crown Athlete:** four modern generations plus S170 wagon and S210 facelift. Athlete V turbo wagon has a shorter production scope than the wider Athlete Estate family; a future matcher must preserve that distinction. Royal/Majesta/S220 RS are not equivalent.
- **Legacy GT / B4:** GT is not one model generation and B4 does not mean turbo. Use chassis/body/grade; never put a scoop on all B4 sedans. Outback and North American GT trim histories are outside these scoped candidates.
- **Elgrand:** E52 facelift shape depends on grade; 250XG retained the older exterior after the Highway Star update. Year alone is insufficient. Rider/Autech noses require later explicit visual decisions; mainline representatives do not promise those bodykits.
- **Silver Spirit:** I–III can share a visual family; the late New Spirit merits another image, not four arbitrary series pictures. Silver Spur is separately named.
- **Virage:** V8 1989-era and VH 2011-era cars, each coupe/Volante, must stay separate. Renamed later V8 successors and bespoke Works conversions are deferred.
- **Hijet:** export/Piaggio-derived S85 and JDM generations overlap in time; standard pickup cab and van are separate. Atrai, Jumbo/crew/special conversions and pre-1981 history are deferred. Do not turn these overlapping years into unconditional aliases.
- **Delica:** L300 Star Wagon/L400 Space Gear/D5 passenger scope only. Petrol D5 can retain the older face after the 2019 diesel update. D2/D3/Mini and commercial body histories need separately scoped work.
- **Copen:** actual Robe/XPLAY/Cero/GR front-panel designs are not mere equipment trims; the limited fixed-roof Coupe is a different silhouette. Newer import variants are deliberately lower priority than the original UK L880/L881.

## Highest-priority 20 completely missing vehicles

This ordering is editorial judgement for practical UK coverage, not measured parc or lookup demand. Each priority covers the stated family; begin with its common body before rarer secondary bodies. Partially covered Focus/Astra/Vectra bodies remain useful follow-on work but are not mixed into this completely-missing top 20.

1. **Rover 75** — 4 new record(s). Broad UK saloon/estate gap; distinctive late-Rover identity.
2. **Rover 200** — 5 new record(s). Three genuine generations and surviving coupe/cabriolet bodies.
3. **Rover 25** — 2 new record(s). Everyday UK hatchback with a clear 2004 visual change.
4. **Rover 45** — 4 new record(s). Ordinary UK saloon/hatchback completely absent.
5. **MG ZT** — 4 new record(s). Recognisable British sports saloon and ZT-T estate absent.
6. **MG ZS** — 6 new record(s). Classic MG identity absent; modern ZS is a different car.
7. **MG TF** — 1 new record(s). Recognisable UK roadster currently missing.
8. **Ford Fiesta Mk4** — 1 new record(s). Common older UK Fiesta shape missing.
9. **Ford Fiesta Mk5** — 1 new record(s). Distinct New Edge UK Fiesta shape missing.
10. **Vauxhall Astra F** — 4 new record(s). Older UK Astra hatch/saloon/estate/cabriolet gap.
11. **Vauxhall Vectra B** — 6 new record(s). Older UK Vectra family completely absent.
12. **Vauxhall Omega** — 4 new record(s). Distinctive UK saloon and estate with no suitable image.
13. **BMW Z3** — 2 new record(s). Recognisable roadster plus materially different coupe.
14. **BMW Z4 E85** — 1 new record(s). Recognisable first-generation Z4 roadster.
15. **Audi A2** — 1 new record(s). Unique aluminium hatch silhouette, no near equivalent.
16. **Volvo C30** — 2 new record(s). Distinctive UK three-door Volvo absent.
17. **Volvo 850** — 2 new record(s). Recognisable Volvo saloon/estate family absent.
18. **Land Rover Freelander 1** — 4 new record(s). Freelander 2 cannot represent the original three/five-door body.
19. **Nissan Elgrand E51** — 2 new record(s). Established UK-import MPV family with distinctive tall body.
20. **Honda S2000** — 2 new record(s). Recognisable Japanese sports roadster with two lamp/nose epochs.

## Validation and unchanged-source checks

Candidate JSON is a plain array containing only NEW recommendations. No existing catalogue entries, final IDs or allocated filenames are emitted. Each candidate has make/model, generation, approximate year bounds, body, rationale, source URLs, scope-review flag and parent proposal index. ExistingRecordIds are references only.

Validation recomputes all counts from the 100-row plan, checks unique candidate identities, valid integer year order, required fields, existing reference IDs/assets and no exact duplicate of a current catalogue identity. Resolver samples were executed against the unmodified exported matcher for every proposed scope and for specific troublesome boundary/body/alias cases. All local catalogue/matcher/docs/image hashes and directory names are verified unchanged after writing the two requested files. The existing image resolver regression suite is run separately; final validation results are recorded with delivery.

## Actual resolver diagnostic samples

These are observed current results, including wrong-body/generation and yearless-name collisions. They are not counted as correct image coverage. Parent coverage status in the candidate JSON refers to the whole proposal; candidateStatus always identifies a NEW recommendation.

| Input make/model | Year / body | Returned record | Filename | Match / ambiguity |
| --- | --- | --- | --- | --- |
| BMW 1 Series E81 | 2012 / hatchback | #61 F20 | `bmw-1-series-f20-2011-2015.webp` | exact |
| BMW 6 Series E64 | 2007 / convertible | #879 E63/E64 | `bmw-6-series-e63-2004-2010.webp` | exact |
| Ford Focus | 2003 / hatchback | #471 Mk1 facelift | `ford-focus-mk1-facelift-2002-2004.webp` | exact |
| Vauxhall Vectra | 2007 / estate | #586 C facelift | `vauxhall-vectra-c-facelift-2005-2008.webp` | exact |
| MG ZS | 2003 / saloon | placeholder | — | placeholder |
| MG ZS | missing year / saloon | #274 Mk1 facelift | `mg-zs-mk1-facelift-2020-2024.webp` | nearest-generation / ambiguous |
| Toyota Corolla T-Sport | 2005 / hatchback | #593 E120 | `toyota-corolla-e120-2002-2007.webp` | exact |
| Toyota Altezza | 2002 / saloon | placeholder | — | placeholder |
| Jaguar XKR | 2002 / coupe | placeholder | — | placeholder |
| Mercedes G-Class W463 | 2005 / suv-three-door | #1093 W463 | `mercedes-benz-g-class-w463-1990-2012.webp` | exact |
| Ford Fiesta Mk5 | 2001 / hatchback | placeholder | — | placeholder |
| Ford Fiesta Mk5 | 2006 / hatchback | #3 Mk6 | `ford-fiesta-mk6-2005-2008.webp` | exact |
| Ford Galaxy Mk2 | 2002 / mpv | placeholder | — | placeholder |
| Vauxhall Meriva | 2003 / mpv | #507 A facelift | `vauxhall-meriva-a-facelift-2006-2010.webp` | nearest-generation |

Final checks: PASS — JSON parses with 236 unique NEW recommendations across 95 suggestions needing assets; all 100 proposals appear in the report. PASS — npm run test:images (existing resolver regression suite). PASS — all 1,094 image hashes/filenames, the catalogue, matcher, image tests and generation documentation match their pre-audit hashes. No catalogue entries or image files were added. No commit or staging was performed. data/classics-image-candidates.json is covered by the repository's existing /data/* ignore rule; that rule was not changed by this task.

