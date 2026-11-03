# Empty city interiors

ΛΚΜ House, LOGAN & CO., and LOGAN LABS each have a separate walkable, unfurnished room. Rooms include only a floor, ceiling, walls, trim, windows, and an exit door. House flooring is wood, the office is blue-gray, and the lab is concrete.

At a city building door, press **E** to enter. Near the interior exit, press **E** to return to that building’s doorstep. The city Directory also links to the rooms. Existing portfolio links remain in each room’s Directory. Campus routes and the pixel city are unchanged.

Local URLs:
- `/world?interior=education`
- `/world?interior=experience`
- `/world?interior=projects`

Generated through Blender MCP using `art/world/scripts/80_build_interiors.py`. This creates separate scenes, compressed GLBs, room manifests, flat collision heightfields, editable `.blend` files, and previews in `/private/tmp/logan-interiors/`. Browser files are installed at `public/world/interiors/{id}/`; editable sources are retained at `art/world/blend/interior-{id}.blend` and alongside this document in `interiors/`.

Room assets are 16–19 KB each and reuse the existing animated traveler. They load no outdoor vegetation. Indoor lighting and ceiling-aware camera positioning are selected from room metadata. Room collision uses the same movement controller as the city.

Validation: production build and lint pass; all 15 movement/navigation tests pass, including four-wall containment, walkable exits, validated room routes, and return to the correct exterior doorway. Existing unrelated user edits were preserved.
