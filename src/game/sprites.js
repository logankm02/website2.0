// Player character: an original 14×18 trainer-style sprite, authored as
// string matrices (one char per pixel) and mirrored for opposite frames.

import { sprite, flip, rect, px } from "./pixels";

const PAL = {
  K: "#3a3440", // outline
  R: "#d84c40", // cap
  r: "#a83830", // cap brim/shade
  H: "#5a3a24", // hair
  S: "#f4c490", // skin
  B: "#4878d0", // jacket
  W: "#e8f0f8", // jacket panel
  P: "#4a5468", // pants
  N: "#2e3440", // shoes
};

const DOWN_STAND = [
  "....KKKKKK....",
  "..KKRRRRRRKK..",
  ".KRRRRRRRRRRK.",
  ".KRRRRRRRRRRK.",
  ".KrrrrrrrrrrK.",
  ".KHHHHHHHHHHK.",
  ".KHSSSSSSSSHK.",
  ".KHSKSSSSKSHK.",
  "..KSSSSSSSSK..",
  "...KSSSSSSK...",
  "..KBBBBBBBBK..",
  ".KBBBWWWWBBBK.",
  ".KBBBWWWWBBBK.",
  ".KSBBWWWWBBSK.",
  "..KPPPPPPPPK..",
  "..KPPK..KPPK..",
  "..KNNK..KNNK..",
  "..KKKK..KKKK..",
];

// Left leg lifted; mirrored for the opposite stride.
const DOWN_WALK = [
  ...DOWN_STAND.slice(0, 14),
  "..KPPPPPPPPK..",
  "..KNNK..KPPK..",
  "........KPPK..",
  "........KNNK..",
];

const UP_STAND = [
  "....KKKKKK....",
  "..KKRRRRRRKK..",
  ".KRRRRRRRRRRK.",
  ".KRRRRRRRRRRK.",
  ".KRRRrrrrRRRK.",
  ".KHHHHHHHHHHK.",
  ".KHHHHHHHHHHK.",
  ".KHHHHHHHHHHK.",
  "..KHHHHHHHHK..",
  "...KHHHHHHK...",
  "..KBBBBBBBBK..",
  ".KBBBBBBBBBBK.",
  ".KBBBBBBBBBBK.",
  ".KSBBBBBBBBSK.",
  "..KPPPPPPPPK..",
  "..KPPK..KPPK..",
  "..KNNK..KNNK..",
  "..KKKK..KKKK..",
];

const UP_WALK = [
  ...UP_STAND.slice(0, 14),
  "..KPPPPPPPPK..",
  "..KNNK..KPPK..",
  "........KPPK..",
  "........KNNK..",
];

// Facing right; flipped for left.
const SIDE_STAND = [
  "....KKKKKK....",
  "..KKRRRRRRK...",
  ".KRRRRRRRRKK..",
  ".KRRRRRRRRRRKK",
  ".KRRRRrrrrrrK.",
  ".KHHHHSSSSSK..",
  ".KHHHSSSKSSK..",
  ".KHHHSSSSSSK..",
  "..KHSSSSSSK...",
  "....KSSSSK....",
  "...KBBBBBBK...",
  "..KBBBBBBBBK..",
  "..KBBBBBBBBK..",
  "..KBBBBSBBBK..",
  "...KPPPPPPK...",
  "...KPPKPPK....",
  "...KNNKNNK....",
  "...KKKKKKK....",
];

const SIDE_WALK = [
  ...SIDE_STAND.slice(0, 14),
  "...KPPPPPPK...",
  "..KPPK..KPPK..",
  "..KNNK..KNNK..",
  "..KKKK..KKKK..",
];

// frames[dir] = [stand, step, (other step)] — drawn with a 1px bob on steps.
// `overrides` recolors the base palette, so the same matrices produce every
// villager (recoloring the cap as hair reads as a haircut, GBA-style).
function paintBadge(ctx, x, y, mark) {
  rect(ctx, x, y, 4, 3, mark.accent);
  if (mark.letter === "R") {
    rect(ctx, x + 1, y + 1, 2, 1, mark.main);
    px(ctx, x + 3, y + 2, mark.main);
  } else {
    rect(ctx, x + 1, y, 2, 1, mark.main);
    rect(ctx, x + 1, y + 2, 2, 1, mark.main);
    px(ctx, x + 3, y + 1, mark.main);
  }
}

function paintSchoolDetails(frames, mark) {
  frames.down.forEach((frame) => {
    const ctx = frame.getContext("2d");
    paintBadge(ctx, 5, 11, mark);
    rect(ctx, 4, 13, 6, 1, mark.accent);
  });
  frames.up.forEach((frame) => {
    const ctx = frame.getContext("2d");
    rect(ctx, 4, 11, 6, 1, mark.accent);
    rect(ctx, 5, 12, 4, 1, mark.main);
  });
  [...frames.left, ...frames.right].forEach((frame) => {
    const ctx = frame.getContext("2d");
    rect(ctx, 6, 11, 3, 2, mark.accent);
    px(ctx, 7, 12, mark.main);
  });
}

