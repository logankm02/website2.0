"""Batched masonry, metalwork and planting for the campus and city exteriors."""
import math
from collections import defaultdict
import bpy
from mathutils import Vector
from world_core import mat, text

TAU = math.tau
class Detail:
    def __init__(self):
        self.data = defaultdict(lambda: [[], []])
        self.materials = {}

    def material(self, name, rgb, rough=.78, metal=0):
        self.materials[name] = mat(name, rgb, rough, metal=metal)
        return name

    def surface(self, material, vertices, faces):
        points, polys = self.data[material]
        start = len(points)
        points.extend(tuple(p) for p in vertices)
        polys.extend(tuple(start+k for k in face) for face in faces)

    def block(self, material, center, size, angle=0):
        x,y,z=center
        w,d,h=(v/2 for v in size)
        c,s=math.cos(angle),math.sin(angle)
        vs=[(x+c*a-s*b,y+s*a+c*b,z+v) for v in (-h,h) for a,b in [(-w,-d),(w,-d),(w,d),(-w,d)]]
        self.surface(material,vs,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])

    def turn(self, material, origin, profile, segments=48, flute=0):
        x,y,z=origin
        vs=[]; fs=[]
        for r,h in profile:
            for j in range(segments):
                a=TAU*j/segments
                radius=r*(1-flute*(1+math.cos(12*a))/2)
                vs.append((x+radius*math.cos(a),y+radius*math.sin(a),z+h))
        for k in range(len(profile)-1):
            for j in range(segments):
                a=k*segments+j;b=k*segments+(j+1)%segments
                fs.append((a,b,b+segments,a+segments))
        fs.extend([tuple(reversed(range(segments))),tuple(range(len(vs)-segments,len(vs)))])
        self.surface(material,vs,fs)

    def rod(self, material, start, end, radius, n=8):
        a,b=Vector(start),Vector(end)
        line=(b-a).normalized()
        u=line.cross(Vector((1,0,0)) if abs(line.x)<.85 else Vector((0,1,0))).normalized()*radius
        v=line.cross(u)
        ring=[u*math.cos(TAU*j/n)+v*math.sin(TAU*j/n) for j in range(n)]
        self.surface(material,[p+d for p in (a,b) for d in ring],[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]+[tuple(reversed(range(n))),tuple(range(n,2*n))])

    def lettering(self, material, words, location, size, angle=0):
        ob=text(words,words,location,size,self.materials[material])
        ob.rotation_euler.z=angle
        return ob

    def finish(self):
        for name,(vs,fs) in self.data.items():
            geo=bpy.data.meshes.new(name)
            geo.from_pydata(vs,[],fs);geo.update()
            ob=bpy.data.objects.new(name,geo);bpy.context.scene.collection.objects.link(ob)
            geo.materials.append(self.materials[name])

def palette(g):
    return [g.material(*spec) for spec in [
        ('Indiana limestone',(.69,.57,.40)),('Carved ivory stone',(.84,.75,.57)),
        ('Warm shadow stone',(.44,.36,.26)),('Academic fired brick',(.37,.126,.079)),
        ('Deep mullion bronze',(.065,.085,.078),.48,.42),('Library glazing',(.048,.15,.18),.23,.26),
        ('Weathered copper',(.15,.39,.31),.51,.40),('Dark slate',(.13,.19,.20)),
        ('Cast bell bronze',(.54,.32,.09),.39,.67),('Clock dial porcelain',(.90,.85,.67),.42),
        ('Sierra granite stone',(.65,.63,.55)),('Spire white marble stone',(.87,.86,.78)),
        ('Panelled oak',(.23,.105,.039)),('Foundry iron',(.046,.068,.071),.55,.55),
        ('Enamel midnight',(.027,.093,.15),.42),('Golden enamel',(.94,.55,.095),.53)]]

def bed(g,x,y,w,d,colors,seed):
    import random
    rng=random.Random(seed)
    soil=g.materials.get('Mulch')
    if not soil:g.material('Mulch',(.16,.09,.044))
    g.block('Mulch',(x,y,2.55),(w,d,.09))
    for side in (-1,1):
        g.block('Warm shadow stone',(x,y+side*d/2,2.61),(w+.12,.11,.17))
        g.block('Warm shadow stone',(x+side*w/2,y,2.61),(.11,d,.17))
    for i in range(round(w*d*20)):
        X=x+rng.uniform(-w/2+.1,w/2-.1); Y=y+rng.uniform(-d/2+.1,d/2-.1)
        h=rng.uniform(.20,.43); a=rng.random()*TAU
        for j in range(4):
            t=a+j*TAU/4;dx=.15*math.cos(t);dy=.15*math.sin(t)
            g.surface('Garden foliage',[(X,Y,2.60),(X+dx*.53-dy*.25,Y+dy*.53+dx*.25,2.62+h*.44),(X+dx,Y+dy,2.63+h*.70),(X+dx*.53+dy*.25,Y+dy*.53-dx*.25,2.62+h*.44)],[(0,1,2),(0,2,3)])
        if i%2:continue
        Z=2.60+h;g.rod('Garden foliage',(X,Y,2.60),(X,Y,Z),.012,4)
        for j in range(5):
            t=a+j*TAU/5;dx=.071*math.cos(t);dy=.071*math.sin(t)
            g.surface(colors[i%len(colors)],[(X,Y,Z),(X+dx-dy*.55,Y+dy+dx*.55,Z+.062),(X+1.35*dx,Y+1.35*dy,Z+.073),(X+dx+dy*.55,Y+dy-dx*.55,Z+.062)],[(0,3,2,1)])
