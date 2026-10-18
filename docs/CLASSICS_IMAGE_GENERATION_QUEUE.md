# Classics image generation queue

Source: `data/classics-image-candidates.json`. Catalogue baseline: `data/vehicle-images.json`. Every one of the **236** source candidates is retained, including lower-priority vehicles and all generation/body/facelift/derivative splits. No research scope has been removed or changed.

| Allocation | Value |
| --- | ---: |
| Highest existing catalogue ID | 1099 |
| First assigned ID | 1100 |
| Last assigned ID | 1335 |
| New records | 236 |
| Batches | 24 |
| Full batches of 10 | 23 |
| Records in final batch | 6 |
| Omitted source candidates | 0 |

IDs map to the catalogue's existing numeric `priority` field when a future approved import occurs; `id` is the queue field. IDs are sequential in **generation order**, not original candidate-file order. Each queue entry keeps its 1-based sourceCandidateIndex and the complete original sourceCandidate for a lossless audit trail. This queue is not a runtime catalogue and no rows have been inserted into vehicle-images.json.

## Batch strategy

The first pass takes one NEW scope for each of the 95 proposed models with candidates: iconic/unusual, British classics, JDM, German classics/performance, luxury/prestige, then mainstream nostalgia. The first ten deliberately mix distinctive sports cars and unusual imports. Further visual generations, facelifts, body styles and factory derivatives then follow in family groups. All lower-priority records remain scheduled. No candidate is silently approved for a wider identity than its audit scope.

| Queue category | Records |
| --- | ---: |
| Iconic / unusual / interesting cars | 19 |
| British classics | 15 |
| JDM / Japanese UK and import classics | 18 |
| German classics / performance | 20 |
| Luxury / prestige | 9 |
| Mainstream nostalgic cars | 14 |
| Remaining generations / facelifts / variants / body styles | 141 |

Each batch contains ten records except the unavoidable final batch of 6; there is no padding or invented vehicle. Batches are operational chunks, so a category/family may continue across a boundary.

## Exact filenames and identity preservation

Every filename is final for this queue, lowercase ASCII and ends in the source year pair plus .webp. Make, model, generation/chassis, years and body are retained verbatim in the JSON. Body is included in filenames to separate estates, saloons, coupes, convertibles and other silhouettes. A slash or decimal becomes a filename hyphen; only redundant Griffith/Glanza model text is omitted from filename generation components. Single-year Figaro/Copen Coupe scopes keep repeated year endpoints. No IDs or filenames have been written back to the candidate file.

Existing audit notes, approximate-year status, source links and scope-review flags remain in each sourceCandidate. Allocation does not resolve documented ambiguity or make overlapping year/body records safe for runtime matching. No matcher changes are part of this queue.

The existing image standard is retained: 1000×750 WebP, white studio, front three-quarter, vehicle facing left, full vehicle/all wheels visible, realistic factory colours and AVI2 CAR front plate where fitted. No image files are created by this task.

## Batches

### Batch 1 — IDs 1100–1109 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1100 | TVR | Griffith | 1990s Griffith | 1992 | 2002 | roadster | `tvr-griffith-roadster-1992-2002.webp` | 46 |
| 1101 | TVR | Chimaera | Original nose | 1993 | 1996 | roadster | `tvr-chimaera-original-nose-roadster-1993-1996.webp` | 43 |
| 1102 | TVR | Cerbera | Original lamps | 1996 | 2000 | coupe | `tvr-cerbera-original-lamps-coupe-1996-2000.webp` | 47 |
| 1103 | Lotus | Elise | S1 Type 111 | 1996 | 2001 | roadster | `lotus-elise-s1-type-111-roadster-1996-2001.webp` | 49 |
| 1104 | Lotus | Elise | S2 Type 111 | 2001 | 2010 | roadster | `lotus-elise-s2-type-111-roadster-2001-2010.webp` | 50 |
| 1105 | Honda | S2000 | AP1 original | 1999 | 2003 | roadster | `honda-s2000-ap1-original-roadster-1999-2003.webp` | 146 |
| 1106 | Nissan | Figaro | FK10 | 1991 | 1991 | convertible | `nissan-figaro-fk10-convertible-1991-1991.webp` | 144 |
| 1107 | Nissan | Pao | PK10 | 1989 | 1991 | hatchback | `nissan-pao-pk10-hatchback-1989-1991.webp` | 145 |
| 1108 | Toyota | Glanza V | EP91 Glanza V | 1996 | 1999 | hatchback | `toyota-glanza-v-ep91-hatchback-1996-1999.webp` | 123 |
| 1109 | Mitsubishi | FTO | DE2A/DE3A original | 1994 | 1997 | coupe | `mitsubishi-fto-de2a-de3a-original-coupe-1994-1997.webp` | 152 |

### Batch 2 — IDs 1110–1119 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1110 | Mitsubishi | 3000GT | Z16A UK pop-up lamps | 1992 | 1994 | coupe | `mitsubishi-3000gt-z16a-uk-pop-up-lamps-coupe-1992-1994.webp` | 154 |
| 1111 | Daihatsu | Copen | L880/L881 | 2002 | 2012 | roadster | `daihatsu-copen-l880-l881-roadster-2002-2012.webp` | 209 |
| 1112 | Nissan | Stagea | WC34 Series 1 | 1996 | 1998 | estate | `nissan-stagea-wc34-series-1-estate-1996-1998.webp` | 139 |
| 1113 | Ford | Puma | Mk1 coupe | 1997 | 2002 | coupe | `ford-puma-mk1-coupe-coupe-1997-2002.webp` | 64 |
| 1114 | Ford | Cougar | MC | 1998 | 2002 | coupe | `ford-cougar-mc-coupe-1998-2002.webp` | 65 |
| 1115 | Ford | Probe | Mk2 UK | 1994 | 1997 | coupe | `ford-probe-mk2-uk-coupe-1994-1997.webp` | 66 |
| 1116 | Ford | StreetKa | StreetKa | 2003 | 2006 | roadster | `ford-streetka-streetka-roadster-2003-2006.webp` | 67 |
| 1117 | Ford | SportKa | SportKa | 2003 | 2008 | hatchback | `ford-sportka-sportka-hatchback-2003-2008.webp` | 68 |
| 1118 | Jaguar | XKR | X100 | 1998 | 2004 | coupe | `jaguar-xkr-x100-coupe-1998-2004.webp` | 39 |
| 1119 | Rover | 75 | R40 original | 1999 | 2004 | saloon | `rover-75-r40-original-saloon-1999-2004.webp` | 1 |

