// Renders the whole village to offscreen canvases. Everything here is
// original procedural pixel art in a GBA-pastel style — no ripped assets.

import { TILE, makeCanvas, rect, px } from "./pixels";
import { paintGrass, paintDirt, paintBorderTree, treeCanopy } from "./terrain";
import {
  MAP_W, MAP_H, TREES, POND, BUILDINGS, FENCES, SIGNS,
  MAILBOXES, POTS, FLOWERS, CARS, BALLS, FERNS, POHUTUKAWA, isPath,
} from "./map";

const C = {
  grass: "#8cc878",
  grassDark: "#7cb868",
  grassLight: "#9ad486",
  path: "#b4e0a0",
  pathLight: "#c4eab0",
  pathDark: "#9cce88",
  treeOutline: "#1e4a28",
  treeMid: "#48a050",
  treeLight: "#78c870",
  treeDark: "#2e7038",
  trunk: "#7a4c2c",
  trunkDark: "#5a3820",
  water: "#58a0e8",
  waterLight: "#90c8f4",
  waterDark: "#3070b8",
  rim: "#7a5038",
  white: "#f0f2f4",
  whiteShade: "#c0c8d0",
  greyOutline: "#6a737e",
  wood: "#c89058",
  woodLight: "#e0b078",
  woodDark: "#6a4a26",
  woodText: "#7a5028",
  flagRed: "#d84840",
  pot: "#c07848",
  potRim: "#d89058",
  potShade: "#905028",
  flower: "#e85048",
  flowerCenter: "#f8d848",
  stem: "#3a7a3c",
  roof: "#e87858",
  roofLight: "#f8a888",
  roofDark: "#c05038",
  roofOutline: "#76301c",
  wall: "#c8d8e0",
  wallShade: "#a8bcc8",
  wallOutline: "#48565e",
  glass: "#6890d0",
  glassLight: "#a8c8f0",
  frame: "#f0f4f8",
  doorWood: "#8a5430",
  doorDark: "#5c3416",
  knob: "#f0d060",
  labRoof: "#5a6878",
  labRoofLight: "#7a8898",
  labRoofOutline: "#3a4450",
  labStrip: "#2e3844",
  labWall: "#e0cc90",
  labTrim: "#c8b070",
  labWallOutline: "#5a5040",
  labDoor: "#3a5070",
  labDoorDark: "#2c3a50",
  vent: "#c04038",
  ventShade: "#902c28",
};

// --- props ------------------------------------------------------------------

function paintFence(ctx, ox, oy) {
  // rails
  rect(ctx, ox, oy + 6, TILE, 2, C.white);
  rect(ctx, ox, oy + 8, TILE, 1, C.whiteShade);
  rect(ctx, ox, oy + 10, TILE, 2, C.white);
  rect(ctx, ox, oy + 12, TILE, 1, C.whiteShade);
  // pickets with pointed tops
  for (const pxx of [2, 10]) {
    rect(ctx, ox + pxx + 1, oy + 2, 2, 1, C.white);
    rect(ctx, ox + pxx, oy + 3, 4, 10, C.white);
    rect(ctx, ox + pxx + 3, oy + 3, 1, 10, C.whiteShade);
    rect(ctx, ox + pxx, oy + 3, 1, 10, C.greyOutline);
    rect(ctx, ox + pxx, oy + 13, 4, 1, C.greyOutline);
  }
}

function paintSign(ctx, ox, oy) {
  rect(ctx, ox + 7, oy + 10, 2, 5, C.trunk);
  rect(ctx, ox + 2, oy + 2, 12, 9, C.woodDark);
  rect(ctx, ox + 3, oy + 3, 10, 7, C.wood);
  rect(ctx, ox + 3, oy + 3, 10, 1, C.woodLight);
  rect(ctx, ox + 4, oy + 5, 4, 1, C.woodText);
  rect(ctx, ox + 9, oy + 5, 3, 1, C.woodText);
  rect(ctx, ox + 4, oy + 7, 6, 1, C.woodText);
}

function paintMailbox(ctx, ox, oy) {
  rect(ctx, ox + 7, oy + 8, 2, 7, C.trunk);
  rect(ctx, ox + 3, oy + 2, 10, 7, C.greyOutline);
  rect(ctx, ox + 4, oy + 3, 8, 5, C.white);
  rect(ctx, ox + 4, oy + 7, 8, 1, C.whiteShade);
  rect(ctx, ox + 6, oy + 4, 4, 1, C.greyOutline); // slot
  rect(ctx, ox + 13, oy + 3, 1, 3, C.flagRed); // flag
}

