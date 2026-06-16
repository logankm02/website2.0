// Renders interior rooms to offscreen canvases, centered on the GBA screen
// with black surround — wood-plank houses and a tiled lab, in the style of
// classic first-gen town interiors. All original procedural art.

import { TILE, makeCanvas, rect, px, hash2 } from "./pixels";

const VIEW_W = 24 * TILE;
const VIEW_H = 20 * TILE;

const C = {
  wallTop: "#384050",
  wallFace: "#e8dcc0",
  wallTrim: "#f8f0d8",
  baseboard: "#b89868",
  labWallFace: "#aab4c2",
  labWallTrim: "#c4ccd8",
  labBaseboard: "#7e8896",
  wood: "#d8b868",
  woodLine: "#b89048",
  woodJoint: "#c8a050",
  labFloorA: "#ccd4da",
  labFloorB: "#c2cad2",
  labFloorLine: "#b0bac2",
  rug: "#98d088",
  rugBorder: "#50a058",
  rugInner: "#e8f8e0",
  schoolRug: "#0f2f66",
  schoolRugBorder: "#ffc857",
  schoolRugInner: "#f8f0d8",
  mat: "#c86850",
  matBorder: "#984838",
  shelf: "#8a5c34",
  shelfDark: "#6a4424",
  shelfTop: "#a87844",
  tvBody: "#303848",
  tvScreen: "#68c8d8",
  counterTop: "#c8d4dc",
  counterFront: "#98a4ac",
  counterDark: "#6a747c",
  plantPot: "#c07848",
  plantPotDark: "#905028",
  leaf: "#48a050",
  leafDark: "#2e7038",
  leafLight: "#78c870",
  machine: "#38507a",
  machineTop: "#4a6890",
  machineDark: "#243652",
  screenGlass: "#486890",
  screenGlow: "#88b8e0",
  benchTop: "#78b868",
  benchEdge: "#4e9050",
  benchLeg: "#3a6a3c",
  windowFrame: "#f0f4f8",
  windowGlass: "#a8c8f0",
  windowSky: "#c8e0f8",
  podium: "#9a6336",
  podiumTop: "#c18a4e",
  podiumDark: "#6b4325",
  bookColors: ["#d05048", "#5070c8", "#58a058", "#d8a040", "#9058b8", "#48a0a8"],
};

// --- surfaces -----------------------------------------------------------------

function paintWood(ctx, ox, oy, tx, ty) {
  rect(ctx, ox, oy, TILE, TILE, C.wood);
  rect(ctx, ox, oy, TILE, 1, C.woodLine);
  rect(ctx, ox, oy + 8, TILE, 1, C.woodLine);
  // staggered plank joints
  const jx = (tx + ty) % 2 === 0 ? 4 : 11;
  rect(ctx, ox + jx, oy + 1, 1, 7, C.woodJoint);
  const jx2 = (tx + ty) % 2 === 0 ? 12 : 6;
  rect(ctx, ox + jx2, oy + 9, 1, 7, C.woodJoint);
  if (hash2(tx, ty) > 0.7) rect(ctx, ox + 2 + ((tx * 5) % 10), oy + 4, 2, 1, C.woodJoint);
}

function paintLabFloor(ctx, ox, oy, tx, ty) {
  rect(ctx, ox, oy, TILE, TILE, (tx + ty) % 2 === 0 ? C.labFloorA : C.labFloorB);
  rect(ctx, ox, oy, TILE, 1, C.labFloorLine);
  rect(ctx, ox, oy, 1, TILE, C.labFloorLine);
}

function paintWallTop(ctx, ox, oy) {
  rect(ctx, ox, oy, TILE, TILE, C.wallTop);
  rect(ctx, ox, oy + TILE - 2, TILE, 1, "#202838");
}

function paintWallFace(ctx, ox, oy, lab) {
  rect(ctx, ox, oy, TILE, TILE, lab ? C.labWallFace : C.wallFace);
  rect(ctx, ox, oy, TILE, 2, lab ? C.labWallTrim : C.wallTrim);
  rect(ctx, ox, oy + TILE - 3, TILE, 3, lab ? C.labBaseboard : C.baseboard);
}

function paintRug(ctx, ox, oy, [rx, ry, rw, rh], theme) {
  const border = theme === "university" ? C.schoolRugBorder : C.rugBorder;
  const inner = theme === "university" ? C.schoolRugInner : C.rugInner;
  const fill = theme === "university" ? C.schoolRug : C.rug;
  const x = ox + rx * TILE;
  const y = oy + ry * TILE;
  rect(ctx, x, y, rw * TILE, rh * TILE, border);
  rect(ctx, x + 2, y + 2, rw * TILE - 4, rh * TILE - 4, inner);
  rect(ctx, x + 3, y + 3, rw * TILE - 6, rh * TILE - 6, fill);
  if (theme === "university") {
    rect(ctx, x + 6, y + 8, rw * TILE - 12, 2, C.schoolRugBorder);
    rect(ctx, x + 8, y + rh * TILE - 10, rw * TILE - 16, 2, C.schoolRugBorder);
    rect(ctx, x + Math.floor((rw * TILE) / 2) - 1, y + 8, 2, rh * TILE - 16, C.schoolRugBorder);
  }
  // sparse pattern dots
  for (let i = 0; i < rw * rh * 2; i++) {
    const dx = 5 + Math.floor(hash2(i, rx) * (rw * TILE - 10));
    const dy = 5 + Math.floor(hash2(ry, i) * (rh * TILE - 10));
    px(ctx, x + dx, y + dy, inner);
  }
}