### Batch 3 — IDs 1120–1129 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1120 | Rover | 200 | SD3 | 1984 | 1989 | saloon | `rover-200-sd3-saloon-1984-1989.webp` | 5 |
| 1121 | Rover | 25 | R3 original | 1999 | 2004 | hatchback | `rover-25-r3-original-hatchback-1999-2004.webp` | 10 |
| 1122 | Rover | 45 | HH-R original | 1999 | 2004 | hatchback | `rover-45-hh-r-original-hatchback-1999-2004.webp` | 12 |
| 1123 | MG | ZT | X10 original | 2001 | 2004 | saloon | `mg-zt-x10-original-saloon-2001-2004.webp` | 16 |
| 1124 | MG | ZS | X20 original | 2001 | 2004 | hatchback | `mg-zs-x20-original-hatchback-2001-2004.webp` | 20 |
| 1125 | MG | TF | TF modern | 2002 | 2011 | roadster | `mg-tf-tf-modern-roadster-2002-2011.webp` | 26 |
| 1126 | Austin | Maestro | LM10 | 1983 | 1994 | hatchback | `austin-maestro-lm10-hatchback-1983-1994.webp` | 27 |
| 1127 | Austin | Montego | LM11 | 1984 | 1993 | saloon | `austin-montego-lm11-saloon-1984-1993.webp` | 28 |
| 1128 | Triumph | Dolomite | Dolomite | 1972 | 1980 | saloon | `triumph-dolomite-dolomite-saloon-1972-1980.webp` | 30 |
| 1129 | Triumph | 2000/2500 | Mk1 | 1963 | 1969 | saloon | `triumph-2000-2500-mk1-saloon-1963-1969.webp` | 31 |

### Batch 4 — IDs 1130–1139 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1130 | Jaguar | XJ | XJ40 | 1986 | 1994 | saloon | `jaguar-xj-xj40-saloon-1986-1994.webp` | 35 |
| 1131 | Jaguar | XJ | X300 | 1994 | 1997 | saloon | `jaguar-xj-x300-saloon-1994-1997.webp` | 36 |
| 1132 | Jaguar | S-Type | X200/X202 | 1999 | 2004 | saloon | `jaguar-s-type-x200-x202-saloon-1999-2004.webp` | 37 |
| 1133 | Land Rover | Freelander 1 | L314 original | 1997 | 2003 | suv-five-door | `land-rover-freelander-1-l314-original-suv-five-door-1997-2003.webp` | 196 |
| 1134 | Toyota | Starlet | P90 EP91 ordinary | 1996 | 1999 | hatchback | `toyota-starlet-p90-ep91-ordinary-hatchback-1996-1999.webp` | 122 |
| 1135 | Toyota | Corolla T-Sport | E120 T-Sport facelift | 2004 | 2005 | hatchback | `toyota-corolla-t-sport-e120-t-sport-facelift-hatchback-2004-2005.webp` | 124 |
| 1136 | Toyota | Altezza | XE10 | 1998 | 2005 | saloon | `toyota-altezza-xe10-saloon-1998-2005.webp` | 125 |
| 1137 | Toyota | Aristo | S140 JZS147/UZS143 | 1991 | 1997 | saloon | `toyota-aristo-s140-jzs147-uzs143-saloon-1991-1997.webp` | 127 |
| 1138 | Toyota | Crown Athlete | S170 Athlete | 1999 | 2003 | saloon | `toyota-crown-athlete-s170-athlete-saloon-1999-2003.webp` | 129 |
| 1139 | Nissan | Elgrand | E51 original | 2002 | 2004 | mpv | `nissan-elgrand-e51-original-mpv-2002-2004.webp` | 135 |

### Batch 5 — IDs 1140–1149 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1140 | Nissan | Elgrand | E52 original | 2010 | 2014 | mpv | `nissan-elgrand-e52-original-mpv-2010-2014.webp` | 137 |
| 1141 | Nissan | Cube | Z11 | 2002 | 2008 | mpv | `nissan-cube-z11-mpv-2002-2008.webp` | 142 |
| 1142 | Honda | Prelude | BA8/BA9/BB1-BB4 | 1991 | 1996 | coupe | `honda-prelude-ba8-ba9-bb1-bb4-coupe-1991-1996.webp` | 148 |
| 1143 | Honda | Prelude | BB5-BB9 | 1996 | 2001 | coupe | `honda-prelude-bb5-bb9-coupe-1996-2001.webp` | 149 |
| 1144 | Honda | Accord Type R | CH1 original | 1998 | 2001 | saloon | `honda-accord-type-r-ch1-original-saloon-1998-2001.webp` | 150 |
| 1145 | Mazda | Bongo Friendee | SG original tin-top | 1995 | 1999 | mpv | `mazda-bongo-friendee-sg-original-tin-top-mpv-1995-1999.webp` | 156 |
| 1146 | Subaru | Legacy GT / B4 | BF GT | 1989 | 1993 | estate | `subaru-legacy-gt-b4-bf-gt-estate-1989-1993.webp` | 160 |
| 1147 | Suzuki | Jimny | JB43 original | 2000 | 2012 | suv-three-door | `suzuki-jimny-jb43-original-suv-three-door-2000-2012.webp` | 200 |
| 1148 | Suzuki | Ignis Sport | HT81S Sport | 2003 | 2005 | hatchback | `suzuki-ignis-sport-ht81s-sport-hatchback-2003-2005.webp` | 202 |
| 1149 | Isuzu | Trooper | UBS Mk1 SWB | 1981 | 1991 | suv-three-door | `isuzu-trooper-ubs-mk1-swb-suv-three-door-1981-1991.webp` | 203 |

