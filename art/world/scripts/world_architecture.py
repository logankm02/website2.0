"""Original village architecture: barrel-roof arcade, cottages, observatory."""
from world_core import *

def arch(name,x,y,z,width,height,material,trim=True):
    r=width/2; spring=height-r
    outline=[(-r,0),(-r,spring)]
    outline += [(r*math.cos(math.pi-i*math.pi/24),spring+r*math.sin(math.pi-i*math.pi/24)) for i in range(25)]
    outline += [(r,0)]
    ob=mesh(name,[(x+a,y,z+b) for a,b in outline],[tuple(reversed(range(len(outline))))],material)
    if trim:
        curve(name+' carved surround',[(x+a,y-.045,z+b) for a,b in outline],.10,M['cream'])
        box(name+' sill',(x,y-.12,z+.025),(width+.32,.38,.15),M['stoneLight'],.04)
    return ob

def roof_tiles(name,cx,cy,z,w,d,vault=False):
    vs=[]; fs=[]; ids=[]
    cols=int(w/.37); rows=int(d/.47)
    for row in range(rows):
        y=cy-d/2+row*d/rows
        for col in range(cols):
            x=cx-w/2+col*w/cols; tw=w/cols
            # Barrel tile profile, layered in overlapping rows.
            offset=len(vs)
            for end in range(2):
                yy=y+end*(d/rows+.08)
                for q in range(5):
                    xx=x+tw*q/4
                    h=math.sqrt(max(0,(w/2)**2-(xx-cx)**2))*.55 if vault else (w/2-abs(xx-cx))*.65
                    zz=z+h+.055*math.sin(q*math.pi/4)+.045*(1-end)
                    vs.append((xx,yy,zz))
            for q in range(4): fs.append((offset+q,offset+q+1,offset+q+6,offset+q+5)); ids.append(R.choices([0,1,2],[6,2,1])[0])
    shade(mesh(name,vs,fs,[M['roof'],M['roofLight'],M['roofDark']],ids))
    curve(name+' front edge',[(cx-w/2+i*w/48,cy-d/2-.02,z+(math.sqrt(max(0,(w/2)**2-(-w/2+i*w/48)**2))*.55 if vault else (w/2-abs(-w/2+i*w/48))*.65)) for i in range(49)],.12,M['roofDark'])

def window(x,y,z,w=1.1,h=1.7,shutters=True):
    arch('Arched window',x,y,z,w,h,M['glass'])
    box('Window mullion',(x,y-.09,z+h*.47),(.055,.08,h*.9),M['cream'])
    box('Window transom',(x,y-.1,z+h*.47),(w,.08,.06),M['cream'])
    if shutters:
        for s in [-1,1]:
            box('Painted shutter',(x+s*(w*.7),y-.05,z+h*.43),(w*.29,.12,h*.85),M['teal'],.03)
            for k in range(7): box('Shutter slat',(x+s*(w*.7),y-.14,z+.15+k*h*.1),(w*.24,.05,.06),M['woodLight'],.01)