function paintMat(ctx, ox, oy) {
  rect(ctx, ox + 1, oy + 1, TILE - 2, TILE - 2, C.matBorder);
  rect(ctx, ox + 3, oy + 3, TILE - 6, TILE - 6, C.mat);
}

// --- furniture ------------------------------------------------------------------

function paintBookshelf(ctx, ox, oy) {
  rect(ctx, ox, oy - 4, TILE, TILE + 4, C.shelf);
  rect(ctx, ox, oy - 4, TILE, 2, C.shelfTop);
  rect(ctx, ox, oy + 12, TILE, 4, C.shelfDark);
  for (const sy of [0, 6]) {
    rect(ctx, ox + 1, oy - 1 + sy, TILE - 2, 5, C.shelfDark);
    for (let i = 0; i < 6; i++) {
      const color = C.bookColors[Math.floor(hash2(ox + i, sy) * C.bookColors.length)];
      rect(ctx, ox + 2 + i * 2, oy + sy, 2, 4, color);
    }
  }
}

function paintTv(ctx, ox, oy) {
  rect(ctx, ox + 1, oy, TILE - 2, 13, C.tvBody);
  rect(ctx, ox + 3, oy + 2, TILE - 6, 8, C.tvScreen);
  rect(ctx, ox + 3, oy + 2, TILE - 6, 2, "#a8e8f0");
  rect(ctx, ox + 5, oy + 13, 6, 2, C.machineDark);
}

function paintCounter(ctx, ox, oy) {
  rect(ctx, ox, oy + 1, TILE, 4, C.counterTop);
  rect(ctx, ox, oy + 5, TILE, 9, C.counterFront);
  rect(ctx, ox, oy + 5, TILE, 1, C.counterDark);
  rect(ctx, ox + 3, oy + 8, 4, 3, C.counterDark);
  rect(ctx, ox + 9, oy + 8, 4, 3, C.counterDark);
}

function paintPlant(ctx, ox, oy) {
  rect(ctx, ox + 4, oy + 9, 8, 6, C.plantPot);
  rect(ctx, ox + 4, oy + 13, 8, 2, C.plantPotDark);
  rect(ctx, ox + 3, oy + 4, 10, 5, C.leafDark);
  rect(ctx, ox + 4, oy + 2, 8, 5, C.leaf);
  rect(ctx, ox + 5, oy + 1, 4, 3, C.leafLight);
  px(ctx, ox + 2, oy + 6, C.leaf);
  px(ctx, ox + 13, oy + 6, C.leaf);
}

function paintMachine(ctx, ox, oy) {
  rect(ctx, ox, oy - 3, TILE, TILE + 3, C.machine);
  rect(ctx, ox, oy - 3, TILE, 3, C.machineTop);
  rect(ctx, ox + 2, oy + 2, TILE - 4, 4, C.machineDark);
  px(ctx, ox + 3, oy + 3, "#e05048");
  px(ctx, ox + 6, oy + 3, "#58c068");
  px(ctx, ox + 9, oy + 3, "#e8c850");
  rect(ctx, ox + 2, oy + 9, TILE - 4, 1, C.machineDark);
  rect(ctx, ox + 2, oy + 11, TILE - 4, 1, C.machineDark);
}

function paintScreen(ctx, ox, oy) {
  rect(ctx, ox + 1, oy - 2, TILE - 2, 12, C.machineDark);
  rect(ctx, ox + 2, oy - 1, TILE - 4, 9, C.screenGlass);
  rect(ctx, ox + 3, oy + 1, TILE - 6, 1, C.screenGlow);
  rect(ctx, ox + 3, oy + 4, 6, 1, C.screenGlow);
  rect(ctx, ox + 2, oy + 10, TILE - 4, 4, C.machine);
}

function paintBench(ctx, ox, oy, w, h) {
  const pw = w * TILE;
  const ph = h * TILE;
  rect(ctx, ox + 1, oy + 2, pw - 2, ph - 6, C.benchEdge);
  rect(ctx, ox + 2, oy + 3, pw - 4, ph - 8, C.benchTop);
  rect(ctx, ox + 2, oy + 3, pw - 4, 2, "#98d898");
  rect(ctx, ox + 2, oy + ph - 4, 3, 4, C.benchLeg);
  rect(ctx, ox + pw - 5, oy + ph - 4, 3, 4, C.benchLeg);
}

function paintWindow(ctx, ox, oy) {
  rect(ctx, ox + 1, oy + 1, TILE - 2, 11, C.windowFrame);
  rect(ctx, ox + 3, oy + 3, TILE - 6, 7, C.windowSky);
  rect(ctx, ox + 3, oy + 7, TILE - 6, 3, C.windowGlass);
  rect(ctx, ox + 7, oy + 3, 2, 7, C.windowFrame);
}

