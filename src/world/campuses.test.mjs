import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createCollisionWorld, stepPlayer } from './physics.js';
const root = new URL('../../public/world/', import.meta.url);
const floats = path => { const b=readFileSync(new URL(path,root)); return new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)); };
for (const campus of ['rochester','berkeley']) {
  const m=JSON.parse(readFileSync(new URL(`campuses/${campus}/manifest.json`,root)));
  const world=createCollisionWorld(m,floats(m.placements),floats(m.heightmap));
  test(`${campus}: complete local assets, clear spawn, connected landmarks and directory return`,()=>{
    for(const path of [m.world,m.placements,m.heightmap,...m.assets.flatMap(a=>[a.url,...(a.lodUrl?[a.lodUrl]:[])])])assert.ok(existsSync(new URL(path,root)),path);
    const [sx,sy]=m.spawn; assert.equal(world.blocked(sx,-sy),false);
    const queue=[[Math.round(sx/.6),Math.round(-sy/.6)]],seen=new Set();
    for(let i=0;i<queue.length;i++){
      const [ix,iz]=queue[i],key=ix+','+iz;
      if(seen.has(key)||world.blocked(ix*.6,iz*.6))continue;
      seen.add(key);
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([ix+dx,iz+dz]);
    }
    for(const l of m.locations.filter(l=>l.position))assert.ok([...seen].some(k=>{const [ix,iz]=k.split(',').map(Number);return Math.hypot(ix*.6-l.position[0],iz*.6-l.position[2])<1.2;}),l.label+' reachable');
    const p={x:sx,y:world.height(sx,-sy),z:-sy,vx:0,vz:0,vy:0,grounded:true};
    for(let i=0;i<120;i++)stepPlayer(p,new Set(['KeyW']),m.arrivalYaw,world,1/60);
    assert.ok(Math.hypot(p.x-sx,p.z+sy)>3,'walk in arrival direction');
    const back=m.locations.find(l=>l.id==='return');
    assert.equal(back.position,null,'return is a directory action, never a proximity trigger');
    assert.ok(back.links.some(link=>link.href==='/world'),'return to city');
  });
  if(campus==='berkeley')test('Berkeley: creek blocks walking, bridge and Sather Gate stay open',()=>{
    const gate=m.locations.find(l=>l.id==='Sather Gate');
    const x=gate.position[0],z=gate.position[2]+3;
    assert.ok(world.blocked(x+9,z),'creek blocks the bank-to-bank shortcut');
    for(let d=-4;d<=4;d+=.25)assert.equal(world.blocked(x,z+d),false,'walk through arch');
    const at=id=>m.landmarks.find(l=>l.id===id).center;
    assert.ok(at('DOE LIBRARY')[1]<0 && at('campanile')[0]>at('DOE LIBRARY')[0] && at('campanile')[1]<at('DOE LIBRARY')[1]);
    assert.ok(gate.position[2]>-at('campanile')[1]+20,'gate beyond south campus');
  });
}

test('Rochester side halls and Dewey present reachable entrances toward the quad',()=>{
  const m=JSON.parse(readFileSync(new URL('campuses/rochester/manifest.json',root)));
  const world=createCollisionWorld(m,floats(m.placements),floats(m.heightmap));
  for(const [name,inward] of [['BAUSCH & LOMB',[-1,0]],['MOREY HALL',[1,0]],['DEWEY HALL',[-1,0]],['LATTIMORE HALL',[1,0]]]){
    const hall=m.landmarks.find(l=>l.id===name);
    const dx=hall.door[0]-hall.center[0],dy=hall.door[1]-hall.center[1];
    assert.ok((dx*inward[0]+dy*inward[1])/Math.hypot(dx,dy)>.99,name+' faces the green');
    assert.equal(world.blocked(hall.door[0],-hall.door[1]),false,name+' doorstep is clear');
    const sign=m.locations.find(l=>l.id===name);
    assert.ok(Math.hypot(sign.position[0]-hall.door[0],sign.position[2]+hall.door[1])<.01,name+' interaction follows its entrance');
  }
});

test('Eastman: unbroken arrival axis and the correct sequence of hall pairs',()=>{
  const m=JSON.parse(readFileSync(new URL('campuses/rochester/manifest.json',root)));
  const world=createCollisionWorld(m,floats(m.placements),floats(m.heightmap));
  const hall=name=>m.landmarks.find(l=>l.id===name);
  const [sx,sy]=m.spawn, target=hall('RUSH RHEES LIBRARY');
  assert.ok(Math.abs(sx-target.center[0])<.5);
  for(let y=sy;y<target.door[1];y+=.25)assert.equal(world.blocked(sx,-y),false,'library promenade');
  for(const [near,far,side] of [['LATTIMORE HALL','MOREY HALL',-1],['DEWEY HALL','BAUSCH & LOMB',1]]){
    assert.equal(Math.sign(hall(near).center[0]),side);
    assert.equal(Math.sign(hall(far).center[0]),side);
    assert.ok(hall(near).center[1]<hall(far).center[1]);
  }
});
