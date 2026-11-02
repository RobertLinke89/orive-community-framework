import sharp from "sharp";

/**
 * Server-side image pipeline for facilitator uploads:
 * - decodes the real file (anything sharp cannot decode is rejected),
 * - applies the EXIF orientation, then drops ALL metadata (EXIF incl. GPS, XMP, IPTC, ICC → sRGB),
 * - renders WebP variants 400 / 800 / 1600 px wide (never upscaled; the largest is the "original").
 */
export const VARIANT_WIDTHS = [400, 800, 1600] as const;
export const MAX_INPUT_PIXELS = 40_000_000; // ~ 7700 x 5200, guards against decompression bombs

export type Variant = { width: number; height: number; bytes: Uint8Array };
export type Processed = { width: number; height: number; mime: "image/webp"; variants: Variant[] };

export async function processImage(input: Uint8Array): Promise<Processed> {
  let meta;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" }).metadata();
  } catch { throw new Error("bad_type"); }
  if (!meta.width || !meta.height) throw new Error("bad_type");
  if (meta.width < 200 || meta.height < 200) throw new Error("too_small");
  // dimensions after EXIF rotation
  const rotated = (meta.orientation ?? 1) >= 5;
  const srcW = rotated ? meta.height : meta.width;
  const widths = [...new Set(VARIANT_WIDTHS.map((w) => Math.min(w, srcW)))];
  const variants: Variant[] = [];
  for (const w of widths) {
    // no .withMetadata() → sharp writes no EXIF/GPS/XMP/IPTC; colour is converted to sRGB
    const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate().resize({ width: w, withoutEnlargement: true }).toColourspace("srgb")
      .webp({ quality: 80, effort: 4 }).toBuffer({ resolveWithObject: true });
    variants.push({ width: info.width, height: info.height, bytes: new Uint8Array(data) });
  }
  const big = variants[variants.length - 1];
  return { width: big.width, height: big.height, mime: "image/webp", variants };
}

/** Storage naming: base `{owner}/{uuid}.webp` is the largest variant, smaller ones `{owner}/{uuid}-w400.webp`. */
export const variantPath = (basePath: string, width: number, largest: number) =>
  width === largest ? basePath : basePath.replace(/\.webp$/, `-w${width}.webp`);
