"""Close-range refinement, preserving existing room collision and interaction layouts."""
import bpy, math
from world_core import box, mat, curve, uvball
from world_architecture import lathe
from crafted_props import rounded, loop, palette, keyboard, dial, label


def remove(prefixes):
    for o in list(bpy.context.scene.objects):
        if o.name.startswith(prefixes):bpy.data.objects.remove(o,do_unlink=True)


def reading_nook(m):
    remove(('Settee walnut base','Tufted back','Rolled arm','Stitched cushion','Tuft button'))
    x,y=5.55,2.8
    wool=mat('Craft moss woven upholstery',(.13,.28,.18),.91,noise_scale=145,bump=.014)
    seam=mat('Craft sage piping',(.27,.41,.25),.86)
    ochre=mat('Craft ochre linen',(.66,.34,.085),.92,noise_scale=135,bump=.012)
    rounded('Craft settee oak frame',(x,y,.32),(3.63,1.37,.25),m['oak'],.08)
    for sx in (-1.52,1.52):
        for sy in (-.49,.49):lathe('Craft tapered sofa foot',(x+sx,y+sy,.02),[(.08,0),(.11,.26)],m['oak'],24)
    rounded('Craft upholstered back',(x,y+.50,.98),(3.61,.36,1.03),wool,.15)
    for s in (-1,1):
        rounded('Craft padded arm',(x+s*1.65,y,.79),(.39,1.35,.67),wool,.16)
        xx=x+s*.78
        rounded('Craft seat cushion',(xx,y-.10,.62),(1.45,1.01,.29),wool,.13)
        loop('Craft cushion welt',xx,y-.10,.67,1.43,.99,.14,seam)
        back=rounded('Craft back cushion',(xx,y+.29,1.08),(1.43,.30,.67),wool,.14)
        back.rotation_euler.x=math.radians(-8)
        for dx in (-.32,.32):uvball('Craft recessed tuft',(xx+dx,y+.116,1.11),(.025,.014,.025),seam,12,8)
    pillow=rounded('Craft loose linen pillow',(x-1.17,y-.06,.97),(.63,.30,.58),ochre,.14)
    pillow.rotation_euler=(.12,-.13,.18)
    # Woven throw follows the cushion then drops over its front edge.
    verts=[];faces=[]
    for row in range(49):
        t=row/48
        yy=y+(.34-(t/.70)*1.01 if t<=.70 else -.67-(t-.70)/.30*.10)
        zz=.80-.41*max(0,(t-.70)/.30)
        for col in range(33):
            u=col/32;verts.append((x+.48+(u-.5)*.68,yy,zz+.018*math.sin(u*math.pi*8+t*2)))
            if row and col:
                a=row*33+col;faces.append((a,a-1,a-34,a-33))
    from world_core import mesh
    throw=mesh('Craft folded wool throw',verts,faces,ochre)
    for f in throw.data.polygons:f.use_smooth=True
    for i in range(13):
        xx=x+.48+(i/12-.5)*.68
        curve('Craft throw fringe',[(xx,y-.79,.39),(xx+.008,y-.80,.32),(xx-.006,y-.81,.29)],.009,ochre)
    # Desk ledger: individual page edges, ruled leaves and bound spine.
    for s in (-1,1):
        for j in range(5):box('Craft ledger leaf edge',(-6.35+s*.26,.95,1.145+j*.006),(.49,.64,.004),m['cream'],.002)
        for j in range(8):box('Craft ledger ruled line',(-6.35+s*.26,.74+j*.053,1.184),(.37,.0025,.002),seam)
    curve('Craft ledger bookmark',[(-6.35,.66,1.19),(-6.35,.53,1.18),(-6.34,.49,1.12)],.013,ochre)


def control_desks(m):
    remove(('Key deck',))
    for x in (-2.15,0,2.15):
        keyboard(x,6.37,1.12,m)
        # Recessed bezel controls and cable, all contained on the desk.
        for i in range(3):uvball('Craft monitor button',(x+.66+i*.065,6.756,1.44),(.017,.012,.017),m['metal'],12,8)
        curve('Craft monitor lead',[(x,6.84,1.42),(x+.13,6.86,1.21),(x+.13,7.02,1.08),(x+.13,7.04,.20)],.014,m['dark'])
    for x in (-4.76,4.76):
        for z in (.34,.968,1.596,2.224):
            for side in (-1,1):
                xx=x+side*.47
                curve('Craft rack pull',[(xx,6.005,z-.065),(xx,5.955,z-.065),(xx,5.955,z+.065),(xx,6.005,z+.065)],.014,m['metal'])
                uvball('Craft rack fastener',(x+side*.61,6.031,z),(.019,.009,.019),m['metal'],12,8)
        label('NETWORK / '+('01' if x<0 else '02'),(x,6.061,2.62),.09,m['cream'])
    for x in (-2.65,-1.45,-.25,.95,2.15):
        for z in (2.4,2.65,2.9,3.15):box('Craft plotter grid',(x,7.534,z),(.004,.004,.21),m['metal'])


def fabrication(m):
    x,y=-7.57,6.43
    # Real mechanical layers: linear rails, belts, stepper housings and a Bowden tube.
    for s in (-1,1):
        for yy in (y-.42,y+.42):
            curve('Craft printer rail',[(x+s*.73,yy,1.75),(x+s*.73,yy,2.80)],.018,m['dark'])
        rounded('Craft stepper motor',(x+s*.67,y+.30,2.68),(.20,.24,.22),m['dark'],.025)
        box('Craft carriage belt',(x,y+s*.09,2.49),(1.48,.023,.026),m['dark'])
        for i in range(4):
            uvball('Craft motor bolt',(x+s*.67+(i%2-.5)*.13,y+.171,2.68+(i//2-.5)*.13),(.012,.008,.012),m['metal'],12,8)
    rounded('Craft hotend shroud',(x+.13,y-.13,2.39),(.28,.06,.26),m['cyan'],.025)
    for j in range(5):box('Craft fan grille',(x+.13,y-.169,2.31+j*.034),(.19,.012,.011),m['dark'])
    lathe('Craft brass nozzle',(x+.13,y,2.19),[(.013,0),(.05,.06),(.05,.09)],m['brass'],24)
    curve('Craft Bowden feed',[(x+.13,y,2.52),(x+.18,y,2.99),(x+.68,y+.1,3.04),(x+.81,y+.20,2.69)],.018,m['cream'])
    for j in range(18):
        zz=1.73+j*.024;r=.25-.085*math.sin(j/18*math.pi)
        curve('Craft printed layer',[(x+.13+r*math.cos(i*math.tau/48),y+r*math.sin(i*math.tau/48),zz) for i in range(49)],.005,m['brass'])
    for j in range(3):
        for k in (-1,1):rounded('Craft drawer handle mount',(-5.23+k*.37,5.67,.40+.35*j),(.065,.10,.09),m['metal'],.017)
    keyboard(0,7.65,1.12,m)
    for x in (-2.14,2.14):
        for j in range(4):dial(x+.23,7.56,1.30+j*.24,m)


def refine_room(room):
    m=palette()
    if room=='education':reading_nook(m)
    elif room=='experience':control_desks(m)
    else:
        remove(('Open wheel chassis','Tapered nose','Cockpit','Racing slick','Wheel hub','Rear wing upright','Rear aerofoil','Front wing','Sensor mast','Rooftop LiDAR'))
        from hero_racer import racer
        racer(-6.35,.75)
        fabrication(m)
