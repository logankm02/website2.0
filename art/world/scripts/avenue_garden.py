"""City-only, reusable botanical models. All dimensions are in metres, Z up."""
import math, random, struct
from mathutils import Vector
import bpy
from world_core import mesh, mat
from world_nature import vertex_material

TAU=2*math.pi

def v(x,y,z):return Vector((x,y,z))
def color(c,k):return tuple(min(1,max(0,x*k)) for x in c)

class Brush:
    def __init__(self):self.verts=[];self.faces=[];self.colors=[]
    def surface(self,pts,faces,colors):
        off=len(self.verts);self.verts.extend(pts);self.faces.extend([tuple(off+i for i in f) for f in faces]);self.colors.extend(colors)
    def stalk(self,p,q,r1,r2,c,n=5):
        axis=(q-p).normalized();u=axis.cross(v(0,1,0));u.normalize();w=axis.cross(u).normalized()
        pts=[a+r*(math.cos(i*TAU/n)*u+math.sin(i*TAU/n)*w) for a,r in [(p,r1),(q,r2)] for i in range(n)]
        self.surface(pts,[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],[c]*(2*n))
    def leaf(self,p,a,length,width,tilt,c):
        axis=v(math.cos(a)*math.cos(tilt),math.sin(a)*math.cos(tilt),math.sin(tilt));side=v(-math.sin(a),math.cos(a),0);up=axis.cross(side)
        pts=[p+axis*(length*t)+side*(width*w)+up*(length*h) for t,w,h in [(0,0,0),(.36,-.50,.07),(.72,-.32,.055),(1,0,-.035),(.72,.32,.055),(.36,.50,.07),(.5,0,.13)]]
        self.surface(pts,[(i,(i+1)%6,6) for i in range(6)],[color(c,k) for k in (.62,.83,1,1.1,1,.86,1.1)])
    def flower(self,p,r,n,c,angle,tilt=.4):
        # Cupped petals are broad at the outer edge, with a shallow notch and lighter tips.
        normal=v(math.sin(tilt)*math.cos(angle),math.sin(tilt)*math.sin(angle),math.cos(tilt));side=normal.cross(v(0,1,0)).normalized();up=normal.cross(side)
        for i in range(n):
            a=angle+i*TAU/n;rad=side*math.cos(a)+up*math.sin(a);perp=normal.cross(rad)
            pts=[p+rad*r*t+perp*r*w+normal*r*z for t,w,z in [(0,0,0),(.50,-.37,.19),(.92,-.33,.48),(1,-.11,.45),(.94,0,.38),(1,.13,.43),(.91,.34,.46),(.5,.37,.17),(.62,0,.15)]]
            self.surface(pts,[(j,(j+1)%8,8) for j in range(8)],[color(c,k) for k in (.72,.92,1.12,1.14,1.05,1.12,1.08,.91,.96)])
        center=p+normal*r*.12
        pts=[center+normal*r*.12]+[center+(side*math.cos(i*TAU/7)+up*math.sin(i*TAU/7))*r*.21 for i in range(7)]
        self.surface(pts,[(0,1+i,1+(i+1)%7) for i in range(7)],[(.96,.53,.045)]*8)
    def model(self,name,material):
        o=mesh('Avenue garden '+name,self.verts,self.faces,material,colors=self.colors)
        # Shared data, not per-instance duplicates; source prototypes are placed as first instance.
        return o

class Instances:
    def __init__(self):self.models={};self.used=set();self.cells={}
    def add(self,name,obj):self.models[name]=obj
    def place(self,name,p,scale,angle,tilt=0):
        source=self.models[name]
        if name in self.used:
            o=bpy.data.objects.new(source.name.split('.')[0],source.data);bpy.context.scene.collection.objects.link(o)
        else:o=source;self.used.add(name)
        # The glTF exporter instances siblings under an explicit parent. Keep
        # each batch local to a street section for meaningful frustum culling.
        cell=(math.floor(p[0]/12),math.floor(p[1]/12))
        if cell not in self.cells:
            holder=bpy.data.objects.new('Avenue garden section %d %d'%cell,None);bpy.context.scene.collection.objects.link(holder);self.cells[cell]=holder
        o.parent=self.cells[cell];o.location=p;o.scale=(scale,)*3;o.rotation_euler=(tilt,0,angle)


