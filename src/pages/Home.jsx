import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Soccer } from '../models/Soccer';
import { Loader } from '../components/Loader'

export default function Home() {
    return (
        <section className="w-full h-screen relative">  
        <Canvas className="w-full h-screen bg-transparent z-10" camera={{ near: 0.1, far: 1000 }}>
            <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.5} />
            <spotLight intensity={4} />
            <Soccer 
                position={[0, -0.9, 2]}
                rotation={[0, 0.2, 0]}
            />
            </Suspense>
        </Canvas>
        </section>
    );
}