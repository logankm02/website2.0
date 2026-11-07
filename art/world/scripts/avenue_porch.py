"""Steam-bent oak porch settee with an outdoor textile and brass joinery."""
import math,bpy
from mathutils import Vector
from world_core import mat,curve,mesh,shade,tube,uvball
from crafted_props import rounded,loop


def porch(landmarks):
    house=next(l for l in landmarks if l['id']=='education');x=house['center'][0]+4.5;y=house['center'][1]-house['half'][1]+.24;z=house['center'][2]
    for ob in list(bpy.context.scene.objects):
        if ob.name.startswith(('Porch couch base','Porch couch back','Couch rolled arm','Couch stitched cushion','Avenue porch ')):bpy.data.objects.remove(ob,do_unlink=True)
    oak=mat('Porch honey oiled oak',(.34,.16,.061),.48,noise_scale=8,bump=.012);walnut=mat('Porch walnut endgrain',(.17,.069,.024),.55)
    brass=mat('Porch aged brass pins',(.58,.35,.10),.32,metal=.7);navy=mat('Porch blue canvas',(.075,.17,.24),.81,noise_scale=150,bump=.009);linen=mat('Porch flax linen',(.73,.62,.44),.85,noise_scale=145,bump=.009)
    def p(dx,dy,dz):return(x+dx,y+dy,z+dz)
    def rib(name,fn,width,depth,material):
        vs=[];fs=[];steps=32;sides=12
        for i in range(steps+1):
            t=i/steps;c=Vector(fn(t));tan=(Vector(fn(min(1,t+.001)))-Vector(fn(max(0,t-.001)))).normalized();u=Vector((1,0,0));v=tan.cross(u).normalized()
            for j in range(sides):
                a=math.tau*j/sides;vs.append(c+u*(width/2*math.cos(a))+v*(depth/2*math.sin(a)))
            if i:
                for j in range(sides):a=(i-1)*sides+j;b=(i-1)*sides+(j+1)%sides;fs.append((a,b,b+sides,a+sides))
        fs.extend([tuple(reversed(range(sides))),tuple(range(len(vs)-sides,len(vs)))]);return shade(mesh('Avenue porch '+name,vs,fs,material))
    for s in (-1,1):
        for t in (-1,1):tube('Avenue porch splayed leg',[p(s*1.06,t*.42,.03),p(s*.99,t*.32,.43)],[.042,.067],walnut,20)
        # A continuous bent arm turns into a rear stile. Its cap exposes a brass dowel at the front joint.
        rib('bent arm rail',lambda t:p(s*1.08,-.46+.90*t,.72+.27*t+.08*math.sin(t*math.pi)),.125,.096,oak)
        rib('front arm upright',lambda t:p(s*1.08,-.34-.12*t,.36+.37*t),.10,.082,oak)
        rib('swept rear stile',lambda t:p(s*1.08,.28+.16*t,.33+.88*t),.11,.10,oak)
        uvball('Avenue porch pivot',p(s*1.142,-.40,.69),(.012,.032,.032),brass,16,10)
    for yy in (-.34,.33):rounded('Avenue porch long apron',p(0,yy,.36),(2.16,.09,.13),oak,.028)
    for j in range(12):rounded('Avenue porch seat slat',p((j-5.5)*.171,0,.435),(.14,.76,.058),oak,.018)
    for j in range(13):
        dx=(j-6)*.157
        rib('fanned back spindle',lambda t:p(dx*(.93+.07*t),.28+.13*t+.035*math.sin(t*math.pi),.45+.68*t),.054,.052,oak)
    for h in (.51,1.14):rounded('Avenue porch crest rail',p(0,.38 if h>1 else .29,h),(2.19,.10,.099),oak,.04)
    for s in (-1,1):
        xx=s*.49
        rounded('Avenue porch boxed seat',p(xx,-.04,.552),(.94,.73,.18),navy,.08)
        loop('Avenue porch linen welting',x+xx,y-.04,z+.563,.94,.73,.077,linen,.006)
        cushion=rounded('Avenue porch lumbar pillow',p(xx,.22,.81),(.86,.24,.34),linen,.105);cushion.rotation_euler.x=-.1
        # Split the original pillow surface into dyed bands so the woven stripes
        # follow all rounded edges without floating or intersecting geometry.
        import bmesh
        bm=bmesh.new();bm.from_mesh(cushion.data)
        bands=[(-.271,-.258),(-.242,-.210),(.210,.242),(.258,.271)]
        for lo,hi in bands:
            for cut in (lo,hi):
                bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,plane_co=(cut,0,0),plane_no=(1,0,0))
        cushion.data.materials.append(navy)
        for face in bm.faces:
            if any(lo<face.calc_center_median().x<hi for lo,hi in bands):face.material_index=1
        bm.to_mesh(cushion.data);bm.free();cushion.data.update()
    return (x,y,z)