def arcade():
    x,y,z=13,23,2.5; w,d=12,10; front=y-d/2
    box('Arcade plaster walls',(x,y,z+2.9),(w,d,5.8),M['plaster'],.16)
    box('Arcade foundation',(x,y,z+.22),(w+.35,d+.35,.44),M['stoneLight'],.08)
    box('Arcade cornice',(x,y,z+5.7),(w+.6,d+.65,.28),M['cream'],.06)
    # Solid vault facade and the curved tiled roof.
    pts=[(x-6.25,front-.13,z+5.8)]+[(x+6.25*math.cos(math.pi-i*math.pi/48),front-.13,z+5.8+3.44*math.sin(math.pi-i*math.pi/48)) for i in range(49)]
    mesh('Arcade vaulted pediment',pts,[tuple(range(len(pts)))],M['cream'])
    roof_tiles('Arcade individual terracotta tiles',x,y,z+5.85,12.6,10.9,True)
    arch('Arcade rose window',x,front-.21,z+5.85,6.1,3.05,M['teal'])
    for a in range(0,181,30):
        t=math.radians(a)
        curve('Rose window brass spoke',[(x,front-.28,z+5.86),(x+2.88*math.cos(t),front-.28,z+5.86+2.88*math.sin(t))],.035,M['brass'])
    # Original compass emblem for the arcade, rather than a branded game logo.
    for a in range(4):
        t=a*math.pi/2+math.pi/4
        pts=[(x,front-.4,z+7.1),(x+math.cos(t)*.72,front-.4,z+7.1+math.sin(t)*.72),(x+math.cos(t+.65)*.20,front-.4,z+7.1+math.sin(t+.65)*.20)]
        mesh('Arcade compass emblem',pts,[(0,1,2)],M['brass'])
    for off in [-3.8,0,3.8]:
        arch('Arcade entry',x+off,front-.2,z+.2,2.3,3.5,M['wood'])
        arch('Arcade door glass',x+off,front-.23,z+.6,1.82,2.8,M['glass'],False)
        box('Door center rail',(x+off,front-.3,z+1.8),(.075,.09,2.7),M['brass'])
        box('Door crossbar',(x+off,front-.32,z+1.1),(1.9,.07,.08),M['brass'])
        for s in [-1,1]: uvball('Brass door handle',(x+off+s*.15,front-.4,z+1.45),(.055,.08,.055),M['brass'],12,8)
    text('Arcade lettering','T H E   A R C A D E',(x,front-.27,z+4.55),.58,M['teal'])
    for off in [-6,-2,2,6]:
        box('Porch column',(x+off,front-1.8,z+1.85),(.35,.35,3.7),M['cream'],.06)
        box('Porch column foot',(x+off,front-1.8,z+.24),(.60,.60,.48),M['stoneLight'],.05)
        box('Porch column capital',(x+off,front-1.8,z+3.65),(.57,.57,.24),M['cream'],.04)
    # Sloped porch roof with individual copper-colored strips.
    for i in range(37):
        xx=x-6.7+i*.37
        mesh('Porch tile strip',[(xx,front-2.25,z+3.83),(xx+.35,front-2.25,z+3.83),(xx+.35,front-.1,z+4.3),(xx,front-.1,z+4.3)],[(0,1,2,3)],M['roofLight'] if i%4==0 else M['roof'])
    for off in [-5.7,5.7]: lantern(x+off,front-2,z+3)
    # Flanking stone planters.
    for off in [-7.5,7.5]:
        box('Arcade planter',(x+off,front-1,z+.38),(1.5,2.2,.75),M['stoneLight'],.14)
    return {'id':'arcade','center':[x,y,z],'half':[6,5,5.8],'door':[x,front-3,z]}

def lantern(x,y,z):
    tube('Lamp stem',[(x,y,z-.3),(x,y,z+.2)],[.06,.06],M['wood'],8)
    box('Lantern light',(x,y,z),(.28,.28,.45),M['yellow'],.04)
    box('Lantern cap',(x,y,z+.28),(.45,.45,.14),M['wood'],.03)

def cottage(x,y,w=8,d=7,label='FIELD NOTES',tall=False):
    z=2.5; h=6.6 if tall else 5.2; front=y-d/2
    box(label+' plaster',(x,y,z+h/2),(w,d,h),M['cream'],.10)
    box(label+' stone footing',(x,y,z+.22),(w+.15,d+.15,.45),M['stoneLight'],.06)
    # Gable infill, with front and back faces.
    mesh(label+' gable',[(x-w/2,y-d/2,z+h),(x+w/2,y-d/2,z+h),(x,y-d/2,z+h+w*.325),(x-w/2,y+d/2,z+h),(x+w/2,y+d/2,z+h),(x,y+d/2,z+h+w*.325)],[(0,1,2),(3,5,4)],M['cream'])
    roof_tiles(label+' tiled roof',x,y,z+h,w+.85,d+.9)
    arch(label+' front door',x,front-.04,z+.1,1.6,2.6,M['teal'])
    for dx in [-w*.32,w*.32]: window(x+dx,front-.04,z+1.3,.95,1.65)
    if tall:
        for dx in [-w*.28,0,w*.28]: window(x+dx,front-.05,z+4.6,1,1.55)
    else: window(x,front-.05,z+4.1,.9,1.4,False)
    # Striped fabric awning with scalloped lower edge.
    for i in range(14):
        xx=x-2.15+i*.31; m=M['teal'] if i%2 else M['white']
        mesh('Striped canvas awning',[(xx,front-.12,z+3.1),(xx+.31,front-.12,z+3.1),(xx+.31,front-1.5,z+2.75),(xx,front-1.5,z+2.75)],[(0,1,2,3)],m)
        curve('Awning scallop',[(xx+j*.31/6,front-1.5,z+2.72-.09*math.sin(j*math.pi/6)) for j in range(7)],.045,m)
    box('Shop sign',(x,front-.12,z+3.65),(w*.8,.15,.55),M['wood'],.07)
    text('Shop lettering',label,(x,front-.215,z+3.49),.24,M['white'])
    box('Chimney',(x+w*.25,y+1,z+h+1),(1,1,2.4),M['plaster'],.07)
    box('Chimney cap',(x+w*.25,y+1,z+h+2.2),(1.25,1.25,.2),M['stoneLight'],.04)
    return {'id':label.lower().replace(' ','-'),'center':[x,y,z],'half':[w/2,d/2,h],'door':[x,front-2,z]}

