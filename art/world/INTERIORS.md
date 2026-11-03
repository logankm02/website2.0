# Logan City interiors

Press **E** at a building door to enter. Inside, approach an exhibit and press **E** to inspect it. The exit returns you to the same doorstep. The circular map opens the room directory.

| Building | Route | Exhibits |
| --- | --- | --- |
| ΛΚΜ House | `/world?interior=education` | Academic ledger, library shelves, and two gateways leading to the Rochester and Berkeley campus worlds |
| LOGAN & CO. | `/world?interior=experience` | Mission control consoles, a tripod-mounted LiDAR scanner, and a solar test array |
| LOGAN LABS | `/world?interior=projects` | Instrument bench, open-wheel autonomous racecar, and a Scrabble table with a playable project link |

The Blender MCP entry point is `art/world/scripts/80_build_interiors.py`. It calls `room_furniture.py` to build the props and their collision and interaction data. Run it with Blender Python via `runpy.run_path`. Supply `init_globals={'ROOM_ID': 'education'}` to regenerate a single room.

Each room is written to `/private/tmp/logan-furnished-rooms/{id}/`. The editable Blender file retains individual objects. The browser export joins meshes and applies Draco compression. Runtime assets live in `public/world/interiors/{id}/`, editable scenes in `art/world/blend/interior-{id}.blend`, and reference renders in `art/world/previews/interior-{id}.png`.
