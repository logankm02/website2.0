// Shared outdoor terrain art — grass, dirt paths, and bushy trees — used by
// both the village (tiles.js) and the campus scenes (campusTiles.js) so the
// whole map shares one tileset look.

import { TILE, rect, px, hash2 } from "./pixels";

export const T = {
  grass: "#84bd54", grassDark: "#69a440", grassLight: "#a3d56f", grassBlade: "#4f9234",
  dirt: "#cdb079", dirtLt: "#e3c896", dirtDk: "#a98a54", dirtEdge: "#937543",
  trunk: "#7a4c2c", trunkDark: "#553720",
  treeOutline: "#284e2a", treeDk: "#3c7a3e", treeMid: "#57a04c", treeLt: "#84c668", treeHi: "#aadb84",
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
  rect(ctx, ox, oy, TILE, TILE, T.grass);
  for (let i = 0; i < 5; i++) { // soft mottling
    const v = hash2(tx * 9 + i * 3, ty * 5 + i);
    const sx = Math.floor(hash2(tx * 4 + i, ty + i * 2) * 13);
    const sy = Math.floor(hash2(tx + i * 3, ty * 4 + i) * 13);
    if (v < 0.42) rect(ctx, ox + sx, oy + sy, 3, 2, T.grassDark);
    else if (v < 0.78) rect(ctx, ox + sx, oy + sy, 2, 1, T.grassLight);
  }
  if (hash2(tx * 3, ty * 7) > 0.8) { // an occasional tuft
    const bx = ox + 3 + Math.floor(hash2(tx, ty) * 9);
    const by = oy + 9 + Math.floor(hash2(ty, tx) * 4);
    rect(ctx, bx, by - 2, 1, 3, T.grassBlade);
    rect(ctx, bx + 2, by - 3, 1, 4, T.grassBlade);
    px(ctx, bx + 1, by - 1, T.grassBlade);
  }
}

// A tan dirt path tile. `isPath(x, y)` reports whether a neighbor is also path,
// so edges get a shaded kerb and grass tufts spill over onto the lawn.
export function paintDirt(ctx, tx, ty, isPath) {
  const ox = tx * TILE;
  const oy = ty * TILE;
  rect(ctx, ox, oy, TILE, TILE, T.dirt);
  for (let i = 0; i < 5; i++) {
    const sx = Math.floor(hash2(tx * 3 + i, ty + 5) * 14);
    const sy = Math.floor(hash2(tx + 9, ty * 3 + i) * 14);
    px(ctx, ox + sx, oy + sy, i < 2 ? T.dirtLt : T.dirtDk);
  }
  const up = !isPath(tx, ty - 1);
  const down = !isPath(tx, ty + 1);
  const left = !isPath(tx - 1, ty);
  const right = !isPath(tx + 1, ty);
  if (up) rect(ctx, ox, oy, TILE, 2, T.dirtEdge);
  if (down) rect(ctx, ox, oy + TILE - 2, TILE, 2, T.dirtEdge);
  if (left) rect(ctx, ox, oy, 2, TILE, T.dirtEdge);
  if (right) rect(ctx, ox + TILE - 2, oy, 2, TILE, T.dirtEdge);
  if (down && hash2(tx, ty) > 0.45) {
    px(ctx, ox + 3, oy + TILE - 1, T.grassDark);
    px(ctx, ox + 4, oy + TILE - 2, T.grass);
    px(ctx, ox + 10, oy + TILE - 1, T.grassDark);
  }
  if (up && hash2(ty, tx) > 0.55) {
    px(ctx, ox + 6, oy, T.grassDark);
    px(ctx, ox + 11, oy + 1, T.grass);
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

// A canopy-only clump for packed borders (no trunk shows between them).
export function paintBorderTree(ctx, ox, oy) {
  treeCanopy(ctx, ox + 8, oy + 6, ROUND_LOBES, {});
}
