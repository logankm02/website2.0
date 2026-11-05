"""Objects from Logan's pixel city, fitted to the three expanded rooms."""
import math
from world_core import box, curve, mesh, uvball, mat
from world_architecture import lathe


def school_house(block, station, sign):
    oak=mat('Walnut wood cabinetry',(.25,.115,.048))
    wool=mat('Moss herringbone upholstery',(.095,.24,.145))
    navy=mat('Varsity navy linen',(.022,.056,.14))
    gold=mat('Dandelion gold',(.89,.52,.065),.64)
    brass=mat('Trophy brass',(.77,.47,.135),.30,metal=.66)
    paper=mat('Ivory parchment',(.88,.79,.57))
    # Fabric hung on rods, with a V-cut hem and an actual fold in the face.
    for x,word,small in [(-2.65,'R','ROCHESTER'),(2.65,'Cal','BERKELEY')]:
        vs=[];faces=[]
        for i in range(15):
            t=i/14;xx=x+(t-.5)*1.42
            yy=7.79-.06*math.cos(t*4*math.pi)
            vs.extend([(xx,yy,4.00),(xx,yy,2.14+.40*abs(2*t-1))])
            if i:faces.append((2*i-2,2*i-1,2*i+1,2*i))
        mesh(small+' wool banner',vs,faces,navy)
        curve('Polished banner rail',[(x-.85,7.81,4.03),(x+.85,7.81,4.03)],.043,brass)
        sign(word,x,7.70,3.04,.65,gold)
        sign(small,x,7.69,2.70,.13,paper)

    # Reading nook to the right of the entrance lane.
    x,y=5.55,2.8
    box('Settee walnut base',(x,y,.36),(3.7,1.40,.36),oak,.10)
    box('Tufted back',(x,y+.54,.99),(3.7,.35,1.11),wool,.16)
    for s in (-1,1):
        box('Rolled arm',(x+s*1.72,y,.77),(.37,1.38,.65),wool,.16)
        box('Stitched cushion',(x+s*.79,y-.10,.64),(1.48,.96,.28),wool,.12)
        for k in (-1,1):
            uvball('Tuft button',(x+s*.78+k*.29,y+.351,1.11),(.047,.031,.047),oak,12,8)
    block(x,y,3.75,1.44,1.55)
    lx,ly=7.9,3.4
    lathe('Brass reading standard',(lx,ly,0),[(.38,0),(.39,.08),(.20,.15),(.053,.26),(.052,1.77),(.15,1.83)],brass,36)
    lathe('Pleated linen shade',(lx,ly,1.76),[(.49,0),(.49,.055),(.30,.60),(.30,.64)],paper,36)
    block(lx,ly,.76,.76,2.40)

    x,y=-6.67,4.8
    box('Honours cabinet',(x,y,.72),(3.05,1.0,1.4),oak,.065)
    box('Honours cabinet top',(x,y,1.44),(3.21,1.12,.12),paper,.035)
    for s in (-1,1):
        box('Fielded cabinet panel',(x+s*.71,y-.51,.7),(1.22,.06,.99),oak,.04)
        box('Brass knob',(x+s*.15,y-.575,.85),(.07,.08,.07),brass,.025)
    cx=x-.62
    lathe('Varsity cup',(cx,y,1.50),[(.30,0),(.30,.09),(.16,.17),(.088,.37),(.22,.42),(.37,.70),(.38,.77),(.34,.77),(.29,.61)],brass,48)
    for side in (-1,1):
        curve('Cup handle',[(cx+side*a,y,1.50+z) for a,z in [(.30,.72),(.49,.81),(.55,.73),(.52,.57),(.37,.49),(.25,.48)]],.034,brass)
    bx=x+.73
    uvball('Varsity match ball',(bx,y,1.85),(.35,.35,.35),paper,32,20)
    for angle in range(6):
        phi=angle*math.tau/6
        patch=uvball('Ball stitched panel',(bx+.337*math.sin(phi),y-.337*math.cos(phi),1.85),(.092,.018,.094),navy,10,6)
        patch.rotation_euler.z=phi
    sign('VARSITY   /   HONOURS',x,y-.552,1.04,.145,paper)
    block(x,y,3.21,1.12,2.35)
    station('honours','Varsity cabinet',x,y-1.22,'A worn match ball shares the shelf with Rochester honours. It still gets juggled between problem sets.','/about#education','Academic record')


