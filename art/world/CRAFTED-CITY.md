# Crafted city fidelity pass — 2026-11-05

Generated through the connected Blender MCP, using original procedural geometry. Telemetry remains disabled; no third-party assets or dependencies were added.

## Changes

- House: rounded upholstered sofa, welt piping, loose pillow, draped fringed throw, tapered wooden feet and ledger page details.
- Mission control: individual keyboard keys, mice, monitor cabling and bezel buttons, rack pulls and fasteners.
- Makerspace: shaped open-wheel monocoque, side pods, open cockpit, alloy spokes, exposed wishbones, wing elements, LiDAR hardware; printer rails, belts, motor housings, Bowden feed and nozzle.
- Street: turned cast-iron lamps, brass collars, framed lanterns, rounded door-panel mouldings, hinges, locks, letter slot and callplates.

Existing manifests, interactions, building positions, room bounds, player controls and Tesla are preserved. All three room collision arrays were compared with the rebuilt scenes and match exactly.

## Source and rebuild

`crafted_props.py` contains shared small-detail helpers. `crafted_interiors.py` is called by `room_furniture.furnish`; `hero_racer.py` builds the racecar. Run `80_build_interiors.py` through Blender MCP with `ROOM_ID` set to `education`, `experience` or `projects`; the editable blend and compressed GLB are staged in `/private/tmp/logan-furnished-rooms/<room>/`. Install the model and blend while retaining the live manifest and its detail overlay.

`92_crafted_city.py` refines the current editable avenue and court blends and stages exports in `/private/tmp/logan-crafted-city`. It removes its previous authored details on rerun to avoid duplicates. Install the staged blends and GLBs together. `93_crafted_previews.py` renders inspection cameras; set `SHOT` to render one view.

Editable sources are retained in `art/world/blend/interior-*.blend`, `avenue-buildings.blend` and `meridian-court.blend`. Final close-ups are in `art/world/previews/crafted-*-preview.png`. The inspection renders omit baked NPC stand-ins; the game uses its existing rigged residents.

## Export budget

Meshes are batched and Draco compressed. Rooms are loaded independently on entry. No new texture downloads are required; existing browser material detail remains active.

| Model | Previous bytes | New bytes | Exported triangles |
| --- | ---: | ---: | ---: |
| `public/world/avenue.glb` | 1,965,144 | 1,982,364 | 502,709 |
| `public/world/meridian-court.glb` | 778,120 | 940,372 | 192,139 |
| `public/world/interiors/education/room.glb` | 271,964 | 310,064 | 98,312 |
| `public/world/interiors/experience/room.glb` | 278,856 | 522,676 | 154,596 |
| `public/world/interiors/projects/room.glb` | 288,880 | 629,668 | 179,149 |

Combined download increase: 802,180 bytes across five models.

## Validation

- 22 world tests pass, including collision, reachable exhibits, campus entrances and local field-guide links.
- ESLint passes.
- Production build passes; existing large-chunk advisory remains.
- Browser checked locally at port 4173. Walked to the racecar and opened its E-key interaction; local project link remains available.
- Close-up render review corrected seat/throw intersections, opened the wheel rims to expose spokes, recessed the cockpit and moved the exhibit lettering onto its plinth.

This is a focused prop and entrance pass. Campuses, vegetation and character models were not rebuilt in this checkpoint.

## Follow-up: Central Avenue porch and planting

The outdoor settee now has steam-bent oak arms, slats, splayed legs, brass pins, canvas seats and striped linen cushions. The cushion stripes share the underlying fabric surface. Eight planting areas use poppies, cosmos, lavender and fern fronds. Two existing trees have branching cherry crowns, flower clusters, bark markings and root flares. Their trunks retain the original collision positions.

Run `94_avenue_gardens.py` through Blender MCP after the city layers exist. It regenerates its own objects, stages two editable blends and two compressed GLBs in `/private/tmp/logan-avenue-gardens`, then reimports the GLBs for close-up inspection. Generator modules: `avenue_porch.py` and `avenue_garden.py`. Plant meshes are linked under spatial parents for GPU instancing. The export has 658 instances in 29 batches, backed by seven plant meshes. Compared to the preceding checkpoint, the two outdoor GLBs together use 73,672 fewer bytes. Bedding roots were checked against the paved tile mask. Rendered inspection views: `previews/avenue-porch.png`, `avenue-planting.png`, and `avenue-cherry.png`.

Verified at player scale in the locally served production build: the porch settee and instanced flower beds are visible at the house entrance, and the E-key entry prompt is present. All 22 world tests, lint and build pass.
