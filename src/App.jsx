import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";

// The 3D scene pulls in three.js — load it only when /classic is visited.
const Classic = lazy(() => import("./pages/Classic"));
// The playable village game loads its own chunk too.
const Village = lazy(() => import("./pages/Village"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/classic" element={<Classic />} />
          <Route path="/city" element={<Village />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