def mission_control(block,station,sign):
    graphite=mat('Instrument graphite',(.044,.064,.083),.54)
    alloy=mat('Rack brushed aluminum',(.33,.40,.42),.48,metal=.45)
    dark=mat('Plotter smoked glass',(.013,.047,.067),.30)
    cyan=mat('Phosphor turquoise',(.12,.77,.66),.47)
    amber=mat('Status amber',(.92,.46,.058),.52)
    white=mat('Equipment ivory',(.71,.76,.68),.6)
    red=mat('Charger red enamel',(.67,.049,.039),.42)
    # A continuous wall plot behind the communications desk.
    box('Operations plotter',(0,7.73,2.87),(6.9,.24,1.54),graphite,.09)
    box('Plotter glass',(0,7.58,2.87),(6.64,.065,1.32),dark,.025)
    sign('TRACK   04',-2.61,7.52,3.23,.17,white)
    for j in range(3):
        yy=7.52-j*.008
        pts=[(-3.03+i*.096,yy,2.48+j*.17+.084*math.sin(i*.28+j)+.075*math.sin(i*.65)) for i in range(64)]
        curve('Signal history',pts,.016,amber if j==1 else cyan)
    for x in (-4.76,4.76):
        y=6.68
        box('Equipment rack',(x,y,1.43),(1.36,1.18,2.86),graphite,.09)
        for s in (-1,1):box('Rack side rail',(x+s*.61,y-.603,1.44),(.055,.07,2.71),alloy)
        for j in range(8):
            zz=.34+j*.314
            box('Pull out blade',(x,y-.61,zz),(1.13,.07,.252),dark,.018)
            for k in range(4):box('Vent slots',(x-.34+k*.14,y-.666,zz),(.078,.035,.042),alloy)
            for k in range(2):box('Blade status light',(x+.31+k*.12,y-.67,zz),(.07,.033,.055),amber if (j+k)%4==0 else cyan)
        block(x,y,1.38,1.2,2.87)
    x,y=-6.8,4.27
    lathe('Charge station foot',(x,y,0),[(.53,0),(.53,.11),(.37,.16)],alloy,32)
    box('Charger shell',(x,y,1.31),(.93,.50,2.36),white,.16)
    box('Inset red charger well',(x,y-.265,1.58),(.61,.102,1.39),red,.13)
    box('Charge status',(x,y-.324,1.79),(.36,.065,.39),dark,.04)
    curve('Coiled charging lead',[(x+.31,y-.28,1.68),(x+.58,y-.32,1.41),(x+.62,y-.33,.52),(x+.49,y-.34,.34),(x+.28,y-.34,.39),(x+.24,y-.34,.84)],.045,graphite)
    block(x,y,1.34,.72,2.53)
    station('charger','QA charging station',x,y-.99,'The pixel city’s miniature charger has a cable just long enough for one parking spot.','/about#experience','Career record')

    x,y=6.70,7.66
    verts=[(x,y-.08,4.02),(x+.82,y,3.36),(x,y-.12,2.23),(x-.82,y,3.36),(x,y-.17,3.38)]
    mesh('KITE launch day kite',verts,[(0,4,1),(1,4,2),(2,4,3),(3,4,0)],[cyan,amber],[0,1,0,1])
    curve('Kite string',[(x,y-.13,2.25),(x+.19,y-.14,1.98),(x-.03,y-.16,1.68),(x+.18,y-.15,1.40)],.018,white)
    for u,z in [(.12,2.01),(.0,1.72),(.13,1.47)]:
        mesh('Ribbon bow',[(x+u+dx,y-.19,z+dz) for dx,dz in [(-.15,.09),(-.15,-.09),(0,0),(.15,.09),(.15,-.09)]],[(0,1,2),(2,4,3)],amber)
    station('launch-kite','KITE launch kite',x,6.49,'A little kite from the launch party. Its tail is made of rejected email subject lines.','/about#experience','Career record')