def specimens(pool,material):
    for seed,kind in enumerate(('poppy','cosmos','lavender','fern','blossom-a','blossom-b','blossom-c')):
        rng=random.Random(8100+seed);b=Brush();green=(.085,.265,.072);sage=(.17,.34,.14)
        if kind.startswith('blossom'):
            # Repeated terminal spray: branching twigs, leaf pairs, small clusters of five-petal flowers.
            for j in range(4):
                a=j*2.4+rng.random();q=v(math.cos(a)*.37,math.sin(a)*.30,.13+rng.random()*.25)
                b.stalk(v(0,0,0),q,.015,.004,(.22,.105,.055))
                for k in range(3):
                    pt=q*(.37+.21*k);heading=a+(-1 if k%2 else 1)*.78
                    b.leaf(pt,heading,.20,.094,.24,green if k%2 else sage)
                    tip=pt+v(math.cos(heading)*.105,math.sin(heading)*.105,.07)
                    b.stalk(pt,tip,.005,.002,(.27,.12,.08),4)
                    for i in range(2):
                        ang=heading+i*2.1;cp=tip+v(.045*math.cos(ang),.045*math.sin(ang),.02*i)
                        b.flower(cp,.046+rng.random()*.018,5,rng.choice([(.87,.37,.46),(.96,.65,.67),(.79,.26,.38)]),ang,rng.uniform(.25,1.15))
        elif kind=='fern':
            for j in range(6):
                a=j*2.4;last=v(0,0,0)
                for k in range(1,8):
                    t=k/7;p=v(math.cos(a)*.32*t,math.sin(a)*.32*t,.25*math.sin(t*2.0));b.stalk(last,p,.005,.003,sage,4);last=p
                    for s in (-1,1):b.leaf(p,a+s*.89,.107*(1-t*.60),.038*(1-t*.5),.14,green)
        else:
            for j in range(5 if kind=='lavender' else 3):
                a=j*2.4+rng.random();h=rng.uniform(.28,.52);tip=v(math.cos(a)*.15,math.sin(a)*.15,h);mid=tip*.52+v(0,0,.04)
                b.stalk(v(0,0,0),mid,.007,.005,green);b.stalk(mid,tip,.005,.003,sage)
                for k in range(4):b.leaf(mid*(.34+k*.19),a+k*2.3,.13 if kind!='lavender' else .092,.042,.32,green)
                if kind=='lavender':
                    for k in range(5):
                        p=tip+v(0,0,.023*k)
                        for l in range(3):b.leaf(p,l*2.09+k*.77,.037-.003*k,.032,.61,rng.choice([(.27,.18,.48),(.45,.30,.66)]))
                else:b.flower(tip,.094 if kind=='poppy' else .083,4 if kind=='poppy' else 8,(.97,.32,.038) if kind=='poppy' else (.93,.87,.71),a,.43)
        pool.add(kind,b.model(kind,material))