### Batch 6 — IDs 1150–1159 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1150 | Daihatsu | Hijet | S65/S70 | 1981 | 1986 | van | `daihatsu-hijet-s65-s70-van-1981-1986.webp` | 215 |
| 1151 | Mitsubishi | Delica | L300 second generation | 1979 | 1986 | mpv | `mitsubishi-delica-l300-second-generation-mpv-1979-1986.webp` | 227 |
| 1152 | BMW | Z3 | E36/7 | 1995 | 2002 | roadster | `bmw-z3-e36-7-roadster-1995-2002.webp` | 95 |
| 1153 | BMW | Z4 | E85 | 2002 | 2008 | roadster | `bmw-z4-e85-roadster-2002-2008.webp` | 97 |
| 1154 | BMW | 6 Series | E64 | 2004 | 2010 | convertible | `bmw-6-series-e64-convertible-2004-2010.webp` | 98 |
| 1155 | BMW | 7 Series | E38/E38L | 1994 | 2001 | saloon | `bmw-7-series-e38-e38l-saloon-1994-2001.webp` | 99 |
| 1156 | BMW | 7 Series | E65/E66 original | 2001 | 2005 | saloon | `bmw-7-series-e65-e66-original-saloon-2001-2005.webp` | 100 |
| 1157 | Mercedes-Benz | CLK | C208 | 1997 | 2002 | coupe | `mercedes-benz-clk-c208-coupe-1997-2002.webp` | 102 |
| 1158 | Mercedes-Benz | CLK | C209 | 2002 | 2009 | coupe | `mercedes-benz-clk-c209-coupe-2002-2009.webp` | 103 |
| 1159 | Mercedes-Benz | CL | C215 | 1999 | 2006 | coupe | `mercedes-benz-cl-c215-coupe-1999-2006.webp` | 104 |

### Batch 7 — IDs 1160–1169 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1160 | Mercedes-Benz | CLS | C219 | 2004 | 2010 | four-door-coupe | `mercedes-benz-cls-c219-four-door-coupe-2004-2010.webp` | 105 |
| 1161 | Mercedes-Benz | SLK | R170 | 1996 | 2004 | roadster | `mercedes-benz-slk-r170-roadster-1996-2004.webp` | 106 |
| 1162 | Mercedes-Benz | SLK | R171 | 2004 | 2011 | roadster | `mercedes-benz-slk-r171-roadster-2004-2011.webp` | 107 |
| 1163 | Mercedes-Benz | G-Class | W463 original SWB | 1990 | 2011 | suv-three-door | `mercedes-benz-g-class-w463-original-swb-suv-three-door-1990-2011.webp` | 108 |
| 1164 | Audi | A2 | 8Z | 1999 | 2005 | hatchback | `audi-a2-8z-hatchback-1999-2005.webp` | 110 |
| 1165 | Audi | S3 | 8L | 1999 | 2003 | hatchback | `audi-s3-8l-hatchback-1999-2003.webp` | 111 |
| 1166 | Audi | S4 | B5 | 1997 | 2001 | saloon | `audi-s4-b5-saloon-1997-2001.webp` | 112 |
| 1167 | Audi | RS4 | B7 | 2006 | 2008 | saloon | `audi-rs4-b7-saloon-2006-2008.webp` | 114 |
| 1168 | Audi | Q7 | 4L original | 2006 | 2009 | suv | `audi-q7-4l-original-suv-2006-2009.webp` | 117 |
| 1169 | Volkswagen | Bora | 1J | 1998 | 2005 | saloon | `volkswagen-bora-1j-saloon-1998-2005.webp` | 119 |

### Batch 8 — IDs 1170–1179 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1170 | Volkswagen | Beetle | A5/5C | 2011 | 2019 | hatchback-coupe | `volkswagen-beetle-a5-5c-hatchback-coupe-2011-2019.webp` | 120 |
| 1171 | Porsche | Cayman | 987.1 | 2005 | 2008 | coupe | `porsche-cayman-987-1-coupe-2005-2008.webp` | 194 |
| 1172 | Bentley | Arnage | Original | 1998 | 2004 | saloon | `bentley-arnage-original-saloon-1998-2004.webp` | 171 |
| 1173 | Bentley | Brooklands | SZ saloon | 1992 | 1998 | saloon | `bentley-brooklands-sz-saloon-saloon-1992-1998.webp` | 173 |
| 1174 | Bentley | Mulsanne | SZ rectangular lamps | 1980 | 1989 | saloon | `bentley-mulsanne-sz-rectangular-lamps-saloon-1980-1989.webp` | 175 |
| 1175 | Rolls-Royce | Silver Spirit | SZ Spirit I-III | 1980 | 1995 | saloon | `rolls-royce-silver-spirit-sz-spirit-i-iii-saloon-1980-1995.webp` | 178 |
| 1176 | Rolls-Royce | Silver Seraph | Silver Seraph | 1998 | 2002 | saloon | `rolls-royce-silver-seraph-silver-seraph-saloon-1998-2002.webp` | 180 |
| 1177 | Aston Martin | Virage | V8 Virage | 1989 | 1995 | coupe | `aston-martin-virage-v8-virage-coupe-1989-1995.webp` | 181 |
| 1178 | Aston Martin | Rapide | Rapide original | 2010 | 2013 | liftback | `aston-martin-rapide-rapide-original-liftback-2010-2013.webp` | 185 |
| 1179 | Maserati | Quattroporte | M139 original | 2003 | 2008 | saloon | `maserati-quattroporte-m139-original-saloon-2003-2008.webp` | 187 |

