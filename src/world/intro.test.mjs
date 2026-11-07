import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldShowIntro,introEase} from './intro.js';
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
