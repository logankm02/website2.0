"""First-pass campus worlds, translated from the existing /city campus rooms.
Run via MCP with init_globals={'campus_id':'uofr'} or {'campus_id':'ucb'}.
"""
import bpy, json, math, random, struct
from pathlib import Path
from mathutils import Vector
from world_core import *
from world_architecture import lathe, arch
import world_nature as nature
OUT=Path(__file__).resolve().parents[1]
cid=globals().get('campus_id','uofr')
data=json.loads((OUT/'scripts/campus-layouts.json').read_text())[cid]
slug='rochester' if cid=='uofr' else 'berkeley'
source=next(s for s in bpy.data.scenes if s.name.startswith('LOGAN CITY'))
scene=bpy.data.scenes.new('Campus — '+slug)
bpy.context.window.scene=scene
scene.world=source.world.copy(); scene.render.engine='CYCLES'; scene.cycles.samples=24; scene.cycles.use_denoising=True
scene.render.resolution_x=1280; scene.render.resolution_y=900; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.view_settings.view_transform='AgX'; scene.view_settings.exposure=.6
for ob in source.objects:
    if ob.get('prototype'):
        scene.collection.objects.link(ob); nature.ASSETS[ob.name]=ob
    elif ob.type=='LIGHT' or ob.name.startswith(('Distant ridge','Far snow')):
        if cid=='uofr' and ob.name.startswith('Far snow'): continue
        scene.collection.objects.link(ob.copy())
M['copper']=mat('Aged copper verdigris',(.10,.36,.26),.55,8,.03,.25)
M['slate']=mat('Campus slate',(.095,.14,.21),.8,12,.03)
nature.PLACEMENTS=[]; rr=random.Random(2026 if cid=='uofr' else 1868)
def xy(tx,ty): return ((tx-11.5)*2.4,(10-ty)*2.4)
def rect(f):
    w=f.get('w',1)*2.4; d=f.get('h',1)*2.4
    x,y=xy(f['x']+(f.get('w',1)-1)/2,f['y']+(f.get('h',1)-1)/2)
    return x,y,w,d
def cell(x,y):
    tx=int(math.floor(x/2.4+12)); ty=int(math.floor(10.5-y/2.4))
    return data['pathMatrix'][ty][tx] if 0<=tx<24 and 0<=ty<20 else '.'
def ground(x,y): return 1.6 if cell(x,y)=='~' else 2.5
vs=[];fs=[];cs=[];n=241
for j in range(n):
    y=-80+j*.75
    for i in range(n):
        x=-90+i*.75; k=cell(x,y); vs.append((x,y,ground(x,y)))
        t=.5+.5*noise(x*.18,y*.18)
        color=(.12+.08*t,.27+.11*t,.04+.025*t)
        if k in '#=B': color=(.56,.43,.29) if k=='#' else (.65,.61,.49)
        cs.append(color)
for j in range(n-1):
    for i in range(n-1):
        a=j*n+i;fs.extend([(a,a+1,a+n+1),(a,a+n+1,a+n)])
terrain=shade(mesh('Campus Terrain '+slug,vs,fs,nature.vertex_material('Meadow with '+slug+' paths'),colors=cs)); terrain['terrain']=True
collision=[]; landmarks=[]; locations=[]
def solid(x,y,hx,hy,h=8): collision.append({'x':x,'z':-y,'hx':hx,'hz':hy,'minY':2.5,'maxY':2.5+h})
def place(kind,x,y,scale=1): return nature.instance(kind,x,y,2.5,scale,rr.random()*TAU)
def column(x,y,z,h,r=.23): lathe('Campus stone column',(x,y,z),[(r*1.35,0),(r*1.35,.2),(r,.3),(r,h-.3),(r*1.4,h-.16),(r*1.4,h)],M['cream'],20)
def window(x,y,z,w=1,h=1.7):
    box('Campus limestone window trim',(x,y,z+h/2),(w+.18,.15,h+.18),M['cream'],.025)
    box('Campus deep blue glazing',(x,y-.09,z+h/2),(w,.03,h),M['glass'])
    box('Campus window mullion',(x,y-.13,z+h/2),(.05,.04,h),M['cream'])
    box('Campus window transom',(x,y-.13,z+h*.5),(w,.04,.05),M['cream'])
