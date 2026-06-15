"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

const VW = 820;
const VH = 460;

// 좌측 usage bars: phase 0-3 (1회 실행)
const LEFT_DELAYS = [0, 400, 800, 1200];
const LEFT_DONE_MS = 1350;

// 우측 deployment: rightPhase 0-8 (루프)
// rp: 0 deploy / 1 monitor / 2 stable  ×3
const RIGHT_DELAYS = [
   500,  // rp 0: NaverPay  DEPLOYING
  1500,  // rp 1: NaverPay  MONITORING  (1000ms)
  3100,  // rp 2: NaverPay  STABLE      (1600ms)
  3600,  // rp 3: TossPay   DEPLOYING   (500ms 간격)
  4600,  // rp 4: TossPay   MONITORING
  6200,  // rp 5: TossPay   STABLE
  6700,  // rp 6: KakaoPay  DEPLOYING
  7700,  // rp 7: KakaoPay  MONITORING
  9300,  // rp 8: KakaoPay  STABLE
];
const MAX_RIGHT   = 8;
const LOOP_PAUSE  = 5000; // stable 완료 후 재시작까지 대기

const PGS = [
  { name: "NaverPay",  pct: 15, color: "#34D399" },
  { name: "TossPay",   pct: 32, color: "#60A5FA" },
  { name: "KakaoPay",  pct: 53, color: "#FBBF24" },
];

const BAR_MAX    = 240;
const DEPLOY_BAR = 195;
const ROW_GAP    = 115;
const COVERAGE   = ["0%", "15%", "47%", "100%"];

type Status = "pending" | "deploying" | "monitoring" | "stable";

