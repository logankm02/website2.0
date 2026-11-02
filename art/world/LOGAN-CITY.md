# LOGAN CITY and campus worlds

The 3D `/world` scene now follows the existing pixel city’s 24×20 layout at 2.4 metres per tile. Its original three buildings are recreated as ΛΚΜ House, LOGAN & CO. Mission Control, and LOGAN LABS. Paths, the southwest pond, fence runs, garden, mailboxes, car, ferns, crimson trees, and kiwi birds follow the source map.

Two campus gateways beside ΛΚΜ House open playable first-pass campus scenes:

- `/world?campus=rochester`: Eastman Quad, Rush Rhees Library with copper dome, five brick halls, autumn trees, and a return portal.
- `/world?campus=berkeley`: Memorial Glade, the Campanile, Doe Library, Sather Gate, Strawberry Creek and its bridge, the bronze seal, berry garden, Glade Mart, and a return portal.

These translate the existing website’s stylized campus maps; they are not surveyed replicas of the entire real universities. Campus detail is intentionally lighter than the city, as requested. Building interactions open content and travel links. The original enterable pixel interiors and campus scenes remain intact at `/city`.

## Editable source

All modeling, scene assembly, renders, and GLB export ran through Blender MCP. No purchased or remotely generated assets were used. Telemetry remained disabled.

`blend/` contains the editable city and both campuses. `previews/` contains the inspected renders. The same source files are retained locally in the repository’s `art/world/blend/`; these large files are ignored by Git. Browser GLBs, manifests, heightfields, and placement buffers are in `public/world/` and tracked in Git.

The original Brackenvale source and scripts are retained. To rebuild in Blender, open its saved scene and execute the scripts through MCP in this order:

1. Run `node art/world/scripts/sync_city_layouts.mjs` in the repository to refresh snapshots of the existing pixel maps.
2. Run `60_build_logan_city.py`, `62_city_landscape.py`, then `64_refine_city.py` using `runpy.run_path`.
3. Run `70_build_campuses.py` with `init_globals={'campus_id':'uofr'}` and export with `75_export_campus.py`. Repeat with `campus_id='ucb'`.
4. Run `72_school_portals.py`, then `65_export_city.py`.
5. Copy staged assets from `/private/tmp/logan-city-stage` and `/private/tmp/campus-{rochester,berkeley}` into their matching public folders. Shared vegetation stays in the public world root. Retain `traveler.glb` and the local Draco decoder.

Build scripts create separate scenes. For a clean rebuild, reopen the original Brackenvale blend first instead of accumulating duplicate generated scenes in one session. Scene manifests record terrain, collision, spawn points, and travel destinations. Saved scenes also retain instance placement data for re-export.

## Validation

Run `npm run lint`, `npm run build`, and `node --test src/world/*.test.mjs` in the repository. Tests cover exported terrain height, slope/gravity behavior, building walls, the city layout, reachable destinations and campus gates, the creek boundary, and the bridge and Sather Gate passages.

Existing user edits to the portfolio and pixel game were preserved byte-for-byte. No production deployment is part of this checkpoint.

Verified November 2, 2026: production build and lint pass; all 11 tests pass. Chrome loaded all three worlds, E-key city interaction worked, and directory travel to the campuses and back worked. No browser console errors were observed. Browser screenshots are retained in `previews/*-browser.png`. The final browser fixes select the correct exported foliage color layer and keep the campus arrival camera in front of the return arches.
