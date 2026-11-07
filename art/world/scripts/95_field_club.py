"""Run in an isolated Blender MCP job. Build editable characters and animated browser assets."""
import bpy,sys,math
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent;sys.path.insert(0,str(here))
from field_people import Person
from field_motion import make_rig,animate
from world_core import box,mat
stage=Path('/private/tmp/logan-field-club');stage.mkdir(exist_ok=True)
for key in ('traveler','resident','logan','student'):
    if globals().get('ONLY',key)!=key:continue
    bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.render.fps=30;scene.frame_start=0;scene.frame_end=108;resident=key!='traveler'
    from street_fit import outfit
    person=Person();parts=outfit(person,host=True) if key=='logan' else person.build(resident);rig=make_rig(parts);animate(rig,resident,holding_cup=key=='logan',student=key=='student');scene.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=str(stage/f'{key}.blend'),compress=True)
    bpy.ops.export_scene.gltf(filepath=str(stage/f'{key}.glb'),export_format='GLB',use_active_scene=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
    print('FIELD EXPORTED',key,flush=True)
    # Preview the source with its actual poses, rather than its rest position.
    for ob in parts:ob.hide_render=resident and ob.name.startswith('Look_') and ob.name!='Look_2'
    scene.world=bpy.data.worlds.new('Soft daylight');scene.world.use_nodes=True;bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.66,.79,.90,1);bg.inputs[1].default_value=.55
    box('Studio floor',(0,0,-.06),(200,200,.1),mat('Studio sky grey',(.34,.45,.46)))
    def aim(ob,target):ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
    for pos,power,size in [((2,3,4),255,3),((-2,-1,3),135,2)]:
        bpy.ops.object.light_add(type='AREA',location=pos);l=bpy.context.object;l.data.energy=power;l.data.size=size;aim(l,(0,0,1))
    bpy.ops.object.camera_add(location=(.86,3.7,1.62));cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=2.24;aim(cam,(0,0,.98));scene.camera=cam
    scene.render.engine='CYCLES';scene.cycles.samples=10;scene.cycles.use_denoising=True;scene.render.resolution_x=640;scene.render.resolution_y=680;scene.render.resolution_percentage=100
    for clip,frame in ([('Idle',10),('Greet',24)] if resident else [('Idle',10),('Walk',4),('Run',4)]):
        rig.animation_data.action=bpy.data.actions[clip];scene.frame_set(frame);scene.render.filepath=str(stage/f'{key}-{clip}.png');bpy.ops.render.render(write_still=True)
