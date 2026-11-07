"""Build both map-based districts from the existing original landmark GLBs via Blender MCP.
Usage: blender -b --factory-startup -P this_file -- rochester|berkeley"""
import bpy,sys,math,random,json,struct
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent;sys.path.insert(0,str(here))
from campus_site_plans import plan
from campus_life import inhabitants, dress_site
from world_core import mat,mesh,shade,noise
from landmark_masonry import Detail,palette
slug=sys.argv[-1]; r=slug=='rochester';p=plan(slug);art=here.parent;public=art.parents[1]/'public/world/campuses'/slug
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene; scene.name=p['slug'].title()+' • campus site plan'
bpy.ops.import_scene.gltf(filepath=str(public/'campus.glb'))
sources=list(scene.objects)
# Keep the finished original landmark masonry, including its clocks, letters and
# carvings. Use per-triangle bounds, not a whole-campus transform.
def transplant(name,old,ext,target,scale=(1,1,1),flip=False):
    vs=[];fs=[];mi=[];mats=[]
    for ob in sources:
        if ob.type!='MESH' or 'terrain' in ob.name.lower():continue
        v=[ob.matrix_world @ a.co for a in ob.data.vertices]; mapped={}
        for face in ob.data.polygons:
            ids=face.vertices;mid=sum((v[k] for k in ids),Vector())/len(ids)
            if abs(mid.x-old[0])>ext[0] or abs(mid.y-old[1])>ext[1] or mid.z<2.48:continue
            if any(abs(v[k].x-old[0])>ext[0]+.35 or abs(v[k].y-old[1])>ext[1]+.35 for k in ids):continue
            # Replace Doe's invented projecting portico with its north elevation.
            if name.startswith('Doe') and mid.y<11.05 and mid.z>2.55:continue
            material=ob.data.materials[face.material_index]
            if material not in mats:mats.append(material)
            row=[]
            for k in ids:
                if k not in mapped:
                    x,y,z=v[k];s=-1 if flip else 1
                    mapped[k]=len(vs);vs.append((target[0]+s*(x-old[0])*scale[0],target[1]+s*(y-old[1])*scale[1],2.5+(z-2.5)*scale[2]))
                row.append(mapped[k])
            fs.append(row);mi.append(mats.index(material))
    assert len(fs)>100,(name,len(fs));mesh(name,vs,fs,mats,mi)
if r:transplant('Rush Rhees Library • rotunda and reading rooms',(0,16.8),(10.1,5.65),(0,31),(1.24,1.23,1.04))
else:
    transplant('Doe Memorial Library • north portico',(13.2,15.6),(11.25,6.85),(-3,-29),(1.54,1.94,1.12),True)
    transplant('Sather Tower • carillon',(-8.4,15.6),(2.6,2.6),(34,-49),(1.0,1.0,1.25))
    transplant('Sather Gate • bronze arch',(12,-15.6),(7.25,1.2),(-30,-102),(.85,.92,.92))
for ob in sources:bpy.data.objects.remove(ob,do_unlink=True)
g=Detail();lim,iv,shadow,brick,bronze,glass,copper,slate,bell,dial,granite,marble,oak,iron,navy,gold=palette(g)
pave=g.material('Weathered stone paving',(.50,.46,.38) if r else (.39,.35,.28)); kerb=g.material('Granite margin',(.33,.32,.28))
seam=g.material('Paving joint',(.27,.26,.22));soil=g.material('Mulch rings',(.13,.09,.049))
green=g.material('Clipped privet',(.085,.19,.059)); water=g.material('Water creek',(.12,.38,.35)); ferr=g.material('Bronze sun screens',(.44,.27,.13),.52,.33)
def height(x,y):
    if r:return 2.5
    mound=1.02*math.exp(-((x-1)/14)**2-((y-5)/9)**2)
    dip=max(0,min(1,(3.5-abs(y+102))/1.6))*1.05 if abs(x+30)>3 else 0
    return 2.5+mound-dip
def segdist(x,y,a,b):
    u=b[0]-a[0];v=b[1]-a[1];t=max(0,min(1,((x-a[0])*u+(y-a[1])*v)/(u*u+v*v)))
    return math.hypot(x-a[0]-t*u,y-a[1]-t*v)
