export default function Spinner() {
  return (
    <div
      className="w-10 h-10 rounded-full border-4 border-transparent border-t-black animate-spin"
      role="status"
      aria-label="Loading"
    />
  );
}
