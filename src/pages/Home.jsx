import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { Environment, Html } from '@react-three/drei';
import { Soccer } from '../models/Soccer';
import { Loader } from '../components/Loader';

export default function Home({setIsLoaded}) {
    return (
         <section className='w-full h-screen'>
            <Canvas className="w-full h-screen bg-transparent z-10" camera={{ near: 0.1, far: 1000 }}>
                <Suspense fallback={<Loader setIsLoaded={setIsLoaded} />}>
                    <Soccer 
                        position={[0, -0.9, 2]}
                        rotation={[0, 0.2, 0]}
                    />
                    <Environment preset="night" />
                </Suspense>
            </Canvas>
        </section>
    );
}