function paintSchoolBanner(ctx, ox, oy, w, h, item = {}) {
  const [main = "#0f2f66", accent = "#ffc857"] = item.colors || [];
  rect(ctx, ox + 2, oy - 2, TILE - 4, 2, accent);
  rect(ctx, ox + 3, oy, TILE - 6, 12, main);
  rect(ctx, ox + 4, oy + 2, TILE - 8, 1, accent);
  rect(ctx, ox + 4, oy + 9, TILE - 8, 1, accent);
  rect(ctx, ox + 4, oy + 4, 8, 1, accent);
  rect(ctx, ox + 5, oy + 5, 6, 3, accent);
  rect(ctx, ox + 6, oy + 8, 4, 1, accent);
  if (item.mark === "R") {
    rect(ctx, ox + 6, oy + 5, 3, 1, main);
    rect(ctx, ox + 6, oy + 7, 4, 1, main);
    px(ctx, ox + 10, oy + 8, main);
  } else {
    rect(ctx, ox + 6, oy + 4, 4, 1, main);
    rect(ctx, ox + 6, oy + 6, 4, 1, main);
    rect(ctx, ox + 6, oy + 8, 4, 1, main);
    px(ctx, ox + 10, oy + 5, main);
    px(ctx, ox + 10, oy + 7, main);
  }
  px(ctx, ox + 5, oy + 12, main);
  px(ctx, ox + 10, oy + 12, main);
  rect(ctx, ox + 6, oy + 12, 4, 1, accent);
}

function paintPennants(ctx, ox, oy, w, h, item = {}) {
  const colors = item.colors || ["#0f2f66", "#ffc857"];
  rect(ctx, ox + 1, oy + 1, TILE - 2, 1, "#7a5836");
  for (let i = 0; i < 4; i++) {
    const px0 = ox + 2 + i * 3;
    const color = colors[i % colors.length];
    rect(ctx, px0, oy + 2, 3, 4, color);
    rect(ctx, px0 + 1, oy + 6, 1, 1, color);
  }
}

function paintCalMerch(ctx, ox, oy) {
  // shelf backing
  rect(ctx, ox + 1, oy + 2, TILE - 2, 12, C.shelf);
  rect(ctx, ox + 1, oy + 2, TILE - 2, 2, C.shelfTop);
  // mug body
  rect(ctx, ox + 2, oy + 5, 7, 6, "#003262");
  rect(ctx, ox + 9, oy + 6, 2, 3, "#003262");
  rect(ctx, ox + 2, oy + 11, 7, 1, C.shelfDark);
  // mug "C" mark
  px(ctx, ox + 4, oy + 7, "#fdb515");
  px(ctx, ox + 4, oy + 8, "#fdb515");
  px(ctx, ox + 4, oy + 9, "#fdb515");
  px(ctx, ox + 5, oy + 6, "#fdb515");
  px(ctx, ox + 5, oy + 10, "#fdb515");
  // mini pennant
  rect(ctx, ox + 11, oy + 3, 1, 8, "#7a5836");
  rect(ctx, ox + 12, oy + 4, 3, 2, "#003262");
  rect(ctx, ox + 12, oy + 6, 2, 2, "#003262");
  rect(ctx, ox + 13, oy + 8, 1, 1, "#003262");
  rect(ctx, ox + 12, oy + 4, 3, 1, "#fdb515");
}

function paintPodium(ctx, ox, oy) {
  rect(ctx, ox + 2, oy + 2, TILE - 4, 3, C.podiumTop);
  rect(ctx, ox + 4, oy + 5, TILE - 8, 10, C.podium);
  rect(ctx, ox + 4, oy + 5, TILE - 8, 1, C.podiumDark);
  rect(ctx, ox + 6, oy + 8, 4, 3, "#ffc857");
  rect(ctx, ox + 7, oy + 9, 2, 1, "#0f2f66");
  rect(ctx, ox + 3, oy + 13, TILE - 6, 2, C.podiumDark);
}

// Hand-pixeled athletic marks. Solid gold on the banner field reads exactly
// like the real flags at GBA resolution — far crisper than a downscaled photo.

// Rochester's block "R", dandelion gold. Authored at 12×15, drawn 2×.
const ROCHESTER_R = [
  "GGGGGGGGGG..",
  "GGGGGGGGGGG.",
  "GGG....GGGG.",
  "GGG.....GGG.",
  "GGG.....GGG.",
  "GGG....GGGG.",
  "GGGGGGGGGG..",
  "GGGGGGGGG...",
  "GGG..GGG....",
  "GGG...GGG...",
  "GGG....GGG..",
  "GGG....GGGG.",
  "GGG.....GGG.",
  "GGG.....GGGG",
  "GGG......GGG",
];

// The Cal script, authored as a 19×14 matrix with thick strokes: big swooping
// C, round "a", looped "l", and the C's tail underlining "al" into the flick.
const CAL_SCRIPT = [
  "....GGGGG....GGG...",
  "..GGGGGGGG..GG.GG..",
  ".GGG....GG..GG..GG.",
  ".GG......G..GG..GG.",
  "GG..........GGGGG..",
  "GG...........GGG...",
  "GG...........GG....",
  "GG....GGGG...GG....",
  "GG...GG..GG..GG....",
  ".GG..GG..GG..GG....",
  ".GG..GG..GG..GG....",
  "..GG..GGGGG..GG..G.",
  "...GGGGGGGGGGGGGGG.",
  ".....GGGGGGGGGG....",
];