function paintPot(ctx, ox, oy) {
  // flowers + stems
  for (const [fx, fy] of [[5, 5], [8, 4], [11, 6]]) {
    rect(ctx, ox + fx, oy + fy + 2, 1, 2, C.stem);
    px(ctx, ox + fx - 1, oy + fy, C.flower);
    px(ctx, ox + fx + 1, oy + fy, C.flower);
    px(ctx, ox + fx, oy + fy - 1, C.flower);
    px(ctx, ox + fx, oy + fy + 1, C.flower);
    px(ctx, ox + fx, oy + fy, C.flowerCenter);
  }
  rect(ctx, ox + 3, oy + 8, 10, 2, C.potRim);
  rect(ctx, ox + 4, oy + 10, 8, 5, C.pot);
  rect(ctx, ox + 10, oy + 10, 2, 5, C.potShade);
  rect(ctx, ox + 4, oy + 14, 8, 1, C.potShade);
}

// LOGAN's Tesla Model Y — sleek Juniper stance: one sweeping roofline, low
// dark-graphite body, flush glass, light bars, bright aero wheels. 3 tiles.
function paintModelY(ctx, ox, oy) {
  const T = {
    body: "#26292e", hi: "#454b54", glint: "#707a86", dark: "#15171a",
    glass: "#101418", glassHi: "#8a98a8", trim: "#0c0e10",
    tire: "#0e1013", rim: "#c8ced4",
  };
  const t = oy - 7;
  const row = (y, a, b, color) => rect(ctx, ox + a, t + y, b - a + 1, 1, color);

  rect(ctx, ox + 4, t + 22, 40, 1, "rgba(0,0,0,0.28)"); // ground shadow

  // one continuous arc from hood to tail
  const dome = [[19, 30], [16, 34], [13, 37], [12, 39], [11, 40]];
  dome.forEach(([a, b], i) => row(i, a, b, T.body));
  row(0, 20, 28, T.glint); // panoramic roof glint
  row(1, 17, 33, T.glass);
  row(2, 14, 36, T.glass);
  row(3, 13, 38, T.glass);
  row(4, 12, 39, T.glass);
  rect(ctx, ox + 16, t + 2, 8, 1, T.glassHi); // glass streak
  rect(ctx, ox + 25, t + 1, 1, 4, T.body); // flush B-pillar
  rect(ctx, ox + 35, t + 2, 2, 3, T.body); // C-pillar slope
  rect(ctx, ox + 9, t + 4, 3, 2, T.body); // mirror
  px(ctx, ox + 9, t + 4, T.dark);

  // low body
  const body = [
    [5, 7, 44, T.hi], [6, 4, 46, T.body], [7, 2, 47, T.body], [8, 1, 47, T.body],
    [9, 1, 47, T.body], [10, 1, 47, T.body], [11, 1, 47, T.body],
    [12, 2, 46, T.dark], [13, 4, 45, T.trim],
  ];
  body.forEach(([y, a, b, color]) => row(y, a, b, color));

  rect(ctx, ox + 1, t + 7, 5, 1, "#dce8f0"); // front light bar
  px(ctx, ox + 1, t + 8, "#9ab8cc");
  rect(ctx, ox + 44, t + 7, 4, 1, "#c83c30"); // rear light bar
  rect(ctx, ox + 21, t + 6, 1, 6, T.dark); // door seams
  rect(ctx, ox + 33, t + 6, 1, 6, T.dark);
  px(ctx, ox + 5, t + 8, "#aab2ba"); // T badge

  // flush arches + bright aero wheels
  for (const cx of [12, 36]) {
    for (let dy = -6; dy <= 0; dy++)
      for (let dx = -6; dx <= 6; dx++)
        if (dx * dx + dy * dy <= 38) px(ctx, ox + cx + dx, t + 16 + dy, T.trim);
    for (let dy = -5; dy <= 5; dy++)
      for (let dx = -5; dx <= 5; dx++)
        if (dx * dx + dy * dy <= 26) px(ctx, ox + cx + dx, t + 16 + dy, T.tire);
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++)
        if (dx * dx + dy * dy <= 9) px(ctx, ox + cx + dx, t + 16 + dy, T.rim);
    px(ctx, ox + cx, t + 16, T.dark); // hub
    px(ctx, ox + cx - 2, t + 16, "#9aa2aa"); // aero spokes
    px(ctx, ox + cx + 2, t + 16, "#9aa2aa");
    px(ctx, ox + cx, t + 14, "#9aa2aa");
    px(ctx, ox + cx, t + 18, "#9aa2aa");
  }
}

