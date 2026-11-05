"""Rebuild one campus from its original editable blend. Run via Blender MCP in background."""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent
sys.path.insert(0,str(here))
from landmark_masonry import Detail, palette, bed, TAU
from campus_orientation import orient_hall, update_doors, INWARD_HALLS, hall_transform

slug=sys.argv[-1]
art=here.parent
public=art.parents[1]/'public/world/campuses'/slug
source=bpy.context.scene
district=bpy.data.scenes.new('Rush Rhees and Eastman Quad' if slug=='rochester' else 'Sather Tower and Memorial Glade')
bpy.context.window.scene=district
g=Detail()
lim,iv,shadow,brick,bronze,glass,copper,slate,bell,dial,granite,marble,oak,iron,navy,gold=palette(g)
g.material('Garden foliage',(.093,.27,.087))
petals=[g.material('Flower '+s,color) for s,color in [('dahlia',(.83,.29,.10)),('aster',(.58,.35,.65)),('ivory',(.94,.80,.48)),('poppy',(.99,.45,.025))]]
solids=[]
def garden(x,y,w,d,colors,seed):
    bed(g,x,y,w,d,colors,seed)
    solids.append(dict(x=x,z=-y,hx=w/2,hz=d/2,minY=2.5,maxY=3,detail='landmark garden'))

def arch(material,X,Y,Z,r,h,angle=0):
    # A raised arch, assembled from real radial voussoirs.
    C,S=math.cos(angle),math.sin(angle)
    def point(u,v,z):return (X+C*u-S*v,Y+S*u+C*v,z)
    for i in range(13):
        lo=math.pi*i/13+.009;hi=math.pi*(i+1)/13-.009
        shape=[(math.cos(a)*R,Z+h+math.sin(a)*R) for R,a in [(r,lo),(r+.14,lo),(r+.14,hi),(r,hi)]]
        g.surface(material,[point(u,v,z) for v in (-.10,.06) for u,z in shape],[(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)])
    for sign in (-1,1):g.block(material,point(sign*(r+.07),0,Z+h/2),(.14,.19,h),angle)

def bench(x,y):
    for j in range(4):g.block(oak,(x,y+j*.12,2.99),(2.12,.10,.085))
    for j in range(3):g.block(oak,(x,y+.42,3.17+j*.15),(2.12,.075,.10))
    for s in (-.82,.82):
        for d in (.02,.38):g.rod(iron,(x+s,y+d,2.51),(x+s,y+d,3.01),.043)
        g.rod(iron,(x+s,y+.39,2.6),(x+s,y+.44,3.54),.037)
    solids.append(dict(x=x,z=-y-.2,hx=1.08,hz=.28,minY=2.5,maxY=3.55,detail='landmark garden'))

