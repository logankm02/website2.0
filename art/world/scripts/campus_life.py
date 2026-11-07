"""Original fictional students, furniture and commute paths in Blender XY coordinates."""
def inhabitants(slug):
    people=[]
    def walker(id,route,phase,look):
        people.append(dict(id=id,route=route,phase=phase,look=look,speed=1.05+(look%3)*.09))
    def person(id,x,y,look,behavior='talk',body=''):
        people.append(dict(id=id,point=[x,y],look=look,behavior=behavior,body=body))
    if slug=='rochester':
        for s,look in [(-1,0),(1,1)]:
            for i in range(2):walker('quad-walker-%s-%s'%(s,i),[[s*12,-30],[s*12,-11],[s*12,10],[s*12,22]],.12+i*.48,look+i*2)
        for i,(x,y) in enumerate([(-10.2,-18.79),(10.2,2.21),(-10.2,18.21)]):person('reader-'+str(i),x,y,i+1,'seated')
        for id,x,y,look,body in [
            ('Maya',-6.5,-25,0,'Heading to Morey? Keep the lawn on your right. It is the second hall on that side, just before Rush Rhees.'),
            ('Theo',-5.2,-24.7,2,'The quad is our shortcut between classes. I like the benches when it is quiet.'),
            ('Avery',7,12,1,'Bausch & Lomb is across the walk behind me. You can see the library dome from most of the quad.'),
            ('Sam',8.3,12.1,3,'Taking a break before heading back to the library. The central path goes straight to its doors.')]:person(id,x,y,look,body=body)
    else:
        for i in range(2):walker('library-walker-'+str(i),[[-24,-16],[-14,-16],[-3,-16],[8,-16],[18,-16]],.14+i*.5,i)
        for i in range(2):walker('glade-walker-'+str(i),[[-13,16],[-6,18],[3,18],[12,16]],.2+i*.5,i+2)
        for i,(x,y) in enumerate([(-13,14.21),(4,16.21),(9,-13.79)]):person('reader-'+str(i),x,y,i+2,'seated')
        for id,x,y,look,body in [
            ('Riley',-17,-3,1,'Doe is across the lawn, with the north reading room looking back at us. The tower is beyond its eastern end.'),
            ('Alex',-15.6,-2.4,4,'I am meeting a friend here before we head to Moffitt. It is just west of the library.'),
            ('Jordan',5,3,2,'You can walk south along Sather Road to the gate and Strawberry Creek. It is a longer walk than it looks.'),
            ('Casey',6.3,3.2,0,'This is a good spot for a study break. Leave a little time to walk over to the Campanile.')]:person(id,x,y,look,body=body)
    return people

def dress_site(g,p,r,materials,solid):
    import math
    lim,iv,shadow,brick,bronze,glass,copper,slate,bell,dial,granite,marble,oak,iron,navy,gold=materials
    page=g.material('Open book paper',(.81,.78,.65))
    # Readers have an open paperback on their laps; book height matches Sit.
    for person in inhabitants('rochester' if r else 'berkeley'):
        if person.get('behavior')!='seated':continue
        x,y=person['point'];z=3.25
        for side in [-1,1]:
            g.block(navy,(x+side*.09,y-.28,z),(.18,.23,.034))
            g.block(page,(x+side*.087,y-.28,z+.026),(.165,.214,.027))
        g.rod(gold,(x,y-.39,z+.041),(x,y-.17,z+.041),.008)
    # Parked bicycles beside the building approaches, never in the promenade.
    for x,y,a in ([(-16,-30,.1),(16,26,-.1),(-15,25,.1)] if r else [(-29,-26,0),(-37,3,.1),(27,-46,0)]):
        def P(u,v,z):return (x+math.cos(a)*u-math.sin(a)*v,y+math.sin(a)*u+math.cos(a)*v,2.5+z)
        for u in [-.62,.62]:
            pts=[P(u+.35*math.cos(i*math.tau/40),0,.37+.35*math.sin(i*math.tau/40)) for i in range(41)]
            for aa,bb in zip(pts,pts[1:]):g.rod(iron,aa,bb,.027,6)
            for i in range(12):
                t=i*math.tau/12;g.rod(granite,P(u,0,.37),P(u+.33*math.cos(t),0,.37+.33*math.sin(t)),.006,4)
        for aa,bb in [((-.62,0,.37),(-.20,0,.83)),((-.20,0,.83),(.05,0,.36)),((.05,0,.36),(-.62,0,.37)),((-.20,0,.83),(.43,0,.86)),((.43,0,.86),(.05,0,.36)),((.43,0,.86),(.62,0,.37)),((.43,0,.86),(.40,0,1.06))]:g.rod(navy,P(*aa),P(*bb),.025)
        g.block(iron,P(-.22,0,.88),(.25,.15,.055),a);g.rod(iron,P(.40,-.20,1.06),P(.40,.20,1.06),.022)
        solid(x,y,.95,.26,1.1)
    if not r:
        # Doe's north elevation has engaged columns and a continuous entablature,
        # rather than the former freestanding temple portico and pediment.
        g.block(lim,(-3,-19.55,6.60),(34,.40,8.20))
        for z,w,h in [(2.85,34.4,.70),(10.80,34.7,.40),(11.26,35,.44),(11.58,35.4,.18)]:
            g.block(lim,(-3,-19.23,z),(w,.70,h))
        for i in range(15):
            x=-18.1+i*2.16
            g.block(iv,(x,-19.34,6.73),(1.64,.40,7.34))
            g.block(glass,(x,-19.01,6.80),(1.23,.08,6.85))
            for dz in [-2.4,-1.2,0,1.2,2.4]:g.block(bronze,(x,-18.95,6.80+dz),(1.23,.06,.049))
            g.block(bronze,(x,-18.94,6.80),(.051,.06,6.85))
        for i in range(16):
            x=-19.2+i*2.16
            g.turn(iv,(x,-19.00,3.10),[(.36,0),(.37,.22),(.27,.37),(.23,6.57),(.33,6.73),(.38,6.94)],24,.045)
            g.block(lim,(x,-19.0,10.19),(.89,.73,.19))
        g.block(lim,(-3,-18.82,4.35),(4.4,.54,3.60))
        for x in [-4.05,-2.0]:g.block(oak,(x,-18.50,3.93),(1.40,.09,2.62))
        g.lettering(bronze,'U N I V E R S I T Y   L I B R A R Y',(-3,-18.47,10.99),.29,math.pi)
    else:
        # Elm-lined formal lawn and low Georgian stonework remain the focal
        # composition; the library forecourt has low stone seating on its sides.
        for side in [-1,1]:
            x=side*7.1;y=26
            g.block(lim,(x,y,2.78),(4,.68,.54));g.block(iv,(x,y,3.09),(4.18,.81,.12));solid(x,y,2.1,.42,.66)
