import { Html } from "@react-three/drei";

export const Loader = () => {
  return (
    <Html>
      <div className='flex justify-center items-center'>
          <div className='w-6 h-6 bg-white rounded-full animate-pulse'></div>
      </div>
    </Html>
  );
};