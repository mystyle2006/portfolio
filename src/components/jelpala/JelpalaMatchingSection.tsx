"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1600;
const H = 2500;
const MAX_PHASE = 5;
const ICON = 52;
const R = ICON / 2;
const STEP_TOPS = [160, 650, 1140, 1630] as const;
const STEP_H = 420;
const CY = (i: number) => STEP_TOPS[i] + Math.floor(STEP_H / 2);

/* Map constants */
const MAP_X = 510;
const MAP_Y = STEP_TOPS[0] + 24;
const MAP_W = 640;
const MAP_H = 356;
const ROADS_H = [255, 335, 415];
const ROADS_V = [600, 700, 800, 900, 1000, 1100];
const TRUCK_ROUTE = "M 600 415 L 1040 415 L 1040 255 L 600 255 Z";

export const JelpalaMatchingSection = ({
  onAnimationComplete,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
}) => {
  const { panTo } = useCanvas();
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);

  useEffect(() => {
    if (skipAnimation) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let p = 0; p <= MAX_PHASE; p++) {
      timers.push(setTimeout(() => setPhase(p), 300 + p * 500));
    }
    timers.push(setTimeout(() => onAnimationComplete?.(), 300 + MAX_PHASE * 500 + 700));
    return () => timers.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });
  const sf = (p: number) => ({ opacity: phase >= p ? 1 : 0, transition: "opacity 0.5s ease" });

  const STEP_META = [
    {
      color: "99,179,237",
      title: "Driver Location Update",
      desc: "The driver app updates its location to Redis GEO every 300ms in the background.",
      points: ["Background Location Update every 300ms", "Redis GEOADD stores driver coordinates", "Real-time geospatial index maintained"],
    },
    {
      color: "52,211,153",
      title: "User Matching Request",
      desc: "When a user requests a match, GEORADIUS searches nearby drivers. If no results are found, the search radius automatically expands.",
      points: ["GEORADIUS searches within initial radius", "No results → radius expands automatically", "Returns nearest available drivers sorted"],
    },
    {
      color: "251,146,60",
      title: "Notify Drivers",
      desc: "Events are broadcast via Redis Pub/Sub, and each ECS instance delivers real-time notifications to drivers through Socket.IO.",
      points: ["API publishes event to Redis channel", "All ECS instances receive via Pub/Sub", "Socket.IO emits to connected driver apps"],
    },
    {
      color: "167,139,250",
      title: "Matching Confirmation",
      desc: "Once a driver accepts, the match is confirmed and the user receives a driver assignment notification instantly.",
      points: ["First accepting driver wins the match", "Match status updated in RDS atomically", "User receives Driver Assigned notification"],
    },
  ] as const;

  return (
    <div style={{ width: W, height: H, position: "relative", color: "#fff" }} onPointerDown={(e) => e.stopPropagation()}>

      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 40, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Matching Architecture</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6, marginBottom: 0, maxWidth: 900, lineHeight: 1.55 }}>
          Redis GEO-based real-time driver matching — the full flow from location updates to match confirmation.
        </p>
      </div>

      {/* ── Step 박스 & 좌측 설명 패널 ── */}
      {STEP_META.map(({ color, title, desc, points }, i) => (
        <div key={i}>
          <div style={{ position: "absolute", left: 40, top: STEP_TOPS[i], width: 1520, height: STEP_H, border: `1px solid rgba(${color},0.22)`, borderRadius: 16, background: `rgba(${color},0.04)`, pointerEvents: "none", ...fade(i + 1) }} />
          <div style={{ position: "absolute", left: 490, top: STEP_TOPS[i] + 20, width: 1, height: STEP_H - 40, background: `rgba(${color},0.12)`, ...fade(i + 1) }} />
          <div style={{ position: "absolute", left: 70, top: STEP_TOPS[i] + 32, width: 380, ...fade(i + 1) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: `rgba(${color},0.15)`, border: `1px solid rgba(${color},0.35)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: `rgba(${color},1)` }}>{i + 1}</div>
              <span style={{ fontSize: 17, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{title}</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: "0 0 16px 0" }}>{desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {points.map((pt) => (
                <div key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: `rgba(${color},0.65)`, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* ── SVG 레이어 ── */}
      <svg style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          {([
            ["match-ah",        "rgba(255,255,255,0.28)"],
            ["match-ah-blue",   "rgba(99,179,237,0.75)"],
            ["match-ah-green",  "rgba(52,211,153,0.75)"],
            ["match-ah-orange", "rgba(251,146,60,0.75)"],
            ["match-ah-purple", "rgba(167,139,250,0.75)"],
          ] as const).map(([id, fill]) => (
            <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill={fill} />
            </marker>
          ))}
          {/* Map clip path */}
          <clipPath id="map1-clip">
            <rect x={MAP_X} y={MAP_Y} width={MAP_W} height={MAP_H} rx="12" />
          </clipPath>
          {/* Truck animation route */}
          <path id="truck-route" d={TRUCK_ROUTE} />
          {/* GEOADD data flow path */}
          <path id="geoadd-flow" d={`M 1152 ${CY(0)} L 1190 ${CY(0)}`} />
        </defs>

        {/* ══ Step 1: 지도 + 트럭 ══ */}

        {/* Map background */}
        <rect x={MAP_X} y={MAP_Y} width={MAP_W} height={MAP_H} rx="12" fill="#0d1520" style={sf(1)} />
        {/* Map subtle border glow */}
        <rect x={MAP_X} y={MAP_Y} width={MAP_W} height={MAP_H} rx="12" fill="none" stroke="rgba(99,179,237,0.18)" strokeWidth="1" style={sf(1)} />

        {/* Map contents (clipped) */}
        <g clipPath="url(#map1-clip)" style={sf(1)}>
          {/* Block fills (city blocks between roads) */}
          <rect x={MAP_X} y={MAP_Y} width={MAP_W} height={MAP_H} fill="#101926" />

          {/* Horizontal roads */}
          {ROADS_H.map(ry => (
            <rect key={ry} x={MAP_X} y={ry - 7} width={MAP_W} height="14" fill="#19263a" />
          ))}
          {/* Vertical roads */}
          {ROADS_V.map(rx => (
            <rect key={rx} x={rx - 7} y={MAP_Y} width="14" height={MAP_H} fill="#19263a" />
          ))}
          {/* Road center dashes */}
          {ROADS_H.map(ry => (
            <line key={ry} x1={MAP_X} y1={ry} x2={MAP_X + MAP_W} y2={ry} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="10 8" />
          ))}
          {ROADS_V.map(rx => (
            <line key={rx} x1={rx} y1={MAP_Y} x2={rx} y2={MAP_Y + MAP_H} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="10 8" />
          ))}

          {/* Static driver location pins */}
          {([[600, 255], [700, 415], [900, 255], [1000, 335]] as [number, number][]).map(([px, py], k) => (
            <g key={k}>
              <circle cx={px} cy={py} r="10" fill="rgba(99,179,237,0.12)" />
              <circle cx={px} cy={py} r="5" fill="rgba(99,179,237,0.72)" />
              <circle cx={px} cy={py} r="2" fill="rgba(255,255,255,0.9)" />
            </g>
          ))}

          {/* Active pulsing pin (currently updating driver) */}
          <circle cx="800" cy="335" r="5" fill="rgba(99,179,237,0.95)" />
          <circle cx="800" cy="335" r="2" fill="white" />
          <circle cx="800" cy="335" r="5" fill="none" stroke="rgba(99,179,237,0.75)" strokeWidth="1.5">
            <animate attributeName="r" values="6;22;6" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.75;0;0.75" dur="1.8s" repeatCount="indefinite" />
          </circle>

          {/* "Every 300ms" badge inside map */}
          <rect x="864" y={MAP_Y + 12} width="116" height="22" rx="5" fill="rgba(99,179,237,0.12)" stroke="rgba(99,179,237,0.28)" strokeWidth="1" />
          <text x="922" y={MAP_Y + 27} fontSize="11" fill="rgba(99,179,237,0.88)" textAnchor="middle" fontWeight="600">Every 300ms</text>

          {/* Moving truck (top-down view) */}
          <g>
            {/* Truck body */}
            <rect x="-14" y="-7" width="24" height="14" rx="3" fill="rgba(99,179,237,0.92)" />
            {/* Cab */}
            <rect x="10" y="-5" width="8" height="10" rx="2" fill="rgba(50,100,210,0.95)" />
            {/* Headlights */}
            <rect x="17" y="-4" width="2" height="3" rx="0.5" fill="rgba(255,255,190,0.85)" />
            <rect x="17" y="2" width="2" height="3" rx="0.5" fill="rgba(255,255,190,0.85)" />
            {/* Wheel hints */}
            <rect x="-12" y="-8" width="5" height="3" rx="1" fill="rgba(5,10,20,0.7)" />
            <rect x="-12" y="5" width="5" height="3" rx="1" fill="rgba(5,10,20,0.7)" />
            <rect x="4" y="-8" width="5" height="3" rx="1" fill="rgba(5,10,20,0.7)" />
            <rect x="4" y="5" width="5" height="3" rx="1" fill="rgba(5,10,20,0.7)" />
            <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
              <mpath href="#truck-route" />
            </animateMotion>
          </g>
        </g>

        {/* Arrow: map → Redis GEO */}
        <path d={`M 1152 ${CY(0)} L 1190 ${CY(0)}`}
          stroke="rgba(99,179,237,0.4)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        <text x="1171" y={CY(0) - 10} fontSize="12" fill="rgba(99,179,237,0.8)" textAnchor="middle" style={sf(1)}>GEOADD</text>

        {/* Data pulse on arrow */}
        <circle cx="0" cy="0" r="3.5" fill="rgba(99,179,237,0.9)" style={sf(1)}>
          <animateMotion dur="0.9s" repeatCount="indefinite">
            <mpath href="#geoadd-flow" />
          </animateMotion>
        </circle>

        {/* Step 1 → Step 2 */}
        <path d={`M 800 ${STEP_TOPS[0] + STEP_H + 4} L 800 ${STEP_TOPS[1] - 4}`}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)" style={sf(2)} />
        <text x="820" y={STEP_TOPS[0] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.22)" style={sf(2)}>Continuous Update</text>

        {/* ── Step 2: User → Expanding Radius ── */}
        <path d={`M ${570 + R} ${CY(1)} C 730 ${CY(1)}, 900 ${CY(1)}, ${1060 - 58} ${CY(1)}`}
          stroke="rgba(52,211,153,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-green)" style={sf(2)} />
        <text x={(570 + R + 1002) / 2} y={CY(1) - 12} fontSize="12" fill="rgba(52,211,153,0.75)" textAnchor="middle" style={sf(2)}>Match Request</text>
        <circle cx="1060" cy={CY(1)} r="150" fill="rgba(52,211,153,0.025)" stroke="rgba(52,211,153,0.15)" strokeWidth="1" strokeDasharray="5 3" style={sf(2)} />
        <circle cx="1060" cy={CY(1)} r="100" fill="rgba(52,211,153,0.055)" stroke="rgba(52,211,153,0.28)" strokeWidth="1.5" strokeDasharray="5 2" style={sf(2)} />
        <circle cx="1060" cy={CY(1)} r="55" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.48)" strokeWidth="1.5" style={sf(2)} />
        <circle cx="1060" cy={CY(1)} r="6" fill="rgba(52,211,153,0.9)" style={sf(2)} />
        <text x="1060" y={CY(1) + 4} fontSize="10" fill="rgba(52,211,153,0.85)" textAnchor="middle" fontWeight="700" style={sf(2)}>GEORADIUS</text>
        <text x={1060 + 58} y={CY(1) - 7} fontSize="10" fill="rgba(52,211,153,0.7)" style={sf(2)}>40km</text>
        <text x={1060 + 103} y={CY(1) - 7} fontSize="10" fill="rgba(52,211,153,0.5)" style={sf(2)}>75km</text>
        <text x="1060" y={CY(1) + 164} fontSize="11" fill="rgba(52,211,153,0.4)" textAnchor="middle" style={sf(2)}>No results → expand radius</text>
        {([[1030, CY(1) - 20], [1083, CY(1) + 24], [1143, CY(1) - 14], [1152, CY(1) + 26]] as [number, number][]).map(([dx, dy], k) => (
          <g key={k} style={sf(2)}>
            <circle cx={dx} cy={dy} r="7" fill="rgba(52,211,153,0.8)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
            <text x={dx} y={dy + 4} fontSize="8" fill="rgba(0,0,0,0.75)" textAnchor="middle" fontWeight="700">D</text>
          </g>
        ))}

        {/* Step 2 → Step 3 */}
        <path d={`M 800 ${STEP_TOPS[1] + STEP_H + 4} L 800 ${STEP_TOPS[2] - 4}`}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)" style={sf(3)} />
        <text x="820" y={STEP_TOPS[1] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.22)" style={sf(3)}>Drivers Found</text>

        {/* ── Step 3: fan-out ── */}
        {([CY(2) - 110, CY(2), CY(2) + 110] as number[]).map((dy, k) => (
          <path key={k}
            d={`M 700 ${CY(2)} C 900 ${CY(2)}, 1100 ${dy}, ${1290 - R} ${dy}`}
            stroke="rgba(251,146,60,0.4)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-orange)" style={sf(3)} />
        ))}
        <text x={(700 + 1290 - R) / 2} y={CY(2) - 130} fontSize="12" fill="rgba(251,146,60,0.75)" textAnchor="middle" style={sf(3)}>Socket.IO Emit</text>
        {([CY(2) - 110, CY(2), CY(2) + 110] as number[]).map((dy, k) => (
          <g key={k} style={sf(3)}>
            <circle cx={1290 + R + 9} cy={dy - R + 5} r="10" fill="rgba(251,146,60,0.9)" />
            <text x={1290 + R + 9} y={dy - R + 9} fontSize="10" fill="#000" textAnchor="middle" fontWeight="800">!</text>
          </g>
        ))}

        {/* Step 3 → Step 4 */}
        <path d={`M 800 ${STEP_TOPS[2] + STEP_H + 4} L 800 ${STEP_TOPS[3] - 4}`}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)" style={sf(4)} />
        <text x="820" y={STEP_TOPS[2] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.22)" style={sf(4)}>Driver Accepts</text>

        {/* ── Step 4: Driver → API → User ── */}
        <path d={`M ${570 + R} ${CY(3)} C 710 ${CY(3)}, 840 ${CY(3)}, ${940 - R} ${CY(3)}`}
          stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-purple)" style={sf(4)} />
        <text x={(570 + R + 940 - R) / 2} y={CY(3) - 12} fontSize="12" fill="rgba(167,139,250,0.75)" textAnchor="middle" style={sf(4)}>Accept</text>
        <path d={`M ${940 + R} ${CY(3)} C 1080 ${CY(3)}, 1200 ${CY(3)}, ${1310 - R} ${CY(3)}`}
          stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-purple)" style={sf(4)} />
        <text x={(940 + R + 1310 - R) / 2} y={CY(3) - 12} fontSize="12" fill="rgba(167,139,250,0.75)" textAnchor="middle" style={sf(4)}>Confirmed</text>
        <rect x={940 - 48} y={CY(3) - 55} width={96} height={22} rx="6" fill="rgba(167,139,250,0.18)" stroke="rgba(167,139,250,0.38)" strokeWidth="1" style={sf(4)} />
        <text x={940} y={CY(3) - 40} fontSize="11" fill="rgba(167,139,250,0.9)" textAnchor="middle" fontWeight="600" style={sf(4)}>Match Success</text>
      </svg>

      {/* ── DOM 아이콘 ── */}

      {/* Step 1: Redis GEO box (map 우측) */}
      <div style={{ position: "absolute", left: 1193, top: CY(0) - 65, width: 200, height: 130, border: "1px solid rgba(99,179,237,0.3)", borderRadius: 10, background: "rgba(99,179,237,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, ...fade(1) }}>
        <Image src="/icons/redis_icon.png" width={40} height={40} alt="Redis GEO" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>Redis GEO</span>
        <span style={{ fontSize: 10, color: "rgba(99,179,237,0.85)", border: "1px solid rgba(99,179,237,0.3)", borderRadius: 3, padding: "2px 7px" }}>Geospatial Cluster</span>
      </div>

      {/* Step 2: User App */}
      <div style={{ position: "absolute", left: 570 - R, top: CY(1) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(2) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="User App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>User App</span>
      </div>

      {/* Step 3: ECS + Redis Pub/Sub */}
      <div style={{ position: "absolute", left: 510, top: CY(2) - 70, width: 190, height: 140, border: "1px solid rgba(251,146,60,0.25)", borderRadius: 10, background: "rgba(251,146,60,0.07)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, ...fade(3) }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Image src="/icons/spring_java_icon.png" width={34} height={34} alt="ECS" style={{ objectFit: "contain" }} />
          <Image src="/icons/redis_icon.png" width={34} height={34} alt="Redis" style={{ objectFit: "contain" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>ECS + Redis</span>
        <span style={{ fontSize: 10, color: "rgba(251,146,60,0.85)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 3, padding: "2px 6px" }}>Pub/Sub Broadcast</span>
      </div>
      {([CY(2) - 110, CY(2), CY(2) + 110] as number[]).map((dy, k) => (
        <div key={k} style={{ position: "absolute", left: 1290 - R, top: dy - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(3) }}>
          <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt={`Driver ${k + 1}`} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", marginTop: 4 }}>Driver {k + 1}</span>
        </div>
      ))}

      {/* Step 4 */}
      <div style={{ position: "absolute", left: 570 - R, top: CY(3) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(4) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="Driver App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>Driver App</span>
        <span style={{ fontSize: 10, color: "rgba(167,139,250,0.75)", whiteSpace: "nowrap", marginTop: 2 }}>Accepts</span>
      </div>
      <div style={{ position: "absolute", left: 940 - R, top: CY(3) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(4) }}>
        <Image src="/icons/spring_java_icon.png" width={ICON} height={ICON} alt="API Server" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>API Server</span>
      </div>
      <div style={{ position: "absolute", left: 1310 - R, top: CY(3) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(4) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="User App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>User App</span>
        <span style={{ fontSize: 10, color: "rgba(167,139,250,0.75)", whiteSpace: "nowrap", marginTop: 2 }}>Driver Assigned</span>
      </div>

      {/* ── Key Points ── */}
      <div style={{ position: "absolute", left: 40, top: STEP_TOPS[3] + STEP_H + 60, ...fade(5) }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.55)", marginBottom: 18, letterSpacing: "0.05em" }}>KEY POINTS</div>
        <div style={{ display: "flex", gap: 24 }}>
          {([
            { color: "99,179,237",  title: "Real-time Location",    desc: "Background updates every 300ms" },
            { color: "52,211,153",  title: "Redis GEO Search",      desc: "GEORADIUS with expanding radius" },
            { color: "251,146,60",  title: "Instant Notification",  desc: "Pub/Sub + Socket.IO broadcast" },
            { color: "167,139,250", title: "Fast Matching",         desc: "< 100ms end-to-end response" },
          ] as const).map(({ color, title, desc }) => (
            <div key={title} style={{ flex: 1, padding: "18px 22px", border: `1px solid rgba(${color},0.2)`, borderRadius: 12, background: `rgba(${color},0.05)` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: `rgba(${color},1)`, marginBottom: 7 }}>{title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 뒤로가기 버튼 ── */}
      <button
        onClick={() => panTo(-1544, -1071)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
          width: 48, height: 48, borderRadius: "50%",
          background: "#ffffff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 3V15M9 15L3 9M9 15L15 9" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