const markPainter = (rows, color) => (ctx, x, y) =>
  rows.forEach((rowStr, ry) => {
    for (let rx = 0; rx < rowStr.length; rx++)
      if (rowStr[rx] === "G") rect(ctx, x + rx * 2, y + ry * 2, 2, 2, color);
  });

const LOGO_MARKS = {
  rochesterR: { w: 24, h: 30, draw: markPainter(ROCHESTER_R, "#ffd028") },
  calScript: { w: 38, h: 28, draw: markPainter(CAL_SCRIPT, "#fdb515") },
};

// A big college banner draped from the wall cap down over the floor edge,
// carrying one of the athletic marks above (item.logo).
function paintLogoBanner(ctx, ox, oy, w, h, item = {}) {
  const pw = (w || 3) * TILE;
  const [main, accent] = item.colors || ["#0f2f66", "#ffd028"];
  const top = oy - 14;
  const bot = oy + 26;
  rect(ctx, ox + 2, top, pw - 4, 2, accent); // hanging rod
  rect(ctx, ox + 3, top + 2, pw - 6, bot - top - 4, main);
  rect(ctx, ox + 4, top + 3, pw - 8, 1, accent);
  rect(ctx, ox + 4, bot - 4, pw - 8, 1, accent);
  for (let fx = ox + 4; fx < ox + pw - 4; fx += 4) rect(ctx, fx, bot - 2, 2, 2, accent); // fringe
  const mark = LOGO_MARKS[item.logo];
  if (mark) mark.draw(ctx, ox + Math.floor((pw - mark.w) / 2), top + 4 + Math.floor((bot - top - 12 - mark.h) / 2));
}

// --- resume memorabilia ----------------------------------------------------------

function paintSoccerBall(ctx, ox, oy) {
  rect(ctx, ox + 5, oy + 13, 7, 1, "rgba(0,0,0,0.2)");
  for (let dy = -4; dy <= 4; dy++)
    for (let dx = -4; dx <= 4; dx++)
      if (dx * dx + dy * dy <= 17) px(ctx, ox + 8 + dx, oy + 9 + dy, "#f4f6f8");
  rect(ctx, ox + 7, oy + 8, 2, 2, "#22262c"); // pentagon + patches
  px(ctx, ox + 10, oy + 6, "#22262c");
  px(ctx, ox + 11, oy + 10, "#22262c");
  px(ctx, ox + 5, oy + 6, "#22262c");
  px(ctx, ox + 5, oy + 11, "#22262c");
  px(ctx, ox + 8, oy + 5, "#22262c");
  px(ctx, ox + 6, oy + 12, "#c8ced6"); // shading
  px(ctx, ox + 10, oy + 12, "#c8ced6");
}

function paintCleats(ctx, ox, oy) {
  for (const [sx, sy] of [[2, 6], [8, 9]]) {
    rect(ctx, ox + sx + 4, oy + sy - 2, 2, 2, "#22262c"); // ankle
    rect(ctx, ox + sx, oy + sy, 6, 3, "#22262c"); // boot
    rect(ctx, ox + sx + 1, oy + sy + 1, 3, 1, "#ffd028"); // gold stripe
    px(ctx, ox + sx + 5, oy + sy - 1, "#f4f6f8"); // laces
    for (const stud of [0, 2, 4]) px(ctx, ox + sx + stud, oy + sy + 3, "#4a5058");
  }
}

function paintTrophy(ctx, ox, oy) {
  rect(ctx, ox + 1, oy + 11, TILE - 2, 2, C.shelfTop);
  rect(ctx, ox + 2, oy + 13, TILE - 4, 1, C.shelfDark);
  const gold = "#e8c040";
  const dark = "#b89020";
  px(ctx, ox + 3, oy + 3, gold); // handles
  px(ctx, ox + 12, oy + 3, gold);
  px(ctx, ox + 4, oy + 2, gold);
  px(ctx, ox + 11, oy + 2, gold);
  rect(ctx, ox + 5, oy + 2, 6, 4, gold); // cup
  rect(ctx, ox + 6, oy + 6, 4, 1, dark);
  rect(ctx, ox + 7, oy + 7, 2, 2, dark); // stem
  rect(ctx, ox + 5, oy + 9, 6, 2, gold); // base
  px(ctx, ox + 6, oy + 3, "#f8ecc0"); // glint
}

function paintKiteWall(ctx, ox, oy) {
  const sky = "#58b8e0";
  const deep = "#2e8cc0";
  rect(ctx, ox + 7, oy, 2, 1, sky);
  rect(ctx, ox + 5, oy + 1, 6, 2, sky);
  rect(ctx, ox + 4, oy + 3, 8, 2, sky);
  rect(ctx, ox + 5, oy + 5, 6, 1, deep);
  rect(ctx, ox + 6, oy + 6, 4, 1, deep);
  rect(ctx, ox + 7, oy + 7, 2, 1, deep);
  rect(ctx, ox + 7, oy + 1, 1, 7, "#f0f4f8"); // spar
  rect(ctx, ox + 4, oy + 3, 8, 1, "#f0f4f8"); // cross spar
  px(ctx, ox + 8, oy + 8, "#d8dce2"); // tail with bows
  px(ctx, ox + 7, oy + 9, "#e85048");
  px(ctx, ox + 8, oy + 10, "#d8dce2");
  px(ctx, ox + 9, oy + 11, "#ffd028");
  px(ctx, ox + 8, oy + 12, "#d8dce2");
}

