// Run from the repository: node art/world/scripts/sync_npc_dialogue.mjs
// Reads the pixel village's villagers (name/dialogue/position); never
// modifies the pixel game. Feeds room_furniture.py so the 3D interiors can
// carry the same people and conversations as the original /city rooms.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: [fileURLToPath(new URL('../../../src/game/interiors.js', import.meta.url))],
  bundle: true, platform: 'node', format: 'esm', write: false,
});
const { getInteriors } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const rooms = getInteriors();
const out = Object.fromEntries(['education', 'experience', 'projects'].map(id => {
  const room = rooms[id];
  return [id, {
    w: room.w, h: room.h,
    npcs: room.npcs.map(npc => ({ x: npc.x, y: npc.y, dir: npc.dir, pages: npc.pages, href: npc.choice?.href })),
  }];
}));
writeFileSync(new URL('npc-dialogue.json', import.meta.url), JSON.stringify(out, null, 2));
console.log(Object.fromEntries(Object.entries(out).map(([id, r]) => [id, r.npcs.length])));