### Batch 9 — IDs 1180–1189 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1180 | Maserati | GranTurismo | M145 original | 2007 | 2012 | coupe | `maserati-granturismo-m145-original-coupe-2007-2012.webp` | 189 |
| 1181 | Ford | Fiesta | UK Mk4 BE91 | 1995 | 1999 | hatchback | `ford-fiesta-uk-mk4-be91-hatchback-1995-1999.webp` | 51 |
| 1182 | Ford | Fiesta | UK Mk5 BE91 facelift | 1999 | 2002 | hatchback | `ford-fiesta-uk-mk5-be91-facelift-hatchback-1999-2002.webp` | 52 |
| 1183 | Ford | Focus | Mk1 original | 1998 | 2001 | hatchback | `ford-focus-mk1-original-hatchback-1998-2001.webp` | 53 |
| 1184 | Ford | Focus | Mk2 | 2005 | 2008 | saloon | `ford-focus-mk2-saloon-2005-2008.webp` | 58 |
| 1185 | Vauxhall | Corsa | B | 1993 | 2000 | hatchback | `vauxhall-corsa-b-hatchback-1993-2000.webp` | 69 |
| 1186 | Vauxhall | Astra | F UK Mk3 | 1991 | 1998 | hatchback | `vauxhall-astra-f-uk-mk3-hatchback-1991-1998.webp` | 70 |
| 1187 | Vauxhall | Astra | J Sports Tourer | 2010 | 2015 | estate | `vauxhall-astra-j-sports-tourer-estate-2010-2015.webp` | 74 |
| 1188 | Vauxhall | Vectra | B original | 1995 | 1999 | hatchback | `vauxhall-vectra-b-original-hatchback-1995-1999.webp` | 76 |
| 1189 | Vauxhall | Vectra | C | 2002 | 2005 | hatchback | `vauxhall-vectra-c-hatchback-2002-2005.webp` | 82 |

### Batch 10 — IDs 1190–1199 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1190 | Vauxhall | Omega | B original | 1994 | 1999 | saloon | `vauxhall-omega-b-original-saloon-1994-1999.webp` | 87 |
| 1191 | Vauxhall | Signum | Original | 2003 | 2005 | hatchback | `vauxhall-signum-original-hatchback-2003-2005.webp` | 91 |
| 1192 | Vauxhall | Tigra | A | 1994 | 2000 | coupe | `vauxhall-tigra-a-coupe-1994-2000.webp` | 93 |
| 1193 | Volvo | C30 | P14 original | 2006 | 2009 | hatchback | `volvo-c30-p14-original-hatchback-2006-2009.webp` | 233 |
| 1194 | Volvo | 850 | P80 | 1991 | 1997 | saloon | `volvo-850-p80-saloon-1991-1997.webp` | 235 |
| 1195 | TVR | Chimaera | Revised nose | 1996 | 2001 | roadster | `tvr-chimaera-revised-nose-roadster-1996-2001.webp` | 44 |
| 1196 | TVR | Chimaera | Faired-headlamp Mk3 | 2001 | 2003 | roadster | `tvr-chimaera-faired-headlamp-mk3-roadster-2001-2003.webp` | 45 |
| 1197 | TVR | Cerbera | Revised lamps | 2000 | 2006 | coupe | `tvr-cerbera-revised-lamps-coupe-2000-2006.webp` | 48 |
| 1198 | Honda | S2000 | AP1 UK facelift | 2003 | 2009 | roadster | `honda-s2000-ap1-uk-facelift-roadster-2003-2009.webp` | 147 |
| 1199 | Mitsubishi | FTO | DE2A/DE3A facelift | 1997 | 2000 | coupe | `mitsubishi-fto-de2a-de3a-facelift-coupe-1997-2000.webp` | 153 |

### Batch 11 — IDs 1200–1209 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1200 | Mitsubishi | 3000GT | Z16A UK fixed lamps | 1994 | 2000 | coupe | `mitsubishi-3000gt-z16a-uk-fixed-lamps-coupe-1994-2000.webp` | 155 |
| 1201 | Daihatsu | Copen | LA400 Robe | 2014 | 2026 | roadster | `daihatsu-copen-la400-robe-roadster-2014-2026.webp` | 210 |
| 1202 | Daihatsu | Copen | LA400 XPLAY | 2014 | 2024 | roadster | `daihatsu-copen-la400-xplay-roadster-2014-2024.webp` | 211 |
| 1203 | Daihatsu | Copen | LA400 Cero | 2015 | 2026 | roadster | `daihatsu-copen-la400-cero-roadster-2015-2026.webp` | 212 |
| 1204 | Daihatsu | Copen | LA400 GR Sport | 2019 | 2026 | roadster | `daihatsu-copen-la400-gr-sport-roadster-2019-2026.webp` | 213 |
| 1205 | Daihatsu | Copen | LA400 Copen Coupe | 2019 | 2019 | coupe | `daihatsu-copen-la400-copen-coupe-coupe-2019-2019.webp` | 214 |
| 1206 | Nissan | Stagea | WC34 Series 2 | 1998 | 2001 | estate | `nissan-stagea-wc34-series-2-estate-1998-2001.webp` | 140 |
| 1207 | Nissan | Stagea | WGNC34 Autech 260RS | 1997 | 2001 | estate | `nissan-stagea-wgnc34-autech-260rs-estate-1997-2001.webp` | 141 |
| 1208 | Jaguar | XKR | X100 | 1998 | 2004 | convertible | `jaguar-xkr-x100-convertible-1998-2004.webp` | 40 |
| 1209 | Jaguar | XKR | X100 facelift | 2004 | 2006 | coupe | `jaguar-xkr-x100-facelift-coupe-2004-2006.webp` | 41 |

### Batch 12 — IDs 1210–1219 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1210 | Jaguar | XKR | X100 facelift | 2004 | 2006 | convertible | `jaguar-xkr-x100-facelift-convertible-2004-2006.webp` | 42 |
| 1211 | Rover | 75 | R41 Tourer original | 2001 | 2004 | estate | `rover-75-r41-tourer-original-estate-2001-2004.webp` | 2 |
| 1212 | Rover | 75 | R40 facelift | 2004 | 2005 | saloon | `rover-75-r40-facelift-saloon-2004-2005.webp` | 3 |
| 1213 | Rover | 75 | R41 Tourer facelift | 2004 | 2005 | estate | `rover-75-r41-tourer-facelift-estate-2004-2005.webp` | 4 |
| 1214 | Rover | 200 | R8 | 1989 | 1995 | hatchback | `rover-200-r8-hatchback-1989-1995.webp` | 6 |
| 1215 | Rover | 200 | R8 Tomcat | 1992 | 1998 | coupe | `rover-200-r8-tomcat-coupe-1992-1998.webp` | 7 |
| 1216 | Rover | 200 | R8 Cabriolet | 1992 | 1999 | convertible | `rover-200-r8-cabriolet-convertible-1992-1999.webp` | 8 |
| 1217 | Rover | 200 | R3 | 1995 | 1999 | hatchback | `rover-200-r3-hatchback-1995-1999.webp` | 9 |
| 1218 | Rover | 25 | R3 facelift | 2004 | 2005 | hatchback | `rover-25-r3-facelift-hatchback-2004-2005.webp` | 11 |
| 1219 | Rover | 45 | HH-R original | 1999 | 2004 | saloon | `rover-45-hh-r-original-saloon-1999-2004.webp` | 13 |