def roof(x,y,z,w,d,material):
    # Hipped slate/terracotta silhouette with repeated raised courses.
    rise=min(w,d)*.25
    mesh('Hipped campus roof',[(x-w/2-.3,y-d/2-.3,z),(x+w/2+.3,y-d/2-.3,z),(x+w/2+.3,y+d/2+.3,z),(x-w/2-.3,y+d/2+.3,z),(x-w*.27,y,z+rise),(x+w*.27,y,z+rise)],[(0,1,5,4),(1,2,5),(2,3,4,5),(3,0,4)],material)
    for j in range(1,9):
        t=j/9; yy=y-d/2*(1-t)
        curve('Roof tile course',[(x-w/2+w*.23*t,yy-.3,z+rise*t),(x+w/2-w*.23*t,yy-.3,z+rise*t)],.018,material)
def block(name,f,material,height=6.5,roofmat=None):
    x,y,w,d=rect(f); z=2.5
    box(name+' walls',(x,y,z+height/2),(w,d,height),material,.08)
    for hh in [.2,3.3,height]: box(name+' stone course',(x,y,z+hh),(w+.22,d+.22,.18),M['cream'],.03)
    for row in range(2):
        for i in range(max(2,int(w/2.3))):
            xx=x-w/2+1.1+i*(w-2.2)/max(1,int(w/2.3)-1)
            window(xx,y-d/2-.07,z+1+row*2.7,1,1.65)
    roof(x,y,z+height,w,d,roofmat or M['slate'])
    arch(name+' entry',x,y-d/2-.2,z,1.7,2.7,M['navy'])
    text(name+' sign',name,(x,y-d/2-.24,z+3.35),min(.37,w/len(name)*.85),M['navy'])
    landmarks.append({'id':name,'center':[x,y,z],'half':[w/2,d/2,height+3],'door':[x,y-d/2-1.4,z]})
    return x,y,w,d
def info(label,x,y,body): locations.append({'id':label,'label':label,'position':[x,2.5,-y],'kind':'Read','body':body,'links':[{'label':'Education & background','href':'/about#about'},{'label':'Return to LOGAN CITY','href':'/world'}]})

if cid=='uofr':
    names=iter(['HUTCHISON HALL','MELIORA HALL','BAUSCH & LOMB','MOREY HALL','DEWEY HALL'])
    for f in data['furniture']:
        if f['kind']=='brickHall':
            name=next(names); x,y,w,d=block(name,f,M['brick'])
            # All side halls also have windows facing inward across the quad.
            if f['x'] in [0,20] and f['y']==7:
                side=1 if f['x']==0 else -1; xx=x+side*w/2
                for yy in [y-d*.3,y,y+d*.3]:
                    for zz in [3.6,6.3]:
                        ob=box('Quad-facing window',(xx+side*.05,yy,zz+1),(.12,1.25,2),M['cream'],.02)
                        box('Quad-facing glazing',(xx+side*.13,yy,zz+1),(.03,1.07,1.82),M['glass'])
            if name=='DEWEY HALL': info(name,x,y+d/2+1.4,'Dewey Hall closes the south end of the quad in the original LOGAN CITY campus.')
            elif name in ['BAUSCH & LOMB','MOREY HALL']: info(name,x+(w/2+1.4)*(1 if f['x']==0 else -1),y,'A familiar brick hall along the green, recreated from the original campus map.')
            else: info(name,x,y-d/2-1.4,'A brick academic hall framing Rochester’s Eastman Quad.')
    f=next(f for f in data['furniture'] if f['kind']=='rushRhees')
    x,y,w,d=block('RUSH RHEES LIBRARY',f,M['stoneLight'],7.5)
    # Central drum, lantern, copper dome and classical library portico.
    lathe('Rush Rhees tower drum',(x,y,10),[(2.5,0),(2.5,.35),(2.15,.5),(2.15,5),(2.5,5.2),(2.5,5.5)],M['cream'],48)
    for i in range(12):
        a=i*TAU/12
        ob=box('Tower lantern opening',(x+2.16*math.cos(a),y+2.16*math.sin(a),13.5),(.7,.16,2.4),M['navy'],.12); ob.rotation_euler.z=a-math.pi/2
    profile=[(2.65*math.cos(i*math.pi/2/24),2.2*math.sin(i*math.pi/2/24)) for i in range(25)]
    lathe('Rush Rhees copper dome',(x,y,15.5),profile,M['copper'],64)
    tube('Library golden finial',[(x,y,17.6),(x,y,19.1)],[.1,.02],M['brass'],16)
    for xx in [x-3,x-1,x+1,x+3]: column(xx,y-d/2-.9,2.5,5.2,.28)
    box('Library portico entablature',(x,y-d/2-.9,7.8),(8,1.8,.35),M['cream'],.06)
    mesh('Library portico pediment',[(x-4,y-d/2-1.85,8),(x+4,y-d/2-1.85,8),(x,y-d/2-1.85,9.5)],[(0,1,2)],M['cream'])
    info('Rush Rhees Library',x,y-d/2-2,'Rush Rhees Library anchors Eastman Quad: limestone, a columned entrance, and the copper-domed tower. This is the Rochester chapter of LOGAN CITY.')
    # Amber foliage uses the original leafy tree geometry and remains instanced.
    proto=nature.ASSETS['tree-0']; autumn=proto.copy(); autumn.data=proto.data.copy(); autumn.name='tree-autumn'; scene.collection.objects.link(autumn)
    for c in autumn.data.color_attributes['Color'].data:
        if c.color[3]>0: c.color=(rr.uniform(.48,.78),rr.uniform(.14,.34),.025,1)
    nature.ASSETS['tree-autumn']=autumn
