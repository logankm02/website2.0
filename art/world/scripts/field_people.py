"""Original Logan City field club: shaped garments, painted eyes and weighted anatomy."""
import bpy, math
from mathutils import Vector
from world_core import mat,mesh,shade,uvball,curve,join
from crafted_props import rounded
T=math.tau

def material(name,rgb,rough=.72):return mat('Club '+name,rgb,rough)

def eye_paint():
    # An original, packed iris illustration. UVs follow the curved sclera.
    m=material('painted hazel eyes',(.95,.91,.83),.52);im=bpy.data.images.new('Club illustrated iris',128,96,alpha=False);pixels=[]
    for j in range(96):
        for i in range(128):
            u=(i+.5)/128;v=(j+.5)/96;dx=(u-.49)/.282;dz=(v-.51)/.57;r=math.hypot(dx,dz)
            c=(.97,.94,.86)
            if r<1:
                k=(1-v)**1.3;spoke=(.5+.5*math.cos(29*math.atan2(dz,dx)))*.065
                c=(.20+.43*k+spoke,.13+.36*k+spoke,.105+.10*k)
                if r>.89:c=(.12,.082,.087)
                if (dx/.44)**2+((dz-.05)/.64)**2<1:c=(.095,.067,.08)
                if ((u-.42)/.067)**2+((v-.74)/.107)**2<1 or ((u-.586)/.031)**2+((v-.34)/.053)**2<1:c=(1,.985,.92)
            pixels.extend((*c,1))
    im.pixels.foreach_set(pixels);im.pack();node=m.node_tree.nodes.new('ShaderNodeTexImage');node.image=im;uv=m.node_tree.nodes.new('ShaderNodeUVMap');uv.uv_map='UVMap';m.node_tree.links.new(uv.outputs['UV'],node.inputs['Vector'])
    bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');m.node_tree.links.new(node.outputs['Color'],bs.inputs['Base Color']);return m

