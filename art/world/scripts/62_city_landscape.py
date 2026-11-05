"""Map-faithful garden, props, border trees and instanced meadow. Run via MCP."""
import bpy, json, math, random
from pathlib import Path
from mathutils import Vector
from world_core import *
import world_nature as nature
from world_architecture import lathe
OUT=Path(__file__).resolve().parents[1]
scene=bpy.context.scene
assert scene.name.startswith('LOGAN CITY')
meta=json.loads(scene['city_manifest']); layout=meta['layout']; S=meta['tileScale']; rr=random.Random(8237)
def xy(tx,ty): return ((tx-11.5)*S,(10-ty)*S)
def rect(x,y,w,h):
    a,b=xy(x+(w-1)/2,y+(h-1)/2); return a,b,w*S/2,h*S/2
paths=[rect(*r) for r in layout['PATHS']]
footprints=[rect(b['x'],b['y'],b['w'],b['h']) for b in layout['BUILDINGS']]
pond=rect(**layout['POND'])
def inside(x,y,r,margin=0): return abs(x-r[0])<r[2]+margin and abs(y-r[1])<r[3]+margin
from city_spacing import EAST_TILES, meadow_height as height
def solid(x,y,hx,hy,height=1.5): meta['collision'].append({'x':x,'z':-y,'hx':hx,'hz':hy,'minY':2.5,'maxY':2.5+height})
nature.PLACEMENTS=[]
def inst(kind,x,y,scale=1,yaw=0,z=None): return nature.instance(kind,x,y,height(x,y) if z is None else z,scale,yaw)

# Closely spaced boundary trees keep the town silhouette and south exit.
for i,(tx,ty) in enumerate(layout['TREES']):
    x,y=xy(tx,ty); inst('tree-'+str(i%2),x,y,.48+.10*rr.random(),rr.random()*TAU)
for i in range(65):
    x=rr.uniform(-76,76); y=rr.uniform(-60,82)
    if -35<x<35+EAST_TILES*S and -29<y<30: continue
    inst('tree-'+str(i%2),x,y,rr.uniform(.65,1.05),rr.random()*TAU)

# Pohutukawa keeps a green canopy with masses of crimson flowers at the tips.
prototype=nature.ASSETS['tree-0']; poh=prototype.copy(); poh.data=prototype.data.copy(); poh.name='tree-pohutukawa'; scene.collection.objects.link(poh)
for i,matl in enumerate(poh.data.materials):
    if 'foliage' in matl.name: poh.data.materials[i]=matl.copy()
colors=poh.data.color_attributes['Color']
for i,c in enumerate(colors.data):
    if i%147<56 and c.color[3]>0: c.color=(rr.uniform(.45,.8),rr.uniform(.015,.055),.025,1)
poh['prototype']=True; nature.ASSETS[poh.name]=poh
for tx,ty in layout['POHUTUKAWA']:
    x,y=xy(tx,ty); inst('tree-pohutukawa',x,y,.63,rr.random()*TAU)

# Picket fences follow both exact fence runs, leaving walkways open.
for tx,ty in layout['FENCES']:
    x,y=xy(tx,ty)
    for i in range(6):
        xx=x-1+i*.4
        box('Garden fence picket',(xx,y,3.02),(.16,.11,1.05),M['cream'],.025)
        mesh('Picket pointed cap',[(xx-.08,y-.06,3.54),(xx+.08,y-.06,3.54),(xx,y-.06,3.68)],[(0,1,2)],M['cream'])
    for z in [2.8,3.25]: box('Fence rail',(x,y+.08,z),(2.4,.12,.1),M['woodLight'],.02)
    solid(x,y,1.2,.14,1.2)
for s in layout['SIGNS']:
    x,y=xy(s['x'],s['y'])
    box('Noticeboard post',(x,y,3),(.17,.17,1),M['wood'],.03)
    box('Town noticeboard',(x,y,3.7),(1.85,.18,1.2),M['woodLight'],.07)
    box('Noticeboard inset',(x,y-.11,3.7),(1.65,.03,.98),M['cream'],.03)
    text('Noticeboard heading',s['id'].upper(),(x,y-.14,3.95),.23,M['navy'])
    for i in range(3): box('Noticeboard writing',(x,y-.14,3.65-i*.13),(1.1-i*.18,.015,.025),M['wood'])
    solid(x,y,.95,.15)
for s in layout['MAILBOXES']:
    x,y=xy(s['x'],s['y'])
    box('Mailbox timber post',(x,y,3.1),(.17,.17,1.2),M['wood'],.02)
    box('Curved mailbox',(x,y,3.75),(.65,.8,.55),M['navy'],.19)
    box('Mailbox door',(x,y-.42,3.75),(.57,.04,.45),M['metal'],.12)
    curve('Mailbox red flag',[(x+.4,y,3.8),(x+.4,y,4.15),(x+.6,y,4.15)],.045,M['red'])
    solid(x,y,.4,.45)

# Tesla Model 3, authored as a reusable Blender asset.
from tesla_model import build_tesla
car=layout['CARS'][0]; cx,cy=xy(car['x']+(car['w']-1)/2,car['y']); cz=2.5
build_tesla(cx,cy,cz)
solid(cx,cy,2.4,1,1.8)

for tx,ty in layout['BALLS']:
    x,y=xy(tx,ty); ball=uvball('Garden soccer ball',(x,y,2.77),(.27,)*3,M['white'],24,16)
    for i in range(12):
        a=i*2.4; zz=1-2*(i+.5)/12; r=math.sqrt(1-zz*zz)
        uvball('Soccer ball leather patch',(x+.265*r*math.cos(a),y+.265*r*math.sin(a),2.77+.265*zz),(.065,)*3,M['navy'],10,6)
