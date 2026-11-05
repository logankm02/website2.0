/* eslint-disable react/no-unknown-property -- These elements use the React Three Fiber renderer. */
import { useMemo } from 'react';
import { BackSide, Color } from 'three';

const vertex = `varying vec3 direction;
void main() {
  direction = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;
const fragment = `uniform vec3 topColor; uniform vec3 horizonColor;
varying vec3 direction;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise2(vec2 p){
  vec2 i=floor(p), u=fract(p);u=u*u*(3.-2.*u);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),u.x),u.y);
}
float cloud(vec2 p){return noise2(p)*.53+noise2(p*2.06+9.)*.27+noise2(p*4.12-5.)*.14+noise2(p*8.17)*.06;}
void main(){
  vec3 ray=normalize(direction);float h=max(ray.y,0.);
  vec3 sky=mix(horizonColor,topColor,pow(h,.54));
  vec2 plane=ray.xz/(h+.12)*1.85;
  float density=cloud(plane);
  float cover=smoothstep(.54,.68,density)*smoothstep(.01,.12,h);
  vec3 clouds=mix(vec3(.70,.78,.88),vec3(.96,1.,1.),smoothstep(.55,.71,density+cloud(plane+vec2(-.13,.09))*.08));
  gl_FragColor=vec4(mix(sky,clouds,cover*.90),1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export default function GradientSky({top,horizon}) {
  const uniforms=useMemo(()=>({topColor:{value:new Color(top)},horizonColor:{value:new Color(horizon)}}),[top,horizon]);
  return <mesh renderOrder={-1}><sphereGeometry args={[550,28,18]} />
    <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} side={BackSide} depthWrite={false} />
  </mesh>;
}
