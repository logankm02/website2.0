import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldShowIntro,introEase,introFlightPoint,introLens} from './intro.js';
import {resolveWorldRoute} from './worldRoute.js';

test('the welcome appears only at the start of a visit, never as a replay',()=>{
  assert.equal(shouldShowIntro(resolveWorldRoute(''),'',false),true);
  assert.equal(shouldShowIntro(resolveWorldRoute(''),'',true),false);
  assert.equal(shouldShowIntro(resolveWorldRoute('?intro=1'),'',true),false);
});
test('room exits, campuses and field-guide deep links bypass the opening',()=>{
  for(const query of ['?from=education','?from=experience','?interior=projects','?campus=berkeley','?campus=rochester']){
    assert.equal(shouldShowIntro(resolveWorldRoute(query),'',false),false);
  }
  assert.equal(shouldShowIntro(resolveWorldRoute(''),'#guide/resume',false),false);
});
test('camera flight eases from rest and reaches the exact follow position',()=>{
  assert.equal(introEase(0),0);assert.equal(introEase(1),1);
  assert.ok(introEase(.001)<.000001);
  let before=0;
  for(let i=1;i<=100;i++){const t=introEase(i/100);assert.ok(t>=before&&t<=1);before=t;}
});

test('cinematic arc joins the follow camera without a positional or lens jump',()=>{
  const from=[30,32,70],to=[0,8,24];
  assert.deepEqual(introFlightPoint(from,to,0),from);
  assert.deepEqual(introFlightPoint(from,to,1),to);
  assert.equal(introLens(0,48),48);assert.equal(introLens(1,48),48);
  for(let t=0;t<=1;t+=.01){
    const point=introFlightPoint(from,to,t);
    assert.ok(point.every(Number.isFinite));
    assert.ok(point[1]>=to[1]&&point[2]>=to[2],'no undershoot into the ground or beyond the player');
  }
  const near=introFlightPoint(from,to,.999);
  assert.ok(Math.hypot(...near.map((v,i)=>v-to[i]))<.00001,'soft landing');
});
