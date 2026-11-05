# LOGAN CITY and campus worlds

The 3D `/world` scene now expands the pixel city to 33×20 tiles at 2.4 metres per tile. The makerspace stands on the east side, leaving a clear view and a direct walk to Mission Control. Its original three buildings are recreated as ΛΚΜ House, LOGAN & CO. Mission Control, and LOGAN LABS. Paths, the southwest pond, fence runs, garden, mailboxes, car, ferns, crimson trees, and kiwi birds follow the source map.

Two campus gateways beside ΛΚΜ House open playable first-pass campus scenes:

- `/world?campus=rochester`: Eastman Quad, Rush Rhees Library with copper dome, five brick halls, autumn trees, and a return portal.
- `/world?campus=berkeley`: Memorial Glade, the Campanile, Doe Library, Sather Gate, Strawberry Creek and its bridge, the bronze seal, berry garden, Glade Mart, and a return portal.

These translate the existing website’s stylized campus maps; they are not surveyed replicas of the entire real universities. Campus detail is intentionally lighter than the city, as requested. The three city buildings now open furnished 3D interiors; their directories retain the existing content links. Campus interactions open content and travel links. The original enterable pixel interiors and campus scenes remain intact at `/city`.

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

## Meridian Court and district details

The detail layers load alongside the base city, two campuses, and three interiors. Each area's manifest names its GLB. The city manifest also records the fountain footprint for collision, planting clearance, and the field map.

To regenerate, run `85_plaza.py`, `86_surface_atlas.py`, and `87_district_details.py` in Blender through MCP. Run `40_character.py` in two fresh Blender sessions with the scripts directory on the Python search path. The default builds the traveler. For residents, pass `init_globals={'RESIDENT': True}` to `runpy.run_path`. From the repository root run `python3 art/world/scripts/install_finish_work.py` to install the staged exports, save the individual editable scenes under `art/world/blend`, and update the manifests. Reapply this step after rebuilding a base area's manifest.

For the street loading illustration, open `meridian-court.blend` in a background Blender process. Run `render_court.py` with the absolute public world directory and output PNG after Blender's `--` separator. The script imports the current buildings and samples their actual vegetation placements.

## Campus landmarks and street elevations

In a background Blender process started through MCP, open the original `rochester-campus.blend` or `berkeley-campus.blend` and execute `88_campus_landmarks.py` with the campus slug after `--`. It saves the editable landmark scene, replaces the old landmark in the campus export, and sets the arrival camera and garden collisions. Run `89_glade_redwoods.py` in a fresh Blender session to rebuild Berkeley’s grove and its distance mesh. The scripts retain the original campus blends and placement buffers.

The house, mission-control building, and workshop exteriors are part of the Meridian Court detail layer. `85_plaza.py` fits the components from `city_storefronts.py` to the current city landmark footprints. For campus arrival images, run `render_court.py` in a fresh Blender process with the public world directory, output PNG and campus slug after `--`.

## Even avenue and enlarged rooms

The three street façades leave 7.2 metres between each pair of walls. Run `90_even_avenue.py` from the original editable east-court city, then rebuild Meridian Court as described above. The new city export uses `avenue.glb`. For the three enlarged rooms, run `80_build_interiors.py` and `87_district_details.py`, followed by `python3 art/world/scripts/install_avenue_rooms.py`. Both shell and detail builders read `room_dimensions.py`, and each exhibit moves with its collision footprint and interaction point.

### Furnished interiors and parked Tesla — 2026-11-04

`interior_collections.py` adds pixel-city-inspired displays through the existing
`room_furniture.furnish` pipeline: Rochester/Cal lounge and varsity cabinet,
telemetry racks with KITE and charging station, and CalSol/printer/TūīNet work bays.
The existing room generator saves editable parts before the compressed GLB export.
Updated editable shells are in `blend/interior-{education,experience,projects}.blend`.
Room dimensions, exhibit links, and clear approach routes are retained.

`tesla_model.py` authors the parked Model 3 from local Blender geometry. The city
landscape generator calls it for future rebuilds. `91_tesla_parked.py` replaces the
legacy car in `blend/avenue-buildings.blend`, staging the updated avenue, standalone
car source/GLB, and preview in `/private/tmp/logan-tesla`. After reviewing the preview,
copy its avenue GLB to `public/world/avenue.glb` and the two editable blends to
`art/world/blend`. The unchanged parking footprint uses the existing collider.
Residents and the player share the character rig's authored scale in `Traveler.jsx`.

Validation: 17 world tests, production build, lint, Blender previews and browser
walkthroughs of the rooms and avenue. This is a local build only.

### Eastman Quad façade orientation — 2026-11-04

Rochester's Bausch & Lomb and Morey façades now face each other across the green;
Dewey faces inward from the far end. `campus_orientation.py` applies the same
footprint-preserving transform to the original halls and the newer masonry trim
in `88_campus_landmarks.py`. The original campus source remains untouched; the
fully editable result is `blend/rochester-quad.blend`. Door metadata and interaction
positions follow the façades. All 18 world tests pass, including clear inward
entrances; production build and lint pass. Local preview only.
