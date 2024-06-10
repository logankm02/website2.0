import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import { useState } from "react";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <main className={`w-full h-screen relative ${isLoaded ? 'bg-gradient-to-b from-sunset to-transparent bg-cover' : 'bg-transparent'}`}>
      <Router>
        <Routes>
          <Route path="/website2.0" element={<Home setIsLoaded={setIsLoaded}/>} end />
          <Route path="website2.0/about" element={<About />} end />
        </Routes>
      </Router>
    </main>
  )
}
