// Renders the campus scenes (the outdoor worlds behind the SCHOOL HOUSE
// portals) to offscreen canvases — University of Rochester's Eastman Quad and
// UC Berkeley's Memorial Glade. Same GBA-pastel, all-procedural style as the
// village; reached through interiors.js (rooms tagged `kind: "campus"`). Also
// exports the animated portal swirl shared by the gateways and return pads.

import { TILE, makeCanvas, rect, px, hash2 } from "./pixels";
import { disc, paintGrass, paintDirt, paintBushyTree, paintTallTree, T } from "./terrain";

const VIEW_W = 24 * TILE; // 384
const VIEW_H = 20 * TILE; // 320

const C = {
  sky: "#86bdec", skyLow: "#b6daf2", cloud: "#eaf5fb",
  hill: "#5c7e54", hillDark: "#43603e", hillLight: "#739a66",
  brick: "#a8503a", brickShade: "#7c3526", mortar: "#c98c6a", chimney: "#9a4636",
  trim: "#f0ece0", trimShade: "#cfc8b6", doorDk: "#5c3416",
  glass: "#5d7fb0", glassLt: "#9fbce6",
  iron: "#2a2e34", ironLt: "#454b54", lampGlow: "#fdf0c0",
};

function isCampusPath(room, x, y) {
  return room.paths.some(([px0, py0, w, h]) => x >= px0 && x < px0 + w && y >= py0 && y < py0 + h);
}

// Sky behind the back rows. `backdrop: "hills"` paints a forested ridge (the
// Berkeley hills); otherwise a hedge/treeline (Rochester). Either is drawn full
// width — the back buildings, painted afterward, cover their own columns, so it
// only shows through the gaps.
function paintSkyBand(ctx, room) {
  rect(ctx, 0, 0, VIEW_W, TILE, C.sky);
  rect(ctx, 0, TILE, VIEW_W, TILE, C.skyLow);
  for (const [cxp, cyp, cw] of [[40, 4, 20], [150, 8, 16], [300, 5, 22]]) {
    rect(ctx, cxp, cyp, cw, 3, C.cloud);
    rect(ctx, cxp + 3, cyp - 1, cw - 8, 1, C.cloud);
  }
  if (room.backdrop === "hills") {
    for (let x = 0; x < VIEW_W; x += 4) {
      const top = 26 - Math.round(8 * Math.sin(x * 0.012) + 4 * Math.sin(x * 0.05 + 1));
      rect(ctx, x, top, 4, 2 * TILE - top, C.hill);
      rect(ctx, x, top, 4, 2, C.hillLight);
      if ((x >> 2) % 3 === 0) px(ctx, x + 1, top + 4, C.hillDark);
    }
  } else {
    // a dense, bumpy treeline of overlapping canopies (Rochester)
    for (let x = 2; x <= VIEW_W; x += 11) {
      const cy = 2 * TILE - 5 + Math.floor(hash2(x, 3) * 4);
      disc(ctx, x, cy, 8, T.treeOutline);
      disc(ctx, x, cy, 7, T.treeDk);
      disc(ctx, x, cy - 1, 5, T.treeMid);
      disc(ctx, x - 2, cy - 2, 2, T.treeLt);
    }
  }
}

// --- Rochester buildings ----------------------------------------------------

// Rochester slate-tile roof palette, fed to the shared geometric roof painter
// so the brick halls get the same true 3D hips/ridges as Berkeley's red roofs.
const SLATE_ROOF = {
  front: "#7e8ca6", course: "#6a7790", back: "#3f4b62", side: "#566480",
  hip: "#2a3447", ridge: "#9aa8c0", edge: "#313c55",
};

const slateRoof = (ctx, x, y, w, h) => geoRoof(ctx, x, y, w, h, SLATE_ROOF);

