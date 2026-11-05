"""Distant ridgelines and a flowering tree for the north approach to Meridian Court."""
import math, random
from mathutils import Vector
from mathutils.noise import noise_vector
from world_core import mesh, shade, mat, tube
from world_nature import vertex_material
TAU=math.tau

def landscape():
    # Continuous panorama. Ridges have irregular spurs, gullies and a snow line
    # that follows the slope of the rock, including snow on sheltered lower ledges.
    verts=[]; faces=[]; colors=[]
    material=vertex_material('Meridian painted highlands')
    cols=336; rows=44
    for j in range(rows):
        t=j/(rows-1)
        for i in range(cols):
            a=TAU*i/cols
            r=85+t*195
            x=r*math.sin(a); y=r*math.cos(a)
            coarse=noise_vector(Vector((x*.027,y*.027,1.4)))[0]
            detail=noise_vector(Vector((x*.092,y*.092,7.8)))[1]
            near=math.exp(-((t-.24-.045*math.sin(a*5))/.105)**2)*(14+5*math.sin(a*7)+3*math.cos(a*11))
            ridge=.67+.055*math.sin(a*5+.6)+.031*math.sin(a*13)
            alp=23+8*math.sin(a*6)+5*math.cos(a*14)
            for summit,height,angle in [(.12,54,.32),(-.19,28,.26),(.84,32,.23),(2.7,32,.4),(4.14,42,.33),(5.39,36,.30)]:
                dist=abs(math.atan2(math.sin(a-summit),math.cos(a-summit)))
                alp+=height*max(0,1-dist/angle)**1.26
            alpine=math.exp(-abs((t-ridge)/.165)**1.44)*alp
            z=-4+near+alpine+(4.5*coarse+1.6*detail)*min(t*9,1)
            verts.append((x,y,z))
            shade_value=.60+.24*coarse+.12*detail+.10*math.sin(20*a+9*t)
            forest=(.085+.07*shade_value,.17+.11*shade_value,.16+.13*shade_value)
            rock=(.17+.16*shade_value,.24+.17*shade_value,.31+.19*shade_value)
            ice=max(0,min(1,(z-39-6*math.sin(a*23+t*7)+detail*5)/7))
            stone=max(0,min(1,(z-16+coarse*6)/16))
            colors.append(tuple((forest[k]*(1-stone)+rock[k]*stone)*(1-ice)+(.80,.90,.94)[k]*ice for k in range(3)))
    for j in range(rows-1):
        for i in range(cols):
            a=j*cols+i;b=j*cols+(i+1)%cols
            faces.extend([(a,b,a+cols),(a+cols,b,b+cols)])
    mountain=shade(mesh('Meridian ridgelines',verts,faces,material,colors=colors))
    return mountain

def flowering_tree():
    rng=random.Random(172)
    bark=mat('Blossom tree russet bark',(.20,.105,.065),.9)
    pink=vertex_material('Meridian blossom canopy')
    leaves=[];faces=[];colors=[]
    def leaf(center,heading,size,color):
        u=Vector((math.cos(heading),math.sin(heading),rng.uniform(-.25,.4)))*size
        v=Vector((-math.sin(heading),math.cos(heading),rng.uniform(-.28,.28)))*size*.49
        k=len(leaves)
        leaves.extend([center-u,center-v,center+u,center+v,center+Vector((0,0,size*.25))])
        faces.extend([(k,k+1,k+4),(k+1,k+2,k+4),(k+2,k+3,k+4),(k+3,k,k+4)])
        colors.extend([color]*5)
    for x,y,s in [(-3.5,15.6,.94),(24.,-2.3,.80)]:
        def wp(p): return Vector((x+s*p[0],y+s*p[1],2.5+s*p[2]))
        tube('Blossom trunk',[wp(p) for p in [(0,0,0),(-.16,.04,1),(.1,.16,2.4),(.34,0,3.95)]],[.37*s,.28*s,.21*s,.10*s],bark,16)
        for branch in range(16):
            a=branch*2.4; h=2.0+branch*.115
            reach=2.2 if branch<11 else 1.42
            tip=Vector((reach*math.cos(a),reach*math.sin(a),h+1.2))
            root=Vector((.1,.1,h))
            middle=root.lerp(tip,.5)+Vector((0,0,-.17))
            tube('Blossom bough',[wp(root),wp(middle),wp(tip)],[.14*s,.092*s,.028*s],bark,9)
            for j in range(5):
                b=a+(j-2)*.53
                c=tip+Vector((.70*math.cos(b),.70*math.sin(b),.20+.20*j))
                tube('Fine flowering branch',[wp(middle.lerp(tip,.77)),wp(c)],[.045*s,.009*s],bark,7)
                for q in range(40):
                    phi=rng.uniform(0,TAU); zz=rng.uniform(-1,1); ring=math.sqrt(1-zz*zz)
                    point=wp(c+Vector((ring*math.cos(phi)*.74,ring*math.sin(phi)*.61,zz*.56)))
                    tone=rng.uniform(.82,1.13)
                    base=rng.choice([(.70,.22,.32),(.94,.46,.57),(.95,.66,.69),(.35,.49,.22)])
                    leaf(point,rng.uniform(0,TAU),rng.uniform(.095,.23)*s,tuple(tone*v for v in base))
    return mesh('Clouds of spring blossom',leaves,faces,pink,colors=colors)