def makerspace(block,station,sign):
    teal=mat('Workshop teal enamel',(.034,.23,.24),.57)
    metal=mat('Tooling steel',(.35,.42,.42),.39,metal=.62)
    dark=mat('Cell glass midnight',(.018,.06,.12),.25,metal=.31)
    blue=mat('Cobalt solar cells',(.046,.13,.27),.27,metal=.37)
    gold=mat('Workshop ochre',(.94,.53,.08),.51)
    pale=mat('Ivory composite',(.80,.84,.74),.45)
    rubber=mat('Tread rubber',(.027,.033,.038),.89)
    oak=mat('Oiled bench wood',(.45,.24,.103),.76)
    # Gen XI study with a curved fairing, laid-out cells and a dark bubble canopy.
    x,y=6.70,4.81
    box('Solar test mat',(x,y,.028),(5.8,2.67,.056),teal,.024)
    for side in (-1,1):
        for axle in (-1.36,1.36):
            uvball('Fairing wheel',(x+axle,y+side*.78,.40),(.36,.16,.36),rubber,24,14)
    uvball('Solar composite hull',(x,y,.62),(2.49,1.01,.35),pale,40,20)
    box('Composite solar deck',(x,y,.82),(4.47,1.77,.12),pale,.055)
    for i in range(11):
        for j in range(5):
            xx=x+(i-5)*.372;yy=y+(j-2)*.29
            if ((xx-x-.53)/.84)**2+((yy-y+.06)/.54)**2<1:continue
            box('Photovoltaic wafer',(xx,yy,.895),(.349,.271,.028),blue if (i+j)%5 else dark,.012)
    uvball('Driver canopy',(x+.53,y-.06,.91),(.79,.47,.49),dark,32,18)
    sign('GEN XI',x-.75,y-.911,.60,.20,teal)
    block(x,y,5.0,2.06,1.43)
    station('solar-racer','CalSol solar racer',x,y-1.65,'The solar cells cover the deck around the driver. This is the companion to the open-wheel ROAR car across the lab.','https://calsol.berkeley.edu/','CalSol')

    x,y=-6.61,6.43
    box('Fabrication cabinet',(x,y,.69),(4.76,1.34,1.38),teal,.06)
    box('Maple work surface',(x,y,1.42),(4.90,1.48,.15),oak,.048)
    for j in range(3):
        box('Tool drawer',(x+1.38,y-.70,.37+.35*j),(1.47,.075,.27),teal,.025)
        box('Drawer handle',(x+1.38,y-.76,.40+.35*j),(.78,.08,.044),metal)
    px=x-.96
    box('Printer heated bed',(px,y,1.62),(1.78,1.03,.18),rubber,.055)
    for sx in (-.79,.79):
        for sy in (-.42,.42):
            box('Extrusion post',(px+sx,y+sy,2.22),(.10,.10,1.28),metal)
        box('Printer top side',(px+sx,y,2.87),(.12,.94,.12),teal)
    for sy in (-.42,.42):
        box('Printer top crossbar',(px,y+sy,2.87),(1.7,.12,.12),teal)
    curve('Printer carriage rail',[(px-.77,y,2.49),(px+.77,y,2.49)],.043,metal)
    box('Print head',(px+.13,y,2.39),(.28,.26,.26),rubber,.025)
    lathe('Part on print bed',(px+.13,y,1.72),[(.24,0),(.27,.08),(.19,.23),(.16,.43),(.21,.48)],gold,30)
    for j,col in enumerate([gold,teal,blue]):
        lathe('Filament spool',(x+.55+j*.49,y,1.50),[(.24,0),(.24,.047),(.19,.05),(.19,.22+.04*j),(.24,.23+.04*j),(.24,.27+.04*j)],col,28)
    block(x,y,4.90,1.49,2.96)
    station('print-bench','Fabrication bench',x,y-1.38,'Three spools, a warm print bed, and a half-finished part. The tool drawer holds crimpers, flux, zip ties, and one mystery bolt.','/about#projects','Project roster')

    x,y=-9.9,-1.75
    box('Field recording plinth',(x,y,.48),(1.51,1.13,.96),oak,.055)
    curve('Perch branch',[(x-.44,y,.96),(x-.18,y,1.41),(x+.26,y,1.66),(x+.59,y+.10,1.79)],.075,oak)
    bird=uvball('Tui plumage',(x+.12,y,1.97),(.27,.18,.37),teal)
    bird.rotation_euler.y=-.23
    uvball('Tui head',(x+.24,y-.02,2.23),(.18,.155,.185),rubber)
    for off in (-.06,.06):uvball('White throat tuft',(x+.29+off,y-.135,2.09),(.059,.058,.079),pale,16,10)
    mesh('Short curved bill',[(x+.36,y-.08,2.25),(x+.37,y+.04,2.25),(x+.55,y-.04,2.20),(x+.36,y-.02,2.18)],[(0,2,1),(0,3,2),(1,2,3)],rubber)
    curve('Field mic stand',[(x-.56,y-.31,.96),(x-.56,y-.31,1.78),(x-.35,y-.25,1.94)],.029,metal)
    uvball('Microphone windscreen',(x-.35,y-.25,1.94),(.12,.082,.091),rubber)
    block(x,y,1.51,1.13,2.45)
    station('field-mic','TūīNet listening post',x,y-.99,'A tūī watches the field microphone from its perch, just like the one in the pixel lab.','/about#projects','Project roster')