### Batch 13 — IDs 1220–1229 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1220 | Rover | 45 | HH-R facelift | 2004 | 2005 | hatchback | `rover-45-hh-r-facelift-hatchback-2004-2005.webp` | 14 |
| 1221 | Rover | 45 | HH-R facelift | 2004 | 2005 | saloon | `rover-45-hh-r-facelift-saloon-2004-2005.webp` | 15 |
| 1222 | MG | ZT | X11 ZT-T original | 2001 | 2004 | estate | `mg-zt-x11-zt-t-original-estate-2001-2004.webp` | 17 |
| 1223 | MG | ZT | X10 facelift | 2004 | 2005 | saloon | `mg-zt-x10-facelift-saloon-2004-2005.webp` | 18 |
| 1224 | MG | ZT | X11 ZT-T facelift | 2004 | 2005 | estate | `mg-zt-x11-zt-t-facelift-estate-2004-2005.webp` | 19 |
| 1225 | MG | ZS | X20 original | 2001 | 2004 | saloon | `mg-zs-x20-original-saloon-2001-2004.webp` | 21 |
| 1226 | MG | ZS | X20 facelift | 2004 | 2005 | hatchback | `mg-zs-x20-facelift-hatchback-2004-2005.webp` | 22 |
| 1227 | MG | ZS | X20 facelift | 2004 | 2005 | saloon | `mg-zs-x20-facelift-saloon-2004-2005.webp` | 23 |
| 1228 | MG | ZS | X20 facelift ZS180 bodykit | 2004 | 2005 | hatchback | `mg-zs-x20-facelift-zs180-bodykit-hatchback-2004-2005.webp` | 24 |
| 1229 | MG | ZS | X20 facelift ZS180 bodykit | 2004 | 2005 | saloon | `mg-zs-x20-facelift-zs180-bodykit-saloon-2004-2005.webp` | 25 |

### Batch 14 — IDs 1230–1239 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1230 | Austin | Montego | LM11 | 1984 | 1994 | estate | `austin-montego-lm11-estate-1984-1994.webp` | 29 |
| 1231 | Triumph | 2000/2500 | Mk1 | 1965 | 1969 | estate | `triumph-2000-2500-mk1-estate-1965-1969.webp` | 32 |
| 1232 | Triumph | 2000/2500 | Mk2 | 1969 | 1977 | saloon | `triumph-2000-2500-mk2-saloon-1969-1977.webp` | 33 |
| 1233 | Triumph | 2000/2500 | Mk2 | 1969 | 1977 | estate | `triumph-2000-2500-mk2-estate-1969-1977.webp` | 34 |
| 1234 | Jaguar | S-Type | X204 facelift | 2004 | 2007 | saloon | `jaguar-s-type-x204-facelift-saloon-2004-2007.webp` | 38 |
| 1235 | Land Rover | Freelander 1 | L314 original | 1997 | 2003 | suv-three-door | `land-rover-freelander-1-l314-original-suv-three-door-1997-2003.webp` | 197 |
| 1236 | Land Rover | Freelander 1 | L314 facelift | 2003 | 2006 | suv-five-door | `land-rover-freelander-1-l314-facelift-suv-five-door-2003-2006.webp` | 198 |
| 1237 | Land Rover | Freelander 1 | L314 facelift | 2003 | 2006 | suv-three-door | `land-rover-freelander-1-l314-facelift-suv-three-door-2003-2006.webp` | 199 |
| 1238 | Toyota | Altezza | XE10 Gita | 2001 | 2005 | estate | `toyota-altezza-xe10-gita-estate-2001-2005.webp` | 126 |
| 1239 | Toyota | Aristo | S160 JZS160/JZS161 | 1997 | 2005 | saloon | `toyota-aristo-s160-jzs160-jzs161-saloon-1997-2005.webp` | 128 |

### Batch 15 — IDs 1240–1249 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1240 | Toyota | Crown Athlete | S170 Athlete Estate | 1999 | 2007 | estate | `toyota-crown-athlete-s170-athlete-estate-estate-1999-2007.webp` | 130 |
| 1241 | Toyota | Crown Athlete | S180 Athlete | 2003 | 2008 | saloon | `toyota-crown-athlete-s180-athlete-saloon-2003-2008.webp` | 131 |
| 1242 | Toyota | Crown Athlete | S200 Athlete | 2008 | 2012 | saloon | `toyota-crown-athlete-s200-athlete-saloon-2008-2012.webp` | 132 |
| 1243 | Toyota | Crown Athlete | S210 Athlete original | 2012 | 2015 | saloon | `toyota-crown-athlete-s210-athlete-original-saloon-2012-2015.webp` | 133 |
| 1244 | Toyota | Crown Athlete | S210 Athlete facelift | 2015 | 2018 | saloon | `toyota-crown-athlete-s210-athlete-facelift-saloon-2015-2018.webp` | 134 |
| 1245 | Nissan | Elgrand | E51 facelift | 2004 | 2010 | mpv | `nissan-elgrand-e51-facelift-mpv-2004-2010.webp` | 136 |
| 1246 | Nissan | Elgrand | E52 Highway Star facelift | 2014 | 2026 | mpv | `nissan-elgrand-e52-highway-star-facelift-mpv-2014-2026.webp` | 138 |
| 1247 | Nissan | Cube | Z11G Cube Cubic | 2003 | 2008 | mpv-long | `nissan-cube-z11g-cube-cubic-mpv-long-2003-2008.webp` | 143 |
| 1248 | Honda | Accord Type R | CH1 facelift | 2001 | 2002 | saloon | `honda-accord-type-r-ch1-facelift-saloon-2001-2002.webp` | 151 |
| 1249 | Mazda | Bongo Friendee | SG original Auto Free Top | 1995 | 1999 | camper-mpv | `mazda-bongo-friendee-sg-original-auto-free-top-camper-mpv-1995-1999.webp` | 157 |

