/**
 * Read-only audit runner. Does not change production code or catalogue data.
 * Resume-safe: skips registrations already stored in the raw JSON.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import vehicleImagesLibrary from "@/data/vehicle-images.json";
import { lookupVehicle } from "@/lib/api/vehicle-service";

const OUT = "temp/autoviewer-200-raw.json";

const REGS = `
HX10DHD KT10UJM MG09VAR BX05JXP BX05OTF MG05POG YX05LJE AV04VHJ AV04XYW BF54GZH
BF54WXO BP53JCJ BV53WKN CK54YYU DN54LOF KX04HEW MG04JLT RL53TSO YG04AAY YR04EYJ
DV53VPC HD03OUA KF53BFP KH03ZDM LT53LFF SG03AKK WU03BUF DN02RKY HF02HFC KE02ESN
KE02WEF KE52OEB KR52BCK RX52JVG VO52UXH KG51VJL X165CWP Y223MCP Y299RCB Y614YBT
FJ02LHB RX02FUY RX02TKY RX02VAY RN51FUE Y343LAP Y791RDG Y931SEO W42AGK W918SFP
S199PEC S234OPO S235VPW S50MGK S534YOO S688EJE T300VKS T53SPL V250RBP V575FBY
GD51JWF GU02XDD LS02RZY RX02VSZ VN02FNT VO52XLT EF51VFM FG51FMK MT51ZNK PF51EGD
RJ51OOE WV51EAF X108WKH X463ERC X883YOO Y607MHJ Y638NRD Y751RLD V35MUY W113YKX
BG06MWJ LB56ZST PN06YSE GP05EZN MM05KEK OY05ZWJ SV04LCF WF54OJO BK03OUV EY03JXL
HV53BVX OO53XKR CE02POA DG02XSK FA57JAG BJ07VYZ KX07EZP LC07YHS LG07UGM WR56BTF
KX64FWY Y22TRP YE09PHJ PH53BEH KV07MTF EA06YSO EK05UZS K31AYO CN04WKD DG04UPB
PN54YAG RV04FBE VE04URF P332PVR N540BRC N99FTO P722SYK M120LAD M588TVM M99DLC
OUI3899 BK55ZWS MX55CMK 165UPU VX53OTE FE02KCX W784RWP V709GNP R495SSW P920LJB
R655CHE N254UCG L905PMU F541TRY KO55CXP LE05CTX CT53NHB LO54DLF BC51OZO GM02LCK
HS52DZF NM02HCE WD02LSU WO02VBC HS51DDL RG51KND WJ51GKY Y919GHC V980OCS S555RFM
S900FFC T623DCD V237HWA V575XAG V691FSX V889XAG P174LMO P268FTT N153MCL N165MGL
N511XOD P146DWP P548KBC P878EAB M342NTA N132VLJ N824FKK J658KAE BA69UCC HF64FVB
TXZ2475 FH60VWU FN59CTF FX55VMW LF54HAA NJ04DLU V88BRG BW52UFS X348SCY Y257DHN
Y832PTX C12OMP J19GTE L29NCL W675NDA X313SCY R332KDS A962LLK GVG945K IG5362
RWF342E LX10KUJ VF59OUP YM09TGX YM58SYX VF10HSK AY60LSD DX10ULV BC57JVH BP60XVJ
`
  .trim()
  .split(/\s+/);

type CatalogueRow = {
  priority: number;
  make: string;
  model: string;
  generation: string;
  yearFrom: number;
  yearTo: number;
  bodyType: string;
  filename: string;
};

const catalogue = new Map<string, CatalogueRow>(
  (vehicleImagesLibrary.vehicles as CatalogueRow[]).map((row) => [row.filename, row]),
);

type Row = {
  n: number;
  reg: string;
  ok: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  make: string | null;
  model: string | null;
  modelTitle: string | null;
  modelVariant: string | null;
  year: number | null;
  fuel: string | null;
  colour: string | null;
  engine: number | null;
  transmission: string | null;
  wheelplan: string | null;
  typeApproval: string | null;
  firstRegistered: string | null;
  category: string | null;
  sources: string[];
  notes: string[];
  imageSrc: string | null;
  imageId: number | null;
  imageFile: string | null;
  imageMake: string | null;
  imageModel: string | null;
  imageGeneration: string | null;
  imageYears: string | null;
  imageBody: string | null;
  confidence: string | null;
  reason: string | null;
  representative: boolean | null;
  fallback: boolean | null;
  ambiguous: boolean | null;
  ms: number;
};

function load(): Row[] {
  try {
    return JSON.parse(readFileSync(OUT, "utf8")) as Row[];
  } catch {
    return [];
  }
}

function save(rows: Row[]) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(rows, null, 2));
}

async function lookupOnce(reg: string): Promise<Row> {
  const started = Date.now();
  const result = await lookupVehicle(reg);
  const ms = Date.now() - started;
  const base = {
    n: REGS.indexOf(reg) + 1,
    reg,
    ms,
  };
  if (!result.ok) {
    return {
      ...base,
      ok: false,
      errorCode: result.error.code,
      errorMessage: result.error.message,
      make: null,
      model: null,
      modelTitle: null,
      modelVariant: null,
      year: null,
      fuel: null,
      colour: null,
      engine: null,
      transmission: null,
      wheelplan: null,
      typeApproval: null,
      firstRegistered: null,
      category: null,
      sources: [],
      notes: [],
      imageSrc: null,
      imageId: null,
      imageFile: null,
      imageMake: null,
      imageModel: null,
      imageGeneration: null,
      imageYears: null,
      imageBody: null,
      confidence: null,
      reason: result.error.message,
      representative: null,
      fallback: null,
      ambiguous: null,
    };
  }
  const { summary: s, details: d, dataQuality } = result.data;
  const imageFile = s.imageSrc?.split("/").pop() ?? null;
  const record = imageFile ? catalogue.get(imageFile) : undefined;
  return {
    ...base,
    ok: true,
    errorCode: null,
    errorMessage: null,
    make: s.make,
    model: s.model,
    modelTitle: s.modelTitle ?? null,
    modelVariant: s.modelVariant ?? null,
    year: s.year ?? null,
    fuel: s.fuelType ?? null,
    colour: s.colour ?? null,
    engine: s.engineCapacity ?? null,
    transmission: s.transmission ?? null,
    wheelplan: d.wheelplan ?? null,
    typeApproval: d.typeApproval ?? null,
    firstRegistered: d.monthOfFirstRegistration ?? null,
    category: s.vehicleCategory ?? null,
    sources: dataQuality.sources,
    notes: dataQuality.notes,
    imageSrc: s.imageSrc ?? null,
    imageId: record?.priority ?? null,
    imageFile,
    imageMake: record?.make ?? null,
    imageModel: record?.model ?? null,
    imageGeneration: record?.generation ?? null,
    imageYears: record ? `${record.yearFrom}-${record.yearTo}` : null,
    imageBody: record?.bodyType ?? null,
    confidence: s.imageMatchConfidence ?? null,
    reason: s.imageMatchReason ?? null,
    representative: s.imageIsRepresentative ?? null,
    fallback: s.imageFallbackUsed ?? null,
    ambiguous: s.imageMatchAmbiguous ?? null,
  };
}

async function lookupWithRetry(reg: string): Promise<Row> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const row = await lookupOnce(reg);
    if (row.errorCode !== "RATE_LIMITED" && row.errorCode !== "UNAVAILABLE" && row.errorCode !== "UNKNOWN") {
      return row;
    }
    const wait = row.errorCode === "RATE_LIMITED" ? 20000 : 4000;
    console.error(`retry ${attempt} ${reg} ${row.errorCode} wait ${wait}`);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  return lookupOnce(reg);
}

async function main() {
  process.env.USE_MOCK_DATA = "false";
  if (REGS.length !== 200) {
    throw new Error(`expected 200 registrations, got ${REGS.length}`);
  }
  const done = new Map(load().map((row) => [row.reg, row]));
  const rows: Row[] = [];
  for (let i = 0; i < REGS.length; i++) {
    const reg = REGS[i];
    const existing = done.get(reg);
    const row = existing ?? (await lookupWithRetry(reg));
    rows.push(row);
    if (!existing) {
      save(rows.concat(REGS.slice(i + 1).map((pending) => done.get(pending)).filter((item): item is Row => Boolean(item))));
      console.error(
        `${String(i + 1).padStart(3, "0")} ${reg} ${row.ok ? `${row.year ?? "-"} ${row.make} ${row.modelTitle || row.model}` : row.errorCode} ${row.imageFile ?? "no-image"} ${row.ms}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  save(rows);
  console.error(`saved ${rows.length}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