// A well-loved soccer ball on the village green.
function paintBall(ctx, ox, oy) {
  rect(ctx, ox + 4, oy + 13, 8, 1, "rgba(0,0,0,0.18)");
  for (let dy = -4; dy <= 4; dy++)
    for (let dx = -4; dx <= 4; dx++)
      if (dx * dx + dy * dy <= 17) px(ctx, ox + 8 + dx, oy + 9 + dy, "#f4f6f8");
  rect(ctx, ox + 7, oy + 8, 2, 2, "#22262c");
  px(ctx, ox + 10, oy + 6, "#22262c");
  px(ctx, ox + 11, oy + 10, "#22262c");
  px(ctx, ox + 5, oy + 6, "#22262c");
  px(ctx, ox + 5, oy + 11, "#22262c");
  px(ctx, ox + 8, oy + 5, "#22262c");
  px(ctx, ox + 6, oy + 12, "#c8ced6");
  px(ctx, ox + 10, oy + 12, "#c8ced6");
}

// Transparent 16×16 overlay, two animation frames (petals sway). Each tile
// mixes pōhutukawa red with kōwhai gold — the garden grows NZ natives.
function makeFlowerFrame(frame) {
  const [c, ctx] = makeCanvas(TILE, TILE);
  for (const [fx, fy, petal] of [[4, 4, C.flower], [10, 9, "#f0c020"]]) {
    px(ctx, fx, fy + 2, C.stem);
    px(ctx, fx - 1, fy + 3, C.stem);
    if (frame === 0) {
      px(ctx, fx - 1, fy, petal);
      px(ctx, fx + 1, fy, petal);
      px(ctx, fx, fy - 1, petal);
      px(ctx, fx, fy + 1, petal);
    } else {
      px(ctx, fx - 1, fy - 1, petal);
      px(ctx, fx + 1, fy - 1, petal);
      px(ctx, fx - 1, fy + 1, petal);
      px(ctx, fx + 1, fy + 1, petal);
    }
    px(ctx, fx, fy, petal === C.flower ? C.flowerCenter : "#a85818");
  }
  return c;
}

// A silver fern frond: a central rachis with feathery pinnae fanning up each
// side, pale silver-green like the underside of the real thing.
function paintFern(ctx, ox, oy) {
  const lt = "#8ccb5c";
  const md = "#5da83c";
  const dk = "#3a7a2e";
  const stem = "#4c8034";
  const cx = ox + 8;
  for (let i = 0; i < 15; i++) {
    const sy = oy + 15 - i;
    px(ctx, cx, sy, stem); // rachis
    const len = Math.max(1, Math.round((15 - i) / 3)); // pinnae longest at the base
    for (let l = 1; l <= len; l++) {
      const ly = sy - Math.floor(l / 2); // angled up and out
      const c = l === len ? dk : l % 2 ? lt : md;
      px(ctx, cx - l, ly, c);
      px(ctx, cx + l, ly, c);
    }
  }
  px(ctx, cx, oy + 1, lt); // tip
}

// A pōhutukawa in bloom: a bushy canopy studded with crimson flowers over a
// gnarled forked trunk — NZ's Christmas tree, flowering all year here.
function paintPohutukawa(ctx, ox, oy) {
  const cx = ox + 8;
  rect(ctx, ox + 6, oy + 11, 4, 4, "#503824"); // forked trunk
  rect(ctx, ox + 5, oy + 9, 2, 3, "#503824");
  rect(ctx, ox + 9, oy + 9, 1, 4, "#3a2818");
  treeCanopy(ctx, cx, oy + 2, [
    [0, 0, 6], [-5, 2, 5], [5, 2, 5], [-2, 5, 5], [3, 5, 5],
  ], {});
  for (const [bx, by] of [[-4, -2], [3, -3], [6, 1], [-2, 3], [4, 4], [-6, 2], [1, -1]]) {
    rect(ctx, cx + bx, oy + 2 + by, 2, 2, "#d83838"); // crimson blooms
    px(ctx, cx + bx, oy + 2 + by, "#f86858");
  }
}

// --- buildings --------------------------------------------------------------