export function buildCharacterFrames(overrides = {}) {
  const { schoolMark, ...paletteOverrides } = overrides;
  const pal = { ...PAL, ...paletteOverrides };
  const downWalk = sprite(DOWN_WALK, pal);
  const upWalk = sprite(UP_WALK, pal);
  const rightStand = sprite(SIDE_STAND, pal);
  const rightWalk = sprite(SIDE_WALK, pal);
  const frames = {
    down: [sprite(DOWN_STAND, pal), downWalk, flip(downWalk)],
    up: [sprite(UP_STAND, pal), upWalk, flip(upWalk)],
    right: [rightStand, rightWalk],
    left: [flip(rightStand), flip(rightWalk)],
  };
  if (schoolMark) paintSchoolDetails(frames, schoolMark);
  return frames;
}

export function buildPlayerFrames() {
  return buildCharacterFrames();
}

// --- kiwi -------------------------------------------------------------------
// A wild kiwi: plump egg-shaped body, hair-like feather streaks, long
// down-curved beak. Side view only — flipped for the other facing; vertical
// moves keep the last horizontal facing, critter-style.

const KIWI_PAL = {
  K: "#2a201a", // outline
  B: "#8a6238", // body
  D: "#6a4826", // feather streaks
  e: "#16100c", // eye
  b: "#c4a070", // beak
  L: "#b08858", // legs
};

const KIWI_STAND = [
  ".....KKKK.......",
  "...KKBBBBKK.....",
  "..KBBBBBBBBK....",
  ".KBBBBBBBBBeK...",
  ".KBDBBDBBBBBKbb.",
  ".KBBDBBDBBBBK.bb",
  ".KBBBBDBBBBK....",
  "..KBBBBBBBK.....",
  "...KKBBBKK......",
  ".....L..L.......",
  ".....L..L.......",
];

const KIWI_STEP = [
  ...KIWI_STAND.slice(0, 9),
  "....L....L......",
  "....L....L......",
];

export function buildKiwiFrames() {
  const rightStand = sprite(KIWI_STAND, KIWI_PAL);
  const rightStep = sprite(KIWI_STEP, KIWI_PAL);
  return {
    right: [rightStand, rightStep],
    left: [flip(rightStand), flip(rightStep)],
  };
}

// Villager wardrobe. NPCs pick a palette by index (modulo the list).
export const NPC_PALS = [
  { R: "#5a3a24", r: "#46301e", B: "#c85870", W: "#f0dce0" }, // brown hair, rose
  { R: "#3a5a2c", r: "#2c4622", B: "#e0a040", W: "#f8f0d8" }, // green cap, amber
  { R: "#704890", r: "#583874", B: "#48a078", W: "#e0f0e0" }, // purple cap, teal
  { R: "#2c3c2c", r: "#223022", B: "#6878d8", W: "#dfe8f8", H: "#2c3c2c" }, // dark hair, periwinkle
  { R: "#d8b850", r: "#b09038", B: "#586878", W: "#d8e0e8" }, // blond, slate
  { R: "#b8b8c0", r: "#98989f", B: "#f0f0f0", W: "#c8d0d8", P: "#787880" }, // grey hair, lab coat
  { R: "#46301e", r: "#382616", B: "#d05048", W: "#f8d8d0" }, // dark hair, red
  {
    R: "#ffc857",
    r: "#d8a538",
    B: "#0f2f66",
    W: "#f7e7a8",
    P: "#3d4960",
    schoolMark: { letter: "R", main: "#0f2f66", accent: "#ffc857" },
  }, // Rochester blue and dandelion
  {
    R: "#fdb515",
    r: "#d69a10",
    B: "#003262",
    W: "#dfe9f7",
    P: "#2e405f",
    schoolMark: { letter: "B", main: "#003262", accent: "#fdb515" },
  }, // Berkeley blue and gold
  { R: "#d84c40", r: "#a83830", B: "#f0ece8", W: "#d84c40", P: "#3a3a44" }, // racing whites, red trim
  { R: "#fdb515", r: "#d69a10", B: "#003262", W: "#fdb515", P: "#2e405f" }, // CalSol navy and gold
  { R: "#46301e", r: "#382616", B: "#58b8e0", W: "#f8f8f4" }, // kite-sky blue
  { R: "#1c2824", r: "#141e1a", B: "#1e4038", W: "#f4f4f0", H: "#1c2824" }, // tui green, white tuft
];

export const SPRITE_W = 14;
export const SPRITE_H = 18;