else:
    f=next(f for f in data['furniture'] if f['kind']=='doeLibrary')
    x,y,w,d=block('DOE LIBRARY',f,M['stoneLight'],7.3,M['roof'])
    for xx in [x-5,x-3,x-1,x+1,x+3,x+5]: column(xx,y-d/2-.9,2.5,5.8,.29)
    box('Doe portico entablature',(x,y-d/2-.9,8.4),(13,1.9,.55),M['cream'],.06)
    mesh('Doe classical pediment',[(x-6.5,y-d/2-1.9,8.65),(x+6.5,y-d/2-1.9,8.65),(x,y-d/2-1.9,10.9)],[(0,1,2)],M['cream'])
    info('Doe Library',x,y-d/2-2,'Doe Library’s columned portico faces the stone plaza at the northeast edge of Memorial Glade.')
    f=next(f for f in data['furniture'] if f['kind']=='campanile'); x,y,w,d=rect(f)
    box('Sather Tower shaft',(x,y,14.5),(4.4,4.4,24),M['cream'],.09)
    for zz in [3,20,23.5,27]: box('Campanile stone course',(x,y,zz),(4.8,4.8,.3),M['stoneLight'],.04)
    for side in range(4):
        a=side*math.pi/2
        for off in [-.95,.95]:
            xx=x+2.22*math.sin(a)+off*math.cos(a); yy=y-2.22*math.cos(a)+off*math.sin(a)
            ob=box('Campanile belfry opening',(xx,yy,25),(.7,.1,3.0),M['navy'],.25); ob.rotation_euler.z=a
        xx=x+2.27*math.sin(a); yy=y-2.27*math.cos(a)
        # Clock discs and hands on all four faces.
        disc=uvball('Campanile clock',(xx,yy,21.6),(.76,.045,.76),M['white'],32,16); disc.rotation_euler.z=a
        for angle,length in [(math.pi/2,.53),(.5,.43)]:
            curve('Clock hand',[(xx+.04*math.sin(a),yy-.04*math.cos(a),21.6),(xx+length*math.cos(angle)*math.cos(a)+.04*math.sin(a),yy+length*math.cos(angle)*math.sin(a)-.04*math.cos(a),21.6+length*math.sin(angle))],.025,M['navy'])
    mesh('Campanile pyramidal crown',[(x-2.5,y-2.5,27.3),(x+2.5,y-2.5,27.3),(x+2.5,y+2.5,27.3),(x-2.5,y+2.5,27.3),(x,y,31)],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)],M['slate'])
    landmarks.append({'id':'campanile','center':[x,y,2.5],'half':[2.4,2.4,29],'door':[x,y-3.8,2.5]})
    info('Sather Tower · the Campanile',x,y-3.8,'The Campanile rises above the glade, with clock faces, an open belfry, and a pyramidal crown.')
    f=next(f for f in data['furniture'] if f['kind']=='satherGate'); x,y,w,d=rect(f)
    for off in [-w/2+1,w/2-1]:
        box('Sather Gate stone pier',(x+off,y,4.8),(1.7,1.7,4.6),M['stoneLight'],.12)
        box('Gate pier cap',(x+off,y,7.15),(2,2,.3),M['cream'],.08); solid(x+off,y,.95,.95,5)
    curve('Sather Gate bronze arch',[(x+(w/2-1)*math.cos(i*math.pi/40),y,7+2.2*math.sin(i*math.pi/40)) for i in range(41)],.16,M['copper'])
    box('Sather Gate lintel',(x,y,7),(w-2,.4,.55),M['copper'],.06)
    text('Sather Gate lettering','SATHER GATE',(x,y-.25,6.9),.43,M['yellow'])
    for i in range(25):
        xx=x-(w/2-1)+i*(w-2)/24; hh=math.sqrt(max(0,1-((xx-x)/(w/2-1))**2))*2.2
        curve('Gate bronze openwork',[(xx,y,7.3),(xx,y,7+hh)],.025,M['copper'])
    info('Sather Gate',x,y+2.5,'The bronze gate spans the southern plaza. Its central arch remains open so you can walk through.')

