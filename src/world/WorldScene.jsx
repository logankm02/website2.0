/* eslint-disable react/no-unknown-property -- These elements use the React Three Fiber renderer. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Bloom, EffectComposer, SMAA } from '@react-three/postprocessing';
import { Box3, Vector3, Ray, DataTexture, FloatType, RGBAFormat, EquirectangularReflectionMapping, LinearFilter } from 'three';
import GradientSky from './GradientSky';
import Vegetation from './Vegetation';
import Traveler from './Traveler';
import { createCollisionWorld, stepPlayer } from './physics';
import { locationsForWorld } from './locations';
import { makeProbePixels } from './toonMaterial';

export default function WorldScene({ assets, quality, running, onNearest, onInteract, onPerformance, onSprintChange, mapRef, arrowRef, showGreeting, debug }) {
  const { camera, gl, scene } = useThree();
  const world = useMemo(() => createCollisionWorld(assets.manifest, assets.placements, assets.heights), [assets]);
  const locations = useMemo(() => locationsForWorld(assets.manifest), [assets]);
  const interior = Boolean(assets.manifest.interior);
  useEffect(() => {
    const probe = new DataTexture(makeProbePixels(128,64,interior),128,64,RGBAFormat,FloatType);
    probe.mapping = EquirectangularReflectionMapping;
    probe.magFilter = probe.minFilter = LinearFilter;
    probe.needsUpdate = true;
    scene.environment = probe;
    scene.environmentIntensity = interior ? .43 : .48;
    return () => { scene.environment = null; probe.dispose(); };
  }, [scene, interior]);
  const [spawnX, spawnY] = assets.manifest.spawn;
  const player = useRef({ x: spawnX, y: world.height(spawnX, -spawnY), z: -spawnY, vx: 0, vz: 0, vy: 0, speed: 0, grounded: true });
  const campus = Boolean(assets.manifest.campus);
  const glade = assets.manifest.campus === 'berkeley';
  const focusHeight = interior ? 1.3 : glade ? 3.7 : campus ? 4.6 : 2.25;
  const initialDistance = interior ? 6.2 : glade ? 10.5 : campus ? 17 : 14;
  const initialPitch = assets.manifest.arrivalPitch ?? (interior ? .2 : .23);
  const input = useRef(new Set()), orbit = useRef({ yaw: assets.manifest.arrivalYaw ?? (assets.manifest.campus ? -.46 : .08), pitch: initialPitch, distance: initialDistance, dragging: false });
  const accumulator = useRef(0), updates = useRef(0), nearest = useRef(null), sun = useRef(), sprinting = useRef(false);
  const refs = useRef({ running, onNearest, onInteract, onPerformance, onSprintChange }); refs.current = { running, onNearest, onInteract, onPerformance, onSprintChange };
  const cameraState = useMemo(() => ({ target: new Vector3(), ideal: new Vector3(), direction: new Vector3(), ray: new Ray(), hit: new Vector3(), boxes: world.boxes.map(b => new Box3(new Vector3(b.x - b.hx, b.minY, b.z - b.hz), new Vector3(b.x + b.hx, b.maxY, b.z + b.hz))) }), [world]);
  useEffect(() => {
    assets.world.scene.traverse(o => { if (o.isMesh) { o.castShadow = !/Terrain|water/.test(o.name); o.receiveShadow = true; } });
    const { yaw, pitch } = orbit.current;
    const previousFov = camera.fov;
    if (glade) { camera.fov = 60; camera.updateProjectionMatrix(); }
    const targetY = world.height(spawnX, -spawnY) + focusHeight;
    const horizontal = Math.cos(pitch) * initialDistance;
    camera.position.set(spawnX + Math.sin(yaw) * horizontal, targetY + Math.sin(pitch) * initialDistance, -spawnY + Math.cos(yaw) * horizontal);
    camera.lookAt(spawnX, targetY, -spawnY);
    return () => { camera.fov = previousFov; camera.updateProjectionMatrix(); };
  }, [assets, camera, world, spawnX, spawnY, initialDistance, focusHeight, glade]);
  useEffect(() => {
    const canvas = gl.domElement; canvas.tabIndex = 0; canvas.setAttribute('aria-label', 'Explorable village. WASD to move, Shift to run, click then move the mouse to look, E to interact.');
    const clear = () => { input.current.clear(); orbit.current.dragging = false; };
    const keydown = e => {
      if (!refs.current.running || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyE','Escape'].includes(e.code)) e.preventDefault();
      if (e.code === 'Escape') { clear(); document.exitPointerLock?.(); return; }
      if (e.code === 'KeyE' && !e.repeat && nearest.current) { clear(); document.exitPointerLock?.(); refs.current.onInteract(nearest.current); return; }
      input.current.add(e.code);
    };
    const keyup = e => input.current.delete(e.code);
    const down = e => {
      if (!refs.current.running || e.button !== 0) return;
      canvas.focus();
      if (canvas.requestPointerLock) canvas.requestPointerLock();
      else { orbit.current.dragging = true; canvas.setPointerCapture(e.pointerId); }
    };
    const move = e => { if (refs.current.running && (orbit.current.dragging || document.pointerLockElement === canvas)) { orbit.current.yaw -= e.movementX * .003; orbit.current.pitch = Math.max(-.35, Math.min(.9, orbit.current.pitch + e.movementY * .0025)); } };
    const up = () => { orbit.current.dragging = false; };
    const lockError = () => { orbit.current.dragging = true; };
    const wheel = e => { e.preventDefault(); orbit.current.distance = Math.max(3.5, Math.min(interior ? 11 : 24, orbit.current.distance + e.deltaY * .008)); };
    const blur = () => { clear(); };
    const visibility = () => { if (document.hidden) blur(); };
    window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', visibility); document.addEventListener('pointerlockerror', lockError);
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('wheel', wheel, { passive: false });
    return () => { clear(); document.exitPointerLock?.(); window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); document.removeEventListener('pointerlockerror', lockError); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('wheel', wheel); };
  }, [gl, interior]);
  useEffect(() => { if (!running) { input.current.clear(); player.current.vx = 0; player.current.vz = 0; player.current.speed = 0; if (sprinting.current) { sprinting.current = false; onSprintChange(false); } document.exitPointerLock?.(); } }, [running, onSprintChange]);
  const performance = useRef({ elapsed: 0, frames: 0, warmup: 0 });
  useFrame((_, delta) => {
    const p = player.current, o = orbit.current, c = cameraState;
    if (running) {
      accumulator.current = Math.min(accumulator.current + delta, .1);
      while (accumulator.current >= 1 / 60) { stepPlayer(p, input.current, o.yaw, world, 1 / 60); accumulator.current -= 1 / 60; }
      if (Boolean(p.sprinting) !== sprinting.current) { sprinting.current = Boolean(p.sprinting); refs.current.onSprintChange(sprinting.current); }
    }
    c.target.set(p.x, p.y + focusHeight, p.z);
    c.direction.set(Math.sin(o.yaw) * Math.cos(o.pitch), Math.sin(o.pitch), Math.cos(o.yaw) * Math.cos(o.pitch));
    let distance = o.distance; c.ray.set(c.target, c.direction);
    for (const box of c.boxes) if (c.ray.intersectBox(box, c.hit)) distance = Math.min(distance, Math.max(.8, c.hit.distanceTo(c.target) - .3));
    for (let d = .5; d < distance; d += .3) { c.ideal.copy(c.target).addScaledVector(c.direction, d); if (c.ideal.y < world.height(c.ideal.x, c.ideal.z) + .35) { distance = Math.max(.8, d - .3); break; } }
    c.ideal.copy(c.target).addScaledVector(c.direction, distance);
    if (interior) c.ideal.y = Math.min(c.ideal.y, assets.manifest.ceilingHeight - .25);
    camera.position.lerp(c.ideal, 1 - Math.exp(-9 * Math.min(delta, .1))); camera.lookAt(c.target);
    if (sun.current) { sun.current.position.set(p.x - 30, p.y + 55, p.z + 25); sun.current.target.position.set(p.x, p.y, p.z); sun.current.target.updateMatrixWorld(); }
    updates.current += delta;
    if (updates.current > .2) {
      updates.current = 0;
      if (mapRef.current && arrowRef.current) {
        const radius = interior ? 8 : 26;
        mapRef.current.setAttribute('viewBox', `${p.x - radius} ${p.z - radius} ${2 * radius} ${2 * radius}`);
        arrowRef.current.setAttribute('transform', `translate(${p.x} ${p.z}) rotate(${-o.yaw * 180 / Math.PI})`);
      }
      const closest = locations.filter(l => l.position).map(l => ({ l, d: Math.hypot(l.position[0] - p.x, l.position[2] - p.z) })).filter(v => v.d < (v.l.radius || 3.3)).sort((a,b) => a.d - b.d)[0]?.l || null;
      if (closest?.id !== nearest.current?.id) { nearest.current = closest; refs.current.onNearest(closest); }
      if (debug) debug.current = { x: p.x, y: p.y, z: p.z, ground: world.height(p.x,p.z), speed: p.speed, fps: Math.round(1 / Math.max(delta, .001)), calls: gl.info.render.calls, triangles: gl.info.render.triangles, nearest: closest?.id || '-' };
    }
    const perf = performance.current; perf.elapsed += delta; perf.warmup += delta; perf.frames++;
    if (perf.elapsed > 5) { if (perf.warmup > 8) refs.current.onPerformance(perf.frames / perf.elapsed); perf.elapsed = 0; perf.frames = 0; }
  });
  return <>
    <color attach="background" args={[interior ? '#343b3f' : '#eef6ff']} />
    {interior ? <>
      <ambientLight intensity={.75} color="#fff4e3" />
      <pointLight position={[-2.5, 3.9, 0]} intensity={31} color="#fff4dd" distance={22} />
      <pointLight position={[2.5, 3.9, -2]} intensity={31} color="#e5eeff" distance={22} />
    </> : <>
    <fogExp2 attach="fog" args={['#bfd9e5', .0028]} />
    <GradientSky top="#3f82d9" horizon="#eef6ff" />
    <hemisphereLight args={['#c6e2fa', '#9d9b77', 1.03]} />
    <directionalLight ref={sun} castShadow={quality !== 'low'} intensity={2.55} color="#ffedcf" position={[-30,55,25]} shadow-mapSize={[2048, 2048]} shadow-camera-left={-32} shadow-camera-right={32} shadow-camera-top={32} shadow-camera-bottom={-32} shadow-camera-near={1} shadow-camera-far={120} shadow-bias={-.00015} shadow-normalBias={.04} />
    </>}
    {showGreeting && <Html center position={[-4.3, world.height(-4.3,9.6) + 2.3, 9.6]} zIndexRange={[2,1]} style={{ pointerEvents: 'none' }}>
      <span className="world-greeting">New in town?</span>
    </Html>}
    <primitive object={assets.world.scene} />
    {!interior && <Vegetation assets={assets} quality={quality} player={player} />}
    <Traveler asset={assets.traveler} player={player} contactShadow={interior} />
    {!interior && !assets.manifest.campus && <Traveler asset={assets.resident} residentIndex={2} position={[-4.3, world.height(-4.3,9.6), 9.6]} />}
    {interior && assets.resident && locations.filter(l => l.kind === 'Talk' && l.position).map((l,i) =>
      <Traveler key={l.id} asset={assets.resident} residentIndex={i} position={l.position} contactShadow />)}
    {quality !== 'low' && <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={1.15} intensity={.13} mipmapBlur />
      <SMAA />
    </EffectComposer>}
  </>;
}
