"use client";

import { useEffect, useState } from "react";

const VW = 820;
const VH = 460;
const MAX_PHASE = 4;

const BEFORE_SERVICES = [
  { y: 68,  name: "KakaoPayService" },
  { y: 185, name: "TossPayService"  },
  { y: 302, name: "NaverPayService" },
];

const IMPL = [
  { x: 448, name: "KakaoPay" },
  { x: 581, name: "TossPay"  },
  { x: 714, name: "NaverPay" },
];

const IW = 110; // impl box width
const IH = 72;
const IMPL_Y = 310;

const BL_BOX  = { x: 448, y: 60,  w: 340, h: 66  }; // Business Logic
const GW_BOX  = { x: 448, y: 185, w: 340, h: 72  }; // PaymentGateway interface

function fade(phase: number, target: number) {
  return { opacity: phase >= target ? 1 : 0, transition: "opacity 0.5s ease" };
}

export const WashswatAnimation = ({
  active,
  onComplete,
}: {
  active: boolean;
  skipAnimation: boolean;
  onComplete: () => void;
}) => {
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    if (!active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let p = 0; p <= MAX_PHASE; p++) {
      timers.push(setTimeout(() => setPhase(p), p * 420));
    }
    timers.push(setTimeout(onComplete, MAX_PHASE * 420 + 600));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const f = (p: number) => fade(phase, p);

  return (
    <div style={{
      width: "100%", height: "100%",
      opacity: active ? 1 : 0,
      transition: "opacity 0.6s ease",
    }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", height: "100%" }}>

        {/* ── 영역 레이블 ── */}
        <text x={192} y={28} fontSize={11} fontWeight={700} letterSpacing={2}
          fill="rgba(248,113,113,0.7)" textAnchor="middle" style={f(0)}>BEFORE</text>
        <text x={618} y={28} fontSize={11} fontWeight={700} letterSpacing={2}
          fill="rgba(52,211,153,0.7)" textAnchor="middle" style={f(1)}>AFTER</text>

        {/* 중앙 구분선 */}
        <line x1={410} y1={40} x2={410} y2={400}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="4 4" style={f(0)} />

        {/* ── BEFORE: 3개 서비스 (각자 비즈니스 로직 중복) ── */}
        {BEFORE_SERVICES.map(({ y, name }, i) => (
          <g key={name} style={f(0)}>
            {/* 박스 */}
            <rect x={28} y={y} width={355} height={96} rx={8}
              fill="rgba(248,113,113,0.05)" stroke="rgba(248,113,113,0.28)" strokeWidth={1.2} />
            {/* 서비스명 */}
            <text x={48} y={y + 26} fontSize={13} fontWeight={700}
              fill="rgba(255,255,255,0.82)">{name}</text>
            {/* 중복 로직 뱃지 */}
            <rect x={48} y={y + 38} width={88} height={20} rx={4}
              fill="rgba(248,113,113,0.15)" stroke="rgba(248,113,113,0.3)" strokeWidth={1} />
            <text x={92} y={y + 52} fontSize={10} fontWeight={600}
              fill="rgba(248,113,113,0.85)" textAnchor="middle">Business Logic</text>
            {/* 메서드 */}
            <text x={48} y={y + 76} fontSize={10.5} fill="rgba(255,255,255,0.35)">
              pay() · cancel() · refund()
            </text>
            {/* 중복 표시 */}
            {i > 0 && (
              <text x={355} y={y + 22} fontSize={9} fontWeight={700}
                fill="rgba(248,113,113,0.5)" textAnchor="end">DUPLICATE</text>
            )}
          </g>
        ))}

        {/* ── AFTER: Business Logic (단일) ── */}
        <g style={f(1)}>
          <rect x={BL_BOX.x} y={BL_BOX.y} width={BL_BOX.w} height={BL_BOX.h} rx={8}
            fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.35)" strokeWidth={1.2} />
          <text x={BL_BOX.x + BL_BOX.w / 2} y={BL_BOX.y + 28} fontSize={13} fontWeight={700}
            fill="rgba(255,255,255,0.88)" textAnchor="middle">Business Logic</text>
          <text x={BL_BOX.x + BL_BOX.w / 2} y={BL_BOX.y + 48} fontSize={10.5}
            fill="rgba(52,211,153,0.65)" textAnchor="middle">Single Source · Zero Duplication</text>
        </g>

        {/* BL → Gateway 화살표 */}
        <g style={f(2)}>
          <line x1={618} y1={BL_BOX.y + BL_BOX.h} x2={618} y2={GW_BOX.y}
            stroke="rgba(96,165,250,0.45)" strokeWidth={1.5} />
          <polygon points={`613,${GW_BOX.y} 623,${GW_BOX.y} 618,${GW_BOX.y + 7}`}
            fill="rgba(96,165,250,0.45)" />
          <text x={628} y={GW_BOX.y - 6} fontSize={9} fill="rgba(96,165,250,0.55)">inject</text>
        </g>

        {/* ── AFTER: PaymentGateway Interface ── */}
        <g style={f(2)}>
          <rect x={GW_BOX.x} y={GW_BOX.y} width={GW_BOX.w} height={GW_BOX.h} rx={8}
            fill="rgba(96,165,250,0.06)" stroke="rgba(96,165,250,0.35)" strokeWidth={1.2} />
          <text x={GW_BOX.x + GW_BOX.w / 2} y={GW_BOX.y + 22} fontSize={10} fontWeight={600}
            fill="rgba(96,165,250,0.65)" textAnchor="middle">«interface»</text>
          <text x={GW_BOX.x + GW_BOX.w / 2} y={GW_BOX.y + 40} fontSize={13} fontWeight={700}
            fill="rgba(255,255,255,0.88)" textAnchor="middle">PaymentGateway</text>
          <text x={GW_BOX.x + GW_BOX.w / 2} y={GW_BOX.y + 58} fontSize={10.5}
            fill="rgba(255,255,255,0.32)" textAnchor="middle">pay() · cancel() · refund()</text>
        </g>

        {/* Gateway → Implementations 화살표 */}
        {IMPL.map(({ x }) => (
          <g key={x} style={f(3)}>
            <line x1={618} y1={GW_BOX.y + GW_BOX.h} x2={x + IW / 2} y2={IMPL_Y}
              stroke="rgba(96,165,250,0.3)" strokeWidth={1.2} strokeDasharray="3 3" />
          </g>
        ))}

        {/* ── AFTER: 구현체 3개 ── */}
        {IMPL.map(({ x, name }) => (
          <g key={name} style={f(3)}>
            <rect x={x} y={IMPL_Y} width={IW} height={IH} rx={8}
              fill="rgba(96,165,250,0.05)" stroke="rgba(96,165,250,0.22)" strokeWidth={1} />
            <text x={x + IW / 2} y={IMPL_Y + 22} fontSize={11} fontWeight={700}
              fill="rgba(255,255,255,0.78)" textAnchor="middle">{name}</text>
            <text x={x + IW / 2} y={IMPL_Y + 39} fontSize={9}
              fill="rgba(96,165,250,0.5)" textAnchor="middle">implements</text>
            <text x={x + IW / 2} y={IMPL_Y + 56} fontSize={9}
              fill="rgba(255,255,255,0.28)" textAnchor="middle">pay/cancel/refund</text>
          </g>
        ))}

        {/* ── Stats ── */}
        <g style={f(4)}>
          <line x1={28} y1={408} x2={790} y2={408}
            stroke="rgba(255,255,255,0.07)" strokeWidth={1} />

          {/* 35% */}
          <text x={230} y={438} fontSize={28} fontWeight={900}
            fill="rgba(52,211,153,0.9)" textAnchor="middle">35%</text>
          <text x={230} y={456} fontSize={11} fill="rgba(255,255,255,0.4)" textAnchor="middle">
            Duplicate Code Removed
          </text>

          {/* 구분 */}
          <line x1={410} y1={420} x2={410} y2={455}
            stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

          {/* 80% */}
          <text x={590} y={438} fontSize={28} fontWeight={900}
            fill="rgba(96,165,250,0.9)" textAnchor="middle">80%</text>
          <text x={590} y={456} fontSize={11} fill="rgba(255,255,255,0.4)" textAnchor="middle">
            Faster PG Integration
          </text>
        </g>

      </svg>
    </div>
  );
};
