// Village layout (pure data — no DOM). Grid is 24×20 tiles, modeled on a
// classic GBA town: two houses up top, a lab to the right, a flower garden,
// a pond, and a tree border with one exit gap at the south.

export const MAP_W = 24;
export const MAP_H = 20;

export const START = { x: 11, y: 14, dir: "up" };

// ---------------------------------------------------------------------------
// Terrain

export const TREES = new Set();
for (let x = 0; x < MAP_W; x++) {
  TREES.add(`${x},0`);
  TREES.add(`${x},${MAP_H - 1}`);
}
for (let y = 0; y < MAP_H; y++) {
  TREES.add(`0,${y}`);
  TREES.add(`${MAP_W - 1},${y}`);
}
// Inner corner accents
[[1, 1], [2, 1], [21, 1], [22, 1], [1, 18], [22, 18]].forEach(([x, y]) =>
  TREES.add(`${x},${y}`),
);
// South exit gap
TREES.delete("12,19");
TREES.delete("13,19");
export const EXITS = [
  { x: 12, y: 19 },
  { x: 13, y: 19 },
];

// Light walkway rectangles [x, y, w, h]
export const PATHS = [
  [4, 7, 16, 1], // promenade under the houses
  [11, 7, 3, 12], // central avenue down to the exit
  [12, 19, 2, 1], // exit gap
  [6, 8, 1, 2], // house A doorstep run-off
  [17, 7, 1, 1], // house B doorstep
  [5, 9, 6, 1], // toward the garden
  [14, 14, 5, 1], // lab front walk
  [16, 14, 1, 1], // lab steps
  [6, 15, 5, 1], // toward the pond
];

export const POND = { x: 7, y: 16, w: 4, h: 3 };

// ---------------------------------------------------------------------------
// Buildings: [x, y] is the top-left tile; the door is a tile on the bottom row.

export const BUILDINGS = [
  { id: "education", kind: "house", x: 3, y: 2, w: 6, h: 5, door: { x: 6, y: 6 } },
  { id: "experience", kind: "house", x: 14, y: 2, w: 6, h: 5, door: { x: 17, y: 6 } },
  { id: "projects", kind: "lab", x: 12, y: 8, w: 9, h: 6, door: { x: 16, y: 13 } },
];

// ---------------------------------------------------------------------------
// Props

export const FENCES = [
  [4, 10], [5, 10], [6, 10], [7, 10], [8, 10],
  [15, 15], [16, 15], [17, 15], [18, 15],
];

export const SIGNS = [
  { x: 9, y: 10, id: "skills" },
  { x: 14, y: 15, id: "contact" },
];

// Mailbox B used to sit at (14,7), plugging the only gap between the career
// house and the lab — the whole east promenade was unreachable head-on.
export const MAILBOXES = [
  { x: 3, y: 7, id: "mailboxA" },
  { x: 21, y: 7, id: "mailboxB" },
];

// LOGAN's Model Y, parked outside the career house. [x, y] is the left tile.
export const CARS = [
  { id: "teslaCar", x: 18, y: 7, w: 3 },
];

// A soccer ball left on the green by the school house.
export const BALLS = [[5, 8]];

// Silver ferns from Aotearoa, planted among the garden flowers.
export const FERNS = [[5, 11], [7, 13]];

// Pōhutukawa — NZ Christmas trees in full crimson bloom, dotted around town.
export const POHUTUKAWA = [
  [10, 4], // on the green between the stadium and the office
  [2, 9], // west side, by the garden
  [22, 15], // east green
  [16, 17], // south lawn
];

// Wild kiwi out foraging in broad daylight (they shouldn't be — they're
// nocturnal; the dialog jokes about it). Live wander state is owned by
// Village.jsx; these are home tiles and starting facings.
export const KIWIS = [
  { x: 4, y: 9, dir: "right" }, // on the garden walk
  { x: 21, y: 12, dir: "left" }, // east green, beside the lab
  { x: 3, y: 17, dir: "right" }, // pond corner
];

export const POTS = [
  [4, 14],
  [5, 14],
];

export const FLOWERS = [
  [4, 11], [6, 11], [8, 11],
  [5, 12], [7, 12],
  [4, 13], [6, 13], [8, 13],
];

// ---------------------------------------------------------------------------
// Lookups

const solid = new Set([...TREES]);
FENCES.forEach(([x, y]) => solid.add(`${x},${y}`));
POTS.forEach(([x, y]) => solid.add(`${x},${y}`));
SIGNS.forEach((s) => solid.add(`${s.x},${s.y}`));
MAILBOXES.forEach((m) => solid.add(`${m.x},${m.y}`));
CARS.forEach((c) => {
  for (let x = c.x; x < c.x + c.w; x++) solid.add(`${x},${c.y}`);
});
BALLS.forEach(([x, y]) => solid.add(`${x},${y}`));
FERNS.forEach(([x, y]) => solid.add(`${x},${y}`));
POHUTUKAWA.forEach(([x, y]) => solid.add(`${x},${y}`));
BUILDINGS.forEach((b) => {
  for (let y = b.y; y < b.y + b.h; y++)
    for (let x = b.x; x < b.x + b.w; x++) solid.add(`${x},${y}`);
});
for (let y = POND.y; y < POND.y + POND.h; y++)
  for (let x = POND.x; x < POND.x + POND.w; x++) solid.add(`${x},${y}`);
EXITS.forEach((e) => solid.delete(`${e.x},${e.y}`));

export function isSolid(x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
  return solid.has(`${x},${y}`);
}

// What happens when the player bumps into / interacts with a tile.
// Types: panel (resume section), dialog (flavor text), choice (yes/no).
const interactables = new Map();
BUILDINGS.forEach((b) => interactables.set(`${b.door.x},${b.door.y}`, { type: "enter", id: b.id }));
SIGNS.forEach((s) => interactables.set(`${s.x},${s.y}`, { type: "panel", id: s.id }));
MAILBOXES.forEach((m) => interactables.set(`${m.x},${m.y}`, { type: "dialog", id: m.id }));
CARS.forEach((c) => {
  for (let x = c.x; x < c.x + c.w; x++)
    interactables.set(`${x},${c.y}`, { type: "dialog", id: c.id });
});
BALLS.forEach(([x, y]) => interactables.set(`${x},${y}`, { type: "dialog", id: "soccerBall" }));
FERNS.forEach(([x, y]) => interactables.set(`${x},${y}`, { type: "dialog", id: "fern" }));
POHUTUKAWA.forEach(([x, y]) => interactables.set(`${x},${y}`, { type: "dialog", id: "pohutukawa" }));
POTS.forEach(([x, y]) => interactables.set(`${x},${y}`, { type: "dialog", id: "pot" }));
for (let y = POND.y; y < POND.y + POND.h; y++)
  for (let x = POND.x; x < POND.x + POND.w; x++)
    interactables.set(`${x},${y}`, { type: "choice", id: "pond" });
// `dir: "down"` — only fires when walking/facing south, so strolling across
// the two-tile gap doesn't re-prompt.
EXITS.forEach((e) => interactables.set(`${e.x},${e.y}`, { type: "choice", id: "exit", dir: "down" }));

export function interactAt(x, y) {
  return interactables.get(`${x},${y}`) || null;
}

export function isPath(x, y) {
  return PATHS.some(([px, py, w, h]) => x >= px && x < px + w && y >= py && y < py + h);
}
