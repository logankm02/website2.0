"""Logan at the gate: an open flight jacket, canvas shoulder bag and court shoes."""
import math
from mathutils import Vector
from world_core import mat,mesh,shade
T=math.tau

def palette(p,fabric):
    p.p.update({'olive':mat('Weathered olive cotton',(.145,.157,.087),.79),'rib':mat('Olive ribbed binding',(.079,.077,.043),.91),'black':mat('Washed black jersey',(.018,.020,.024),.93),'canvas':mat('Ink canvas bag',(.019,.022,.024),.89),'web':mat('Black webbing',(.032,.035,.033),.81),'cream':mat('Chalk leather',(.81,.78,.67),.58),'suede':mat('Grey suede overlays',(.225,.226,.211),.87),'gum':mat('Honey rubber',(.43,.268,.116),.91),'denim':fabric('Midnight stonewashed denim','denim',(.219,.262,.322)),'seam':mat('Indigo topstitch',(.095,.107,.121),.9)})

def torso(p,garment):
    def rings(rows):return [(z,0,0,w,d) for z,w,d in rows]
    garment('Black cotton tee',rings([(.844,.167,.118),(.87,.173,.123),(1.01,.164,.122),(1.18,.180,.134),(1.30,.197,.132),(1.34,.179,.113),(1.374,.084,.077)]),'black','spine',fold=.002)
    garment('Bound tee neckline',rings([(1.366,.100,.084),(1.379,.088,.079),(1.385,.081,.076)]),'black','spine')
    levels=[(.845,.175,.139,.59),(.869,.192,.15,.54),(.905,.201,.153,.50),(1.008,.208,.158,.40),(1.13,.215,.161,.36),(1.245,.223,.158,.34),(1.304,.239,.146,.32),(1.333,.241,.122,.34),(1.35,.202,.115,.35),(1.379,.112,.097,.58),(1.414,.111,.100,.73),(1.437,.119,.113,.85)]
    n=68;vs=[];fs=[];mi=[];edges=[[],[]]
    for j,(z,w,d,gap) in enumerate(levels):
        for i in range(n+1):
            t=i/n;a=math.pi/2+gap+t*(T-2*gap);wave=.0033*math.sin(5*a+8*z)+.002*math.cos(9*a-z*5)
            pt=((w+wave)*math.cos(a),(d+wave)*math.sin(a),z+.006*math.cos(3*a+z*9));vs.append(pt)
            if i in (0,n):edges[int(i==n)].append(pt)
            if j and i:k=j*(n+1)+i;fs.append((k-n-2,k-n-1,k,k-1));mi.append(1 if j==1 else 0)
    ob=shade(mesh('Open blouson panels and raised collar',vs,fs,[p.p['olive'],p.p['rib']],mi));p.bind(ob,'spine')
    # Turned zipper edges: dark tape, a thin continuous metal coil and pull.
    for edge in edges:
        p.line('Folded zipper tape',edge,.0065,'rib','spine');p.line('Nickel zipper coil',[(x,y+.005,z) for x,y,z in edge[:-2]],.0024,'silver','spine')
    x,y,z=edges[0][1];p.box('Jacket zipper pull',(x,y+.009,z-.012),(.010,.006,.029),'silver','spine',.002)
    for s in (-1,1):
        pts=[(s*.166,.099,1.035),(s*.175,.094,.990),(s*.177,.078,.933)]
        p.line('Pocket welt',pts,.009,'rib','spine');p.line('Inset pocket zip',[(x,y+.006,z) for x,y,z in pts],.002,'silver','spine')
    # Continuous broad strap over one shoulder, with the bag tucked behind the elbow.
    path=[(-.225,-.139,.877),(-.188,-.132,1.064),(-.165,-.118,1.250),(-.157,-.078,1.347),(-.151,-.015,1.377),(-.150,.056,1.357),(-.154,.108,1.315),(-.167,.122,1.233),(-.180,.111,1.124),(-.211,.091,.987),(-.252,.046,.874)]
    vs=[];fs=[]
    for i,(x,y,z) in enumerate(path):
        vs.extend([(x-.022,y,z),(x+.022,y,z)]);
        if i:fs.append((2*i-2,2*i-1,2*i+1,2*i))
    p.bind(shade(mesh('Adjustable woven bag strap',vs,fs,p.p['web'])),'spine')
    p.line('Strap slider',[(-.182,.123,1.277),(-.138,.123,1.277),(-.137,.123,1.30),(-.181,.123,1.30),(-.182,.123,1.277)],.0035,'silver','spine')
    p.box('Soft canvas shoulder bag',(-.231,-.082,.804),(.112,.235,.243),'canvas','hips',.039)
    p.line('Bag outer piping',[(-.286,-.166,.88),(-.290,-.176,.728),(-.288,-.156,.699),(-.288,-.003,.696),(-.285,.024,.72),(-.285,.025,.869)],.004,'web','hips')

def sneaker(p,s,garment,rs,ft):
    garment('Cream court upper',rs([(.029,.105,.051,.077,.145),(.051,.105,.056,.08,.147),(.076,.105,.058,.078,.141),(.096,.105,.045,.073,.122),(.125,.105,.012,.059,.085),(.148,.105,0,.055,.063)]),'cream',ft)
    garment('Cupsole foxing',rs([(.009,.105,.052,.078,.147),(.019,.105,.053,.082,.152),(.043,.105,.054,.082,.152)]),'cream',ft)
    garment('Grey outsole',rs([(.005,.105,.053,.077,.146),(.014,.105,.053,.082,.152)]),'suede',ft)
    for j in range(3):
        z=.085+j*.015;cy=.053-j*.015;ry=.132-j*.019
        p.line('Ink cotton lace',[(s*.105+dx,cy+ry*math.sqrt(1-(dx/.073)**2)+.007,z) for dx in (-.036,-.018,0,.018,.036)],.0042,'black',ft)
    for side in (-1,1):
        p.patch('Honey heel tab',[(s*.105+side*w,y,z) for w,y,z in [(.071,.030,.061),(.074,.066,.065),(.062,-.043,.103),(.052,-.062,.105)]],'gum',ft)

def coffee(p):
    x,y=-.30,.071;b='hand.-1'
    def rings(rows):return [(z,x,y,r,r) for z,r in rows]
    p.loft('Takeaway paper cup',rings([(.793,.033),(.799,.035),(.939,.049),(.945,.05)]),'cream',b,n=32)
    p.loft('Paper cup lid',rings([(.941,.050),(.947,.053),(.953,.052),(.958,.047),(.962,.044)]),'tee',b,n=32)
    p.loft('Kraft cup sleeve',rings([(.823,.038),(.828,.039),(.895,.045),(.900,.045)]),'gum',b,n=32)
