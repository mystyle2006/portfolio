"use client";

import { CSSProperties, useEffect, useState } from "react";

const VW = 820;
const VH = 480;
const MAX_PHASE = 6;

const CHANNELS = [
  { name: "Coupang",        color: "#F87171", fmt: '{ orderId, itemCode, qty }' },
  { name: "Naver Shopping", color: "#60A5FA", fmt: '{ id, productNo, count }'   },
  { name: "11번가",           color: "#FBBF24", fmt: '{ orderNo, goods, amt }'    },
  { name: "Gmarket",        color: "#34D399", fmt: '{ seq, skuId, quantity }'   },
];

const CH_X = 18, CH_W = 218, CH_H = 68;
const CH_Y = [45, 148, 248, 348];

const IF_X = 296, IF_Y = 48, IF_W = 238, IF_H = 334;
const SE_X = 592, SE_Y = 148, SE_W = 210, SE_H = 160;

const METHODS = [
  "fetchOrders(): Order[]",
  "parseOrder(raw): Order",
  "normalize(): Settlement",
];

export const GomiAnimation = ({
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
    const delays = [0, 400, 800, 1200, 1600, 2200, 3000];
    const timers: ReturnType<typeof setTimeout>[] = [];
    delays.forEach((ms, p) => timers.push(setTimeout(() => setPhase(p), ms)));
    timers.push(setTimeout(onComplete, delays[MAX_PHASE] + 600));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const f = (p: number): CSSProperties => ({
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

        {/* ── 섹션 레이블 ── */}
        <text x={CH_X + CH_W / 2} y={28} fontSize={10} fontWeight={700} letterSpacing={2}
          fill="rgba(255,255,255,0.28)" textAnchor="middle" style={f(0)}>
          ORDER CHANNELS
        </text>
        <text x={IF_X + IF_W / 2} y={28} fontSize={10} fontWeight={700} letterSpacing={2}
          fill="rgba(96,165,250,0.55)" textAnchor="middle" style={f(0)}>
          INTERFACE
        </text>
        <text x={SE_X + SE_W / 2} y={28} fontSize={10} fontWeight={700} letterSpacing={2}
          fill="rgba(52,211,153,0.55)" textAnchor="middle" style={f(0)}>
          SETTLEMENT
        </text>

        {/* ── 채널 박스 4개 ── */}
        {CHANNELS.map(({ name, color, fmt }, i) => {
          const y = CH_Y[i];
          return (
            <g key={name} style={f(i + 1)}>
              {/* 박스 */}
              <rect x={CH_X} y={y} width={CH_W} height={CH_H} rx={8}
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              {/* 좌측 컬러 바 */}
              <rect x={CH_X} y={y} width={3} height={CH_H} rx={1.5}
                fill={color} opacity={0.7} />
              {/* 채널명 */}
              <text x={CH_X + 14} y={y + 24} fontSize={12} fontWeight={700}
                fill="rgba(255,255,255,0.82)">{name}</text>
              {/* 데이터 포맷 힌트 */}
              <text x={CH_X + 14} y={y + 44} fontSize={9.5}
                fill={`${color}80`} fontFamily="monospace">{fmt}</text>
            </g>
          );
        })}

        {/* ── 채널 → 인터페이스 연결선 ── */}
        {CHANNELS.map(({ color }, i) => {
          const cy = CH_Y[i] + CH_H / 2;
          return (
            <g key={`arrow-${i}`} style={f(5)}>
              <line x1={CH_X + CH_W} y1={cy} x2={IF_X - 1} y2={cy}
                stroke={`${color}50`} strokeWidth={1.2} strokeDasharray="3 3" />
              <polygon
                points={`${IF_X - 6},${cy - 3} ${IF_X},${cy} ${IF_X - 6},${cy + 3}`}
                fill={`${color}55`} />
            </g>
          );
        })}

        {/* ── 인터페이스 박스 ── */}
        <g style={f(5)}>
          <rect x={IF_X} y={IF_Y} width={IF_W} height={IF_H} rx={10}
            fill="rgba(96,165,250,0.05)" stroke="rgba(96,165,250,0.32)" strokeWidth={1.2} />
          {/* <<interface>> */}
          <text x={IF_X + IF_W / 2} y={IF_Y + 26} fontSize={10} fontWeight={600}
            fill="rgba(96,165,250,0.6)" textAnchor="middle">«interface»</text>
          {/* 이름 */}
          <text x={IF_X + IF_W / 2} y={IF_Y + 48} fontSize={14} fontWeight={800}
            fill="rgba(255,255,255,0.88)" textAnchor="middle">OrderChannel</text>
          {/* 구분선 */}
          <line x1={IF_X + 12} y1={IF_Y + 60} x2={IF_X + IF_W - 12} y2={IF_Y + 60}
            stroke="rgba(96,165,250,0.2)" strokeWidth={1} />
          {/* 메서드 목록 */}
          {METHODS.map((m, i) => (
            <text key={m} x={IF_X + 16} y={IF_Y + 84 + i * 26} fontSize={11}
              fill="rgba(255,255,255,0.45)" fontFamily="monospace">{m}</text>
          ))}
          {/* 구분선 2 */}
          <line x1={IF_X + 12} y1={IF_Y + 170} x2={IF_X + IF_W - 12} y2={IF_Y + 170}
            stroke="rgba(96,165,250,0.12)" strokeWidth={1} />
          {/* 구현체 표시 */}
          <text x={IF_X + IF_W / 2} y={IF_Y + 194} fontSize={10}
            fill="rgba(96,165,250,0.4)" textAnchor="middle">implements by each channel</text>
          {CHANNELS.map(({ name, color }, i) => (
            <g key={`impl-${name}`}>
              <circle cx={IF_X + 22 + i * 54} cy={IF_Y + 222} r={5}
                fill={`${color}30`} stroke={`${color}70`} strokeWidth={1} />
              <text x={IF_X + 22 + i * 54} y={IF_Y + 248} fontSize={8.5}
                fill={`${color}80`} textAnchor="middle"
                style={{ writingMode: "horizontal-tb" }}>
                {name.split(" ")[0]}
              </text>
            </g>
          ))}
          {/* 통일된 출력 */}
          <line x1={IF_X + 12} y1={IF_Y + 266} x2={IF_X + IF_W - 12} y2={IF_Y + 266}
            stroke="rgba(96,165,250,0.12)" strokeWidth={1} />
          <text x={IF_X + IF_W / 2} y={IF_Y + 290} fontSize={11} fontWeight={700}
            fill="rgba(96,165,250,0.75)" textAnchor="middle">→ Order (unified)</text>
          <text x={IF_X + IF_W / 2} y={IF_Y + 312} fontSize={10}
            fill="rgba(255,255,255,0.28)" textAnchor="middle">consistent across all channels</text>
        </g>

        {/* ── 인터페이스 → 정산 화살표 ── */}
        <g style={f(6)}>
          <line x1={IF_X + IF_W} y1={SE_Y + SE_H / 2}
                x2={SE_X - 1}    y2={SE_Y + SE_H / 2}
            stroke="rgba(52,211,153,0.45)" strokeWidth={1.5} />
          <polygon
            points={`${SE_X - 7},${SE_Y + SE_H / 2 - 4} ${SE_X},${SE_Y + SE_H / 2} ${SE_X - 7},${SE_Y + SE_H / 2 + 4}`}
            fill="rgba(52,211,153,0.5)" />
        </g>

        {/* ── 정산 엔진 박스 ── */}
        <g style={f(6)}>
          <rect x={SE_X} y={SE_Y} width={SE_W} height={SE_H} rx={10}
            fill="rgba(52,211,153,0.05)" stroke="rgba(52,211,153,0.32)" strokeWidth={1.2} />
          <text x={SE_X + SE_W / 2} y={SE_Y + 30} fontSize={13} fontWeight={800}
            fill="rgba(255,255,255,0.85)" textAnchor="middle">Settlement Engine</text>
          <line x1={SE_X + 12} y1={SE_Y + 42} x2={SE_X + SE_W - 12} y2={SE_Y + 42}
            stroke="rgba(52,211,153,0.2)" strokeWidth={1} />
          {[
            "Single processing logic",
            "No channel-specific code",
            "Automated reconciliation",
          ].map((txt, i) => (
            <g key={txt}>
              <circle cx={SE_X + 18} cy={SE_Y + 64 + i * 26} r={3}
                fill="rgba(52,211,153,0.6)" />
              <text x={SE_X + 28} y={SE_Y + 69 + i * 26} fontSize={10.5}
                fill="rgba(255,255,255,0.5)">{txt}</text>
            </g>
          ))}
        </g>

      </svg>
    </div>
  );
};
