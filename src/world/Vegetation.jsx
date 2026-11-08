/* eslint-disable react/no-unknown-property -- These elements use the React Three Fiber renderer. */
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box3, DynamicDrawUsage, Group, InstancedBufferAttribute, InstancedMesh, Matrix4, Vector3 } from 'three';
import { updateWind } from './toonMaterial';
import { treeVisibility, treeFadeMaterial } from './treeVisibility';

function components(model) {
  model.scene.updateMatrixWorld(true);
  const result = [];
  model.scene.traverse(o => {
    if (o.isMesh) result.push({ geometry: o.geometry.clone().applyMatrix4(o.matrixWorld), material: o.material });
  });
  return result;
}
export default function Vegetation({ assets, quality, player, focus, clearView }) {
  const generated = useMemo(() => {
    const root = new Group(), geometry = [], materials = [], batches = [], trees = [];
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
        const bounds = new Box3();
        high.forEach(part => { part.geometry.computeBoundingBox(); bounds.union(part.geometry.boundingBox); });
        const localCenter = bounds.getCenter(new Vector3()), size = bounds.getSize(new Vector3());
        const centers = rows.map(row => new Vector3(
          row[0] + (localCenter.x * Math.cos(row[4]) + localCenter.z * Math.sin(row[4])) * row[3],
          row[2] + localCenter.y * row[3],
          -row[1] + (-localCenter.x * Math.sin(row[4]) + localCenter.z * Math.cos(row[4])) * row[3]));
        const radii = rows.map(row => new Vector3(Math.max(size.x,size.z) * row[3] * .5 + 1.1,
          size.y * row[3] * .5 + .5, Math.max(size.x,size.z) * row[3] * .5 + 1.1));
        const make = parts => parts.map(part => {
          // LODs have independent instance ordering, so coverage attributes must
          // belong to their own geometry even when both use the same source.
          const geom = part.geometry.clone(); geometry.push(geom);
          geom.setAttribute('treeCoverage', new InstancedBufferAttribute(new Float32Array(rows.length).fill(1), 1).setUsage(DynamicDrawUsage));
          const material = treeFadeMaterial(part.material); materials.push(material);
          const mesh = new InstancedMesh(geom, material, rows.length);
          mesh.instanceMatrix.setUsage(DynamicDrawUsage);
          mesh.count = 0; mesh.frustumCulled = false;
          mesh.castShadow = quality !== 'low'; mesh.receiveShadow = true; root.add(mesh); return mesh;
        });
        trees.push({ rows, centers, radii, coverage: new Float32Array(rows.length).fill(1), highIndices: [], lowIndices: [], high: make(high), low: make(low || high) });
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
    return { root, geometry, materials, batches, trees, set, clock: 0, head: new Vector3(), center: new Vector3() };
  }, [assets, quality]);
  useEffect(() => () => { generated.root.traverse(o => { if (o.isInstancedMesh) o.dispose(); }); generated.geometry.forEach(g => g.dispose()); generated.materials.forEach(m => m.dispose()); }, [generated]);
  useFrame(({ camera }, delta) => {
    updateWind(delta);
    const p = player.current;
    generated.head.set(p.x, p.y + 1.25, p.z);
    for (const tree of generated.trees) {
      for (let i = 0; i < tree.rows.length; i++) {
        const target = clearView ? Math.min(treeVisibility(camera.position, generated.head, tree.centers[i], tree.radii[i]),
          treeVisibility(camera.position, focus, tree.centers[i], tree.radii[i])) : 1;
        const rate = target < tree.coverage[i] ? 12 : 4;
        tree.coverage[i] += (target - tree.coverage[i]) * (1 - Math.exp(-rate * Math.min(delta, .1)));
      }
    }
    generated.clock -= delta;
    const updateInstances = generated.clock <= 0;
    if (updateInstances) generated.clock = .35;
    const distance = row => Math.hypot(row[0] - p.x, -row[1] - p.z);
    for (const tree of generated.trees) {
      if (updateInstances) {
        tree.highIndices.length = 0; tree.lowIndices.length = 0;
        let highCount = 0, lowCount = 0;
        for (let rowIndex = 0; rowIndex < tree.rows.length; rowIndex++) {
          const row = tree.rows[rowIndex];
          const d = distance(row);
          if (d > 155) continue;
          const useHigh = quality === 'high' ? d < 42 : quality === 'balanced' && d < 23;
          const meshes = useHigh ? tree.high : tree.low, index = useHigh ? highCount++ : lowCount++;
          (useHigh ? tree.highIndices : tree.lowIndices).push(rowIndex);
          meshes.forEach(m => generated.set(m, index, row));
        }
        tree.high.forEach(m => { m.count = highCount; m.instanceMatrix.needsUpdate = true; });
        tree.low.forEach(m => { m.count = lowCount; m.instanceMatrix.needsUpdate = true; });
      }
      for (const [meshes, indices] of [[tree.high, tree.highIndices], [tree.low, tree.lowIndices]]) {
        for (const mesh of meshes) {
          const attribute = mesh.geometry.getAttribute('treeCoverage');
          indices.forEach((rowIndex, index) => { const value = tree.coverage[rowIndex]; attribute.array[index] = value < .003 ? 0 : value > .997 ? 1 : value; });
          attribute.needsUpdate = true;
        }
      }
    }
    if (!updateInstances) return;
    const center = generated.center.set(p.x, p.y, p.z);
    const range = quality === 'high' ? 62 : quality === 'balanced' ? 46 : 30;
    generated.batches.forEach(b => { b.mesh.visible = b.center.distanceTo(center) < range; });
  });
  return <primitive object={generated.root} />;
}
