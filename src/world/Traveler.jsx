/* eslint-disable react/no-unknown-property -- These elements use the React Three Fiber renderer. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AnimationMixer, MathUtils } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export default function Traveler({ asset, player, position }) {
  const root = useRef(), current = useRef('');
  const model = useMemo(() => {
    const scene = clone(asset.scene), mixer = new AnimationMixer(scene), actions = {};
    scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    asset.animations.forEach(clip => { actions[clip.name] = mixer.clipAction(clip); });
    return { scene, mixer, actions };
  }, [asset]);
  useEffect(() => () => { model.mixer.stopAllAction(); model.mixer.uncacheRoot(model.scene); }, [model]);
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
      next?.reset().fadeIn(.2).play(); previous?.fadeOut(.2); current.current = state;
    }
    const action = model.actions[state];
    if (action) action.timeScale = state === 'Idle' ? 1 : MathUtils.clamp((p?.speed || 0) / (state === 'Run' ? 4.5 : 2.2), .6, 1.7);
    model.mixer.update(Math.min(delta, .06));
  });
  return <group ref={root} position={position} rotation={position ? [0, Math.PI, 0] : undefined}><primitive object={model.scene} /></group>;
}
