# AutoViewer 200-registration image match audit

Read-only. Live lookupVehicle on 18 Oct 2026. No production code, catalogue, or alias changes.

DVLA rejected the configured key (403) at the start of the run. Every identity below is DVSA only.
Catalogue loaded for the library check: data/vehicle-images.json, 1099 vehicles, 0 pending.

## 1. Summary

| Result | Count | Share |
| --- | ---: | ---: |
| PASS_EXACT | 0 | 0.0% |
| PASS_GENERIC | 0 | 0.0% |
| NO_IMAGE | 194 | 97.0% |
| WRONG_IMAGE | 0 | 0.0% |
| WRONG_IDENTITY | 0 | 0.0% |
| LOOKUP_FAILED | 5 | 2.5% |
| SPECIAL_DATA | 1 | 0.5% |
| Total tested | 200 | 100% |

## 2. Coverage

Lookup returned a vehicle for 195 registrations. LOOKUP_FAILED is excluded.

- Usable image coverage = (PASS_EXACT + PASS_GENERIC) / 195 = 0 / 195 = 0.0%
- Exact image coverage = PASS_EXACT / 195 = 0 / 195 = 0.0%

## 3. Failure table

Every registration is non-pass. Image id and filename are empty on all 200 rows. Confidence is low on every resolved vehicle. The five misses have no confidence.

