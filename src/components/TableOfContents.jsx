import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const TableOfContents = ({ isWidget = false }) => {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });
  const [activeSection, setActiveSection] = useState('home');
  const [isVisible, setIsVisible] = useState(true);
  const [isDarkBackground, setIsDarkBackground] = useState(true);

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
      const scrollPosition = window.scrollY + 100; // Add offset for better detection

      // Find which section is currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }

      // Determine background color based on what's behind the TOC position
      const tocPosition = window.innerHeight / 3; // TOC is positioned at 1/3 from top
      const tocScrollPosition = window.scrollY + tocPosition;
      
      const homeSection = document.getElementById('home');
      if (homeSection) {
        const homeSectionTop = homeSection.offsetTop;
        const homeSectionBottom = homeSectionTop + homeSection.offsetHeight;
        
        // TOC should be dark when it's over the home section
        setIsDarkBackground(tocScrollPosition >= homeSectionTop && tocScrollPosition <= homeSectionBottom);
        
        // Only show TOC when we're past the hero section to avoid overlap
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          const aboutSectionTop = aboutSection.offsetTop;
          // Show TOC when we're approaching the about section
          setIsVisible(window.scrollY > aboutSectionTop - window.innerHeight + 200);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial active section

    return () => window.removeEventListener('scroll', handleScroll);
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
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full flex flex-col">
        <div className="flex items-center justify-center mb-2">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-1.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-xs">Navigation</h3>
        </div>
        <nav className="space-y-1.5 flex-1 flex flex-col justify-center">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`block w-full text-center px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
    );
  }

  // Don't render floating version on mobile
  if (!isDesktop) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
      transition={{ duration: 0.3 }}
      className="fixed right-8 top-1/3 transform -translate-y-1/3 z-40"
    >
      <motion.div 
        animate={{
          backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.15)' : 'rgb(248, 250, 252)', // exact slate-50
          borderColor: isDarkBackground ? 'rgba(255, 255, 255, 0.3)' : 'rgb(229, 231, 235)' // gray-200 (default border)
        }}
        transition={{ duration: 0.3 }}
        className="backdrop-blur-md rounded-lg p-4 shadow-lg border"
      >
        <nav className="space-y-2">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              animate={{
                backgroundColor: activeSection === section.id
                  ? (isDarkBackground ? 'rgba(255, 255, 255, 0.25)' : 'rgba(51, 65, 85, 0.15)') // slate-700 equivalent
                  : 'rgba(0, 0, 0, 0)',
                color: isDarkBackground ? '#ffffff' : '#334155' // slate-700
              }}
              whileHover={{
                backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.15)' : 'rgba(51, 65, 85, 0.1)'
              }}
              transition={{ duration: 0.2 }}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === section.id ? 'font-semibold' : ''
              }`}
            >
              {section.label}
            </motion.button>
          ))}
        </nav>
      </motion.div>
    </motion.div>
  );
};

export default TableOfContents;