function pgStatusRight(i: number, rp: number): Status {
  const d = i * 3, m = i * 3 + 1, s = i * 3 + 2;
  if (rp >= s) return "stable";
  if (rp >= m) return "monitoring";
  if (rp >= d) return "deploying";
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
  const [leftPhase,  setLeftPhase]  = useState(skipAnimation ? 3 : -1);
  const [leftDone,   setLeftDone]   = useState(skipAnimation);
  const [rightPhase, setRightPhase] = useState(skipAnimation ? MAX_RIGHT : -1);
  const [rightLoop,  setRightLoop]  = useState(0);
  const completedRef = useRef(false);

  // ── 좌측 bars: 1회 실행 ──────────────────────────────────────────
  useEffect(() => {
    if (!active || skipAnimation) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    LEFT_DELAYS.forEach((ms, p) => {
      timers.push(setTimeout(() => setLeftPhase(p), ms));
    });
    timers.push(setTimeout(() => setLeftDone(true), LEFT_DONE_MS));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  // ── 우측 panel: leftDone 이후 루프 ──────────────────────────────
  useEffect(() => {
    if (!active || !leftDone) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setRightPhase(-1);

    RIGHT_DELAYS.forEach((ms, rp) => {
      timers.push(setTimeout(() => setRightPhase(rp), ms));
    });

    // 첫 번째 완료 시 onComplete 호출
    if (!completedRef.current) {
      timers.push(setTimeout(() => {
        completedRef.current = true;
        onComplete();
      }, RIGHT_DELAYS[MAX_RIGHT] + 400));
    }

    // 5초 후 루프 재시작
    timers.push(setTimeout(() => setRightLoop((c) => c + 1), RIGHT_DELAYS[MAX_RIGHT] + LOOP_PAUSE));

    return () => timers.forEach(clearTimeout);
  }, [active, leftDone, rightLoop]);

  const lf = (p: number): CSSProperties => ({
    opacity: leftPhase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  const stableCount = [2, 5, 8].filter((rp) => rightPhase >= rp).length;
  const coverage    = COVERAGE[stableCount];

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
          style={lf(0)} />

        {/* ── 좌측: 사용 빈도 (고정) ── */}
        <text x={200} y={28} fontSize={11} fontWeight={700} letterSpacing={2}
          fill="rgba(255,255,255,0.3)" textAnchor="middle" style={lf(0)}>
          USAGE FREQUENCY
        </text>

        {PGS.map(({ name, pct, color }, i) => {
          const y = 70 + i * ROW_GAP;
          return (
            <g key={name} style={lf(i + 1)}>
              <rect x={28} y={y - 2} width={28} height={20} rx={4}
                fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <text x={42} y={y + 12} fontSize={10} fontWeight={700}
                fill="rgba(255,255,255,0.35)" textAnchor="middle">#{i + 1}</text>
              <text x={65} y={y + 12} fontSize={13} fontWeight={700}
                fill="rgba(255,255,255,0.82)">{name}</text>
              <rect x={65} y={y + 22} width={BAR_MAX} height={13} rx={3}
                fill="rgba(255,255,255,0.04)" />
              <rect x={65} y={y + 22} width={BAR_MAX * pct / 100} height={13} rx={3}
                fill={`${color}44`} stroke={`${color}70`} strokeWidth={0.8} />
              <text x={65 + BAR_MAX * pct / 100 + 8} y={y + 33} fontSize={11} fontWeight={700}
                fill={color}>{pct}%</text>
            </g>
          );
        })}

        <text x={200} y={400} fontSize={14} fontWeight={600}
          fill="rgba(255,255,255,0.45)" textAnchor="middle" style={lf(3)}>
          deploy in ascending order ↑
        </text>

        {/* ── 우측: 배포 순서 (루프) ── */}
        <text x={616} y={28} fontSize={11} fontWeight={700} letterSpacing={2}
          fill="rgba(255,255,255,0.3)" textAnchor="middle"
          style={{ opacity: leftDone ? 1 : 0, transition: "opacity 0.5s ease" }}>
          DEPLOYMENT ORDER
        </text>

        {/* Coverage 카운터 */}
        <g style={{ opacity: rightPhase >= 0 ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <text x={800} y={20} fontSize={10} letterSpacing={1}
            fill="rgba(255,255,255,0.25)" textAnchor="end">COVERAGE</text>
          <text x={800} y={50} fontSize={26} fontWeight={900}
            fill="rgba(52,211,153,0.88)" textAnchor="end"
            style={{ transition: "all 0.4s ease" }}>
            {coverage}
          </text>
        </g>

        {/* ── 배포 행 3개 (루프) ── */}
        {PGS.map(({ name, color }, i) => {
          const status   = pgStatusRight(i, rightPhase);
          const rowY     = 68 + i * ROW_GAP;
          const isActive = status !== "pending";
          const barFill  =
            status === "stable"     ? `${color}92` :
            status === "monitoring" ? `${color}6a` :
                                      `${color}52`;

          return (
            <g key={`deploy-${name}`}
              style={{ opacity: leftDone ? 1 : 0, transition: "opacity 0.5s ease" }}>

              {/* 행 배경 */}
              <rect x={426} y={rowY} width={382} height={70} rx={9}
                fill={isActive ? `${color}07` : "rgba(255,255,255,0.02)"}
                stroke={isActive ? `${color}22` : "rgba(255,255,255,0.06)"}
                strokeWidth={1}
                style={{ transition: "fill 0.5s, stroke 0.5s" }} />

              {/* 스텝 원 */}
              <circle cx={450} cy={rowY + 35} r={17}
                fill={isActive ? `${color}18` : "rgba(255,255,255,0.04)"}
                stroke={isActive ? `${color}58` : "rgba(255,255,255,0.1)"}
                strokeWidth={1.5}
                style={{ transition: "fill 0.5s, stroke 0.5s" }} />
              <text x={450} y={rowY + 40} fontSize={13} fontWeight={900}
                fill={isActive ? color : "rgba(255,255,255,0.22)"}
                textAnchor="middle"
                style={{ transition: "fill 0.5s" }}>{i + 1}</text>

              {/* PG 이름 */}
              <text x={477} y={rowY + 26} fontSize={13} fontWeight={700}
                fill={isActive ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.2)"}
                style={{ transition: "fill 0.5s" }}>{name}</text>

              {/* 프로그레스 바 배경 */}
              <rect x={477} y={rowY + 36} width={DEPLOY_BAR} height={11} rx={3}
                fill="rgba(255,255,255,0.05)" />

              {/* 프로그레스 바 채움 */}
              <g style={{
                transformBox: "fill-box" as CSSProperties["transformBox"],
                transformOrigin: "left",
                transform: `scaleX(${isActive ? 1 : 0})`,
                transition: "transform 0.55s ease",
              }}>
                <rect x={477} y={rowY + 36} width={DEPLOY_BAR} height={11} rx={3}
                  fill={barFill} style={{ transition: "fill 0.4s" }}>
                  {status === "monitoring" && (
                    <animate attributeName="opacity"
                      values="0.5;1;0.5" dur="1.4s" repeatCount="indefinite" />
                  )}
                </rect>
              </g>

              {/* 상태 뱃지 */}
              {status === "deploying" && (
                <text x={688} y={rowY + 26} fontSize={10} fontWeight={600}
                  fill={`${color}99`} textAnchor="middle">DEPLOYING...</text>
              )}
              {status === "monitoring" && (
                <g>
                  <circle cx={670} cy={rowY + 22} r={4} fill={color}>
                    <animate attributeName="opacity"
                      values="1;0.2;1" dur="1.1s" repeatCount="indefinite" />
                  </circle>
                  <text x={686} y={rowY + 26} fontSize={10} fontWeight={600}
                    fill={`${color}88`}>MONITORING...</text>
                </g>
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
