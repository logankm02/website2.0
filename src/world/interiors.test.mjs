import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCollisionWorld, stepPlayer } from './physics.js';
import { resolveWorldRoute, arrivalManifest } from './worldRoute.js';
const root=new URL('../../public/world/',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root)));
const floats=path=>{const b=readFileSync(new URL(path,root));return new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
const city=read('manifest.json');
const cityWorld=createCollisionWorld(city,floats('placements.bin'),floats('heightmap.bin'));

for(const id of ['education','experience','projects'])test(`${id}: furnished room is walkable, contained and exits at its own city door`,()=>{
  const route=resolveWorldRoute('?interior='+id),m=read(route.prefix+'manifest.json');
  assert.equal(route.startImmediately,true);assert.equal(m.interior,id);
  assert.deepEqual(m.assets,[]);assert.deepEqual(m.groups,[]);
  const world=createCollisionWorld(m,floats(m.placements),floats(m.heightmap));
  assert.equal(world.blocked(m.spawn[0],-m.spawn[1]),false);
  for(const key of ['KeyW','KeyS','KeyA','KeyD']){
    const p={x:m.spawn[0],y:0,z:-m.spawn[1],vx:0,vz:0,vy:0,grounded:true};
    for(let i=0;i<600;i++)stepPlayer(p,new Set([key,'ShiftLeft']),0,world,1/60);
    assert.equal(world.blocked(p.x,p.z),false,key+' stops at wall');
    assert.equal(p.y,0);assert.ok(Math.hypot(p.x-m.spawn[0],p.z+m.spawn[1])>1);
  }
  const exit=m.locations.find(l=>l.id==='exit');assert.equal(world.blocked(exit.position[0],exit.position[2]),false);
  const returnRoute=resolveWorldRoute(new URL(exit.travel,'http://localhost').search);
  const returned=arrivalManifest(city,returnRoute),door=city.landmarks.find(l=>l.id===id).door;
  assert.deepEqual(returned.spawn,door.slice(0,2));assert.equal(returnRoute.startImmediately,true);
  assert.equal(cityWorld.blocked(returned.spawn[0],-returned.spawn[1]),false);
  assert.notDeepEqual(city.spawn,returned.spawn,'return does not reset to the town spawn');
});
test('every furnished exhibit can be approached from its room entrance', () => {
  for (const room of ['education', 'experience', 'projects']) {
    const m = read('interiors/' + room + '/manifest.json');
    const world = createCollisionWorld(m, floats(m.placements), floats(m.heightmap));
    const queue = [[Math.round(m.spawn[0]*2), Math.round(-m.spawn[1]*2)]];
    const visited = new Set();
    const reachable = new Set();
    for (let i = 0; i < queue.length; i++) {
      const [x,z] = queue[i], key = x + ',' + z;
      if (visited.has(key)) continue;
      visited.add(key);
      if (world.blocked(x/2,z/2)) continue;
      for (const spot of m.locations) {
        if (Math.hypot(spot.position[0]-x/2, spot.position[2]-z/2) < .5) reachable.add(spot.id);
      }
      queue.push([x+1,z],[x-1,z],[x,z+1],[x,z-1]);
    }
    assert.ok(m.locations.length >= 3, room + ' has exhibits and an exit');
    assert.deepEqual(reachable, new Set(m.locations.map(l => l.id)), room);
  }
});
test('world route selection validates room names and retains campus routes',()=>{
  assert.equal(resolveWorldRoute('?interior=../../outside').prefix,'');
  assert.equal(resolveWorldRoute('?interior=__proto__').prefix,'');
  assert.equal(resolveWorldRoute('?campus=rochester').prefix,'campuses/rochester/');
  assert.equal(resolveWorldRoute('?interior=projects&campus=berkeley').prefix,'interiors/projects/');
  assert.equal(arrivalManifest(city,resolveWorldRoute('?from=unknown')),city);
});
