import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { observeClicks, observeSections, trackPageview } from "../lib/analytics";

// Wires the first-party analytics tracker into the router: a pageview on every
// route change, plus section-visibility and click observers (re-attached per
// route so freshly rendered sections get picked up). Renders nothing.
export default function Analytics() {
  const { pathname } = useLocation();

  useEffect(() => observeClicks(), []);

  useEffect(() => {
    trackPageview(pathname);
    // Defer one frame so the route's sections are in the DOM before observing.
    let cleanup = null;
    const raf = requestAnimationFrame(() => {
      cleanup = observeSections();
    });
    return () => {
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
