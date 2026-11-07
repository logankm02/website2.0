# Campus site plans

These are original, walk-scale interpretations of the [River Campus map](https://www.rochester.edu/maps/printable_maps/URmaps_RC.pdf) and [Berkeley Library map](https://live-lib-d9.pantheon.berkeley.edu/sites/default/files/librarymap.pdf), composed from the arrival photographs. The maps informed building adjacency, paths, facing directions and the compass. Distances, façades, and tree placements are simplified.

At Rochester, local +Y follows the east-northeast axis from the river toward Rush Rhees. Lattimore and Morey form the left bank of the green, Dewey and Bausch & Lomb the right. At Berkeley local +Y follows Sather Road roughly north-northwest. The view from the western approach looks across the glade past Doe toward Sather Tower; the creek and Sather Gate are south of the library district.

Edit `scripts/campus_site_plans.py` for footprints, paths, tree anchors and camera arrivals. Via Blender MCP, run `scripts/98_campus_site_plans.py -- rochester` or `-- berkeley` in a clean background Blender. The builder reuses the team's original landmark artwork in each legacy campus.glb; it writes separate site-plan GLBs and editable blends. The same plan produces the map lines, interactions, collision, terrain samples and instancing data. The original pixel campuses have their own layout and are unaffected.

## Campus life

`campus_life.py` is the single source for eleven fictional students per campus: four walkers, three readers and four people with E-key conversations. Walkers follow the realignments' sidewalks; the benches, books and bicycle parking are exported through Blender MCP. Fictional dialogue provides orientation, not claims about real students. Low quality halves the moving crowd. One shared skinned student GLB supplies Idle, Walk, Run, Greet and Sit.

Doe's north façade was corrected to a continuous entablature over engaged columns and tall reading-room windows, informed by [Berkeley's architectural description](https://newsarchive.berkeley.edu/news/berkeleyan/1996/0501/doe.html). Rochester retains the bilateral academic halls, elm-like tree rows and open axial approach, with paired flags and stone seating by the library. These remain compressed original interpretations rather than measured campus replicas.