| REG | Returned vehicle | Result | Image | Exact reason |
| --- | --- | --- | --- | --- |
| HX10DHD | 2010 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| KT10UJM | 2010 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| MG09VAR | 2009 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| BX05JXP | 2005 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| BX05OTF | 2005 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| MG05POG | 2005 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| YX05LJE | 2005 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| AV04VHJ | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| AV04XYW | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| BF54GZH | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| BF54WXO | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| BP53JCJ | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| BV53WKN | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| CK54YYU | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| DN54LOF | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| KX04HEW | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| MG04JLT | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| RL53TSO | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| YG04AAY | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| YR04EYJ | 2004 MG TF | NO_IMAGE | - | No catalogue model matched MG TF |
| DV53VPC | 2003 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| HD03OUA | 2003 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| KF53BFP | 2003 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| KH03ZDM | 2003 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| LT53LFF | 2003 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| SG03AKK | 2003 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| WU03BUF | 2003 Vauxhall Omega V6 Special | NO_IMAGE | - | No catalogue model matched Vauxhall Omega V6 Special |
| DN02RKY | 2002 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| HF02HFC | 2002 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| KE02ESN | 2002 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| KE02WEF | 2002 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| KE52OEB | 2002 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| KR52BCK | 2002 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| RX52JVG | 2002 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| VO52UXH | 2002 Vauxhall Omega Elite V6 / Auto | NO_IMAGE | - | No catalogue model matched Vauxhall Omega Elite V6 Auto |
| KG51VJL | 2001 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| X165CWP | 2001 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| Y223MCP | 2001 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| Y299RCB | 2001 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| Y614YBT | 2001 Vauxhall Omega | NO_IMAGE | - | No catalogue model matched Vauxhall Omega |
| FJ02LHB | 2002 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| RX02FUY | 2002 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| RX02TKY | 2002 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| RX02VAY | 2002 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| RN51FUE | 2001 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| Y343LAP | 2001 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| Y791RDG | 2001 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| Y931SEO | 2001 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| W42AGK | 2000 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| W918SFP | 2000 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| S199PEC | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| S234OPO | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| S235VPW | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| S50MGK | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| S534YOO | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| S688EJE | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| T300VKS | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| T53SPL | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| V250RBP | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| V575FBY | 1999 BMW Z3 | NO_IMAGE | - | No catalogue model matched BMW Z3 |
| GD51JWF | 2002 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. |
| GU02XDD | 2002 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. |
| LS02RZY | 2002 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. |
| RX02VSZ | 2002 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. |
| VN02FNT | 2002 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. |
| VO52XLT | 2002 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. |
| EF51VFM | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| FG51FMK | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| MT51ZNK | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| PF51EGD | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| RJ51OOE | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| WV51EAF | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| X108WKH | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| X463ERC | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| X883YOO | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| Y607MHJ | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| Y638NRD | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| Y751RLD | 2001 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. |
| V35MUY | 2000 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 19 years away, beyond the safe 3-year fallback limit. |
| W113YKX | 2000 Ford Puma | NO_IMAGE | - | The nearest same-model generation is 19 years away, beyond the safe 3-year fallback limit. |
| BG06MWJ | 2006 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| LB56ZST | 2006 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| PN06YSE | - | LOOKUP_FAILED | - | We couldn't find that registration. |
| GP05EZN | 2005 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| MM05KEK | 2005 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| OY05ZWJ | - | LOOKUP_FAILED | - | We couldn't find that registration. |
| SV04LCF | 2004 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| WF54OJO | - | LOOKUP_FAILED | - | We couldn't find that registration. |
| BK03OUV | 2003 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| EY03JXL | 2003 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| HV53BVX | 2003 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| OO53XKR | 2003 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| CE02POA | 2002 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| DG02XSK | 2002 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| FA57JAG | 2007 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| BJ07VYZ | 2007 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| KX07EZP | 2007 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| LC07YHS | 2007 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| LG07UGM | - | LOOKUP_FAILED | - | We couldn't find that registration. |
| WR56BTF | 2007 Jaguar XKR | NO_IMAGE | - | No catalogue model matched Jaguar XKR |
| KX64FWY | 2024 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| Y22TRP | 2015 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| YE09PHJ | 2009 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| PH53BEH | 2008 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| KV07MTF | 2007 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| EA06YSO | 2006 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| EK05UZS | 2005 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| K31AYO | 2005 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| CN04WKD | 2004 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| DG04UPB | 2004 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| PN54YAG | 2004 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| RV04FBE | 2004 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| VE04URF | 2004 Daihatsu Copen | NO_IMAGE | - | No catalogue model matched Daihatsu Copen |
| P332PVR | 1997 Mitsubishi Fto | NO_IMAGE | - | No catalogue model matched Mitsubishi Fto |
| N540BRC | 1996 Mitsubishi Fto | NO_IMAGE | - | No catalogue model matched Mitsubishi Fto |
| N99FTO | 1996 Mitsubishi Fto | NO_IMAGE | - | No catalogue model matched Mitsubishi Fto |
| P722SYK | 1996 Mitsubishi Fto | NO_IMAGE | - | No catalogue model matched Mitsubishi Fto |
| M120LAD | 1995 Mitsubishi Fto | NO_IMAGE | - | No catalogue model matched Mitsubishi Fto |
| M588TVM | 1995 Mitsubishi Fto | NO_IMAGE | - | No catalogue model matched Mitsubishi Fto |
| M99DLC | 1995 Mitsubishi Fto | NO_IMAGE | - | No catalogue model matched Mitsubishi Fto |
| OUI3899 | 1995 Mitsubishi Fto | NO_IMAGE | - | No catalogue model matched Mitsubishi Fto |
| BK55ZWS | 2005 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| MX55CMK | 2005 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| 165UPU | 2004 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| VX53OTE | 2003 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| FE02KCX | 2002 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| W784RWP | 2000 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| V709GNP | 1999 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| R495SSW | 1998 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| P920LJB | 1997 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| R655CHE | 1997 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| N254UCG | 1996 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| L905PMU | 1994 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| F541TRY | 1988 Isuzu Trooper | NO_IMAGE | - | No catalogue model matched Isuzu Trooper |
| KO55CXP | 2005 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| LE05CTX | 2005 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| CT53NHB | 2004 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| LO54DLF | 2004 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| BC51OZO | 2002 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| GM02LCK | 2002 Mazda Bongo/Friendee | NO_IMAGE | - | No catalogue model matched Mazda Bongo/Friendee |
| HS52DZF | 2002 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| NM02HCE | 2002 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| WD02LSU | 2002 Mazda Bongo Friendee | NO_IMAGE | - | No catalogue model matched Mazda Bongo Friendee |
| WO02VBC | 2002 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| HS51DDL | 2001 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| RG51KND | 2001 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| WJ51GKY | 2001 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| Y919GHC | 2001 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| V980OCS | 2000 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| S555RFM | 1999 Mazda Bongo Friendee | NO_IMAGE | - | No catalogue model matched Mazda Bongo Friendee |
| S900FFC | 1999 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| T623DCD | 1999 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| V237HWA | 1999 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| V575XAG | 1999 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| V691FSX | 1999 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| V889XAG | 1999 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| P174LMO | 1997 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| P268FTT | 1997 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| N153MCL | 1996 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| N165MGL | 1996 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| N511XOD | 1996 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| P146DWP | 1996 Mazda Bongo Friendee | NO_IMAGE | - | No catalogue model matched Mazda Bongo Friendee |
| P548KBC | 1996 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| P878EAB | 1996 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| M342NTA | 1995 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| N132VLJ | 1995 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| N824FKK | 1995 Mazda Bongo | NO_IMAGE | - | No catalogue model matched Mazda Bongo |
| J658KAE | 2023 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| BA69UCC | 2020 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| HF64FVB | 2014 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| TXZ2475 | 2013 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| FH60VWU | 2010 Toyota Vehicle | SPECIAL_DATA | - | No catalogue model matched Toyota Vehicle |
| FN59CTF | 2009 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| FX55VMW | 2006 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| LF54HAA | 2004 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| NJ04DLU | 2004 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| V88BRG | 2004 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| BW52UFS | 2002 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| X348SCY | 2001 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| Y257DHN | 2001 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| Y832PTX | 2001 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| C12OMP | 2000 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| J19GTE | 2000 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| L29NCL | 2000 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| W675NDA | 2000 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| X313SCY | 2000 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| R332KDS | 1998 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| A962LLK | 1984 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| GVG945K | 1971 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| IG5362 | 1968 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| RWF342E | 1967 Toyota Crown | NO_IMAGE | - | No catalogue model matched Toyota Crown |
| LX10KUJ | 2010 Nissan Elgrand | NO_IMAGE | - | No catalogue model matched Nissan Elgrand |
| VF59OUP | 2009 Nissan Elgrand | NO_IMAGE | - | No catalogue model matched Nissan Elgrand |
| YM09TGX | 2009 Nissan Elgrand | NO_IMAGE | - | No catalogue model matched Nissan Elgrand |
| YM58SYX | 2009 Nissan Elgrand | NO_IMAGE | - | No catalogue model matched Nissan Elgrand |
| VF10HSK | 2010 Nissan Elgrand | NO_IMAGE | - | No catalogue model matched Nissan Elgrand |
| AY60LSD | 2011 Nissan Elgrand | NO_IMAGE | - | No catalogue model matched Nissan Elgrand |
| DX10ULV | 2010 Nissan Elgrand | NO_IMAGE | - | No catalogue model matched Nissan Elgrand |
| BC57JVH | - | LOOKUP_FAILED | - | We couldn't find that registration. |
| BP60XVJ | 2010 Nissan Elgrand | NO_IMAGE | - | No catalogue model matched Nissan Elgrand |