def rochester():
    X,Y=0,16.8
    for z,w,d,h,m in [(2.82,19.2,7.2,.64,shadow),(6.19,19,7,6.16,brick),(9.35,19.4,7.3,.27,iv),(9.60,19.6,7.5,.22,shadow),(9.80,19.45,7.55,.23,iv)]:
        g.block(m,(X,Y,z),(w,d,h))
    # A low hipped roof, leaving the book tower visible from the quad.
    g.surface(slate,[(-9.9,13,9.91),(9.9,13,9.91),(9.9,20.6,9.91),(-9.9,20.6,9.91),(-7,16.8,11.25),(7,16.8,11.25)],[(0,1,5,4),(1,2,5),(2,3,4,5),(3,0,4)])
    for x in [-8.35,-6.55,-4.8,4.8,6.55,8.35]:
        for z in (4.78,7.72):
            g.block(lim,(x,13.23,z),(1.23,.21,2.15));g.block(glass,(x,13.09,z),(1.02,.09,1.92))
            for t in [-.24,0,.24]:g.block(bronze,(x+t,13.03,z),(.033,.035,1.9))
            for t in [-.55,0,.55]:g.block(iv,(x,13.03,z+t),(1.02,.04,.044))
            g.block(iv,(x,13.04,z-1.08),(1.43,.36,.12))
    for x in [-2.6,0,2.6]:
        g.block(oak,(x,13.18,4.44),(1.58,.18,2.87))
        arch(iv,x,13.08,3.02,.79,2.67)
        for u in (-.40,.4):g.block(glass,(x+u,13.06,4.85),(.6,.06,1.44))
    # Six fluted Doric columns with echinus, abacus, triglyphs and an incised frieze.
    for i in range(6):
        x=(i-2.5)*1.45
        g.turn(lim,(x,12.37,2.76),[(.41,0),(.41,.18),(.35,.23),(.31,4.72),(.34,4.80),(.41,4.90),(.43,5.00)],48,.06)
        g.block(iv,(x,12.37,7.82),(.88,.83,.18))
    for j in range(3):
        g.block(lim,(0,12.46+j*.14,2.54+j*.085),(8.75-.2*j,1.75-.20*j,.10))
    for z,w,h,m in [(7.98,8.56,.23,shadow),(8.23,8.65,.35,lim),(8.47,8.9,.16,iv)]:
        g.block(m,(0,12.66,z),(w,1.93,h))
    g.lettering(bronze,'R U S H   R H E E S   L I B R A R Y',(0,11.675,8.22),.245)
    vs=[(x,y,z) for y in (11.65,13.5) for x,z in [(-4.54,8.52),(4.54,8.52),(0,10.04)]]
    g.surface(lim,vs,[(0,1,2),(5,4,3),(0,3,4,1),(1,4,5,2),(2,5,3,0)])
    for s in (-1,1):g.rod(iv,(4.54*s,11.63,8.55),(0,11.63,10.08),.107)
    # Relief seal and laurel sprays carved into the triangular tympanum.
    g.rod(shadow,(0,11.63,9.04),(0,11.55,9.04),.38,48)
    g.rod(iv,(0,11.54,9.04),(0,11.49,9.04),.307,48)
    g.lettering(bronze,'R',(0,11.47,8.87),.42)
    for side in (-1,1):
        for j in range(12):
            u=.40+j*.14; base=8.79+j*.017
            g.rod(iv,(side*u,11.56,base),(side*(u+.17),11.55,base+.16),.052)
            g.rod(iv,(side*u,11.56,base),(side*(u+.14),11.55,base-.09),.039)
    for i in range(25):g.block(shadow,((i-12)*.34,11.62,8.47),(.073,.17,.11))
    g.turn(lim,(0,Y,10.3),[(3.58,0),(3.58,.31),(3.37,.43),(3.31,4.0),(3.6,4.09),(3.6,4.39),(3.20,4.52)],72)
    for i in range(16):
        a=TAU*i/16; s,c=math.sin(a),math.cos(a)
        g.block(glass,(3.32*s,Y-3.32*c,12.77),(.70,.085,2.24),a)
        for off in (-.46,.46):
            g.block(iv,(3.35*s+off*c,Y-3.35*c+off*s,12.77),(.13,.14,2.52),a)
        for off in [-.6,0,.6]:g.block(bronze,(3.38*s,Y-3.38*c,12.77+off),(.69,.075,.056),a)
    profile=[(3.26*math.cos(j*1.23/20),3.05*math.sin(j*1.23/20)) for j in range(21)]
    g.turn(copper,(0,Y,14.82),profile,80)
    for j in range(24):
        a=TAU*j/24
        pts=[(r*math.cos(a),Y+r*math.sin(a),14.84+z) for r,z in profile]
        for p,q in zip(pts,pts[1:]):g.rod(copper,p,q,.032,5)
    g.turn(iv,(0,Y,17.62),[(1.16,0),(1.16,.18),(.99,.31)],48)
    for k in range(8):
        a=TAU*k/8
        g.turn(iv,(.85*math.cos(a),Y+.85*math.sin(a),17.91),[(.13,0),(.13,.14),(.105,1.11),(.16,1.23)],16)
    g.turn(bell,(0,Y,18),[(.5,0),(.5,.09),(.38,.17),(.27,.54),(.15,.61)],32)
    g.turn(copper,(0,Y,19.09),[(1.07,0),(1.08,.13),(.89,.22),(.65,.56),(.28,.79),(.13,.92)],48)
    g.turn(bell,(0,Y,19.97),[(.18,0),(.12,.21),(.15,.30),(.08,.40),(.02,.81)],20)
    for x in (-6.6,6.6):
        garden(x,10.7,4.1,.96,petals[:3],int(x*10));bench(x,5.7)

