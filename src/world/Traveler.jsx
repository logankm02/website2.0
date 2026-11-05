/* eslint-disable react/no-unknown-property -- These elements use the React Three Fiber renderer. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AnimationMixer, MathUtils } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const jackets = ['#155678','#a14b32','#28796a','#69608a','#8c6636','#41615d'];
const caps = ['#4f887a','#434a6c','#ad7749','#638359'];
const skinTones = ['#c68a63','#a66949','#d8a381','#986244','#c5916b'];

export default function Traveler({ asset, player, position, residentIndex, contactShadow }) {
  const root = useRef(), current = useRef('');
  const model = useMemo(() => {
    const scene = clone(asset.scene), mixer = new AnimationMixer(scene), actions = {};
    const wardrobe = new Map();
    scene.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      if (residentIndex == null) return;
      const original = o.material;
      const palette = /field jacket/.test(original.name) ? jackets : /storm teal/.test(original.name) ? caps : /warm skin/.test(original.name) ? skinTones : null;
      if (!palette) return;
      if (!wardrobe.has(original)) {
        const variant = original.clone();
        variant.color.set(palette[residentIndex % palette.length]);
        variant.onBeforeCompile = original.onBeforeCompile;
        variant.customProgramCacheKey = original.customProgramCacheKey;
        wardrobe.set(original,variant);
      }
      o.material = wardrobe.get(original);
    });
    asset.animations.forEach(clip => { actions[clip.name] = mixer.clipAction(clip); });
    return { scene, mixer, actions, wardrobe };
  }, [asset, residentIndex]);
  useEffect(() => () => {
    model.mixer.stopAllAction();
    model.mixer.uncacheRoot(model.scene);
    model.wardrobe.forEach(m => m.dispose());
  }, [model]);
  useFrame((_, delta) => {
    const p = player?.current;
    if (p && root.current) {
      root.current.position.set(p.x, p.y + .025, p.z);
      if (p.speed > .15) {
        const target = Math.atan2(-p.vx, -p.vz);
        const difference = Math.atan2(Math.sin(target - root.current.rotation.y), Math.cos(target - root.current.rotation.y));
        root.current.rotation.y += difference * (1 - Math.exp(-12 * delta));
      }
    }
    const state = !p || p.speed < .15 ? 'Idle' : p.speed > 3.8 ? 'Run' : 'Walk';
    if (state !== current.current) {
      const previous = model.actions[current.current], next = model.actions[state];
      next?.reset().fadeIn(.2).play();
      if (next && residentIndex != null) next.time = residentIndex * .31 % next.getClip().duration;
      previous?.fadeOut(.2); current.current = state;
    }
    const action = model.actions[state];
    if (action) action.timeScale = state === 'Idle' ? 1 : MathUtils.clamp((p?.speed || 0) / (state === 'Run' ? 4.5 : 2.2), .6, 1.7);
    model.mixer.update(Math.min(delta, .06));
  });
  return <group ref={root} position={position} rotation={position ? [0, Math.PI + Math.sin(residentIndex ?? 0)*.28, 0] : undefined}><primitive object={model.scene} />
    {contactShadow && <mesh rotation={[-Math.PI/2,0,0]} position={[0,.045,0]}>
      <planeGeometry args={[1.05,.78]} />
      <shaderMaterial transparent depthWrite={false}
        vertexShader={'varying vec2 tc; void main(){tc=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}'}
        fragmentShader={'varying vec2 tc; void main(){float a=1.-smoothstep(.03,1.,length(2.*tc-1.));gl_FragColor=vec4(.095,.071,.055,a*a*.39);}'}
      />
    </mesh>}
  </group>;
}