## 4. Matcher patterns

### Missing image record (174)

The matcher reported "No catalogue model matched" and returned the placeholder. Identity from DVSA is a real model name. No catalogue row exists for that model.

- Mazda Bongo, including Friendee and Bongo/Friendee: 33
- Toyota Crown: 23
- MG TF: 20
- BMW Z3: 20
- Vauxhall Omega, including Elite V6 Auto and V6 Special: 20
- Jaguar XKR: 16
- Daihatsu Copen: 13
- Isuzu Trooper: 13
- Mitsubishi FTO: 8
- Nissan Elgrand: 8

### Generation and body not in the catalogue (20)

Ford Puma, 2000-2002. The matcher found Ford Puma and refused it: the nearest generation is 17, 18, or 19 years away, past the 3-year limit. Catalogue rows are 10 (Mk2 crossover, 2019-2024) and 473 (Mk2 facelift, 2024-2026). Those are a different body. Leaving the placeholder is the right outcome.

### Sparse source model (1)

FH60VWU. DVSA make TOYOTA, model UNKNOWN, hybrid, 3456cc, registered 2010-10-01. AutoViewer shows Toyota Vehicle. A Crown, Estima, or Alphard hybrid can share that engine. No image was chosen.

### Lookup gap (5)

PN06YSE, OY05ZWJ, WF54OJO, LG07UGM, BC57JVH. DVSA returned no MOT record. A direct re-check of PN06YSE returned the same "No MOT record found". DVLA was already unavailable, so nothing else could resolve them.

