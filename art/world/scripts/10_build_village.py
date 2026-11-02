"""Run through Blender MCP. Creates its own scene; does not clear user scenes."""
import bpy, sys, importlib, math, json
from pathlib import Path
from mathutils import Vector
OUT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(OUT/'scripts')) if str(OUT/'scripts') not in sys.path else None
import world_core,world_architecture,world_nature
for module in [world_core,world_architecture,world_nature]: importlib.reload(module)
from world_core import *
scene=bpy.data.scenes.new('Brackenvale — original village prototype')
bpy.context.window.scene=scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1440; scene.render.resolution_y=900; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.world=bpy.data.worlds.new('Blue afternoon'); scene.world.use_nodes=True
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND'); bg.inputs['Color'].default_value=(.34,.57,.8,1); bg.inputs['Strength'].default_value=.65
try: scene.view_settings.view_transform='AgX'
except TypeError: pass
scene.view_settings.exposure=.3
materials(); terrain(); world_architecture.plaza()
landmarks=[world_architecture.arcade(),world_architecture.cottage(-13,23,label='FIELD NOTES',tall=True),world_architecture.cottage(-13,38,w=7,label='WORKSHOP'),world_architecture.cottage(12,41,w=8,label='WAYFARER HOUSE')]
world_architecture.fountain(); world_architecture.tower()
world_nature.generate()
# Soft afternoon key light, with real-time compatible sun direction.
bpy.ops.object.light_add(type='SUN',location=(-30,-40,60)); sun=bpy.context.object; sun.name='Afternoon sun'; sun.rotation_euler=(math.radians(24),math.radians(-30),math.radians(-32)); sun.data.energy=2.5; sun.data.angle=math.radians(12)
bpy.ops.object.camera_add(location=(24,-39,14)); camera=bpy.context.object; camera.name='Village approach'; camera.data.lens=34; camera.data.clip_end=800; camera.rotation_euler=(Vector((0,19,6))-camera.location).to_track_quat('-Z','Y').to_euler(); scene.camera=camera
# Build data travels with source, exported browser coordinates are converted in runtime.
(OUT/'data/placements.json').write_text(json.dumps(world_nature.PLACEMENTS,separators=(',',':')))
(OUT/'data/landmarks.json').write_text(json.dumps(landmarks,indent=2))
scene.render.filepath=str(OUT/'previews/village-01.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'blend/brackenvale-v01.blend'),copy=True)
print('Village scene complete:',len(scene.objects),'objects. Ready to render.')
