"""Fitted porch joinery, mission-control sunshades and a fabrication-shop roof monitor."""
import math
from landmark_masonry import Detail, palette

def storefronts(landmarks):
    g=Detail()
    stone,iv,shadow,brick,bronze,glass,copper,slate,brass,opal,granite,marble,oak,iron,navy,gold=palette(g)
    burgundy=g.material('Oxblood enamel',(.34,.045,.045),.56)
    green=g.material('Bottle green timber',(.042,.14,.10))
    teal=g.material('Workshop petrol enamel',(.024,.22,.24),.49,.27)
    zinc=g.material('Brushed zinc',(.42,.49,.49),.41,.66)
    cyan=g.material('Signal turquoise',(.043,.64,.60),.39)
    def site(which):
        m=next(i for i in landmarks if i['id']==which)
        x,y,_=m['center']; hw,hd,_=m['half']
        return x,y,y-hd,hw,hd,m['door'][0]
    def lantern(x,y,z):
        g.rod(iron,(x,y+.34,z+.41),(x,y,z+.55),.048)
        g.block(iron,(x,y,z+.27),(.40,.35,.075));g.block(opal,(x,y,z),(.29,.24,.46))
        for s in (-1,1):g.rod(bronze,(x+s*.145,y-.12,z-.24),(x+s*.145,y-.12,z+.24),.023)
        g.block(iron,(x,y,z-.27),(.35,.32,.065))
    x,y,f,hw,hd,door=site('education')
    # Paired chimney pots and a cut-stone cap change the Georgian silhouette.
    for sign in (-1,1):
        cx=x+sign*4.9;cy=y+3.3
        g.block(brick,(cx,cy,11.52),(.88,1.17,3.2))
        g.block(shadow,(cx,cy,13.11),(1.03,1.32,.20))
        for sy in (-.29,.29):g.turn(burgundy,(cx,cy+sy,13.2),[(.20,0),(.19,.36),(.23,.4),(.23,.47),(.14,.47)],18)
    for dx in (-4.5,4.5):
        for z in (4.45,7.64):
            for side in (-1,1):
                xx=x+dx+side*1.23
                g.block(green,(xx,f+.77,z),(.40,.12,1.94))
                for j in range(9):g.block(green,(xx,f+.69,z-.80+j*.20),(.32,.08,.079))
            g.block(stone,(x+dx,f+.68,z-1.00),(2.05,.38,.15))
    for i in range(36):g.block(iv,(x-hw+.24+i*(2*hw-.48)/35,f-.22,9.33),(.15,.22,.16))
    for s in (-1,1):
        xx=x+s*5.79
        g.rod(brass,(xx-.50,f+.09,8.77),(xx+.50,f+.09,8.77),.047)
        vs=[(xx+dx,f+.04,8.72+dz) for dx,dz in [(-.39,0),(.39,0),(.39,-1.68),(0,-1.99),(-.39,-1.68)]]
        g.surface(burgundy,vs,[(4,3,2,1,0)])
        g.lettering(opal,'Λ',(xx,f+.015,7.61),.62)
    for s in (-1,1):lantern(door+s*1.34,f+.38,4.86)
    # The exposed east wall faces the square. Fit actual openings and deep sills.
    for yy in (y-2.7,y+1.1,y+4.5):
        for z in (4.62,7.68):
            xx=x+hw
            g.block(iv,(xx+.045,yy,z),(.19,1.68,2.06));g.block(glass,(xx+.152,yy,z),(.054,1.44,1.84))
            g.block(iv,(xx+.19,yy,z),(.04,.06,1.82));g.block(iv,(xx+.19,yy,z),(.04,1.44,.062))
            g.block(stone,(xx+.13,yy,z-1.04),(.41,1.9,.13))

    x,y,f,hw,hd,door=site('experience')
    # Two horizontal brise-soleils sit above and below the telemetry ribbon.
    for z,depth in [(8.58,.82),(6.44,.54)]:
        g.block(iron,(x,f-depth/2,z),(2*hw+.36,depth,.13))
        g.block(zinc,(x,f-depth,z+.008),(2*hw+.46,.11,.105))
        for j in range(17):
            xx=x+(j-8)*.87
            g.rod(bronze,(xx,f-.06,z-.26),(xx,f-depth+.07,z-.06),.045)
    for s in (-1,1):
        xx=x+s*(hw-.33)
        for off in (-.14,.14):
            g.block(zinc,(xx+off,f-.24,5.83),(.082,.30,6.2))
        g.block(cyan,(xx,f-.38,5.7),(.046,.03,5.8))
    # Folded standing fins cast a strong rhythm on the previously blank east wall.
    for j in range(16):
        yy=y-hd+.50+j*(2*hd-1)/15
        g.block(zinc,(x+hw+.13,yy,6.36),(.43,.075,5.06),.22)
    for yy in [y-3.4,y,y+3.4]:
        g.block(navy,(x-hw-.13,yy,8.1),(.12,2.8,1.11))
        for j in range(6):g.block(zinc,(x-hw-.23,yy,7.68+j*.16),(.24,2.82,.052))
    for s in (-1,1):
        xx=door+s*1.62
        g.rod(zinc,(xx,f-.08,6.37),(xx,f-1.26,5.76),.038)
    # Town-facing service emblem and backlit canopy edge.
    g.block(cyan,(door,f-1.43,5.60),(3.83,.033,.045))
    g.lettering(opal,'O P E R A T I O N S',(door,f-1.432,5.72),.14)

    x,y,f,hw,hd,door=site('projects')
    # A sawtooth north-light monitor and a steel-and-glass marquee distinguish the shop at a distance.
    for j in range(3):
        xx=x+(j-1)*4.15;lo=xx-2.0;hi=xx+2.0;front=y-2.9;back=y+1.4
        vs=[(u,v,z) for v in (front,back) for u,z in [(lo,8.46),(hi,8.46),(lo,10.26)]]
        g.surface(teal,vs,[(0,1,2),(5,4,3),(0,3,4,1),(1,4,5,2),(2,5,3,0)])
        g.surface(glass,[(lo+.11,front-.035,8.53),(hi-.30,front-.035,8.53),(lo+.11,front-.035,10.10)],[(0,1,2)])
        for k in range(1,5):
            t=k/5;u=lo+4*t
            g.rod(zinc,(u,front-.067,8.51),(u,front-.067,10.21-t*1.77),.036)
        g.rod(zinc,(lo,front-.06,10.29),(hi,front-.06,8.48),.067)
    for side in (-1,1):
        cx=x+side*6
        roof=[(cx+off,f+dy,z) for off,dy,z in [(-3.65,-.08,6.79),(3.65,-.08,6.79),(3.65,-1.33,6.46),(-3.65,-1.33,6.46)]]
        g.surface(teal,roof,[(3,2,1,0),(0,1,2,3)])
        g.block(gold,(cx,f-1.33,6.44),(7.4,.13,.12))
        for j in range(8):
            xx=cx+(j-3.5)*.99
            g.rod(zinc,(xx,f-.12,6.8),(xx,f-1.34,6.48),.043)
        for j in (-2.95,2.95):
            g.rod(iron,(cx+j,f-.12,6.1),(cx+j,f-1.22,6.45),.053)
        g.block(teal,(cx,f-.23,3.31),(6.92,.19,.62))
        for j in range(31):g.block(zinc,(cx+(j-15)*.215,f-.35,3.31),(.032,.045,.54))
    for xx in [door-1.89,door+1.89]:
        g.block(teal,(xx,f-.24,4.44),(.27,.34,3.82))
        for j in range(8):g.block(gold,(xx,f-.42,2.78+j*.19),(.28,.04,.074))
    for i,words in enumerate(['ADDITIVE','ASSEMBLY']):
        cx=x+(-6 if i==0 else 6);g.block(navy,(cx,f-1.39,6.42),(2.25,.09,.44))
        g.lettering(opal,words,(cx,f-1.448,6.31),.235)
    # Every operable street entrance has an opaque leaf, a jamb and actual hardware.
    for key,leaf,frame in [('education',oak,iv),('experience',navy,zinc),('projects',teal,iron)]:
        _,_,front,_,_,cx=site(key)
        face=front+(.61 if key=='education' else -.50)
        width=2.0 if key!='projects' else 3.30
        for side in (-1,1):
            g.block(frame,(cx+side*(width/2+.085),face,3.94),(.17,.21,2.88))
        g.block(frame,(cx,face,5.47),(width+.34,.21,.18))
        g.block(leaf,(cx,face-.09,3.94),(width,.20,2.87))
        if key=='education':
            for side in (-1,1):
                for k,h in [(3.27,.79),(4.61,.99)]:
                    g.block(oak,(cx+side*.43,face-.206,k),(.65,.09,h))
            g.block(brass,(cx+.73,face-.258,3.69),(.12,.06,.31))
        elif key=='experience':
            g.block(zinc,(cx,face-.206,2.74),(width-.15,.04,.28))
            g.lettering(opal,'01',(cx-.57,face-.218,4.80),.34)
        else:
            for j in range(10):
                g.block(zinc,(cx-.89,face-.207,2.71+j*.259),(1.32,.033,.033))
            g.block(iron,(cx+.06,face-.212,3.94),(.043,.035,2.81))
        handle=cx+(.74 if key!='projects' else 1.1)
        g.rod(brass if key=='education' else zinc,(handle,face-.32,3.55),(handle,face-.32,3.97),.049)
        for z in (3.55,3.97):g.rod(bronze,(handle,face-.20,z),(handle,face-.33,z),.047)
    g.finish()
