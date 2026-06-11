"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1600;
const H = 2400;
const MAX_PHASE = 5;
const ICON = 56;
const R = ICON / 2;

const STEP_TOPS = [160, 610, 1060, 1510] as const;
const STEP_H = 370;

const CY = (i: number) => STEP_TOPS[i] + 230;
const NX = [200, 800, 1400];

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

  const STEP_CONFIGS = [
    { color: "99,179,237",  title: "Driver Location Update",  desc: "드라이버 앱이 300초마다 백그라운드에서 현재 위치를 Redis GEO에 저장합니다." },
    { color: "52,211,153",  title: "User Matching Request",   desc: "사용자 매칭 요청 시 GEORADIUS로 근처 드라이버를 검색합니다. 결과가 없으면 반경을 확장합니다." },
    { color: "251,146,60",  title: "Notify Drivers",          desc: "Redis Pub/Sub으로 매칭된 드라이버들에게 Socket.IO를 통해 실시간 알림을 전송합니다." },
    { color: "167,139,250", title: "Matching Confirmation",   desc: "드라이버가 수락하면 매칭이 확정되고 사용자에게 드라이버 배정 알림이 전달됩니다." },
  ] as const;

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 40, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Matching Architecture
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6, marginBottom: 0, maxWidth: 800, lineHeight: 1.55 }}>
          Redis GEO 기반 실시간 드라이버 매칭 — 위치 업데이트부터 매칭 확정까지의 전체 흐름
        </p>
      </div>

      {/* ── 스텝 박스 + 헤더 ── */}
      {STEP_CONFIGS.map(({ color, title, desc }, i) => (
        <div key={i}>
          <div style={{
            position: "absolute", left: 40, top: STEP_TOPS[i], width: 1520, height: STEP_H,
            border: `1px solid rgba(${color},0.25)`, borderRadius: 16,
            background: `rgba(${color},0.04)`, pointerEvents: "none",
            ...fade(i + 1),
          }} />
          <div style={{ position: "absolute", left: 80, top: STEP_TOPS[i] + 28, display: "flex", alignItems: "center", gap: 14, ...fade(i + 1) }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: `rgba(${color},0.15)`, border: `1px solid rgba(${color},0.35)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: `rgba(${color},1)`,
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>{title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{desc}</div>
            </div>
          </div>
        </div>
      ))}

      {/* ── SVG 화살표 ── */}
      <svg style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          {[
            ["match-ah",        "rgba(255,255,255,0.28)"],
            ["match-ah-blue",   "rgba(99,179,237,0.75)"],
            ["match-ah-green",  "rgba(52,211,153,0.75)"],
            ["match-ah-orange", "rgba(251,146,60,0.75)"],
            ["match-ah-purple", "rgba(167,139,250,0.75)"],
          ].map(([id, fill]) => (
            <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill={fill} />
            </marker>
          ))}
        </defs>

        {/* Step 1: Driver → API → Redis GEO */}
        <path d={`M ${NX[0]+R} ${CY(0)} C ${NX[0]+150} ${CY(0)}, ${NX[1]-150} ${CY(0)}, ${NX[1]-R} ${CY(0)}`}
          stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <path d={`M ${NX[1]+R} ${CY(0)} C ${NX[1]+150} ${CY(0)}, 1200 ${CY(0)}, ${NX[2]-78} ${CY(0)}`}
          stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="500" y={CY(0) - 14} fontSize="12" fill="rgba(99,179,237,0.9)" textAnchor="middle" style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease" }}>Every 300s</text>
        <text x="1100" y={CY(0) - 14} fontSize="12" fill="rgba(99,179,237,0.9)" textAnchor="middle" style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease" }}>GEOADD</text>

        {/* Step 1 → Step 2 */}
        <path d={`M 800 ${STEP_TOPS[0] + STEP_H + 5} L 800 ${STEP_TOPS[1] - 5}`}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)"
          style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="820" y={STEP_TOPS[0] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.25)" style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}>Continuous Update</text>

        {/* Step 2: User → API → Redis GEO */}
        <path d={`M ${NX[0]+R} ${CY(1)} C ${NX[0]+150} ${CY(1)}, ${NX[1]-150} ${CY(1)}, ${NX[1]-R} ${CY(1)}`}
          stroke="rgba(52,211,153,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-green)"
          style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <path d={`M ${NX[1]+R} ${CY(1)} C ${NX[1]+150} ${CY(1)}, 1200 ${CY(1)}, ${NX[2]-78} ${CY(1)}`}
          stroke="rgba(52,211,153,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-green)"
          style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="500" y={CY(1) - 14} fontSize="12" fill="rgba(52,211,153,0.9)" textAnchor="middle" style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}>Match Request</text>
        <text x="1100" y={CY(1) - 14} fontSize="12" fill="rgba(52,211,153,0.9)" textAnchor="middle" style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}>GEORADIUS</text>

        {/* Step 2 → Step 3 */}
        <path d={`M 800 ${STEP_TOPS[1] + STEP_H + 5} L 800 ${STEP_TOPS[2] - 5}`}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="820" y={STEP_TOPS[1] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.25)" style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}>Drivers Found</text>

        {/* Step 3: Redis Pub/Sub → ECS Box → Driver Apps */}
        <path d={`M 278 ${CY(2)} C 420 ${CY(2)}, 560 ${CY(2)}, 680 ${CY(2)}`}
          stroke="rgba(251,146,60,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-orange)"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <path d={`M 920 ${CY(2)} C 1040 ${CY(2)}, 1160 ${CY(2)}, 1300 ${CY(2)}`}
          stroke="rgba(251,146,60,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-orange)"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="479" y={CY(2) - 14} fontSize="12" fill="rgba(251,146,60,0.9)" textAnchor="middle" style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}>Pub/Sub</text>
        <text x="1110" y={CY(2) - 14} fontSize="12" fill="rgba(251,146,60,0.9)" textAnchor="middle" style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}>Socket.IO Emit</text>

        {/* Step 3 → Step 4 */}
        <path d={`M 800 ${STEP_TOPS[2] + STEP_H + 5} L 800 ${STEP_TOPS[3] - 5}`}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="820" y={STEP_TOPS[2] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.25)" style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }}>Driver Accepts</text>

        {/* Step 4: Driver → API → User */}
        <path d={`M ${NX[0]+R} ${CY(3)} C ${NX[0]+150} ${CY(3)}, ${NX[1]-150} ${CY(3)}, ${NX[1]-R} ${CY(3)}`}
          stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-purple)"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <path d={`M ${NX[1]+R} ${CY(3)} C ${NX[1]+150} ${CY(3)}, ${NX[2]-150} ${CY(3)}, ${NX[2]-R} ${CY(3)}`}
          stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-purple)"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="500" y={CY(3) - 14} fontSize="12" fill="rgba(167,139,250,0.9)" textAnchor="middle" style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }}>Accept</text>
        <text x="1100" y={CY(3) - 14} fontSize="12" fill="rgba(167,139,250,0.9)" textAnchor="middle" style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }}>Match Success</text>
      </svg>

      {/* ── Step 1 노드 ── */}
      <div style={{ position: "absolute", left: NX[0]-R, top: CY(0)-R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="Driver App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", marginTop: 6 }}>Driver App</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", marginTop: 2 }}>iOS / Android</span>
      </div>
      <div style={{ position: "absolute", left: NX[1]-R, top: CY(0)-R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
        <Image src="/icons/spring_java_icon.png" width={ICON} height={ICON} alt="API Server" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", marginTop: 6 }}>API Server</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", marginTop: 2 }}>Spring Boot</span>
      </div>
      {/* Redis GEO 박스 - Step 1 */}
      <div style={{
        position: "absolute", left: NX[2]-78, top: CY(0)-55, width: 156, height: 120,
        border: "1px solid rgba(99,179,237,0.3)", borderRadius: 10, background: "rgba(99,179,237,0.07)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        ...fade(1),
      }}>
        <Image src="/icons/redis_icon.png" width={40} height={40} alt="Redis GEO" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Redis GEO</span>
        <span style={{ fontSize: 10, color: "rgba(99,179,237,0.85)", border: "1px solid rgba(99,179,237,0.3)", borderRadius: 3, padding: "1px 6px" }}>Geospatial Cluster</span>
      </div>

      {/* ── Step 2 노드 ── */}
      <div style={{ position: "absolute", left: NX[0]-R, top: CY(1)-R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(2) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="User App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", marginTop: 6 }}>User App</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", marginTop: 2 }}>iOS / Android</span>
      </div>
      <div style={{ position: "absolute", left: NX[1]-R, top: CY(1)-R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(2) }}>
        <Image src="/icons/spring_java_icon.png" width={ICON} height={ICON} alt="API Server" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", marginTop: 6 }}>API Server</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", marginTop: 2 }}>Spring Boot</span>
      </div>
      {/* Redis GEO 박스 - Step 2 (Expanding Radius) */}
      <div style={{
        position: "absolute", left: NX[2]-78, top: CY(1)-70, width: 156, height: 150,
        border: "1px solid rgba(52,211,153,0.3)", borderRadius: 10, background: "rgba(52,211,153,0.07)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
        ...fade(2),
      }}>
        <Image src="/icons/redis_icon.png" width={36} height={36} alt="Redis GEO" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Redis GEO</span>
        <span style={{ fontSize: 10, color: "rgba(52,211,153,0.85)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 3, padding: "1px 6px" }}>GEORADIUS</span>
        <svg width="70" height="34" viewBox="0 0 70 34">
          <circle cx="35" cy="17" r="5" fill="none" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" />
          <circle cx="35" cy="17" r="11" fill="none" stroke="rgba(52,211,153,0.4)" strokeWidth="1" />
          <circle cx="35" cy="17" r="19" fill="none" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
          <circle cx="35" cy="17" r="2.5" fill="rgba(52,211,153,0.9)" />
        </svg>
        <span style={{ fontSize: 9, color: "rgba(52,211,153,0.6)" }}>Expanding Radius</span>
      </div>

      {/* ── Step 3 노드 ── */}
      {/* Redis Pub/Sub 박스 */}
      <div style={{
        position: "absolute", left: NX[0]-78, top: CY(2)-55, width: 156, height: 120,
        border: "1px solid rgba(251,146,60,0.3)", borderRadius: 10, background: "rgba(251,146,60,0.07)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        ...fade(3),
      }}>
        <Image src="/icons/redis_icon.png" width={40} height={40} alt="Redis" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Redis</span>
        <span style={{ fontSize: 10, color: "rgba(251,146,60,0.85)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 3, padding: "1px 6px" }}>Pub/Sub Broker</span>
      </div>
      {/* ECS Instances 그룹 박스 */}
      <div style={{
        position: "absolute", left: NX[1]-120, top: CY(2)-68, width: 240, height: 148,
        border: "1px solid rgba(255,153,0,0.2)", borderRadius: 10, background: "rgba(255,153,0,0.04)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
        ...fade(3),
      }}>
        <div style={{ position: "absolute", top: -11, left: 10, background: "#0f1117", padding: "0 6px", fontSize: 10, fontWeight: 600, color: "rgba(255,153,0,0.5)" }}>ECS Instances</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {["1", "2", "N"].map((num) => (
            <div key={num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <Image src="/icons/spring_java_icon.png" width={34} height={34} alt={`ECS ${num}`} style={{ objectFit: "contain" }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{num}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>Socket.IO Server</span>
      </div>
      {/* Matched Drivers 그룹 박스 */}
      <div style={{
        position: "absolute", left: NX[2]-100, top: CY(2)-55, width: 200, height: 120,
        border: "1px solid rgba(251,146,60,0.2)", borderRadius: 10, background: "rgba(251,146,60,0.04)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        ...fade(3),
      }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {["Driver 1", "Driver 2"].map((label) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <Image src="/icons/client_icon.png" width={34} height={34} alt={label} style={{ objectFit: "contain" }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>Matched Drivers</span>
      </div>

      {/* ── Step 4 노드 ── */}
      <div style={{ position: "absolute", left: NX[0]-R, top: CY(3)-R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(4) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="Driver App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", marginTop: 6 }}>Driver App</span>
        <span style={{ fontSize: 10, color: "rgba(167,139,250,0.8)", whiteSpace: "nowrap", marginTop: 4 }}>Accepts Request</span>
      </div>
      <div style={{ position: "absolute", left: NX[1]-R, top: CY(3)-R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(4) }}>
        <Image src="/icons/spring_java_icon.png" width={ICON} height={ICON} alt="API Server" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", marginTop: 6 }}>API Server</span>
        <span style={{ fontSize: 10, color: "rgba(167,139,250,0.85)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 3, padding: "2px 6px", marginTop: 4, whiteSpace: "nowrap" }}>Match Success</span>
      </div>
      <div style={{ position: "absolute", left: NX[2]-R, top: CY(3)-R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(4) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="User App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", marginTop: 6 }}>User App</span>
        <span style={{ fontSize: 10, color: "rgba(167,139,250,0.85)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 3, padding: "2px 6px", marginTop: 4, whiteSpace: "nowrap" }}>Driver Assigned</span>
      </div>

      {/* ── Key Points ── */}
      <div style={{ position: "absolute", left: 40, top: STEP_TOPS[3] + STEP_H + 60, ...fade(5) }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 18, letterSpacing: "0.05em" }}>KEY POINTS</div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { color: "99,179,237",  title: "Real-time Location",      desc: "Drivers update location every 300ms in the background" },
            { color: "52,211,153",  title: "Redis GEO Search",        desc: "GEORADIUS with expanding radius strategy for optimal matching" },
            { color: "251,146,60",  title: "Instant Notification",    desc: "Real-time push via Redis Pub/Sub & Socket.IO" },
            { color: "167,139,250", title: "Fast Matching",           desc: "End-to-end response under 100ms" },
          ].map(({ color, title, desc }) => (
            <div key={title} style={{ flex: 1, padding: "20px 24px", border: `1px solid rgba(${color},0.2)`, borderRadius: 12, background: `rgba(${color},0.05)` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: `rgba(${color},1)`, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{desc}</div>
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
