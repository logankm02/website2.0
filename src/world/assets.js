import { LoadingManager, SRGBColorSpace, TextureLoader, RepeatWrapping } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { finishMaterial } from './toonMaterial';
import { arrivalManifest } from './worldRoute';

const BASE = '/world/';
export async function loadWorld(onProgress, route) {
  const manager = new LoadingManager();
  manager.onProgress = (_url, loaded, total) => onProgress(Math.min(95, Math.round(loaded / total * 95)));
  const draco = new DRACOLoader(manager).setDecoderPath(`${BASE}draco/`).setWorkerLimit(2);
  const loader = new GLTFLoader(manager).setDRACOLoader(draco);
  const loaded = [];
  let atlas;
  async function gltf(path, kind = '') {
    const result = await loader.loadAsync(BASE + path); loaded.push(result);
    result.scene.traverse(o => {
      if (!o.isMesh) return;
      o.receiveShadow = true;
      const materials = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of materials) {
        finishMaterial(m, atlas, kind);
        if (m.map) m.map.colorSpace = SRGBColorSpace;
        // glTF carries neutral/empty attributes on joined unpainted parts.
        // Only the authored foliage, terrain, ivy and mountain shaders use them.
        m.vertexColors = /varied foliage|Meadow plant|Meadow with|Ivy variegation|Mountain rock|Meridian painted|Meridian blossom/.test(m.name);
        // Joined foliage keeps its authored paint in the second color layer.
        // Three's standard material reads `color`; LODs already use that layer.
        if (/varied foliage|Ivy variegation city/.test(m.name) && o.geometry.getAttribute('color_1')) {
          o.geometry.setAttribute('color', o.geometry.getAttribute('color_1'));
        }
      }
    });
    return result;
  }
  try {
    const response = await fetch(`${BASE}${route.prefix}manifest.json`);
    if (!response.ok) throw new Error('The world manifest could not be loaded.');
    const manifest = arrivalManifest(await response.json(), route);
    atlas = await new TextureLoader(manager).loadAsync(BASE + 'surface-studies.png');
    atlas.wrapS = atlas.wrapT = RepeatWrapping;
    const [world, traveler, placements, heights, library, detail, resident] = await Promise.all([
      gltf(manifest.world || 'village.glb'), gltf('traveler.glb'),
      fetch(`${BASE}${manifest.placements || 'placements.bin'}`).then(r => { if (!r.ok) throw new Error('Vegetation data could not be loaded.'); return r.arrayBuffer(); }),
      fetch(`${BASE}${manifest.heightmap || 'heightmap.bin'}`).then(r => { if (!r.ok) throw new Error('Terrain data could not be loaded.'); return r.arrayBuffer(); }),
      Promise.all(manifest.assets.map(async a => ({ ...a, high: await gltf(a.url,a.kind), low: a.lodUrl ? await gltf(a.lodUrl,a.kind) : null }))),
      manifest.detailModel ? gltf(manifest.detailModel) : null,
      gltf(manifest.campus ? 'student.glb' : manifest.interior ? 'resident.glb' : 'logan.glb'),
    ]);
    if (resident && manifest.interior && manifest.locations.some(l => l.kind === 'Talk')) {
      world.scene.traverse(o => { if (o.isMesh && /^Villager /i.test(o.material.name)) o.visible = false; });
    }
    if (detail && manifest.detailModel === 'meridian-court.glb') {
      world.scene.traverse(o => {
        if (o.isMesh && /^(Atmospheric ridge|Mountain rock and snow)/.test(o.material.name)) o.visible = false;
      });
    }
    if (detail) world.scene.add(detail.scene);
    onProgress(100);
    return { manifest, world, traveler, resident, placements: new Float32Array(placements), heights: new Float32Array(heights), library, dispose: () => { disposeModels(loaded); atlas.dispose(); } };
  } catch (error) { disposeModels(loaded); atlas?.dispose(); throw error; }
  finally { draco.dispose(); }
}
function disposeModels(models) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  for (const model of models) model.scene.traverse(o => {
    if (o.geometry) geometries.add(o.geometry);
    for (const material of o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
}