class Person:
    def __init__(self):
        self.section='Body';self.parts={};self.p={k:material(k,c,r) for k,c,r in [
        ('warm skin',(.77,.44,.285),.8),('lip rose',(.35,.115,.095),.83),('hair espresso',(.061,.032,.037),.56),('hair glints',(.128,.062,.049),.55),('ink',(.031,.032,.047),.68),('field jacket',(.035,.255,.285),.82),('ivory linen',(.90,.833,.65),.87),('navy twill',(.064,.092,.145),.84),('storm teal',(.145,.38,.362),.79),('marigold',(.91,.41,.071),.65),('saddle leather',(.46,.177,.062),.55)]};self.p['eye']=eye_paint()
    def bind(self,o,bone,blend=None):
        groups={}
        for vert in o.data.vertices:
            weights=blend(vert.co) if blend else {bone:1}
            for b,w in weights.items():
                if w<=0:continue
                if b not in groups:groups[b]=o.vertex_groups.new(name=b)
                groups[b].add([vert.index],w,'REPLACE')
        self.parts.setdefault(self.section,[]).append(o);return o
    def ball(self,name,p,s,m,b,rot=0):
        o=uvball(name,p,s,self.p[m],24,14);o.rotation_euler.y=rot;return self.bind(o,b)
    def line(self,name,pts,r,m,b):return self.bind(curve(name,pts,r,self.p[m]),b)
    def box(self,name,p,d,m,b,r):return self.bind(rounded(name,p,d,self.p[m],r),b)
    def patch(self,name,pts,m,b):return self.bind(mesh(name,pts,[tuple(range(len(pts)))],self.p[m]),b)
    def loft(self,name,rings,m,b,blend=None,n=36):
        # z, centre x/y, elliptical cross-section x/y
        vs=[];fs=[]
        for z,x,y,w,d in rings:vs += [(x+w*math.cos(i*T/n),y+d*math.sin(i*T/n),z) for i in range(n)]
        for j in range(len(rings)-1):
            for i in range(n):a=j*n+i;c=j*n+(i+1)%n;fs.append((a,c,c+n,a+n))
        fs.extend([tuple(reversed(range(n))),tuple(range(len(vs)-n,len(vs)))])
        return self.bind(shade(mesh(name,vs,fs,self.p[m])),b,blend)
    def head(self):
        self.loft('Cheeks, jaw and temples',[(1.454,0,.038,.036,.047),(1.475,0,.027,.088,.083),(1.505,0,.018,.126,.113),(1.551,0,.012,.157,.134),(1.604,0,.007,.181,.150),(1.67,0,0,.189,.158),(1.735,0,-.007,.193,.162),(1.80,0,-.014,.179,.151),(1.856,0,-.021,.138,.122),(1.89,0,-.024,.078,.075),(1.90,0,-.024,.021,.023)],'warm skin','head',n=56)
        self.loft('Neck',[(1.32,0,0,.080,.072),(1.40,0,-.005,.070,.066),(1.50,0,0,.073,.070)],'warm skin','spine')
        for s in (-1,1):
            self.ball('Ear',(s*.180,.00,1.613),(.035,.043,.057),'warm skin','head',s*.22)
            self.line('Ear fold',[(s*.202,.031,1.63),(s*.211,.033,1.616),(s*.202,.030,1.602)],.005,'lip rose','head')
            b='eye.'+str(s);vs=[];fs=[];uv=[];upper=[]
            for j in range(25):
                t=j/24;x=s*(.026+.111*t);z=1.652+.011*t;h=math.sin(math.pi*t)**.73
                for k in range(7):
                    f=k/6;zz=z+h*(f*.061-.024);yy=.008+.162*math.sqrt(max(0,1-(x/.192)**2))+.008*h*math.sin(f*math.pi)
                    vs.append((x,yy,zz));uv.append((t,(zz-1.630)/.067));
                    if k==6:upper.append((x,yy+.002,zz))
                    if j and k:
                        a=j*7+k;face=(a-8,a-7,a,a-1);fs.append(face if s==1 else face[::-1])
            o=shade(mesh('Painted almond eye',vs,fs,self.p['eye']));layer=o.data.uv_layers.new(name='UVMap')
            for l in o.data.loops:layer.data[l.index].uv=uv[l.vertex_index]
            self.bind(o,b);self.line('Upper lash',upper,.0036,'hair espresso',b)
            self.line('Brow',[(s*.035,.162,1.727),(s*.067,.157,1.739),(s*.094,.146,1.740),(s*.128,.128,1.731)],.006,'hair espresso','head')
            for k in range(3):
                xx=s*(.098+k*.012);self.ball('Freckle',(xx,.008+.151*math.sqrt(1-(xx/.181)**2),1.603+.005*math.sin(k*2)),(.0028,.0017,.0024),'lip rose','head')
        self.ball('Nose bridge',(0,.15,1.632),(.021,.021,.044),'warm skin','head')
        self.ball('Nose tip',(0,.165,1.612),(.025,.023,.021),'warm skin','head')
        self.line('Smile',[(-.044,.143,1.564),(-.023,.153,1.558),(0,.156,1.557),(.024,.153,1.561),(.043,.144,1.568)],.0035,'lip rose','head')
    def hair(self,style):
        n=48;vs=[];fs=[]
        for j in range(14):
            for i in range(n):
                a=T*i/n;front=math.sin(a);edge=1.615+.145*front+.015*math.cos(3*a+.3)
                th=math.acos(max(-.99,min(.99,(edge-1.698)/.222)))*(1-j/13.1)
                vs.append((.201*math.sin(th)*math.cos(a),-.015+.177*math.sin(th)*math.sin(a),1.698+.222*math.cos(th)))
                if j:
                    k=(j-1)*n+i;l=(j-1)*n+(i+1)%n;fs.append((k,l,l+n,k+n))
        self.bind(shade(mesh('Sculpted hair crown',vs,fs,self.p['hair espresso'])),'head')
        for i in range(17):
            a=T*i/17;vs=[];fs=[];side=-1 if style==1 else 1
            for j in range(13):
                t=j/12;ang=a+side*.62*(1-t);edge=1.605+.11*math.sin(a)+.027*math.cos(3*a+style)
                th=.18+t*(math.acos(max(-.99,(edge-1.70)/.227))-.18);r=math.sin(th)
                c=Vector((.204*r*math.cos(ang),-.014+.184*r*math.sin(ang),1.70+.227*math.cos(th)+.008*math.sin(t*math.pi)*math.sin(3*a)))
                tang=Vector((-math.sin(ang),math.cos(ang),0));norm=Vector((r*math.cos(ang),r*math.sin(ang),math.cos(th)))
                width=.001+.040*math.sin(math.pi*t)**.64
                for h in range(7):
                    u=h/3-1;vs.append(c+tang*u*width+norm*(1-u*u)*width*.28)
                    if j and h:k=j*7+h;fs.append((k-8,k-7,k,k-1))
            self.bind(shade(mesh('Swept fringe lock',vs,fs,self.p['hair glints' if i%5==2 else 'hair espresso'])),'head')
        if style==1:
            for s in (-1,1):self.ball('Low gathered puff',(s*.14,-.115,1.553),(.089,.086,.094),'hair espresso','head',s*.2)
        if style==2:
            self.ball('Watch cap',(0,-.018,1.834),(.204,.181,.10),'storm teal','head');self.loft('Folded hat band',[(1.804,0,-.013,.198,.178),(1.816,0,-.016,.206,.183),(1.851,0,-.018,.199,.177)],'storm teal','head')
            for s in (-1,1):
                pts=[(s*.083+.068*math.cos(i*T/40),.157-s*.017*math.cos(i*T/40),1.666+.042*math.sin(i*T/40)) for i in range(41)];self.line('Thin spectacles',pts,.0035,'ink','head')
            self.line('Bridge',[(-.016,.174,1.674),(0,.179,1.68),(.016,.174,1.674)],.003,'ink','head')
    def clothes(self,resident):
        self.loft('Short field shirt',[(.89,0,0,.153,.112),(.925,0,0,.163,.116),(1.02,0,0,.152,.113),(1.15,0,.005,.172,.132),(1.29,0,0,.193,.135),(1.34,0,-.006,.204,.115),(1.37,0,-.004,.139,.09),(1.389,0,0,.077,.075)],'field jacket','spine')
        def front(x,z,offset):
            rows=[(1.15,.172,.005,.132),(1.29,.193,0,.135),(1.34,.204,-.006,.115),(1.37,.139,-.004,.09),(1.389,.077,0,.075)]
            a,b=next(((a,b) for a,b in zip(rows,rows[1:]) if a[0]<=z<=b[0]),rows[:2]);t=(z-a[0])/(b[0]-a[0]);w,cy,d=[a[k]+(b[k]-a[k])*t for k in (1,2,3)]
            return (x,cy+d*math.sqrt(max(.001,1-(x/w)**2))+offset,z)
        def applique(name,levels,m,offset):
            vs=[];fs=[]
            for j,(z,l,r) in enumerate(levels):
                for k in range(7):
                    vs.append(front(l+(r-l)*k/6,z,offset));i=j*7+k
                    if j and k:fs.append((i-8,i-1,i,i-7))
            self.bind(shade(mesh(name,vs,fs,self.p[m])),'spine')
        applique('Ivory shirt inset',[(1.17,-.004,.004),(1.24,-.042,.042),(1.29,-.065,.065),(1.34,-.072,.072),(1.37,-.06,.06),(1.383,-.055,.055)],'ivory linen',.004)
        for sign in (-1,1):
            rows=[(1.266,.068,.072),(1.29,.045,.11),(1.34,.034,.11),(1.37,.025,.080),(1.382,.030,.053)]
            applique('Pressed collar',[(z,min(sign*l,sign*r),max(sign*l,sign*r)) for z,l,r in rows],'storm teal',.009)
        self.line('Scarf binding',[front(x,z,.012) for x,z in [(-.068,1.369),(-.043,1.351),(0,1.332),(.043,1.351),(.068,1.369)]],.009,'marigold','spine')
        applique('Knotted neckerchief',[(1.209,.033,.034),(1.228,.011,.044),(1.29,.008,.029),(1.324,-.011,.021),(1.333,-.006,.017)],'marigold',.011)
        for z in (.967,1.039,1.109):self.ball('Shirt button',(0,.119+(z-.967)*.106,z),(.007,.005,.007),'ivory linen','spine')
        self.loft('Shorts yoke',[(.827,0,-.003,.169,.122),(.889,0,-.004,.173,.124),(.937,0,0,.158,.116)],'navy twill','hips')
        self.loft('Webbing belt',[(.91,0,0,.163,.122),(.935,0,0,.159,.118)],'saddle leather','hips')
        self.box('Belt clasp',(0,.123,.923),(.044,.013,.027),'marigold','hips',.004)
        for s in (-1,1):
            th='thigh.'+str(s);sh='shin.'+str(s);ft='foot.'+str(s);ua='upper_arm.'+str(s);fa='forearm.'+str(s);hand='hand.'+str(s)
            def knee(v):
                t=max(0,min(1,(v.z-.45)/.12));return {th:t,sh:1-t}
            def elbow(v):
                t=max(0,min(1,(v.z-1.039)/.088));return {ua:t,fa:1-t}
            def rings(rows):return [(z,s*x,y,w,d) for z,x,y,w,d in rows]
            self.loft('Knee and calf',rings([(.10,.105,0,.038,.042),(.18,.105,-.003,.048,.051),(.32,.105,-.012,.063,.069),(.437,.105,-.003,.053,.059),(.502,.105,.005,.062,.063),(.548,.105,0,.064,.070),(.69,.10,0,.080,.083),(.84,.095,0,.085,.090)]),'warm skin',th,knee)
            self.loft('Cuffed walking shorts',rings([(.633,.106,.0,.09,.091),(.647,.106,0,.096,.096),(.695,.104,0,.094,.10),(.842,.094,0,.100,.124),(.889,.088,0,.092,.112)]),'navy twill',th)
            self.loft('Turned-up hem',rings([(.635,.106,0,.094,.095),(.654,.106,0,.097,.099),(.671,.106,0,.095,.098)]),'storm teal',th)
            self.line('Pocket welt',[(s*.15,.086,.858),(s*.176,.064,.801),(s*.185,.048,.789)],.0045,'storm teal',th)
            self.loft('Ribbed trail sock',rings([(.085,.105,0,.041,.046),(.18,.105,-.004,.050,.054),(.298,.105,-.010,.064,.071),(.318,.105,-.012,.065,.072)]),'ivory linen',sh)
            for z,m in ((.281,'storm teal'),(.298,'marigold')):self.loft('Sock bands',rings([(z,.105,-.011,.065,.072),(z+.008,.105,-.011,.065,.072)]),m,sh)
            self.loft('Sculpted trainer',rings([(.027,.105,.048,.070,.139),(.044,.105,.048,.071,.143),(.071,.105,.047,.072,.14),(.097,.105,.034,.064,.114),(.127,.105,.005,.055,.078),(.146,.105,-.004,.049,.060)]),'saddle leather',ft)
            self.loft('Rubber outsole',rings([(.006,.105,.052,.067,.133),(.012,.105,.051,.074,.145),(.038,.105,.050,.074,.146),(.045,.105,.049,.069,.14)]),'ivory linen',ft)
            for j in range(3):self.line('Shoe lace',[(s*.105-.031,.055+j*.017,.130-j*.006),(s*.105,.068+j*.016,.140-j*.008),(s*.105+.032,.059+j*.017,.130-j*.006)],.004,'ivory linen',ft)
            self.loft('Continuous arm',rings([(.902,.297,.018,.032,.032),(.96,.290,.010,.044,.044),(1.035,.276,0,.047,.050),(1.083,.272,-.003,.046,.048),(1.14,.255,.0,.056,.058),(1.22,.238,0,.063,.067),(1.316,.207,0,.067,.069)]),'warm skin',ua,elbow)
            self.loft('Set-in sleeve',rings([(1.157,.253,0,.071,.076),(1.174,.253,0,.075,.080),(1.251,.235,-.002,.081,.083),(1.306,.217,0,.079,.083),(1.34,.196,-.001,.069,.073),(1.348,.19,0,.036,.043)]),'field jacket',ua)
            self.loft('Sleeve facing',rings([(1.155,.254,0,.073,.078),(1.176,.252,0,.076,.081)]),'storm teal',ua)
            self.ball('Hand palm',(s*.30,.017,.870),(.038,.045,.055),'warm skin',hand,s*.12)
            for j in range(4):
                self.ball('Relaxed finger',(s*(.305-.003*j),-.010+j*.018,.833+.005*abs(j-1)),(.021,.012,.032-.003*abs(j-1)),'warm skin',hand,s*.11)
            self.ball('Thumb',(s*.281,.048,.86),(.018,.020,.032),'warm skin',hand,-s*.22)
    def build(self,resident):
        if not resident:
            from street_fit import outfit
            return outfit(self)
        self.head();self.clothes(resident)
        for style in range(3 if resident else 1):
            self.section='Look_'+str(style) if resident else 'Body';self.hair(style)
            if resident and style==1:
                rows=[(.941,.156,.161,.116),(.995,.147,.156,.114),(1.07,.124,.160,.121),(1.15,.122,.172,.137),(1.232,.115,.183,.137),(1.281,.106,.193,.135)]
                vs=[];fs=[]
                for j,(z,w,bodyw,d) in enumerate(rows):
                    for k in range(13):
                        x=w*(k/6-1);vs.append((x,.009+d*math.sqrt(max(.001,1-(x/bodyw)**2)),z));i=j*13+k
                        if j and k:fs.append((i-14,i-1,i,i-13))
                self.bind(shade(mesh('Canvas workshop bib',vs,fs,self.p['saddle leather'])),'spine')
                self.line('Apron seam',[(-.073,.138,1.14),(-.073,.130,1.09),(0,.141,1.087),(.04,.137,1.09),(.04,.145,1.14)],.003,'marigold','spine')
        result=[]
        for name,parts in self.parts.items():
            o=join(parts,name);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);result.append(o)
        return result