for f in data['furniture']:
    kind=f['kind']; x,y,w,d=rect(f)
    if kind in ['campusTree','pineTree','redwood']:
        asset='tree-autumn' if f.get('autumn') and cid=='uofr' else 'tree-1' if kind in ['pineTree','redwood'] else 'tree-0'
        place(asset,x,y,.8 if kind=='redwood' else .65)
    elif kind=='forest':
        for i in range(0,f['w'],2):
            for j in range(0,f['h'],2):
                a,b=xy(f['x']+i,f['y']+j);place('tree-1',a,b,.85)
    elif kind=='ironFence':
        for i in range(int(w/.35)):
            xx=x-w/2+i*.35; curve('Campus iron fence upright',[(xx,y,2.5),(xx,y,4.3)],.025,M['navy'])
        for z in [2.9,4.1]: curve('Campus fence rail',[(x-w/2,y,z),(x+w/2,y,z)],.035,M['navy'])
        solid(x,y,w/2,.15,1.8)
    elif kind=='rock': place('rock-1',x,y,.8)
    elif kind in ['bush','berryPatch']:
        for i in range(9 if kind=='berryPatch' else 3):
            xx=x+rr.uniform(-w*.4,w*.4); yy=y+rr.uniform(-d*.4,d*.4)
            uvball('Campus garden shrub',(xx,yy,2.9),(.5,.4,.45),M['leaf'],16,10)
            if kind=='berryPatch':
                for j in range(5): uvball('Garden berry',(xx+rr.uniform(-.3,.3),yy-.35,3+rr.random()*.2),(.06,)*3,M['red'],8,6)
    elif kind=='stand':
        box('Glade Mart stall',(x,y,3.2),(w,1.5,1.4),M['woodLight'],.06)
        for off in [-w/2,w/2]: curve('Stall support',[(x+off,y,2.5),(x+off,y,5.2)],.07,M['wood'])
        for i in range(14): box('Striped stall awning',(x-w/2+(i+.5)*w/14,y,5),(w/14,2,.12),M['navy'] if i%2 else M['yellow'],.025)
        text('Glade Mart sign','GLADE MART',(x,y-.81,3.3),.32,M['cream']); solid(x,y,w/2,.8,3)
        info('Glade Mart',x,y-1.8,'A small campus stand beside the berry garden, carried over from the original pixel campus.')
    elif kind=='ucSeal':
        lathe('Berkeley bronze seal',(x,y,2.51),[(0,0),(1,0),(1,.04),(0,.04)],M['brass'],48)
        info('Berkeley seal',x,y,'The bronze seal sits in the lawn between the redwood grove and the library plaza.')
    elif kind=='lamppost':
        curve('Campus lamp post',[(x,y,2.5),(x,y,5.7)],.07,M['navy'])
        box('Campus lamp glass',(x,y,5.8),(.35,.35,.55),M['yellow'],.04)
        box('Campus lamp roof',(x,y,6.15),(.55,.55,.13),M['navy'],.04)

