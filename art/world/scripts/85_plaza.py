"""Build an original celestial fountain, promenade mosaic and garden planters.
Run in Blender with runpy. The independent scene exports over the existing city.
"""
import bpy, json, math, random, sys
from pathlib import Path
from mathutils import Vector
from mathutils.noise import noise_vector
scripts = Path(__file__).resolve().parent
sys.path.insert(0, str(scripts))
from world_core import mat, mesh, tube, curve, uvball, join, box
from world_architecture import lathe

root = scripts.parents[2]
stage = Path('/private/tmp/logan-plaza-art')
stage.mkdir(exist_ok=True)
layout = json.loads((root/'public/world/manifest.json').read_text())['layout']
scene = bpy.data.scenes.new('Meridian Court')
bpy.context.window.scene = scene
rng = random.Random(8305)
tau = math.tau
ground = 2.5
stone = mat('Court limestone',(.63,.51,.34),.83)
edge = mat('Court cut travertine',(.86,.72,.49),.78)
blue = mat('Court peacock ceramic',(.026,.19,.23),.32)
bronze = mat('Court patinated bronze',(.23,.17,.078),.42,metal=.60)
gold = mat('Court hammered brass',(.93,.53,.13),.32,metal=.67)
water = mat('Court spring water',(.035,.46,.48),.22,metal=.18)
jet = mat('Court water highlights',(.57,.85,.82),.26)
leaf = mat('Court myrtle leaves',(.06,.28,.09),.83)
bloom = mat('Court coral azalea',(.90,.15,.12),.70)
petal = mat('Court apricot petals',(.98,.55,.23),.76)
terracotta = mat('Court terracotta',(.54,.20,.10),.87)

# Hundreds of individually shaped stones share one mesh and a small palette.
pave = [mat('Promenade sandstone '+str(i), c,.9) for i,c in enumerate([
 (.61,.48,.32),(.68,.54,.38),(.70,.58,.43),(.57,.46,.34),(.66,.49,.33),
 (.43,.47,.44),(.37,.42,.40),(.56,.53,.44)])]
verts,faces,indices=[],[],[]
def slab(outline, z, index):
    mid = Vector((sum(p[0] for p in outline)/len(outline),sum(p[1] for p in outline)/len(outline)))
    base=len(verts); count=len(outline)
    for inset,h in [(0,z-.035),(.018,z)]:
        for x,y in outline:
            d=mid-Vector((x,y))
            d=d.normalized()*min(inset,d.length/3)
            verts.append((x+d.x,y+d.y,h))
    faces.append(tuple(base+count+i for i in range(count))); indices.append(index)
    for i in range(count):
        j=(i+1)%count
        faces.append((base+i,base+j,base+count+j,base+count+i)); indices.append(index)

cells=set()
for x,y,w,h in layout['PATHS']:
    for i in range(x,x+w):
        for j in range(y,y+h):
            cells.add((i,j))
for tx,ty in sorted(cells):
    # Quarter-tile courses are staggered within a tile; outer stones form a curb.
    x0=(tx-12)*2.4; y0=(9.5-ty)*2.4
    for row in range(4):
        cuts = [0,.58,1.70,2.4] if row%2 else [0,1.14,2.4]
        for l,r in zip(cuts,cuts[1:]):
            x=x0+l+.013; xx=x0+r-.013; y=y0+row*.6+.014; yy=y+.571
            trim=((row==0 and (tx,ty+1) not in cells) or (row==3 and (tx,ty-1) not in cells)
                  or (l==0 and (tx-1,ty) not in cells) or (r==2.4 and (tx+1,ty) not in cells))
            slab([(x+.035,y),(xx-.04,y),(xx,y+.045),(xx,yy-.03),(xx-.035,yy),(x+.03,yy),(x,yy-.04),(x,y+.04)],
                 ground+.035+rng.uniform(0,.012),rng.randrange(5,8) if trim else rng.randrange(5))
mesh('Hand laid promenade setts',verts,faces,pave,indices)

cx,cy=8.2,.3
def turn(name,profile,material):
    return lathe(name,(cx,cy,ground),profile,material,80)
def circle(name,r,z,thick,material):
    points=[(cx+r*math.cos(tau*i/72),cy+r*math.sin(tau*i/72),ground+z) for i in range(73)]
    return curve(name,points,thick,material)
turn('Fountain steps',[(.01,.01),(2.8,.01),(2.8,.10),(2.63,.13),(2.61,.2),(2.4,.22),(.01,.22)],stone)
turn('Carved fountain basin',[(1.86,.18),(2.19,.18),(2.24,.26),(2.11,.34),(2.19,.55),(2.28,.60),(2.27,.71),(2.04,.73),(2.0,.62),(1.86,.18)],edge)
circle('Tile band',2.17,.51,.047,blue)
turn('Pool surface',[(.01,.595),(2.07,.595),(2.07,.61),(.01,.61)],water)
turn('Baluster',[(.6,.59),(.65,.72),(.46,.80),(.31,.88),(.25,1.06),(.41,1.21),(.46,1.30),(.39,1.41),(.25,1.52),(.31,1.65),(.55,1.74)],blue)
turn('Upper shell',[(.24,1.64),(.58,1.67),(1.08,1.88),(1.18,1.98),(1.15,2.04),(.93,1.99),(.28,1.83)],edge)
turn('Upper pool',[(.01,1.97),(1.02,1.97),(.01,1.98)],water)
turn('Orrery mounting',[(.25,1.88),(.32,2.01),(.19,2.08),(.13,2.35),(.25,2.42),(.15,2.48)],bronze)
center=Vector((cx,cy,ground+3.07))
for tilt,az,r,material in [(0,0,.66,gold),(.64,.35,.78,bronze),(1.0,-.75,.82,gold)]:
    a=Vector((math.cos(az),math.sin(az),0))
    b=Vector((-math.sin(az)*math.sin(tilt),math.cos(az)*math.sin(tilt),math.cos(tilt)))
    curve('Armillary orbital band',[center+r*(a*math.cos(tau*i/72)+b*math.sin(tau*i/72)) for i in range(73)],.035,material)
