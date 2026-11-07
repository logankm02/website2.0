"""Original autonomous open-wheel exhibit, with shaped bodywork and exposed running gear."""
import bpy,math
from world_core import mesh,shade,uvball,curve,mat
from world_architecture import lathe
from crafted_props import rounded,label,loop,palette

def racer(x,y):
    m=palette();red=mat('Racer vermilion enamel',(.64,.065,.027),.24,metal=.25)
    ivory=mat('Racer ivory composite',(.86,.85,.71),.31)
    rubber=mat('Racer soft slick rubber',(.018,.022,.028),.83)
    carbon=mat('Racer carbon weave',(.028,.038,.047),.42,noise_scale=100,bump=.003)
    def P(a,b,c):return (x+a,y+b,c)
    def shell(name,sections,material):
        vs=[];fs=[]
        for yy,w,h,z in sections:
            for i in range(20):
                a=math.tau*i/20;vs.append(P(w*math.cos(a),yy,z+h*math.sin(a)))
        for j in range(len(sections)-1):
            for i in range(20):a=j*20+i;b=j*20+(i+1)%20;fs.append((a,b,b+20,a+20))
        fs.extend([tuple(reversed(range(20))),tuple(range(len(vs)-20,len(vs)))])
        o=shade(mesh(name,vs,fs,material));sub=o.modifiers.new('Sculpted composite shell','SUBSURF');sub.levels=2
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=sub.name)
        return o
    shell('Racer monocoque',[(-1.82,.095,.055,.55),(-1.73,.14,.08,.55),(-.9,.25,.15,.62),(-.35,.38,.23,.66),(.46,.40,.26,.69),(1.25,.23,.17,.64),(1.54,.16,.09,.56),(1.58,.1,.06,.55)],red)
    # Swept side pods and low carbon floor leave the suspension visible.
    rounded('Racer carbon undertray',P(0,.19,.34),(1.45,2.54,.10),carbon,.045)
    for s in [-1,1]:
        pod=shell('Racer side pod',[(-.46,.14,.10,.49),(-.35,.23,.18,.54),(.70,.24,.17,.52),(1.10,.15,.10,.46)],ivory)
        pod.location.x+=s*.55
        rounded('Racer side intake',P(s*.54,-.42,.54),(.33,.035,.17),carbon,.055)
        for k in range(7):
            curve('Racer cooling louvre',[P(s*(.46+k*.037),.45,.694),P(s*(.48+k*.037),.93,.61)],.009,carbon)
        for axle in [-1.13,1.18]:
            wheel=lathe('Racer profiled tire',(0,0,0),[(.24,-.17),(.32,-.18),(.39,-.12),(.40,-.07),(.40,.07),(.39,.12),(.32,.18),(.24,.17)],rubber,48)
            wheel.rotation_euler.y=math.pi/2;wheel.location=P(s*.91,axle,.61)
            hub=lathe('Racer recessed wheel rim',(0,0,0),[(.23,-.03),(.27,-.03),(.28,0),(.28,.03),(.24,.035),(.23,-.03)],m['dark'],40)
            hub.rotation_euler.y=math.pi/2;hub.location=P(s*1.095,axle,.61)
            for i in range(10):
                a=math.tau*i/10
                curve('Racer alloy spoke',[P(s*1.112,axle+.07*math.cos(a),.61+.07*math.sin(a)),P(s*1.112,axle+.25*math.cos(a+.12),.61+.25*math.sin(a+.12))],.018,m['metal'])
            uvball('Racer locking hub',P(s*1.13,axle,.61),(.025,.068,.068),m['brass'],16,10)
            for stripe in [-.12,.12]:
                curve('Racer tire mould seam',[P(s*.91+stripe,axle+.398*math.cos(i*math.tau/49),.61+.398*math.sin(i*math.tau/49)) for i in range(50)],.004,m['dark'])
            # Paired wishbones and a polished pushrod, all attached to the upright.
            for z in [.43,.68]:
                for off in [-.29,.29]:curve('Racer double wishbone',[P(s*.31,axle+off,z),P(s*.87,axle,.60)],.025,carbon)
            curve('Racer pushrod',[P(s*.48,axle+.13,.81),P(s*.85,axle,.62)],.018,m['metal'])
            for i in range(13):
                a=i*math.tau/2
                if i:curve('Racer coil spring',[P(s*(.38+.028*math.cos(a)),axle+.03+.012*(i-1),.67+.028*math.sin(a)),P(s*(.38+.028*math.cos(a+math.pi)),axle+.03+.012*i,.67+.028*math.sin(a+math.pi))],.009,m['brass'])
    # Recessed cockpit, padded headrest and a shaped rollover hoop.
    vs=[];fs=[]
    for rx,ry,z in [(.28,.47,.92),(.245,.43,.93),(.20,.34,.77)]:
        vs += [P(rx*math.cos(i*math.tau/40),.18+ry*math.sin(i*math.tau/40),z) for i in range(40)]
    for ring in range(2):
        for i in range(40):a=ring*40+i;b=ring*40+(i+1)%40;fs.append((a,b,b+40,a+40))
    fs.append(tuple(range(80,120)))
    shade(mesh('Racer cockpit tub',vs,fs,carbon))
    rounded('Racer seat pad',P(0,.17,.80),(.30,.44,.08),m['dark'],.035)
    rounded('Racer seat back',P(0,.44,.95),(.34,.18,.34),m['dark'],.07)
    curve('Racer rollover hoop',[P(-.24,.56,.89),P(-.23,.57,1.18),P(-.13,.58,1.27),P(.13,.58,1.27),P(.23,.57,1.18),P(.24,.56,.89)],.038,ivory)
    for s in [-1,1]:curve('Racer harness',[P(s*.10,.35,1.04),P(s*.09,.03,.94),P(s*.07,-.16,.93)],.025,red)
    curve('Racer steering rim',[P(.13*math.cos(a),-.17,.99+.08*math.sin(a)) for a in [i*math.tau/32 for i in range(33)]],.018,m['dark'])
    # Curved, three-element wings rather than slabs.
    for wy,w,z,material in [(-1.80,2.15,.43,ivory),(1.66,1.94,1.13,red)]:
        for k in range(3):
            vs=[];fs=[]
            for side in [-1,1]:
                for j in range(17):
                    t=j/16;vs.append(P(side*w/2,wy+(t-.5)*.22+k*.12,z+.035*math.sin(math.pi*t)+k*.035))
            for j in range(16):fs.append((j,j+1,j+18,j+17))
            o=shade(mesh('Racer multi element aerofoil',vs,fs,material))
            solid=o.modifiers.new('Composite skin','SOLIDIFY');solid.thickness=.017;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=solid.name)
        for side in [-1,1]:rounded('Racer wing endplate',P(side*w/2,wy+.10,z+.065),(.035,.57,.22),carbon,.025)
    for s in [-1,1]:
        rounded('Racer rear wing pylon',P(s*.39,1.51,.84),(.06,.18,.60),carbon,.02)
        curve('Racer nose stripe',[P(s*.07,-1.66,.61),P(s*.09,-1.13,.74),P(s*.13,-.69,.83)],.016,ivory)
    curve('Racer sensor mast',[P(0,.77,.82),P(0,.77,1.41)],.038,m['metal'])
    lathe('Racer machined LiDAR',P(0,.77,1.39),[(.14,0),(.15,.03),(.14,.13),(.16,.15),(.15,.19)],m['metal'],40)
    lathe('Racer LiDAR optical ring',P(0,.77,1.45),[(.145,0),(.145,.07)],m['cyan'],40)
    curve('Racer braided sensor cable',[P(.07,.78,1.44),P(.1,.81,1.14),P(.14,.91,.85),P(.21,1.1,.72)],.013,carbon)
    number=label('04',P(0,-1.18,.742),.22,m['ink'],True);number.rotation_euler.x=.13
    label('AUTONOMOUS / LOCALIZATION',P(0,-2.415,.07),.105,ivory)