water_vertices=[]; water_faces=[]
for ty,row in enumerate(data['pathMatrix']):
    for tx,char in enumerate(row):
        x,y=xy(tx,ty)
        if char=='~':
            k=len(water_vertices)
            water_vertices.extend([(x-1.2,y-1.2,2.12),(x+1.2,y-1.2,2.12),(x+1.2,y+1.2,2.12),(x-1.2,y+1.2,2.12)])
            water_faces.append((k,k+1,k+2,k+3))
            solid(x,y,1.2,1.2,.1)
        elif char=='B':
            for i in range(8): box('Creek bridge plank',(x-1.05+i*.3,y,2.56),(.27,2.4,.12),M['woodLight'],.025)
            for side in [-1,1]: curve('Creek bridge handrail',[(x-1.2,y+side*1.1,3.5),(x+1.2,y+side*1.1,3.5)],.04,M['wood'])
if water_faces: mesh('Strawberry Creek water',water_vertices,water_faces,M['water'])

# Modest instanced meadow outside walking lines; campuses stay open and legible.
chunks={}
for i in range(13500):
    x=rr.uniform(-32,32);y=rr.uniform(-26,29)
    if cell(x,y)!='.' or any(abs(x-l['center'][0])<l['half'][0]+.5 and abs(y-l['center'][1])<l['half'][1]+.5 for l in landmarks): continue
    kind='grass'; scale=rr.uniform(.35,.65); yaw=rr.random()*TAU
    nature.PLACEMENTS.append({'kind':kind,'position':[x,y,2.48],'scale':scale,'yaw':yaw})
    vs,fs,cs=chunks.setdefault((int(x//12),int(y//12)),([],[],[])); src=nature.ASSETS[kind].data; k=len(vs); c=math.cos(yaw);si=math.sin(yaw)
    vs.extend((x+scale*(c*v.co.x-si*v.co.y),y+scale*(si*v.co.x+c*v.co.y),2.48+scale*v.co.z) for v in src.vertices)
    fs.extend(tuple(k+j for j in f.vertices) for f in src.polygons);cs.extend(tuple(v.color[:3]) for v in src.color_attributes['Color'].data)
for key,(vs,fs,cs) in chunks.items():
    ob=mesh('Campus lawn '+str(key),vs,fs,nature.ASSETS['grass'].data.materials[0],colors=cs);ob['vegetation_chunk']=True

# The return portal sits behind the spawn, leaving forward movement unobstructed.
sx,sy=xy(data['spawn']['x'],data['spawn']['y']); py=sy-3.6
for off in [-1.2,1.2]: column(sx+off,py,2.5,3.5,.17);solid(sx+off,py,.22,.22,3.5)
curve('Campus return portal arch',[(sx+1.2*math.cos(i*math.pi/32),py,6+1.2*math.sin(i*math.pi/32)) for i in range(33)],.12,M['cyan'])
text('Return portal sign','LOGAN CITY',(sx,py-.15,6.3),.27,M['navy'])
locations.insert(0,{'id':'return','label':'Return to LOGAN CITY','position':[sx,2.5,-py],'kind':'Travel','body':'Step back into LOGAN CITY, or visit the other campus.','links':[{'label':'Return to LOGAN CITY','href':'/world'},{'label':'Visit Berkeley' if cid=='uofr' else 'Visit Rochester','href':'/world?campus='+('berkeley' if cid=='uofr' else 'rochester')}]})
prefix='campuses/'+slug+'/'
meta={'version':2,'name':data['title'],'campus':slug,'layout':data,'spawn':[sx,sy],'landmarks':landmarks,'collision':collision,'locations':locations,'bounds':{'minX':-28.5,'maxX':28.5,'minZ':-25,'maxZ':23},'terrain':{'size':180,'resolution':241,'minX':-90,'minY':-80},'world':prefix+'village.glb','placements':prefix+'placements.bin','heightmap':prefix+'heightmap.bin','guide':None}
scene['campus_manifest']=json.dumps(meta)
scene['placements']=json.dumps(nature.PLACEMENTS,separators=(',',':'))
bpy.ops.object.camera_add(location=(-50,-65,48 if cid=='uofr' else 58));cam=bpy.context.object;cam.name=slug+' campus overview';cam.data.lens=40
cam.rotation_euler=(Vector((0,2,5))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.clip_end=900;scene.camera=cam
scene.render.filepath='/private/tmp/'+slug+'-campus.png'
bpy.data.libraries.write('/private/tmp/'+slug+'-campus.blend',{scene},fake_user=True,compress=True)
print(slug,'generated:',len(scene.objects),'objects;',len(nature.PLACEMENTS),'instances')
