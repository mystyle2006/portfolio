"use client";

import { CSSProperties, useEffect, useState } from "react";

const VW = 820;
const VH = 460;
const MAX_PHASE = 7;
const PHASE_MS  = 540;

const PGS = [
  { name: "NaverPay",  pct: 15, color: "#34D399" },
  { name: "TossPay",   pct: 32, color: "#60A5FA" },
  { name: "KakaoPay",  pct: 53, color: "#FBBF24" },
];

const BAR_MAX    = 240; // 좌측 usage bar 최대폭
const DEPLOY_BAR = 195; // 우측 deploy progress bar 최대폭
const ROW_GAP    = 115;
const COVERAGE   = ["0%", "15%", "47%", "100%"];

function pgStatus(i: number, phase: number): "pending" | "deploying" | "stable" {
  if (phase >= 5 + i) return "stable";
  if (phase >= 4 + i) return "deploying";
  return "pending";
}

export const WashswatDeployAnimation = ({
  active,
  skipAnimation,
  onComplete,
}: {
  active: boolean;
  skipAnimation: boolean;
  onComplete: () => void;
}) => {
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);

  useEffect(() => {
    if (!active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let p = 0; p <= MAX_PHASE; p++) {
      timers.push(setTimeout(() => setPhase(p), p * PHASE_MS));
    }
    timers.push(setTimeout(onComplete, MAX_PHASE * PHASE_MS + 600));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const f = (p: number): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  const coverage = COVERAGE[Math.max(0, Math.min(3, phase - 4))];

  return (
    <div style={{
      width: "100%", height: "100%",
      opacity: active ? 1 : 0,
      transition: "opacity 0.6s ease",
    }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", height: "100%" }}>

        {/* 중앙 구분선 */}
        <line x1={410} y1={20} x2={410} y2={430}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="4 4"
          style={f(0)} />

        {/* ── 좌측: 사용 빈도 ── */}
        <text x={200} y={28} fontSize={11} fontWeight={700} letterSpacing={2}
          fill="rgba(255,255,255,0.3)" textAnchor="middle" style={f(0)}>
          USAGE FREQUENCY
        </text>

        {PGS.map(({ name, pct, color }, i) => {
          const y = 70 + i * ROW_GAP;
          return (
            <g key={name} style={f(i + 1)}>
              <rect x={28} y={y - 2} width={28} height={20} rx={4}
                fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <text x={42} y={y + 12} fontSize={10} fontWeight={700}
                fill="rgba(255,255,255,0.35)" textAnchor="middle">#{i + 1}</text>
              <text x={65} y={y + 12} fontSize={13} fontWeight={700}
                fill="rgba(255,255,255,0.82)">{name}</text>
              {/* 바 배경 */}
              <rect x={65} y={y + 22} width={BAR_MAX} height={13} rx={3}
                fill="rgba(255,255,255,0.04)" />
              {/* 바 채움 */}
              <rect x={65} y={y + 22} width={BAR_MAX * pct / 100} height={13} rx={3}
                fill={`${color}44`} stroke={`${color}70`} strokeWidth={0.8} />
              <text x={65 + BAR_MAX * pct / 100 + 8} y={y + 33} fontSize={11} fontWeight={700}
                fill={color}>{pct}%</text>
            </g>
          );
        })}

        <text x={200} y={400} fontSize={11} fill="rgba(255,255,255,0.18)"
          textAnchor="middle" style={f(3)}>
          deploy in ascending order ↑
        </text>

        {/* ── 우측: 배포 순서 ── */}
        <text x={616} y={28} fontSize={11} fontWeight={700} letterSpacing={2}
          fill="rgba(255,255,255,0.3)" textAnchor="middle" style={f(0)}>
          DEPLOYMENT ORDER
        </text>

        {/* Coverage 카운터 */}
        <g style={f(4)}>
          <text x={800} y={20} fontSize={10} letterSpacing={1}
            fill="rgba(255,255,255,0.25)" textAnchor="end">COVERAGE</text>
          <text x={800} y={50} fontSize={26} fontWeight={900}
            fill="rgba(52,211,153,0.88)" textAnchor="end"
            style={{ transition: "all 0.4s ease" }}>
            {coverage}
          </text>
        </g>

        {/* ── 3개 배포 행 ── */}
        {PGS.map(({ name, color }, i) => {
          const status = pgStatus(i, phase);
          const rowY   = 68 + i * ROW_GAP;
          const active  = status !== "pending";

          return (
            <g key={`deploy-${name}`}>
              {/* 행 배경 */}
              <rect x={426} y={rowY} width={382} height={70} rx={9}
                fill={active ? `${color}07` : "rgba(255,255,255,0.02)"}
                stroke={active ? `${color}22` : "rgba(255,255,255,0.06)"}
                strokeWidth={1}
                style={{ transition: "fill 0.5s, stroke 0.5s" }} />

              {/* 스텝 원 */}
              <circle cx={450} cy={rowY + 35} r={17}
                fill={active ? `${color}18` : "rgba(255,255,255,0.04)"}
                stroke={active ? `${color}58` : "rgba(255,255,255,0.1)"}
                strokeWidth={1.5}
                style={{ transition: "fill 0.5s, stroke 0.5s" }} />
              <text x={450} y={rowY + 40} fontSize={13} fontWeight={900}
                fill={active ? color : "rgba(255,255,255,0.22)"}
                textAnchor="middle"
                style={{ transition: "fill 0.5s" }}>{i + 1}</text>

              {/* PG 이름 */}
              <text x={477} y={rowY + 26} fontSize={13} fontWeight={700}
                fill={active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.2)"}
                style={{ transition: "fill 0.5s" }}>{name}</text>

              {/* 프로그레스 바 배경 */}
              <rect x={477} y={rowY + 36} width={DEPLOY_BAR} height={11} rx={3}
                fill="rgba(255,255,255,0.05)" />

              {/* 프로그레스 바 채움 (scaleX 애니메이션) */}
              <g style={{
                transformBox: "fill-box" as CSSProperties["transformBox"],
                transformOrigin: "left",
                transform: `scaleX(${status !== "pending" ? 1 : 0})`,
                transition: "transform 0.5s ease",
              }}>
                <rect x={477} y={rowY + 36} width={DEPLOY_BAR} height={11} rx={3}
                  fill={status === "stable" ? `${color}90` : `${color}55`}
                  style={{ transition: "fill 0.4s" }} />
              </g>

              {/* 상태 뱃지 */}
              {status === "deploying" && (
                <text x={686} y={rowY + 26} fontSize={10} fontWeight={600}
                  fill={`${color}88`} textAnchor="middle">
                  DEPLOYING...
                </text>
              )}
              {status === "stable" && (
                <g>
                  <rect x={668} y={rowY + 14} width={60} height={22} rx={5}
                    fill={`${color}15`} stroke={`${color}40`} strokeWidth={1} />
                  <text x={698} y={rowY + 29} fontSize={10} fontWeight={700}
                    fill={color} textAnchor="middle">STABLE ✓</text>
                </g>
              )}

              {/* 다음 행 연결선 */}
              {i < 2 && (
                <line x1={450} y1={rowY + 70} x2={450} y2={rowY + ROW_GAP}
                  stroke={status === "stable" ? `${color}35` : "rgba(255,255,255,0.08)"}
                  strokeWidth={1} strokeDasharray="3 3"
                  style={{ transition: "stroke 0.5s" }} />
              )}
            </g>
          );
        })}

      </svg>
    </div>
  );
};
