"""Player-only street wardrobe. Z-up garment blocks are cut around the existing walking rig."""
import math,random,bpy
import numpy as np
from mathutils import Vector
from world_core import mat,mesh,shade,join
T=math.tau

def fabric(name,kind,base_color=None):
    # Original seamless albedo swatches; visible in both glTF and Blender.
    h=w=192;y,x=np.mgrid[0:h,0:w]/w
    if kind=='knit':
        u=x*12;v=y*14;rib=np.cos(T*u);loops=np.cos(T*(v+.36*abs(2*(u%1)-1)))
        val=.87+.14*rib+.12*loops+.065*np.cos(T*(u*2+v));base=(.255,.206,.183)
    else:
        twill=np.sin(T*(x*36+y*52));wash=.5*np.cos(T*(x+y))+.3*np.sin(T*(2*x-y))+.2*np.cos(T*(3*y+x));val=.98+.045*twill+.027*wash;base=(.696,.656,.584)
    if base_color:base=base_color
    pixels=np.ones((h,w,4),dtype=np.float32);pixels[:,:,:3]=np.clip(val[:,:,None]*base,0,1)
    im=bpy.data.images.new(name+' swatch',w,h,alpha=False);im.pixels.foreach_set(pixels.ravel());im.pack();m=mat(name,(1,1,1),.91)
    nodes=m.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=im;uv=nodes.new('ShaderNodeUVMap');uv.uv_map='UVMap';m.node_tree.links.new(uv.outputs[0],tex.inputs['Vector']);bs=next(n for n in nodes if n.type=='BSDF_PRINCIPLED');m.node_tree.links.new(tex.outputs[0],bs.inputs['Base Color']);return m

