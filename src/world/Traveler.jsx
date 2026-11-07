/* eslint-disable react/no-unknown-property -- These elements use the React Three Fiber renderer. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AnimationMixer, MathUtils } from 'three';
import { locomotion } from './locomotion';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const jackets = ['#155678','#a14b32','#28796a','#69608a','#8c6636','#41615d'];
const caps = ['#4f887a','#434a6c','#ad7749','#638359'];
const skinTones = ['#c68a63','#a66949','#d8a381','#986244','#c5916b'];

export default function Traveler({ asset, player, position, residentIndex, observer, contactShadow, arrivalYaw = 0, behavior }) {
  const stationary = Boolean(position);
  const root = useRef(), motion = useRef({ phase: 0, speed: 0, near: false, greeting: Infinity });
  const model = useMemo(() => {
    const scene = clone(asset.scene), mixer = new AnimationMixer(scene), actions = {};
    const wardrobe = new Map();
    scene.traverse(o => {
      const look = /^Look_(\d+)$/.exec(o.name);
      if (look && residentIndex != null) o.visible = Number(look[1]) === residentIndex % 3;
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
  useEffect(() => {
    // Set initial heading only when this avatar changes. A fresh JSX rotation
    // array on every sprint/HUD update used to overwrite the smoothed heading.
    root.current.rotation.y = stationary && behavior !== 'seated' ? Math.PI + Math.sin(residentIndex ?? 0)*.28 : arrivalYaw;
  }, [model, stationary, residentIndex, behavior, arrivalYaw]);
  useEffect(() => {
    motion.current = { phase: 0, speed: 0, near: false, greeting: Infinity };
    for (const [name, action] of Object.entries(model.actions)) {
      action.reset().play(); action.paused = name !== (behavior === 'seated' ? 'Sit' : 'Idle');
      action.setEffectiveWeight(name === (behavior === 'seated' ? 'Sit' : 'Idle') ? 1 : 0);
    }
    const idle = model.actions.Idle;
    if (idle && residentIndex != null) {
      idle.time = (residentIndex * .83) % idle.getClip().duration;
      idle.timeScale = .91 + (residentIndex % 5) * .039;
    }
    return () => {
      model.mixer.stopAllAction();
      model.mixer.uncacheRoot(model.scene);
      model.wardrobe.forEach(m => m.dispose());
    };
  }, [model, residentIndex, behavior]);
  useFrame((_, delta) => {
    const p = player?.current;
    if (p && root.current) {
      root.current.position.set(p.x, p.y + .009, p.z);
      if (p.speed > .15) {
        const target = Math.atan2(-p.vx, -p.vz);
        const difference = Math.atan2(Math.sin(target - root.current.rotation.y), Math.cos(target - root.current.rotation.y));
        root.current.rotation.y += difference * (1 - Math.exp(-12 * delta));
      }
    }
    const dt = Math.min(delta, .10), m = motion.current, { Idle, Walk, Run, Greet } = model.actions;
    if (p && Walk && Run) {
      const blend = locomotion(m,p,dt);
      Walk.time = blend.phase * Walk.getClip().duration;
      Run.time = blend.phase * Run.getClip().duration;
      Walk.setEffectiveWeight(blend.walk); Run.setEffectiveWeight(blend.run);
      Idle?.setEffectiveWeight(blend.idle);
    } else if (behavior !== 'seated' && observer?.current && Greet && root.current) {
      const dx = observer.current.x - position[0], dz = observer.current.z - position[2];
      const distance = Math.hypot(dx, dz);
      if (!m.near && distance < 2.8) { m.near = true; m.greeting = 0; }
      else if (distance > 4.2) m.near = false;
      const target = m.near && distance > .08 ? Math.atan2(-dx, -dz) : Math.PI + Math.sin(residentIndex) * .28;
      const yaw = root.current.rotation.y;
      root.current.rotation.y += Math.atan2(Math.sin(target-yaw), Math.cos(target-yaw)) * (1-Math.exp(-4*dt));
      const duration = Greet.getClip().duration;
      m.greeting += dt; Greet.time = Math.min(duration, m.greeting);
      const weight = MathUtils.smoothstep(Greet.time, 0, .18) * (1-MathUtils.smoothstep(Greet.time, duration-.25, duration));
      Greet.setEffectiveWeight(weight); Idle?.setEffectiveWeight(1-weight);
    }
    model.mixer.update(dt);
  });
  return <group ref={root} position={position}><primitive object={model.scene} />
    {contactShadow && <mesh rotation={[-Math.PI/2,0,0]} position={[0,.045,0]}>
      <planeGeometry args={[1.05,.78]} />
      <shaderMaterial transparent depthWrite={false}
        vertexShader={'varying vec2 tc; void main(){tc=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}'}
        fragmentShader={'varying vec2 tc; void main(){float a=1.-smoothstep(.03,1.,length(2.*tc-1.));gl_FragColor=vec4(.095,.071,.055,a*a*.39);}'}
      />
    </mesh>}
  </group>;
}