function paintOwl(ctx, ox, oy) {
  rect(ctx, ox + 3, oy + 11, 10, 1, C.shelf); // perch
  rect(ctx, ox + 7, oy + 12, 2, 3, C.shelfDark);
  const body = "#8a6238";
  const dark = "#5e4022";
  px(ctx, ox + 5, oy + 2, body); // ear tufts
  px(ctx, ox + 10, oy + 2, body);
  rect(ctx, ox + 5, oy + 3, 6, 8, body);
  rect(ctx, ox + 4, oy + 4, 1, 5, dark); // wings
  rect(ctx, ox + 11, oy + 4, 1, 5, dark);
  rect(ctx, ox + 6, oy + 8, 4, 3, "#c79a62"); // belly
  rect(ctx, ox + 6, oy + 4, 2, 2, "#f8f0d8"); // eyes
  rect(ctx, ox + 9, oy + 4, 2, 2, "#f8f0d8");
  px(ctx, ox + 7, oy + 5, "#22262c");
  px(ctx, ox + 9, oy + 5, "#22262c");
  px(ctx, ox + 8, oy + 6, "#e8a030"); // beak
  px(ctx, ox + 6, oy + 11, "#e8a030"); // talons
  px(ctx, ox + 9, oy + 11, "#e8a030");
}

// A brain in a jar on its own side table.
function paintBrainJar(ctx, ox, oy) {
  rect(ctx, ox + 3, oy + 8, 10, 5, C.shelf); // side table
  rect(ctx, ox + 3, oy + 12, 10, 1, C.shelfDark);
  rect(ctx, ox + 4, oy + 13, 2, 2, C.shelfDark);
  rect(ctx, ox + 10, oy + 13, 2, 2, C.shelfDark);
  rect(ctx, ox + 5, oy, 6, 1, "#6a747c"); // lid
  rect(ctx, ox + 5, oy + 1, 6, 7, "#bcd8e8"); // glass
  rect(ctx, ox + 6, oy + 2, 4, 4, "#e8a0b0"); // brain
  px(ctx, ox + 7, oy + 3, "#c87890");
  px(ctx, ox + 8, oy + 5, "#f8c8d4");
  px(ctx, ox + 6, oy + 2, "#f0f8ff"); // glint
}

// A sticker-bombed laptop on a small desk.
function paintHackerLaptop(ctx, ox, oy) {
  rect(ctx, ox + 2, oy + 7, 12, 5, C.shelf); // desk
  rect(ctx, ox + 2, oy + 11, 12, 1, C.shelfDark);
  rect(ctx, ox + 3, oy + 12, 2, 3, C.shelfDark);
  rect(ctx, ox + 11, oy + 12, 2, 3, C.shelfDark);
  rect(ctx, ox + 4, oy + 1, 8, 6, "#2a2e34"); // lid
  rect(ctx, ox + 5, oy + 2, 6, 4, "#101418"); // screen
  px(ctx, ox + 6, oy + 3, "#48e068"); // green terminal glyphs
  rect(ctx, ox + 7, oy + 4, 3, 1, "#48e068");
  px(ctx, ox + 11, oy + 1, "#e84848"); // stickers
  px(ctx, ox + 4, oy + 6, "#e8c850");
  rect(ctx, ox + 4, oy + 7, 8, 1, "#586068"); // keyboard
}

// A miniature Supercharger post.
function paintCharger(ctx, ox, oy) {
  rect(ctx, ox + 5, oy + 1, 6, 12, "#e8eaec"); // post
  rect(ctx, ox + 5, oy + 1, 6, 3, "#c8403a"); // red cap
  rect(ctx, ox + 6, oy + 5, 4, 4, "#22262c"); // screen
  px(ctx, ox + 7, oy + 6, "#48e068");
  rect(ctx, ox + 11, oy + 6, 1, 6, "#22262c"); // cable
  px(ctx, ox + 12, oy + 11, "#22262c");
  rect(ctx, ox + 4, oy + 13, 8, 2, "#9aa2aa"); // base
}

// A LiDAR puck on a tripod.
function paintLidarRig(ctx, ox, oy) {
  rect(ctx, ox + 5, oy + 1, 6, 1, "#586068");
  rect(ctx, ox + 4, oy + 2, 8, 4, "#2a3036"); // sensor puck
  rect(ctx, ox + 4, oy + 3, 8, 1, "#48c8e8"); // laser ring
  px(ctx, ox + 11, oy + 4, "#e84848");
  rect(ctx, ox + 7, oy + 6, 2, 6, "#3a4048"); // tripod
  rect(ctx, ox + 4, oy + 12, 2, 3, "#3a4048");
  rect(ctx, ox + 10, oy + 12, 2, 3, "#3a4048");
  rect(ctx, ox + 7, oy + 12, 2, 3, "#2a3036");
}

