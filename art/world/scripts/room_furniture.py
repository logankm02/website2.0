"""Original Logan City furnishings. Coordinates use Blender's Z-up frame."""
import json
import math
from pathlib import Path
import bpy
from contextlib import contextmanager
from world_architecture import arch
from interior_collections import school_house, mission_control, makerspace
from world_core import box, tube, uvball, text, mat

NPC_DATA = json.loads((Path(__file__).resolve().parent / 'npc-dialogue.json').read_text())
VILLAGER_SKINS = [(.60,.31,.16), (.46,.24,.12), (.72,.50,.32), (.36,.19,.10), (.58,.40,.24)]
VILLAGER_HAIRS = [(.075,.028,.012), (.22,.10,.035), (.045,.045,.05), (.42,.27,.10), (.08,.06,.05)]
VILLAGER_SHIRTS = [(.035,.12,.20), (.58,.035,.025), (.035,.32,.33), (.33,.15,.59), (.68,.39,.09), (.12,.30,.10)]
VILLAGER_PANTS = [(.10,.11,.15), (.33,.30,.26), (.065,.09,.11), (.22,.15,.10)]
VILLAGER_SHOES = [(.15,.09,.045), (.08,.08,.09), (.35,.22,.08)]
VILLAGER_HAIR_STYLES = ['cap', 'curls', 'bun', 'short']
_villager_eye = None


def villager(idx, x, y):
    """A fully limbed standing figure, built the same way as the player
    character (tapered tube limbs, separate hands/feet, a simple face) —
    just unrigged, since these only need to hold a pose."""
    global _villager_eye
    if _villager_eye is None:
        _villager_eye = mat('Villager eyes', (.03,.03,.035), .35)
    skin = mat(f'Villager {idx} skin', VILLAGER_SKINS[idx % len(VILLAGER_SKINS)], .8)
    hair = mat(f'Villager {idx} hair', VILLAGER_HAIRS[idx % len(VILLAGER_HAIRS)], .85)
    shirt = mat(f'Villager {idx} shirt', VILLAGER_SHIRTS[idx % len(VILLAGER_SHIRTS)], .85)
    pants = mat(f'Villager {idx} pants', VILLAGER_PANTS[idx % len(VILLAGER_PANTS)], .9)
    shoes = mat(f'Villager {idx} shoes', VILLAGER_SHOES[idx % len(VILLAGER_SHOES)], .85)

    # Torso, tapered waist-to-shoulder, with a small hip saddle to smooth
    # the transition into the legs.
    tube(f'Villager {idx} torso', [(x,y,.40),(x,y,.72),(x,y,1.05)], [.165,.205,.175], shirt)
    uvball(f'Villager {idx} hips', (x,y,.42), (.175,.165,.10), pants, 18, 10)

    # Head and face.
    uvball(f'Villager {idx} head', (x,y,1.285), (.148,.14,.165), skin, 22, 14)
    for side in [-1,1]:
        uvball(f'Villager {idx} eye', (x+side*.052,y+.125,1.30), (.015,.009,.013), _villager_eye, 10, 8)
    uvball(f'Villager {idx} nose', (x,y+.142,1.272), (.016,.022,.018), skin, 10, 8)

    # Hair — a few simple styles cycled by index so the crowd reads as
    # distinct people, not clones.
    style = VILLAGER_HAIR_STYLES[idx % len(VILLAGER_HAIR_STYLES)]
    if style == 'cap':
        uvball(f'Villager {idx} hair', (x,y-.02,1.39), (.155,.145,.095), hair, 20, 12)
    elif style == 'curls':
        rr = (idx * 2.4)
        for i in range(10):
            a = i * 2.4 + rr
            r = .095 * math.sqrt(max(.15, 1 - ((i % 4) * .22)))
            uvball(f'Villager {idx} curl {i}', (x+math.cos(a)*r,y-.03+math.sin(a)*r*.7,1.41+(i%3)*.025), (.05,.05,.056), hair, 12, 8)
    elif style == 'bun':
        uvball(f'Villager {idx} hair', (x,y-.015,1.37), (.15,.14,.07), hair, 18, 10)
        uvball(f'Villager {idx} bun', (x,y-.12,1.41), (.065,.065,.065), hair, 14, 10)
    else:
        uvball(f'Villager {idx} hair', (x,y-.01,1.36), (.152,.142,.05), hair, 18, 10)

    # Arms with elbows and hands.
    for side in [-1,1]:
        tube(f'Villager {idx} upper arm', [(x+side*.205,y,1.00),(x+side*.255,y,.78)], [.05,.042], shirt)
        tube(f'Villager {idx} forearm', [(x+side*.255,y,.78),(x+side*.275,y+.03,.56)], [.042,.036], skin)
        uvball(f'Villager {idx} hand', (x+side*.28,y+.035,.515), (.032,.038,.044), skin, 12, 8)

    # Legs with knees and simple shoes.
    for side in [-.085,.085]:
        tube(f'Villager {idx} thigh', [(x+side,y,.40),(x+side,y,.20)], [.072,.058], pants)
        tube(f'Villager {idx} calf', [(x+side,y,.20),(x+side,y,.065)], [.058,.046], pants)
        box(f'Villager {idx} shoe', (x+side,y+.035,.028), (.10,.19,.055), shoes, .015)