def berkeley():
    X,Y=-8.4,15.6
    # A lightly battered granite shaft with recessed lancets on each elevation.
    for w,z,h,m in [(4.7,2.69,.36,shadow),(4.55,2.98,.22,granite),(4.32,12.15,18.12,granite),(4.45,21.35,.32,marble),(4.42,22.8,2.65,granite),(4.64,24.27,.28,marble)]:
        g.block(m,(X,Y,z),(w,w,h))
    for side in range(4):
        a=side*math.pi/2; c,s=math.cos(a),math.sin(a)
        def P(u,v,z):return (X+c*u+s*v,Y+s*u-c*v,z)
        for u in (-1.96,1.96):
            g.block(marble,P(u,2.16,12.35),(.16,.14,17.9),a)
        for j in range(20):
            g.block(shadow,P(0,2.164,3.4+j*.89),(4.14,.015,.021),a)
        for z in [5.6,8.2,10.8,13.4,16,18.6]:
            for u in (-.27,.27):
                g.block(shadow,P(u,2.18,z),(.28,.039,1.02),a)
                g.block(glass,P(u,2.21,z),(.14,.033,.90),a)
        p=P(0,2.205,22.72)
        for m,v,r in [(shadow,2.21,1.13),(bell,2.26,1.065),(dial,2.30,.986)]:
            g.rod(m,P(0,v-.04,22.72),P(0,v+.015,22.72),r,64)
        nums=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI']
        for j in range(60):
            t=TAU*j/60; rad=.91; l=.11 if j%5==0 else .045
            g.rod(bronze,P(rad*math.sin(t),2.336,22.72+rad*math.cos(t)),P((rad-l)*math.sin(t),2.336,22.72+(rad-l)*math.cos(t)),.014 if j%5==0 else .009,5)
        for j,num in enumerate(nums):
            t=TAU*j/12
            g.lettering(bronze,num,P(.735*math.sin(t),2.34,22.72+.735*math.cos(t)),.217,a)
        for t,length in [(-1.08,.50),(1.03,.72)]:
            g.rod(iron,P(0,2.37,22.72),P(length*math.sin(t),2.37,22.72+length*math.cos(t)),.045,8)
        # Open observation deck, marble arches, brass bells and a balustrade.
        for u in [-2.01,0,2.01]:
            g.block(granite,P(u,1.98,26.04),(.46,.45,3.4),a)
            g.block(marble,P(u,1.98,27.24),(.62,.58,.19),a)
        for u in (-1,1):
            xx,yy,z=P(u,1.98,24.47)
            arch(marble,xx,yy,z,.77,2.16,a)
        for j in range(12):
            u=(j-5.5)*.33
            g.rod(iron,P(u,2.05,24.5),P(u,2.05,25.12),.028)
        g.rod(bronze,P(-2.09,2.05,25.12),P(2.09,2.05,25.12),.045)
    for x,y,r in [(-.77,-.50,.54),(.66,.39,.61),(.54,-.79,.40)]:
        g.turn(bell,(X+x,Y+y,25.8),[(r,0),(r,.09),(.83*r,.17),(.55*r,.68),(.30*r,.78)],28)
    for w,z,h in [(4.64,27.83,.24),(4.83,28.06,.18),(4.61,28.25,.19)]:g.block(marble,(X,Y,z),(w,w,h))
    base=2.30
    corners=[(X+a*base,Y+b*base,28.34) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    tip=(X,Y,33.12)
    g.surface(marble,corners+[tip],[(i,(i+1)%4,4) for i in range(4)])
    for j in range(4):
        g.rod(granite,corners[j],tip,.06)
        x,y,z=corners[j]
        g.turn(marble,(x,y,28.25),[(.22,0),(.22,.28),(.14,.42),(.07,.63),(.012,.82)],12)
    g.turn(bell,tip,[(.13,0),(.15,.18),(.06,.28),(.02,.78)],16)
    g.block(oak,(X,Y-2.18,3.75),(1.16,.12,2.43));arch(marble,X,Y-2.22,2.54,.64,1.79)
    for x in (-12.3,-4.4):
        garden(x,13.8,1.32,3.65,[petals[3],petals[2]],int(x*10));bench(x,9.25)

def quad_surroundings():
    layout=json.loads((public/'manifest.json').read_text())
    for hall in layout['landmarks']:
        if hall['id'] in ('RUSH RHEES LIBRARY','campanile'):continue
        detail_start={key:len(value[0]) for key,value in g.data.items()}
        x,y,z=hall['center'];hw,hd,_=hall['half'];front=y-hd
        # Stone quoins wrap the outer corners. Contrasting drips and shallow
        # rustication give each hall a visible base, middle and roof edge.
        doe=hall['id']=='DOE LIBRARY'
        height=7.3 if doe else 6.5
        for side in (-1,1):
            for j in range(12):
                g.block(lim,(x+side*(hw-.26),front-.066,z+.29+j*(height-.46)/12),(.51 if j%2 else .72,.23,.36))
                g.block(lim,(x+side*(hw+.026),front+.23,z+.29+j*(height-.46)/12),(.13,.46 if j%2 else .62,.36))
        for j in range(int(hw*3)):
            g.block(iv,(x-hw+.25+j*.66,front-.10,z+height-.22),(.16,.29,.19))
        if doe:
            g.block(lim,(x,front-1.83,8.42),(12.91,.23,.40))
            g.lettering(bronze,'D O E    M E M O R I A L    L I B R A R Y',(x,front-1.96,8.31),.25)
            for i in [-1,1]:
                g.rod(iv,(x,front-1.98,10.91),(x+i*6.50,front-1.98,8.65),.11)
            for yy in (y-2.8,y,y+2.8):
                for zz in (4.85,7.75):
                    g.block(lim,(x-hw-.05,yy,zz),(.18,1.36,1.94))
                    g.block(glass,(x-hw-.15,yy,zz),(.07,1.14,1.70))
                    g.block(iv,(x-hw-.20,yy,zz),(.05,.055,1.70))
                    g.block(iv,(x-hw-.20,yy,zz),(.05,1.15,.055))
        else:
            for u in [-1,1]:
                g.block(navy,(x+u*1.49,front-.20,5.23),(.40,.09,1.39))
                g.block(bell,(x+u*1.49,front-.25,4.68),(.40,.04,.085))
        if slug=='rochester' and hall['id'] in INWARD_HALLS:
            transform=hall_transform(hall['id'])
            for material,(points,faces) in g.data.items():
                start=detail_start.get(material,0)
                points[start:]=[tuple(transform @ Vector(point)) for point in points[start:]]
if slug=='berkeley':
    gate=next(f for f in json.loads((public/'manifest.json').read_text())['layout']['furniture'] if f['kind']=='satherGate')
    cx=(gate['x']+(gate['w']-1)/2-11.5)*2.4;cy=(10-gate['y']-(gate.get('h',1)-1)/2)*2.4
    span=gate['w']*1.2-1
    for side in (-1,1):
        for j in range(9):
            a=math.pi*(.1+.75*j/9)
            u=span*(j+1)/11
            rad=.16+.19*math.sin(a)
            pts=[(cx+side*(u+rad*math.cos(k*TAU/16)),cy-.09,7.65+rad*math.sin(k*TAU/16)) for k in range(17)]
            for p,q in zip(pts,pts[1:]):g.rod(copper,p,q,.032,5)
        xx=cx+side*span
        g.turn(copper,(xx,cy,7.27),[(.42,0),(.35,.13),(.21,.26),(.19,.46)],24)
        g.turn(dial,(xx,cy,7.72),[(.22,0),(.28,.12),(.24,.46),(.15,.56)],16)
        g.turn(bronze,(xx,cy,8.27),[(.30,0),(.19,.11),(.07,.23)],16)
quad_surroundings()
(rochester if slug=='rochester' else berkeley)()
g.finish()
hero='rush-rhees' if slug=='rochester' else 'sather-tower'
bpy.data.libraries.write(str(art/'blend'/(hero+'.blend')),{district},fake_user=True,compress=True)
# Recover original editable campus objects, omitting only the superseded landmark.
bpy.context.window.scene=source
deps=bpy.context.evaluated_depsgraph_get()
for ob in list(source.objects):
    if ob.type not in {'MESH','FONT','CURVE'} or any(ob.get(k) for k in ('prototype','instance_kind','vegetation_chunk')):continue
    if ob.name.startswith('Far snow'):continue
    ev=ob.evaluated_get(deps)
    mid=ob.matrix_world @ (sum((Vector(c) for c in ev.bound_box),Vector())/8)
    if slug=='rochester' and abs(mid.x)<10.06 and 11.1<mid.y<21.0:continue
    if slug=='berkeley' and abs(mid.x+8.4)<2.70 and abs(mid.y-15.6)<2.70:continue
    data=bpy.data.meshes.new_from_object(ev,depsgraph=deps)
    copy=bpy.data.objects.new(ob.name,data);district.collection.objects.link(copy);copy.matrix_world=ob.matrix_world.copy()
    if slug=='rochester':orient_hall(ob,copy,mid)
    if ob.name.startswith('Distant ridge'):copy.scale.z*=.28 if slug=='rochester' else .50
bpy.context.window.scene=district
from world_core import join
if slug=='rochester':
    bpy.data.libraries.write(str(art/'blend/rochester-quad.blend'),{district},fake_user=True,compress=True)
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = next(o for o in district.objects if o.type == 'MESH')
bpy.ops.object.convert(target='MESH')
parts=[o for o in district.objects if not o.name.startswith('Campus Terrain')]
parts.sort(key=lambda ob: ob.data.name != 'Indiana limestone')
join(parts,hero+' campus architecture')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(public/'campus.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_draco_mesh_compression_enable=True,export_vertex_color='ACTIVE')
manifest=public/'manifest.json'
m=json.loads(manifest.read_text())
m.update(world='campuses/'+slug+'/campus.glb',spawn=[-4.5,-1] if slug=='rochester' else [6.5,-5.1],arrivalYaw=-.25 if slug=='rochester' else .63,arrivalPitch=-.24 if slug=='rochester' else -.27)
m['collision']=[b for b in m['collision'] if b.get('detail')!='landmark garden']+solids
land=next(l for l in m['landmarks'] if l['id'] in ('campanile','RUSH RHEES LIBRARY'))
land['half'][2]=18.4 if slug=='rochester' else 31.5
if slug=='rochester':update_doors(m)
manifest.write_text(json.dumps(m,separators=(',',':')))