// EDUCATION — a Greek-revival frat house: pediment with ΛΚΜ letters, white
// columns, school flags in the upper windows, bunting, a sagging porch couch,
// and one stray red cup. Same footprint and door tile; purely cosmetic.
function paintFratHouse(ctx, b) {
  const ox = b.x * TILE;
  const oy = b.y * TILE;
  const F = {
    trim: "#f0ede4", trimShade: "#c8c2b2", outline: "#5a554a",
    brick: "#a8503a", mortar: "#8e4030", brickOutline: "#543022",
    navy: "#2e3a5c", uofr: "#0f2f66", dandelion: "#ffc857",
    cal: "#003262", calGold: "#fdb515",
    couch: "#b07848", couchLight: "#c89058", couchDark: "#8a5a34", couchSeam: "#4a382c",
  };

  // brick body
  rect(ctx, ox + 2, oy + 24, 92, 56, F.brickOutline);
  rect(ctx, ox + 4, oy + 26, 88, 52, F.brick);
  for (let my = 31; my < 78; my += 6) rect(ctx, ox + 4, oy + my, 88, 1, F.mortar);

  // pediment (front gable) with a round attic window
  for (let ry = 0; ry < 16; ry++) {
    const half = Math.min(48, 5 + Math.round(ry * 2.9));
    rect(ctx, ox + 48 - half, oy + ry, half * 2, 1, ry < 2 ? F.outline : F.trim);
    px(ctx, ox + 48 - half, oy + ry, F.outline);
    px(ctx, ox + 47 + half, oy + ry, F.outline);
  }
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++)
      if (dx * dx + dy * dy <= 9) px(ctx, ox + 48 + dx, oy + 8 + dy, F.navy);
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) px(ctx, ox + 48 + dx, oy + 8 + dy, "#a8c8f0");

  // entablature with the house letters: Λ K M
  rect(ctx, ox, oy + 16, 96, 1, F.outline);
  rect(ctx, ox, oy + 17, 96, 6, F.trim);
  rect(ctx, ox, oy + 23, 96, 1, F.outline);
  rect(ctx, ox + 40, oy + 17, 2, 1, F.navy); // Λ
  for (const [lx, ly] of [[39, 18], [40, 18], [41, 18], [42, 18], [39, 19], [42, 19], [38, 20], [39, 20], [42, 20], [43, 20], [38, 21], [43, 21]])
    px(ctx, ox + lx, oy + ly, F.navy);
  rect(ctx, ox + 46, oy + 17, 1, 5, F.navy); // K
  for (const [lx, ly] of [[49, 17], [48, 18], [47, 19], [48, 20], [49, 21]]) px(ctx, ox + lx, oy + ly, F.navy);
  rect(ctx, ox + 52, oy + 17, 1, 5, F.navy); // M
  rect(ctx, ox + 57, oy + 17, 1, 5, F.navy);
  for (const [lx, ly] of [[53, 18], [56, 18], [54, 19], [55, 19]]) px(ctx, ox + lx, oy + ly, F.navy);

  // bunting strung across the porch, both schools' colors
  rect(ctx, ox + 8, oy + 27, 80, 1, "#ece8dc");
  const bunting = [F.uofr, F.dandelion, F.cal, F.calGold];
  for (let i = 0; i < 13; i++) {
    const fx = ox + 10 + i * 6;
    rect(ctx, fx, oy + 28, 3, 2, bunting[i % 4]);
    px(ctx, fx + 1, oy + 30, bunting[i % 4]);
  }

  // upper windows with school flags hung in them
  rect(ctx, ox + 12, oy + 32, 2, 16, F.navy); // shutters
  rect(ctx, ox + 28, oy + 32, 2, 16, F.navy);
  rect(ctx, ox + 14, oy + 32, 14, 16, F.trim);
  rect(ctx, ox + 16, oy + 34, 10, 12, F.uofr);
  rect(ctx, ox + 18, oy + 37, 1, 6, F.dandelion); // gold R
  rect(ctx, ox + 18, oy + 37, 3, 1, F.dandelion);
  rect(ctx, ox + 18, oy + 40, 3, 1, F.dandelion);
  px(ctx, ox + 21, oy + 38, F.dandelion);
  px(ctx, ox + 21, oy + 39, F.dandelion);
  px(ctx, ox + 20, oy + 41, F.dandelion);
  px(ctx, ox + 21, oy + 42, F.dandelion);
  rect(ctx, ox + 70, oy + 32, 2, 16, F.navy); // shutters
  rect(ctx, ox + 86, oy + 32, 2, 16, F.navy);
  rect(ctx, ox + 72, oy + 32, 14, 16, F.trim);
  rect(ctx, ox + 74, oy + 34, 10, 12, F.cal);
  rect(ctx, ox + 77, oy + 37, 3, 1, F.calGold); // gold C
  rect(ctx, ox + 76, oy + 38, 1, 4, F.calGold);
  rect(ctx, ox + 77, oy + 42, 3, 1, F.calGold);

  // lower window, plain glass
  rect(ctx, ox + 12, oy + 56, 2, 14, F.navy);
  rect(ctx, ox + 28, oy + 56, 2, 14, F.navy);
  rect(ctx, ox + 14, oy + 56, 14, 14, F.trim);
  rect(ctx, ox + 16, oy + 58, 10, 10, C.glass);
  rect(ctx, ox + 16, oy + 58, 10, 3, C.glassLight);
  rect(ctx, ox + 20, oy + 58, 1, 10, F.trim);
  rect(ctx, ox + 16, oy + 62, 10, 1, F.trim);

  // front door with fanlight (aligned to its tile)
  rect(ctx, ox + 46, oy + 50, 20, 30, F.trim);
  rect(ctx, ox + 49, oy + 52, 14, 4, "#a8c8f0");
  rect(ctx, ox + 49, oy + 57, 14, 22, F.navy);
  for (const [py, ph] of [[60, 7], [70, 6]]) {
    rect(ctx, ox + 51, oy + py, 4, ph, "#3c4a70");
    rect(ctx, ox + 57, oy + py, 4, ph, "#3c4a70");
  }
  px(ctx, ox + 61, oy + 68, C.knob);

  // porch couch (well-loved) and a stray red cup
  rect(ctx, ox + 71, oy + 67, 16, 11, F.couchSeam);
  rect(ctx, ox + 71, oy + 67, 3, 10, F.couch);
  rect(ctx, ox + 84, oy + 67, 3, 10, F.couch);
  rect(ctx, ox + 71, oy + 67, 3, 2, F.couchLight);
  rect(ctx, ox + 84, oy + 67, 3, 2, F.couchLight);
  rect(ctx, ox + 74, oy + 67, 10, 5, F.couchDark);
  rect(ctx, ox + 74, oy + 72, 5, 4, F.couch);
  rect(ctx, ox + 79, oy + 72, 5, 4, F.couchLight);
  px(ctx, ox + 79, oy + 73, F.couchSeam);
  rect(ctx, ox + 42, oy + 74, 3, 4, "#d84040");
  rect(ctx, ox + 42, oy + 74, 3, 1, "#f07070");

  // white columns, drawn last so they stand proud of everything
  for (const cx of [4, 36, 66, 88]) {
    rect(ctx, ox + cx - 1, oy + 24, 6, 3, F.trim);
    rect(ctx, ox + cx, oy + 27, 4, 48, F.trim);
    rect(ctx, ox + cx + 3, oy + 27, 1, 48, F.trimShade);
    rect(ctx, ox + cx - 1, oy + 75, 6, 3, F.trim);
  }
}