### Trim text on an otherwise correct model (6, secondary)

These still fail today because the base model is absent. Once a base record exists, the current exact-name match will miss them unless the extra words are folded in:

- VO52UXH: DVSA model OMEGA ELITE V6 AUTO
- WU03BUF: Omega V6 Special
- WD02LSU, S555RFM, P146DWP: Bongo Friendee
- GM02LCK: DVSA model BONGO/FRIENDEE

### Lookalikes the matcher left alone

Present in the catalogue and not selected: Triumph Spitfire, Nissan 350Z, Nissan 370Z, Lexus SC / Toyota Soarer, Toyota Alphard AH10, Toyota Estima XR50. None of those is the vehicle DVSA named.

## 5. Image library check

NO_IMAGE and the one SPECIAL_DATA row. No WRONG_IMAGE rows.

| Code | Meaning | Registrations |
| --- | --- | ---: |
| A | Suitable image exists and the matcher missed it | 0 |
| B | Image exists only for another generation or body | 20 |
| C | No suitable image exists | 174 |
| D | Source identity is too weak to choose safely | 1 |

B is the 20 Ford Pumas. C is every other resolved model in this set. D is FH60VWU. Estima XR50 (record 1009, 2006-2019) and Alphard AH10 (record 659, 2002-2008) exist and must stay unused for that plate.

## 6. Priority fix list

Not implemented. Ranked by how many of these plates move, whether one change covers the group, false-positive risk, and whether a safe image already exists. None of the suitable images exist today. Do not retarget the modern Puma, Estima, or Alphard records.

1. Mazda Bongo, 33 plates. One van image, plus accept Friendee and Bongo/Friendee as the same Mazda model. Low false-positive risk if limited to Mazda. No image yet.
2. MG TF, 20 plates, years 2004-2010. One roadster covers this set. Low risk. No image yet.
3. BMW Z3, 20 plates, years 1999-2002. Roadster and coupe are not separated by DVSA, so one image is a family match. Keep it off Z4, 350Z, and 370Z. No image yet.
4. Ford Puma coupe, 20 plates, years 2000-2002. Add a 1997-2002 coupe record. The year bands must not overlap records 10 and 473. The current 3-year refusal is doing the right job.
5. Vauxhall Omega, 20 plates, years 2001-2003. Eighteen are the plain model Omega. Two need the trim words ignored after the base model matches: Elite V6 Auto, V6 Special. No image yet.
6. Jaguar XKR, 16 plates. Nine are 2002-2005 (X100). Seven are 2006-2007, where X100 and X150 overlap and DVSA does not give the generation. Two records, or one family image with a generic result on the overlap. No image yet.
7. Daihatsu Copen L880, 11 plates, years 2004-2009. Separate from the later Copen. No image yet.
8. Isuzu Trooper, 12 plates, years 1994-2005. Keep the 1988 Trooper off this image. No image yet.
9. Mitsubishi FTO, 8 plates, years 1995-1997. One generation. Highest certainty per plate. No image yet.
10. Nissan Elgrand, 8 plates, years 2009-2011. E51 and E52 are not reliably separated at 2010 from this data. One family image, or two records with 2009 on E51 only. No image yet.
11. Toyota Crown around 1999-2007, 13 plates. The largest single Crown band in this set. A 1967 Crown image would be the wrong car. No image yet.
12. Toyota Crown around 2008-2014, 3 plates (2009, 2013, 2014). Different body from the previous Crown. No image yet.
13. Toyota Crown 2020 and 2023, 2 plates. Later body again. No image yet.
14. Daihatsu Copen from 2014, 2 plates (2015, and a 2024 car carrying plate KX64FWY). Different body from the L880. No image yet.
15. Toyota Crown before 1999, 5 plates (1967, 1968, 1971, 1984, 1998). These are several bodies. One shared image would misrepresent most of them. Prefer separate records, or leave them without an image.
16. Isuzu Trooper 1988, 1 plate (F541TRY). Earlier body than item 8. No image yet.
17. Base-model fold for trim words. General rule: if the leading model tokens match exactly one catalogue model, ignore a trailing trim such as Elite, V6, Auto, Special. Medium risk if applied with no unique-model check. On this set it only changes the two Omegas, and only after an Omega record exists.
18. Treat a slash as a space and Friendee as the same model as Bongo. Four plates, and only useful after item 1. Low risk if the make is Mazda and the first token is Bongo.
19. Leave Toyota with model UNKNOWN unmatched. FH60VWU is a 3456cc hybrid. Estima and Alphard images exist and are the wrong thing to attach. High false-positive risk.
20. The five DVSA misses need a working DVLA response, or confirmation the plates have no MOT record. PN06YSE was re-checked and DVSA still has no record. The gap is lookup availability.

