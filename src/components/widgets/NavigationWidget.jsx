import { useEffect, useState } from "react";
import WidgetHeader from "../WidgetHeader";
import { sections } from "../../data/navigation";
import { scrollToSection } from "../../lib/scroll";

export default function NavigationWidget() {
  const [activeSection, setActiveSection] = useState("home");

  // Highlight the section currently in view.
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative card-glass p-3 transition-all h-full overflow-hidden">
      <div className="widget-gradient" />
      <div className="relative z-10 h-full flex flex-col">
        <WidgetHeader
          icon={
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          }
          title="Navigation"
        />
        <nav className="space-y-1.5 flex-1 flex flex-col justify-between">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`block w-full text-center flex-1 flex items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                activeSection === section.id
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
