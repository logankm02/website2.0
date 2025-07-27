import React, { useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <main className={`w-full h-screen relative ${isLoaded ? 'bg-gradient-to-b from-sunset to-transparent bg-cover' : 'bg-transparent'}`}>
      <Router basename={process.env.NODE_ENV === 'production' ? '/website2.0' : ''}>
        <Routes>
          <Route path="/" element={<Home setIsLoaded={setIsLoaded}/>} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </main>
  )
}