// EXPERIENCE — LOGAN & CO. MISSION CONTROL: a dark command-center block crowned
// by a satellite dish and antenna array, a glowing wall of live screens (world
// map + telemetry grids) behind the glass, tiered operator consoles, and a navy
// awning over the entrance. Same footprint and door tile (col 17).
function paintOffice(ctx, b) {
  const ox = b.x * TILE;
  const oy = b.y * TILE;
  const dcx = ox + 56; // entrance centered on the door tile
  const O = {
    steel: "#aab0ba", steelLt: "#d8dce2", steelDk: "#5a626c",
    frame: "#2b3340", wall: "#39414f", panel: "#222a36",
    screenBg: "#0e1c30", grid: "#1d3a57", land: "#2f8a5e",
    green: "#5ad08a", amber: "#e6a23c", cyan: "#5ad2e0", red: "#e2564a", blue: "#7fb4e8",
    awning: "#23407e", awningLt: "#5878c0", plaque: "#caa648",
  };

  // rooftop: satellite dish (left) + antenna array (right) on the parapet
  for (let dy = -3; dy <= 2; dy++)
    for (let dx = -5; dx <= 5; dx++)
      if (dx * dx / 26 + dy * dy / 9 <= 1) px(ctx, ox + 16 + dx, oy + 4 + dy, dx < 0 ? O.steelLt : O.steel);
  rect(ctx, ox + 16, oy + 4, 1, 5, O.steelDk); // dish mast
  rect(ctx, ox + 14, oy + 8, 5, 1, O.steelDk);
  px(ctx, ox + 12, oy + 2, O.steelDk); // feed horn
  for (const [axe, hgt] of [[70, 8], [74, 8], [78, 5]]) { // antenna array
    rect(ctx, ox + axe, oy + 8 - hgt, 1, hgt, O.steelDk);
    px(ctx, ox + axe, oy + 8 - hgt, O.steelLt);
  }
  px(ctx, ox + 74, oy, O.red); // beacon

  // parapet
  rect(ctx, ox + 2, oy + 8, 92, 6, O.frame);
  rect(ctx, ox + 4, oy + 9, 88, 4, O.steel);
  rect(ctx, ox + 4, oy + 9, 88, 1, O.steelLt);

  // dark command-center body
  rect(ctx, ox + 2, oy + 14, 92, 66, O.frame);
  rect(ctx, ox + 4, oy + 16, 88, 62, O.wall);

  // the big VIDEO WALL behind the glass
  rect(ctx, ox + 8, oy + 20, 80, 26, O.frame);
  rect(ctx, ox + 9, oy + 21, 78, 24, O.screenBg);
  const mcx = ox + 48; // central world-map screen
  rect(ctx, mcx - 16, oy + 23, 32, 18, O.grid);
  rect(ctx, mcx - 12, oy + 26, 7, 6, O.land);
  rect(ctx, mcx - 3, oy + 25, 9, 8, O.land);
  rect(ctx, mcx + 7, oy + 28, 5, 4, O.land);
  px(ctx, mcx - 8, oy + 30, O.amber); px(ctx, mcx + 2, oy + 31, O.amber); px(ctx, mcx + 9, oy + 27, O.cyan);
  for (let i = 0; i < 6; i++) px(ctx, mcx - 8 + i * 3, oy + 29 - Math.round(Math.sin(i) * 2), O.cyan); // orbit arc
  const tones = [O.green, O.amber, O.cyan, O.amber, O.green, O.cyan]; // flanking telemetry grids
  for (const gx of [ox + 11, ox + 67]) {
    let k = 0;
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 2; c++, k++) {
        const sx = gx + c * 9, sy = oy + 23 + r * 7;
        rect(ctx, sx, sy, 7, 6, "#0a1422");
        rect(ctx, sx + 1, sy + 1, 5, 4, tones[k % 6]);
        rect(ctx, sx + 1, sy + 3, 5, 1, "#0a1422");
      }
  }
  for (let i = 0; i < 24; i++) px(ctx, ox + 9 + i, oy + 21 + i, "rgba(255,255,255,0.07)"); // glass sheen

  // tiered operator consoles flanking the entrance
  for (const [cx0, cw] of [[ox + 8, 32], [ox + 56, 32]]) {
    rect(ctx, cx0, oy + 52, cw, 7, O.panel);
    rect(ctx, cx0, oy + 52, cw, 1, O.steelDk);
    for (let sx = cx0 + 3; sx < cx0 + cw - 6; sx += 11) {
      rect(ctx, sx, oy + 48, 7, 4, O.blue); // glowing monitor
      rect(ctx, sx, oy + 48, 7, 1, "#cfe6ff");
      rect(ctx, sx + 8, oy + 49, 3, 3, "#2a2018"); // operator silhouette
    }
  }
  rect(ctx, ox + 4, oy + 59, 88, 3, "rgba(127,180,232,0.18)"); // floor glow

  // entrance: navy awning, glass door, brass plaque
  rect(ctx, dcx - 13, oy + 60, 26, 5, O.awning);
  rect(ctx, dcx - 13, oy + 60, 26, 1, O.awningLt);
  rect(ctx, dcx - 9, oy + 65, 18, 15, O.frame);
  rect(ctx, dcx - 7, oy + 66, 14, 14, "#1a2840");
  rect(ctx, dcx - 7, oy + 66, 14, 3, O.blue);
  rect(ctx, dcx - 1, oy + 66, 2, 14, O.frame);
  px(ctx, dcx - 3, oy + 74, C.knob); px(ctx, dcx + 2, oy + 74, C.knob);
  rect(ctx, dcx + 12, oy + 66, 8, 10, O.plaque);
  for (const ly of [68, 70, 72]) rect(ctx, dcx + 13, oy + ly, 6, 1, "#7a5c20");
}