// A grand stone entrance set into the inward edge of a wall.
function drawEntrance(ctx, x, y, w, h, horiz) {
  rect(ctx, x, y, w, h, C.trimShade);
  rect(ctx, x + 1, y + 1, w - 2, h - 2, C.trim);
  if (horiz) {
    rect(ctx, x + w / 2 - 4, y + 2, 8, h - 2, C.doorDk);
    for (const cxp of [x + 1, x + w / 2 - 7, x + w / 2 + 5, x + w - 3]) rect(ctx, cxp, y + 1, 2, h - 2, C.trimShade);
  } else {
    rect(ctx, x + 2, y + h / 2 - 4, w - 2, 8, C.doorDk);
    for (const cyp of [y + 1, y + h / 2 - 7, y + h / 2 + 5, y + h - 3]) rect(ctx, x + 1, cyp, w - 2, 2, C.trimShade);
  }
}

// A brick collegiate hall fronting the quad. `item.face` ("down"|"up"|"left"|
// "right") points the brick wall + entrance toward the green, with the slate
// hipped roof receding to the outward side. Scales to any footprint.
function paintBrickHall(ctx, ox, oy, w, h, item = {}) {
  const W = w * TILE;
  const H = h * TILE;
  const face = item.face || "down";
  const horiz = face === "down" || face === "up";
  const RD = 14; // roof depth

  let rr, wr; // roof rect, wall rect (wall overlaps the eave by 2px)
  if (face === "down") { rr = [ox, oy, W, RD]; wr = [ox, oy + RD - 2, W, H - RD + 2]; }
  else if (face === "up") { rr = [ox, oy + H - RD, W, RD]; wr = [ox, oy, W, H - RD + 2]; }
  else if (face === "right") { rr = [ox, oy, RD, H]; wr = [ox + RD - 2, oy, W - RD + 2, H]; }
  else { rr = [ox + W - RD, oy, RD, H]; wr = [ox, oy, W - RD + 2, H]; }

  const [bx, by, bw, bh] = wr;
  rect(ctx, bx, by, bw, bh, C.brickShade); // brick wall
  rect(ctx, bx + 1, by + 1, bw - 2, bh - 2, C.brick);
  for (let my = by + 6; my < by + bh; my += 7) rect(ctx, bx + 1, my, bw - 2, 1, C.mortar);

  const ncol = Math.max(2, Math.round((bw - 4) / 15)); // window grid
  const nrow = Math.max(1, Math.round((bh - 4) / 17));
  const ecx = bx + bw / 2;
  const ecy = by + bh / 2;
  for (let r = 0; r < nrow; r++)
    for (let c = 0; c < ncol; c++) {
      const gx = Math.round(bx + 3 + (c + 0.5) * (bw - 6) / ncol - 4);
      const gy = Math.round(by + 3 + (r + 0.5) * (bh - 6) / nrow - 5);
      const nearDoor = horiz
        ? Math.abs(gx + 4 - ecx) < 12 && (face === "down" ? r === nrow - 1 : r === 0)
        : Math.abs(gy + 5 - ecy) < 12 && (face === "right" ? c === ncol - 1 : c === 0);
      if (nearDoor) continue;
      rect(ctx, gx, gy, 9, 12, C.trim);
      rect(ctx, gx + 1, gy + 1, 7, 9, C.glass);
      rect(ctx, gx + 1, gy + 1, 7, 3, C.glassLt);
      rect(ctx, gx + 4, gy + 1, 1, 9, C.trim);
    }

  if (face === "down") drawEntrance(ctx, ecx - 9, by + bh - 16, 18, 16, true);
  else if (face === "up") drawEntrance(ctx, ecx - 9, by, 18, 16, true);
  else if (face === "right") drawEntrance(ctx, bx + bw - 16, ecy - 9, 16, 18, false);
  else drawEntrance(ctx, bx, ecy - 9, 16, 18, false);

  slateRoof(ctx, rr[0], rr[1], rr[2], rr[3]);

  if (horiz) { // chimneys straddling the (centered) roof ridge
    const ridgeY = rr[1] + Math.floor((RD - 1) / 2);
    for (const cf of [0.26, 0.74]) {
      const cxp = Math.round(ox + W * cf);
      rect(ctx, cxp, ridgeY - 5, 5, 7, C.chimney);
      rect(ctx, cxp, ridgeY - 5, 5, 2, "#b86a52");
    }
  }
}

