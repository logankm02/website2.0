import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";

export default function App() {
  return (
    <main className='bg-gradient-to-b from-sunset to-transparent bg-cover h-screen'>
      <Router>
        <Routes>
          <Route path="/website2.0" element={<Home />} end />
          <Route path="website2.0/about" element={<About />} end />
        </Routes>
      </Router>
    </main>
  )
}
