"""Original procedural geometry and materials. Blender coordinates: Z up."""
import bpy, math, random
from mathutils import Vector
from mathutils.noise import noise_vector
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]
R=random.Random(73419)
TAU=math.tau

def noise(x,y,z=0): return noise_vector(Vector((x,y,z)))[0]
def clamp(x,a=0,b=1): return max(a,min(b,x))
def smooth(x): x=clamp(x); return x*x*(3-2*x)
def mix(a,b,t): return a*(1-t)+b*t

def mat(name,color,rough=.8,noise_scale=0,bump=.05,metal=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    n=m.node_tree.nodes; l=m.node_tree.links
    p=next(n for n in n if n.type=='BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    if noise_scale:
        t=n.new('ShaderNodeTexNoise'); t.inputs['Scale'].default_value=noise_scale; t.inputs['Detail'].default_value=3
        b=n.new('ShaderNodeBump'); b.inputs['Strength'].default_value=.24; b.inputs['Distance'].default_value=bump
        l.new(t.outputs['Fac'],b.inputs['Height']); l.new(b.outputs['Normal'],p.inputs['Normal'])
    return m

M={}
def materials():
    specs={'plaster':((.83,.69,.44),.9,6,.08),'cream':((.95,.84,.61),.85,8,.04),
      'stone':((.44,.43,.32),.9,7,.07),'stoneLight':((.63,.60,.45),.85,7,.05),
      'roof':((.57,.12,.055),.8,12,.04),'roofLight':((.76,.22,.09),.8,12,.04),
      'roofDark':((.40,.065,.035),.85,12,.04),'wood':((.18,.085,.034),.85,5,.04),
      'woodLight':((.38,.20,.075),.8,8,.03),'teal':((.035,.24,.23),.7,7,.025),
      'brass':((.68,.39,.09),.35,0,0),'glass':((.045,.15,.18),.25,0,0),
      'bark':((.20,.115,.055),.95,5,.1),'rock':((.37,.40,.35),.95,5,.15),
      'water':((.025,.36,.38),.18,3,.035),'white':((.95,.91,.73),.65,0,0),
      'pink':((.8,.20,.34),.7,0,0),'purple':((.33,.15,.59),.7,0,0),
      'yellow':((1,.61,.045),.7,0,0),'leafDark':((.035,.16,.025),.85,0,0),
      'leaf':((.12,.33,.035),.85,0,0),'leafLight':((.27,.47,.055),.85,0,0),
      'leafGold':((.41,.55,.075),.85,0,0),'grass':((.19,.36,.045),.9,0,0),
      'grassLight':((.38,.54,.085),.9,0,0),'grassDark':((.085,.24,.025),.95,0,0),
      'path':((.55,.38,.20),.95,15,.05),'mountain':((.19,.30,.32),1,5,.2)}
    for name,args in specs.items(): M[name]=mat(name,*args)
    for key in ['glass','brass']:
        p=next(n for n in M[key].node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        if key=='brass': p.inputs['Metallic'].default_value=.55
    return M

def mesh(name,vs,fs,material,indices=None,colors=None):
    d=bpy.data.meshes.new(name); d.from_pydata(vs,[],fs); d.update()
    ob=bpy.data.objects.new(name,d); bpy.context.scene.collection.objects.link(ob)
    if isinstance(material,list):
        for m in material: d.materials.append(m)
    elif material: d.materials.append(material)
    if indices:
        for p,i in zip(d.polygons,indices): p.material_index=i
    if colors:
        a=d.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT')
        a.data.foreach_set('color',[v for c in colors for v in (*c,1)])
    return ob

def shade(ob):
    if ob.type=='MESH':
        for p in ob.data.polygons: p.use_smooth=True
    return ob

def box(name,loc,scale,material,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(material)
    if bevel:
        b=o.modifiers.new('Crafted edge', 'BEVEL'); b.width=bevel; b.segments=2
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=b.name)
    return o

def tube(name,points,radii,material,sides=13):
    vs=[]; fs=[]
    for i,p in enumerate(points):
        p=Vector(p); tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])
        tangent.normalize(); u=tangent.cross(Vector((0,1,0)))
        if u.length<.01: u=tangent.cross(Vector((1,0,0)))
        u.normalize(); v=tangent.cross(u).normalized()
        for j in range(sides): vs.append(tuple(p+radii[i]*(u*math.cos(j*TAU/sides)+v*math.sin(j*TAU/sides))))
    for i in range(len(points)-1):
        for j in range(sides): a=i*sides+j; b=i*sides+(j+1)%sides; fs.append((a,b,b+sides,a+sides))
    fs.extend([tuple(reversed(range(sides))),tuple(range((len(points)-1)*sides,len(points)*sides))])
    return shade(mesh(name,vs,fs,material))

def curve(name,points,radius,material): return tube(name,points,[radius]*len(points),material,11)
def uvball(name,loc,scale,material,segments=22,rings=14):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
    o=bpy.context.object; o.name=name; o.scale=scale; o.data.materials.append(material); return shade(o)

def join(objects,name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]; bpy.ops.object.join(); o=bpy.context.object; o.name=name; return o

def text(name,body,loc,size,material):
    d=bpy.data.curves.new(name,'FONT'); d.body=body; d.size=size; d.align_x='CENTER'; d.extrude=.008; d.bevel_depth=.003
    o=bpy.data.objects.new(name,d); bpy.context.scene.collection.objects.link(o); o.location=loc; o.rotation_euler=(math.pi/2,0,0); d.materials.append(material)
    return o

def path_x(y): return 1.6+4.8*math.sin((y+12)*.075)
def pond_distance(x,y): return math.sqrt(((x+29)/14)**2+((y+1)/20)**2)
def height(x,y):
    rolling=1.5+1.8*math.sin(x*.068+.4)*math.cos(y*.052)+1.0*math.sin(y*.10+x*.035)
    rolling+=6.5*math.exp(-((x+42)**2+(y-37)**2)/650)+5*math.exp(-((x-45)**2+(y-43)**2)/500)
    rolling+=.3*noise(x*.085,y*.085)
    plateau=math.exp(-((x/25)**6+((y-23)/23)**6))
    h=mix(rolling,2.5,plateau)
    pd=pond_distance(x,y)
    h=mix(h,-.4,smooth((1.15-pd)/.4))
    return h

def terrain():
    size=180; n=241; vs=[]; fs=[]; colors=[]
    for j in range(n):
        y=-80+j*size/(n-1)
        for i in range(n):
            x=-90+i*size/(n-1); z=height(x,y); vs.append((x,y,z))
            t=noise(x*.12,y*.12)*.5+.5
            grass=(mix(.14,.30,t),mix(.28,.44,t),mix(.035,.075,t))
            d=abs(x-path_x(y))
            path=smooth((3.3+.25*noise(x*.8,y*.8)-d)/.9) if y<15 else 0
            if ((x+1)/20)**2+((y-18)/16)**2<1: path=max(path,.85)
            colors.append(tuple(mix(c,(.55,.39,.21)[k],path) for k,c in enumerate(grass)))
    for j in range(n-1):
        for i in range(n-1): a=j*n+i; fs.extend([(a,a+1,a+n+1),(a,a+n+1,a+n)])
    m=mat('Meadow with winding ochre path',(1,1,1),1,22,.04)
    p=next(v for v in m.node_tree.nodes if v.type=='BSDF_PRINCIPLED'); a=m.node_tree.nodes.new('ShaderNodeVertexColor'); a.layer_name='Color'; m.node_tree.links.new(a.outputs['Color'],p.inputs['Base Color'])
    shade(mesh('Terrain',vs,fs,m,colors=colors))
    # Pond surface follows an irregular shoreline; the terrain supplies its banks.
    vs=[(-29,-1,.03)]
    for i in range(97):
        a=i*TAU/96; r=1+.025*math.sin(a*7)
        vs.append((-29+12.5*r*math.cos(a),-1+18*r*math.sin(a),.03))
    mesh('Pond',vs,[(0,i+1,i+2) for i in range(96)],M['water'])
    # Distant, layered ridges: analytic slopes with irregular smooth contours.
    for ridge in range(3):
        vs=[]; fs=[]; nx=91; ny=25
        for j in range(ny):
            y=65+ridge*35+j*5
            for i in range(nx):
                x=-240+i*5
                peak=22+ridge*13+18*math.sin(x*.027+ridge)**2+7*noise(x*.018,2+ridge)
                z=peak*math.sin(math.pi*j/(ny-1))**1.1+2
                vs.append((x,y,z))
        for j in range(ny-1):
            for i in range(nx-1): a=j*nx+i; fs.append((a,a+1,a+nx+1,a+nx))
        m=mat('Atmospheric ridge '+str(ridge),(.16+ridge*.055,.27+ridge*.055,.28+ridge*.08))
        shade(mesh('Distant ridge '+str(ridge),vs,fs,m))
