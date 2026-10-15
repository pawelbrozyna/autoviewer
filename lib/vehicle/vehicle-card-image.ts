import { SITE_URL } from "@/lib/seo/metadata";
import {
  VEHICLE_CARD_DISCLAIMER,
  type VehicleCardData,
  type VehicleCardStatKey,
} from "@/lib/vehicle/vehicle-card";

/** Crop of the catalogue image that holds the vehicle, as used by the on-screen card. */
export type VehicleCardImageFrame = { aspect: number; positionY: number };

const WIDTH = 960;
const HEIGHT = 1350;
const CARD = { x: 36, y: 36, w: WIDTH - 72, h: HEIGHT - 72, r: 56 };
const LEFT = CARD.x + 52;
const RIGHT = WIDTH - LEFT;
const CONTENT_WIDTH = RIGHT - LEFT;

const NAVY = "#071a3d";
const MUTED = "#64748b";
const VARIANT = "#53627a";
const TILE_BG = "#f4f8fd";
const TILE_BORDER = "#dde7f3";
const GREEN = "#10b981";
const PLATE_YELLOW = "#ffd500";

const TILE_HEIGHT = 100;
const TILE_GAP = 8;
const ICON_SIZE = 40;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

function svgToImage(svg: string): Promise<HTMLImageElement> {
  return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[],
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = value;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = truncate(ctx, lines.slice(maxLines - 1).join(" "), maxWidth);
  return kept;
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

/**
 * Renders the Vehicle Card as a 960x1350 PNG from the same data as the on-screen card.
 * `icons` holds the tile icon SVG markup by stat key, taken from the rendered card.
 */
export async function renderVehicleCardImage({
  card,
  frame,
  icons,
  fontFamily,
}: {
  card: VehicleCardData;
  frame: VehicleCardImageFrame | null;
  icons: Partial<Record<VehicleCardStatKey, string>>;
  fontFamily: string;
}): Promise<Blob> {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  const font = (weight: number, size: number) => `${weight} ${size}px ${fontFamily}`;

  const [logo, photo, iconImages] = await Promise.all([
    loadImage("/autoviewer-mark-optimized.png"),
    loadImage(card.imageSrc ?? "/placeholders/vehicle-placeholder.webp").catch(() => null),
    Promise.all(
      card.stats.map((item) => {
        const svg = icons[item.key];
        return svg ? svgToImage(svg).catch(() => null) : Promise.resolve(null);
      }),
    ),
  ]);

  ctx.fillStyle = "#eef3fa";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.shadowColor = "rgba(7, 26, 61, 0.14)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  roundedRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  roundedRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#bfd2ec";
  ctx.stroke();

  const logoHeight = 40;
  const logoWidth = (logo.naturalWidth / logo.naturalHeight) * logoHeight;
  ctx.drawImage(logo, LEFT, 96, logoWidth, logoHeight);

  ctx.font = font(800, 38);
  const plateText = card.registration;
  const plateWidth = ctx.measureText(plateText).width + 44;
  roundedRect(ctx, RIGHT - plateWidth, 86, plateWidth, 60, 10);
  ctx.fillStyle = PLATE_YELLOW;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(7, 26, 61, 0.35)";
  ctx.stroke();
  ctx.fillStyle = "#111111";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(plateText, RIGHT - plateWidth / 2, 117);

  // Lay out from the bottom up so the photo takes whatever height is left.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const footerBaseline = CARD.y + CARD.h - 44;
  const rows = Math.ceil(card.stats.length / 3);
  const gridHeight = rows > 0 ? rows * TILE_HEIGHT + (rows - 1) * TILE_GAP : 0;
  const gridTop = footerBaseline - 52 - gridHeight;

  ctx.font = font(800, 58);
  const titleLines = wrapLines(ctx, card.title, CONTENT_WIDTH, 2);
  const blocks: Array<{ text: string; font: string; color: string; height: number }> = [
    ...titleLines.map((text) => ({ text, font: font(800, 58), color: NAVY, height: 66 })),
  ];
  if (card.variant) {
    ctx.font = font(500, 32);
    blocks.push({
      text: truncate(ctx, card.variant, CONTENT_WIDTH),
      font: font(500, 32),
      color: VARIANT,
      height: 54,
    });
  }
  const textHeight = blocks.reduce((sum, block) => sum + block.height, 0);
  const textTop = gridTop - 26 - textHeight;

  const disclaimerLines = card.colour ? 2 : 1;
  const disclaimerTop = textTop - 30 - disclaimerLines * 32;

  const imageTop = 176;
  const imageMaxHeight = disclaimerTop - 12 - imageTop;
  const aspect = frame?.aspect ?? 4 / 3;
  let imageWidth = CONTENT_WIDTH * 0.9;
  let imageHeight = imageWidth / aspect;
  if (imageHeight > imageMaxHeight) {
    imageHeight = imageMaxHeight;
    imageWidth = imageHeight * aspect;
  }
  const imageLeft = (WIDTH - imageWidth) / 2;
  const imageBoxTop = imageTop + (imageMaxHeight - imageHeight) / 2;
  if (photo) {
    const nw = photo.naturalWidth;
    const nh = photo.naturalHeight;
    if (frame) {
      const visible = Math.min(1, nw / nh / frame.aspect);
      const sh = visible * nh;
      const sy = (frame.positionY / 100) * (nh - sh);
      ctx.drawImage(photo, 0, sy, nw, sh, imageLeft, imageBoxTop, imageWidth, imageHeight);
    } else {
      const scale = Math.min(imageWidth / nw, imageHeight / nh);
      const dw = nw * scale;
      const dh = nh * scale;
      ctx.drawImage(photo, imageLeft + (imageWidth - dw) / 2, imageBoxTop + (imageHeight - dh) / 2, dw, dh);
    }
  }

  ctx.textAlign = "center";
  ctx.font = font(400, 24);
  ctx.fillStyle = MUTED;
  ctx.fillText(VEHICLE_CARD_DISCLAIMER, WIDTH / 2, disclaimerTop + 26);
  if (card.colour) {
    const prefix = "Registered colour: ";
    ctx.font = font(400, 24);
    const prefixWidth = ctx.measureText(prefix).width;
    ctx.font = font(700, 24);
    const colourWidth = ctx.measureText(card.colour).width;
    const start = WIDTH / 2 - (prefixWidth + colourWidth) / 2;
    ctx.textAlign = "left";
    ctx.font = font(400, 24);
    ctx.fillStyle = MUTED;
    ctx.fillText(prefix, start, disclaimerTop + 58);
    ctx.font = font(700, 24);
    ctx.fillStyle = NAVY;
    ctx.fillText(card.colour, start + prefixWidth, disclaimerTop + 58);
  }

  ctx.textAlign = "left";
  let y = textTop;
  for (const block of blocks) {
    ctx.font = block.font;
    ctx.fillStyle = block.color;
    y += block.height;
    ctx.fillText(block.text, LEFT, y - block.height * 0.22);
  }

  const tileWidth = (CONTENT_WIDTH - TILE_GAP * 2) / 3;
  card.stats.forEach((item, index) => {
    const x = LEFT + (index % 3) * (tileWidth + TILE_GAP);
    const top = gridTop + Math.floor(index / 3) * (TILE_HEIGHT + TILE_GAP);
    roundedRect(ctx, x, top, tileWidth, TILE_HEIGHT, 24);
    ctx.fillStyle = TILE_BG;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = TILE_BORDER;
    ctx.stroke();

    roundedRect(ctx, x + 20, top, 40, 5, [0, 0, 3, 3]);
    ctx.fillStyle = "rgba(23, 105, 224, 0.35)";
    ctx.fill();

    if (item.key === "mot" && item.value === "Valid") {
      ctx.beginPath();
      ctx.arc(x + tileWidth - 22, top + 22, 12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + tileWidth - 22, top + 22, 8, 0, Math.PI * 2);
      ctx.fillStyle = GREEN;
      ctx.fill();
    }

    const icon = iconImages[index];
    const iconLeft = x + 20;
    if (icon) ctx.drawImage(icon, iconLeft, top + (TILE_HEIGHT - ICON_SIZE) / 2, ICON_SIZE, ICON_SIZE);

    const textLeft = iconLeft + ICON_SIZE + 16;
    const textWidth = x + tileWidth - 16 - textLeft;
    ctx.font = font(600, 19);
    setLetterSpacing(ctx, "1.5px");
    ctx.fillStyle = MUTED;
    ctx.fillText(truncate(ctx, item.label.toUpperCase(), textWidth), textLeft, top + 44);
    setLetterSpacing(ctx, "0px");
    ctx.font = font(800, 31);
    ctx.fillStyle = NAVY;
    ctx.fillText(truncate(ctx, item.value, textWidth), textLeft, top + 78);
  });

  ctx.textAlign = "center";
  ctx.font = font(600, 24);
  ctx.fillStyle = MUTED;
  const host = new URL(SITE_URL).host.replace(/^www\./, "");
  ctx.fillText(`Free UK vehicle check at ${host}`, WIDTH / 2, footerBaseline);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png");
  });
}