### Batch 16 — IDs 1250–1259 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1250 | Mazda | Bongo Friendee | SG facelift tin-top | 1999 | 2005 | mpv | `mazda-bongo-friendee-sg-facelift-tin-top-mpv-1999-2005.webp` | 158 |
| 1251 | Mazda | Bongo Friendee | SG facelift Auto Free Top | 1999 | 2005 | camper-mpv | `mazda-bongo-friendee-sg-facelift-auto-free-top-camper-mpv-1999-2005.webp` | 159 |
| 1252 | Subaru | Legacy GT / B4 | BG GT | 1993 | 1998 | estate | `subaru-legacy-gt-b4-bg-gt-estate-1993-1998.webp` | 161 |
| 1253 | Subaru | Legacy GT / B4 | BE B4 | 1998 | 2003 | saloon | `subaru-legacy-gt-b4-be-b4-saloon-1998-2003.webp` | 162 |
| 1254 | Subaru | Legacy GT / B4 | BH GT | 1998 | 2003 | estate | `subaru-legacy-gt-b4-bh-gt-estate-1998-2003.webp` | 163 |
| 1255 | Subaru | Legacy GT / B4 | BL B4 original | 2003 | 2006 | saloon | `subaru-legacy-gt-b4-bl-b4-original-saloon-2003-2006.webp` | 164 |
| 1256 | Subaru | Legacy GT / B4 | BP GT original | 2003 | 2006 | estate | `subaru-legacy-gt-b4-bp-gt-original-estate-2003-2006.webp` | 165 |
| 1257 | Subaru | Legacy GT / B4 | BL B4 facelift | 2006 | 2009 | saloon | `subaru-legacy-gt-b4-bl-b4-facelift-saloon-2006-2009.webp` | 166 |
| 1258 | Subaru | Legacy GT / B4 | BP GT facelift | 2006 | 2009 | estate | `subaru-legacy-gt-b4-bp-gt-facelift-estate-2006-2009.webp` | 167 |
| 1259 | Subaru | Legacy GT / B4 | BM B4/GT | 2009 | 2014 | saloon | `subaru-legacy-gt-b4-bm-b4-gt-saloon-2009-2014.webp` | 168 |

### Batch 17 — IDs 1260–1269 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1260 | Subaru | Legacy GT / B4 | BR GT | 2009 | 2014 | estate | `subaru-legacy-gt-b4-br-gt-estate-2009-2014.webp` | 169 |
| 1261 | Subaru | Legacy GT / B4 | BN B4 | 2014 | 2020 | saloon | `subaru-legacy-gt-b4-bn-b4-saloon-2014-2020.webp` | 170 |
| 1262 | Suzuki | Jimny | JB43 facelift | 2012 | 2018 | suv-three-door | `suzuki-jimny-jb43-facelift-suv-three-door-2012-2018.webp` | 201 |
| 1263 | Isuzu | Trooper | UBS Mk1 LWB | 1984 | 1991 | suv-five-door | `isuzu-trooper-ubs-mk1-lwb-suv-five-door-1984-1991.webp` | 204 |
| 1264 | Isuzu | Trooper | UBS Mk2 original SWB | 1992 | 1998 | suv-three-door | `isuzu-trooper-ubs-mk2-original-swb-suv-three-door-1992-1998.webp` | 205 |
| 1265 | Isuzu | Trooper | UBS Mk2 original LWB | 1991 | 1998 | suv-five-door | `isuzu-trooper-ubs-mk2-original-lwb-suv-five-door-1991-1998.webp` | 206 |
| 1266 | Isuzu | Trooper | UBS Mk2 facelift SWB | 1998 | 2002 | suv-three-door | `isuzu-trooper-ubs-mk2-facelift-swb-suv-three-door-1998-2002.webp` | 207 |
| 1267 | Isuzu | Trooper | UBS Mk2 facelift LWB | 1998 | 2002 | suv-five-door | `isuzu-trooper-ubs-mk2-facelift-lwb-suv-five-door-1998-2002.webp` | 208 |
| 1268 | Daihatsu | Hijet | S65/S70 | 1981 | 1986 | pickup | `daihatsu-hijet-s65-s70-pickup-1981-1986.webp` | 216 |
| 1269 | Daihatsu | Hijet | S80/S85 export family | 1986 | 2007 | van | `daihatsu-hijet-s80-s85-export-family-van-1986-2007.webp` | 217 |

### Batch 18 — IDs 1270–1279 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1270 | Daihatsu | Hijet | S80/S85 export family | 1986 | 2007 | pickup | `daihatsu-hijet-s80-s85-export-family-pickup-1986-2007.webp` | 218 |
| 1271 | Daihatsu | Hijet | S100/S110 JDM | 1994 | 1998 | van | `daihatsu-hijet-s100-s110-jdm-van-1994-1998.webp` | 219 |
| 1272 | Daihatsu | Hijet | S100/S110 JDM | 1994 | 1998 | pickup | `daihatsu-hijet-s100-s110-jdm-pickup-1994-1998.webp` | 220 |
| 1273 | Daihatsu | Hijet | S200/S210 Cargo | 1999 | 2004 | van | `daihatsu-hijet-s200-s210-cargo-van-1999-2004.webp` | 221 |
| 1274 | Daihatsu | Hijet | S200/S201/S210/S211 Truck | 1999 | 2014 | pickup | `daihatsu-hijet-s200-s201-s210-s211-truck-pickup-1999-2014.webp` | 222 |
| 1275 | Daihatsu | Hijet | S320/S321/S330/S331 Cargo original | 2004 | 2017 | van | `daihatsu-hijet-s320-s321-s330-s331-cargo-original-van-2004-2017.webp` | 223 |
| 1276 | Daihatsu | Hijet | S321/S331 Cargo facelift | 2017 | 2021 | van | `daihatsu-hijet-s321-s331-cargo-facelift-van-2017-2021.webp` | 224 |
| 1277 | Daihatsu | Hijet | S500/S510 Truck | 2014 | 2026 | pickup | `daihatsu-hijet-s500-s510-truck-pickup-2014-2026.webp` | 225 |
| 1278 | Daihatsu | Hijet | S700/S710 Cargo | 2021 | 2026 | van | `daihatsu-hijet-s700-s710-cargo-van-2021-2026.webp` | 226 |
| 1279 | Mitsubishi | Delica | L300 Star Wagon third generation | 1986 | 1999 | mpv | `mitsubishi-delica-l300-star-wagon-third-generation-mpv-1986-1999.webp` | 228 |

