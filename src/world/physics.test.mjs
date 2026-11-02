import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { groundHeight, createCollisionWorld, stepPlayer } from './physics.js';
import { BUILDINGS, START, PATHS, POND } from '../game/map.js';
const root = new URL('../../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('public/world/manifest.json', root)));
function floats(name) { const b=readFileSync(new URL('public/world/'+name,root)); return new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)); }
const heights=floats('heightmap.bin'), placements=floats('placements.bin');
const world=createCollisionWorld(manifest,placements,heights);
const state=(x=manifest.spawn[0],z=-manifest.spawn[1],y=world.height(x,z))=>({x,y,z,vx:0,vz:0,vy:0,speed:0,grounded:true});
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
 const p=state();p.y+=5;p.grounded=false;walk(p,[],world,180);assert.ok(Math.abs(p.y-world.height(p.x,p.z))<1e-5);assert.equal(p.grounded,true);
});
test('all three building walls stop movement while their doors remain reachable',()=>{
 for(const landmark of manifest.landmarks){
   const [x,y]=landmark.door;
   assert.equal(world.blocked(x,-y),false,landmark.id+' doorstep clear');
   const p=walk(state(x,-y),['KeyW','ShiftLeft'],world,240);
   assert.ok(p.z>-(landmark.center[1]-landmark.half[1]),landmark.id+' wall');
   assert.ok(Math.hypot(p.x-x,p.z+y)<3.3,landmark.id+' interaction');
   assert.equal(world.blocked(p.x,p.z),false);
 }
});
test('pond and border are solid, with the source city’s south gate open',()=>{
 const x=(POND.x+(POND.w-1)/2-11.5)*2.4, z=(POND.y+(POND.h-1)/2-10)*2.4;
 assert.equal(world.blocked(x,z),true);
 assert.equal(world.blocked(-27.6,0),true);
 assert.equal(world.blocked(2.4,21.6),false);
 assert.equal(world.blocked(-10,21.6),true);
});
test('steep uphill motion is rejected; a gentle slope remains walkable',()=>{
 const steep={height:x=>x*1.5,blocked:()=>false}, gentle={height:x=>x*.4,blocked:()=>false};
 const a=walk(state(0,0,0),['KeyD'],steep),b=walk(state(0,0,0),['KeyD'],gentle);
 assert.equal(a.x,0);assert.ok(b.x>5);assert.ok(Math.abs(b.y-gentle.height(b.x,b.z))<.1);
});
test('Blender manifest preserves LOGAN CITY layout and spawn',()=>{
 assert.deepEqual(manifest.layout.BUILDINGS,BUILDINGS);
 assert.deepEqual(manifest.layout.PATHS,PATHS);
 assert.deepEqual(manifest.layout.POND,POND);
 assert.deepEqual(manifest.spawn,[(START.x-11.5)*2.4,(10-START.y)*2.4]);
 assert.deepEqual(manifest.landmarks.map(l=>l.id),['education','experience','projects']);
 for(const b of BUILDINGS){
  const l=manifest.landmarks.find(l=>l.id===b.id);
  assert.ok(Math.abs(l.center[0]-(b.x+(b.w-1)/2-11.5)*2.4)<1e-7);
  assert.ok(Math.abs(l.center[1]-(10-b.y-(b.h-1)/2)*2.4)<1e-7);
 }
});
test('spawn connects to every building, both signs, pond walk and south gate',()=>{
 // Flood actual exported collision geometry, including instanced tree trunks.
 const step=.6, queue=[[Math.round(manifest.spawn[0]/step),Math.round(-manifest.spawn[1]/step)]], seen=new Set();
 for(let i=0;i<queue.length;i++){
  const [ix,iz]=queue[i],key=ix+','+iz;
  if(seen.has(key)||Math.abs(ix)>44||iz< -39||iz>39||world.blocked(ix*step,iz*step))continue;
  seen.add(key);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([ix+dx,iz+dz]);
 }
 const targets=[...manifest.landmarks.map(l=>[l.id,l.door[0],-l.door[1]]),['skills',-6,1.56],['contact',6,13.56],['pond',-7.2,12],['gate',2.4,21.6],['rochester portal',-20,-5.2],['berkeley portal',-8.5,-5.2]];
 for(const [label,x,z] of targets)assert.ok([...seen].some(key=>{const [ix,iz]=key.split(',').map(Number);return Math.hypot(ix*step-x,iz*step-z)<1;}),label+' reachable');
});
