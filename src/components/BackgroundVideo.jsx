const VIDEO_SRC = "/video/background.mp4";

export default function BackgroundVideo({ onCanPlay, className = "" }) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      onCanPlay={onCanPlay}
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      src={VIDEO_SRC}
    />
  );
}
