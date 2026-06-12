"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1600;
const H = 2150;
const MAX_PHASE = 4;
const ICON = 52;
const R = ICON / 2;
const STEP_TOPS = [160, 650, 1140, 1630] as const;
const STEP_H = 420;
const CY = (i: number) => STEP_TOPS[i] + Math.floor(STEP_H / 2);

/* ── 트럭 아이콘 (측면 뷰) ── */
const Truck = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="-32" y="-13" width="26" height="19" rx="3" fill="#15803d" />
    <rect x="-6" y="-11" width="20" height="16" rx="3" fill="#22c55e" />
    <path d="M -4 -9 L 10 -9 L 12 -5 L -4 -5 Z" fill="rgba(200,240,255,0.38)" />
    <circle cx="13" cy="-3" r="2" fill="rgba(255,255,190,0.85)" />
    <rect x="-28" y="5" width="40" height="2.5" rx="1" fill="#0a1020" />
    <circle cx="-17" cy="8" r="6" fill="#0a1020" stroke="#4ade80" strokeWidth="1.5" />
    <circle cx="-17" cy="8" r="2.5" fill="#1a2a1a" />
    <circle cx="7" cy="8" r="6" fill="#0a1020" stroke="#4ade80" strokeWidth="1.5" />
    <circle cx="7" cy="8" r="2.5" fill="#1a2a1a" />
  </g>
);

/* ── 위치 핀 (teardrop) ── */
const Pin = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M 0 2 C -8 -4, -11 -11, -11 -17 A 11 11 0 1 1 11 -17 C 11 -11, 8 -4, 0 2 Z" fill="#22c55e" />
    <circle cx="0" cy="-17" r="5" fill="white" />
  </g>
);

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

  /* 트럭·핀 위치 (루트 경유점과 일치) */
  const TRUCKS = [[660, 460], [820, 358], [1002, 254]] as const;

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
          {/* 루트 끝 화살표 */}
          <marker id="route-end" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L0,8 L8,4 z" fill="#22c55e" />
          </marker>
          {/* 지도 클립 */}
          <clipPath id="map1-clip">
            <rect x="510" y="185" width="580" height="350" rx="12" />
          </clipPath>
        </defs>

        {/* ══ Step 1: 지도 + 루트 + 트럭 ══ */}

        {/* 지도 배경 */}
        <rect x="510" y="185" width="580" height="350" rx="12" fill="#0d1824" style={sf(1)} />
        <rect x="510" y="185" width="580" height="350" rx="12" fill="none" stroke="rgba(34,197,94,0.18)" strokeWidth="1" style={sf(1)} />

        {/* 지도 내용 (클립 적용) */}
        <g clipPath="url(#map1-clip)" style={sf(1)}>

          {/* 등각 도시 그리드 — 방향 1 (╲) */}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`g1-${i}`}
              x1={390 + i * 55} y1={185}
              x2={390 + i * 55 + 130} y2={535}
              stroke="rgba(255,255,255,0.038)" strokeWidth="1.2" />
          ))}
          {/* 등각 도시 그리드 — 방향 2 (╱) */}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`g2-${i}`}
              x1={390 + i * 55} y1={185}
              x2={390 + i * 55 - 130} y2={535}
              stroke="rgba(255,255,255,0.038)" strokeWidth="1.2" />
          ))}

          {/* 루트 경로 */}
          <path
            d="M 525 508 C 590 490, 630 475, 660 460 C 700 440, 760 395, 820 358 C 862 336, 960 271, 1002 254 C 1030 242, 1058 229, 1078 220"
            stroke="#22c55e" strokeWidth="3.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            markerEnd="url(#route-end)"
          />

          {/* 루트 위 점(경유 기록) */}
          {([
            [580, 492], [620, 478],
            [714, 432], [768, 402],
            [884, 325], [944, 290],
            [1040, 242],
          ] as [number, number][]).map(([dx, dy], k) => (
            <circle key={k} cx={dx} cy={dy} r="4" fill="#22c55e" opacity="0.65" />
          ))}

          {/* 핀 (트럭보다 먼저 렌더해서 트럭이 위에 오도록) */}
          {TRUCKS.map(([tx, ty], k) => (
            <Pin key={k} x={tx} y={ty - 14} />
          ))}

          {/* 트럭 3대 */}
          {TRUCKS.map(([tx, ty], k) => (
            <Truck key={k} x={tx} y={ty} />
          ))}

          {/* "Every 300ms" 배지 */}
          <rect x="520" y="194" width="118" height="22" rx="5"
            fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.28)" strokeWidth="1" />
          <text x="579" y="209" fontSize="11" fill="rgba(34,197,94,0.9)" textAnchor="middle" fontWeight="600">Every 300ms</text>

        </g>{/* 클립 끝 */}

        {/* GEOADD 화살표: 지도 → Redis GEO */}
        <path d={`M 1092 ${CY(0)} L 1148 ${CY(0)}`}
          stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        <text x="1120" y={CY(0) - 10} fontSize="12" fill="rgba(99,179,237,0.8)" textAnchor="middle" style={sf(1)}>GEOADD</text>

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

      {/* Step 1: Redis GEO (지도 오른쪽) */}
      <div style={{ position: "absolute", left: 1152, top: CY(0) - 65, width: 200, height: 130, border: "1px solid rgba(99,179,237,0.3)", borderRadius: 10, background: "rgba(99,179,237,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, ...fade(1) }}>
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
