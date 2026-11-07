"""Front and rear fitting photos from the actual skinned browser export."""
from pathlib import Path
import bpy,math
from mathutils import Vector
stage=Path('/private/tmp/logan-field-club');bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.render.fps=30
for i,yaw in enumerate((-.29,2.77)):
    prev=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(stage/'traveler.glb'));obs=set(bpy.data.objects)-prev;rig=next(o for o in obs if o.type=='ARMATURE');rig.animation_data.action=None
    for t in rig.animation_data.nla_tracks:t.mute=t.name.split('.')[0]!='Idle'
    holder=bpy.data.objects.new('Fitting angle',None);scene.collection.objects.link(holder)
    for o in obs:
        if not o.parent:o.parent=holder
    holder.location.x=.53*(-1 if i else 1);holder.rotation_euler.z=yaw
scene.frame_set(12);scene.world=bpy.data.worlds.new('Photo studio');scene.world.use_nodes=True;bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.68,.72,.80,1);bg.inputs[1].default_value=.48
bpy.ops.mesh.primitive_plane_add(size=300,location=(0,0,-.012));m=bpy.data.materials.new('Warm grey cyclorama');m.use_nodes=True;next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'].default_value=(.24,.225,.207,1);bpy.context.object.data.materials.append(m)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
for pos,e,w in [((2.2,3.3,4.2),345,3),((-2,-1.4,3.6),210,2.5)]:
    bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=e;o.data.size=w;aim(o,(0,0,1))
bpy.ops.object.camera_add(location=(0,5.9,1.53));o=bpy.context.object;o.data.type='ORTHO';o.data.ortho_scale=2.82;aim(o,(0,0,.99));scene.camera=o
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=900;scene.render.resolution_y=752;scene.render.resolution_percentage=100;scene.render.filepath=str(stage/'street-fit.png');bpy.ops.render.render(write_still=True)
