"use client";

import { useEffect, useState } from "react";

const VW = 820;
const VH = 460;
const MAX_PHASE = 5;

const PGS = [
  { name: "NaverPay",  pct: 15, color: "#34D399" },
  { name: "TossPay",   pct: 32, color: "#60A5FA" },
  { name: "KakaoPay",  pct: 53, color: "#FBBF24" },
];

const BAR_MAX = 240;
const ROW_GAP = 110;

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
      timers.push(setTimeout(() => setPhase(p), p * 480));
    }
    timers.push(setTimeout(onComplete, MAX_PHASE * 480 + 600));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const f = (p: number) => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

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

        {/* ── 좌측: 사용량 분석 ── */}
        <text x={200} y={28} fontSize={11} fontWeight={700} letterSpacing={2}
          fill="rgba(255,255,255,0.3)" textAnchor="middle" style={f(0)}>
          USAGE FREQUENCY
        </text>

        {PGS.map(({ name, pct, color }, i) => {
          const y = 70 + i * ROW_GAP;
          return (
            <g key={name} style={f(i + 1)}>
              {/* 순서 뱃지 */}
              <rect x={28} y={y - 2} width={28} height={20} rx={4}
                fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <text x={42} y={y + 12} fontSize={10} fontWeight={700}
                fill="rgba(255,255,255,0.35)" textAnchor="middle">#{i + 1}</text>

              {/* PG 이름 */}
              <text x={65} y={y + 12} fontSize={13} fontWeight={700}
                fill="rgba(255,255,255,0.82)">{name}</text>

              {/* 바 배경 */}
              <rect x={65} y={y + 22} width={BAR_MAX} height={14} rx={3}
                fill="rgba(255,255,255,0.04)" />
              {/* 바 채움 */}
              <rect x={65} y={y + 22} width={BAR_MAX * pct / 100} height={14} rx={3}
                fill={`${color}44`} stroke={`${color}70`} strokeWidth={0.8} />

              {/* 퍼센트 */}
              <text x={65 + BAR_MAX * pct / 100 + 8} y={y + 34} fontSize={11} fontWeight={700}
                fill={color}>{pct}%</text>
            </g>
          );
        })}

        {/* 힌트 텍스트 */}
        <text x={200} y={390} fontSize={11} fill="rgba(255,255,255,0.2)"
          textAnchor="middle" style={f(3)}>
          deploy in ascending order of usage
        </text>

        {/* ── 우측: 배포 순서 ── */}
        <text x={618} y={28} fontSize={11} fontWeight={700} letterSpacing={2}
          fill="rgba(255,255,255,0.3)" textAnchor="middle" style={f(0)}>
          DEPLOYMENT ORDER
        </text>

        {PGS.map(({ name, color }, i) => {
          const y = 70 + i * ROW_GAP;
          return (
            <g key={`deploy-${name}`} style={f(i + 3)}>
              {/* 스텝 원 */}
              <circle cx={448} cy={y + 10} r={18}
                fill="rgba(255,255,255,0.03)" stroke={`${color}55`} strokeWidth={1.5} />
              <text x={448} y={y + 15} fontSize={13} fontWeight={800}
                fill={color} textAnchor="middle">{i + 1}</text>

              {/* PG 박스 */}
              <rect x={476} y={y - 2} width={112} height={36} rx={7}
                fill={`${color}0e`} stroke={`${color}30`} strokeWidth={1} />
              <text x={532} y={y + 20} fontSize={12} fontWeight={700}
                fill="rgba(255,255,255,0.78)" textAnchor="middle">{name}</text>

              {/* → Monitor */}
              <text x={600} y={y + 16} fontSize={12} fill="rgba(255,255,255,0.18)">→</text>

              {/* Monitor 박스 */}
              <rect x={618} y={y - 2} width={72} height={36} rx={7}
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <text x={654} y={y + 20} fontSize={10} fill="rgba(255,255,255,0.38)"
                textAnchor="middle">Monitor</text>

              {/* → ✓ */}
              <text x={700} y={y + 16} fontSize={12} fill="rgba(255,255,255,0.18)">→</text>
              <circle cx={730} cy={y + 10} r={13}
                fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.38)" strokeWidth={1} />
              <text x={730} y={y + 15} fontSize={13} fontWeight={800}
                fill="rgba(52,211,153,0.85)" textAnchor="middle">✓</text>

              {/* 다음 스텝 연결선 */}
              {i < 2 && (
                <line x1={448} y1={y + 28} x2={448} y2={y + ROW_GAP - 18}
                  stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3 3" />
              )}
            </g>
          );
        })}

      </svg>
    </div>
  );
};
