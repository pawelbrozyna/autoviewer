import { rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { vehicleColourSwatch } from "@/components/vehicle/VehicleColour";

const NAVY = rgb(0.027, 0.106, 0.227);
const MUTED = rgb(0.37, 0.43, 0.51);
const BORDER = rgb(0.8, 0.83, 0.86);

function hexToPdfRgb(hex: string) {
  const raw = hex.replace("#", "").trim();
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : raw;
  const value = Number.parseInt(normalized, 16);
  if (!Number.isFinite(value)) return BORDER;
  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  );
}

function fitText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let value = text;
  while (
    value.length > 1 &&
    font.widthOfTextAtSize(`${value}...`, size) > maxWidth
  ) {
    value = value.slice(0, -1);
  }
  return `${value.trim()}...`;
}

type SpecItem = {
  label: string;
  value: string;
  iconName?: string;
  swatchColour?: string | null;
};

/**
 * 2-column vehicle details under the yellow plate (matches FreeReportHtml).
 * Left: Fuel type, First registered. Right: Transmission, Colour.
 */
export function drawVehicleSpecBlock(
  page: PDFPage,
  input: {
    x: number;
    topY: number;
    width: number;
    regular: PDFFont;
    bold: PDFFont;
    icons: Partial<Record<string, PDFImage>>;
    fuel: string;
    transmission: string;
    colour: string | null;
    firstRegistered: string;
  },
) {
  const {
    x,
    topY,
    width,
    regular,
    bold,
    icons,
    fuel,
    transmission,
    colour,
    firstRegistered,
  } = input;

  const labelSize = 7.8;
  const valueSize = 10.5;
  const iconSize = 11;
  const rowGap = 6;
  const rowHeight = labelSize + 7 + valueSize;
  const leftRatio = 0.88;
  const rightRatio = 1.2;
  const totalRatio = leftRatio + rightRatio;
  const gap = 12;
  const rightInset = 9;
  const leftWidth = ((width - gap) * leftRatio) / totalRatio;
  const rightWidth = ((width - gap) * rightRatio) / totalRatio - rightInset;
  const leftX = x;
  const rightX = x + leftWidth + gap + rightInset;
  const dividerX = x + leftWidth + gap / 2;

  const leftItems: SpecItem[] = [
    { label: "Fuel type", value: fuel, iconName: "fuel" },
    {
      label: "First registered",
      value: firstRegistered,
      iconName: "calendar",
    },
  ];
  const rightItems: SpecItem[] = [
    { label: "Transmission", value: transmission, iconName: "wrench" },
    {
      label: "Colour",
      value: colour?.trim() || "Not available",
      swatchColour: colour,
    },
  ];

  page.drawLine({
    start: { x: dividerX, y: topY - 2 },
    end: { x: dividerX, y: topY - rowHeight * 2 - rowGap + 2 },
    thickness: 0.7,
    color: BORDER,
  });

  function drawColumn(items: SpecItem[], colX: number, colWidth: number) {
    items.forEach((item, rowIndex) => {
      const rowTop = topY - rowIndex * (rowHeight + rowGap);
      page.drawText(item.label, {
        x: colX,
        y: rowTop - labelSize,
        size: labelSize,
        font: regular,
        color: MUTED,
      });

      // Align icon centre with the visual centre of the bold value.
      const valueBaseline = rowTop - labelSize - 7 - valueSize * 0.72;
      const valueCenterY = valueBaseline + valueSize * 0.35;
      const iconY = valueCenterY - iconSize / 2;
      let textX = colX;

      if (item.swatchColour !== undefined) {
        const radius = iconSize / 2;
        page.drawCircle({
          x: colX + radius,
          y: valueCenterY,
          size: radius - 0.5,
          color: hexToPdfRgb(vehicleColourSwatch(item.swatchColour)),
          borderColor: BORDER,
          borderWidth: 0.5,
        });
        textX = colX + iconSize + 5;
      } else if (item.iconName) {
        const image = icons[item.iconName];
        if (image) {
          page.drawImage(image, {
            x: colX,
            y: iconY,
            width: iconSize,
            height: iconSize,
          });
        }
        textX = colX + iconSize + 5;
      }

      page.drawText(
        fitText(item.value, bold, valueSize, colWidth - (textX - colX)),
        {
          x: textX,
          y: valueBaseline,
          size: valueSize,
          font: bold,
          color: NAVY,
        },
      );
    });
  }

  drawColumn(leftItems, leftX, leftWidth);
  drawColumn(rightItems, rightX, rightWidth);
}
