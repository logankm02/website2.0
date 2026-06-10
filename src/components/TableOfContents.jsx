import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const TableOfContents = ({ isWidget = false }) => {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });
  const [activeSection, setActiveSection] = useState('home');
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(true);
  const hideTimer = useRef(null);

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'getInTouch', label: 'Contact' }
  ];

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
      const tocScrollPosition = window.scrollY + window.innerHeight / 3;
      const homeSection = document.getElementById('home');
      if (homeSection) {
        setIsDarkBackground(tocScrollPosition <= homeSection.offsetTop + homeSection.offsetHeight);
      }
    };

    const handleMouseMove = (e) => {
      const distFromRight = window.innerWidth - e.clientX;
      if (distFromRight < 80) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setIsHovered(true);
      } else if (distFromRight > 200) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setIsHovered(false), 50);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Offset to account for any fixed headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Widget version
  if (isWidget) {
    return (
      <div className="relative bg-black/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 transition-all h-full overflow-hidden">
        <div className="widget-gradient"></div>
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <p className="text-white font-semibold text-xs uppercase tracking-wide">Navigation</p>
            </div>
          </div>
          <nav className="space-y-1.5 flex-1 flex flex-col justify-between">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-center flex-1 flex items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
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

  return null;
};

export default TableOfContents;
