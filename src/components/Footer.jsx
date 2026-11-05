import { profile } from "../data/profile";

// Minimal footer so the page doesn't just stop after the contact card.
export default function Footer() {
  const year = new Date().getFullYear();

  const handleBackToTop = (e) => {
    e.preventDefault();
    document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 pt-6 pb-10 flex flex-col-reverse md:flex-row items-center justify-between gap-3 text-xs text-gray-400 border-t border-gray-200/70">
      <p>© {year} {profile.name}</p>
      <a href="#home" onClick={handleBackToTop} className="hover:text-gray-600 transition-colors">
        Back to top ↑
      </a>
    </footer>
  );
}
