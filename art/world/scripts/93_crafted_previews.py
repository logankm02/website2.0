"""Repeatable close-range inspection cameras for the crafted city assets."""
import bpy,sys
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent;sys.path.insert(0,str(here))
stage=Path('/private/tmp/logan-crafted-city');stage.mkdir(exist_ok=True)
shots=[
 ('racer','/private/tmp/logan-furnished-rooms/projects/room.blend',(-2.1,-4.7,3.6),(-6.35,.75,.75),52),
 ('reading-nook','/private/tmp/logan-furnished-rooms/education/room.blend',(1.8,-1.7,2.55),(5.55,2.8,.95),48),
 ('control-desk','/private/tmp/logan-furnished-rooms/experience/room.blend',(3.6,2.0,2.8),(0,6.6,1.6),44),
 ('lamp','/private/tmp/logan-crafted-city/avenue-buildings.blend',(-7.8,2.2,5.9),(-3.6,7.2,4.55),32),
 ('entrance','/private/tmp/logan-crafted-city/meridian-court.blend',(-10.3,2.4,4.7),(-13.2,8.6,4.2),53),
]
for name,file,pos,target,lens in shots:
    if globals().get('SHOT',name)!=name:continue
    bpy.ops.wm.open_mainfile(filepath=file);scene=bpy.context.scene
    # These baked figures are disabled by the browser in favor of rigged characters.
    for ob in scene.objects:
        if ob.type=='MESH' and any(m and m.name.startswith('Villager ') for m in ob.data.materials):ob.hide_render=True
    if name=='entrance':
        with bpy.data.libraries.load('/private/tmp/logan-crafted-city/avenue-buildings.blend',link=False) as (data,to):
            to.objects=[n for n in data.objects if n not in scene.objects]
        for ob in to.objects:
            if ob and ob.type=='MESH':scene.collection.objects.link(ob)
    if not scene.world:
        scene.world=bpy.data.worlds.new('Craft daylight')
    scene.world.use_nodes=True
    bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND')
    if name in ('lamp','entrance'):
        bg.inputs['Color'].default_value=(.65,.77,.95,1);bg.inputs['Strength'].default_value=.65
        bpy.ops.object.light_add(type='SUN',rotation=(.4,-.5,-.3));bpy.context.object.data.energy=2;bpy.context.object.data.angle=.09
    bpy.ops.object.camera_add(location=pos);cam=bpy.context.object
    cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;scene.camera=cam
    scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.resolution_x=1100;scene.render.resolution_y=760;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.filepath=str(stage/f'{name}-preview.png')
    bpy.ops.render.render(write_still=True)
    print('INSPECT',name,flush=True)