// Rush Rhees Library: limestone front with slate-roofed wings, a columned
// portico, and the signature copper-domed tower.
function paintRushRhees(ctx, ox, oy, w) {
  const W = (w || 8) * TILE; // 128
  const S = {
    stone: "#e4ddc8", shade: "#cdc6ad", outline: "#8a8268", dark: "#b3a98c",
    glass: "#5d7fb0", glassLt: "#9fbce6", door: "#43506c",
    copper: "#5bbf9a", copperDk: "#3f9576", copperLt: "#86d8b8", gold: "#e6c34a",
  };
  const cx = ox + W / 2;

  rect(ctx, cx - 1, oy - 29, 2, 5, S.gold); // tower: finial
  px(ctx, cx, oy - 30, "#fff0c0");
  // copper dome shaded as a 3D sphere — lit on the lower-left, shadowed upper-right
  for (let dy = -9; dy <= 0; dy++)
    for (let dx = -13; dx <= 13; dx++) {
      if (dx * dx / 169 + dy * dy / 81 > 1) continue;
      const lit = -dx + dy * 1.4;
      px(ctx, cx + dx, oy - 16 + dy, lit > 4 ? S.copperLt : lit < -10 ? S.copperDk : S.copper);
    }
  disc(ctx, cx - 7, oy - 18, 2, "#bdf0d8"); // specular glint
  for (let dx = 1; dx <= 12; dx++) px(ctx, cx + dx, oy - 16, "rgba(26,38,50,0.30)"); // shadow at the dome's base
  rect(ctx, cx - 12, oy - 16, 24, 9, S.outline); // lantern
  rect(ctx, cx - 11, oy - 15, 22, 8, S.stone);
  for (const lx of [-8, -3, 2, 7]) rect(ctx, cx + lx, oy - 14, 2, 6, S.door);
  rect(ctx, cx - 15, oy - 8, 30, 14, S.outline); // belfry
  rect(ctx, cx - 14, oy - 7, 28, 13, S.stone);
  rect(ctx, cx - 7, oy - 5, 14, 11, S.door);
  for (const bx of [-3, 2]) rect(ctx, cx + bx, oy - 5, 1, 11, S.stone);

  rect(ctx, ox, oy, W, 48, S.outline); // base
  rect(ctx, ox + 1, oy + 1, W - 2, 46, S.stone);
  rect(ctx, ox + 1, oy + 1, W - 2, 3, "#eee7d2");
  rect(ctx, ox + 1, oy + 44, W - 2, 3, S.shade);
  // slate hipped roofs over the wings, flanking the central portico/dome
  const wing = Math.round(W * 0.32);
  slateRoof(ctx, ox, oy - 11, wing, 11);
  slateRoof(ctx, ox + W - wing, oy - 11, wing, 11);
  for (let pxr = ox + 8; pxr < ox + W - 6; pxr += 16) rect(ctx, pxr, oy + 6, 1, 38, S.dark);
  for (let wx = ox + 6; wx < ox + W - 10; wx += 16) {
    if (Math.abs(wx + 3 - cx) < 26) continue;
    rect(ctx, wx, oy + 12, 8, 22, S.outline);
    rect(ctx, wx + 1, oy + 13, 6, 20, S.glass);
    rect(ctx, wx + 1, oy + 13, 6, 5, S.glassLt);
    rect(ctx, wx + 1, oy + 22, 6, 1, S.outline);
  }
  for (let r = 0; r <= 8; r++) { // solid pediment (apex up) over the portico
    const hw = Math.round((r / 8) * 22);
    rect(ctx, cx - hw, oy + 2 + r, hw * 2 + 1, 1, S.stone);
    px(ctx, cx - hw, oy + 2 + r, S.outline);
    px(ctx, cx + hw, oy + 2 + r, S.outline);
  }
  rect(ctx, cx - 24, oy + 10, 48, 2, S.shade); // projecting cornice…
  rect(ctx, cx - 23, oy + 12, 46, 2, "rgba(26,30,44,0.22)"); // …with its cast shadow for depth
  for (const colx of [cx - 19, cx - 9, cx + 6, cx + 16]) { // columns with highlight + shade
    rect(ctx, colx, oy + 14, 4, 26, S.stone);
    rect(ctx, colx, oy + 14, 1, 26, "#eee7d2");
    rect(ctx, colx + 3, oy + 14, 1, 26, S.shade);
  }
  rect(ctx, cx - 5, oy + 24, 10, 16, S.door); // recessed entrance
  rect(ctx, cx - 5, oy + 24, 10, 2, "#2f3a52");
  rect(ctx, cx - 4, oy + 24, 1, 16, "rgba(0,0,0,0.25)");
  rect(ctx, cx - 20, oy + 40, 40, 3, S.shade); // steps
  rect(ctx, cx - 22, oy + 43, 44, 4, S.dark);
}