uvball('Gilded sun',center,(.30,.30,.30),gold,36,20)
for i in range(12):
    a=tau*i/12
    segment=[(cx+math.cos(a)*(1.08+.58*t),cy+math.sin(a)*(1.08+.58*t),ground+1.99+.12*t-1.50*t*t) for t in [j/13 for j in range(14)]]
    tube('Overflow ribbon',segment,[.029-.012*j/13 for j in range(14)],jet,7)
    for scale in [.12,.21]:
        curve('Surface eddy',[(cx+1.66*math.cos(a)+scale*math.cos(tau*j/25),cy+1.66*math.sin(a)+scale*.70*math.sin(tau*j/25),ground+.62) for j in range(26)],.009,jet)
# Radial mosaic around the basin, with an eight-point compass in ochre and teal.
verts,faces,indices=[],[],[]
for ring,(inner,outer,n) in enumerate([(2.78,3.04,56),(3.04,3.7,56),(3.7,3.91,64),(3.91,4.13,64)]):
    for i in range(n):
        a=tau*i/n+.003; b=tau*(i+1)/n-.003
        def polar(r,angle): return (cx+r*math.cos(angle),cy+r*math.sin(angle))
        slab([polar(inner,a),polar(outer-.012,a),polar(outer-.012,b),polar(inner,b)],ground+.064,
             (1 if i%7 in (0,1,6) else 0) if ring==1 else (2 if ring==2 else 0))
mesh('Meridian pavement border',verts,faces,[edge,blue,bronze],indices)

def planter(x,y,scale):
    def vessel(profile,material,name):
        lathe(name,(x,y,ground),[(r*scale,z*scale) for r,z in profile],material,32)
    vessel([(.30,.02),(.34,.07),(.32,.13),(.43,.42),(.48,.52),(.48,.59),(.42,.6)],terracotta,'Wheel thrown garden urn')
    vessel([(.44,.46),(.465,.49),(.46,.515)],gold,'Glazed lip')
    # Each sprig has folded, pointed leaves and occasional five-petal flowers.
    v,f,mi=[],[],[]
    def polygon(points,material):
        k=len(v); v.extend(points); f.append(tuple(range(k,k+len(points))));mi.append(material)
    for k in range(185):
        a=rng.uniform(0,tau); dist=.43*math.sqrt(rng.random())
        z=.57+.46*math.sqrt(max(0,1-(dist/.45)**2))+rng.uniform(-.07,.07)
        p=Vector((x+scale*dist*math.cos(a),y+scale*dist*math.sin(a),ground+scale*z))
        d=Vector((math.cos(a),math.sin(a),rng.uniform(-.55,.8)))*scale*.20
        side=Vector((-math.sin(a),math.cos(a),0))*scale*.043
        fold=p+d*.48+Vector((0,0,.025*scale))
        for s in [-1,1]:polygon([p,p+d*.43+s*side,p+d,fold],0)
        if k%4:continue
        p.z+=.05*scale
        for j in range(5):
            ang=tau*j/5+a; t=Vector((math.cos(ang),math.sin(ang),.32))*scale*.064
            w=Vector((-math.sin(ang),math.cos(ang),0))*scale*.025
            polygon([p,p+t*.65-w,p+t,p+t*.65+w],1+(k%3==0))
    mesh('Azaleas in bloom',v,f,[leaf,bloom,petal],mi)
for x,y,s in [(-20,7.8,1.10),(-7.8,7.8,1.15),(.85,7.75,1.22),(13.9,7.75,1.22),(23.2,7.65,1.25),(41.8,7.65,1.25),(-6.5,-9.7,.85)]:
    planter(x,y,s)

from court_landscape import landscape, flowering_tree
ridge=landscape()
canopy=flowering_tree()
from city_storefronts import storefronts
storefronts(json.loads((root/'public/world/manifest.json').read_text())['landmarks'])
# Convert the dimensional lettering before batching it with the storefront geometry.
bpy.ops.object.select_all(action='DESELECT')
letters=[o for o in scene.objects if o.type=='FONT']
for ob in letters: ob.select_set(True)
if letters:
    bpy.context.view_layer.objects.active=letters[0]
    bpy.ops.object.convert(target='MESH')
# Keep the color-painted meshes separate in the export.
# Save the editable scene before consolidating objects for the browser.
bpy.data.libraries.write(str(stage/'meridian-court.blend'),{scene},fake_user=True,compress=True)
join([o for o in scene.objects if o not in (ridge,canopy)],'Meridian Court')
ridge.select_set(True); canopy.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(stage/'meridian-court.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_draco_mesh_compression_enable=True)
# Flat paths are traversable. The basin and pots are solid in the game.
solids=[(cx,cy,2.25,2.1),(-3.5,15.6,.32,3.7),(24.,-2.3,.27,3.4)]+[(x,y,.46*s,1.1*s) for x,y,s in [(-20,7.8,1.10),(-7.8,7.8,1.15),(.85,7.75,1.22),(13.9,7.75,1.22),(23.2,7.65,1.25),(41.8,7.65,1.25),(-6.5,-9.7,.85)]]
(stage/'solids.json').write_text(json.dumps([dict(x=x,z=-y,hx=r,hz=r,minY=ground,maxY=ground+h,detail='court') for x,y,r,h in solids]))