// A spare solar cell array on a tilted stand.
function paintSolarPanel(ctx, ox, oy) {
  rect(ctx, ox + 2, oy + 2, 12, 7, "#16203a"); // panel
  for (const gx of [5, 8, 11]) rect(ctx, ox + gx, oy + 2, 1, 7, "#2c3c5e");
  rect(ctx, ox + 2, oy + 5, 12, 1, "#2c3c5e");
  px(ctx, ox + 3, oy + 3, "#8ab8e8"); // glint
  rect(ctx, ox + 4, oy + 9, 2, 5, "#6a747c"); // legs
  rect(ctx, ox + 11, oy + 9, 2, 5, "#6a747c");
  rect(ctx, ox + 3, oy + 14, 11, 1, "#586068");
}

function paintScrabbleTable(ctx, ox, oy) {
  rect(ctx, ox + 1, oy + 3, 14, 10, C.shelf);
  rect(ctx, ox + 1, oy + 12, 14, 2, C.shelfDark);
  rect(ctx, ox + 2, oy + 14, 2, 2, C.shelfDark); // legs
  rect(ctx, ox + 12, oy + 14, 2, 2, C.shelfDark);
  rect(ctx, ox + 3, oy + 4, 10, 8, "#e8d8b0"); // board
  for (const gy of [6, 8, 10]) rect(ctx, ox + 3, oy + gy, 10, 1, "#cdbd96");
  for (const gx of [5, 7, 9, 11]) rect(ctx, ox + gx, oy + 4, 1, 8, "#cdbd96");
  px(ctx, ox + 4, oy + 5, "#d05048"); // premium squares
  px(ctx, ox + 12, oy + 11, "#d05048");
  px(ctx, ox + 12, oy + 5, "#5070c8");
  px(ctx, ox + 4, oy + 11, "#5070c8");
  rect(ctx, ox + 6, oy + 7, 2, 2, "#f8f0d8"); // played tiles
  rect(ctx, ox + 8, oy + 7, 2, 2, "#f8f0d8");
  rect(ctx, ox + 10, oy + 7, 2, 2, "#f8f0d8");
  rect(ctx, ox + 8, oy + 9, 2, 2, "#f8f0d8");
}

function paintTuiPerch(ctx, ox, oy) {
  rect(ctx, ox + 7, oy + 3, 2, 11, C.shelf); // stand
  rect(ctx, ox + 4, oy + 14, 8, 2, C.shelfDark); // base
  rect(ctx, ox + 3, oy + 2, 10, 1, C.shelfTop); // crossbar
  const tui = "#1e3a34";
  rect(ctx, ox + 8, oy - 3, 5, 5, tui); // body
  rect(ctx, ox + 11, oy - 5, 3, 3, tui); // head
  px(ctx, ox + 14, oy - 4, "#22262c"); // beak
  px(ctx, ox + 12, oy - 5, "#f4f6f8"); // eye glint
  px(ctx, ox + 10, oy - 2, "#f4f6f8"); // the white throat tuft
  rect(ctx, ox + 6, oy, 3, 2, "#2e5a4e"); // tail
  px(ctx, ox + 9, oy + 2, "#e8a030"); // feet
  px(ctx, ox + 11, oy + 2, "#e8a030");
  rect(ctx, ox + 3, oy, 2, 2, "#6a747c"); // field microphone
  px(ctx, ox + 4, oy, "#e84848");
}

function paintToolbox(ctx, ox, oy) {
  rect(ctx, ox + 6, oy + 5, 4, 2, "#8e2420"); // handle
  rect(ctx, ox + 3, oy + 7, 10, 6, "#c8403a");
  rect(ctx, ox + 3, oy + 7, 10, 1, "#e86852");
  rect(ctx, ox + 7, oy + 9, 2, 2, "#f0c040"); // latch
  rect(ctx, ox + 3, oy + 12, 10, 1, "#7e1c18");
}

// Freestanding cork notice board on a post — the in-room "open the full
// resume panel" interactable, parked next to each exit.
function paintBoard(ctx, ox, oy) {
  rect(ctx, ox + 7, oy + 9, 2, 6, C.shelf);
  rect(ctx, ox + 1, oy, 14, 10, C.shelfDark);
  rect(ctx, ox + 2, oy + 1, 12, 8, "#caa05c");
  rect(ctx, ox + 3, oy + 2, 4, 5, "#f4f4ec");
  rect(ctx, ox + 9, oy + 3, 4, 4, "#f4f4ec");
  px(ctx, ox + 4, oy + 2, "#d05048"); // pins
  px(ctx, ox + 10, oy + 3, "#5070c8");
  rect(ctx, ox + 4, oy + 4, 2, 1, "#8a8a82"); // scribbles
  rect(ctx, ox + 10, oy + 5, 2, 1, "#8a8a82");
}

