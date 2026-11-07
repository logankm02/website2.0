"""Refine the current editable city; export staged assets without touching manifests."""
import bpy,sys,json
from pathlib import Path
here=Path(__file__).resolve().parent;sys.path.insert(0,str(here))
from crafted_street import lamps,entrances
from world_core import join
art=here.parent;root=art.parents[1]
stage=Path('/private/tmp/logan-crafted-city');stage.mkdir(exist_ok=True)
for source,output in [('avenue-buildings','avenue'),('meridian-court','meridian-court')]:
    bpy.ops.wm.open_mainfile(filepath=str(art/'blend'/f'{source}.blend'))
    scene=bpy.context.scene
    if output=='avenue':lamps()
    else:entrances(json.loads((root/'public/world/manifest.json').read_text())['landmarks'])
    bpy.data.libraries.write(str(stage/f'{source}.blend'),{scene},fake_user=True,compress=True)
    parts=[o for o in scene.objects if o.type=='MESH' and not o.data.color_attributes]
    if parts:join(parts,'Crafted city '+output)
    bpy.ops.object.select_all(action='DESELECT')
    for o in scene.objects:
        if o.type=='MESH' or o.name.startswith('Avenue garden section '):o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(stage/f'{output}.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_cameras=False,export_lights=False,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_vertex_color='ACTIVE',export_gpu_instances=True)
    print('CRAFTED',output,flush=True)
