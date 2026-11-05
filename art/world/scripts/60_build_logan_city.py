"""Translate src/game/map.js into original, detailed 3D architecture via Blender MCP.

Run after the original village asset library has been opened in Blender. The
previous village remains an independent scene. Coordinates retain the pixel map
topology: one tile = 2.4 metres, north = Blender +Y.
"""
import bpy, sys, math, json, random, importlib
from pathlib import Path
from mathutils import Vector
OUT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(OUT / 'scripts'))
import world_core as core
importlib.reload(core)
from world_core import *
import world_architecture as architecture
importlib.reload(architecture)
import world_nature as nature
importlib.reload(nature)

from city_spacing import city_layout, meadow_height
LAYOUT = city_layout(json.loads((OUT / 'scripts/city-layout.json').read_text()))
S = 2.4
def xy(tx, ty): return ((tx - 11.5) * S, (10 - ty) * S)
def rect(x, y, w, h):
    cx, cy = xy(x + (w - 1) / 2, y + (h - 1) / 2)
    return cx, cy, w * S / 2, h * S / 2
PATHS = [rect(*p) for p in LAYOUT['PATHS']]
BUILDINGS = {b['id']: {**b, 'rect': rect(b['x'], b['y'], b['w'], b['h'])} for b in LAYOUT['BUILDINGS']}
POND = rect(**LAYOUT['POND'])
def inside(x, y, r, margin=0): return abs(x-r[0]) < r[2]+margin and abs(y-r[1]) < r[3]+margin
def path_distance(x, y):
    return min(math.hypot(max(abs(x-cx)-hw,0), max(abs(y-cy)-hh,0)) for cx,cy,hw,hh in PATHS)
def city_height(x, y):
    # A level, accessible town transitions to the existing soft rolling hills.
    h=meadow_height(x,y)
    if inside(x,y,POND,-.28): h=.95
    return h

