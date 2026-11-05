"""Author Berkeley's instanced redwood and its distance mesh. Use a fresh background Blender."""
import bpy, math, json, random, struct, sys
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent
sys.path.insert(0,str(here))
from landmark_masonry import Detail, TAU
art=here.parent
public=art.parents[1]/'public/world/campuses/berkeley'
for low in (False,True):
    scene=bpy.data.scenes.new('Strawberry Creek redwood'+(' LOD' if low else ''));bpy.context.window.scene=scene
    g=Detail();rng=random.Random(2805)
    wood=g.material('Sequoia reddish bark',(.24,.083,.043))
    dark=g.material('Redwood shadow needles',(.034,.133,.088))
    mid=g.material('Redwood fern green',(.064,.215,.127))
    tip=g.material('Redwood new growth',(.149,.303,.161))
    g.turn(wood,(0,0,0),[(.77,0),(.56,.63),(.39,2.3),(.3,7),(.11,13),(.018,16.2)],24 if not low else 12,.13)
    for tier in range(14):
        z=2.3+tier*.97
        width=(1-(z-2)/15)**.76*3.08
        for j in range(7):
            a=j*TAU/7+tier*2.399+rng.uniform(-.16,.16);c=math.cos(a);s=math.sin(a)
            r=width*rng.uniform(.74,1.13);h=z+rng.uniform(-.28,.28)
            end=Vector((r*c,r*s,h+.33));root=Vector((.12*c,.12*s,h+.03))
            g.rod(wood,root,end,.052 if tier<7 else .031,5)
            steps=6 if low else 13
            for k in range(steps):
                t=(k+.45)/steps
                pos=root.lerp(end,t); fan=(.34+.61*math.sin(math.pi*t))*(1-.028*tier)
                for sign in (-1,1):
                    spread=fan*sign
                    p=pos+Vector((.36*c-spread*s,.36*s+spread*c,-.10))
                    v=Vector((-.09*s,.09*c,.10))
                    ahead=Vector((.30*c,.30*s,.09))
                    g.surface([dark,mid,mid,tip][rng.randrange(4)],[pos-v,p-v,p+ahead,p+v,pos+v],[(0,1,2),(0,2,4),(4,2,3)])
    g.finish()
    path='redwood-lod' if low else 'redwood'
    if not low:bpy.data.libraries.write(str(art/'blend/glade-redwood.blend'),{scene},fake_user=True,compress=True)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=str(public/(path+'.glb')),export_format='GLB',use_active_scene=True,use_selection=True,export_draco_mesh_compression_enable=True,export_animations=False)
m=json.loads((public/'manifest.json').read_text())
conifer=next(a for a in m['assets'] if a['kind']=='tree-1')
conifer.update(url='campuses/berkeley/redwood.glb',lodUrl='campuses/berkeley/redwood-lod.glb')
# Move two broadleaf trees to the edge of their planting areas, keeping the path and the tower's approach clear.
buf=bytearray((public/'placements.bin').read_bytes())
group=next(g for g in m['groups'] if g['kind']=='tree-0')
for i in range(group['offset'],group['offset']+group['count']):
    x,y=struct.unpack_from('<ff',buf,i*20)
    for old,new in [((3.6,-2.4),(1.2,-5.4)),((-3.6,12.0),(-1.3,14.1))]:
        if math.hypot(x-old[0],y-old[1])<.03:struct.pack_into('<ff',buf,i*20,*new)
(public/'glade-placements.bin').write_bytes(buf)
m['placements']='campuses/berkeley/glade-placements.bin'
(public/'manifest.json').write_text(json.dumps(m,separators=(',',':')))