// PROJECTS — LOGAN LABS MAKER SPACE: an industrial workshop with a vented metal
// roof + glowing skylight, a window of humming 3D printers, a pegboard of tools
// over racked filament spools and a laser cutter, a LABS sign, and a half-raised
// roll-up door showing the shop glow. Same footprint and door tile (col 16).
function paintLab(ctx, b) {
  const ox = b.x * TILE;
  const oy = b.y * TILE;
  const w = b.w * TILE; // 144
  const h = b.h * TILE; // 96
  const dcx = ox + 72; // roll-up door centered on the door tile
  const M = {
    wall: "#d8d2c2", wallShade: "#beb8a8", wallOutline: "#5e584c",
    roof: "#4a525e", roofLt: "#6a727e", roofOutline: "#2e333b",
    duct: "#9aa2ac", ductDk: "#5a626c", steel: "#aab0ba",
    glass: "#1a2630", printFrame: "#333b48", printGlow: "#7fe6d4", warm: "#ffce6b",
    spoolA: "#e2564a", spoolB: "#54d08a", spoolC: "#5ad2e0", laser: "#ff7a3c",
    sign: "#1b2630", signTxt: "#f4b73a", peg: "#7a5c38", tool: "#9aa3b0",
  };

  // vented metal roof + a glowing skylight
  rect(ctx, ox, oy, w, 40, M.roofOutline);
  rect(ctx, ox + 2, oy + 2, w - 4, 36, M.roof);
  rect(ctx, ox + 2, oy + 2, w - 4, 4, M.roofLt);
  rect(ctx, ox + 8, oy + 7, w - 16, 6, M.duct); // duct run
  rect(ctx, ox + 8, oy + 7, w - 16, 1, "#c2c8d0");
  for (let dx = 14; dx < w - 12; dx += 9) rect(ctx, ox + dx, oy + 7, 1, 6, M.ductDk);
  for (let dy = -4; dy <= 4; dy++) // extraction fan
    for (let dx = -4; dx <= 4; dx++)
      if (dx * dx + dy * dy <= 16) px(ctx, ox + 18 + dx, oy + 26 + dy, M.ductDk);
  rect(ctx, ox + 14, oy + 26, 9, 1, M.steel); rect(ctx, ox + 18, oy + 22, 1, 9, M.steel); // blades
  px(ctx, ox + 18, oy + 26, "#d8dce2");
  rect(ctx, ox + w / 2 - 16, oy + 16, 32, 12, M.printFrame); // skylight
  rect(ctx, ox + w / 2 - 14, oy + 18, 28, 8, M.warm);
  for (let gx = ox + w / 2 - 14; gx < ox + w / 2 + 14; gx += 6) rect(ctx, gx, oy + 18, 1, 8, M.printFrame);

  // workshop wall
  rect(ctx, ox + 2, oy + 40, w - 4, h - 40, M.wallOutline);
  rect(ctx, ox + 4, oy + 42, w - 8, h - 44, M.wall);
  rect(ctx, ox + 2, oy + 40, w - 4, 2, M.steel); // lintel
  for (const sx of [6, 134]) rect(ctx, ox + sx, oy + 42, 4, h - 44, M.wallShade); // corner pilasters

  // LEFT window: a row of three 3D printers
  rect(ctx, ox + 12, oy + 50, 44, 30, M.printFrame);
  rect(ctx, ox + 13, oy + 51, 42, 28, M.glass);
  for (let i = 0; i < 3; i++) {
    const p0 = ox + 15 + i * 14;
    rect(ctx, p0, oy + 54, 12, 22, M.printFrame);
    rect(ctx, p0 + 1, oy + 56, 10, 12, "#0d1820"); // chamber
    rect(ctx, p0 + 2, oy + 64, 8, 3, M.printGlow); // glowing print bed
    rect(ctx, p0 + 4, oy + 60, 4, 4, M.printGlow); // a half-printed part
    rect(ctx, p0 + 1, oy + 54, 10, 1, M.steel); // gantry
    px(ctx, p0 + 5, oy + 58, "#e8eef4"); // extruder
  }

  // RIGHT window: pegboard tools, filament spools, laser cutter
  rect(ctx, ox + w - 56, oy + 50, 44, 30, M.printFrame);
  rect(ctx, ox + w - 55, oy + 51, 42, 28, M.glass);
  const pbx = ox + w - 52;
  rect(ctx, pbx, oy + 53, 20, 11, M.peg); // pegboard
  rect(ctx, pbx + 2, oy + 55, 1, 7, M.tool); rect(ctx, pbx + 1, oy + 55, 3, 2, M.tool); // wrench
  rect(ctx, pbx + 8, oy + 55, 1, 7, M.tool); rect(ctx, pbx + 6, oy + 55, 5, 2, M.tool); // hammer
  rect(ctx, pbx + 15, oy + 56, 1, 6, M.tool); rect(ctx, pbx + 14, oy + 55, 3, 1, "#caa648"); // driver
  for (const [sxr, col] of [[2, M.spoolA], [9, M.spoolB], [16, M.spoolC]]) { // filament spools
    const sx = pbx + sxr, sy = oy + 71;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++)
        if (dx * dx + dy * dy <= 5) px(ctx, sx + dx, sy + dy, col);
    px(ctx, sx, sy, "#11202c");
  }
  rect(ctx, pbx + 22, oy + 68, 16, 8, "#2a3038"); // laser cutter
  rect(ctx, pbx + 22, oy + 68, 16, 1, M.steel);
  rect(ctx, pbx + 24, oy + 73, 12, 2, M.laser); // glowing cut line
  px(ctx, pbx + 30, oy + 71, "#ffd9b0");

  // LABS sign over the door (board + gold gear emblem)
  rect(ctx, dcx - 20, oy + 44, 40, 9, M.sign);
  rect(ctx, dcx - 19, oy + 45, 38, 7, "#26323e");
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++) {
      const d = dx * dx + dy * dy;
      if (d <= 9 && d >= 3) px(ctx, dcx - 13 + dx, oy + 48 + dy, M.signTxt); // gear ring
    }
  for (const [tx, ty] of [[-4, 0], [4, 0], [0, -4], [0, 4]]) rect(ctx, dcx - 13 + tx, oy + 48 + ty, 1, 1, M.signTxt);
  for (let lx = dcx - 4; lx < dcx + 18; lx += 6) rect(ctx, lx, oy + 47, 4, 3, M.signTxt); // "LABS" bars

  // half-raised roll-up garage door, shop glow spilling out
  rect(ctx, dcx - 13, oy + 60, 26, h - 60, M.roofOutline);
  rect(ctx, dcx - 11, oy + 62, 22, h - 62, "#141a20"); // open interior
  rect(ctx, dcx - 9, oy + h - 14, 18, 6, M.warm); // forge/printer glow on the floor
  px(ctx, dcx - 6, oy + h - 20, M.printGlow); px(ctx, dcx + 6, oy + h - 22, M.laser);
  rect(ctx, dcx - 4, oy + h - 24, 8, 10, "#2a3038"); // a workbench silhouette
  for (let i = 0; i < 4; i++) rect(ctx, dcx - 11, oy + 62 + i * 2, 22, 1, M.duct); // rolled-up slats
  rect(ctx, dcx - 13, oy + 60, 26, 2, M.steel); // header
}

