import React, { useState, useEffect } from 'react';

const ThemeLogo = ({ className = '', alt = 'Logo' }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    const checkDarkMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    };

    // Initial check
    checkDarkMode();

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const logoSrc = isDarkMode ? '/lkmlogo-white.png' : '/lkmlogo-black.png';

  return (
    <img
      className={className}
      src={logoSrc}
      alt={alt}
      style={{ transition: 'opacity 0.3s ease' }}
    />
  );
};

export default ThemeLogo;