def clear_of_furniture(x, y, manifest, margin):
    cz = -y
    for c in manifest['collision']:
        if abs(x - c['x']) < c['hx'] + margin and abs(cz - c['z']) < c['hz'] + margin:
            return c
    return None


def place_clear(x, y, manifest, bounds, margin=.55):
    """Nudges a candidate spot out of whichever furniture block it lands in,
    pushed along the axis of least overlap, then clamped inside the walls."""
    cz = -y
    for _ in range(24):
        hit = clear_of_furniture(x, -cz, manifest, margin)
        if not hit:
            break
        dx, dz = x - hit['x'], cz - hit['z']
        if dx == 0 and dz == 0: dx = .01
        if abs(dx) > abs(dz):
            x += (hit['hx'] + margin - abs(dx) + .1) * (1 if dx >= 0 else -1)
        else:
            cz += (hit['hz'] + margin - abs(dz) + .1) * (1 if dz >= 0 else -1)
    pad = .6
    x = max(bounds['minX'] + pad, min(bounds['maxX'] - pad, x))
    cz = max(bounds['minZ'] + pad, min(bounds['maxZ'] - pad, cz))
    return x, -cz


def populate_npcs(room, manifest):
    room2d = NPC_DATA[room]
    bounds = manifest['bounds']
    room3d_w = bounds['maxX'] - bounds['minX']
    room3d_d = bounds['maxZ'] - bounds['minZ']
    for idx, npc in enumerate(room2d['npcs']):
        fx = (npc['x'] + .5) / room2d['w']
        fy = (npc['y'] + .5) / room2d['h']
        x = (fx - .5) * room3d_w * .82
        y = -(fy - .5) * room3d_d * .82
        x, y = place_clear(x, y, manifest, bounds)
        villager(idx, x, y)
        label = npc['pages'][0].split(' — ')[0].split(', ')[0][:30]
        entry = dict(id=f'npc-{idx}', label=label, kind='Talk', position=[x, 0, -y], radius=1.7, pages=npc['pages'])
        if npc.get('href'):
            entry['links'] = [dict(label='Open link', href=npc['href'])]
        manifest['locations'].append(entry)


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

    @contextmanager
    def display_offset(dx,dy):
        """Move a whole exhibit, its solid footprint and its E target together."""
        previous=set(bpy.context.scene.objects)
        first_box=len(manifest['collision'])
        first_spot=len(manifest['locations'])
        yield
        for obj in set(bpy.context.scene.objects)-previous:
            obj.location.x+=dx
            obj.location.y+=dy
        for collider in manifest['collision'][first_box:]:
            collider['x']+=dx
            collider['z']-=dy
        for spot in manifest['locations'][first_spot:]:
            spot['position'][0]+=dx
            spot['position'][2]-=dy

    if room == 'education':
        box('Reading rug',(0,.8,.013),(4.4,4,.022),navy,.01)
        for x in [-2.03,2.03]:
            box('Woven gold border',(x,.8,.027),(.055,3.8,.01),brass)
        with display_offset(0,3):
            for x,school,campus in [(-4.9,'ROCHESTER','rochester'),(4.9,'BERKELEY','berkeley')]:
                y=4.32
                arch(school+' hardwood portal',x,y+.08,.04,2.12,2.92,oak,trim=False)
                box(school+' gateway handle',(x+.77,y-.04,1.20),(.09,.15,.32),brass,.025)
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
        with display_offset(-2.7,0.6):
            table(-3.65,.35,1.8,1.15)
            for dx,angle in [(-.26,-.12),(.26,.12)]:
                leaf=box('Open academic ledger',(-3.65+dx,.35,1.16),(.53,.73,.10),pages,.025)
                leaf.rotation_euler.y=angle
            station('ledger','Academic ledger',-3.65,-.8,'An open ledger records degrees, honors, and varsity seasons.','/about#about','Read academic record')

    elif room == 'experience':
        with display_offset(0,3):
            table(0,3.65,6.75,1.25,alloy)
            for x in [-2.15,0,2.15]:
                box('Screen stand',(x,3.83,1.35),(.12,.17,.6),alloy)
                screen(x,3.83,1.94,1.94,1.09)
                box('Key deck',(x,3.37,1.14),(1.12,.36,.08),navy,.035)
            sign('OPERATIONS   /   TELEMETRY',0,4.82,3.76,.33,cream)
            station('console','Telemetry desk',0,2.5,'The operators track builds, localization tests, and board bring-up here.','/about#experience','Open career record')
        with display_offset(-2.4,0):
            x,y=-3.7,.55
            for angle in [0,2.094,4.189]:
                tube('Tripod leg',[(x+.67*math.cos(angle),y+.67*math.sin(angle),.03),(x,y,1.55)],[.065,.042],alloy)
            tube('LiDAR scanner',[(x,y,1.45),(x,y,1.62),(x,y,1.91)],[.24,.35,.29],brass,32)
            tube('Optical band',[(x,y,1.68),(x,y,1.83)],[.34,.32],glass,32)
            block(x,y,1.35,1.35,1.92)
            station('lidar','LiDAR tripod',x,y-1.15,'This scanner is the racecar’s measuring tape. Its point clouds help the car locate itself on track.','https://roar.berkeley.edu/','Visit ROAR')
        with display_offset(2.5,0):
            table(3.65,.65,2.1,1.55)
            for i in range(5):
                for j in range(3):
                    box('Photovoltaic cell',(2.89+i*.38,.22+j*.43,1.16),(.35,.4,.055),glass,.015)
            station('array','CalSol test array',3.65,-.65,'A spare photovoltaic array from the solar vehicle electronics bench.','https://calsol.berkeley.edu/','Visit CalSol')

    else:
        with display_offset(0,3.5):
            table(0,4.45,6,1.3)
            screen(0,4.67,2.02,2.7,1.25)
            for x in [-2.14,2.14]:
                box('Instrument cabinet',(x,4.53,1.69),(1.1,.79,1.15),alloy,.06)
                for i in range(4):
                    box('Instrument drawer',(x,4.12,1.30+i*.24),(.96,.05,.16),navy,.02)
                    box('Signal lamp',(x-.34,4.085,1.30+i*.24),(.09,.02,.04),mint)
            sign('LOGAN LABS    /    BUILD BAY',0,5.80,3.85,.42,navy)
        with display_offset(-2.5,0):
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
        with display_offset(2.8,0):
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

    collection={'education':school_house,'experience':mission_control,'projects':makerspace}[room]
    collection(block,station,sign)

    # Every resume entry becomes a villager, same as the pixel city: talk to
    # them and they tell their own story, positioned from the original room's
    # layout and rescaled to this room's footprint.
    populate_npcs(room, manifest)