// --- Berkeley buildings -----------------------------------------------------

// Every Berkeley hall shares one red clay-tile roof palette.
const RED_PAL = {
  front: "#e2823f", course: "#cf7038", back: "#9c4824", side: "#c46434",
  hip: "#7a3014", ridge: "#f8c084", edge: "#5e2810",
};

// One rectangular hipped roof drawn with EXPLICIT geometry: each pixel belongs
// to the slope of its nearest edge (south = lit front with tile courses, north =
// shaded back, east/west = sides), the corner diagonals are the hips, and a
// bright ridge line caps the medial axis. Works at any size, so buildings are
// composed by stacking these blocks.
function geoRoof(ctx, x, y, w, h, pal) {
  for (let py = 0; py < h; py++)
    for (let pxx = 0; pxx < w; pxx++) {
      const dT = py, dB = h - 1 - py, dL = pxx, dR = w - 1 - pxx;
      const mn = Math.min(dT, dB, dL, dR);
      let c;
      if (mn === 0) c = pal.edge; // eave outline
      else {
        const nTB = dT === mn || dB === mn;
        const nLR = dL === mn || dR === mn;
        if (nTB && nLR) c = pal.hip; // 45° corner hip
        else if (dB === mn) c = py % 3 === 0 ? pal.course : pal.front; // south slope
        else if (dT === mn) c = pal.back; // north slope
        else c = pal.side; // east / west slope
      }
      px(ctx, x + pxx, y + py, c);
    }
  if (w >= h) { // bright ridge along the long axis
    const k = ((h - 1) / 2) | 0;
    rect(ctx, x + k, y + k, w - 2 * k, h % 2 ? 1 : 2, pal.ridge);
  } else {
    const k = ((w - 1) / 2) | 0;
    rect(ctx, x + k, y + k, w % 2 ? 1 : 2, h - 2 * k, pal.ridge);
  }
}

// The cream south wall strip under the roof eave, with the halls' signature
// rhythm of blue window accents. Returns the wall's top y for entrances.
function southWall(ctx, ox, oy, W, H, item) {
  const wallH = 9;
  const wy = oy + H - wallH;
  rect(ctx, ox, wy - 1, W, 1, "#5e2810"); // eave shadow
  rect(ctx, ox, wy, W, wallH, "#8a7a52");
  rect(ctx, ox + 1, wy, W - 2, wallH - 1, "#ece2c8");
  rect(ctx, ox + 1, wy, W - 2, 1, "#f6efd9"); // sunlit top course
  const cx = ox + W / 2;
  const step = item.vwindows ? 7 : 11; // Starr gets a tighter screen rhythm
  for (let gx = ox + 5; gx < ox + W - 5; gx += step) {
    if (Math.abs(gx + 1 - cx) < (item.portico || item.stoneEntry ? 16 : 5)) continue;
    rect(ctx, gx, wy + 2, 3, wallH - 3, C.glass); // blue/grey window
    rect(ctx, gx, wy + 2, 3, 1, "#bcd0d8"); // bright sill
  }
  return wy;
}

