import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";

// The 3D scene pulls in three.js — load it only when /classic is visited.
const Classic = lazy(() => import("./pages/Classic"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/classic" element={<Classic />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