def lathe(name,center,profile,material,n=64):
    x,y,z=center; vs=[]; fs=[]
    for r,h in profile:
        vs += [(x+r*math.cos(i*TAU/n),y+r*math.sin(i*TAU/n),z+h) for i in range(n)]
    for j in range(len(profile)-1):
        for i in range(n): a=j*n+i; b=j*n+(i+1)%n; fs.append((a,b,b+n,a+n))
    return shade(mesh(name,vs,fs,material))

def fountain():
    p=(-2,12,2.5)
    lathe('Fountain carved basin',p,[(0,0),(3.1,0),(3.2,.2),(3,.45),(3,.9),(2.8,1.05),(2.6,.9),(2.6,.3),(.2,.3)],M['stoneLight'])
    lathe('Fountain water',p,[(0,.65),(2.65,.65)],M['water'])
    lathe('Fountain pedestal',p,[(.65,.3),(.65,.65),(.3,1),(.24,2.1),(.55,2.2),(1.35,2.4),(1.4,2.6),(1.2,2.75),(.2,2.55),(.2,3.3),(0,3.6)],M['cream'])
    for i in range(12):
        a=i*TAU/12
        curve('Fountain water ribbon',[(p[0]+(1.2+j*.06)*math.cos(a),p[1]+(1.2+j*.06)*math.sin(a),p[2]+2.6-1.9*(j/12)**1.4) for j in range(13)],.028,M['water'])
    return p

def tower():
    x,y,z=-1,42,2.5
    box('Observatory tower',(x,y,z+6),(4.8,5.1,12),M['plaster'],.18)
    for h in [1,8,11.6]: box('Tower string course',(x,y,z+h),(5.15,5.45,.28),M['cream'],.06)
    for dx in [-1.3,1.3]: window(x+dx,y-2.57,z+8.7,1.05,2.1,False)
    lathe('Observatory copper dome',(x,y,z+12),[(3,0),(3,.3),(2.7,.6),(2.5,1.4),(1.8,2.4),(.8,3.1),(0,3.4)],M['roof'])
    tube('Weather vane',[(x,y,z+15.2),(x,y,z+17)],[.05,.035],M['brass'],8)
    curve('Weather vane cross',[(x-.7,y,z+16.5),(x+.7,y,z+16.5)],.04,M['brass'])

def plaza():
    # Irregular paving with intentional gaps, not a flat platform.
    vs=[]; fs=[]; ids=[]
    for iy in range(28):
        yy=4+iy*.85
        for ix in range(46):
            xx=-20+ix*.88+(iy%2)*.44
            if ((xx+1)/21)**2+((yy-18)/15.5)**2>1: continue
            i=len(vs); z=2.52+R.uniform(0,.018)
            vs.extend([(xx,yy,z),(xx+.83,yy,z),(xx+.83,yy+.8,z),(xx,yy+.8,z)])
            fs.append((i,i+1,i+2,i+3)); ids.append(R.randrange(3))
    mesh('Village limestone paving',vs,fs,[M['stoneLight'],M['cream'],M['path']],ids)
    # Low garden walls in separate segments with capstones.
    for side in [-1,1]:
        for i in range(12):
            x=side*(8+i*.95); y=4
            z=height(x,y)
            for row in range(2): box('Garden masonry',(x+(row%2)*.1,y,z+.18+row*.32),(.9,.65,.30),M['stoneLight'] if (i+row)%3 else M['stone'],.04)
            box('Garden wall cap',(x,y,z+.72),(1,.8,.16),M['cream'],.035)
    for x in [-10,7,24]:
        y=10; z=height(x,y)
        tube('Village lamp post',[(x,y,z),(x,y,z+3.4)],[.11,.07],M['wood'],10)
        lantern(x,y,z+3.5)
    for x,y in [(-10,11),(6,31)]:
        for dx in [-1.2,1.2]: box('Bench leg',(x+dx,y,2.9),(.12,.7,.8),M['wood'],.03)
        for k in range(4): box('Bench slat',(x,y-.35+k*.22,3.35),(3,.17,.10),M['woodLight'],.03)
        for k in range(3): box('Bench back slat',(x,y+.48,3.55+k*.2),(3,.10,.14),M['woodLight'],.03)