for tx,ty in layout['FERNS']:
    x,y=xy(tx,ty); vs=[];fs=[];cs=[]
    for branch in range(10):
        a=branch*TAU/10
        points=[(x+math.cos(a)*j*.13,y+math.sin(a)*j*.13,2.5+.8*math.sin(j*math.pi/20)+.1) for j in range(10)]
        curve('Silver fern stem',points,.013,M['leafDark'])
        for j in range(1,10):
            for side in [-1,1]: nature.leaf(vs,fs,cs,points[j],.32*(1-j*.075),.06,a+side*.7,.08,(.28,.43,.24))
    mesh('Silver fern fronds',vs,fs,M['leafLight'],colors=cs)
for tx,ty in layout['POTS']:
    x,y=xy(tx,ty)
    lathe('Terracotta garden pot',(x,y,2.5),[(.3,0),(.42,.6),(.49,.65),(.49,.78),(.39,.78),(.37,.65)],M['roofLight'],28)
    for i in range(7): inst('flowers-'+str(i%3+1),x+rr.uniform(-.24,.24),y+rr.uniform(-.24,.24),.9,rr.random()*TAU,z=3.15)
    solid(x,y,.5,.5,.9)
for b in layout['KIWIS']:
    x,y=xy(b['x'],b['y']); z=2.5
    uvball('Foraging kiwi body',(x,y,z+.4),(.38,.26,.33),M['bark'],24,16)
    uvball('Kiwi head',(x+.3,y,z+.6),(.18,.16,.2),M['woodLight'],20,12)
    tube('Kiwi long beak',[(x+.43,y,z+.6),(x+.93,y,z+.34)],[.035,.006],M['cream'])
    for side in [-1,1]:
        uvball('Kiwi bright eye',(x+.39,y+side*.13,z+.66),(.029,)*3,M['screen'])
        curve('Kiwi leg',[(x-.06,y+side*.12,z+.26),(x-.10,y+side*.12,z+.05),(x+.04,y+side*.12,z+.03)],.023,M['woodLight'])

# Dense small flower beds reproduce the source garden; lawn height is subdued.
chunks={}
def plant(kind,x,y,s,yaw):
    z=height(x,y)-.02
    nature.PLACEMENTS.append({'kind':kind,'position':[x,y,z],'scale':s,'yaw':yaw})
    key=(kind,int(x//12),int(y//12)); vs,fs,cs=chunks.setdefault(key,([],[],[])); src=nature.ASSETS[kind].data
    k=len(vs); c=math.cos(yaw); si=math.sin(yaw)
    for v in src.vertices:
        p=v.co; vs.append((x+s*(c*p.x-si*p.y),y+s*(si*p.x+c*p.y),z+s*p.z))
    fs.extend(tuple(k+j for j in f.vertices) for f in src.polygons)
    cs.extend(tuple(v.color[:3]) for v in src.color_attributes['Color'].data)
for tx,ty in layout['FLOWERS']:
    x,y=xy(tx,ty)
    for i in range(65): plant('flowers-'+str((tx+ty)%3+1),x+rr.uniform(-.85,.85),y+rr.uniform(-.85,.85),rr.uniform(.8,1.2),rr.random()*TAU)
for i in range(62000):
    x=rr.uniform(-50,50+EAST_TILES*S); y=rr.uniform(-43,53)
    if any(inside(x,y,r,.35) for r in paths+footprints+[pond]): continue
    if y<-22 and abs(x-2.4)<2.5: continue
    if any(abs(x-c['x'])<c['hx']+.3 and abs(y+c['z'])<c['hz']+.3 for c in meta['collision']): continue
    kind='flowers-'+str(i%3+1) if noise(x*.24,y*.24)>.4 and rr.random()<.33 else 'grass'
    plant(kind,x,y,rr.uniform(.5,.95),rr.random()*TAU)
for (kind,cx,cy),(vs,fs,cs) in chunks.items():
    ob=mesh('Logan meadow '+kind+f' {cx} {cy}',vs,fs,nature.ASSETS[kind].data.materials[0],colors=cs); ob['vegetation_chunk']=True

# Street lamps sit off the original walking lines.
for tx,ty in [(10,7),(14,7),(10,14),(14,18),(3,15)]:
    x,y=xy(tx,ty)
    lathe('Town lamppost',(x,y,2.5),[(.23,0),(.23,.2),(.10,.4),(.075,3.3),(.18,3.4)],M['navy'],16)
    box('Lantern warm glass',(x,y,6.05),(.32,.32,.5),M['yellow'],.035)
    for dx in [-.18,.18]:
        for dy in [-.18,.18]: curve('Lantern frame',[(x+dx,y+dy,5.8),(x+dx,y+dy,6.3)],.025,M['navy'])
    box('Lantern cap',(x,y,6.35),(.5,.5,.1),M['navy'],.04)
    solid(x,y,.24,.24,4)
# The town border is walkable only through the same southern gap as /city.
east_extension=EAST_TILES*S
for args in [(-27.6,1.2,1.2,24),(27.6+east_extension,1.2,1.2,24),(east_extension/2,24,28.8+east_extension/2,1.2),(-14.4,-21.6,14.4,1.2),(16.8+east_extension/2,-21.6,12+east_extension/2,1.2)]: solid(*args,height=6)
meta['bounds']={'minX':-77,'maxX':77,'minZ':-84,'maxZ':68}
scene['city_manifest']=json.dumps(meta)
scene['placements']=json.dumps(nature.PLACEMENTS,separators=(',',':'))
(OUT/'data/placements.json').write_text(json.dumps(nature.PLACEMENTS,separators=(',',':')))
print('City landscape ready:',len(nature.PLACEMENTS),'instances;',len(meta['collision']),'collision boxes.')