// A campus hall composed of explicit roof blocks (`item.blocks`, tile rects)
// around optional `item.courts` (interior gardens). Style + facade details vary
// per building so each reads as its real-world landmark.
function paintHall(ctx, ox, oy, w, h, item = {}) {
  const W = w * TILE, H = h * TILE;

  // interior garden courtyards, laid down first so the roof eaves frame them
  (item.courts || []).forEach(([cx, cy, cw, ch]) => {
    const x0 = ox + cx * TILE, y0 = oy + cy * TILE, pw = cw * TILE, ph = ch * TILE;
    rect(ctx, x0, y0, pw, ph, "#4a5238"); // shaded well
    rect(ctx, x0 + 1, y0 + 1, pw - 2, ph - 2, "#6f8452"); // lawn
    rect(ctx, x0 + (pw >> 1) - 2, y0 + (ph >> 1) - 1, 4, 3, "#54703e"); // a shrub
  });

  // the roof, block by block
  (item.blocks || [[0, 0, w, h]]).forEach(([bx, by, bw, bh]) =>
    geoRoof(ctx, ox + bx * TILE, oy + by * TILE, bw * TILE, bh * TILE, RED_PAL));

  const wy = southWall(ctx, ox, oy, W, H, item);
  const cx = ox + W / 2;

  if (!item.portico && !item.stoneEntry) // a subtle centered door
    rect(ctx, cx - 2, wy + 1, 5, 8, "#6a4a2e");

  if (item.portico) { // Doe's grand columned portico under a solid pediment
    const py = oy + H;
    const pedH = 11, pedW = 15;
    for (let r = 0; r <= pedH; r++) { // solid cream triangle, dark raked edges
      const hw = Math.round((r / pedH) * pedW);
      rect(ctx, cx - hw, py - 13 - pedH + r, hw * 2 + 1, 1, "#ece2c8");
      px(ctx, cx - hw, py - 13 - pedH + r, "#b6aa84");
      px(ctx, cx + hw, py - 13 - pedH + r, "#b6aa84");
    }
    rect(ctx, cx - 16, py - 13, 33, 13, "#cabf9e"); // entablature
    rect(ctx, cx - 15, py - 12, 31, 12, "#ece2c8");
    rect(ctx, cx - 15, py - 12, 31, 1, "#f6efd9");
    for (let c = cx - 13; c <= cx + 11; c += 4) { // fluted columns
      rect(ctx, c, py - 10, 2, 10, "#d8cdab");
      px(ctx, c, py - 10, "#b6aa84");
    }
    rect(ctx, cx - 4, py - 9, 8, 9, "#4a3220"); // central doorway
    rect(ctx, cx - 17, py, 35, 2, "#b6aa84"); // steps
  }

  if (item.stoneEntry) { // Wheeler's heavy stone entry with double doors
    const py = oy + H;
    rect(ctx, cx - 13, py - 14, 26, 14, "#9c9684");
    rect(ctx, cx - 12, py - 13, 24, 13, "#c4bdab");
    rect(ctx, cx - 12, py - 13, 24, 1, "#ddd6c4");
    rect(ctx, cx - 8, py - 10, 7, 10, "#4a3422"); // left door
    rect(ctx, cx + 1, py - 10, 7, 10, "#4a3422"); // right door
    rect(ctx, cx - 1, py - 11, 2, 11, "#9c9684"); // center mullion
    rect(ctx, cx - 13, py, 26, 2, "#8f8876"); // steps
  }
}

// The bronze University of California seal set in a round stone planter.
function paintUCSeal(ctx, ox, oy) {
  const cx = ox + 8;
  const cy = oy + 9;
  for (let a = 0; a < 56; a++) {
    const ang = (a / 56) * Math.PI * 2;
    px(ctx, Math.round(cx + Math.cos(ang) * 9), Math.round(cy + Math.sin(ang) * 9), "#b6a878");
  }
  disc(ctx, cx, cy, 8, "#8c7c54");
  disc(ctx, cx, cy, 6, "#16244e"); // navy seal
  for (let a = 0; a < 30; a++) {
    const ang = (a / 30) * Math.PI * 2;
    px(ctx, Math.round(cx + Math.cos(ang) * 6), Math.round(cy + Math.sin(ang) * 6), "#e0b840"); // gold rim
  }
  disc(ctx, cx, cy, 3, "#f2ecda"); // open book
  rect(ctx, cx - 2, cy, 5, 1, "#16244e");
  px(ctx, cx, cy - 4, "#f6e8a0"); // star above
}