def blossom_trees(pool):
    from world_core import tube
    rng=random.Random(6004);bark=mat('Avenue cherry wood bark',(.20,.10,.064),.82,noise_scale=16,bump=.025)
    for old in list(bpy.context.scene.objects):
        if old.name.startswith(('Clouds of spring blossom','Blossom trunk','Blossom bough','Fine flowering branch')):bpy.data.objects.remove(old,do_unlink=True)
    for n,(x,y,s) in enumerate([(-3.5,15.6,.94),(24,-2.3,.80)]):
        origin=v(x,y,2.5)
        def branch(name,pts,r):tube('Avenue cherry '+name,[origin+p*s for p in pts],[a*s for a in r],bark,13)
        branch('leader',[v(0,0,0),v(-.09,0,.62),v(.08,.10,1.32),v(.22,.06,2.35),v(.39,.19,3.38),v(.22,.35,4.03)],[.33,.29,.245,.17,.10,.045])
        # Cherry bark has horizontal lenticels. Map narrow, tapered marks
        # around the sloping trunk, following its actual centre and taper.
        marks=Brush();levels=[(v(0,0,0),.33),(v(-.09,0,.62),.29),(v(.08,.10,1.32),.245),(v(.22,.06,2.35),.17)]
        for (p0,r0),(p1,r1) in zip(levels,levels[1:]):
            axis=(p1-p0).normalized();u=axis.cross(v(0,1,0)).normalized();w=axis.cross(u)
            for k in range(32):
                t=rng.uniform(.03,.97);a=rng.random()*TAU;span=rng.uniform(.12,.43);r=r0+(r1-r0)*t+.003
                pts=[]
                for f in (0,.25,.50,.75,1):
                    theta=a+span*f;cen=p0.lerp(p1,t)+r*(u*math.cos(theta)+w*math.sin(theta));half=.009*math.sin(math.pi*f)+.001
                    pts.extend([origin+(cen-axis*half)*s,origin+(cen+axis*half)*s])
                marks.surface(pts,[(i,i+2,i+3,i+1) for i in (0,2,4,6)],[(.15,.063,.038)]*10)
        mesh('Avenue cherry bark lenticels',marks.verts,marks.faces,mat('Cherry russet bark markings',(.12,.052,.030),.91))
        for j in range(5):
            a=j*2.40;d=v(math.cos(a),math.sin(a),0)
            branch('root flare',[d*.13+v(0,0,.23),d*.29+v(0,0,.078),d*.47+v(0,0,.01)],[.13,.074,.008])
        for j in range(7):
            a=j*2.40+.31*n;d=v(math.cos(a),math.sin(a),0);w=v(-d.y,d.x,0);h=1.33+j*.32
            reach=2.23-.095*j;root=v(.15,.1,h);elbow=root+d*.63+v(0,0,.64);tip=root+d*reach+w*rng.uniform(-.38,.38)+v(0,0,1.02)
            branch('scaffold',[root,elbow,elbow.lerp(tip,.49)+v(0,0,.1),tip],[.17-.01*j,.105,.075,.032])
            for k in range(5):
                t=.32+.15*k;fork=elbow.lerp(tip,t);sgn=(-1)**k;dest=fork+d*(.4+rng.random()*.25)+w*sgn*(.47+rng.random()*.37)+v(0,0,.28+rng.random()*.4)
                branch('lateral',[fork,fork.lerp(dest,.53)-v(0,0,.10),dest],[.062,.035,.009])
                for q in range(4):
                    pt=fork.lerp(dest,.43+.17*q)+v(rng.uniform(-.1,.1),rng.uniform(-.1,.1),.04*q)
                    pool.place(rng.choice(('blossom-a','blossom-b','blossom-c')),origin+pt*s,s*rng.uniform(.87,1.25),rng.random()*TAU,rng.uniform(-.34,.38))


def beds(pool,manifest,public):
    rng=random.Random(218);t=manifest['terrain'];N=t['resolution'];vals=struct.unpack('<'+'f'*N*N,(public/manifest['heightmap']).read_bytes()) if 'heightmap' in manifest else struct.unpack('<'+'f'*N*N,(public/'heightmap.bin').read_bytes())
    def ground(x,y):
        gx=(x-t['minX'])*(N-1)/t['size'];gy=(y-t['minY'])*(N-1)/t['size'];i=int(gx);j=int(gy);a=gx-i;b=gy-j
        return (1-b)*((1-a)*vals[j*N+i]+a*vals[j*N+i+1])+b*((1-a)*vals[(j+1)*N+i]+a*vals[(j+1)*N+i+1])
    paved={(i,j) for x,y,w,h in manifest['layout']['PATHS'] for i in range(x,x+w) for j in range(y,y+h)}
    for bed,(cx,cy,w,d) in enumerate([(-18.2,4.65,3.0,1.24),(-8.0,4.8,3.2,1.08),(-4,4.8,2.8,1.0),(3.7,4.65,2.1,1.12),(18.4,4.65,3.2,1.12),(26,4.65,3.45,1.21),(36.1,4.7,3.8,1.16),(23.8,-2.4,2.5,1.46)]):
        for j in range(54):
            a=rng.random()*TAU;r=math.sqrt(rng.random());x=cx+w/2*r*math.cos(a);y=cy+d/2*r*math.sin(a)
            if (math.floor(x/2.4+12),math.floor(10.5-y/2.4)) in paved:continue
            # Repeat species in drifts rather than scattering colors uniformly.
            kind='fern' if j%4==0 else ('lavender','cosmos','poppy')[(bed+(x>cx+.20))%3]
            pool.place(kind,(x,y,ground(x,y)-.012),rng.uniform(.72,1.14),rng.random()*TAU)


def landscape(manifest,public):
    for old in list(bpy.context.scene.objects):
        if old.name.startswith(('Avenue garden ','Avenue cherry ')):bpy.data.objects.remove(old,do_unlink=True)
    pool=Instances();specimens(pool,vertex_material('Meadow plant Avenue botanical color'));blossom_trees(pool);beds(pool,manifest,public)
    assert pool.used==set(pool.models),'An unplaced specimen would appear at the world origin'
