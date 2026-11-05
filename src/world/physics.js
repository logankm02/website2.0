// Coordinate boundary: Blender Z-up -> Three.js Y-up, forward toward -Z.
export function groundHeight(terrain, samples, x, z) {
  const { size, resolution: n, minX, minY } = terrain;
  const step = size / (n - 1);
  const gx = Math.max(0, Math.min(n - 1.001, (x - minX) / step));
  const gy = Math.max(0, Math.min(n - 1.001, (-z - minY) / step));
  const ix = Math.floor(gx), iy = Math.floor(gy), tx = gx - ix, ty = gy - iy;
  const a = samples[iy * n + ix], b = samples[iy * n + ix + 1];
  const c = samples[(iy + 1) * n + ix], d = samples[(iy + 1) * n + ix + 1];
  // Same diagonal as the Blender terrain triangles (not a different bilinear surface).
  return tx > ty ? a + (b - a) * tx + (d - b) * ty : a + (d - c) * tx + (c - a) * ty;
}

export function createCollisionWorld(manifest, placements, heights) {
  const boxes = manifest.landmarks.map(l => ({ x: l.center[0], z: -l.center[1], hx: l.half[0], hz: l.half[1], minY: l.center[2], maxY: l.center[2] + l.half[2] + 4 }));
  boxes.push(...manifest.collision);
  const circles = [];
  for (const g of manifest.groups) {
    if (!g.kind.startsWith('tree') && !g.kind.startsWith('rock')) continue;
    for (let i = 0; i < g.count; i++) {
      const k = (g.offset + i) * 5, s = placements[k + 3];
      circles.push({ x: placements[k], z: -placements[k + 1], r: (g.kind.startsWith('tree') ? .52 : .9) * s });
    }
  }
  const height = (x, z) => groundHeight(manifest.terrain, heights, x, z);
  const bounds = manifest.bounds;
  const blocked = (x, z, r = .32) => {
    if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) return true;
    if (boxes.some(b => Math.abs(x - b.x) < b.hx + r && Math.abs(z - b.z) < b.hz + r)) return true;
    return circles.some(c => (x - c.x) ** 2 + (z - c.z) ** 2 < (r + c.r) ** 2);
  };
  return { height, blocked, boxes, circles };
}

export function stepPlayer(state, input, yaw, world, dt) {
  const forward = Number(input.has('KeyW') || input.has('ArrowUp')) - Number(input.has('KeyS') || input.has('ArrowDown'));
  const side = Number(input.has('KeyD') || input.has('ArrowRight')) - Number(input.has('KeyA') || input.has('ArrowLeft'));
  const magnitude = Math.hypot(forward, side) || 1;
  const sprintHeld = input.has('ShiftLeft') || input.has('ShiftRight');
  const speed = sprintHeld ? 6.0 : 3.0;
  state.sprinting = sprintHeld && (forward !== 0 || side !== 0);
  const targetX = (-Math.sin(yaw) * forward + Math.cos(yaw) * side) / magnitude * speed;
  const targetZ = (-Math.cos(yaw) * forward - Math.sin(yaw) * side) / magnitude * speed;
  const blend = 1 - Math.exp(-14 * dt);
  state.vx += (targetX - state.vx) * blend; state.vz += (targetZ - state.vz) * blend;
  const before = world.height(state.x, state.z);
  const canStep = (x, z) => {
    if (world.blocked(x, z)) return false;
    const h = world.height(x, z);
    const slope = Math.hypot(world.height(x + .15, z) - world.height(x - .15, z), world.height(x, z + .15) - world.height(x, z - .15)) / .3;
    return h - before < .28 && (slope < 1.0 || h < before);
  };
  const nx = state.x + state.vx * dt;
  if (canStep(nx, state.z)) state.x = nx; else state.vx = 0;
  const nz = state.z + state.vz * dt;
  if (canStep(state.x, nz)) state.z = nz; else state.vz = 0;
  const ground = world.height(state.x, state.z);
  if (state.grounded && Math.abs(ground - state.y) < .28) { state.y = ground; state.vy = 0; }
  else { state.vy -= 18 * dt; state.y += state.vy * dt; }
  if (state.y <= ground) { state.y = ground; state.vy = 0; state.grounded = true; }
  else state.grounded = state.y - ground < .04;
  state.speed = Math.hypot(state.vx, state.vz);
}
