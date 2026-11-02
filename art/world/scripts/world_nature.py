"""Branching trees, curved leaves, meadow tufts and rock asset libraries."""
from world_core import *
ASSETS={}; PLACEMENTS=[]

def vertex_material(name):
    m=mat(name,(1,1,1)); p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    a=m.node_tree.nodes.new('ShaderNodeVertexColor'); a.layer_name='Color'; m.node_tree.links.new(a.outputs['Color'],p.inputs['Base Color'])
    return m

def leaf(vs,fs,cols,p,length,width,yaw,tilt,color):
    # Folded, pointed leaf with a raised midrib, six triangles rather than a card.
    p=Vector(p); axis=Vector((math.cos(yaw)*math.cos(tilt),math.sin(yaw)*math.cos(tilt),math.sin(tilt)))
    u=Vector((-math.sin(yaw),math.cos(yaw),0)); n=axis.cross(u)
    shape=[(0,0,0),(.35,-.5,0),(.75,-.33,0),(1,0,0),(.75,.33,0),(.35,.5,0),(.5,0,.10)]
    k=len(vs)
    for a,b,c in shape: vs.append(tuple(p+axis*(length*a)+u*(width*b)+n*(length*c))); cols.append(color)
    for i in range(6): fs.append((k+6,k+i,k+(i+1)%6))

def tree(kind):
    rr=random.Random(490+kind); parts=[]; centers=[]; h=[7.5,10,6.4][kind]
    trunk=[(0,0,0),(.1,.03,h*.28),(-.25,.1,h*.55),(.15,0,h*.82),(.3,0,h)]
    parts.append(tube('Tree trunk',trunk,[.52,.44,.30,.17,.03],M['bark'],12))
    for i in range(15):
        a=i*2.4; level=.38+(i%5)*.105; z=h*level; reach=rr.uniform(2.3,4.0)*(1-.35*level)
        if kind==1: reach*=.65
        end=(reach*math.cos(a),reach*math.sin(a),z+rr.uniform(1.0,2.7))
        mid=(end[0]*.6,end[1]*.6,z+.45)
        parts.append(tube('Reaching bough',[(0,0,z),mid,end],[.18,.105,.018],M['bark'],8))
        for j in range(3):
            aa=a+(j-1)*.8; p=(end[0]+math.cos(aa)*rr.uniform(.5,1.3),end[1]+math.sin(aa)*rr.uniform(.5,1.3),end[2]+rr.uniform(.1,.8))
            parts.append(tube('Fine branch',[mid,end,p],[.065,.035,.006],M['bark'],6)); centers.append((p,rr.uniform(.8,1.3)))
    for i in range(6):
        a=i*TAU/6
        parts.append(tube('Root flare',[(math.cos(a)*1.1,math.sin(a)*1.1,.04),(.3*math.cos(a),.3*math.sin(a),.35),(0,0,1)],[.05,.18,.24],M['bark'],8))
    wood=join(parts,'Tree '+str(kind)+' branching wood')
    vs=[]; fs=[]; cols=[]
    for p,r in centers:
        for j in range(300):
            a=rr.uniform(0,TAU); zz=rr.uniform(-1,1); s=rr.random()**.333
            v=math.sqrt(1-zz*zz)
            q=(p[0]+r*s*v*math.cos(a),p[1]+r*s*v*math.sin(a),p[2]+r*s*zz*.7)
            t=rr.random()
            if kind==2: c=(mix(.46,.95,t),mix(.10,.45,t),mix(.24,.57,t))
            else: c=(mix(.055,.32,t),mix(.19,.47,t),mix(.018,.055,t))
            leaf(vs,fs,cols,q,rr.uniform(.26,.50),rr.uniform(.16,.30),rr.uniform(0,TAU),rr.uniform(-.7,.7),c)
    canopy=mesh('Tree '+str(kind)+' individual leaves',vs,fs,vertex_material('Tree '+str(kind)+' varied foliage'),colors=cols)
    return join([wood,canopy],'tree-'+str(kind))

def tuft(kind):
    rr=random.Random(kind+56); vs=[]; fs=[]; cols=[]
    if kind==0:
        for i in range(11):
            a=rr.uniform(0,TAU); h=rr.uniform(.23,.65); x=rr.uniform(-.19,.19); y=rr.uniform(-.19,.19); w=rr.uniform(.025,.055)
            k=len(vs)
            for j in range(4):
                t=j/3; width=w*(1-t*.9)
                for s in [-1,1]:
                    vs.append((x+math.cos(a)*h*t*t*.48+s*width*math.sin(a),y+math.sin(a)*h*t*t*.48-s*width*math.cos(a),h*t))
                    cols.append((.09+.25*t,.24+.25*t,.018+.065*t))
            vs.append((x+math.cos(a)*h*.65,y+math.sin(a)*h*.65,h*1.02)); cols.append((.43,.58,.1))
            fs += [(k+j*2,k+j*2+1,k+j*2+3,k+j*2+2) for j in range(3)] + [(k+6,k+7,k+8)]
    else:
        for f in range(5):
            x,y=rr.uniform(-.28,.28),rr.uniform(-.28,.28); h=rr.uniform(.25,.6)
            # Stem and pair of folded leaves.
            k=len(vs); vs.extend([(x-.012,y,0),(x+.012,y,0),(x+.012,y,h),(x-.012,y,h)])
            fs.append((k,k+1,k+2,k+3)); cols.extend([(.08,.27,.035)]*4)
            for j in range(2): leaf(vs,fs,cols,(x,y,h*.4),.22,.07,j*3+f,.25,(.10,.32,.04))
            color=[(.95,.89,.65),(.53,.22,.76),(.95,.55,.035)][(kind-1)%3]
            for p in range(5):
                a=p*TAU/5; k=len(vs); d=.09
                vs.extend([(x,y,h),(x+math.cos(a-.45)*d,y+math.sin(a-.45)*d,h+.025),(x+math.cos(a)*d*1.45,y+math.sin(a)*d*1.45,h+.045),(x+math.cos(a+.45)*d,y+math.sin(a+.45)*d,h+.025)])
                fs.append((k,k+1,k+2,k+3)); cols.extend([color]*4)
            k=len(vs)
            vs.extend([(x+.032*math.cos(a*TAU/8),y+.032*math.sin(a*TAU/8),h+.055) for a in range(8)]); fs.append(tuple(range(k,k+8))); cols.extend([(.9,.5,.025)]*8)
    return mesh('grass' if kind==0 else 'flowers-'+str(kind),vs,fs,vertex_material('Meadow plant '+str(kind)),colors=cols)