def outfit(p,host=False):
    from host_wardrobe import palette,torso as host_torso,sneaker,coffee
    p.p.update({'knit':fabric('Espresso waffle knit','knit'),'denim':fabric('Oyster washed denim','denim'),'tee':mat('Cotton undershirt',(.86,.84,.76),.91),'welt':mat('Honey boot welt',(.21,.091,.034),.86),'wheat':mat('Wheat nubuck',(.53,.275,.095),.85),'lug':mat('Dark gum outsole',(.104,.063,.037),.86),'gold':mat('Brushed necklace gold',(.78,.50,.16),.29,metal=.78),'silver':mat('Worn nickel hardware',(.53,.56,.57),.31,metal=.8),'seam':mat('Stone topstitch',(.33,.27,.19),.87),'lock':mat('Espresso waves',(.027,.015,.014),.66),'strand':mat('Chestnut reflected strands',(.051,.028,.022),.60)})
    def garment(name,rows,m,b,weights=None,fold=.0,uvrep=(4,2)):
        vs=[];fs=[];N=48
        for j,(z,cx,cy,rx,ry) in enumerate(rows):
            for i in range(N):
                a=T*i/N;amp=fold*(.55*math.sin(5*a+z*8)+.45*math.cos(3*a-z*9));vs.append((cx+(rx+amp)*math.cos(a),cy+(ry+amp)*math.sin(a),z+fold*.53*math.sin(3*a+.7*j)))
                if j:
                    k=(j-1)*N+i;l=(j-1)*N+(i+1)%N;fs.append((k,l,l+N,k+N))
        fs.extend([tuple(reversed(range(N))),tuple(range(len(vs)-N,len(vs)))]);o=shade(mesh(name,vs,fs,p.p[m]));uv=o.data.uv_layers.new(name='UVMap');bot=rows[0][0];span=rows[-1][0]-bot
        for poly in o.data.polygons:
            ids=[o.data.loops[l].vertex_index for l in poly.loop_indices];wrap=any(i%N==N-1 for i in ids) and any(i%N==0 for i in ids)
            for l,i in zip(poly.loop_indices,ids):uv.data[l].uv=(((N if wrap and i%N==0 else i%N)/N)*uvrep[0],(vs[i][2]-bot)/max(span,.005)*uvrep[1])
        return p.bind(o,b,weights)
    p.head();shag(p)
    def torso(rs):return [(z,0,0,w,d) for z,w,d in rs]
    if host:
        palette(p,fabric);host_torso(p,garment)
    else:
        garment('Longline tee reveal',torso([(.836,.185,.135),(.849,.192,.139),(.904,.191,.14)]),'tee','spine',fold=.003)
        garment('Dropped-shoulder box knit',torso([(.866,.179,.129),(.88,.190,.143),(.913,.198,.147),(1.00,.201,.148),(1.12,.203,.15),(1.22,.209,.151),(1.293,.234,.145),(1.321,.241,.123),(1.35,.208,.112),(1.374,.118,.089),(1.389,.085,.077)]),'knit','spine',fold=.005,uvrep=(7,4))
        garment('Ribbed sweater hem',torso([(.868,.182,.136),(.879,.193,.145),(.906,.197,.148)]),'knit','spine',fold=.003,uvrep=(8,.35))
        garment('White tee crew collar',torso([(1.379,.096,.088),(1.392,.091,.081),(1.399,.082,.074)]),'tee','spine')
        garment('Bound knit neck',torso([(1.363,.118,.091),(1.379,.105,.090),(1.384,.095,.086)]),'knit','spine',uvrep=(4,.3))
    for s in (-1,1):
        su='.'+str(s);th='thigh'+su;sh='shin'+su;ft='foot'+su;ua='upper_arm'+su;fa='forearm'+su;hand='hand'+su
        def rs(rows):return [(z,s*cx,cy,w,d) for z,cx,cy,w,d in rows]
        def arm(v):t=max(0,min(1,(v.z-1.026)/.115));return {ua:t,fa:1-t}
        def leg(v):
            h=max(0,min(1,(v.z-.774)/.083));k=max(0,min(1,(v.z-.426)/.16));return {'hips':h,th:(1-h)*k,sh:(1-h)*(1-k)}
        garment('Relaxed long sleeve',rs([(.904,.296,.008,.043,.049),(.932,.298,.009,.054,.060),(.958,.302,.008,.069,.072),(1.002,.293,.006,.076,.077),(1.05,.278,.001,.072,.079),(1.085,.271,0,.079,.081),(1.128,.263,0,.075,.08),(1.235,.243,-.004,.086,.096),(1.289,.218,0,.09,.097),(1.322,.192,0,.072,.077)]),'olive' if host else 'knit',ua,arm,.003,(4,3.3))
        garment('Deep knit cuff',rs([(.891,.296,.013,.043,.048),(.901,.298,.012,.050,.053),(.945,.298,.010,.055,.061)]),'rib' if host else 'knit',fa,uvrep=(4,.48))
        p.ball('Palm',(s*.30,.017,.872),(.038,.046,.053),'warm skin',hand,s*.11)
        if host and s==-1:
            # Fingers wrap the tapered sleeve; fingertips stay on its near face.
            for j in range(4):
                z=.886-j*.015;r=.045-j*.0016
                pts=[(-.305+.033*math.cos(a),.021+.043*math.sin(a),z-.003) for a in (-.3,.3,.95)]
                pts += [(-.30+r*math.cos(a),.071+r*math.sin(a),z) for a in (-.55,.02,.6,1.05)]
                p.line('Coffee grip',pts,.008,'warm skin',hand)
                p.ball('Fingertip',pts[-1],(.008,.008,.008),'warm skin',hand)
            p.line('Braced thumb',[(-.315,.026,.875),(-.335,.047,.892),(-.343,.072,.901),(-.337,.094,.904)],.011,'warm skin',hand)
        else:
            for j in range(4):p.ball('Relaxed fingers',(s*(.306-.003*j),-.01+j*.018,.833+.005*abs(j-1)),(.021,.012,.032-.003*abs(j-1)),'warm skin',hand,s*.11)
            p.ball('Thumb',(s*.28,.049,.858),(.018,.02,.031),'warm skin',hand,-s*.2)
        garment('Loose stacked jeans',rs([(.105,.118,.014,.089,.093),(.125,.122,.013,.102,.11),(.157,.119,-.003,.111,.101),(.189,.116,-.018,.091,.096),(.224,.120,.002,.107,.106),(.264,.122,-.003,.099,.102),(.368,.117,-.006,.103,.102),(.447,.11,-.007,.098,.098),(.496,.109,.004,.103,.103),(.547,.109,.004,.101,.108),(.644,.102,-.001,.102,.118),(.739,.101,0,.101,.124)]),'denim',th,leg,.007,(3.4,4))
        # Split the leg tube at the inseam into front and back panels. Both legs
        # then converge on one waist outline, with no overlapping hip shell.
        for panel in (1,-1):
            vs=[];fs=[];uvs=[];N=24
            for jj,(z,w,d,t) in enumerate([(.739,.201,.13,0),(.77,.20,.139,.32),(.802,.20,.140,.70),(.842,.192,.137,.96),(.88,.175,.123,1)]):
                for i in range(N+1):
                    a=panel*math.pi*i/N;ang=a if s==1 else math.pi-a
                    drift=.007*(.55*math.sin(5*ang+.739*8)+.45*math.cos(3*ang-.739*9));fade=min(1,(N-i)/3)
                    lx=.101+(.101+drift*fade)*math.cos(a);ly=(.124+drift)*math.sin(a)
                    xx=s*((1-t)*lx+t*w*math.cos(a/2));yy=(1-t)*ly+t*d*math.sin(a/2);zz=z+(1-t)*.00371*math.sin(3*ang+.7*11)
                    vs.append((xx,yy,zz));uvs.append((1.7*i/N,(z-.105)*5.8));k=jj*(N+1)+i
                    if i and jj:fs.append((k-N-2,k-N-1,k,k-1) if s*panel==1 else (k-1,k,k-N-1,k-N-2))
            ob=shade(mesh('Cut denim rise',vs,fs,p.p['denim']));uv=ob.data.uv_layers.new(name='UVMap')
            for l in ob.data.loops:uv.data[l.index].uv=uvs[l.vertex_index]
            p.bind(ob,th,leg)
        # Back pockets sit on the curved seat, with a double needle outline.
        pts=[(s*x,y,z) for x,y,z in [(.052,-.137,.841),(.148,-.102,.831),(.146,-.113,.767),(.106,-.129,.745),(.056,-.125,.766)]]
        p.line('Back pocket topstitch',pts+[pts[0]],.0022,'seam','hips')
        p.line('Front scoop pocket',[(s*.075,.129,.841),(s*.111,.121,.817),(s*.16,.095,.806),(s*.185,.061,.807)],.0032,'seam','hips')
        if host:sneaker(p,s,garment,rs,ft)
        else:
            garment('Boot leather upper',rs([(.035,.105,.056,.083,.157),(.055,.105,.060,.085,.156),(.084,.105,.064,.084,.147),(.113,.105,.048,.077,.130),(.145,.105,.018,.064,.096),(.192,.105,-.006,.057,.075)]),'wheat',ft,uvrep=(1,1))
            garment('Boot welt',rs([(.033,.105,.06,.085,.159),(.051,.105,.06,.088,.161)]),'welt',ft)
            garment('Chunky lug sole',rs([(.006,.105,.062,.081,.155),(.013,.105,.062,.087,.162),(.038,.105,.062,.088,.163)]),'lug',ft)
            for j,(z,cy,rx,ry) in enumerate([(.103,.054,.076,.137),(.117,.044,.075,.125),(.130,.032,.071,.114)]):
                def toe(dx):return cy+ry*math.sqrt(1-(dx/rx)**2)+.007
                for handside in (-1,1):
                    dx=handside*.038;p.ball('Antique brass boot eyelet',(s*.105+dx,toe(dx),z),(.008,.005,.007),'gold',ft)
                p.line('Waxed workboot lacing',[(s*.105+dx,toe(dx)+.003,z+.002*math.sin(idx*math.pi/4)) for idx,dx in enumerate((-.038,-.019,0,.019,.038))],.0038,'welt',ft)
            p.line('Boot perimeter stitch',[(s*.105+.087*math.cos(i*T/56),.06+.161*math.sin(i*T/56),.046) for i in range(57)],.0019,'wheat',ft)
    # The off-centre hardware is deliberately small but catches light when turning.
    if host:coffee(p)
    else:
        p.line('Nickel carabiner',[(.148,.119,.848),(.152,.125,.8),(.147,.131,.78),(.131,.136,.778),(.121,.139,.793),(.130,.131,.834),(.138,.126,.847),(.148,.119,.848)],.004,'silver','hips')
        for i in range(2):p.box('Cut key',(.132+i*.012,.137,.752-i*.008),(.012,.005,.053),'silver','hips',.003)
    p.line('Ear hoop',[(.196,.024+.016*math.cos(i*T/24),1.569+.019*math.sin(i*T/24)) for i in range(25)],.0028,'gold','head')
    body=join(p.parts['Body'],'Body');bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);return [body]


