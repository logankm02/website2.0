// Keep the glTF's metal, roughness, emission and authored colors. The packed
// Blender texture supplies fine surface detail without a separate map per prop.
import { Color } from 'three';

export const windClock = { value: 0 };
export function updateWind(delta) { windClock.value += Math.min(delta, .1); }

function surfaceType(name) {
  if (/canvas|linen|upholstery|jacket|trousers|villager.*shirt|blanket/i.test(name)) return 'cloth';
  if (/wood|oak|cherry|timber|bark|warm page/i.test(name)) return 'wood';
  if (/stone|travertine|masonry|brick|concrete|plaster|interior (walls|floor)|slate|terracotta|meadow with|mountain rock/i.test(name)) return 'stone';
  return '';
}

export function finishMaterial(material, atlas, kind) {
  if (new URLSearchParams(window.location.search).has('pbr')) return;
  const name = material.name;
  const surface = surfaceType(name);
  const water = /^(water\b|Court spring water)/i.test(name);
  const foliage = /varied foliage|meadow plant|ivy variegation/i.test(name);
  const wind = kind === 'grass' || kind.startsWith('flowers-');
  const skin = /skin|eye whites/i.test(name);
  if (water) {
    material.color.set('#41bab4');
    material.roughness = .19;
    material.metalness = .22;
  }
  if (/glass|glazing/i.test(name) && !/daylight/i.test(name)) {
    material.roughness = .20;
    material.metalness = Math.max(material.metalness, .31);
  }
  if (foliage) material.roughness = .82;
  if (!surface && !water && !foliage && !skin) return;
  const brick = /fired brick/i.test(name);
  const channel = surface === 'wood' ? 'g' : surface === 'cloth' ? 'b' : 'r';
  const scale = surface === 'cloth' ? 3.2 : surface === 'wood' ? .82 : .90;
  material.customProgramCacheKey = () => [surface,brick,water,wind,foliage,skin].join('/');
  material.onBeforeCompile = shader => {
    shader.uniforms.fieldAtlas = { value: atlas };
    shader.uniforms.fieldTime = windClock;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 fieldPoint; varying vec3 fieldAxis; uniform float fieldTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        fieldPoint = position;
        fieldAxis = normal;
        ${wind ? `#ifdef USE_INSTANCING
          vec2 root = instanceMatrix[3].xz;
          float gust = sin(dot(root,vec2(.43,.23)) + fieldTime*1.6) + .4*sin(dot(root,vec2(-.81,.52))-fieldTime*2.7);
          transformed.xz += vec2(.15,.07)*gust*pow(max(position.y,0.),1.6);
        #endif` : ''}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 fieldPoint; varying vec3 fieldAxis; uniform sampler2D fieldAtlas; uniform float fieldTime;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        ${surface ? `vec3 axis=abs(fieldAxis);
          vec2 plane = axis.y>max(axis.x,axis.z) ? fieldPoint.xz : axis.x>axis.z ? fieldPoint.zy : fieldPoint.xy;
          ${brick ? `vec2 bond=plane/vec2(.70,.26);
          bond.x += .5*mod(floor(bond.y),2.);
          vec2 edge=min(fract(bond),1.-fract(bond));
          vec2 filterWidth=max(fwidth(bond),vec2(.001));
          vec2 face=smoothstep(vec2(.014,.035)-filterWidth,vec2(.014,.035)+filterWidth,edge);
          float clay=fract(sin(dot(floor(bond),vec2(41.7,19.3)))*3593.27);
          diffuseColor.rgb = mix(vec3(.32,.255,.19),diffuseColor.rgb*(.85+.28*clay),face.x*face.y);` : ''}
          float grain=texture2D(fieldAtlas,plane*${scale.toFixed(2)}).${channel}-.5;
          diffuseColor.rgb *= 1.+grain*${surface === 'stone' ? '.33' : '.42'};` : ''}
        ${foliage ? 'diffuseColor.rgb *= vec3(.92,1.04,.88);' : ''}
        ${water ? `float wave=sin(dot(fieldPoint.xz,vec2(2.7,3.2))+fieldTime*1.35)+.55*sin(dot(fieldPoint.xz,vec2(-4.1,2.6))-fieldTime*1.1);
          diffuseColor.rgb+=vec3(.10,.19,.17)*smoothstep(1.24,1.55,wave);` : ''}`)
      .replace('#include <opaque_fragment>', `
        ${skin ? 'outgoingLight += vec3(.065,.031,.016)*pow(1.-abs(dot(normal,normalize(vViewPosition))),2.);' : ''}
        #include <opaque_fragment>`);
  };
}

export function makeProbePixels(width, height, indoor) {
  const data = new Float32Array(width*height*4);
  const sky = new Color(indoor ? '#e9e0c8' : '#9cc9ef');
  const floor = new Color(indoor ? '#66513d' : '#8b926b');
  for (let y=0; y<height; y++) {
    const elevation = Math.sin((y/height-.5)*Math.PI);
    for (let x=0; x<width; x++) {
      const heading = x/width*2*Math.PI;
      const blend = Math.min(1,Math.max(0,elevation*2.5+.55));
      const windowLight = Math.pow(Math.max(0,Math.cos(heading-.8)),indoor ? 14 : 30)
        * Math.exp(-Math.pow((elevation-.52)*4,2)) * (indoor ? 2.3 : 4);
      const offset = 4*(y*width+x);
      data[offset] = floor.r+(sky.r-floor.r)*blend+windowLight;
      data[offset+1] = floor.g+(sky.g-floor.g)*blend+windowLight*.88;
      data[offset+2] = floor.b+(sky.b-floor.b)*blend+windowLight*.65;
      data[offset+3] = 1;
    }
  }
  return data;
}
