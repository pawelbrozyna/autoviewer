import localFont from "next/font/local";

/** Typeface used for UK registration plates. */
export const plateFont = localFont({
  src: "../../public/fonts/BarlowCondensed-SemiBold.ttf",
  weight: "600",
  display: "swap",
});