### Batch 19 — IDs 1280–1289 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1280 | Mitsubishi | Delica | L400 Space Gear original | 1994 | 1997 | mpv | `mitsubishi-delica-l400-space-gear-original-mpv-1994-1997.webp` | 229 |
| 1281 | Mitsubishi | Delica | L400 Space Gear facelift | 1997 | 2007 | mpv | `mitsubishi-delica-l400-space-gear-facelift-mpv-1997-2007.webp` | 230 |
| 1282 | Mitsubishi | Delica | D5 original | 2007 | 2019 | mpv | `mitsubishi-delica-d5-original-mpv-2007-2019.webp` | 231 |
| 1283 | Mitsubishi | Delica | D5 facelift | 2019 | 2026 | mpv | `mitsubishi-delica-d5-facelift-mpv-2019-2026.webp` | 232 |
| 1284 | BMW | Z3 | E36/8 | 1998 | 2002 | coupe | `bmw-z3-e36-8-coupe-1998-2002.webp` | 96 |
| 1285 | BMW | 7 Series | E65/E66 facelift | 2005 | 2008 | saloon | `bmw-7-series-e65-e66-facelift-saloon-2005-2008.webp` | 101 |
| 1286 | Mercedes-Benz | G-Class | W463 Cabriolet | 1990 | 2013 | convertible-suv | `mercedes-benz-g-class-w463-cabriolet-convertible-suv-1990-2013.webp` | 109 |
| 1287 | Audi | S4 | B5 Avant | 1997 | 2002 | estate | `audi-s4-b5-avant-estate-1997-2002.webp` | 113 |
| 1288 | Audi | RS4 | B7 Avant | 2006 | 2008 | estate | `audi-rs4-b7-avant-estate-2006-2008.webp` | 115 |
| 1289 | Audi | RS4 | B7 Cabriolet | 2006 | 2008 | convertible | `audi-rs4-b7-cabriolet-convertible-2006-2008.webp` | 116 |

### Batch 20 — IDs 1290–1299 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1290 | Audi | Q7 | 4L facelift | 2009 | 2015 | suv | `audi-q7-4l-facelift-suv-2009-2015.webp` | 118 |
| 1291 | Volkswagen | Beetle | A5/5C Cabriolet | 2013 | 2019 | convertible | `volkswagen-beetle-a5-5c-cabriolet-convertible-2013-2019.webp` | 121 |
| 1292 | Porsche | Cayman | 987.2 | 2009 | 2012 | coupe | `porsche-cayman-987-2-coupe-2009-2012.webp` | 195 |
| 1293 | Bentley | Arnage | Facelift | 2004 | 2009 | saloon | `bentley-arnage-facelift-saloon-2004-2009.webp` | 172 |
| 1294 | Bentley | Brooklands | Brooklands Coupe | 2008 | 2011 | coupe | `bentley-brooklands-brooklands-coupe-coupe-2008-2011.webp` | 174 |
| 1295 | Bentley | Mulsanne | SZ Mulsanne S round lamps | 1989 | 1992 | saloon | `bentley-mulsanne-sz-mulsanne-s-round-lamps-saloon-1989-1992.webp` | 176 |
| 1296 | Bentley | Mulsanne | Modern facelift | 2016 | 2020 | saloon | `bentley-mulsanne-modern-facelift-saloon-2016-2020.webp` | 177 |
| 1297 | Rolls-Royce | Silver Spirit | SZ New Silver Spirit | 1995 | 1997 | saloon | `rolls-royce-silver-spirit-sz-new-silver-spirit-saloon-1995-1997.webp` | 179 |
| 1298 | Aston Martin | Virage | V8 Virage Volante | 1992 | 1996 | convertible | `aston-martin-virage-v8-virage-volante-convertible-1992-1996.webp` | 182 |
| 1299 | Aston Martin | Virage | VH Virage | 2011 | 2012 | coupe | `aston-martin-virage-vh-virage-coupe-2011-2012.webp` | 183 |

### Batch 21 — IDs 1300–1309 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1300 | Aston Martin | Virage | VH Virage Volante | 2011 | 2012 | convertible | `aston-martin-virage-vh-virage-volante-convertible-2011-2012.webp` | 184 |
| 1301 | Aston Martin | Rapide | Rapide S | 2013 | 2020 | liftback | `aston-martin-rapide-rapide-s-liftback-2013-2020.webp` | 186 |
| 1302 | Maserati | Quattroporte | M139 facelift | 2008 | 2012 | saloon | `maserati-quattroporte-m139-facelift-saloon-2008-2012.webp` | 188 |
| 1303 | Maserati | GranTurismo | M145 Sport nose | 2012 | 2017 | coupe | `maserati-granturismo-m145-sport-nose-coupe-2012-2017.webp` | 190 |
| 1304 | Maserati | GranTurismo | M145 facelift | 2017 | 2019 | coupe | `maserati-granturismo-m145-facelift-coupe-2017-2019.webp` | 191 |
| 1305 | Maserati | GranTurismo | M189 ICE | 2023 | 2026 | coupe | `maserati-granturismo-m189-ice-coupe-2023-2026.webp` | 192 |
| 1306 | Maserati | GranTurismo | M189 Folgore | 2023 | 2026 | coupe | `maserati-granturismo-m189-folgore-coupe-2023-2026.webp` | 193 |
| 1307 | Ford | Focus | Mk1 original | 1998 | 2001 | saloon | `ford-focus-mk1-original-saloon-1998-2001.webp` | 54 |
| 1308 | Ford | Focus | Mk1 original | 1998 | 2001 | estate | `ford-focus-mk1-original-estate-1998-2001.webp` | 55 |
| 1309 | Ford | Focus | Mk1 facelift | 2001 | 2004 | hatchback | `ford-focus-mk1-facelift-hatchback-2001-2004.webp` | 56 |