## 7. Final verdict

On this benchmark the current catalogue does not cover the vehicles people actually looked up. Usable coverage is 0 of 195 resolved registrations. The matcher did not attach a wrong image: it refused the modern Puma crossover and it left Spitfire, Z-car, Soarer, Alphard, and Estima records unused.

The classic and import expansion therefore does not show up on these 200 plates. The remaining gap is missing records for a short list of families, led by Mazda Bongo (33), Toyota Crown (23), MG TF (20), BMW Z3 (20), the original Ford Puma (20), and Vauxhall Omega (20). Adding those records is what moves the coverage. Loosening the year fallback would turn the 20 Pumas into wrong images.

## Appendix: full capture

| # | REG | Make | Model | Year | Body / variant | Image id | Filename | Match reason | Confidence | Result | Library |
| ---: | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| 001 | HX10DHD | MG | TF | 2010 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 002 | KT10UJM | MG | TF | 2010 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 003 | MG09VAR | MG | TF | 2009 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 004 | BX05JXP | MG | TF | 2005 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 005 | BX05OTF | MG | TF | 2005 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 006 | MG05POG | MG | TF | 2005 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 007 | YX05LJE | MG | TF | 2005 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 008 | AV04VHJ | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 009 | AV04XYW | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 010 | BF54GZH | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 011 | BF54WXO | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 012 | BP53JCJ | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 013 | BV53WKN | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 014 | CK54YYU | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 015 | DN54LOF | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 016 | KX04HEW | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 017 | MG04JLT | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 018 | RL53TSO | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 019 | YG04AAY | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 020 | YR04EYJ | MG | TF | 2004 | - | - | - | No catalogue model matched MG TF | low | NO_IMAGE | C |
| 021 | DV53VPC | Vauxhall | Omega | 2003 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 022 | HD03OUA | Vauxhall | Omega | 2003 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 023 | KF53BFP | Vauxhall | Omega | 2003 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 024 | KH03ZDM | Vauxhall | Omega | 2003 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 025 | LT53LFF | Vauxhall | Omega | 2003 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 026 | SG03AKK | Vauxhall | Omega | 2003 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 027 | WU03BUF | Vauxhall | Omega V6 Special | 2003 | - | - | - | No catalogue model matched Vauxhall Omega V6 Special | low | NO_IMAGE | C |
| 028 | DN02RKY | Vauxhall | Omega | 2002 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 029 | HF02HFC | Vauxhall | Omega | 2002 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 030 | KE02ESN | Vauxhall | Omega | 2002 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 031 | KE02WEF | Vauxhall | Omega | 2002 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 032 | KE52OEB | Vauxhall | Omega | 2002 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 033 | KR52BCK | Vauxhall | Omega | 2002 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 034 | RX52JVG | Vauxhall | Omega | 2002 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 035 | VO52UXH | Vauxhall | Omega Elite V6 | 2002 | Auto | - | - | No catalogue model matched Vauxhall Omega Elite V6 Auto | low | NO_IMAGE | C |
| 036 | KG51VJL | Vauxhall | Omega | 2001 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 037 | X165CWP | Vauxhall | Omega | 2001 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 038 | Y223MCP | Vauxhall | Omega | 2001 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 039 | Y299RCB | Vauxhall | Omega | 2001 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 040 | Y614YBT | Vauxhall | Omega | 2001 | - | - | - | No catalogue model matched Vauxhall Omega | low | NO_IMAGE | C |
| 041 | FJ02LHB | BMW | Z3 | 2002 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 042 | RX02FUY | BMW | Z3 | 2002 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 043 | RX02TKY | BMW | Z3 | 2002 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 044 | RX02VAY | BMW | Z3 | 2002 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 045 | RN51FUE | BMW | Z3 | 2001 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 046 | Y343LAP | BMW | Z3 | 2001 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 047 | Y791RDG | BMW | Z3 | 2001 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 048 | Y931SEO | BMW | Z3 | 2001 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 049 | W42AGK | BMW | Z3 | 2000 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 050 | W918SFP | BMW | Z3 | 2000 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 051 | S199PEC | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 052 | S234OPO | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 053 | S235VPW | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 054 | S50MGK | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 055 | S534YOO | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 056 | S688EJE | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 057 | T300VKS | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 058 | T53SPL | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 059 | V250RBP | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 060 | V575FBY | BMW | Z3 | 1999 | - | - | - | No catalogue model matched BMW Z3 | low | NO_IMAGE | C |
| 061 | GD51JWF | Ford | Puma | 2002 | - | - | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 062 | GU02XDD | Ford | Puma | 2002 | - | - | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 063 | LS02RZY | Ford | Puma | 2002 | - | - | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 064 | RX02VSZ | Ford | Puma | 2002 | - | - | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 065 | VN02FNT | Ford | Puma | 2002 | - | - | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 066 | VO52XLT | Ford | Puma | 2002 | - | - | - | The nearest same-model generation is 17 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 067 | EF51VFM | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 068 | FG51FMK | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 069 | MT51ZNK | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 070 | PF51EGD | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 071 | RJ51OOE | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 072 | WV51EAF | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 073 | X108WKH | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 074 | X463ERC | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 075 | X883YOO | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 076 | Y607MHJ | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 077 | Y638NRD | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 078 | Y751RLD | Ford | Puma | 2001 | - | - | - | The nearest same-model generation is 18 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 079 | V35MUY | Ford | Puma | 2000 | - | - | - | The nearest same-model generation is 19 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 080 | W113YKX | Ford | Puma | 2000 | - | - | - | The nearest same-model generation is 19 years away, beyond the safe 3-year fallback limit. | low | NO_IMAGE | B |
| 081 | BG06MWJ | Jaguar | XKR | 2006 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 082 | LB56ZST | Jaguar | XKR | 2006 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 083 | PN06YSE | - | - | - | - | - | - | We couldn't find that registration. | - | LOOKUP_FAILED | - |
| 084 | GP05EZN | Jaguar | XKR | 2005 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 085 | MM05KEK | Jaguar | XKR | 2005 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 086 | OY05ZWJ | - | - | - | - | - | - | We couldn't find that registration. | - | LOOKUP_FAILED | - |
| 087 | SV04LCF | Jaguar | XKR | 2004 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 088 | WF54OJO | - | - | - | - | - | - | We couldn't find that registration. | - | LOOKUP_FAILED | - |
| 089 | BK03OUV | Jaguar | XKR | 2003 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 090 | EY03JXL | Jaguar | XKR | 2003 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 091 | HV53BVX | Jaguar | XKR | 2003 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 092 | OO53XKR | Jaguar | XKR | 2003 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 093 | CE02POA | Jaguar | XKR | 2002 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 094 | DG02XSK | Jaguar | XKR | 2002 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 095 | FA57JAG | Jaguar | XKR | 2007 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 096 | BJ07VYZ | Jaguar | XKR | 2007 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 097 | KX07EZP | Jaguar | XKR | 2007 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 098 | LC07YHS | Jaguar | XKR | 2007 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 099 | LG07UGM | - | - | - | - | - | - | We couldn't find that registration. | - | LOOKUP_FAILED | - |
| 100 | WR56BTF | Jaguar | XKR | 2007 | - | - | - | No catalogue model matched Jaguar XKR | low | NO_IMAGE | C |
| 101 | KX64FWY | Daihatsu | Copen | 2024 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 102 | Y22TRP | Daihatsu | Copen | 2015 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 103 | YE09PHJ | Daihatsu | Copen | 2009 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 104 | PH53BEH | Daihatsu | Copen | 2008 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 105 | KV07MTF | Daihatsu | Copen | 2007 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 106 | EA06YSO | Daihatsu | Copen | 2006 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 107 | EK05UZS | Daihatsu | Copen | 2005 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 108 | K31AYO | Daihatsu | Copen | 2005 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 109 | CN04WKD | Daihatsu | Copen | 2004 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 110 | DG04UPB | Daihatsu | Copen | 2004 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 111 | PN54YAG | Daihatsu | Copen | 2004 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 112 | RV04FBE | Daihatsu | Copen | 2004 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 113 | VE04URF | Daihatsu | Copen | 2004 | - | - | - | No catalogue model matched Daihatsu Copen | low | NO_IMAGE | C |
| 114 | P332PVR | Mitsubishi | Fto | 1997 | - | - | - | No catalogue model matched Mitsubishi Fto | low | NO_IMAGE | C |
| 115 | N540BRC | Mitsubishi | Fto | 1996 | - | - | - | No catalogue model matched Mitsubishi Fto | low | NO_IMAGE | C |
| 116 | N99FTO | Mitsubishi | Fto | 1996 | - | - | - | No catalogue model matched Mitsubishi Fto | low | NO_IMAGE | C |
| 117 | P722SYK | Mitsubishi | Fto | 1996 | - | - | - | No catalogue model matched Mitsubishi Fto | low | NO_IMAGE | C |
| 118 | M120LAD | Mitsubishi | Fto | 1995 | - | - | - | No catalogue model matched Mitsubishi Fto | low | NO_IMAGE | C |
| 119 | M588TVM | Mitsubishi | Fto | 1995 | - | - | - | No catalogue model matched Mitsubishi Fto | low | NO_IMAGE | C |
| 120 | M99DLC | Mitsubishi | Fto | 1995 | - | - | - | No catalogue model matched Mitsubishi Fto | low | NO_IMAGE | C |
| 121 | OUI3899 | Mitsubishi | Fto | 1995 | - | - | - | No catalogue model matched Mitsubishi Fto | low | NO_IMAGE | C |
| 122 | BK55ZWS | Isuzu | Trooper | 2005 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 123 | MX55CMK | Isuzu | Trooper | 2005 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 124 | 165UPU | Isuzu | Trooper | 2004 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 125 | VX53OTE | Isuzu | Trooper | 2003 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 126 | FE02KCX | Isuzu | Trooper | 2002 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 127 | W784RWP | Isuzu | Trooper | 2000 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 128 | V709GNP | Isuzu | Trooper | 1999 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 129 | R495SSW | Isuzu | Trooper | 1998 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 130 | P920LJB | Isuzu | Trooper | 1997 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 131 | R655CHE | Isuzu | Trooper | 1997 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 132 | N254UCG | Isuzu | Trooper | 1996 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 133 | L905PMU | Isuzu | Trooper | 1994 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 134 | F541TRY | Isuzu | Trooper | 1988 | - | - | - | No catalogue model matched Isuzu Trooper | low | NO_IMAGE | C |
| 135 | KO55CXP | Mazda | Bongo | 2005 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 136 | LE05CTX | Mazda | Bongo | 2005 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 137 | CT53NHB | Mazda | Bongo | 2004 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 138 | LO54DLF | Mazda | Bongo | 2004 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 139 | BC51OZO | Mazda | Bongo | 2002 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 140 | GM02LCK | Mazda | Bongo/Friendee | 2002 | - | - | - | No catalogue model matched Mazda Bongo/Friendee | low | NO_IMAGE | C |
| 141 | HS52DZF | Mazda | Bongo | 2002 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 142 | NM02HCE | Mazda | Bongo | 2002 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 143 | WD02LSU | Mazda | Bongo Friendee | 2002 | - | - | - | No catalogue model matched Mazda Bongo Friendee | low | NO_IMAGE | C |
| 144 | WO02VBC | Mazda | Bongo | 2002 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 145 | HS51DDL | Mazda | Bongo | 2001 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 146 | RG51KND | Mazda | Bongo | 2001 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 147 | WJ51GKY | Mazda | Bongo | 2001 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 148 | Y919GHC | Mazda | Bongo | 2001 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 149 | V980OCS | Mazda | Bongo | 2000 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 150 | S555RFM | Mazda | Bongo Friendee | 1999 | - | - | - | No catalogue model matched Mazda Bongo Friendee | low | NO_IMAGE | C |
| 151 | S900FFC | Mazda | Bongo | 1999 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 152 | T623DCD | Mazda | Bongo | 1999 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 153 | V237HWA | Mazda | Bongo | 1999 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 154 | V575XAG | Mazda | Bongo | 1999 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 155 | V691FSX | Mazda | Bongo | 1999 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 156 | V889XAG | Mazda | Bongo | 1999 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 157 | P174LMO | Mazda | Bongo | 1997 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 158 | P268FTT | Mazda | Bongo | 1997 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 159 | N153MCL | Mazda | Bongo | 1996 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 160 | N165MGL | Mazda | Bongo | 1996 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 161 | N511XOD | Mazda | Bongo | 1996 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 162 | P146DWP | Mazda | Bongo Friendee | 1996 | - | - | - | No catalogue model matched Mazda Bongo Friendee | low | NO_IMAGE | C |
| 163 | P548KBC | Mazda | Bongo | 1996 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 164 | P878EAB | Mazda | Bongo | 1996 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 165 | M342NTA | Mazda | Bongo | 1995 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 166 | N132VLJ | Mazda | Bongo | 1995 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 167 | N824FKK | Mazda | Bongo | 1995 | - | - | - | No catalogue model matched Mazda Bongo | low | NO_IMAGE | C |
| 168 | J658KAE | Toyota | Crown | 2023 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 169 | BA69UCC | Toyota | Crown | 2020 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 170 | HF64FVB | Toyota | Crown | 2014 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 171 | TXZ2475 | Toyota | Crown | 2013 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 172 | FH60VWU | Toyota | Vehicle | 2010 | - | - | - | No catalogue model matched Toyota Vehicle | low | SPECIAL_DATA | D |
| 173 | FN59CTF | Toyota | Crown | 2009 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 174 | FX55VMW | Toyota | Crown | 2006 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 175 | LF54HAA | Toyota | Crown | 2004 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 176 | NJ04DLU | Toyota | Crown | 2004 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 177 | V88BRG | Toyota | Crown | 2004 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 178 | BW52UFS | Toyota | Crown | 2002 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 179 | X348SCY | Toyota | Crown | 2001 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 180 | Y257DHN | Toyota | Crown | 2001 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 181 | Y832PTX | Toyota | Crown | 2001 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 182 | C12OMP | Toyota | Crown | 2000 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 183 | J19GTE | Toyota | Crown | 2000 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 184 | L29NCL | Toyota | Crown | 2000 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 185 | W675NDA | Toyota | Crown | 2000 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 186 | X313SCY | Toyota | Crown | 2000 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 187 | R332KDS | Toyota | Crown | 1998 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 188 | A962LLK | Toyota | Crown | 1984 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 189 | GVG945K | Toyota | Crown | 1971 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 190 | IG5362 | Toyota | Crown | 1968 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 191 | RWF342E | Toyota | Crown | 1967 | - | - | - | No catalogue model matched Toyota Crown | low | NO_IMAGE | C |
| 192 | LX10KUJ | Nissan | Elgrand | 2010 | - | - | - | No catalogue model matched Nissan Elgrand | low | NO_IMAGE | C |
| 193 | VF59OUP | Nissan | Elgrand | 2009 | - | - | - | No catalogue model matched Nissan Elgrand | low | NO_IMAGE | C |
| 194 | YM09TGX | Nissan | Elgrand | 2009 | - | - | - | No catalogue model matched Nissan Elgrand | low | NO_IMAGE | C |
| 195 | YM58SYX | Nissan | Elgrand | 2009 | - | - | - | No catalogue model matched Nissan Elgrand | low | NO_IMAGE | C |
| 196 | VF10HSK | Nissan | Elgrand | 2010 | - | - | - | No catalogue model matched Nissan Elgrand | low | NO_IMAGE | C |
| 197 | AY60LSD | Nissan | Elgrand | 2011 | - | - | - | No catalogue model matched Nissan Elgrand | low | NO_IMAGE | C |
| 198 | DX10ULV | Nissan | Elgrand | 2010 | - | - | - | No catalogue model matched Nissan Elgrand | low | NO_IMAGE | C |
| 199 | BC57JVH | - | - | - | - | - | - | We couldn't find that registration. | - | LOOKUP_FAILED | - |
| 200 | BP60XVJ | Nissan | Elgrand | 2010 | - | - | - | No catalogue model matched Nissan Elgrand | low | NO_IMAGE | C |
