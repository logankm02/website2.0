"""Hand-authored stylized Tesla Model 3; Blender Z-up, nose along +X.
Fits the city's existing 4.8 by 2 metre parking collider. No downloaded assets.
"""
import bpy, math
from world_core import box, curve, mesh, shade, uvball, mat, text
from world_architecture import lathe

LEGACY_CAR_PREFIXES=('Crossover','Swept crossover','Flush door handle','Alloy wheel','Wheel spoke','Tesla ')

def build_tesla(cx,cy,cz):
    before=set(bpy.context.scene.objects)
    pearl=mat('Tesla pearl white paint',(.88,.91,.94),.24,metal=.28)
    glass=mat('Tesla smoked panoramic glass',(.019,.035,.05),.17,metal=.35)
    rubber=mat('Tesla tire rubber',(.014,.018,.022),.88)
    trim=mat('Tesla satin graphite',(.024,.03,.038),.32,metal=.48)
    silver=mat('Tesla machined alloy',(.52,.58,.64),.26,metal=.8)
    lamps=mat('Tesla LED lenses',(.8,.94,1),.18)
    red=mat('Tesla ruby tail lenses',(.62,.012,.018),.21)
    def p(x,y,z): return (cx+x,cy+y,cz+z)
    # A continuous sculpted shell with true wheel cut-outs in its lower edge.
    profiles=[(-2.32,.70,.85),(-2.1,.87,1.0),(-1.65,.93,1.02),(-.9,.945,1.02),(0,.945,.99),(.9,.94,.94),(1.5,.90,.88),(2.08,.80,.75),(2.32,.64,.64)]
    def profile(x):
        for (a,w,h),(b,v,k) in zip(profiles,profiles[1:]):
            if a<=x<=b:
                t=(x-a)/(b-a); return w+(v-w)*t,h+(k-h)*t
        return profiles[-1][1:]
    vs=[];fs=[];n=97
    for i in range(n):
        x=-2.32+4.64*i/(n-1);w,h=profile(x);bottom=.28
        for axle in [-1.43,1.43]:
            d=abs(x-axle)
            if d<.475: bottom=max(bottom,.43+math.sqrt(.475**2-d*d))
        # shoulders wrap into the side panels, keeping wheel arches open.
        ring=[(-w*.98,bottom),(-w,h-.13),(-w*.9,h),(-w*.52,h+.045),(0,h+.065),(w*.52,h+.045),(w*.9,h),(w,h-.13),(w*.98,bottom)]
        vs.extend(p(x,y,z) for y,z in ring)
    for i in range(n-1):
        for j in range(8):a=i*9+j;fs.append((a,a+9,a+10,a+1))
    fs.extend([tuple(reversed(range(9))),tuple(range((n-1)*9,n*9))])
    shade(mesh('Tesla sculpted sedan shell',vs,fs,pearl))
    # Windshield, panoramic roof and sloping rear glass form one fastback arc.
    sections=[(-1.78,.76,1.02),(-1.28,.77,1.32),(-.85,.76,1.50),(-.22,.74,1.53),(.36,.75,1.43),(.77,.79,1.17),(1.08,.80,.98)]
    vs=[];fs=[]
    for x,w,h in sections:
        for j in range(17):
            t=-1+2*j/16;vs.append(p(x,w*t,.99+(h-.99)*math.sqrt(max(0,1-t*t))))
    for i in range(len(sections)-1):
        for j in range(16):a=i*17+j;fs.append((a,a+17,a+18,a+1))
    roof=shade(mesh('Tesla panoramic glass roof and windows',vs,fs,glass))
    sub=roof.modifiers.new('Smooth glazing','SUBSURF');sub.levels=2
    bpy.context.view_layer.objects.active=roof;bpy.ops.object.modifier_apply(modifier=sub.name)
    def roof_edge(x,t,side):
        for (a,w,h),(b,v,k) in zip(sections,sections[1:]):
            if a<=x<=b:
                f=(x-a)/(b-a);width=w+(v-w)*f;height=h+(k-h)*f
                return p(x,side*width*t,.99+(height-.99)*math.sqrt(1-t*t)+.012)
    for side in [-1,1]:
        # Pillars sit on the glazing, rather than floating above its curved surface.
        curve('Tesla window lower trim',[p(-1.7,side*.77,1.015),p(-.65,side*.85,1.02),p(.5,side*.85,1.005),p(1.02,side*.8,.99)],.016,trim)
        curve('Tesla roof rail',[roof_edge(x,.77,side) for x in [-1.7,-1.4,-1.15,-.85,-.5,-.22,.1,.36,.65,.85,1.02]],.024,pearl)
        curve('Tesla B pillar',[roof_edge(-.36,t,side) for t in [.99,.95,.9,.85,.77]],.026,trim)
        for x in [-.91,.45]:
            box('Tesla flush door handle',p(x,side*.946,.90),(.25,.027,.035),trim,.012)
        # Panel gaps, rocker sill and mirrors.
        curve('Tesla door seam',[p(-.36,side*.947,.98),p(-.36,side*.947,.50),p(-.27,side*.94,.31)],.006,trim)
        box('Tesla rocker sill',p(0,side*.93,.30),(1.8,.045,.065),trim,.018)
        curve('Tesla mirror arm',[p(.65,side*.85,1.04),p(.62,side*.98,1.08)],.028,trim)
        uvball('Tesla side mirror',p(.60,side*.99,1.1),(.14,.09,.06),pearl)
        for x in [-1.43,1.43]:
            wheel=lathe('Tesla tire',(0,0,0),[(.29,-.10),(.38,-.12),(.43,-.075),(.43,.075),(.38,.12),(.29,.10)],rubber,48)
            wheel.rotation_euler.x=math.pi/2;wheel.location=p(x,side*.88,.43)
            rim=lathe('Tesla aero alloy rim',(0,0,0),[(0,-.018),(.29,-.018),(.31,0),(.29,.025),(0,.025)],trim,40)
            rim.rotation_euler.x=math.pi/2;rim.location=p(x,side*1.005,.43)
            for j in range(5):
                a=j*math.tau/5
                pts=[p(x+r*math.cos(a+da),side*1.035,.43+r*math.sin(a+da)) for r,da in [(.065,-.2),(.27,-.13),(.28,.18),(.13,.43)]]
                mesh('Tesla turbine spoke',pts,[(0,1,2,3)],silver)
            uvball('Tesla wheel center',p(x,side*1.04,.43),(.065,.014,.065),silver,16,8)
        # Separated swept lamps and red C-shaped tail lamps.
        curve('Tesla swept headlamp housing',[p(2.27,side*.49,.70),p(2.14,side*.68,.76),p(1.94,side*.79,.80)],.035,trim)
        curve('Tesla white daytime light',[p(2.28,side*.49,.75),p(2.15,side*.68,.81),p(1.97,side*.78,.84)],.015,lamps)
        curve('Tesla rear C light',[p(-2.30,side*.38,.84),p(-2.30,side*.68,.84),p(-2.30,side*.7,.74),p(-2.30,side*.48,.74)],.034,red)
    box('Tesla lower air intake',p(2.30,0,.37),(.035,1.05,.09),trim,.025)
    box('Tesla rear diffuser',p(-2.30,0,.34),(.05,1.20,.11),trim,.025)
    # Tesla T on hood, shaped from its arc and tapered stem.
    curve('Tesla hood emblem arc',[p(1.84,-.11,.881),p(1.82,-.055,.889),p(1.81,0,.891),p(1.82,.055,.889),p(1.84,.11,.881)],.010,silver)
    mesh('Tesla hood emblem stem',[p(1.86,-.055,.882),p(1.86,.055,.882),p(2.045,.012,.829),p(2.045,-.012,.829)],[(0,1,2,3)],silver)
    lettering=text('Tesla trunk lettering','T E S L A',p(-2.334,0,.63),.103,silver)
    lettering.rotation_euler=(math.pi/2,0,-math.pi/2)
    plate=box('Tesla license plate',p(-2.335,0,.47),(.018,.42,.12),pearl,.012)
    return list(set(bpy.context.scene.objects)-before)
