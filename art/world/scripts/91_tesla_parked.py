"""Replace the avenue's parked car without rebuilding terrain or other architecture."""
import bpy,sys,math,json
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent;sys.path.insert(0,str(here))
from tesla_model import build_tesla,LEGACY_CAR_PREFIXES
from world_core import join,mat,box
art=here.parent;public=art.parents[1]/'public/world';stage=Path('/private/tmp/logan-tesla');stage.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(art/'blend/avenue-buildings.blend'))
scene=bpy.context.scene
old=[o for o in scene.objects if o.name.startswith(LEGACY_CAR_PREFIXES)]
assert len(old)>10, 'No independently editable parked car found'
body=next((o for o in old if o.name.startswith('Crossover lower body')),None)
if body:
    cx,cy,cz=body.location;cz-=.55
else:
    manifest=json.loads((public/'manifest.json').read_text())
    car=manifest['layout']['CARS'][0];scale=manifest['tileScale']
    cx=(car['x']+(car['w']-1)/2-11.5)*scale;cy=(10-car['y'])*scale;cz=2.5
scene['parked_tesla_origin']=[cx,cy,cz]
for ob in old:bpy.data.objects.remove(ob,do_unlink=True)
car=build_tesla(cx,cy,cz)
for o in car:
    if o.type=='FONT':
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
bpy.data.libraries.write(str(stage/'avenue-buildings.blend'),{scene},fake_user=True,compress=True)
# Save the car independently, with editable parts, before joining the city export.
preview=bpy.data.scenes.new('Tesla Model 3 preview')
for ob in car:
    clone=ob.copy();clone.data=ob.data.copy();preview.collection.objects.link(clone);clone.location-=Vector((cx,cy,cz))
bpy.context.window.scene=preview
bpy.data.libraries.write(str(stage/'tesla-model-3.blend'),{preview},fake_user=True,compress=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(stage/'tesla-model-3.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_draco_mesh_compression_enable=True)
bpy.context.window.scene=scene
parts=[ob for ob in scene.objects if ob.type=='MESH' and not ob.name.startswith(('Logan Terrain','Pond turquoise water'))]
join(parts,'Avenue architecture and landscape')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(stage/'avenue.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_draco_mesh_compression_enable=True,export_vertex_color='ACTIVE')
bpy.context.window.scene=preview
box('Studio ground',(0,0,-.08),(200,200,.12),mat('Studio pale blue',(.34,.43,.48)))
world=bpy.data.worlds.new('Tesla studio');world.use_nodes=True;preview.world=world
next(n for n in world.node_tree.nodes if n.type=='BACKGROUND').inputs['Color'].default_value=(.65,.76,.86,1)
next(n for n in world.node_tree.nodes if n.type=='BACKGROUND').inputs['Strength'].default_value=.7
for pos,power,size in [((3,-5,8),1500,7),((-4,2,5),1100,5)]:
    data=bpy.data.lights.new('Studio softbox','AREA');data.energy=power;data.shape='DISK';data.size=size
    light=bpy.data.objects.new('Studio softbox',data);preview.collection.objects.link(light);light.location=pos;light.rotation_euler=(Vector((0,0,.7))-light.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('Car camera');cam=bpy.data.objects.new('Car camera',data);preview.collection.objects.link(cam)
cam.location=(6.3,-7.2,4.5);cam.rotation_euler=(Vector((0,0,.7))-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=54;preview.camera=cam
preview.render.engine='CYCLES';preview.cycles.samples=20;preview.cycles.use_denoising=True
preview.render.resolution_x=1100;preview.render.resolution_y=760;preview.render.resolution_percentage=100
preview.render.filepath=str(stage/'tesla-preview.png');bpy.ops.render.render(write_still=True)
print('TESLA COMPLETE',cx,cy,cz,flush=True)
