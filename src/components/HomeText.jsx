import useMediaQuery from "../hooks/useMediaQuery";
import { profile } from "../data/profile";

export default function HomeText() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <div
      className="text-center w-full text-white p-4 md:p-8"
      style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25), 0 4px 24px rgba(0,0,0,0.15)" }}
    >
      <h1 className="text-3xl md:text-6xl font-bold mb-3 md:mb-4 leading-tight">Hi, I&apos;m Logan</h1>
      <p className="text-sm md:text-lg mb-2 md:mb-3 px-2">{profile.headline}</p>
      <div className="flex items-center justify-center gap-2 flex-wrap text-sm md:text-lg mb-3 md:mb-4 px-2">
        <span>{profile.educationLine}</span>
      </div>
      {!isMobile && <p className="text-sm md:text-base text-white">Click anywhere to learn more</p>}
    </div>
  );
}