### Batch 22 — IDs 1310–1319 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1310 | Ford | Focus | Mk1 facelift | 2001 | 2004 | saloon | `ford-focus-mk1-facelift-saloon-2001-2004.webp` | 57 |
| 1311 | Ford | Focus | Mk2 | 2005 | 2008 | estate | `ford-focus-mk2-estate-2005-2008.webp` | 59 |
| 1312 | Ford | Focus | Mk2 CC | 2006 | 2008 | convertible | `ford-focus-mk2-cc-convertible-2006-2008.webp` | 60 |
| 1313 | Ford | Focus | Mk2.5 facelift | 2008 | 2011 | saloon | `ford-focus-mk2-5-facelift-saloon-2008-2011.webp` | 61 |
| 1314 | Ford | Focus | Mk2.5 facelift | 2008 | 2011 | estate | `ford-focus-mk2-5-facelift-estate-2008-2011.webp` | 62 |
| 1315 | Ford | Focus | Mk2.5 CC facelift | 2008 | 2010 | convertible | `ford-focus-mk2-5-cc-facelift-convertible-2008-2010.webp` | 63 |
| 1316 | Vauxhall | Astra | F UK Mk3 | 1991 | 1998 | saloon | `vauxhall-astra-f-uk-mk3-saloon-1991-1998.webp` | 71 |
| 1317 | Vauxhall | Astra | F UK Mk3 | 1991 | 1998 | estate | `vauxhall-astra-f-uk-mk3-estate-1991-1998.webp` | 72 |
| 1318 | Vauxhall | Astra | F Cabriolet | 1993 | 2000 | convertible | `vauxhall-astra-f-cabriolet-convertible-1993-2000.webp` | 73 |
| 1319 | Vauxhall | Astra | J GTC | 2011 | 2018 | coupe-hatchback | `vauxhall-astra-j-gtc-coupe-hatchback-2011-2018.webp` | 75 |

### Batch 23 — IDs 1320–1329 (10 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1320 | Vauxhall | Vectra | B original | 1995 | 1999 | saloon | `vauxhall-vectra-b-original-saloon-1995-1999.webp` | 77 |
| 1321 | Vauxhall | Vectra | B original | 1996 | 1999 | estate | `vauxhall-vectra-b-original-estate-1996-1999.webp` | 78 |
| 1322 | Vauxhall | Vectra | B facelift | 1999 | 2002 | hatchback | `vauxhall-vectra-b-facelift-hatchback-1999-2002.webp` | 79 |
| 1323 | Vauxhall | Vectra | B facelift | 1999 | 2002 | saloon | `vauxhall-vectra-b-facelift-saloon-1999-2002.webp` | 80 |
| 1324 | Vauxhall | Vectra | B facelift | 1999 | 2002 | estate | `vauxhall-vectra-b-facelift-estate-1999-2002.webp` | 81 |
| 1325 | Vauxhall | Vectra | C | 2002 | 2005 | saloon | `vauxhall-vectra-c-saloon-2002-2005.webp` | 83 |
| 1326 | Vauxhall | Vectra | C | 2003 | 2005 | estate | `vauxhall-vectra-c-estate-2003-2005.webp` | 84 |
| 1327 | Vauxhall | Vectra | C facelift | 2005 | 2008 | hatchback | `vauxhall-vectra-c-facelift-hatchback-2005-2008.webp` | 85 |
| 1328 | Vauxhall | Vectra | C facelift | 2005 | 2008 | estate | `vauxhall-vectra-c-facelift-estate-2005-2008.webp` | 86 |
| 1329 | Vauxhall | Omega | B original | 1994 | 1999 | estate | `vauxhall-omega-b-original-estate-1994-1999.webp` | 88 |

### Batch 24 — IDs 1330–1335 (6 records)

| ID | Make | Model | Generation / chassis / visual phase | yearFrom | yearTo | Body | Exact final WebP filename | Source candidate |
| ---: | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| 1330 | Vauxhall | Omega | B facelift | 1999 | 2003 | saloon | `vauxhall-omega-b-facelift-saloon-1999-2003.webp` | 89 |
| 1331 | Vauxhall | Omega | B facelift | 1999 | 2003 | estate | `vauxhall-omega-b-facelift-estate-1999-2003.webp` | 90 |
| 1332 | Vauxhall | Signum | Facelift | 2005 | 2008 | hatchback | `vauxhall-signum-facelift-hatchback-2005-2008.webp` | 92 |
| 1333 | Vauxhall | Tigra | B TwinTop | 2004 | 2009 | roadster | `vauxhall-tigra-b-twintop-roadster-2004-2009.webp` | 94 |
| 1334 | Volvo | C30 | P14 facelift | 2009 | 2013 | hatchback | `volvo-c30-p14-facelift-hatchback-2009-2013.webp` | 234 |
| 1335 | Volvo | 850 | P80 | 1993 | 1997 | estate | `volvo-850-p80-estate-1993-1997.webp` | 236 |

## Validation

- PASS: both JSON input and saved queue parse; all 236 source candidate indices occur exactly once.
- PASS: complete original candidate objects and all identity fields compare deeply equal to their source; no splits or lower-priority records removed.
- PASS: sequential, unique IDs 1100–1335, above every active/pending catalogue ID.
- PASS: 236 unique final filenames, valid slug/WebP/year convention, no collisions with active/pending catalogue filenames or public/cars files.
- PASS: 23 full ten-record batches and one final 6-record batch; batch order matches ID order.
- PASS: candidate input, catalogue, matcher, image tests, existing image-generation/audit documentation and all 1094 existing images are hash-verified unchanged; public/cars filenames unchanged.
- No images generated, no runtime catalogue entries added, no matcher changes, no staging or commit. Existing unrelated working-tree changes are left alone.

Only `data/classics-image-generation-queue.json` and this report are created in the repository. The existing /data/* Git ignore rule also covers the new queue JSON; no ignore rules were changed.