// The ROAR autonomous racecar: white open-wheeler with a cyan livery, yellow
// nose and rear wing, and the LiDAR/camera mast over the cockpit. 4×2 tiles.
function paintRaceCar(ctx, ox, oy) {
  const R = {
    white: "#f2f4f6", shade: "#c8d2dc", cyan: "#48c8e8", cyanDark: "#2898c0",
    yellow: "#f8d020", outline: "#22303a", wheel: "#181c22", hub: "#9aa4ae",
  };
  rect(ctx, ox + 3, oy + 28, 58, 2, "rgba(0,0,0,0.18)"); // shadow
  // wheels first — open-wheelers wear them outside the bodywork
  rect(ctx, ox + 8, oy + 17, 11, 11, R.outline);
  rect(ctx, ox + 10, oy + 19, 7, 7, R.wheel);
  rect(ctx, ox + 12, oy + 21, 3, 3, R.hub);
  rect(ctx, ox + 46, oy + 16, 12, 12, R.outline);
  rect(ctx, ox + 48, oy + 18, 8, 8, R.wheel);
  rect(ctx, ox + 50, oy + 20, 4, 4, R.hub);
  // sensor mast + camera head over the cockpit
  rect(ctx, ox + 30, oy + 4, 3, 10, R.outline);
  rect(ctx, ox + 27, oy + 1, 9, 5, R.outline);
  rect(ctx, ox + 28, oy + 2, 7, 3, "#3a4754");
  px(ctx, ox + 29, oy + 3, "#e84840");
  // rear wing
  rect(ctx, ox + 50, oy + 7, 12, 3, R.yellow);
  rect(ctx, ox + 60, oy + 5, 2, 7, R.yellow);
  rect(ctx, ox + 54, oy + 10, 2, 5, R.outline);
  // nose cone + front wing
  rect(ctx, ox + 1, oy + 18, 18, 4, R.outline);
  rect(ctx, ox + 2, oy + 19, 17, 2, R.yellow);
  rect(ctx, ox + 0, oy + 22, 14, 3, R.outline);
  rect(ctx, ox + 1, oy + 23, 12, 1, R.cyan);
  // main tub between the wheels, cyan sidepod, engine cover to the rear
  rect(ctx, ox + 17, oy + 13, 31, 12, R.outline);
  rect(ctx, ox + 18, oy + 14, 29, 5, R.white);
  rect(ctx, ox + 18, oy + 19, 29, 5, R.cyan);
  rect(ctx, ox + 18, oy + 23, 29, 1, R.cyanDark);
  rect(ctx, ox + 44, oy + 14, 3, 5, R.shade);
  // cockpit opening + tiny windscreen
  rect(ctx, ox + 26, oy + 12, 11, 4, R.outline);
  rect(ctx, ox + 27, oy + 13, 9, 3, "#2c3a46");
  rect(ctx, ox + 24, oy + 12, 2, 3, R.shade);
  // race number roundel
  rect(ctx, ox + 38, oy + 18, 6, 6, R.white);
  rect(ctx, ox + 38, oy + 18, 6, 1, R.outline);
  rect(ctx, ox + 38, oy + 23, 6, 1, R.outline);
  rect(ctx, ox + 40, oy + 19, 2, 1, R.outline); // a squint-sized 7
  px(ctx, ox + 41, oy + 20, R.outline);
  px(ctx, ox + 40, oy + 21, R.outline);
  px(ctx, ox + 40, oy + 22, R.outline);
}

// CalSol's Gen XI: navy catamaran hull, black solar deck, white bubble
// canopy, gold swoosh and a number 6 on the tail. 4×2 tiles.
function paintSolarCar(ctx, ox, oy) {
  const S = {
    navy: "#1c2c5e", navyDark: "#101c40", panel: "#20262e", panelLine: "#39434f",
    white: "#f2f4f6", gold: "#d8a830", glass: "#28323e", outline: "#0c1428",
  };
  rect(ctx, ox + 3, oy + 26, 58, 2, "rgba(0,0,0,0.18)"); // shadow
  // bubble canopy
  rect(ctx, ox + 25, oy + 4, 12, 9, S.outline);
  rect(ctx, ox + 26, oy + 5, 10, 8, S.white);
  rect(ctx, ox + 26, oy + 7, 5, 6, S.glass);
  px(ctx, ox + 28, oy + 5, "#ffffff");
  // solar deck with cell seams
  rect(ctx, ox + 2, oy + 12, 60, 5, S.outline);
  rect(ctx, ox + 3, oy + 13, 58, 3, S.panel);
  for (let i = 0; i < 9; i++) rect(ctx, ox + 8 + i * 6, oy + 13, 1, 3, S.panelLine);
  rect(ctx, ox + 3, oy + 13, 58, 1, S.panelLine);
  // hull
  rect(ctx, ox + 4, oy + 17, 56, 7, S.navy);
  rect(ctx, ox + 4, oy + 22, 56, 2, S.navyDark);
  rect(ctx, ox + 4, oy + 17, 3, 7, S.outline);
  rect(ctx, ox + 57, oy + 17, 3, 7, S.outline);
  // white tail with gold swoosh and number 6
  rect(ctx, ox + 44, oy + 17, 13, 5, S.white);
  rect(ctx, ox + 43, oy + 18, 5, 3, S.gold);
  rect(ctx, ox + 51, oy + 17, 3, 1, S.outline);
  rect(ctx, ox + 51, oy + 18, 1, 3, S.outline);
  rect(ctx, ox + 51, oy + 21, 3, 1, S.outline);
  px(ctx, ox + 53, oy + 20, S.outline);
  // faired wheels peeking under the hull
  for (const wx of [12, 46]) {
    rect(ctx, ox + wx, oy + 22, 7, 4, S.outline);
    rect(ctx, ox + wx + 2, oy + 23, 3, 3, "#181c22");
  }
}

