"use client";

import { useEffect, useState } from "react";
import { ComposableMap, Marker, Line, useMapContext } from "react-simple-maps";


const ROUTE_CITIES: { id: string; coordinates: [number, number]; label: string }[] = [
  { id: "toronto",    coordinates: [-79.38, 43.65], label: "Toronto" },
  { id: "ottawa",     coordinates: [-75.70, 45.42], label: "Ottawa" },
  { id: "montreal",   coordinates: [-73.57, 45.50], label: "Montréal" },
  { id: "quebeccity", coordinates: [-71.21, 46.81], label: "Québec City" },
];

const ROUTES: {
  from: [number, number];
  to: [number, number];
  cpOffset: [number, number];
  label: string;
  delay: number;
}[] = [
  { from: [-79.38, 43.65], to: [-75.70, 45.42], cpOffset: [0, -80],  label: "5h", delay: 0.2 },
  { from: [-75.70, 45.42], to: [-71.21, 46.81], cpOffset: [0, -80],  label: "5h", delay: 0.8 },
  { from: [-79.38, 43.65], to: [-73.57, 45.50], cpOffset: [0,  80],  label: "6h", delay: 1.4 },
  { from: [-79.38, 43.65], to: [-71.21, 46.81], cpOffset: [0,  160], label: "9h", delay: 2.0 },
];

function ArcPaths({ step }: { step: number }) {
  const { projection } = useMapContext();
  if (!projection) return null;

  return (
    <>
      {ROUTES.map((route, i) => {
        const p1 = projection(route.from);
        const p2 = projection(route.to);
        if (!p1 || !p2) return null;
        const [x1, y1] = p1;
        const [x2, y2] = p2;
        const cx = (x1 + x2) / 2 + route.cpOffset[0];
        const cy = (y1 + y2) / 2 + route.cpOffset[1];
        const d   = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        const mx  = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
        const my  = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
        const len = 5000;
        const drawn = step > i;

        return (
          <g key={i}>
            <path
              id={`portfolio-route-${i}`}
              d={d}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeOpacity={0.6}
              strokeDasharray={len}
              strokeDashoffset={drawn ? 0 : len}
              style={{
                transition: drawn ? "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" : "none",
              }}
            />
            {drawn && (
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  fill: "#93c5fd",
                  fillOpacity: 0.95,
                  filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.9))",
                }}
              >
                {route.label}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

export const MapBackground = ({ active = false, skipAnimation = false }: { active?: boolean; skipAnimation?: boolean }) => {
  const [step, setStep] = useState(skipAnimation ? ROUTES.length : 0);

  useEffect(() => {
    if (skipAnimation) return;
    if (!active) { setStep(0); return; }
    const timers = ROUTES.map((r, i) =>
      setTimeout(() => setStep(i + 1), (r.delay + 0.5) * 1000),
    );
    return () => timers.forEach(clearTimeout);
  }, [active, skipAnimation]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <style>{`
        @keyframes fadeInDot {
          from { opacity: 0; transform: scale(0.3); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ width: "140%", height: "140%", marginTop: "-20%", marginLeft: "-20%" }}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 3000, center: [-74, 45] }}
          style={{ width: "100%", height: "100%" }}
        >
          {active && <ArcPaths step={step} />}

          {/* Travelling dots */}
          {active && ROUTES.map((_, i) =>
            step > i ? (
              <g key={`dot-${i}`}>
                <circle r={4} fill="#3b82f6" fillOpacity={0.3}>
                  <animateMotion dur={`${(2 + i * 0.4) * 2}s`} repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear">
                    <mpath href={`#portfolio-route-${i}`} />
                  </animateMotion>
                </circle>
                <circle r={2} fill="#93c5fd">
                  <animateMotion dur={`${(2 + i * 0.4) * 2}s`} repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear">
                    <mpath href={`#portfolio-route-${i}`} />
                  </animateMotion>
                </circle>
              </g>
            ) : null,
          )}

          {/* Route city markers */}
          {active && ROUTE_CITIES.map((city, i) => (
            <Marker key={city.id} coordinates={city.coordinates}>
              <circle
                r={12}
                fill="#3b82f6"
                fillOpacity={0.12}
                style={{ animation: `fadeInDot 0.4s ease ${0.1 + i * 0.1}s both` }}
              />
              <circle
                r={6}
                fill="#60a5fa"
                style={{ animation: `fadeInDot 0.4s ease ${0.15 + i * 0.1}s both` }}
              />
              <circle r={2.5} fill="white" />
              <text
                textAnchor="middle"
                dy="-16"
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  fill: "white",
                  fillOpacity: 0.85,
                  animation: `fadeInDot 0.4s ease ${0.2 + i * 0.1}s both`,
                }}
              >
                {city.label}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
};