def path_mesh(item,j):
    pts=item['points'];w=item['width']; mid=[]; offsets=[]
    for a,b in zip(pts,pts[1:]):
        n=math.ceil(math.dist(a,b)/1.1)
        mid.extend([(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n) for i in range(n)])
    mid.append(pts[-1]);vs=[];fs=[];mi=[]
    for i,(x,y) in enumerate(mid):
        a=mid[max(0,i-1)];b=mid[min(len(mid)-1,i+1)];L=math.dist(a,b);nx=(a[1]-b[1])/L;ny=(b[0]-a[0])/L
        for off in [-w/2,-w/2+.105,w/2-.105,w/2]:
            xx=x+nx*off;yy=y+ny*off;vs.append((xx,yy,height(xx,yy)+.034+j*.0018))
        if i:
            for k in range(3):
                v=4*i+k;fs.append((v-4,v,v+1,v-3));mi.append(0 if k==1 else 1)
        if r and i and i%3==0:
            z=2.55+j*.0018;g.rod(seam,(x+nx*(w*.5-.1),y+ny*(w*.5-.1),z),(x-nx*(w*.5-.1),y-ny*(w*.5-.1),z),.009,4)
    mesh('Walk %02d'%j,vs,fs,[g.materials[pave],g.materials[kerb]],mi)
for j,path in enumerate(p['paths']):path_mesh(path,j)
# A mown lawn has slight colour variation and a continuous heightfield.
N=181;size=270;minx=-135;miny=-150;vs=[];fs=[];color=[];samples=[]
for j in range(N):
    for i in range(N):
        x=minx+i*size/(N-1);y=miny+j*size/(N-1);z=height(x,y);vs.append((x,y,z));samples.append(z)
        v=.5+.5*noise(x*.105,y*.105);stripe=.005*math.sin(x*.74+y*.3)
        color.append((.108+.045*v+stripe,.245+.084*v+stripe,.061+.028*v))
        if i and j:
            k=j*N+i;fs.extend([(k-N-1,k-N,k),(k-N-1,k,k-1)])
