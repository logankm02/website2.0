"""Export only the authored world; merge static geometry, retain GPU instances."""
import bpy, struct, json
from pathlib import Path
from world_core import *
source=bpy.context.scene
assert source.name.startswith('LOGAN CITY')
OUT=Path(__file__).resolve().parents[1]
stage=Path('/private/tmp/logan-city-stage'); stage.mkdir(exist_ok=True)
manifest={'version':1,'coordinateSystem':'blender-z-up','assets':[], 'placementStride':5, 'groups':[], 'terrain':{'size':180,'resolution':241,'minX':-90,'minY':-80},'landmarks':[]}
manifest.update(json.loads(source['city_manifest']))
manifest['coordinateSystem']='blender-z-up'
# Binary placement records: Blender x,y,z, uniform scale, Z rotation.
placements=json.loads(source['placements'] if 'placements' in source else (OUT/'data/placements.json').read_text())
rows=[]
for kind in sorted({p['kind'] for p in placements}):
    subset=[p for p in placements if p['kind']==kind]
    manifest['groups'].append({'kind':kind,'offset':len(rows)//5,'count':len(subset)})
    for p in subset: rows.extend([*p['position'],p['scale'],p['yaw']])
(stage/'placements.bin').write_bytes(struct.pack('<%sf'%len(rows),*rows))
terrain=next(o for o in source.objects if o.get('terrain')); heights=[v.co.z for v in terrain.data.vertices]
(stage/'heightmap.bin').write_bytes(struct.pack('<%sf'%len(heights),*heights))
# Keep editable original scene separate from export staging.
export=bpy.data.scenes.new('Browser export staging')
deps=bpy.context.evaluated_depsgraph_get()
static=[]
for ob in list(source.objects):
    if ob.type not in {'MESH','CURVE','FONT'} or ob.get('prototype') or ob.get('instance_kind') or ob.get('vegetation_chunk'): continue
    ev=ob.evaluated_get(deps); data=bpy.data.meshes.new_from_object(ev,depsgraph=deps)
    copy=bpy.data.objects.new(ob.name,data); copy.matrix_world=ob.matrix_world.copy(); export.collection.objects.link(copy); static.append(copy)
bpy.context.window.scene=export
parts=[o for o in static if o.name.split('.')[0] not in {'Terrain','Pond'}]
# Identify by source-prefix as Blender object names are globally unique.
parts=[o for o in static if not o.name.startswith('Logan Terrain') and not o.name.startswith('Pond turquoise water')]
merged=join(parts,'Village architecture and landscape')
# Joining uncolored parts with colored ivy creates zero-alpha vertex slots.
# White is the neutral multiplier for those ordinary PBR materials.
for ob in [merged]+[o for o in source.objects if o.get('prototype')]:
    for attr in ob.data.color_attributes:
        for c in attr.data:
            if c.color[3] == 0: c.color=(1,1,1,1)
settings=dict(export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_vertex_color='ACTIVE')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(stage/'village.glb'),**settings)
for ob in list(export.objects): bpy.data.objects.remove(ob,do_unlink=True)
for ob in list(source.objects):
    if not ob.get('prototype'): continue
    kind=ob.name
    if not any(g['kind']==kind for g in manifest['groups']): continue
    clone=bpy.data.objects.new(kind+' export',ob.data.copy()); export.collection.objects.link(clone)
    bpy.ops.object.select_all(action='DESELECT'); clone.select_set(True); bpy.context.view_layer.objects.active=clone
    bpy.ops.export_scene.gltf(filepath=str(stage/(kind+'.glb')),**settings)
    asset={'kind':kind,'url':kind+'.glb'}
    if kind.startswith('tree'):
        meshdata=clone.data; keep=[]
        for f in meshdata.polygons:
            if f.material_index==0 or (f.index//6)%3==0: keep.append(f)
        used=sorted({v for f in keep for v in f.vertices}); remap={v:i for i,v in enumerate(used)}
        low=bpy.data.meshes.new(kind+' LOD'); low.from_pydata([meshdata.vertices[i].co for i in used],[],[tuple(remap[i] for i in f.vertices) for f in keep]); low.update()
        for matl in meshdata.materials: low.materials.append(matl)
        for f,orig in zip(low.polygons,keep): f.material_index=orig.material_index; f.use_smooth=orig.use_smooth
        if meshdata.color_attributes:
            orig=meshdata.color_attributes['Color']; color=low.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT')
            for i,j in enumerate(used): color.data[i].color=orig.data[j].color
        clone.data=low
        bpy.ops.export_scene.gltf(filepath=str(stage/(kind+'-lod.glb')),**settings); asset['lodUrl']=kind+'-lod.glb'
    manifest['assets'].append(asset)
    bpy.data.objects.remove(clone,do_unlink=True)
bpy.context.window.scene=source
bpy.data.scenes.remove(export)
(stage/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
print('Browser exports ready:',[(p.name,p.stat().st_size) for p in stage.iterdir() if p.suffix in {'.glb','.bin'}])