// Sather Tower — the Campanile. A slender granite clock tower with a belfry,
// gold clock, and a tall pointed green-copper spire over a wider base.
function paintCampanile(ctx, ox, oy, w) {
  const W = (w || 3) * TILE; // 48
  const cx = ox + W / 2; // 216
  const T = {
    stone: "#ece7d8", shade: "#cbc6b4", shadeDk: "#a39d88", outline: "#7a7460", lt: "#f6f2e6", hi: "#fffaf0",
    glass: "#2a3550", gold: "#e6c34a", goldLt: "#fff0c0",
    copper: "#3fae84", copperDk: "#2c8a66", copperLt: "#74d6aa",
  };
  const tw = 16;
  const tx = cx - tw / 2;

  rect(ctx, cx - 1, oy - 46, 2, 4, T.gold); // finial
  px(ctx, cx, oy - 47, T.goldLt);
  for (let i = 0; i < 24; i++) { // sharp pointed verdigris spire (lit left / shaded right)
    const half = Math.max(1, Math.round((i * 8) / 23));
    rect(ctx, cx - half, oy - 42 + i, half, 1, i < 3 ? T.copperLt : T.copper);
    rect(ctx, cx, oy - 42 + i, half, 1, i < 3 ? T.copper : T.copperDk);
  }
  rect(ctx, tx - 1, oy - 20, tw + 2, 2, T.copperDk); // cornice
  rect(ctx, tx, oy - 18, tw, 10, T.outline); // belfry
  rect(ctx, tx + 1, oy - 17, tw - 2, 8, T.stone);
  rect(ctx, tx + 1, oy - 17, 2, 8, T.lt); rect(ctx, tx + tw - 2, oy - 17, 1, 8, T.shadeDk);
  for (const a of [-6, 1]) { // two open arched belfry windows
    rect(ctx, cx + a, oy - 15, 5, 7, T.glass);
    px(ctx, cx + a, oy - 15, T.stone); px(ctx, cx + a + 4, oy - 15, T.stone); // rounded arch shoulders
    px(ctx, cx + a + 2, oy - 16, T.glass); // arch peak
  }
  rect(ctx, tx - 1, oy - 9, tw + 2, 9, T.outline); // clock stage
  rect(ctx, tx, oy - 8, tw, 8, T.stone);
  rect(ctx, tx, oy - 8, 2, 8, T.lt); rect(ctx, tx + tw - 2, oy - 8, 1, 8, T.shadeDk);
  const ccy = oy - 4; // crisp circular clock face
  for (let a = 0; a < 28; a++) {
    const ang = (a / 28) * Math.PI * 2;
    px(ctx, Math.round(cx + Math.cos(ang) * 3.3), Math.round(ccy + Math.sin(ang) * 3.3), T.gold);
  }
  disc(ctx, cx, ccy, 2, T.hi);
  px(ctx, cx, ccy, T.outline); // hub
  px(ctx, cx, ccy - 2, T.outline); px(ctx, cx, ccy - 1, T.outline); // hour hand
  px(ctx, cx + 1, ccy, T.outline); // minute hand
  rect(ctx, tx, oy, tw, 32, T.outline); // granite shaft through the footprint
  rect(ctx, tx + 1, oy, tw - 2, 32, T.stone);
  rect(ctx, tx + 1, oy, 1, 32, T.hi); rect(ctx, tx + 2, oy, 2, 32, T.lt); // strong left highlight
  rect(ctx, tx + tw - 3, oy, 2, 32, T.shade); rect(ctx, tx + tw - 2, oy, 1, 32, T.shadeDk); // right shadow
  rect(ctx, ox + 6, oy + 22, W - 12, 10, T.outline); // wider base + door
  rect(ctx, ox + 7, oy + 23, W - 14, 9, T.stone);
  rect(ctx, cx - 4, oy + 25, 8, 7, T.glass);
  [3, 1, 0].forEach((inset, i) => rect(ctx, cx - 4 + inset, oy + 23 + i, 8 - inset * 2, 1, T.outline));
}

// --- props ------------------------------------------------------------------