lawn=mat('Meadow with clipped campus turf',(1,1,1));nodes=lawn.node_tree.nodes;col=nodes.new('ShaderNodeVertexColor');col.layer_name='Color';lawn.node_tree.links.new(col.outputs['Color'],next(n for n in nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'])
shade(mesh('Campus Terrain • lawn',vs,fs,lawn,colors=color))
def hall(b):
    x,y,w,d,h=b['x'],b['y'],b['w'],b['d'],b['h'];fx,fy=b['face'];angle=math.atan2(fx,-fy);W=d if fx else w;D=w if fx else d
    def point(u,v,z):return (x+u*math.cos(angle)-v*math.sin(angle),y+u*math.sin(angle)+v*math.cos(angle),2.5+z)
    def block(m,u,v,z,a,c,e):g.block(m,point(u,v,z),(a,c,e),angle)
    style=b['style'];wall=brick if r else shadow
    block(wall,0,0,h/2,W,D,h)
    for z in (.39,h*.46,h-.29,h+.02):block(lim,0,0,z,W+.25,D+.25,.20)
    # Regular window bays on both long elevations and both ends.
    for sign in [-1,1]:
        for bay in range(int(W/2.15)):
            u=(bay-(int(W/2.15)-1)/2)*2.16
            if sign==-1 and abs(u)<1.25:continue
            for z in (2.15,5.63):
                v=sign*(D/2+.06);block(iv,u,v,z,1.17,.16,2.02)
                block(glass,u,v+sign*.106,z,1.00,.09,1.84)
                block(iv,u,v+sign*.17,z,.052,.04,1.85);block(iv,u,v+sign*.17,z+.05,1,.04,.055)
        for u in [-W/2,W/2]:
            for v in (-D*.25,D*.25):
                for z in (2.25,5.62):block(glass,u+(1 if u>0 else -1)*.026,v,z,.085,1.05,1.85)
    block(oak,0,-D/2-.16,1.51,1.65,.22,3.02)
    block(iv,0,-D/2-.31,3.22,3.55,.8,.23)
    for u in [-1.34,1.34]:g.turn(iv,point(u,-D/2-.54,0),[(.21,0),(.21,.16),(.16,.24),(.16,2.92),(.23,3.05)],16)
    if r or style=='annex':
        vs=[point(u,v,h+.14) for u,v in [(-W/2-.35,-D/2-.35),(W/2+.35,-D/2-.35),(W/2+.35,D/2+.35),(-W/2-.35,D/2+.35)]]+[point(-W*.37,0,h+1.75),point(W*.37,0,h+1.75)]
        g.surface(slate if r else g.material('Library terracotta',(.48,.15,.075)),vs,[(0,1,5,4),(1,2,5),(2,3,4,5),(3,0,4)])
        for u in (-W*.37,W*.37):
            block(brick,u,.8,h+1.43,.77,.91,2.9);block(shadow,u,.8,h+2.86,.89,1.01,.19)
    elif style=='screen':
        for i in range(int(W*3)):
            u=-W/2+.24+i*.33;block(ferr,u,-D/2-.2,4.9,.09,.21,4.7)
        for z in [2.75,4.2,5.7,7.25]:block(ferr,0,-D/2-.22,z,W,.2,.11)
        block(shadow,0,0,h+.25,W+1,D+.9,.4)
    else:
        for z in [1.1,3.9,6.7,h+.12]:block(lim,0,0,z,W+1.25,D+1.25,.46)
    g.lettering(bronze,b['name'].upper(),point(0,-D/2-.75,3.26),.22,angle)
for b in p['buildings']:
    if b['style'] in ('georgian','screen','terraces','annex'):hall(b)
objects=[];coll=[]
def solid(x,y,hx,hy,h):coll.append(dict(x=x,z=-y,hx=hx,hz=hy,minY=2.5,maxY=2.5+h))
def bench(x,y):
    for k in range(4):g.block(oak,(x,y+.13*k,3.01),(2.1,.115,.085))
    for z in [3.30,3.49]:g.block(oak,(x,y+.45,z),(2.1,.10,.13))
    for u in [-.78,.78]:
        for v in [.04,.40]:g.rod(iron,(x+u,y+v,2.52),(x+u,y+v,3.03),.045)
        g.rod(iron,(x+u,y+.4,3.02),(x+u,y+.47,3.55),.034)
    solid(x,y+.21,1.05,.27,1)
def lamp(x,y):
    g.turn(iron,(x,y,2.5),[(.33,0),(.34,.2),(.21,.36),(.13,.69),(.09,3.46),(.18,3.57)],14)
    g.turn(iv,(x,y,6.02),[(.18,0),(.30,.17),(.23,.50),(.18,.58)],8)
    g.turn(iron,(x,y,6.55),[(.30,0),(.29,.05),(.06,.23),(.02,.32)],8)
    solid(x,y,.19,.19,4.35)
if r:
    for s in (-1,1):
        for y in (-27,-9,8,20):lamp(s*12.99,y)
        for y in (-19,2,18):bench(s*10.2,y)
        x=s*5.8;y=-7
        g.turn(granite,(x,y,2.5),[(.5,0),(.5,.15),(.29,.27),(.16,.35)],28)
        g.rod(iv,(x,y,2.82),(x,y,12.7),.064)
        # The paired flagpoles carry an American flag and Rochester blue.
        flag_red=g.material('Flag crimson',(.56,.045,.055))
        for stripe in range(13):
            for j in range(10):
                z0=12.46-stripe*1.14/13;z1=z0-1.14/13
                pts=[(x+t*.235,y+.18*math.sin(t*.73),z-.026*t) for z in (z0,z1) for t in (j,j+1)]
                material=(flag_red if stripe%2==0 else iv) if s<0 else navy
                if s<0 and stripe<7 and j<4:material=navy
                g.surface(material,pts,[(0,2,3,1),(1,3,2,0)])
        if s>0:
            g.lettering(gold,'R',(x+1.05,y-.19,11.74),.40)
        for a,b in [(2.3,8.9),(9.5,11)]:
            cx=s*(a+b)/2;g.block(lim,(cx,-3.55,3.04),(b-a,.30,.14));g.block(lim,(cx,-3.55,2.63),(b-a,.4,.22))
            for i in range(math.ceil((b-a)/.44)):g.turn(iv,(s*(a+.18+i*.44),-3.55,2.73),[(.09,0),(.07,.07),(.11,.15),(.06,.25),(.09,.27)],10)
            solid(cx,-3.55,(b-a)/2,.22,.66)
else:
    # Low stone seats and shrub borders frame the west approach without
    # cutting across the middle of the lawn or the library sightline.
    for x,y,angle in [(-26,5.5,-.48),(-20,10,.30),(-17,13.8,.22)]:
        g.block(granite,(x,y,2.80),(3.0,.63,.59),angle)
        g.block(iv,(x,y,3.12),(3.12,.73,.13),angle)
        for i in range(8):
            u=(i-3.5)*.38;xx=x+u*math.cos(angle)-.83*math.sin(angle);yy=y+u*math.sin(angle)+.83*math.cos(angle)
            g.turn(green,(xx,yy,2.56),[(.24,0),(.40,.27),(.36,.60),(.21,.77),(.06,.81)],9)
        solid(x,y,1.5,.64,.70)
    for x,y in [(-22,8),(-15,-4),(12,-9),(21,9),(-28,-20),(-33,-40),(-32,-66),(24,-36),(27,-52)]:lamp(x,y)
    for x,y in [(-13,14),(4,16),(-8,-14),(9,-14),(30,-54)]:bench(x,y)
    # Creek and crossing on the southern approach, with uninterrupted deck and railings.
    for x1,x2 in [(-64,-33.3),(-26.7,59)]:
        g.block(water,((x1+x2)/2,-102,1.91),(x2-x1,4.7,.08));solid((x1+x2)/2,-102,(x2-x1)/2,2.4,.1)
    g.block(granite,(-30,-102,2.49),(6.6,8.8,.20))
    for x in [-33.16,-26.84]:
        g.block(lim,(x,-102,2.92),(.26,8.8,.82));g.block(iv,(x,-102,3.39),(.38,8.9,.14));solid(x,-102,.18,4.45,.95)
    for x in (-35.27,-24.73):solid(x,-102,.86,.8,5)
    # Original medallion at the campus waypoint, off the library walk.
    g.turn(bell,(-20,-15,2.52),[(.77,0),(.8,.04),(.76,.08)],48)
    for k in range(16):
        a=k*math.tau/16;g.rod(gold,(-20+.59*math.cos(a),-15+.59*math.sin(a),2.61),(-20+.70*math.cos(a),-15+.70*math.sin(a),2.61),.011)
# Distant wooded slopes and a soft tree line keep the playable districts framed.
rng=random.Random(424 if r else 1868)
for layer in range(2):
    distant=g.material('Wooded horizon '+str(layer),(.16+.08*layer,.29+.055*layer,.23+.075*layer))
    vs=[];fs=[]
    for i in range(141):
        a=i*math.tau/140;radius=122+layer*38+2.2*math.sin(9*a)
        z=(3.5 if r else 6.5)+(2 if r else 13)*(.5+.5*math.cos(a-.1))**3+(1.1+layer)*math.sin(3*a)+1.4*math.sin(9*a+.5)+.65*math.sin(27*a)
        for rad,h in ((radius-5,0),(radius,z*.65),(radius+6,z+layer*2)):vs.append((rad*math.cos(a),rad*math.sin(a),h))
        if i:
            for j in (0,1):
                k=i*3+j;fs.append((k-3,k,k+1,k-2))
    mesh('Distant wooded hillside',vs,fs,g.materials[distant])
dress_site(g,p,r,(lim,iv,shadow,brick,bronze,glass,copper,slate,bell,dial,granite,marble,oak,iron,navy,gold),solid)
g.finish()
# The same plan controls what is drawn, where it blocks, and where E works.
m=json.loads((public/'manifest.json').read_text());prefix='campuses/'+slug+'/'
m.update(layout=dict(walks=p['paths'],northDegrees=-63 if r else 15),detailModel=None,world=prefix+'site-plan.glb',placements=prefix+'site-planting.bin',heightmap=prefix+'site-heights.bin',terrain=dict(size=size,resolution=N,minX=minx,minY=miny),spawn=p['spawn'],arrivalYaw=p['yaw'],arrivalPitch=p['pitch'])
a,b,c,d=p['bounds'];m['bounds']=dict(minX=a,maxX=b,minZ=-d,maxZ=-c)
if not r:m['layout']['water']=[[-64,-104.35,30.7,4.7],[-26.7,-104.35,85.7,4.7]]
m['collision']=coll;m['landmarks']=[];m['locations']=[]
def loc(name,label,x,y,body,kind='Read',links=None):
    m['locations'].append(dict(id=name,label=label,position=[x,height(x,y),-y],kind=kind,body=body,links=links or [dict(label='Education & background',href='#guide/education')]))
other='berkeley' if r else 'rochester'
# Directory action only: there is no physical return portal on the lawn.
m['locations'].append(dict(id='return',label='Return to LOGAN CITY',kind='Travel',position=None,body='Return to Central Avenue or visit the other campus.',links=[dict(label='Return to LOGAN CITY',href='/world'),dict(label='Visit '+other.title(),href='/world?campus='+other)]))
for b in p['buildings']:
    x,y,w,d,f=b['x'],b['y'],b['w'],b['d'],b['face'];name=b['name']
    xx=x+f[0]*(w/2+(2.15 if r else 1.7));yy=y+f[1]*(d/2+(3.5 if name=='DOE LIBRARY' else 2.15))
    m['landmarks'].append(dict(id=name,center=[x,y,2.5],half=[w/2,d/2,b['h']],door=[xx,yy,height(xx,yy)],facing=f))
    label='Sather Tower · the Campanile' if name=='campanile' else name.title() if name.isupper() else name
    msg={'RUSH RHEES LIBRARY':'The dome marks the head of Eastman Quad. Look back from the portico to see the paired rows of academic halls.','DOE LIBRARY':'The north reading-room façade looks across Memorial Glade. Facing the library, the Campanile rises beyond its eastern end.','campanile':'From the tower, return northwest past Doe Library to the lawn.','HUTCHISON HALL':'The science buildings stand beyond the southern row of Eastman Quad.','MELIORA HALL':'Find Meliora beyond Bausch & Lomb, off the formal green.','McLaughlin Hall':'McLaughlin stands on the engineering side, north of Memorial Glade.','The Bancroft Library':'The Bancroft Library adjoins Doe on the eastern side, toward the Campanile.','Moffitt Library':'This library stands southwest of Memorial Glade, across the path from Doe.','C. V. Starr East Asian Library':'The screened façade overlooks the northwest approach to the glade.'}.get(name,label+' faces the lawn on the '+('left' if x<0 else 'right')+' as you approach Rush Rhees from the river.')
    loc(name,label,xx,yy,msg)
if not r:
    loc('Sather Gate','Sather Gate',-30,-99,'The bronze arch spans Strawberry Creek on the southern approach, well beyond the glade.')
    loc('Berkeley seal','Berkeley seal',-20,-15,'A bronze campus waypoint beside the library walk.')
m['people']=inhabitants(slug)
for person in m['people']:
    if 'point' not in person:continue
    x,y=person['point'];person['position']=[x,2.5 if person['behavior']=='seated' else height(x,y),-y]
    if person['behavior']=='talk':
        loc('student-'+person['id'],person['id'],x,y,person['body'],'Talk')
        m['locations'][-1]['radius']=2.1
# Keep the established instanced vegetation and redwood LODs. No grass on walks.
rows={};treeplan=p['trees'][:]
for i in range(105 if r else 155):
    if r:
        angle=rng.uniform(0,math.tau);rad=rng.uniform(56,94);x=rad*math.cos(angle);y=rad*math.sin(angle)
    else:
        x=rng.choice([-1,1])*rng.uniform(65,102);y=rng.uniform(-111,86)
    treeplan.append(('tree-0' if i%4 else 'tree-1',x,y,rng.uniform(.60,1.08)))
for k,x,y,s in treeplan:rows.setdefault(k,[]).append((x,y,height(x,y),s,rng.random()*math.tau))
segs=[(a,b,path['width']/2+.32) for path in p['paths'] for a,b in zip(path['points'],path['points'][1:])]
for i in range(4200):
    x=rng.uniform(m['bounds']['minX'],m['bounds']['maxX']);y=rng.uniform(-m['bounds']['maxZ'],-m['bounds']['minZ'])
    if any(abs(x-b['x'])<b['w']/2+.6 and abs(y-b['y'])<b['d']/2+.6 for b in p['buildings']):continue
    if any(segdist(x,y,a,b)<w for a,b,w in segs) or (not r and abs(y+102)<5):continue
    rows.setdefault('grass',[]).append((x,y,height(x,y),rng.uniform(.105,.23),rng.uniform(0,math.tau)))
m['groups']=[];data=bytearray()
for k,group in rows.items():
    m['groups'].append(dict(kind=k,count=len(group),offset=len(data)//20))
    for row in group:data.extend(struct.pack('<5f',*row))
(public/'site-planting.bin').write_bytes(data);(public/'site-heights.bin').write_bytes(struct.pack('<%df'%len(samples),*samples))
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(art/'blend'/(slug+'-site-plan.blend')),compress=True)
bpy.ops.export_scene.gltf(filepath=str(public/'site-plan.glb'),export_format='GLB',export_draco_mesh_compression_enable=True,export_draco_position_quantization=16,export_animations=False,export_vertex_color='ACTIVE')
(public/'manifest.json').write_text(json.dumps(m,separators=(',',':')))
