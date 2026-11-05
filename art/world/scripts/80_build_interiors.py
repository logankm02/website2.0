"""Furnished city rooms. Run through Blender MCP; keeps other scenes."""
import bpy, sys, json, struct, math
from pathlib import Path
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
from world_core import box, mat, join
from room_furniture import furnish
from room_dimensions import ROOM_SIZE

ROOMS=[('education','ΛΚΜ House',(.72,.66,.53),(.30,.16,.065)),
       ('experience','LOGAN & CO.',(.31,.37,.43),(.13,.17,.21)),
       ('projects','LOGAN LABS',(.64,.66,.62),(.36,.38,.36))]
stage=Path('/private/tmp/logan-furnished-rooms');stage.mkdir(exist_ok=True)
for room_id,label,wall_color,floor_color in ROOMS:
    w,d=ROOM_SIZE[room_id]
    if globals().get('ROOM_ID',room_id) != room_id:
        continue
    folder=stage/room_id;folder.mkdir(exist_ok=True)
    scene=bpy.data.scenes.new('City interior — '+room_id);bpy.context.window.scene=scene
    scene.render.engine='CYCLES';scene.cycles.samples=20;scene.cycles.use_denoising=True
    scene.render.resolution_x=1100;scene.render.resolution_y=760;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
    scene.world=bpy.data.worlds.new(label+' room ambience');scene.world.use_nodes=True
    bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Color'].default_value=(.8,.85,1,1);bg.inputs['Strength'].default_value=.35
    wall=mat(label+' interior walls',wall_color,.9)
    floor=mat(label+' interior floor',floor_color,.85)
    trim=mat(label+' painted trim',(.82,.80,.72),.8)
    door=mat(label+' exit door',(.065,.13,.17),.75)
    window=mat(label+' daylight panes',(.65,.80,.88),.45)
    shader=next(n for n in window.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Emission Color'].default_value=(.6,.75,.85,1);shader.inputs['Emission Strength'].default_value=.6
    h=4.6
    box('Room floor',(0,0,-.12),(w+.5,d+.5,.24),floor)
    box('Room ceiling',(0,0,h+.1),(w+.5,d+.5,.2),trim)
    collision=[]
    for x,y,hx,hy in [(-w/2,0,.12,d/2),(w/2,0,.12,d/2),(0,-d/2,w/2,.12),(0,d/2,w/2,.12)]:
        box('Room wall',(x,y,h/2),(hx*2,hy*2,h),wall)
        box('Room skirting',(x,y,.12),(hx*2+.08,hy*2+.08,.24),trim,.02)
        collision.append({'x':x,'z':-y,'hx':hx,'hz':hy,'minY':0,'maxY':h})
    # Floor finish varies by building.
    if room_id=='education':
        seam=mat('Oak floor seams',(.16,.08,.035),.9)
        for i in range(int(w/.42)):
            box('Floorboard seam',(-w/2+(i+1)*.42,0,.002),(.012,d-.3,.004),seam)
    elif room_id=='projects':
        seam=mat('Concrete expansion joints',(.24,.26,.24),1)
        for x in [-6,-3,0,3,6]: box('Floor expansion joint',(x,0,.002),(.012,d-.3,.004),seam)
    # Flush closed door provides a clear E-key exit target inside the room.
    box('Exit door frame',(0,-d/2+.14,1.55),(2.1,.12,3.1),trim,.035)
    box('Exit door',(0,-d/2+.22,1.48),(1.8,.06,2.95),door,.02)
    box('Exit door handle',(.65,-d/2+.3,1.3),(.08,.12,.25),trim,.025)
    for x in [-w*.40,w*.40]:
        box('Window frame',(x,d/2-.14,2.5),(2.3,.12,1.9),trim,.03)
        box('Daylight window',(x,d/2-.22,2.5),(2.08,.05,1.68),window)
        box('Window mullion',(x,d/2-.27,2.5),(.055,.06,1.75),trim)
    prefix='interiors/'+room_id+'/'
    manifest={'version':2,'name':label,'interior':room_id,'ceilingHeight':h,'spawn':[0,-d/2+4.6],
      'world':prefix+'room.glb','heightmap':prefix+'heightmap.bin','placements':prefix+'placements.bin',
      'terrain':{'size':40,'resolution':2,'minX':-20,'minY':-20},'assets':[],'groups':[],
      'landmarks':[],'collision':collision,'bounds':{'minX':-w/2+.15,'maxX':w/2-.15,'minZ':-d/2+.15,'maxZ':d/2-.15},
      'locations':[{'id':'exit','label':'Outside '+label,'kind':'Exit','position':[0,0,d/2-.5],'radius':3.0,
        'travel':'/world?from='+room_id,'body':'Return to the city outside this building.',
        'links':[{'label':'Back outside','href':'/world?from='+room_id}]}]}
    furnish(room_id, manifest)
    scene['interior_manifest']=json.dumps(manifest)
    (folder/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
    (folder/'heightmap.bin').write_bytes(struct.pack('<4f',0,0,0,0));(folder/'placements.bin').write_bytes(b'')
    for x,y in [(-w*.22,0),(w*.22,d*.18)]:
        bpy.ops.object.light_add(type='AREA',location=(x,y,h-.3));light=bpy.context.object;light.data.energy=420;light.data.shape='DISK';light.data.size=5
    bpy.ops.object.camera_add(location=(.1,-d*.43,2.65));cam=bpy.context.object
    cam.rotation_euler=(Vector((0,d*.2,1.7))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=17;scene.camera=cam
    scene.render.filepath=str(folder/'preview.png')
    # Soften bevel chamfers into rounded chunky edges, matching the city.
    # The join below doesn't bake modifiers, so apply each one first.
    room_meshes=[o for o in scene.objects if o.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in room_meshes: o.select_set(True)
    if room_meshes:
        bpy.context.view_layer.objects.active=room_meshes[0]
        bpy.ops.object.shade_auto_smooth(angle=math.radians(30))
    for o in room_meshes:
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active=o
        mod=next((m for m in o.modifiers if m.type=='NODES'),None)
        if mod: bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.libraries.write(str(folder/'room.blend'),{scene},fake_user=True,compress=True)
    # Merge only the generated room meshes for a small browser GLB.
    join([obj for obj in scene.objects if obj.type == 'MESH'],'Furnished room '+room_id)
    bpy.ops.export_scene.gltf(filepath=str(folder/'room.glb'),export_format='GLB',use_selection=True,use_active_scene=True,
      export_animations=False,export_cameras=False,export_lights=False,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
    if globals().get('RENDER_PREVIEW', True): bpy.ops.render.render(write_still=True)
    print(room_id,'ready:',(folder/'room.glb').stat().st_size,'bytes')
