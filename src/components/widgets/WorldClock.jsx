import { useEffect, useState } from "react";
import WidgetHeader from "../WidgetHeader";
import { locations } from "../../data/locations";

function formatTime(timezone) {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function WorldClock() {
  const [, setTick] = useState(0);

  // Re-render every second so the clocks stay current.
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative card-glass p-3 transition-all h-full overflow-hidden">
      <div className="widget-gradient" />
      <div className="relative z-10 h-full flex flex-col">
        <WidgetHeader
          icon={
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="World Clock"
        />
        <div className="text-white/90 flex-1 flex flex-col gap-2 justify-between">
          {locations.map((location) => (
            <div
              key={location.id}
              className="border border-white/10 rounded-xl px-3 py-2 flex flex-1 items-center justify-between bg-white/5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 ${location.dotClass} rounded-full`} />
                  <span className="font-semibold text-xs">{location.name}</span>
                </div>
                <p className="text-white/60 text-[11px] mt-0.5 uppercase tracking-wide">
                  {location.timezone.replace(/_/g, " ")}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold">{formatTime(location.timezone)}</div>
                <div className="text-white/60 text-xs">{`${location.temp}${location.unit}`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