def shag(p):
    # Irregular swept locks over a close-fitting dark underlayer. A second row
    # around the nape keeps the back silhouette interesting in third person.
    rng=random.Random(733);vs=[];fs=[];n=52
    def edge(a):return 1.594+.145*math.sin(a)+.018*math.cos(3*a+.4)
    for j in range(15):
        for i in range(n):
            a=T*i/n;th=math.acos(max(-.99,min(.99,(edge(a)-1.70)/.234)))*(1-j/14.1)
            vs.append((.201*math.sin(th)*math.cos(a),-.014+.18*math.sin(th)*math.sin(a),1.70+.234*math.cos(th)))
            if j:k=(j-1)*n+i;l=(j-1)*n+(i+1)%n;fs.append((k,l,l+n,k+n))
    p.bind(shade(mesh('Tousled undercut',vs,fs,p.p['lock'])),'head')
    for layer,count in [(0,23),(1,17)]:
        for i in range(count):
            a=T*(i+rng.uniform(-.24,.24))/count;end=edge(a)+rng.uniform(-.032,.025)+layer*.085;lo=rng.uniform(.13,.68);hi=math.acos(max(-.99,min(.99,(end-1.70)/.244)));twist=rng.uniform(-.63,.68);phase=rng.uniform(-2,2);wide=rng.uniform(.030,.048);vs=[];fs=[]
            for j in range(18):
                t=j/17;th=lo+(hi-lo)*t;ang=a+twist*(1-t)+.14*math.sin(t*7+phase);sn=math.sin(th);norm=Vector((sn*math.cos(ang),sn*math.sin(ang),math.cos(th)));tang=Vector((-math.sin(ang),math.cos(ang),0));lift=.009+layer*.009+.014*math.sin(t*math.pi)+.018*t**4
                c=Vector((.199*sn*math.cos(ang),-.014+.181*sn*math.sin(ang),1.70+.236*math.cos(th)))+norm*lift;w=.001+wide*math.sin(math.pi*t)**.62
                for h in range(9):
                    u=h/4-1;vs.append(c+tang*u*w+norm*w*(1-u*u)*.60);k=j*9+h
                    if j and h:fs.append((k-10,k-9,k,k-1))
            p.bind(shade(mesh('Broken wave lock',vs,fs,p.p['strand' if i%6==1 else 'lock'])),'head')
