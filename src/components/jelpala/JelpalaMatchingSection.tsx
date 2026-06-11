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
      desc: "드라이버 앱이 백그라운드에서 300초마다 현재 위치를 Redis GEO에 저장합니다.",
      points: ["Background Location Update every 300ms", "Redis GEOADD stores driver coordinates", "Real-time geospatial index maintained"],
    },
    {
      color: "52,211,153",
      title: "User Matching Request",
      desc: "사용자 요청 시 GEORADIUS로 반경 내 드라이버를 검색합니다. 결과가 없으면 반경을 확장합니다.",
      points: ["GEORADIUS searches within initial radius", "No results → radius expands automatically", "Returns nearest available drivers sorted"],
    },
    {
      color: "251,146,60",
      title: "Notify Drivers",
      desc: "Redis Pub/Sub으로 이벤트를 브로드캐스트하고 ECS 인스턴스가 Socket.IO로 드라이버에게 전달합니다.",
      points: ["API publishes event to Redis channel", "All ECS instances receive via Pub/Sub", "Socket.IO emits to connected driver apps"],
    },
    {
      color: "167,139,250",
      title: "Matching Confirmation",
      desc: "드라이버가 수락하면 매칭이 확정되고 사용자에게 드라이버 배정 알림이 전달됩니다.",
      points: ["First accepting driver wins the match", "Match status updated in RDS atomically", "User receives Driver Assigned notification"],
    },
  ] as const;

  return (
    <div style={{ width: W, height: H, position: "relative", color: "#fff" }} onPointerDown={(e) => e.stopPropagation()}>

      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 40, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Matching Architecture</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6, marginBottom: 0, maxWidth: 900, lineHeight: 1.55 }}>
          Redis GEO 기반 실시간 드라이버 매칭 — 위치 업데이트부터 매칭 확정까지의 전체 플로우
        </p>
      </div>

      {/* ── Step 박스 & 좌측 설명 패널 ── */}
      {STEP_META.map(({ color, title, desc, points }, i) => (
        <div key={i}>
          {/* 카드 테두리 */}
          <div style={{ position: "absolute", left: 40, top: STEP_TOPS[i], width: 1520, height: STEP_H, border: `1px solid rgba(${color},0.22)`, borderRadius: 16, background: `rgba(${color},0.04)`, pointerEvents: "none", ...fade(i + 1) }} />
          {/* 좌/우 분리선 */}
          <div style={{ position: "absolute", left: 490, top: STEP_TOPS[i] + 20, width: 1, height: STEP_H - 40, background: `rgba(${color},0.12)`, ...fade(i + 1) }} />
          {/* 좌측 설명 */}
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
          {([["match-ah","rgba(255,255,255,0.28)"],["match-ah-blue","rgba(99,179,237,0.75)"],["match-ah-green","rgba(52,211,153,0.75)"],["match-ah-orange","rgba(251,146,60,0.75)"],["match-ah-purple","rgba(167,139,250,0.75)"]] as const).map(([id, fill]) => (
            <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill={fill} />
            </marker>
          ))}
        </defs>

        {/* ── Step 1: Driver → Redis GEO ── */}
        <path d={`M ${590 + R} ${CY(0)} C 760 ${CY(0)}, 880 ${CY(0)}, 950 ${CY(0)}`}
          stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        <text x={(590 + R + 950) / 2} y={CY(0) - 13} fontSize="12" fill="rgba(99,179,237,0.8)" textAnchor="middle" style={sf(1)}>GEOADD</text>
        {/* Every 300s 배지 */}
        <rect x={565} y={CY(0) - 50} width={92} height={22} rx="6" fill="rgba(99,179,237,0.14)" stroke="rgba(99,179,237,0.3)" strokeWidth="1" style={sf(1)} />
        <text x={611} y={CY(0) - 35} fontSize="11" fill="rgba(99,179,237,0.9)" textAnchor="middle" fontWeight="600" style={sf(1)}>Every 300s</text>

        {/* Step 1 → Step 2 */}
        <path d={`M 800 ${STEP_TOPS[0] + STEP_H + 4} L 800 ${STEP_TOPS[1] - 4}`}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)" style={sf(2)} />
        <text x="820" y={STEP_TOPS[0] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.22)" style={sf(2)}>Continuous Update</text>

        {/* ── Step 2: User → Expanding Radius ── */}
        <path d={`M ${570 + R} ${CY(1)} C 730 ${CY(1)}, 900 ${CY(1)}, ${1060 - 58} ${CY(1)}`}
          stroke="rgba(52,211,153,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-green)" style={sf(2)} />
        <text x={(570 + R + 1002) / 2} y={CY(1) - 12} fontSize="12" fill="rgba(52,211,153,0.75)" textAnchor="middle" style={sf(2)}>Match Request</text>
        {/* 동심원 */}
        <circle cx="1060" cy={CY(1)} r="150" fill="rgba(52,211,153,0.025)" stroke="rgba(52,211,153,0.15)" strokeWidth="1" strokeDasharray="5 3" style={sf(2)} />
        <circle cx="1060" cy={CY(1)} r="100" fill="rgba(52,211,153,0.055)" stroke="rgba(52,211,153,0.28)" strokeWidth="1.5" strokeDasharray="5 2" style={sf(2)} />
        <circle cx="1060" cy={CY(1)} r="55" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.48)" strokeWidth="1.5" style={sf(2)} />
        <circle cx="1060" cy={CY(1)} r="6" fill="rgba(52,211,153,0.9)" style={sf(2)} />
        <text x="1060" y={CY(1) + 4} fontSize="10" fill="rgba(52,211,153,0.85)" textAnchor="middle" fontWeight="700" style={sf(2)}>GEORADIUS</text>
        <text x={1060 + 58} y={CY(1) - 7} fontSize="10" fill="rgba(52,211,153,0.7)" style={sf(2)}>40km</text>
        <text x={1060 + 103} y={CY(1) - 7} fontSize="10" fill="rgba(52,211,153,0.5)" style={sf(2)}>75km</text>
        <text x="1060" y={CY(1) + 164} fontSize="11" fill="rgba(52,211,153,0.4)" textAnchor="middle" style={sf(2)}>No results → expand radius</text>
        {/* 드라이버 점 */}
        {([[1030, CY(1) - 20], [1083, CY(1) + 24], [1143, CY(1) - 14], [1152, CY(1) + 26]] as [number,number][]).map(([dx, dy], k) => (
          <g key={k} style={sf(2)}>
            <circle cx={dx} cy={dy} r="7" fill="rgba(52,211,153,0.8)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
            <text x={dx} y={dy + 4} fontSize="8" fill="rgba(0,0,0,0.75)" textAnchor="middle" fontWeight="700">D</text>
          </g>
        ))}

        {/* Step 2 → Step 3 */}
        <path d={`M 800 ${STEP_TOPS[1] + STEP_H + 4} L 800 ${STEP_TOPS[2] - 4}`}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)" style={sf(3)} />
        <text x="820" y={STEP_TOPS[1] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.22)" style={sf(3)}>Drivers Found</text>

        {/* ── Step 3: ECS/Redis → 드라이버 3명 fan-out ── */}
        {([CY(2) - 110, CY(2), CY(2) + 110] as number[]).map((dy, k) => (
          <path key={k}
            d={`M 700 ${CY(2)} C 900 ${CY(2)}, 1100 ${dy}, ${1290 - R} ${dy}`}
            stroke="rgba(251,146,60,0.4)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-orange)" style={sf(3)} />
        ))}
        <text x={(700 + 1290 - R) / 2} y={CY(2) - 130} fontSize="12" fill="rgba(251,146,60,0.75)" textAnchor="middle" style={sf(3)}>Socket.IO Emit</text>
        {/* 알림 배지 */}
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
        {/* Match Success 배지 */}
        <rect x={940 - 48} y={CY(3) - 55} width={96} height={22} rx="6" fill="rgba(167,139,250,0.18)" stroke="rgba(167,139,250,0.38)" strokeWidth="1" style={sf(4)} />
        <text x={940} y={CY(3) - 40} fontSize="11" fill="rgba(167,139,250,0.9)" textAnchor="middle" fontWeight="600" style={sf(4)}>Match Success</text>
      </svg>

      {/* ── DOM 아이콘 ── */}

      {/* Step 1 */}
      <div style={{ position: "absolute", left: 590 - R, top: CY(0) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="Driver App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>Driver App</span>
      </div>
      <div style={{ position: "absolute", left: 950, top: CY(0) - 65, width: 200, height: 130, border: "1px solid rgba(99,179,237,0.3)", borderRadius: 10, background: "rgba(99,179,237,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, ...fade(1) }}>
        <Image src="/icons/redis_icon.png" width={40} height={40} alt="Redis GEO" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>Redis GEO</span>
        <span style={{ fontSize: 10, color: "rgba(99,179,237,0.85)", border: "1px solid rgba(99,179,237,0.3)", borderRadius: 3, padding: "2px 7px" }}>Geospatial Cluster</span>
      </div>

      {/* Step 2 */}
      <div style={{ position: "absolute", left: 570 - R, top: CY(1) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(2) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="User App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>User App</span>
      </div>

      {/* Step 3 */}
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
            { color: "52,211,153",  title: "Redis GEO Search",     desc: "GEORADIUS with expanding radius" },
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
