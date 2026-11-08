import test from 'node:test';
import assert from 'node:assert/strict';
import { treeVisibility, treeFadeMaterial } from './treeVisibility.js';
import { MeshStandardMaterial, ShaderLib } from 'three';

const camera = {x:0,y:5,z:14}, target = {x:0,y:2,z:0}, radius = {x:3,y:5,z:3};
test('trees crossing the camera sight line fade, including a camera inside the canopy', () => {
  assert.equal(treeVisibility(camera,target,{x:0,y:4,z:7},radius),0);
  assert.equal(treeVisibility(camera,target,camera,radius),0);
});
test('trees beside the view, beyond the player, and behind the camera stay solid', () => {
  for (const center of [{x:8,y:4,z:7},{x:0,y:4,z:-9},{x:0,y:5,z:23}]) assert.equal(treeVisibility(camera,target,center,radius),1);
});
test('corridor edges blend continuously and degenerate sight lines remain finite', () => {
  const edge = treeVisibility(camera,target,{x:3,y:3.5,z:7},radius);
  assert.ok(edge > 0 && edge < 1);
  assert.equal(treeVisibility(camera,camera,camera,radius),0);
});
test('instanced fade preserves authored material shaders and leaves the source untouched', () => {
  const source = new MeshStandardMaterial();
  source.onBeforeCompile = shader => { shader.uniforms.original = {value:1}; };
  source.customProgramCacheKey = () => 'authored';
  const faded = treeFadeMaterial(source), shader = { ...ShaderLib.standard, uniforms:{} };
  faded.onBeforeCompile(shader);
  assert.equal(shader.uniforms.original.value,1);
  assert.match(shader.vertexShader,/vTreeCoverage = treeCoverage/);
  assert.match(shader.fragmentShader,/treeNoise > vTreeCoverage/);
  assert.equal(source.customProgramCacheKey(),'authored');
  assert.equal(faded.transparent,false);
});
