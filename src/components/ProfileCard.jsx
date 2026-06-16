import { Link } from "react-router-dom";
import { profile } from "../data/profile";

// Glass profile card used in the hero dashboard and the mobile intro slide.
// `className` carries context-specific grid sizing and padding.
export default function ProfileCard({ className = "", onLearnMore, onGetInTouch, onPhotoLoad }) {
  const { github, linkedin } = profile.socials;

  return (
    <div
      className={`card-glass flex flex-col items-center justify-center text-center ${className}`}
    >
      <img
        className="rounded-full border-3 border-white/30 shadow-xl w-24 md:w-40 h-24 md:h-40 object-cover mb-2 md:mb-4"
        src={profile.photo}
        alt="profile"
        onLoad={onPhotoLoad}
      />
      <h1 className="text-xl md:text-3xl font-bold text-white mb-1">{profile.name}</h1>
      <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
        {profile.schoolLogos.map((logo) => (
          <img key={logo.src} src={logo.src} alt={logo.alt} className="h-8 w-auto object-contain" />
        ))}
      </div>
      <p className="text-white/70 text-xs md:text-sm mb-2 md:mb-4">{profile.origin}</p>

      <div className="flex gap-1 md:gap-2 w-full mb-2 md:mb-4">
        <a
          href={github.url}
          className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105"
        >
          <img className="h-4 w-4" src={github.icon} alt="github" />
          <span className="text-white text-xs font-medium">GitHub</span>
        </a>
        <a
          href={linkedin.url}
          className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105"
        >
          <img className="h-4 w-4" src={linkedin.icon} alt="linkedin" />
          <span className="text-white text-xs font-medium">LinkedIn</span>
        </a>
      </div>

      <div className="flex flex-col gap-1 md:gap-2 w-full">
        <button
          onClick={onLearnMore}
          className="text-black bg-white hover:bg-gray-100 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 shadow-lg text-xs md:text-sm"
        >
          Learn More
        </button>
        <button
          onClick={onGetInTouch}
          className="text-white bg-white/20 hover:bg-white/30 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 backdrop-blur-sm border border-white/30 text-xs md:text-sm"
        >
          Get in Touch
        </button>
        <Link
          to="/city"
          className="text-white/80 bg-white/10 hover:bg-white/20 hover:text-white font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 backdrop-blur-sm border border-white/20 text-xs md:text-sm"
        >
          Try &ldquo;Logan City,&rdquo; the interactive resume
        </Link>
      </div>
    </div>
  );
}
