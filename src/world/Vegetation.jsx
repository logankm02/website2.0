/* eslint-disable react/no-unknown-property -- These elements use the React Three Fiber renderer. */
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, InstancedMesh, Matrix4, Vector3 } from 'three';
import { updateWind } from './toonMaterial';

function components(model) {
  model.scene.updateMatrixWorld(true);
  const result = [];
  model.scene.traverse(o => {
    if (o.isMesh) result.push({ geometry: o.geometry.clone().applyMatrix4(o.matrixWorld), material: o.material });
  });
  return result;
}
export default function Vegetation({ assets, quality, player }) {
  const generated = useMemo(() => {
    const root = new Group(), geometry = [], batches = [], trees = [];
    const temp = new Matrix4(), scale = new Matrix4();
    const set = (mesh, index, row) => {
      temp.makeRotationY(row[4]); temp.setPosition(row[0], row[2], -row[1]);
      scale.makeScale(row[3], row[3], row[3]); temp.multiply(scale); mesh.setMatrixAt(index, temp);
    };
    // The binary meadow predates the avenue. Use the same tile coordinates
    // as the Blender pavers so plants also clear newly relocated door walks.
    const paving = new Set();
    for (const [x, y, w, h] of assets.manifest.layout?.PATHS || []) {
      for (let i=x; i<x+w; i++) for (let j=y; j<y+h; j++) paving.add(i + ',' + j);
    }
    for (const asset of assets.library) {
      const group = assets.manifest.groups.find(g => g.kind === asset.kind);
      if (!group) continue;
      const rows = Array.from({ length: group.count }, (_, i) => assets.placements.subarray((group.offset + i) * 5, (group.offset + i) * 5 + 5));
      const high = components(asset.high), low = asset.low ? components(asset.low) : null;
      geometry.push(...high.map(x => x.geometry), ...(low || []).map(x => x.geometry));
      if (asset.kind.startsWith('tree')) {
        const make = parts => parts.map(part => { const mesh = new InstancedMesh(part.geometry, part.material, rows.length); mesh.count = 0; mesh.frustumCulled = false; mesh.castShadow = quality !== 'low'; mesh.receiveShadow = true; root.add(mesh); return mesh; });
        trees.push({ rows, high: make(high), low: make(low || high) });
      } else {
        const fountain = assets.manifest.fountain;
        const plant = asset.kind === 'grass' || asset.kind.startsWith('flowers');
        const cells = new Map();
        rows.forEach((row, i) => {
          if (plant && paving.size && paving.has(Math.floor(row[0]/2.4+12) + ',' + Math.floor(10.5-row[1]/2.4))) return;
          if (plant && fountain && Math.hypot(row[0]-fountain.x,-row[1]-fountain.z) < fountain.radius) return;
          if (plant && quality === 'low' && i % 3) return;
          const key = `${Math.floor(row[0] / 16)},${Math.floor(row[1] / 16)}`;
          if (!cells.has(key)) cells.set(key, []); cells.get(key).push(row);
        });
        for (const cell of cells.values()) {
          for (const part of high) {
            const mesh = new InstancedMesh(part.geometry, part.material, cell.length);
            cell.forEach((row, i) => set(mesh, i, row)); mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere(); mesh.receiveShadow = true; mesh.castShadow = !plant;
            root.add(mesh); if (plant) batches.push({ mesh, center: mesh.boundingSphere.center.clone() });
          }
        }
      }
    }
    return { root, geometry, batches, trees, set, clock: 0 };
  }, [assets, quality]);
  useEffect(() => () => { generated.root.traverse(o => { if (o.isInstancedMesh) o.dispose(); }); generated.geometry.forEach(g => g.dispose()); }, [generated]);
  useFrame((_, delta) => {
    updateWind(delta);
    generated.clock -= delta; if (generated.clock > 0) return; generated.clock = .35;
    const p = player.current;
    const distance = row => Math.hypot(row[0] - p.x, -row[1] - p.z);
    for (const tree of generated.trees) {
      let highCount = 0, lowCount = 0;
      for (const row of tree.rows) {
        const d = distance(row);
        if (d > 155) continue;
        const useHigh = quality === 'high' ? d < 42 : quality === 'balanced' && d < 23;
        const meshes = useHigh ? tree.high : tree.low, index = useHigh ? highCount++ : lowCount++;
        meshes.forEach(m => generated.set(m, index, row));
      }
      tree.high.forEach(m => { m.count = highCount; m.instanceMatrix.needsUpdate = true; });
      tree.low.forEach(m => { m.count = lowCount; m.instanceMatrix.needsUpdate = true; });
    }
    const center = new Vector3(p.x, p.y, p.z);
    const range = quality === 'high' ? 62 : quality === 'balanced' ? 46 : 30;
    generated.batches.forEach(b => { b.mesh.visible = b.center.distanceTo(center) < range; });
  });
  return <primitive object={generated.root} />;
}