// A black ornamental lamppost beside the path.
function paintLamppost(ctx, ox, oy) {
  const x = ox + 7;
  rect(ctx, x - 2, oy + 11, 6, 3, C.iron); // base
  rect(ctx, x, oy - 14, 2, 26, C.iron); // pole
  rect(ctx, x, oy - 14, 1, 26, C.ironLt);
  rect(ctx, x - 3, oy - 21, 8, 7, C.iron); // lantern
  rect(ctx, x - 2, oy - 20, 6, 5, C.lampGlow);
  rect(ctx, x - 2, oy - 20, 6, 1, "#fffce8");
  rect(ctx, x - 3, oy - 22, 8, 1, C.iron);
  px(ctx, x, oy - 23, C.iron);
}

// The shimmering return pad at the foot of the quad (over the exit mats).
function paintPortalPad(ctx, mats) {
  const xs = mats.map((m) => m[0]);
  const minX = Math.min(...xs) * TILE;
  const w = (Math.max(...xs) - Math.min(...xs) + 1) * TILE;
  const cx = minX + w / 2;
  const cy = mats[0][1] * TILE + 8;
  for (let a = 0; a < 40; a++) {
    const ang = (a / 40) * Math.PI * 2;
    px(ctx, Math.round(cx + Math.cos(ang) * 14), Math.round(cy + Math.sin(ang) * 7), "#5a5168");
  }
  for (let dy = -6; dy <= 6; dy++)
    for (let dx = -13; dx <= 13; dx++) {
      const d = dx * dx / 169 + dy * dy / 36;
      const c = d < 0.3 ? "#dfeaff" : d < 0.6 ? "#8fb6ff" : d < 0.9 ? "#7a4bc4" : null;
      if (c) px(ctx, Math.round(cx + dx), Math.round(cy + dy), c);
    }
}

// --- shadows ------------------------------------------------------------------

// Soft directional shadows under buildings and trees, grounding them on the lawn.
function paintShadows(ctx, room) {
  room.furniture.forEach((f) => {
    const x = f.x * TILE;
    const y = f.y * TILE;
    const w = (f.w || 1) * TILE;
    const h = (f.h || 1) * TILE;
    if (f.kind === "campusTree" || f.kind === "pineTree") {
      for (let dy = -2; dy <= 3; dy++)
        for (let dx = -7; dx <= 9; dx++)
          if (dx * dx / 72 + dy * dy / 9 <= 1) px(ctx, x + 9 + dx, y + 15 + dy, "rgba(0,0,0,0.16)");
    } else if (f.kind === "hall" || f.kind === "campanile" || f.kind === "brickHall" || f.kind === "rushRhees") {
      rect(ctx, x + 6, y + h, w, 6, "rgba(18,26,12,0.26)"); // solid cast to the south
      rect(ctx, x + w, y + 6, 6, h, "rgba(18,26,12,0.22)"); // and to the east
      rect(ctx, x + w, y + h, 6, 6, "rgba(18,26,12,0.26)"); // SE corner
    }
  });
}

// --- critters (the campus regulars) ------------------------------------------

function paintPikachu(ctx, ox, oy) {
  const x = ox + 4;
  rect(ctx, x + 1, oy, 2, 4, "#f6d020"); rect(ctx, x + 1, oy, 2, 1, "#2a2018"); // ears
  rect(ctx, x + 6, oy, 2, 4, "#f6d020"); rect(ctx, x + 6, oy, 2, 1, "#2a2018");
  rect(ctx, x, oy + 3, 9, 8, "#f6d020"); // head/body
  rect(ctx, x, oy + 9, 9, 2, "#e0a818");
  px(ctx, x + 2, oy + 5, "#2a2018"); px(ctx, x + 6, oy + 5, "#2a2018"); // eyes
  px(ctx, x + 1, oy + 7, "#e8584a"); px(ctx, x + 7, oy + 7, "#e8584a"); // cheeks
}

