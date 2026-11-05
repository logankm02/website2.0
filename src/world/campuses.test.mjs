import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createCollisionWorld, stepPlayer } from './physics.js';
const root = new URL('../../public/world/', import.meta.url);
const floats = path => { const b=readFileSync(new URL(path,root)); return new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)); };
for (const campus of ['rochester','berkeley']) {
  const m=JSON.parse(readFileSync(new URL(`campuses/${campus}/manifest.json`,root)));
  const world=createCollisionWorld(m,floats(m.placements),floats(m.heightmap));
  test(`${campus}: complete local assets, clear spawn, connected landmarks and return portal`,()=>{
    for(const path of [m.world,m.placements,m.heightmap,...m.assets.flatMap(a=>[a.url,...(a.lodUrl?[a.lodUrl]:[])])])assert.ok(existsSync(new URL(path,root)),path);
    const [sx,sy]=m.spawn; assert.equal(world.blocked(sx,-sy),false);
    const queue=[[Math.round(sx/.6),Math.round(-sy/.6)]],seen=new Set();
    for(let i=0;i<queue.length;i++){
      const [ix,iz]=queue[i],key=ix+','+iz;
      if(seen.has(key)||world.blocked(ix*.6,iz*.6))continue;
      seen.add(key);
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([ix+dx,iz+dz]);
    }
    for(const l of m.locations)assert.ok([...seen].some(k=>{const [ix,iz]=k.split(',').map(Number);return Math.hypot(ix*.6-l.position[0],iz*.6-l.position[2])<1.2;}),l.label+' reachable');
    const p={x:sx,y:world.height(sx,-sy),z:-sy,vx:0,vz:0,vy:0,grounded:true};
    for(let i=0;i<120;i++)stepPlayer(p,new Set(['KeyW']),0,world,1/60);
    assert.ok(p.z < -sy-3,'walk forward from spawn');
    assert.ok(m.locations.some(l=>l.links.some(link=>link.href==='/world')),'return to city');
  });
  if(campus==='berkeley')test('Berkeley: creek blocks walking, bridge and Sather Gate stay open',()=>{
    const point=(x,y)=>[(x-11.5)*2.4,(y-10)*2.4];
    assert.equal(world.blocked(...point(2,8)),true);
    assert.equal(world.blocked(...point(2,9)),false);
    assert.equal(world.blocked(...point(17,16.5)),false);
  });
}

test('Rochester side halls and Dewey present reachable entrances toward the quad',()=>{
  const m=JSON.parse(readFileSync(new URL('campuses/rochester/manifest.json',root)));
  const world=createCollisionWorld(m,floats(m.placements),floats(m.heightmap));
  for(const [name,inward] of [['BAUSCH & LOMB',[1,0]],['MOREY HALL',[-1,0]],['DEWEY HALL',[0,1]]]){
    const hall=m.landmarks.find(l=>l.id===name);
    const dx=hall.door[0]-hall.center[0],dy=hall.door[1]-hall.center[1];
    assert.ok((dx*inward[0]+dy*inward[1])/Math.hypot(dx,dy)>.99,name+' faces the green');
    assert.equal(world.blocked(hall.door[0],-hall.door[1]),false,name+' doorstep is clear');
    const sign=m.locations.find(l=>l.id===name);
    assert.ok(Math.hypot(sign.position[0]-hall.door[0],sign.position[2]+hall.door[1])<.01,name+' interaction follows its entrance');
  }
});
