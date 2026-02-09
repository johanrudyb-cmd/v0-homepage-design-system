/**
 * Rend le fond blanc ou quasi-blanc transparent (pour logos).
 * Utilise sharp : pixels dont la luminance est au-dessus du seuil → alpha = 0.
 */

import sharp from 'sharp';

/** Seuil de luminance (0–255) au-dessus duquel le pixel est considéré comme fond et rendu transparent.
 * 235 = fonds quasi blancs et gris très clairs (logos enregistrés, exports JPEG, etc.). */
const LUMINANCE_THRESHOLD = 235;

/** Seuil : si r,g,b sont tous >= ce nombre, on rend transparent (blanc / gris très clair). */
const WHITE_THRESHOLD = 235;

/**
 * Prend un buffer image (PNG/JPEG) et retourne un buffer PNG avec le fond blanc/clair rendu transparent.
 */
export async function makeWhiteBackgroundTransparent(inputBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
    const isWhite = r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
    const isLight = luminance >= LUMINANCE_THRESHOLD;
    if (isWhite || isLight) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();
}
