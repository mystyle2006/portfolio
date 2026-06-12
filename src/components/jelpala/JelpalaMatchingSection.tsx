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
      desc: "Drivers send location updates every 300m traveled. To prevent Redis from being overwhelmed by high-volume concurrent writes, SQS acts as a buffer between the API and Redis GEO.",
      points: ["N drivers send HTTPS updates every 300m traveled", "API publishes to SQS — decouples write load", "Lambda consumer batch-writes via Redis GEOADD"],
    },
    {
      color: "52,211,153",
      title: "User Matching Request",
      desc: "GEORADIUS finds all nearby drivers and ranks them by proximity. Match requests go to the Top 5 first — if none accept, the radius expands and the Top 20 are notified.",
      points: ["GEORADIUS returns drivers sorted by proximity", "Round 1: notify Top 5 closest drivers", "No accept → expand radius, notify Top 20"],
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
          {/* 카드 테두리 */}
          <div style={{ position: "absolute", left: 40, top: STEP_TOPS[i], width: 1520, height: STEP_H, border: `1px solid rgba(${color},0.22)`, borderRadius: 16, background: `rgba(${color},0.04)`, pointerEvents: "none", ...fade(i + 1) }} />
          {/* 좌/우 분리선 */}
          <div style={{ position: "absolute", left: 490, top: STEP_TOPS[i] + 20, width: 1, height: STEP_H - 40, background: `rgba(${color},0.12)`, ...fade(i + 1) }} />
          {/* 좌측 설명 */}
          <div style={{ position: "absolute", left: 70, top: STEP_TOPS[i] + 36, width: 390, ...fade(i + 1) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `rgba(${color},0.18)`, border: `1.5px solid rgba(${color},0.5)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: `rgba(${color},1)` }}>{i + 1}</div>
              <span style={{ fontSize: 19, fontWeight: 800, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.01em" }}>{title}</span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, margin: "0 0 20px 0" }}>{desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {points.map((pt) => (
                <div key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: `rgba(${color},0.9)`, marginTop: 7, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", lineHeight: 1.55 }}>{pt}</span>
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

        {/* ── Step 1: N Drivers → API → SQS → Lambda → Redis GEO ── */}
        {/* "Every 300m" 배지 (D1 위, cx=653 기준 중앙) */}
        <rect x={607} y={222} width={112} height={24} rx="6" fill="rgba(99,179,237,0.14)" stroke="rgba(99,179,237,0.3)" strokeWidth="1" style={sf(1)} />
        <text x={663} y={238} fontSize="13" fill="rgba(99,179,237,0.9)" textAnchor="middle" fontWeight="600" style={sf(1)}>Every 300m</text>
        {/* 드라이버 3개 → API Server (fan-in 곡선, cx=653→878) */}
        <path d={`M 679 270 C 730 270, 825 ${CY(0)}, 852 ${CY(0)}`}
          stroke="rgba(99,179,237,0.35)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        <path d={`M 679 ${CY(0)} L 852 ${CY(0)}`}
          stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        <path d={`M 679 470 C 730 470, 825 ${CY(0)}, 852 ${CY(0)}`}
          stroke="rgba(99,179,237,0.35)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        {/* API(878) → SQS(1058) */}
        <path d={`M 904 ${CY(0)} L 1032 ${CY(0)}`}
          stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        <text x={968} y={CY(0) - 13} fontSize="13" fill="rgba(99,179,237,0.85)" textAnchor="middle" fontWeight="500" style={sf(1)}>Publish</text>
        {/* SQS(1058) → Lambda(1238) */}
        <path d={`M 1084 ${CY(0)} L 1212 ${CY(0)}`}
          stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        <text x={1148} y={CY(0) - 13} fontSize="13" fill="rgba(99,179,237,0.85)" textAnchor="middle" fontWeight="500" style={sf(1)}>Consume</text>
        {/* Lambda(1238) → Redis GEO(1418) */}
        <path d={`M 1264 ${CY(0)} L 1392 ${CY(0)}`}
          stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-blue)" style={sf(1)} />
        <text x={1328} y={CY(0) - 13} fontSize="13" fill="rgba(99,179,237,0.85)" textAnchor="middle" fontWeight="500" style={sf(1)}>GEOADD</text>
        {/* SQS "Burst Buffer" 배지 — label 아래 충분한 간격 */}
        <rect x={1008} y={CY(0) + 54} width={100} height={22} rx="4" fill="rgba(99,179,237,0.1)" stroke="rgba(99,179,237,0.25)" strokeWidth="1" style={sf(1)} />
        <text x={1058} y={CY(0) + 69} fontSize="11" fill="rgba(99,179,237,0.75)" textAnchor="middle" fontWeight="600" style={sf(1)}>Burst Buffer</text>

        {/* Step 1 → Step 2 */}
        <path d={`M 800 ${STEP_TOPS[0] + STEP_H + 4} L 800 ${STEP_TOPS[1] - 4}`}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#match-ah)" style={sf(2)} />
        <text x="820" y={STEP_TOPS[0] + STEP_H + 32} fontSize="11" fill="rgba(255,255,255,0.22)" style={sf(2)}>Continuous Update</text>

        {/* ── Step 2: User(cx=760) → GEORADIUS(cx=1180) ── */}
        {/* 화살표 */}
        <path d={`M 786 ${CY(1)} L 1098 ${CY(1)}`}
          stroke="rgba(52,211,153,0.45)" strokeWidth="1.5" fill="none" markerEnd="url(#match-ah-green)" style={sf(2)} />
        <text x={942} y={CY(1) - 14} fontSize="13" fill="rgba(52,211,153,0.8)" textAnchor="middle" fontWeight="500" style={sf(2)}>Match Request</text>
        {/* ② Round 2 — 외원 (r=145, dashed) */}
        <circle cx="1180" cy={CY(1)} r="145" fill="rgba(52,211,153,0.018)" stroke="rgba(52,211,153,0.22)" strokeWidth="1.5" strokeDasharray="6 4" style={sf(2)} />
        {/* ① Round 1 — 내원 (r=82, solid) */}
        <circle cx="1180" cy={CY(1)} r="82" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.55)" strokeWidth="1.5" style={sf(2)} />
        {/* 중심점 */}
        <circle cx="1180" cy={CY(1)} r="5" fill="rgba(52,211,153,0.9)" style={sf(2)} />
        <text x="1180" y={CY(1) + 4} fontSize="9" fill="rgba(52,211,153,0.85)" textAnchor="middle" fontWeight="700" style={sf(2)}>GEO</text>
        {/* 원 레이블 */}
        <text x="1180" y={CY(1) - 88} fontSize="12" fill="rgba(52,211,153,0.9)" textAnchor="middle" fontWeight="700" style={sf(2)}>① Top 5 Notified</text>
        <text x="1180" y={CY(1) - 150} fontSize="12" fill="rgba(52,211,153,0.55)" textAnchor="middle" fontWeight="600" style={sf(2)}>② Expand → Top 20</text>
        {/* "No accept" 안내 — 두 원 사이 */}
        <text x="1300" y={CY(1) + 5} fontSize="11" fill="rgba(52,211,153,0.35)" style={sf(2)}>if no accept</text>
        <path d={`M 1298 ${CY(1) - 8} L 1298 ${CY(1) - 30}`}
          stroke="rgba(52,211,153,0.25)" strokeWidth="1" strokeDasharray="3 2" fill="none" style={sf(2)} />
        {/* 랭크 배지 (Top 5 내원 트럭 위) */}
        {([[1202, 802, 1], [1142, 808, 2], [1235, 888, 3], [1128, 902, 4], [1192, 928, 5]] as [number,number,number][]).map(([tx, ty, rank]) => (
          <g key={rank} style={sf(2)}>
            <circle cx={tx + 13} cy={ty - 13} r="9" fill="rgba(52,211,153,1)" />
            <text x={tx + 13} y={ty - 9} fontSize="9" fill="#0f1117" textAnchor="middle" fontWeight="800">{rank}</text>
          </g>
        ))}
        {/* 드라이버 트럭 — DOM Image로 렌더 */}

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

      {/* Step 1: 드라이버 3개 (fan-in, cx=653) */}
      {([270, CY(0), 470] as number[]).map((cy, k) => (
        <div key={k} style={{ position: "absolute", left: 653 - R, top: cy - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
          <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt={`Driver ${k + 1}`} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", marginTop: 4 }}>
            {k === 2 ? "Driver N" : `Driver ${k + 1}`}
          </span>
        </div>
      ))}
      {/* API Server (cx=878) */}
      <div style={{ position: "absolute", left: 878 - R, top: CY(0) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
        <Image src="/icons/spring_java_icon.png" width={ICON} height={ICON} alt="API Server" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", marginTop: 4 }}>API Server</span>
      </div>
      {/* SQS (cx=1058) */}
      <div style={{ position: "absolute", left: 1058 - R, top: CY(0) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
        <Image src="/icons/aws_sqs_icon.webp" width={ICON} height={ICON} alt="SQS" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", marginTop: 4 }}>AWS SQS</span>
      </div>
      {/* Lambda (cx=1238) */}
      <div style={{ position: "absolute", left: 1238 - R, top: CY(0) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
        <Image src="/icons/aws_lambda_icon.png" width={ICON} height={ICON} alt="Lambda" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", marginTop: 4 }}>Lambda</span>
      </div>
      {/* Redis GEO (cx=1418) */}
      <div style={{ position: "absolute", left: 1418 - R, top: CY(0) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
        <Image src="/icons/redis_icon.png" width={ICON} height={ICON} alt="Redis GEO" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", marginTop: 4 }}>Redis GEO</span>
      </div>

      {/* Step 2: User App (cx=760) */}
      <div style={{ position: "absolute", left: 760 - R, top: CY(1) - R, width: ICON, display: "flex", flexDirection: "column", alignItems: "center", ...fade(2) }}>
        <Image src="/icons/client_icon.png" width={ICON} height={ICON} alt="User App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>User App</span>
      </div>
      {/* Step 2: 내원 Top 5 트럭 (cx=1180 기준) */}
      {([[1202, 802], [1142, 808], [1235, 888], [1128, 902], [1192, 928]] as [number,number][]).map(([tx, ty], k) => (
        <div key={k} style={{ position: "absolute", left: tx - 16, top: ty - 16, width: 32, height: 32, ...fade(2) }}>
          <Image src="/icons/truck.png" width={32} height={32} alt={`Top Driver ${k + 1}`} style={{ objectFit: "contain" }} />
        </div>
      ))}
      {/* Step 2: 외원 추가 트럭 (r=82~145 구간) */}
      {([[1075, 788], [1295, 772], [1062, 938], [1270, 960]] as [number,number][]).map(([tx, ty], k) => (
        <div key={k} style={{ position: "absolute", left: tx - 16, top: ty - 16, width: 32, height: 32, opacity: 0.45, ...fade(2) }}>
          <Image src="/icons/truck.png" width={32} height={32} alt={`Outer Driver ${k + 1}`} style={{ objectFit: "contain" }} />
        </div>
      ))}

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
