import test from 'node:test';
import assert from 'node:assert/strict';
import {locomotion} from './locomotion.js';
import {stepPlayer} from './physics.js';
import {routeMotion} from './campusLife.js';
import {readFileSync} from 'node:fs';
test('walk/run/stop transitions keep continuous phase and normalized weights at 30, 60 and 120 fps',()=>{
  for(const fps of [30,60,120]){
    const p={x:0,y:0,z:0,vx:0,vz:0,vy:0,speed:0,distance:0,grounded:true},m={};
    let previous={phase:0,run:0};
    for(let frame=0;frame<fps*8;frame++){
      const time=frame/fps;
      const keys=new Set(time<1||time>7?[]:time<3||time>6?['KeyW']:['KeyW','ShiftLeft']);
      stepPlayer(p,keys,0,{height:()=>0,blocked:()=>false},1/fps);
      const b=locomotion(m,p,1/fps);
      assert.ok(Math.abs(b.walk+b.run+b.idle-1)<1e-9);
      assert.ok(Math.abs(b.run-previous.run)<.12,'no blend pop');
      const advance=(b.phase-previous.phase+1)%1;
      assert.ok(advance<.085,'no phase reset during a change of gait');
      previous=b;
    }
    assert.ok(previous.idle>.99,'settled to idle');
  }
});
test('blocked movement never advances the foot cycle',()=>{
  const p={x:0,y:0,z:0,vx:0,vz:0,vy:0,speed:0,distance:0,grounded:true},m={phase:.31};
  for(let i=0;i<120;i++){
    stepPlayer(p,new Set(['KeyW','ShiftLeft']),0,{height:()=>0,blocked:()=>true},1/60);
    locomotion(m,p,1/60);
  }
  assert.equal(m.phase,.31);
});
for(const campus of ['rochester','berkeley'])test(campus+': student routes stay on clear walks, readers have seats, conversations have people',()=>{
  const m=JSON.parse(readFileSync(new URL('../../public/world/campuses/'+campus+'/manifest.json',import.meta.url)));
  const solid=[...m.collision,...m.landmarks.map(b=>({x:b.center[0],z:-b.center[1],hx:b.half[0],hz:b.half[1]}))];
  for(const person of m.people){
    if(person.route){
      for(let t=0;t<190;t+=.25){
        const p=routeMotion(person.route,person.phase,person.speed,t);
        assert.ok(!solid.some(b=>Math.abs(p.x-b.x)<b.hx+.2&&Math.abs(p.z-b.z)<b.hz+.2),person.id+' clears furnishings');
      }
    }else if(person.behavior==='seated'){
      assert.ok(m.collision.some(b=>Math.abs(person.position[0]-b.x)<.1&&Math.abs(person.position[2]-b.z)<.1),'reader on bench');
    }else{
      assert.ok(m.locations.some(l=>l.id==='student-'+person.id&&JSON.stringify(l.position)===JSON.stringify(person.position)));
    }
  }
});
