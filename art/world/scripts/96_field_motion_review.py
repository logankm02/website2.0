"""Motion review using reimported browser GLBs; optionally render the inspection reel."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
stage=Path('/private/tmp/logan-field-club');out=stage/'motion';out.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.render.fps=30
for idx,(file,clip,offset,yaw) in enumerate([('traveler','Walk',1.38,.68),('traveler','Run',0,1.03),('resident','Greet',-1.38,-.12)]):
    old=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(stage/f'{file}.glb'));added=set(bpy.data.objects)-old;rig=next(o for o in added if o.type=='ARMATURE')
    rig.animation_data.action=None;tracks=rig.animation_data.nla_tracks
    tr=next(t for t in tracks if t.name.split('.')[0]==clip or t.strips[0].action.name.split('.')[0]==clip)
    for t in tracks:t.mute=True
    tr.mute=False;strip=tr.strips[0];strip.repeat=5 if clip!='Greet' else 1
    root=bpy.data.objects.new('Review '+clip,None);scene.collection.objects.link(root)
    for ob in added:
        if ob.parent is None:ob.parent=root
        if file=='resident' and ob.name.startswith(('Look_0','Look_1')):ob.hide_render=True
    root.location=(offset,0,0);root.rotation_euler.z=yaw
    # Evaluate imported skin vertices across one complete cycle, independent of preview lighting.
    surface=next(o for o in added if o.type=='MESH' and o.name.startswith('Body'))
    ids=[v.index for v in surface.data.vertices if (surface.matrix_world@v.co).z<.055];bounds=[]
    for frame in range(int(strip.action_frame_start),int(strip.action_frame_end)+1):
        scene.frame_set(frame);evaluated=surface.evaluated_get(bpy.context.evaluated_depsgraph_get());bounds.append(min((evaluated.matrix_world@evaluated.data.vertices[i].co).z for i in ids))
    print('SOLE',clip,min(bounds),max(bounds),flush=True)
    assert min(bounds)>-.018 and max(bounds)<{'Walk':.035,'Run':.13,'Greet':.025}[clip], f'{clip}: unexpected sole height'
    font=bpy.data.curves.new('Motion caption','FONT');font.body=clip.upper();font.size=.070;font.space_character=1.4;font.align_x='CENTER';ob=bpy.data.objects.new('Motion caption',font);scene.collection.objects.link(ob);ob.location=(offset,0,2.09);ob.rotation_euler=(math.pi/2,0,math.pi)
    m=bpy.data.materials.new('Caption ink');m.diffuse_color=(.07,.12,.14,1);font.materials.append(m)
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.68,.79,.92,1);bg.inputs[1].default_value=.55
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.018));m=bpy.data.materials.new('Paper');m.diffuse_color=(.47,.56,.56,1);bpy.context.object.data.materials.append(m)
def aim(o,t):o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
for p,e,w in [((2,3,4.5),360,4),((-2,-1,3),180,3)]:
    bpy.ops.object.light_add(type='AREA',location=p);o=bpy.context.object;o.data.energy=e;o.data.size=w;aim(o,(0,0,1))
bpy.ops.object.camera_add(location=(0,6.1,1.57));o=bpy.context.object;aim(o,(0,0,1.0));o.data.type='ORTHO';o.data.ortho_scale=4.35;scene.camera=o
scene.render.engine='CYCLES';scene.cycles.samples=5;scene.cycles.use_denoising=True;scene.cycles.max_bounces=2;scene.render.resolution_x=864;scene.render.resolution_y=456;scene.render.resolution_percentage=100
for i in range(30):
    scene.frame_set(i*2);scene.render.filepath=str(out/f'{i:03}.png');bpy.ops.render.render(write_still=True)
