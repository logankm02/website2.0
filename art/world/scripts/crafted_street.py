"""Turned municipal lights and close-range entrance joinery."""
import bpy,math
from world_core import mat,curve,uvball,box,mesh
from world_architecture import lathe
from crafted_props import rounded,palette,label


def lamps():
    old=[o for o in bpy.context.scene.objects if o.name.startswith(('Town lamppost','Lantern warm glass','Lantern frame','Lantern cap','Craft '))]
    assert old,'Editable lamps are missing from the avenue source'
    for o in old:bpy.data.objects.remove(o,do_unlink=True)
    m=palette();iron=mat('Craft enamel cast iron',(.032,.065,.061),.38,metal=.55)
    glass=mat('Craft honey lantern glass',(.94,.65,.23),.25)
    shader=next(n for n in glass.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Emission Color'].default_value=(1,.57,.17,1);shader.inputs['Emission Strength'].default_value=.3
    for tx,ty in ((10,7),(14,7),(10,14),(14,18),(3,15)):
        x,y,z=(tx-11.5)*2.4,(10-ty)*2.4,2.5
        lathe('Craft cast iron lamp',(x,y,z),[(.23,0),(.23,.06),(.19,.10),(.18,.17),(.16,.19),(.15,.55),(.12,.69),(.11,.72),(.085,.78),(.068,2.82),(.11,2.86),(.11,2.96),(.08,3.02),(.14,3.14)],iron,40)
        for i in range(12):
            a=i*math.tau/12
            curve('Craft pedestal fluting',[(x+.152*math.cos(a),y+.152*math.sin(a),z+.23),(x+.144*math.cos(a),y+.144*math.sin(a),z+.54)],.008,m['brass'])
        for dz,r in ((.14,.177),(.65,.13),(2.89,.114)):
            lathe('Craft turned brass collar',(x,y,z+dz),[(r,0),(r,.028)],m['brass'],40)
        # A six-sided lantern with framed, inset glass and a spun copper roof.
        lathe('Craft lantern sill',(x,y,z+3.12),[(.14,0),(.29,.08),(.29,.13),(.24,.16)],iron,48)
        for i in range(6):
            a=math.tau*i/6;aa=a+math.tau/6
            vs=[(x+r*math.cos(t),y+r*math.sin(t),z+h) for h,r in ((3.28,.235),(3.80,.29)) for t in (a,aa)]
            mesh('Craft inset lantern pane',vs,[(0,1,3,2)],glass)
            curve('Craft lantern mullion',[(x+.235*math.cos(a),y+.235*math.sin(a),z+3.25),(x+.29*math.cos(a),y+.29*math.sin(a),z+3.82)],.019,iron)
        lathe('Craft spun copper canopy',(x,y,z+3.79),[(.31,0),(.33,.035),(.33,.065),(.25,.10),(.19,.21),(.09,.29),(.06,.32)],iron,48)
        uvball('Craft lantern finial',(x,y,z+4.15),(.055,.055,.085),m['brass'],20,12)


def entrances(landmarks):
    for o in list(bpy.context.scene.objects):
        if o.name.startswith('Craft '):bpy.data.objects.remove(o,do_unlink=True)
    m=palette()
    for lm in landmarks:
        key=lm['id']
        if key not in ('education','experience','projects'):continue
        x=lm['door'][0];f=lm['center'][1]-lm['half'][1]
        face=f+(.61 if key=='education' else -.50)
        width=3.3 if key=='projects' else 2
        metal=m['brass'] if key=='education' else m['metal']
        # Edge mouldings sit on the existing opaque leaves, rather than adding glazing.
        if key=='education':
            for side in (-1,1):
                for z,h in ((3.27,.79),(4.61,.99)):
                    xx=x+side*.43
                    for dx in (-.325,.325):rounded('Craft door panel stile',(xx+dx,face-.273,z),(.047,.05,h),m['oak'],.016)
                    for dz in (-h/2,h/2):rounded('Craft door panel rail',(xx,face-.273,z+dz),(.69,.05,.047),m['oak'],.016)
            rounded('Craft letter slot surround',(x,face-.219,4.01),(.46,.05,.12),metal,.025)
            rounded('Craft letter slot',(x,face-.25,4.01),(.35,.02,.035),m['dark'],.012)
        for side in ((-1,1) if key=='projects' else (-1,)):
            for z in (2.90,3.96,5.04):
                xx=x+side*(width/2-.04)
                lathe('Craft hinge knuckle',(xx,face-.23,z-.10),[(.033,0),(.034,.20)],metal,20)
                for zz in (-.07,.07):uvball('Craft hinge screw',(xx-side*.055,face-.239,z+zz),(.014,.009,.014),metal,12,8)
        hx=x+(.74 if key!='projects' else 1.1)
        rounded('Craft lock escutcheon',(hx,face-.244,3.37),(.10,.07,.15),metal,.025)
        uvball('Craft keyhole',(hx,face-.283,3.39),(.014,.006,.017),m['dark'],14,8)
        box('Craft keyhole stem',(hx,face-.285,3.366),(.014,.009,.024),m['dark'])
        rounded('Craft threshold nosing',(x,face-.16,2.515),(width+.22,.37,.045),metal,.012)
        # Flush side-mounted entry callplate has hardware and readable designation.
        sx=x-width/2-.34
        rounded('Craft entry callplate',(sx,face-.18,4.10),(.29,.09,.48),metal,.035)
        for dz in (-.19,.19):uvball('Craft callplate screw',(sx,face-.23,4.1+dz),(.012,.007,.012),m['dark'],12,8)
        uvball('Craft bell push',(sx,face-.25,4.04),(.055,.025,.055),m['dark'],24,12)
        label('CALL',(sx,face-.233,4.20),.055,m['ink'])
