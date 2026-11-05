// Shared outdoor terrain art — grass, dirt paths, and bushy trees — used by
// both the village (tiles.js) and the campus scenes (campusTiles.js) so the
// whole map shares one tileset look.

import { TILE, rect, px, hash2 } from "./pixels";

// HGSS-muted palette: deeper leaf greens, and the dirt keys now carry the
// golden mosaic-brick paving tones (dirt = brick, dirtLt = lit brick top,
// dirtDk = grout, dirtEdge = kerb).
export const T = {
  grass: "#55ad50", grassAlt: "#4da348", grassDark: "#429544", grassLight: "#67bf5c", grassBlade: "#337d36",
  dirt: "#d3a955", dirtLt: "#e7c87e", dirtDk: "#b18844", dirtEdge: "#8a6832",
  trunk: "#7a4c2c", trunkDark: "#553720",
  treeOutline: "#1e5128", treeDk: "#2f7f3d", treeMid: "#4aa54e", treeLt: "#6fc363", treeHi: "#97dc7f",
  autumn: "#d88030", autumnDk: "#a85420", autumnLt: "#f0a850",
};

// A filled disc — the building block for bushy tree canopies.
export function disc(ctx, cx, cy, r, color) {
  const r2 = r * r + r;
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r2) px(ctx, Math.round(cx + dx), Math.round(cy + dy), color);
}

export function paintGrass(ctx, tx, ty) {
  const ox = tx * TILE;
  const oy = ty * TILE;
  // Gen-4 signature: a subtle two-tone tile checkerboard under everything
  rect(ctx, ox, oy, TILE, TILE, (tx + ty) % 2 ? T.grassAlt : T.grass);
  // Turf texture: staggered rows of short dashes. Row phase is global so the
  // pattern reads as one continuous lawn, not a per-tile stamp.
  for (let row = 0; row < 4; row++) {
    const y = oy + 2 + row * 4;
    const shift = (row % 2) * 4;
    for (let x = shift; x <= TILE - 3; x += 8) {
      const v = hash2(tx * 31 + x, ty * 17 + row);
      if (v < 0.5) rect(ctx, ox + x, y, 3, 1, T.grassDark);
      else if (v > 0.8) rect(ctx, ox + x, y, 2, 1, T.grassLight);
    }
  }
  // Broad mottling: checker-dithered darker patches that clump over 2×2 tile
  // groups, so the meadow gets large soft tone shifts on top of the dashes.
  if (hash2((tx >> 1) * 13, (ty >> 1) * 29 + 7) < 0.28) {
    for (let y = 0; y < TILE; y++)
      for (let x = y % 2; x < TILE; x += 2)
        if (hash2(tx * TILE + x, ty * TILE + y) < 0.55) px(ctx, ox + x, oy + y, T.grassDark);
  }
  if (hash2(tx * 3, ty * 7) > 0.8) { // an occasional tuft
    const bx = ox + 3 + Math.floor(hash2(tx, ty) * 9);
    const by = oy + 9 + Math.floor(hash2(ty, tx) * 4);
    rect(ctx, bx, by - 2, 1, 3, T.grassBlade);
    rect(ctx, bx + 2, by - 3, 1, 4, T.grassBlade);
    px(ctx, bx + 1, by - 1, T.grassBlade);
  }
  if (hash2(tx * 13, ty * 23) > 0.91) { // scattered wildflowers, HGSS-lawn style
    const fx = ox + 3 + Math.floor(hash2(tx + 4, ty) * 10);
    const fy = oy + 3 + Math.floor(hash2(tx, ty + 4) * 10);
    const gold = hash2(tx, ty * 9) > 0.5;
    px(ctx, fx, fy, gold ? "#f0b73e" : "#e05340");
    px(ctx, fx + 1, fy, gold ? "#f0b73e" : "#e05340");
    px(ctx, fx, fy - 1, gold ? "#fbe08a" : "#f58a78");
  }
}

