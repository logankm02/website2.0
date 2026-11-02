// Run from the repository: node art/world/scripts/sync_city_layouts.mjs
// Reads existing city data; never modifies the pixel game.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import * as map from '../../../src/game/map.js';
const snapshot = Object.fromEntries(Object.entries(map).filter(([,v]) => typeof v !== 'function').map(([k,v]) => [k, v instanceof Set ? [...v].map(p => p.split(',').map(Number)) : v]));
writeFileSync(new URL('city-layout.json', import.meta.url), JSON.stringify(snapshot,null,2));
const compiled = await build({ entryPoints: [fileURLToPath(new URL('../../../src/game/interiors.js',import.meta.url))], bundle:true, platform:'node', format:'esm', write:false });
const { getInteriors } = await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const rooms=getInteriors();
const campuses=Object.fromEntries(['uofr','ucb'].map(id=>{const r=rooms[id];return [id,{title:r.title,pathMatrix:r.pathMatrix,furniture:r.furniture,spawn:r.spawn,hotspots:r.hotspots}];}));
writeFileSync(new URL('campus-layouts.json',import.meta.url),JSON.stringify(campuses,null,2));