source = next(s for s in bpy.data.scenes if s.name.startswith('Brackenvale'))
scene = bpy.data.scenes.new('LOGAN CITY — translated village')
bpy.context.window.scene = scene
scene.world = source.world.copy()
scene.render.engine = 'CYCLES'; scene.cycles.samples=32; scene.cycles.use_denoising=True
scene.render.resolution_x=1600; scene.render.resolution_y=1000; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='AgX'; scene.view_settings.exposure=.65
try: scene.view_settings.look='AgX - Medium High Contrast'
except TypeError: pass
materials()
M.update({
 'brick': mat('Lambda warm fired brick',(.39,.11,.065),.9,18,.035),
 'navy': mat('Campus blue painted wood',(.025,.055,.115),.75,12,.02),
 'steel': mat('Mission graphite powdercoat',(.075,.10,.14),.65,8,.015, .18),
 'metal': mat('Satin aluminum',(.41,.49,.54),.38,0,0,.6),
 'couch': mat('Worn caramel upholstery',(.38,.19,.075),.95,24,.02),
 'screen': mat('Midnight display background',(.008,.025,.045),.3),
 'cyan': mat('Instrument cyan',(.035,.65,.72),.4),
 'red': mat('Pohutukawa crimson',(.58,.035,.025),.8),
})
for k in ['cyan','yellow']:
    p=next(n for n in M[k].node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    p.inputs['Emission Color'].default_value=(*M[k].diffuse_color[:3],1); p.inputs['Emission Strength'].default_value=.45

# Retain the original landscape's distant backdrop and authored asset library.
for ob in source.objects:
    if ob.get('prototype'):
        scene.collection.objects.link(ob); nature.ASSETS[ob.name]=ob
    elif ob.name.startswith(('Distant ridge','Far snow')):
        copy=ob.copy(); scene.collection.objects.link(copy)

vs=[]; fs=[]; colors=[]; n=241
for j in range(n):
    y=-80+j*.75
    for i in range(n):
        x=-90+i*.75; vs.append((x,y,city_height(x,y)))
        t=.5+.5*noise(x*.17,y*.17); c=(mix(.13,.27,t),mix(.27,.42,t),mix(.028,.07,t))
        # Keep the exact promenade/avenue/garden/pond-walk topology, soften edges.
        amount=1-smooth(path_distance(x,y)/.4)
        if y<-22 and abs(x-2.4)<2: amount=max(amount,1-smooth((abs(x-2.4)-1.5)/.5))
        colors.append(tuple(mix(c[k],(.59,.44,.27)[k],amount) for k in range(3)))
for j in range(n-1):
    for i in range(n-1):
        a=j*n+i; fs.extend([(a,a+1,a+n+1),(a,a+n+1,a+n)])
groundmat=nature.vertex_material('Meadow with Logan City paths')
terrain=shade(mesh('Logan Terrain',vs,fs,groundmat,colors=colors)); terrain['terrain']=True
# Original packed grain texture gives the glTF ground a material at close range.
oldterrain=next(o for o in source.objects if o.name=='Terrain')
terrain.data.materials[0]=oldterrain.data.materials[0].copy()
uv=terrain.data.uv_layers.new(name='Meadow UV')
for poly in terrain.data.polygons:
    for li in poly.loop_indices:
        p=terrain.data.vertices[terrain.data.loops[li].vertex_index].co; uv.data[li].uv=(p.x/4,p.y/4)

collision=[]; landmarks=[]
def solid(cx,cy,hx,hy,base=2.5,height=2):
    collision.append({'x':cx,'z':-cy,'hx':hx,'hz':hy,'minY':base,'maxY':base+height})
def pillar(name,x,y,z,h,r=.23):
    architecture.lathe(name,(x,y,z),[(r*1.4,0),(r*1.4,.16),(r,.26),(r*.86,h-.3),(r*1.35,h-.16),(r*1.35,h)],M['cream'],24)
def framed_window(x,y,z,w,h,material=None):
    box('Recessed window casing',(x,y,z+h/2),(w+.18,.17,h+.18),M['cream'],.04)
    box('Window inset',(x,y-.10,z+h/2),(w,.045,h),material or M['glass'],.02)
    for dx in [-w/2,0,w/2]: box('Window vertical frame',(x+dx,y-.15,z+h/2),(.055,.065,h),M['cream'],.012)
    box('Window cross rail',(x,y-.15,z+h*.55),(w,.065,.055),M['cream'],.012)
def door(x,y,z,wide=1.8):
    box('Solid entrance backing',(x,y,z+1.4),(wide,.12,2.8),M['wood'],.035)
def sign(label,x,y,z,w,material=None,size=.4):
    box(label+' plaque',(x,y,z),(w,.18,.9),material or M['navy'],.06)
    text(label+' lettering',label,(x,y-.11,z-.15),size,M['cream'])

# ΛΚΜ HOUSE: masonry, classical full-height colonnade, pediment, flags and couch.
b=BUILDINGS['education']; x,y,hw,hd=b['rect']; f=y-hd; z=2.5; h=7
box('Lambda brick residence',(x,y+.5,z+h/2),(hw*2,hd*2-1,h),M['brick'],.10)
box('Lambda porch stone floor',(x,y,z+.06),(hw*2+.35,hd*2+.3,.12),M['stoneLight'],.05)
# Continuous shallow mortar beds and staggered front masonry joints.
for row in range(24):
    zz=z+.25+row*.28
    box('Brick horizontal mortar',(x,f+1-.015,zz),(hw*2,.025,.023),M['stone'],0)
    for col in range(20):
        xx=x-hw+.35+col*.72+(row%2)*.36
        if xx<x+hw: box('Brick vertical mortar',(xx,f+.98,zz+.14),(.022,.026,.24),M['stone'])
for xx in [x-hw+.45,x-2.6,x+2.6,x+hw-.45]: pillar('Tuscan porch column',xx,f+.12,z,6.95,.25)
for zz in [z+6.75,z+7.08]: box('Classical cornice',(x,y,zz),(hw*2+.65,hd*2+.65,.22),M['cream'],.04)
for yy in [f-.25,y+hd+.25]:
    mesh('Clapboard pediment',[(x-hw-.3,yy,z+7.2),(x+hw+.3,yy,z+7.2),(x,yy,z+10.4)],[(0,1,2)],M['cream'])
    curve('Pediment carved rake',[(x-hw-.4,yy-.03,z+7.2),(x,yy-.03,z+10.5),(x+hw+.4,yy-.03,z+7.2)],.14,M['white'])
for side in [-1,1]:
    for row in range(14):
        dx=(row+.5)*hw/14
        for col in range(24):
            yy=y-hd-.35+(col+.5)*(hd*2+.7)/24
            o=box('Overlapping slate roof tile',(x+side*dx,yy,z+10.4-dx*3.2/hw),(.57,(hd*2+.7)/24+.04,.085),M['steel'] if (row+col)%4 else M['metal'],.015)
            o.rotation_euler.y=side*math.atan(3.2/hw)
sign('Λ Κ Μ',x,f-.22,z+6.65,4.3,M['cream'],.7)
# Dark Greek lettering, cream plaque.
next(o for o in scene.objects if o.name=='Λ Κ Μ lettering').data.materials[0]=M['navy']
for dx,label in [(-4.5,'ROCHESTER'),(4.5,'BERKELEY')]:
    framed_window(x+dx,f+.9,z+4.2,1.8,1.9,M['navy'])
    text('Campus window flag',label,(x+dx,f+.73,z+4.85),.18,M['yellow'])
    framed_window(x+dx,f+.9,z+1.0,1.8,1.9)
dx,dy=xy(b['door']['x'],b['door']['y']); door(dx,f+.86,z)
for i in range(21):
    xx=x-hw+.8+i*(hw*2-1.6)/20; zz=z+5.9-.25*math.sin(i*math.pi/20)
    mesh('Campus pennant',[(xx-.17,f+.14,zz),(xx+.17,f+.14,zz),(xx,f+.14,zz-.38)],[(0,1,2)],M['navy'] if i%2 else M['yellow'])
cx=x+4.5
box('Porch couch base',(cx,f+.25,z+.42),(2.35,.83,.55),M['couch'],.15)
box('Porch couch back',(cx,f+.65,z+.94),(2.35,.25,.8),M['couch'],.14)
for xx in [cx-1.05,cx+1.05]: box('Couch rolled arm',(xx,f+.2,z+.78),(.33,.9,.48),M['couch'],.14)
for xx in [cx-.46,cx+.46]: box('Couch stitched cushion',(xx,f+.14,z+.76),(.85,.7,.17),M['couch'],.09)
architecture.lathe('Forgotten red cup',(x+.2,f+.1,z+.12),[(.09,0),(.13,.28),(.12,.30),(.10,.28),(.08,.04)],M['red'],20)
landmarks.append({'id':b['id'],'center':[x,y,z],'half':[hw,hd,h+3.5],'door':[dx,f-1.2,z]})

# LOGAN & CO: graphite panel building, recessed live-display gallery and dish.
b=BUILDINGS['experience']; x,y,hw,hd=b['rect']; f=y-hd; h=6.8
box('Mission control block',(x,y,z+h/2),(hw*2,hd*2,h),M['steel'],.16)
for xx in [x-hw+.25,x+hw-.25]: box('Mission aluminum corner',(xx,f-.08,z+h/2),(.25,.22,h),M['metal'],.04)
for zz in [z+.2,z+4,z+h]: box('Mission facade stringcourse',(x,f-.08,zz),(hw*2,.2,.17),M['metal'],.025)
box('Mission live display gallery',(x,f-.15,z+4.85),(hw*2-1.1,.24,2.35),M['screen'],.05)
for panel in range(7):
    xx=x+(panel-3)*1.82
    box('Telemetry screen bezel',(xx,f-.31,z+4.9),(1.67,.09,1.72),M['metal'],.045)
    box('Telemetry screen',(xx,f-.37,z+4.9),(1.52,.03,1.55),M['screen'])
    for j in range(5):
        curve('Live telemetry trace',[(xx-.65+k*.13,f-.395,z+4.35+j*.24+.07*math.sin(k*.8+panel+j)) for k in range(11)],.012,M['cyan'] if j%2 else M['yellow'])
for side in [-1,1]:
    for i in range(3):
        xx=x+side*(2.8+i*1.3)
        box('Operator console',(xx,f-.17,z+1.3),(1.15,.4,.7),M['metal'],.06)
        box('Operator monitor',(xx,f-.4,z+2),(1,.12,.67),M['screen'],.04)
        text('Console code','SYSTEM 0'+str(i+1),(xx,f-.48,z+1.98),.105,M['cyan'])
dx,dy=xy(b['door']['x'],b['door']['y']); door(dx,f-.25,z)
box('Mission navy awning',(dx,f-.65,z+3.1),(3.9,1.5,.22),M['navy'],.08)
sign('LOGAN & CO.',x,f-.23,z+6.4,7.7,size=.47)
text('Mission subtitle','M I S S I O N   C O N T R O L',(x,f-.36,z+5.93),.18,M['cyan'])
for yy in [y-hd,y+hd]: box('Roof parapet',(x,yy,z+h+.25),(hw*2,.25,.55),M['metal'],.04)
for xx in [x-hw,x+hw]: box('Roof parapet',(xx,y,z+h+.25),(.25,hd*2,.55),M['metal'],.04)
for i in range(8): box('Roof deck seam',(x-hw+i*1.8,y,z+h+.015),(.05,hd*2,.04),M['metal'])
cx,cy=x-4,y-1
pillar('Dish pedestal',cx,cy,z+h,1.1,.2)
# Smooth concave paraboloid dish, tilted toward the sky.
dish=architecture.lathe('Satellite receiving dish',(0,0,0),[(r, .24*r*r) for r in [0,.2,.4,.6,.8,1,1.2,1.4,1.6]],M['white'],48)
dish.location=(cx,cy,z+h+1.2); dish.rotation_euler.x=.52
curve('Dish feed support',[(cx-1.35,cy,z+h+1.6),(cx,cy-.4,z+h+3.1),(cx+.1,cy,z+h+2.7)],.045,M['metal'])
for i in range(3):
    xx=x+4+i*.5; hh=2+i*.8
    tube('Comms antenna',[(xx,y,z+h),(xx,y,z+h+hh)],[.07,.025],M['metal'])
    uvball('Antenna beacon',(xx,y,z+h+hh),(.08,.08,.10),M['red'])
landmarks.append({'id':b['id'],'center':[x,y,z],'half':[hw,hd,h+4],'door':[dx,f-1.2,z]})

# LOGAN LABS: detailed open display bays, ribbed metal roof and maker equipment.
b=BUILDINGS['projects']; x,y,hw,hd=b['rect']; f=y-hd; h=4.8
box('Maker lab shell',(x,y,z+h/2),(hw*2,hd*2,h),M['plaster'],.1)
for xx in [x-hw+.25,x+hw-.25]: box('Workshop stone pilaster',(xx,f-.1,z+h/2),(.45,.3,h),M['stoneLight'],.035)
for i in range(75):
    xx=x-hw-.3+i*(hw*2+.6)/74
    tube('Roof standing seam',[(xx,f-.4,z+h+.2),(xx,y,z+h+1.4),(xx,y+hd+.4,z+h+.2)],[.065]*3,M['steel'],6)
for side in [-1,1]:
    mesh('Workshop pitched steel roof',[(x-hw-.4,y,z+h+1.38),(x+hw+.4,y,z+h+1.38),(x+hw+.4,y+side*(hd+.4),z+h+.12),(x-hw-.4,y+side*(hd+.4),z+h+.12)],[(0,1,2,3)],M['steel'])
for xx in [x-5,x+5]:
    box('Workshop skylight frame',(xx,y-1.3,z+h+1.25),(3.6,2.4,.17),M['metal'],.04)
    box('Workshop skylight glass',(xx,y-1.3,z+h+1.36),(3.3,2.1,.06),M['glass'],.02)
    for off in [-1,0,1]: box('Skylight mullion',(xx+off,y-1.3,z+h+1.41),(.06,2.1,.08),M['metal'])
tube('Extraction duct',[(x-hw+1,y+3,z+h+1.3),(x+hw-1,y+3,z+h+1.3)],[.28,.28],M['metal'],24)
for xx in [x-8,x+8]:
    architecture.lathe('Extractor housing',(xx,y+3,z+h+1),[(.45,0),(.45,.6),(.6,.7),(.6,.8)],M['metal'],24)
for xx in [x-6,x+6]:
    box('Recessed workshop display bay',(xx,f-.08,z+2.4),(7.1,.18,3.1),M['screen'],.05)
    for off in [-3.55,3.55]: box('Display bay frame',(xx+off,f-.2,z+2.4),(.13,.2,3.3),M['metal'],.03)
    box('Display workbench',(xx,f-.45,z+1.25),(6.8,.85,.2),M['woodLight'],.035)
for i in range(3):
    xx=x-8+i*2
    for off in [-.62,.62]: box('Printer upright',(xx+off,f-.48,z+2.2),(.09,.13,1.7),M['metal'],.02)
    for zz in [z+1.4,z+2.95]: box('Printer frame crossbar',(xx,f-.48,zz),(1.35,.14,.12),M['metal'],.02)
    box('Printer bed',(xx,f-.55,z+1.6),(1.1,.65,.08),M['cyan'],.03)
    tube('Part being printed',[(xx,f-.55,z+1.62),(xx+.14,f-.55,z+2),(xx,f-.55,z+2.2)],[.28,.18,.14],M['teal'],20)
    box('Print head',(xx+.15,f-.55,z+2.5),(.25,.25,.25),M['yellow'],.04)
    curve('Printer filament tube',[(xx,f-.2,z+3.1),(xx+.3,f-.2,z+3.3),(xx+.15,f-.55,z+2.65)],.025,M['white'])
box('Workshop pegboard',(x+5,f-.22,z+2.8),(3.9,.12,1.5),M['woodLight'],.03)
for col in range(12):
    for row in range(4): uvball('Pegboard hole',(x+3.3+col*.3,f-.29,z+2.3+row*.3),(.018,.01,.018),M['wood'],8,4)
for i in range(5):
    xx=x+3.5+i*.7
    box('Hanging tool grip',(xx,f-.34,z+2.65),(.07,.08,.62),M['metal'],.02)
    box('Hanging tool head',(xx,f-.34,z+2.98),(.32,.1,.12),M['metal'],.02)
    spool=architecture.lathe('Filament spool',(0,0,0),[(.26,0),(.26,.06),(.17,.07),(.17,.28),(.26,.29),(.26,.35)],M[['red','teal','cyan'][i%3]],24)
    spool.rotation_euler.x=math.pi/2; spool.location=(xx,f-.42,z+1.7)
box('Laser cutter enclosure',(x+8,f-.3,z+1.65),(1.75,.8,.65),M['metal'],.08)
box('Laser cutter light',(x+8,f-.72,z+1.7),(1.3,.035,.18),M['yellow'],.02)
dx,dy=xy(b['door']['x'],b['door']['y'])
box('Half open workshop doorway',(dx,f-.15,z+1.8),(3.3,.18,3.6),M['screen'],.03)
for i in range(6): box('Rolled steel shutter slat',(dx,f-.28,z+3.5-i*.14),(3.3,.1,.12),M['metal'],.02)
box('Maker entry threshold',(dx,f-.5,z+.05),(3.6,.9,.1),M['stoneLight'],.035)
sign('LOGAN LABS',dx,f-.26,z+4.25,5.3,size=.45)
text('Maker subtitle','M A K E R   S P A C E',(dx,f-.38,z+3.85),.14,M['yellow'])
landmarks.append({'id':b['id'],'center':[x,y,z],'half':[hw,hd,h+1.5],'door':[dx,f-1.2,z]})

# Pond and limestone curb reproduce the southwest rectangular garden pond.
px,py,phw,phd=POND
box('Pond turquoise water',(px,py,1.6),(phw*2-.45,phd*2-.45,.06),M['water'],.18)
for side in [-1,1]:
    for i in range(10): box('Pond dressed limestone curb',(px-phw+(i+.5)*phw/5,py+side*phd,2.48),(phw/5-.04,.38,.3),M['stoneLight'],.055)
    for i in range(7): box('Pond dressed limestone curb',(px+side*phw,py-phd+(i+.5)*phd/3.5,2.48),(.38,phd/3.5-.04,.3),M['stoneLight'],.055)
solid(px,py,phw+.15,phd+.15,height=.3)
for i in range(12):
    xx=px+R.uniform(-phw+.8,phw-.8); yy=py+R.uniform(-phd+.8,phd-.8)
    curve('Pond sun ripple',[(xx+j*.16,yy+.04*math.sin(j),1.645) for j in range(6)],.009,M['white'])

# Layout metadata is the collision/navigation contract, shared with the browser.
scene['city_manifest']=json.dumps({'name':'LOGAN CITY','version':2,'tileScale':S,'layout':LAYOUT,'landmarks':landmarks,'spawn':[*xy(LAYOUT['START']['x'],LAYOUT['START']['y'])], 'collision':collision})
(OUT/'data/landmarks.json').write_text(json.dumps(landmarks,indent=2))
for ob in source.objects:
    if ob.type=='LIGHT': scene.collection.objects.link(ob.copy())
bpy.ops.object.camera_add(location=(-47,-63,47)); camera=bpy.context.object; camera.name='Logan City overview'; camera.data.lens=43; camera.data.clip_end=900
camera.rotation_euler=(Vector((0,2,3.5))-camera.location).to_track_quat('-Z','Y').to_euler(); scene.camera=camera
print('LOGAN CITY architecture generated:',len(scene.objects),'objects; original scene retained.')