// --- pond -------------------------------------------------------------------

function makePondFrame(frame) {
  const w = POND.w * TILE;
  const h = POND.h * TILE;
  const [c, ctx] = makeCanvas(w, h);
  rect(ctx, 0, 0, w, h, C.rim);
  rect(ctx, 2, 2, w - 4, h - 4, C.waterDark);
  rect(ctx, 3, 3, w - 6, h - 6, C.water);
  // round the corners
  for (const [cx, cy] of [[0, 0], [w - 2, 0], [0, h - 2], [w - 2, h - 2]]) {
    ctx.clearRect(cx, cy, 2, 1);
    ctx.clearRect(cx === 0 ? 0 : w - 1, cy === 0 ? 0 : h - 2, 1, 2);
  }
  // shore highlight + ripples
  rect(ctx, 4, 4, w - 8, 1, C.waterLight);
  const ripples = frame === 0
    ? [[8, 10], [22, 18], [40, 12], [14, 28], [46, 30], [30, 22]]
    : [[10, 12], [24, 16], [38, 14], [16, 26], [44, 32], [28, 20]];
  for (const [rx, ry] of ripples) {
    rect(ctx, rx, ry, 4, 1, C.waterLight);
    px(ctx, rx + 1, ry + 1, C.waterLight);
  }
  return c;
}

