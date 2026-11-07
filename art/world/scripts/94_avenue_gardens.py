"""Build both streetscape layers from editable sources; preserve painted geometry and GPU instances."""
import bpy,json,sys,math
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent;sys.path.insert(0,str(here))
from world_core import join
from avenue_porch import porch
from avenue_garden import landscape
art=here.parent;public=art.parents[1]/'public/world';manifest=json.loads((public/'manifest.json').read_text())
stage=Path('/private/tmp/logan-avenue-gardens');stage.mkdir(exist_ok=True)
for source,out in [('avenue-buildings','avenue'),('meridian-court','meridian-court')]:
    bpy.ops.wm.open_mainfile(filepath=str(art/'blend'/f'{source}.blend'));scene=bpy.context.scene
    if out=='avenue':porch(manifest['landmarks'])
    else:landscape(manifest,public)
    bpy.data.libraries.write(str(stage/f'{source}.blend'),{scene},fake_user=True,compress=True)
    parts=[o for o in scene.objects if o.type=='MESH' and not o.data.color_attributes and not o.name.startswith('Avenue garden ')]
    join(parts,'Central Avenue '+out);bpy.ops.object.select_all(action='DESELECT')
    for o in scene.objects:
        if o.type=='MESH' or o.name.startswith('Avenue garden section '):o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(stage/f'{out}.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_cameras=False,export_lights=False,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_vertex_color='ACTIVE',export_gpu_instances=True)
    print('GARDEN EXPORTED',out,flush=True)
# Inspect the actual compressed exports together, including their instance transforms.
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
for out in ('avenue','meridian-court'):bpy.ops.import_scene.gltf(filepath=str(stage/f'{out}.glb'))
scene.world=bpy.data.worlds.new('Spring daylight');scene.world.use_nodes=True
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.52,.70,.94,1);bg.inputs[1].default_value=.58
bpy.ops.object.light_add(type='SUN',rotation=(.48,-.57,-.32));bpy.context.object.data.energy=2.7;bpy.context.object.data.angle=.12
scene.render.engine='CYCLES';scene.cycles.samples=10;scene.cycles.use_denoising=True;scene.cycles.max_bounces=3
scene.render.resolution_x=1056;scene.render.resolution_y=704;scene.render.resolution_percentage=100
for name,pos,aim,lens in [('porch',(-7.1,4.5,4.58),(-9.9,8.6,3.16),49),('planting',(-7.4,2.0,3.6),(-8.4,5.4,2.90),34),('cherry',(17.8,-9.3,5.8),(24,-2.3,5.05),44)]:
    bpy.ops.object.camera_add(location=pos);cam=bpy.context.object;cam.rotation_euler=(Vector(aim)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;scene.camera=cam
    scene.render.filepath=str(stage/f'{name}.png');bpy.ops.render.render(write_still=True);print('GARDEN RENDERED',name,flush=True)
