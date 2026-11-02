# Brackenvale — playable prototype checkpoint

Original environment and traveler generated through Blender MCP, November 1, 2026.

## What is implemented

- An isolated `/world` route; original `/`, `/about`, `/classic`, `/city` remain intact.
- Procedural rolling terrain, winding path, pond, mountain backdrop, individual-leaf trees, grass and flowers, four detailed buildings, an observatory, fountain, paving and props.
- Three inspected village render iterations. The third iteration is the retained editable source. Earlier renders and all generating scripts are retained; superseded large `.blend` files were removed when the Mac ran low on space.
- A skinned original traveler with Idle, Walk and Run animation clips.
- WASD/arrows, Shift running, mouse-drag camera orbit, mouse-wheel zoom, gravity, terrain following, slope limits, static collision, and camera obstruction checks.
- E-key interactions with a guide, buildings and a hidden pond location. Arcade destinations include the existing pixel village, soccer scene and external Scrabble game. Existing portfolio data supplies content links.
- Draco-compressed GLBs, locally hosted decoder, spatially grouped instanced vegetation, tree LOD, capped pixel ratio, limited shadow coverage, and auto/high/balanced/low rendering settings.
- Loading, pause, failure and conventional portfolio navigation UI. This edition expects a desktop keyboard and mouse; mobile visitors have an explicit portfolio exit.

## Files

- `blend/brackenvale-v03.blend`: editable village scene. It is saved as a scene library; open it in Blender and select the Brackenvale scene if necessary. No user scene was overwritten.
- `blend/traveler.blend`: original skinned traveler and animation actions.
- `blend/mcp-verification.blend`: initial verified MCP smoke test.
- `scripts/`: reproducible geometry, scene, refinement, rigging and export code.
- `previews/village-01.png` through `village-03.png`: inspected visual iterations, not browser screenshots.
- `models/`: exported GLBs.
- `data/`: terrain height samples, placements and world manifest.
- `textures/`: original generated meadow detail texture.

The browser receives the models and compact binary placement/height data, not the full Blender scene or a rendered video. Coordinates in the placement file are Blender X/Y/Z; the browser converts them to Three.js X/Z/−Y. Each placement has five float32 values: x, y, z, uniform scale, Z rotation. Terrain collision samples match the exported grid and its triangle diagonal.

## Rebuild through MCP

The server is installed at the pinned revision recorded in `mcp-requirements.txt`. In the MCP Python execution tool, run scripts with `runpy.run_path` so they have a correct `__file__`:

```python
import runpy
runpy.run_path('/absolute/path/to/art/world/scripts/10_build_village.py')
```

Run `10_build_village.py`, `20_refine_village.py`, `30_atmosphere.py`, `40_character.py`, and `50_export_world.py` in that order in the same dedicated Blender process. `world_core.py`, `world_architecture.py`, and `world_nature.py` are imported helpers. The generators create their own scenes. The second pass replaces only the generated foliage in the active Brackenvale scene.

The export pass uses a separate staging scene, merges static geometry by material, exports reusable foliage prototypes and lower-detail trees, and writes browser files to `/private/tmp/brackenvale-stage`. Copy GLB, BIN and manifest JSON files into `public/world/`. Keep Blender source outside `public/`.

A later export-script refinement neutralizes empty vertex-color slots after joining painted and unpainted geometry. That last refinement was not executed because further MCP commands hit an approval gate. The browser loader already handles this correctly by enabling vertex colors only for the materials that actually use them.

## Validation and limits

Lint and production build pass. Six deterministic physics tests cover exported terrain correspondence, diagonal normalization/running, gravity, arcade collision/reachable interaction, fountain/pond boundaries, and slope handling. Run them with `node --test src/world/physics.test.mjs` from the website checkout.

Browser checks verified the world loads, the traveler walks, a nearby guide becomes interactable, and E opens the correct dialog. No browser errors were reported during those checks. One 1280×720 diagnostic sample measured approximately 51 fps, 133 draw calls and 3.0 million rendered triangles at balanced quality; this is a sample on this machine, not a cross-device performance guarantee. `?debug=1` shows local rendering diagnostics.

Subsequent browser interaction was denied by the browser approval gate, so the longer running route, low-quality switch, responsive layout and end-to-end existing-route navigation have not all been manually verified. Source routes remain intact and build successfully. No production deployment has been performed.

This is a first playable slice, not a finished console-quality world. Further work includes better character deformation, authored rock/cliff surfaces, richer terrain texture transitions, water/wind effects, stronger distant tree silhouettes, larger-world streaming, and broader browser/device testing.

## MCP configuration

The installed addon reports Blender 5.2.3 LTS / protocol 15. Its socket was verified at `127.0.0.1:9876`. Codex's server environment sets `DISABLE_TELEMETRY=true`; addon consent is false; asset-library and paid-generation integrations are off.

The pinned upstream source omitted `blender_mcp.config`. A small local compatibility module supplies an always-disabled telemetry configuration with no endpoint or API key. The repair is included alongside this document. Codex configuration and prior Blender preferences were backed up before setup. Further MCP commands currently require tool approvals to be enabled; no permission workaround was used.