// A stone archway set into the back wall, framing a glowing portal field. The
// static glow reads as a portal on its own; Village.jsx overlays an animated
// swirl (drawPortalFx) on top each frame. `item.colors` ([main, accent]) tints
// the crest so each gateway flies its school's colors.
function paintPortalArch(ctx, ox, oy, w, h, item = {}) {
  const W = (w || 2) * TILE; // 32
  const stone = "#9a93a8";
  const stoneLt = "#bdb6c8";
  const stoneDk = "#6e6880";
  const stoneEdge = "#4a4560";
  const top = oy - 12; // crown, up in the wall cap
  const base = oy + 30; // threshold, down on the floor

  // stone block + rounded crown
  rect(ctx, ox, top + 6, W, base - (top + 6), stoneEdge);
  rect(ctx, ox + 1, top + 7, W - 2, base - (top + 7), stone);
  [13, 9, 6, 4, 3, 2, 1, 0].forEach((inset, i) =>
    rect(ctx, ox + inset, top + i, W - inset * 2, 1, i < 2 ? stoneEdge : stone));
  rect(ctx, ox + 1, top + 8, 1, base - top - 8, stoneLt);
  rect(ctx, ox + W - 3, top + 8, 2, base - top - 8, stoneDk);

  // inner void
  const ix = ox + 6;
  const iw = W - 12;
  const itop = top + 8;
  const ibase = base - 3;
  rect(ctx, ix, itop, iw, ibase - itop, "#241b3e");
  [7, 4, 2, 1, 0].forEach((inset, i) =>
    rect(ctx, ix + inset, itop - 3 + i, iw - inset * 2, 1, "#241b3e"));

  // glowing portal field — concentric bands, brightest at the eye
  const cx = ix + iw / 2;
  const cy = (itop + ibase) / 2;
  for (let dy = -10; dy <= 12; dy++)
    for (let dx = -7; dx <= 7; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy * 1.6);
      const col = d < 3 ? "#dfeaff" : d < 5 ? "#8fb6ff" : d < 7 ? "#6a78e0" : d < 9 ? "#7a4bc4" : null;
      if (col) px(ctx, Math.round(cx + dx), Math.round(cy + dy), col);
    }

  // school-colored keystone crest at the apex
  const [school, accent] = item.colors || ["#6a78e0", "#d8a838"];
  rect(ctx, cx - 4, top - 2, 8, 6, "#3a3550");
  rect(ctx, cx - 3, top - 1, 6, 4, school);
  rect(ctx, cx - 3, top - 1, 6, 1, accent);
  rect(ctx, cx - 1, top + 1, 2, 2, accent);
}

const FURNITURE_PAINTERS = {
  portalArch: paintPortalArch,
  bookshelf: paintBookshelf,
  tv: paintTv,
  counter: paintCounter,
  plant: paintPlant,
  machine: paintMachine,
  screen: paintScreen,
  window: paintWindow,
  bench: paintBench,
  schoolBanner: paintSchoolBanner,
  pennants: paintPennants,
  podium: paintPodium,
  calMerch: paintCalMerch,
  board: paintBoard,
  racecar: paintRaceCar,
  solarcar: paintSolarCar,
  logoBanner: paintLogoBanner,
  soccerBall: paintSoccerBall,
  cleats: paintCleats,
  trophy: paintTrophy,
  kiteWall: paintKiteWall,
  owl: paintOwl,
  brainJar: paintBrainJar,
  hackerLaptop: paintHackerLaptop,
  charger: paintCharger,
  lidarRig: paintLidarRig,
  solarPanel: paintSolarPanel,
  scrabbleTable: paintScrabbleTable,
  tuiPerch: paintTuiPerch,
  toolbox: paintToolbox,
};

// --- room assembly ----------------------------------------------------------------

export function buildInteriorArt(room) {
  const [bg, ctx] = makeCanvas(VIEW_W, VIEW_H);
  rect(ctx, 0, 0, VIEW_W, VIEW_H, "#000000");

  const ox = Math.floor((VIEW_W - room.w * TILE) / 2);
  const oy = Math.floor((VIEW_H - room.h * TILE) / 2);
  const lab = room.floor === "lab";

  for (let ty = 0; ty < room.h; ty++) {
    for (let tx = 0; tx < room.w; tx++) {
      const x = ox + tx * TILE;
      const y = oy + ty * TILE;
      if (ty === 0) paintWallTop(ctx, x, y);
      else if (ty === 1) paintWallFace(ctx, x, y, lab);
      else if (lab) paintLabFloor(ctx, x, y, tx, ty);
      else paintWood(ctx, x, y, tx, ty);
    }
  }

  if (room.rug) paintRug(ctx, ox, oy, room.rug, room.theme);
  room.mats.forEach(([mx, my]) => paintMat(ctx, ox + mx * TILE, oy + my * TILE));
  room.furniture.forEach((f) => {
    FURNITURE_PAINTERS[f.kind](ctx, ox + f.x * TILE, oy + f.y * TILE, f.w, f.h, f);
  });

  return { bg, ox, oy };
}