// --- world ------------------------------------------------------------------

export function buildWorld() {
  const [bg, ctx] = makeCanvas(MAP_W * TILE, MAP_H * TILE);

  for (let ty = 0; ty < MAP_H; ty++)
    for (let tx = 0; tx < MAP_W; tx++)
      isPath(tx, ty) ? paintDirt(ctx, tx, ty, isPath) : paintGrass(ctx, tx, ty);

  FENCES.forEach(([x, y]) => paintFence(ctx, x * TILE, y * TILE));
  SIGNS.forEach((s) => paintSign(ctx, s.x * TILE, s.y * TILE));
  MAILBOXES.forEach((m) => paintMailbox(ctx, m.x * TILE, m.y * TILE));
  POTS.forEach(([x, y]) => paintPot(ctx, x * TILE, y * TILE));
  TREES.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    paintBorderTree(ctx, x * TILE, y * TILE);
  });
  BUILDINGS.forEach((b) => {
    if (b.id === "education") paintFratHouse(ctx, b);
    else if (b.id === "experience") paintOffice(ctx, b);
    else paintLab(ctx, b);
  });
  CARS.forEach((c) => paintModelY(ctx, c.x * TILE, c.y * TILE));
  BALLS.forEach(([x, y]) => paintBall(ctx, x * TILE, y * TILE));
  FERNS.forEach(([x, y]) => paintFern(ctx, x * TILE, y * TILE));
  POHUTUKAWA.forEach(([x, y]) => paintPohutukawa(ctx, x * TILE, y * TILE));

  return {
    bg,
    pondFrames: [makePondFrame(0), makePondFrame(1)],
    flowerFrames: [makeFlowerFrame(0), makeFlowerFrame(1)],
    flowerTiles: FLOWERS,
    pond: POND,
  };
}