def rock(kind):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3,radius=1)
    o=bpy.context.object; o.name='rock-'+str(kind)
    for v in o.data.vertices:
        p=v.co; scale=1+.2*noise(p.x*2+kind,p.y*2,p.z*2)
        p.x*=scale*(1+kind*.18); p.y*=scale*.82; p.z*=scale*.75; p.z=max(-.45,p.z)
    o.data.materials.append(M['rock']); shade(o)
    b=o.modifiers.new('Soft weathered edges','SUBSURF'); b.levels=1
    bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=b.name)
    return o

def register_asset(o):
    name=o.name
    # Bake local object scale/location into geometry to make exported prototypes consistent.
    bpy.context.view_layer.objects.active=o; bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    o['prototype']=True; o.location=(0,0,-1500); o.hide_render=True; o.hide_set(True)
    ASSETS[name]=o
    return name

def instance(name,x,y,z=None,scale=1,yaw=0):
    o=ASSETS[name].copy(); o.data=ASSETS[name].data; bpy.context.scene.collection.objects.link(o)
    o.name=name+' placed'; o['prototype']=False; o['instance_kind']=name; o.location=(x,y,height(x,y) if z is None else z); o.rotation_euler=(0,0,yaw); o.scale=(scale,)*3
    o.hide_render=False; o.hide_set(False)
    PLACEMENTS.append({'kind':name,'position':list(o.location),'scale':scale,'yaw':yaw})
    return o

def generate():
    for k in range(3): register_asset(tree(k))
    for k in range(4): register_asset(tuft(k))
    for k in range(3): register_asset(rock(k))
    trees=[(-17,-18,0,1.35),(35,-14,0,1.25),(-20,10,0,1.1),(-15,35,2,1),(-24,28,0,1.2),(30,24,0,1.15),(25,41,1,1.2),(-34,23,0,1),(-40,34,1,1.2),(43,16,0,1.1),(-24,-32,0,1.1),(26,-37,0,1.2)]
    for i in range(55):
        x=R.uniform(-75,75); y=R.uniform(30,88)
        if abs(x)<24 and y<51: continue
        trees.append((x,y,R.choices([0,1,2],[7,4,1])[0],R.uniform(.65,1.25)))
    for x,y,k,s in trees: instance('tree-'+str(k),x,y,scale=s,yaw=R.random()*TAU)
    for i in range(100):
        x=R.uniform(-65,65); y=R.uniform(-55,70)
        if abs(x-path_x(y))<5 or (abs(x)<24 and 0<y<43) or pond_distance(x,y)<1.1: continue
        instance('rock-'+str(i%3),x,y,scale=R.uniform(.5,2.5),yaw=R.random()*TAU)
    for x,y,s in [(-10,-22,2.2),(14,-27,2.7),(-16,-5,1.7),(-38,-20,2),(-41,8,2.2)]: instance('rock-1',x,y,scale=s,yaw=R.random()*TAU)
    # Vegetation meshes are combined in spatial cells for render and export.
    # The matching placement manifest allows native GPU instancing in the browser.
    chunks={}; count=0
    for i in range(130000):
        x=R.uniform(-65,65); y=R.uniform(-65,75)
        if pond_distance(x,y)<1.10: continue
        if abs(x-path_x(y))<3.3 and y<16: continue
        if ((x+1)/22)**2+((y-20)/19)**2<1: continue
        if abs(x)<8 and 34<y<48: continue
        dense=.5+.5*noise(x*.13,y*.13)
        if R.random()>.45+dense*.6: continue
        patch=noise(x*.22+20,y*.22)
        kind=('flowers-'+str(1+(int(abs(x+y))%3))) if patch>.30 and R.random()<.45 else 'grass'
        s=R.uniform(.7,1.4); yaw=R.random()*TAU; z=height(x,y)-.025
        PLACEMENTS.append({'kind':kind,'position':[x,y,z],'scale':s,'yaw':yaw})
        key=(kind,int(x//12),int(y//12)); chunk=chunks.setdefault(key,([],[],[]))
        vs,fs,cs=chunk; src=ASSETS[kind].data; k=len(vs); c=math.cos(yaw); si=math.sin(yaw)
        for v in src.vertices:
            p=v.co; vs.append((x+s*(c*p.x-si*p.y),y+s*(si*p.x+c*p.y),z+s*p.z))
        fs.extend([tuple(k+j for j in f.vertices) for f in src.polygons])
        cs.extend([tuple(v.color[:3]) for v in src.color_attributes['Color'].data]); count+=1
    for (kind,cx,cy),(vs,fs,cs) in chunks.items():
        ob=mesh('Meadow cell '+kind+f' {cx} {cy}',vs,fs,ASSETS[kind].data.materials[0],colors=cs); ob['vegetation_chunk']=True
    print('Nature generated:',len(trees),'trees and',count,'meadow instances')
