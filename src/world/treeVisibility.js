// A soft corridor around the sight line, expanded by each tree's actual bounds.
// Ellipsoid space keeps tall trees from fading merely because they are nearby.
export function treeVisibility(camera, target, center, radius) {
  const ax = (camera.x - center.x) / radius.x, ay = (camera.y - center.y) / radius.y, az = (camera.z - center.z) / radius.z;
  const dx = (target.x - camera.x) / radius.x, dy = (target.y - camera.y) / radius.y, dz = (target.z - camera.z) / radius.z;
  const length = dx * dx + dy * dy + dz * dz;
  const t = length > 1e-8 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy + az * dz) / length)) : 0;
  const distance = Math.hypot(ax + t * dx, ay + t * dy, az + t * dz);
  const edge = Math.max(0, Math.min(1, (distance - .85) / .3));
  return edge * edge * (3 - 2 * edge);
}

// Opaque screen-door coverage avoids per-instance transparent sorting, keeps
// the existing surface shaders, and requires no extra vegetation draw calls.
export function treeFadeMaterial(source) {
  const material = source.clone();
  const priorCompile = source.onBeforeCompile, priorKey = source.customProgramCacheKey();
  material.customProgramCacheKey = () => `${priorKey}/tree-camera-fade-v1`;
  material.onBeforeCompile = shader => {
    priorCompile.call(source, shader);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float treeCoverage; varying float vTreeCoverage;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTreeCoverage = treeCoverage;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vTreeCoverage;')
      .replace('#include <alphatest_fragment>', `#include <alphatest_fragment>
        float treeNoise = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(.06711056, .00583715))));
        if (treeNoise > vTreeCoverage) discard;`);
  };
  return material;
}
