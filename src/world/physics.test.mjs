import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { groundHeight, createCollisionWorld, stepPlayer } from './physics.js';
const root = new URL('../../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('public/world/manifest.json', root)));
function floats(name) { const b=readFileSync(new URL('public/world/'+name,root)); return new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)); }
const heights=floats('heightmap.bin'), placements=floats('placements.bin');
const world=createCollisionWorld(manifest,placements,heights);
const state=(x=0,z=24,y=world.height(x,z))=>({x,y,z,vx:0,vz:0,vy:0,speed:0,grounded:true});
const flat={height:()=>0,blocked:()=>false};
const walk=(p,keys,ground=world,frames=180)=>{for(let i=0;i<frames;i++)stepPlayer(p,new Set(keys),0,ground,1/60);return p;};
test('collision height matches exported terrain vertices across the map',()=>{
 const {resolution:n,size,minX,minY}=manifest.terrain;
 for(let j=0;j<n-1;j+=17)for(let i=0;i<n-1;i+=19)assert.ok(Math.abs(groundHeight(manifest.terrain,heights,minX+i*size/(n-1),-(minY+j*size/(n-1)))-heights[j*n+i])<1e-5);
});
test('diagonal movement is normalized and running is faster',()=>{
 const a=walk(state(0,0,0),['KeyW'],flat),b=walk(state(0,0,0),['KeyW','KeyD'],flat),c=walk(state(0,0,0),['KeyW','ShiftLeft'],flat);
 assert.ok(Math.abs(Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))<1e-7);assert.ok(Math.abs(c.z)>Math.abs(a.z)*1.9);
});
test('gravity lands a falling player on the terrain',()=>{
 const p=state(0,24);p.y+=5;p.grounded=false;walk(p,[],world,180);assert.ok(Math.abs(p.y-world.height(p.x,p.z))<1e-5);assert.equal(p.grounded,true);
});
test('arcade walls stop movement while the doorway interaction remains reachable',()=>{
 const p=walk(state(13,-13),['KeyW','ShiftLeft'],world,240);assert.ok(p.z>-17.7);assert.ok(Math.hypot(p.x-13,p.z+15)<3.3);assert.equal(world.blocked(p.x,p.z),false);
});
test('fountain and pond are solid boundaries',()=>{
 const p=walk(state(-2,-5),['KeyW'],world,240);assert.ok(p.z>-8.5);assert.equal(world.blocked(-29,1),true);assert.equal(world.blocked(-2,-12),true);
});
test('steep uphill motion is rejected; a gentle slope remains walkable',()=>{
 const steep={height:x=>x*1.5,blocked:()=>false}, gentle={height:x=>x*.4,blocked:()=>false};
 const a=walk(state(0,0,0),['KeyD'],steep),b=walk(state(0,0,0),['KeyD'],gentle);
 assert.equal(a.x,0);assert.ok(b.x>5);assert.ok(Math.abs(b.y-gentle.height(b.x,b.z))<.1);
});
