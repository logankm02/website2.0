"""Render the local loading illustration from the exported city and its vegetation placements."""
import array
import json
import math
from pathlib import Path
import sys
import bpy
import bmesh
from mathutils import Vector

base = Path(sys.argv[sys.argv.index('--') + 1])
out = Path(sys.argv[sys.argv.index('--') + 2])
args = sys.argv[sys.argv.index('--')+1:]
campus = args[2] if len(args)>2 else None
manifest_dir = base/'campuses'/campus if campus else base
manifest = json.loads((manifest_dir / 'manifest.json').read_text())
if campus:
    bpy.context.window.scene = bpy.data.scenes.new(campus+' arrival illustration')
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=str(base / manifest.get('world','village.glb')))
for obj in ([] if campus else bpy.context.selected_objects):
    if obj.type != 'MESH':
        continue
    hidden = {i for i, slot in enumerate(obj.material_slots) if slot.material
              and slot.material.name.startswith(('Atmospheric ridge', 'Mountain rock and snow', 'Villager '))}
    if hidden:
        edit = bmesh.new()
        edit.from_mesh(obj.data)
        bmesh.ops.delete(edit, geom=[f for f in edit.faces if f.material_index in hidden], context='FACES')
        edit.to_mesh(obj.data)
        edit.free()

if campus:
    bpy.ops.import_scene.gltf(filepath=str(base / manifest['detailModel']))
rows = array.array('f')
rows.frombytes((base / manifest.get('placements','placements.bin')).read_bytes())
paving = {(i,j) for x,y,w,h in manifest.get('layout',{}).get('PATHS',[])
          for i in range(x,x+w) for j in range(y,y+h)}
for asset, group in ((a, g) for a in manifest['assets'] for g in manifest['groups'] if a['kind'] == g['kind']):
    bpy.ops.import_scene.gltf(filepath=str(base / asset.get('lodUrl', asset['url'])))
    coll = bpy.data.collections.new(asset['kind'])
    for obj in list(bpy.context.selected_objects):
        for owner in list(obj.users_collection):
            owner.objects.unlink(obj)
        coll.objects.link(obj)
    step = 24 if asset['kind'] == 'grass' else 3 if asset['kind'].startswith('flowers') else 1
    for i in range(group['offset'], group['offset'] + group['count'], step):
        x, y, z, scale, angle = rows[5*i:5*i+5]
        if (asset['kind']=='grass' or asset['kind'].startswith('flowers')) and (math.floor(x/2.4+12),math.floor(10.5-y/2.4)) in paving:
            continue
        if not campus and (y < -20 or math.hypot(x-8.2, y-.3) < 3.9):
            continue
        ob = bpy.data.objects.new(asset['kind'], None)
        scene.collection.objects.link(ob)
        ob.instance_type = 'COLLECTION'
        ob.instance_collection = coll
        ob.location = (x, y, z)
        ob.rotation_euler.z = angle
        ob.scale = (scale,) * 3

views = {'rochester': ((-8,-13,8),(0,15.5,10.2),26), 'berkeley': ((13,-24,12),(-5,15.6,16.4),26)}
origin, focus, lens = views.get(campus, ((24,-40,14.2),(8,9,6.8),30))
bpy.ops.object.camera_add(location=origin)
camera = bpy.context.object
camera.rotation_euler = (Vector(focus) - camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.lens = lens
camera.data.clip_end = 550
scene.camera = camera
bpy.ops.object.light_add(type='SUN')
light = bpy.context.object
light.rotation_euler = (.54,-.45,-.45)
light.data.energy = 3.1
light.data.angle = .13
scene.world = bpy.data.worlds.new('Daylight')
scene.world.use_nodes = True
bg = next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs[0].default_value = (.47,.68,.92,1)
bg.inputs[1].default_value = .7
scene.render.engine = 'CYCLES'
scene.cycles.samples = 6
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 3
scene.render.resolution_x = 1152
scene.render.resolution_y = 648
scene.render.resolution_percentage = 100
scene.render.filepath = str(out)
bpy.ops.render.render(write_still=True)
