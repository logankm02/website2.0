// Tiny pixel-art toolkit. All game art is drawn programmatically — original
// work in the spirit of GBA-era RPGs, no ripped assets.

export const TILE = 16;

export function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

// Paint a string-matrix sprite. Each row is a string; each char indexes the
// palette map. "." (or space) = transparent.
export function stamp(ctx, rows, palette, ox = 0, oy = 0) {
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === "." || ch === " ") continue;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

// Build an offscreen sprite canvas from a string matrix.
export function sprite(rows, palette) {
  const w = Math.max(...rows.map((r) => r.length));
  const [c, ctx] = makeCanvas(w, rows.length);
  stamp(ctx, rows, palette);
  return c;
}

// Horizontally mirror a sprite canvas (for left/right walk frames).
export function flip(spriteCanvas) {
  const [c, ctx] = makeCanvas(spriteCanvas.width, spriteCanvas.height);
  ctx.translate(spriteCanvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(spriteCanvas, 0, 0);
  return c;
}

export function px(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Deterministic pseudo-random in [0,1) from grid coords — keeps grass
// speckle stable between renders.
export function hash2(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}
