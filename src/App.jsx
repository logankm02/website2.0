import React, { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import { BackgroundProvider, useBackground } from "./contexts/BackgroundContext";

function AppContent() {
  const location = useLocation();
  const { setCurrentRoute, getBackgroundClass } = useBackground();

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname, setCurrentRoute]);

  return (
    <main className={`w-full min-h-screen relative transition-colors duration-1000 ${getBackgroundClass()}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <BackgroundProvider>
        <AppContent />
      </BackgroundProvider>
    </Router>
  );
}