// Golden mosaic-brick paving in the HGSS style: two courses of rounded
// bricks per tile in a running bond (half-bricks at the seams keep the bond
// continuous across tiles) over a grout base. `isPath(x, y)` reports whether
// a neighbor is also paved, so edges get a dark kerb, outer corners round
// off into the grass, and tufts spill over the border.
export function paintDirt(ctx, tx, ty, isPath) {
  const ox = tx * TILE;
  const oy = ty * TILE;
  rect(ctx, ox, oy, TILE, TILE, T.dirtDk); // grout
  for (let row = 0; row < 2; row++) {
    const by = oy + row * 8;
    for (const bx of row ? [-4, 4, 12] : [0, 8]) {
      const x0 = Math.max(ox, ox + bx);
      const x1 = Math.min(ox + TILE, ox + bx + 7);
      rect(ctx, x0, by, x1 - x0, 7, T.dirt);
      rect(ctx, x0, by, x1 - x0, 2, T.dirtLt); // lit top face
      const v = hash2(tx * 16 + bx * 3, ty * 16 + row * 7); // per-brick tone shift
      if (v < 0.16) rect(ctx, x0, by + 2, x1 - x0, 5, "#c79a4b");
      else if (v > 0.9) rect(ctx, x0, by + 2, x1 - x0, 5, "#deb968");
      rect(ctx, x0, by + 6, x1 - x0, 1, "#c2954a"); // shaded underside rounds the brick
      if (bx >= 0) { // rounded brick corners, knocked back to grout
        px(ctx, ox + bx, by, T.dirtDk);
        px(ctx, ox + bx, by + 6, T.dirtDk);
      }
      if (bx + 7 <= TILE) {
        px(ctx, ox + bx + 6, by, T.dirtDk);
        px(ctx, ox + bx + 6, by + 6, T.dirtDk);
      }
    }
  }
  const up = !isPath(tx, ty - 1);
  const down = !isPath(tx, ty + 1);
  const left = !isPath(tx - 1, ty);
  const right = !isPath(tx + 1, ty);
  if (up) rect(ctx, ox, oy, TILE, 1, T.dirtEdge);
  if (down) rect(ctx, ox, oy + TILE - 1, TILE, 1, T.dirtEdge);
  if (left) rect(ctx, ox, oy, 1, TILE, T.dirtEdge);
  if (right) rect(ctx, ox + TILE - 1, oy, 1, TILE, T.dirtEdge);
  // rounded outer corners: knock the corner pixel back to grass
  if (up && left) { px(ctx, ox, oy, T.grass); px(ctx, ox + 1, oy + 1, T.dirtEdge); }
  if (up && right) { px(ctx, ox + TILE - 1, oy, T.grass); px(ctx, ox + TILE - 2, oy + 1, T.dirtEdge); }
  if (down && left) { px(ctx, ox, oy + TILE - 1, T.grass); px(ctx, ox + 1, oy + TILE - 2, T.dirtEdge); }
  if (down && right) { px(ctx, ox + TILE - 1, oy + TILE - 1, T.grass); px(ctx, ox + TILE - 2, oy + TILE - 2, T.dirtEdge); }
  // grass creeping over the kerb
  if (down && hash2(tx, ty) > 0.45) {
    px(ctx, ox + 3, oy + TILE - 1, T.grassDark);
    px(ctx, ox + 4, oy + TILE - 2, T.grass);
    px(ctx, ox + 10, oy + TILE - 1, T.grassDark);
  }
  if (up && hash2(ty, tx) > 0.55) {
    px(ctx, ox + 6, oy, T.grassDark);
    px(ctx, ox + 11, oy + 1, T.grass);
  }
  if (left && hash2(tx * 7, ty) > 0.6) {
    px(ctx, ox, oy + 5, T.grassDark);
    px(ctx, ox + 1, oy + 10, T.grass);
  }
  if (right && hash2(ty * 7, tx) > 0.6) {
    px(ctx, ox + TILE - 1, oy + 7, T.grassDark);
    px(ctx, ox + TILE - 2, oy + 12, T.grass);
  }
}

// A dense, bumpy canopy from overlapping lobes: dark outline, shaded body,
// sunlit top. `item.autumn` swaps the greens for fall colors. No trunk — callers
// add one if the tree stands alone (border trees pack canopy-to-canopy).
export function treeCanopy(ctx, cx, cy, lobes, item = {}) {
  const [o, dk, mid, lt, hi] = item.autumn
    ? ["#6e3414", T.autumnDk, T.autumn, T.autumnLt, "#f8c878"]
    : [T.treeOutline, T.treeDk, T.treeMid, T.treeLt, T.treeHi];
  lobes.forEach(([lx, ly, r]) => disc(ctx, cx + lx, cy + ly, r + 1, o));
  lobes.forEach(([lx, ly, r]) => disc(ctx, cx + lx, cy + ly, r, dk));
  lobes.forEach(([lx, ly, r]) => disc(ctx, cx + lx, cy + ly - 1, r - 1, mid));
  lobes.forEach(([lx, ly, r]) => disc(ctx, cx + lx - 1, cy + ly - 2, Math.max(1, r - 3), lt));
  disc(ctx, cx - 3, cy - 2, 2, hi);
}

const ROUND_LOBES = [[0, 0, 6], [-5, 2, 5], [5, 2, 5], [-2, 5, 5], [3, 5, 5]];
const TALL_LOBES = [[0, -10, 5], [-4, -5, 5], [4, -5, 5], [0, -1, 6], [-3, 4, 5], [3, 4, 5]];

function trunk(ctx, cx, oy) {
  rect(ctx, cx - 1, oy + 9, 3, 6, T.trunk);
  rect(ctx, cx + 1, oy + 9, 1, 6, T.trunkDark);
  rect(ctx, cx - 2, oy + 14, 5, 1, T.trunkDark);
}

// A standalone round tree (trunk + bumpy canopy), sitting in its tile.
export function paintBushyTree(ctx, ox, oy, w, h, item = {}) {
  trunk(ctx, ox + 8, oy);
  treeCanopy(ctx, ox + 8, oy, ROUND_LOBES, item);
}

// A taller standalone tree.
export function paintTallTree(ctx, ox, oy) {
  trunk(ctx, ox + 8, oy);
  treeCanopy(ctx, ox + 8, oy, TALL_LOBES, {});
}

// Packed border forest: a tall canopy (≈2 tiles high, no trunk — they stand
// canopy-to-canopy) that overlaps the tile behind it, so the tree line gets
// real height once structures are depth-sorted.
const BORDER_LOBES = [
  [0, -10, 5], [-4, -6, 5], [4, -6, 5],
  [0, -2, 6], [-5, 2, 5], [5, 2, 5],
  [-2, 6, 5], [3, 6, 5],
];
export function paintBorderTree(ctx, ox, oy) {
  treeCanopy(ctx, ox + 8, oy + 4, BORDER_LOBES, {});
  disc(ctx, ox + 6, oy - 7, 2, T.treeHi); // lit crown
}