function paintPsyduck(ctx, ox, oy) {
  const x = ox + 4;
  px(ctx, x + 2, oy, "#2a2018"); px(ctx, x + 4, oy, "#2a2018"); px(ctx, x + 6, oy, "#2a2018"); // hair
  rect(ctx, x, oy + 2, 1, 3, "#f4e070"); rect(ctx, x + 8, oy + 2, 1, 3, "#f4e070"); // arms up
  rect(ctx, x + 1, oy + 1, 7, 6, "#f4e070"); // head
  rect(ctx, x + 1, oy + 6, 7, 4, "#d8a848"); // beak
  px(ctx, x + 2, oy + 3, "#2a2018"); px(ctx, x + 6, oy + 3, "#2a2018"); // eyes
}

function paintSquirtle(ctx, ox, oy) {
  const x = ox + 4;
  rect(ctx, x + 1, oy, 6, 5, "#6fc6da"); // head
  px(ctx, x + 2, oy + 2, "#2a2018"); px(ctx, x + 5, oy + 2, "#2a2018"); // eyes
  rect(ctx, x, oy + 5, 8, 6, "#c8884a"); // shell
  rect(ctx, x + 2, oy + 6, 4, 4, "#9a6432");
  rect(ctx, x, oy + 6, 1, 3, "#6fc6da"); rect(ctx, x + 7, oy + 6, 1, 3, "#6fc6da"); // arms
}

const CAMPUS_PAINTERS = {
  brickHall: paintBrickHall,
  rushRhees: paintRushRhees,
  hall: paintHall,
  campanile: paintCampanile,
  ucSeal: paintUCSeal,
  campusTree: paintBushyTree,
  pineTree: paintTallTree,
  lamppost: paintLamppost,
  pikachu: paintPikachu,
  psyduck: paintPsyduck,
  squirtle: paintSquirtle,
};

// --- assembly --------------------------------------------------------------

export function buildCampusArt(room) {
  const [bg, ctx] = makeCanvas(VIEW_W, VIEW_H);

  const m = room.pathMatrix; // a hand-plotted tile map ("#" = dirt path)
  const onPath = m
    ? (x, y) => y >= 0 && y < m.length && x >= 0 && x < m[y].length && m[y][x] === "#"
    : (x, y) => isCampusPath(room, x, y);
  for (let ty = 0; ty < room.h; ty++)
    for (let tx = 0; tx < room.w; tx++)
      onPath(tx, ty) ? paintDirt(ctx, tx, ty, onPath) : paintGrass(ctx, tx, ty);
  if (!m) paintSkyBand(ctx, room); // the bird's-eye campus has no horizon

  paintPortalPad(ctx, room.mats);
  if (m) paintShadows(ctx, room); // ground the buildings/trees on the lawn
  // Y-sort by each item's base row so nearer (lower) roofs/trees overlap farther
  // ones, and the Campanile spire sits over whatever is behind it.
  const order = m ? [...room.furniture].sort((a, b) => a.y + (a.h || 1) - (b.y + (b.h || 1))) : room.furniture;
  order.forEach((f) => CAMPUS_PAINTERS[f.kind](ctx, f.x * TILE, f.y * TILE, f.w, f.h, f));

  return { bg, ox: 0, oy: 0 };
}

// A swirling portal overlay, drawn live on the main canvas. Used both for the
// school-house archways and the campus return pads (`now` from rAF).
export function drawPortalFx(ctx, x, y, w, h, now) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const t = now / 1000;
  for (let r = 0; r < 3; r++) {
    const phase = t * 2.2 + r * 0.7;
    const rad = 3 + r * 3 + Math.sin(phase) * 1.2;
    const col = ["#e6f1ff", "#86b0ff", "#a06cf0"][r];
    for (let a = 0; a < 10; a++) {
      const ang = (a / 10) * Math.PI * 2 + phase;
      px(ctx, Math.round(cx + Math.cos(ang) * rad), Math.round(cy + Math.sin(ang) * rad * 0.62), col);
    }
  }
  if (Math.sin(t * 5) > -0.3) px(ctx, Math.round(cx), Math.round(cy), "#ffffff");
  for (let s = 0; s < 4; s++) {
    const sp = (t * 0.7 + s * 0.27) % 1;
    const sx = cx + Math.sin(t * 3 + s * 1.7) * (w * 0.28);
    px(ctx, Math.round(sx), Math.round(y + h - sp * h), sp < 0.5 ? "#dfeaff" : "#a06cf0");
  }
}
