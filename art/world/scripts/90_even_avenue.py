"""Re-export the existing editable city at its current 3D tile layout, retaining other scenes."""
import bpy, json, sys
from mathutils import Vector
from pathlib import Path
here=Path(__file__).resolve().parent
sys.path.insert(0,str(here))
from city_spacing import city_layout
from world_core import join
art=here.parent; public=art.parents[1]/'public/world'
source=next(s for s in bpy.data.scenes if s.name.startswith('LOGAN CITY'))
previous=bpy.context.window.scene
bpy.context.window.scene=source
layout=city_layout(json.loads((here/'city-layout.json').read_text()))
mission=next(b for b in layout['BUILDINGS'] if b['id']=='experience')
target=(mission['x']+(mission['w']-1)/2-11.5)*2.4
center=next(o.location.x for o in source.objects if o.name.startswith('Mission control block'))
slide=target-center
deps=bpy.context.evaluated_depsgraph_get()
export=bpy.data.scenes.new('Avenue architecture')
try:
    for ob in source.objects:
        if ob.type not in ('MESH','CURVE','FONT') or any(ob.get(k) for k in ('prototype','instance_kind','vegetation_chunk')):continue
        ev=ob.evaluated_get(deps)
        mid=ob.matrix_world @ (sum((Vector(c) for c in ev.bound_box),Vector())/8)
        # Check the two old door assemblies independently of their names' numeric suffixes.
        if any(abs(mid.x-dx)<1.07 and abs(mid.y-dy)<.46 and mid.z<5.60 for dx,dy in [(-13.2,9.26),(center+1.2,8.15)]) and ob.name.startswith(('Recessed window casing','Window inset','Window vertical frame','Window cross rail','Door inset panel','Brass door latch')):continue
        mesh=bpy.data.meshes.new_from_object(ev,depsgraph=deps)
        clone=bpy.data.objects.new(ob.name,mesh);export.collection.objects.link(clone);clone.matrix_world=ob.matrix_world.copy()
        # The parked car and public furniture are street props. Only move the
        # mission-control structure, its attached equipment and its old awning.
        mission_part=(center-7.85<mid.x<center+7.65 and 7.52<mid.y<20.7 and mid.z>2.5)
        parked=ob.name.startswith(('Crossover','Swept crossover','Flush door handle','Alloy wheel','Wheel spoke','Tesla '))
        if mission_part and not parked:clone.location.x+=slide
    bpy.context.window.scene=export
    bpy.data.libraries.write(str(art/'blend/avenue-buildings.blend'),{export},fake_user=True,compress=True)
    parts=[ob for ob in export.objects if not ob.name.startswith(('Logan Terrain','Pond turquoise water'))]
    # Authored terrain and leaves use vertex colors; keep their materials separate.
    join(parts,'Avenue architecture and landscape')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=str(public/'avenue.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_draco_mesh_compression_enable=True,export_vertex_color='ACTIVE')
    p=public/'manifest.json';m=json.loads(p.read_text())
    m.update(layout=layout,world='avenue.glb')
    site=next(l for l in m['landmarks'] if l['id']=='experience');site['center'][0]=target;site['door'][0]=(mission['door']['x']-11.5)*2.4
    p.write_text(json.dumps(m,separators=(',',':')))
finally:
    bpy.context.window.scene=previous
    for ob in list(export.objects):bpy.data.objects.remove(ob,do_unlink=True)
    bpy.data.scenes.remove(export)
