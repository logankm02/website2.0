"""Original Logan City furnishings. Coordinates use Blender's Z-up frame."""
import math
import bpy
from world_core import box, tube, uvball, text, mat


def furnish(room, manifest):
    oak = mat('Oiled cherry', (.32,.145,.055))
    navy = mat('Midnight enamel', (.025,.055,.12))
    brass = mat('Brushed honey brass', (.87,.52,.09), .38, metal=.35)
    cream = mat('Ivory linen', (.92,.86,.65))
    red = mat('Persimmon enamel', (.70,.105,.055))
    green = mat('Atlantic teal', (.035,.32,.33))
    alloy = mat('Gunmetal hardware', (.11,.15,.18), .42, metal=.42)
    glass = mat('Instrument glass', (.035,.16,.21), .32)
    mint = mat('Instrument trace', (.16,.81,.63))
    pages = mat('Warm page edges', (.78,.70,.52))

    def block(x,y,w,d,height):
        manifest['collision'].append(dict(x=x,z=-y,hx=w/2,hz=d/2,minY=0,maxY=height))

    def station(key,label,x,y,body,href,action,travel=False):
        entry = dict(id=key,label=label,kind='Visit' if travel else 'Inspect',position=[x,0,-y],
                     radius=1.65,body=body,links=[dict(label=action,href=href)])
        if travel:
            entry['travel'] = href
        manifest['locations'].append(entry)

    def sign(words,x,y,z,size,color):
        obj = text('Lettering '+words,words,(x,y,z),size,color)
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH')

    def table(x,y,w,d,top=oak):
        box('Bench top',(x,y,1.02),(w,d,.15),top,.05)
        for side in [-1,1]:
            for end in [-1,1]:
                box('Bench leg',(x+side*(w/2-.18),y+end*(d/2-.16),.48),(.12,.12,.96),alloy,.02)
        block(x,y,w,d,1.1)

    def screen(x,y,z,w,h):
        box('Display housing',(x,y,z),(w,.14,h),navy,.06)
        box('Glass face',(x,y-.08,z),(w-.12,.025,h-.12),glass,.02)
        trace = [(x+w*(i/10-.45),y-.11,z+.23*h*math.sin(i*2.6)) for i in range(10)]
        tube('Telemetry trace',trace,[.017]*len(trace),mint,6)

    if room == 'education':
        box('Reading rug',(0,.8,.013),(4.4,4,.022),navy,.01)
        for x in [-2.03,2.03]:
            box('Woven gold border',(x,.8,.027),(.055,3.8,.01),brass)
        for x,school,campus in [(-3.45,'ROCHESTER','rochester'),(3.45,'BERKELEY','berkeley')]:
            y=4.32
            for radius,thickness,material in [(1.25,.16,navy),(1.09,.065,brass)]:
                arc=[(x-radius,y,.12)]+[(x+radius*math.cos(math.pi-i*math.pi/20),y,1.85+radius*math.sin(i*math.pi/20)) for i in range(21)]+[(x+radius,y,.12)]
                tube(school+' arch',arc,[thickness]*len(arc),material,10)
            box('School nameplate',(x,y-.16,3.43),(2.7,.09,.49),navy,.04)
            sign(school,x,y-.22,3.32,.32,cream)
            for dx in [-1.25,1.25]:
                block(x+dx,y,.34,.34,2)
            station(campus,school.title()+' gateway',x,3.55,'Step through to campus.','/world?campus='+campus,'Visit campus',True)
        for x in [-1.53,1.53]:
            box('Library end panel',(x,4.30,1.35),(.12,.65,2.7),oak,.025)
        for row in range(4):
            z=.22+row*.78
            box('Oak shelf',(0,4.30,z),(3.12,.66,.10),oak,.02)
            if row<3:
                for i in range(12):
                    h=.43+.065*((i+row*2)%4)
                    x=-1.33+i*.235
                    box('Clothbound volume',(x,4.22,z+.05+h/2),(.19,.37,h),[navy,green,red,cream][(i+row)%4],.012)
                    box('Spine band',(x,4.026,z+.16),(.16,.014,.025),brass)
        block(0,4.3,3.2,.68,2.72)
        table(-3.65,.35,1.8,1.15)
        for dx,angle in [(-.26,-.12),(.26,.12)]:
            leaf=box('Open academic ledger',(-3.65+dx,.35,1.16),(.53,.73,.10),pages,.025)
            leaf.rotation_euler.y=angle
        station('ledger','Academic ledger',-3.65,-.8,'An open ledger records degrees, honors, and varsity seasons.','/about#about','Read academic record')

    elif room == 'experience':
        table(0,3.65,6.75,1.25,alloy)
        for x in [-2.15,0,2.15]:
            box('Screen stand',(x,3.83,1.35),(.12,.17,.6),alloy)
            screen(x,3.83,1.94,1.94,1.09)
            box('Key deck',(x,3.37,1.14),(1.12,.36,.08),navy,.035)
        sign('OPERATIONS   /   TELEMETRY',0,4.82,3.76,.33,cream)
        station('console','Telemetry desk',0,2.5,'The operators track builds, localization tests, and board bring-up here.','/about#experience','Open career record')
        x,y=-3.7,.55
        for angle in [0,2.094,4.189]:
            tube('Tripod leg',[(x+.67*math.cos(angle),y+.67*math.sin(angle),.03),(x,y,1.55)],[.065,.042],alloy)
        tube('LiDAR scanner',[(x,y,1.45),(x,y,1.62),(x,y,1.91)],[.24,.35,.29],brass,32)
        tube('Optical band',[(x,y,1.68),(x,y,1.83)],[.34,.32],glass,32)
        block(x,y,1.35,1.35,1.92)
        station('lidar','LiDAR tripod',x,y-1.15,'This scanner is the racecar’s measuring tape. Its point clouds help the car locate itself on track.','https://roar.berkeley.edu/','Visit ROAR')
        table(3.65,.65,2.1,1.55)
        for i in range(5):
            for j in range(3):
                box('Photovoltaic cell',(2.89+i*.38,.22+j*.43,1.16),(.35,.4,.055),glass,.015)
        station('array','CalSol test array',3.65,-.65,'A spare photovoltaic array from the solar vehicle electronics bench.','https://calsol.berkeley.edu/','Visit CalSol')

    else:
        table(0,4.45,6,1.3)
        screen(0,4.67,2.02,2.7,1.25)
        for x in [-2.14,2.14]:
            box('Instrument cabinet',(x,4.53,1.69),(1.1,.79,1.15),alloy,.06)
            for i in range(4):
                box('Instrument drawer',(x,4.12,1.30+i*.24),(.96,.05,.16),navy,.02)
                box('Signal lamp',(x-.34,4.085,1.30+i*.24),(.09,.02,.04),mint)
        sign('LOGAN LABS    /    BUILD BAY',0,5.80,3.85,.42,navy)
        x,y=-3.85,.75
        box('Exhibit plinth',(x,y,.11),(3,4.8,.22),alloy,.09)
        uvball('Open wheel chassis',(x,y,.63),(.71,1.48,.32),red,24,14)
        uvball('Tapered nose',(x,y-.97,.56),(.36,.93,.19),cream)
        uvball('Cockpit',(x,y+.18,.9),(.38,.53,.15),navy)
        for side in [-1,1]:
            for axle in [-1.05,1]:
                wx,wy=x+side*.87,y+axle
                tube('Racing slick',[(wx-.18,wy,.57),(wx+.18,wy,.57)],[.38,.38],navy,28)
                tube('Wheel hub',[(wx-.19,wy,.57),(wx+.19,wy,.57)],[.20,.20],alloy,20)
            box('Rear wing upright',(x+side*.48,y+1.53,.78),(.1,.14,.59),alloy)
        box('Rear aerofoil',(x,y+1.55,1.12),(2.15,.43,.12),red,.045)
        box('Front wing',(x,y-1.85,.4),(2,.36,.1),cream,.03)
        tube('Sensor mast',[(x,y+.67,.85),(x,y+.67,1.29)],[.045,.045],alloy)
        tube('Rooftop LiDAR',[(x,y+.67,1.29),(x,y+.67,1.45)],[.15,.15],brass,20)
        block(x,y,3,4.8,1.45)
        station('racecar','ROAR racecar',x,y-2.95,'An open-wheel racer with a LiDAR mast above the cockpit. The original city puts this car beside its researcher.','https://roar.berkeley.edu/','Visit ROAR')
        x,y=4,.65
        table(x,y,2.18,2.18)
        box('Word board',(x,y,1.12),(1.84,1.84,.06),green,.02)
        for i in range(16):
            t=-.87+i*.116
            box('Board ruling',(x+t,y,1.154),(.009,1.74,.007),pages)
            box('Board ruling',(x,y+t,1.154),(1.74,.009,.007),pages)
        for i,ch in enumerate('QUIXOTIC'):
            tx=x+(i-4)*.116
            box('Letter tile',(tx,y,1.17),(.11,.11,.04),cream,.007)
            letter=text('Tile '+ch,ch,(tx,y-.031,1.192),.08,navy)
            letter.rotation_euler=(0,0,0)
            bpy.ops.object.select_all(action='DESELECT')
            letter.select_set(True)
            bpy.context.view_layer.objects.active=letter
            bpy.ops.object.convert(target='MESH')
        station('scrabble','Scrabble table',x,y-1.56,'The bot left QUIXOTIC on the board. Pull up a game and take the next turn.','https://logankm02.github.io/scrabble-bot/','Play Scrabble')
