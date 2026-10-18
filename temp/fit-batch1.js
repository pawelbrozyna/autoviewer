const sharp = require("sharp");
const path = require("path");

const assets = "C:/Users/Puszek/.cursor/projects/c-Github-autoviewer/assets";
const outDir = path.resolve("temp/autoviewer-audit-batch-1");

const files = [
  ["mazda-bongo-sg-1995-2005", "mazda-bongo-sg-1995-2005.jpg"],
  ["mg-tf-2002-2011", "mg-tf-2002-2011-v2.jpg"],
  ["bmw-z3-1995-2002", "bmw-z3-1995-2002.jpg"],
  ["ford-puma-mk1-1997-2002", "ford-puma-mk1-1997-2002.jpg"],
  ["vauxhall-omega-b-1994-2003", "vauxhall-omega-b-1994-2003-v2.jpg"],
  ["jaguar-xkr-x100-1996-2005", "jaguar-xkr-x100-1996-2005.jpg"],
  ["jaguar-xkr-x150-2007-2014", "jaguar-xkr-x150-2007-2014-v2.jpg"],
  ["daihatsu-copen-l880-2002-2012", "daihatsu-copen-l880-2002-2012.jpg"],
];

function plateSvg(width, height) {
  const fontSize = Math.round(height * 0.62);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="2" fill="#ffffff" stroke="#111111" stroke-width="2"/>
      <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#111111" letter-spacing="0.5">AB12 CDE</text>
    </svg>`,
  );
}

function findPlate(data, w, h) {
  const minX = Math.round(w * 0.02);
  const maxX = Math.round(w * 0.7);
  const minY = Math.round(h * 0.5);
  const maxY = Math.round(h * 0.86);
  let best = null;
  const isWhite = (x, y) => {
    const i = (y * w + x) * 3;
    return data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232;
  };
  for (let y = minY; y < maxY; y += 2) {
    let runStart = -1;
    for (let x = minX; x <= maxX; x++) {
      const white = x < maxX && isWhite(x, y);
      if (white && runStart < 0) runStart = x;
      if (!white && runStart >= 0) {
        const runLen = x - runStart;
        if (runLen > 80 && runLen < 320) {
          let top = y;
          while (top > minY && isWhite(runStart + 4, top - 1) && isWhite(runStart + runLen - 5, top - 1)) top--;
          let bottom = y;
          while (bottom + 1 < maxY && isWhite(runStart + 4, bottom + 1) && isWhite(runStart + runLen - 5, bottom + 1)) bottom++;
          const bh = bottom - top + 1;
          const ratio = runLen / bh;
          if (bh > 16 && bh < 80 && ratio > 2.6 && ratio < 7) {
            const area = runLen * bh;
            if (!best || area > best.area) {
              best = { left: runStart, top, width: runLen, height: bh, area };
            }
          }
        }
        runStart = -1;
      }
    }
  }
  return best;
}

async function main() {
  const svg = plateSvg(240, 52);
  await sharp(svg).png().toFile("temp/plate-font-test.png");
  const probe = await sharp("temp/plate-font-test.png").raw().toBuffer({ resolveWithObject: true });
  let dark = 0;
  for (let i = 0; i < probe.data.length; i += probe.info.channels) {
    if (probe.data[i] < 40) dark++;
  }
  console.log("font-dark-pixels", dark);

  for (const [name, source] of files) {
    const base = sharp(path.join(assets, source)).resize(1000, 750, { fit: "fill" }).removeAlpha();
    const raw = await base.clone().raw().toBuffer({ resolveWithObject: true });
    const box = findPlate(raw.data, raw.info.width, raw.info.height);
    if (!box) {
      console.log("NO PLATE", name);
      continue;
    }
    const pad = 1;
    const left = Math.max(0, box.left - pad);
    const top = Math.max(0, box.top - pad);
    const width = Math.min(1000 - left, box.width + pad * 2);
    const height = Math.min(750 - top, box.height + pad * 2);
    const plate = await sharp(plateSvg(width, height)).png().toBuffer();
    const dest = path.join(outDir, `${name}.webp`);
    await base
      .composite([{ input: plate, left, top }])
      .webp({ quality: 90 })
      .toFile(dest);
    const meta = await sharp(dest).metadata();
    await sharp(dest)
      .extract({ left, top, width, height })
      .resize({ width: 420 })
      .png()
      .toFile(path.join("temp", `check-${name}.png`));
    console.log(name, `${meta.width}x${meta.height}`, meta.format, JSON.stringify(box));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
