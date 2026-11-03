/* eslint-disable react/no-unknown-property -- These elements use the React Three Fiber renderer. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Sky } from '@react-three/drei';
import { Box3, Vector3, Ray } from 'three';
import Vegetation from './Vegetation';
import Traveler from './Traveler';
import { createCollisionWorld, stepPlayer } from './physics';
import { locationsForWorld } from './locations';

export default function WorldScene({ assets, quality, running, onNearest, onInteract, onPause, onPerformance, mapRef, arrowRef, showGreeting, debug }) {
  const { camera, gl } = useThree();
  const world = useMemo(() => createCollisionWorld(assets.manifest, assets.placements, assets.heights), [assets]);
  const locations = locationsForWorld(assets.manifest);
  const interior = Boolean(assets.manifest.interior);
  const [spawnX, spawnY] = assets.manifest.spawn;
  const player = useRef({ x: spawnX, y: world.height(spawnX, -spawnY), z: -spawnY, vx: 0, vz: 0, vy: 0, speed: 0, grounded: true });
  const isCity = !assets.manifest.campus && !interior;
  const initialDistance = isCity ? 11.5 : 3.2;
  const initialPitch = isCity ? .43 : .27;
  const input = useRef(new Set()), orbit = useRef({ yaw: assets.manifest.arrivalYaw ?? .08, pitch: initialPitch, distance: initialDistance, dragging: false });
  const accumulator = useRef(0), updates = useRef(0), nearest = useRef(null), sun = useRef();
  const refs = useRef({ running, onNearest, onInteract, onPause, onPerformance }); refs.current = { running, onNearest, onInteract, onPause, onPerformance };
  const cameraState = useMemo(() => ({ target: new Vector3(), ideal: new Vector3(), direction: new Vector3(), ray: new Ray(), hit: new Vector3(), boxes: world.boxes.map(b => new Box3(new Vector3(b.x - b.hx, b.minY, b.z - b.hz), new Vector3(b.x + b.hx, b.maxY, b.z + b.hz))) }), [world]);
  useEffect(() => {
    assets.world.scene.traverse(o => { if (o.isMesh) { o.castShadow = !/Terrain|water/.test(o.name); o.receiveShadow = true; } });
    const { yaw, pitch } = orbit.current;
    const targetY = world.height(spawnX, -spawnY) + 1.3;
    const horizontal = Math.cos(pitch) * initialDistance;
    camera.position.set(spawnX + Math.sin(yaw) * horizontal, targetY + Math.sin(pitch) * initialDistance, -spawnY + Math.cos(yaw) * horizontal);
    camera.lookAt(spawnX, targetY, -spawnY);
  }, [assets, camera, world, spawnX, spawnY, initialDistance]);
  useEffect(() => {
    const canvas = gl.domElement; canvas.tabIndex = 0; canvas.setAttribute('aria-label', 'Explorable village. WASD to move, Shift to run, drag to look, E to interact, Escape to pause.');
    const clear = () => { input.current.clear(); orbit.current.dragging = false; };
    const keydown = e => {
      if (!refs.current.running || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyE','Escape'].includes(e.code)) e.preventDefault();
      if (e.code === 'Escape') { clear(); document.exitPointerLock?.(); refs.current.onPause(); return; }
      if (e.code === 'KeyE' && !e.repeat && nearest.current) { clear(); document.exitPointerLock?.(); refs.current.onInteract(nearest.current); return; }
      input.current.add(e.code);
    };
    const keyup = e => input.current.delete(e.code);
    const down = e => { if (refs.current.running && e.button === 0) { orbit.current.dragging = true; canvas.setPointerCapture(e.pointerId); canvas.focus(); } };
    const move = e => { if (refs.current.running && (orbit.current.dragging || document.pointerLockElement === canvas)) { orbit.current.yaw -= e.movementX * .003; orbit.current.pitch = Math.max(.08, Math.min(.9, orbit.current.pitch + e.movementY * .0025)); } };
    const up = () => { orbit.current.dragging = false; };
    const wheel = e => { e.preventDefault(); orbit.current.distance = Math.max(3, Math.min(isCity ? 20 : 9, orbit.current.distance + e.deltaY * .008)); };
    const blur = () => { clear(); refs.current.onPause(); };
    const visibility = () => { if (document.hidden) blur(); };
    window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('wheel', wheel, { passive: false });
    return () => { clear(); window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('wheel', wheel); };
  }, [gl, isCity]);
  useEffect(() => { if (!running) { input.current.clear(); player.current.vx = 0; player.current.vz = 0; player.current.speed = 0; } }, [running]);
  const performance = useRef({ elapsed: 0, frames: 0, warmup: 0 });
  useFrame((_, delta) => {
    const p = player.current, o = orbit.current, c = cameraState;
    if (running) {
      accumulator.current = Math.min(accumulator.current + delta, .1);
      while (accumulator.current >= 1 / 60) { stepPlayer(p, input.current, o.yaw, world, 1 / 60); accumulator.current -= 1 / 60; }
    }
    c.target.set(p.x, p.y + 1.3, p.z);
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
    <color attach="background" args={[interior ? '#343b3f' : '#bcd5e4']} />
    {interior ? <>
      <ambientLight intensity={1.2} color="#fff4e3" />
      <pointLight position={[-2.5, 3.9, 0]} intensity={45} color="#fff4dd" distance={22} />
      <pointLight position={[2.5, 3.9, -2]} intensity={45} color="#e5eeff" distance={22} />
    </> : <>
    <fog attach="fog" args={['#bdd5df', 100, 480]} />
    <Sky distance={450000} sunPosition={[-30, 60, 25]} turbidity={3} rayleigh={.6} mieCoefficient={.003} mieDirectionalG={.8} />
    <hemisphereLight args={['#d8efff', '#687942', 1.8]} />
    <directionalLight ref={sun} castShadow={quality !== 'low'} intensity={3.2} color="#fff1d4" position={[-30,55,25]} shadow-mapSize={[quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024]} shadow-camera-left={-32} shadow-camera-right={32} shadow-camera-top={32} shadow-camera-bottom={-32} shadow-camera-near={1} shadow-camera-far={120} shadow-bias={-.00015} shadow-normalBias={.04} />
    </>}
    {showGreeting && <Html center position={[-4.3, world.height(-4.3,9.6) + 2.3, 9.6]} zIndexRange={[2,1]} style={{ pointerEvents: 'none' }}>
      <span className="world-greeting">New in town?</span>
    </Html>}
    <primitive object={assets.world.scene} />
    {!interior && <Vegetation assets={assets} quality={quality} player={player} />}
    <Traveler asset={assets.traveler} player={player} />
    {!interior && !assets.manifest.campus && <Traveler asset={assets.traveler} position={[-4.3, world.height(-4.3,9.6), 9.6]} />}
  </>;
}
