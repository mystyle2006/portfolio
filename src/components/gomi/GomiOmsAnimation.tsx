"use client";

import { useEffect, useRef, useState } from "react";

const VW = 760, VH = 530;
const CX = 380;

/* ── Sources ── */
const SOURCES = [
  { label: "Tiki",   color: "#64B5F6" },
  { label: "Lazada", color: "#FFB74D" },
  { label: "Shopee", color: "#EF5350" },
  { label: "Gomi",   color: "#66BB6A" },
];
const SRC_W = 108, SRC_H = 32, SRC_GAP = 22;
const SRC_TOTAL = SOURCES.length * SRC_W + (SOURCES.length - 1) * SRC_GAP; // 504
const SRC_X0 = CX - SRC_TOTAL / 2;                                          // 128
const SRC_CXS = SOURCES.map((_, i) => SRC_X0 + i * (SRC_W + SRC_GAP) + SRC_W / 2);
const SRC_Y = 24, SRC_BOT = SRC_Y + SRC_H; // 56

/* ── NestJS ── */
const NEST = { x: 265, y: 96, w: 230, h: 50, rx: 8 };
const NEST_BOT = NEST.y + NEST.h; // 146

/* ── SQS ── */
const SQS = { x: 225, y: 182, w: 310, h: 72, rx: 8 };
const SQS_BOT = SQS.y + SQS.h; // 254
const SQS_EVENTS = [
  { label: "order.created",   color: "#34D399" },
  { label: "order.cancelled", color: "#FBBF24" },
  { label: "order.updated",   color: "#F87171" },
];
const EVT_W = 88, EVT_GAP = 8;
const EVT_X0 = SQS.x + (SQS.w - (SQS_EVENTS.length * EVT_W + (SQS_EVENTS.length - 1) * EVT_GAP)) / 2;

/* ── Lambda ── */
const LAM = { x: 280, y: 293, w: 200, h: 44, rx: 8 };
const LAM_BOT = LAM.y + LAM.h; // 337

/* ── SNS ── */
const SNS = { cx: CX, cy: 406, r: 36 };
const SNS_BOT = SNS.cy + SNS.r; // 442

/* ── Services ── */
const SERVICES = [
  { label: "OMS",    cx: 188, color: "#60A5FA" },
  { label: "WMS",    cx: CX,  color: "#34D399" },
  { label: "Notify", cx: 572, color: "#A78BFA" },
];
const SVC_Y = 490, SVC_R = 27;

const MAX_PHASE = 4;

function fanPath(tx: number, ty: number): string {
  const sy = SNS_BOT, sx = SNS.cx;
  const midY = (sy + ty) / 2;
  return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
}

export const GomiOmsAnimation = ({
  active,
  skipAnimation,
  onComplete,
}: {
  active: boolean;
  skipAnimation: boolean;
  onComplete: () => void;
}) => {
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    [0, 450, 900, 1350, 1800].forEach((ms, i) =>
      timers.push(setTimeout(() => setPhase(i), ms))
    );
    timers.push(setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onComplete(); }
    }, 2400));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const vis = (p: number): React.CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  return (
    <svg
      width="100%" height="100%"
      viewBox={`0 0 ${VW} ${VH}`}
      style={{ display: "block" }}
    >
      <defs>
        <filter id="goms-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="goms-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.35)" />
        </marker>
      </defs>

      {/* ── Phase 0: Webhook sources ── */}
      <g style={vis(0)}>
        <text x={CX} y={SRC_Y - 10} textAnchor="middle" fontSize="9" fontWeight="600"
          letterSpacing="2.5" fill="rgba(255,255,255,0.22)">WEBHOOKS</text>
        {SOURCES.map(({ label, color }, i) => (
          <g key={label}>
            <rect
              x={SRC_X0 + i * (SRC_W + SRC_GAP)} y={SRC_Y}
              width={SRC_W} height={SRC_H} rx="6"
              fill={`${color}18`} stroke={`${color}65`} strokeWidth="1.5"
            />
            <text
              x={SRC_CXS[i]} y={SRC_Y + SRC_H / 2 + 5}
              textAnchor="middle" fontSize="12" fontWeight="700" fill={color}
            >{label}</text>
          </g>
        ))}
      </g>

      {/* ── Phase 1: Converge arrows + NestJS + K8s ── */}
      <g style={vis(1)}>
        {SRC_CXS.map((sx, i) => (
          <line key={i}
            x1={sx} y1={SRC_BOT} x2={CX} y2={NEST.y}
            stroke="rgba(255,255,255,0.14)" strokeWidth="1.2"
            markerEnd="url(#goms-arrow)"
          />
        ))}
        <rect x={NEST.x} y={NEST.y} width={NEST.w} height={NEST.h} rx={NEST.rx}
          fill="rgba(224,35,78,0.1)" stroke="rgba(224,35,78,0.6)" strokeWidth="1.8" />
        <text x={CX} y={NEST.y + 22} textAnchor="middle" fontSize="13" fontWeight="700"
          fill="#E0234E">NestJS Server</text>
        <text x={CX - 22} y={NEST.y + 38} textAnchor="middle" fontSize="9" fontWeight="500"
          fill="rgba(255,255,255,0.38)">Kubernetes</text>
        {/* K8s badge */}
        <rect x={NEST.x + NEST.w - 46} y={NEST.y + 7} width={36} height={16} rx="4"
          fill="rgba(50,108,229,0.2)" stroke="rgba(50,108,229,0.55)" strokeWidth="1" />
        <text x={NEST.x + NEST.w - 28} y={NEST.y + 18} textAnchor="middle" fontSize="8.5"
          fontWeight="700" fill="#326CE5">K8s</text>
      </g>

      {/* ── Phase 2: NestJS→SQS + SQS + events ── */}
      <g style={vis(2)}>
        <line x1={CX} y1={NEST_BOT} x2={CX} y2={SQS.y}
          stroke="rgba(255,153,0,0.45)" strokeWidth="1.5" markerEnd="url(#goms-arrow)" />
        <rect x={SQS.x} y={SQS.y} width={SQS.w} height={SQS.h} rx={SQS.rx}
          fill="rgba(255,153,0,0.08)" stroke="rgba(255,153,0,0.55)" strokeWidth="1.8" />
        <text x={CX} y={SQS.y + 18} textAnchor="middle" fontSize="11" fontWeight="700"
          letterSpacing="1" fill="rgba(255,153,0,0.92)">AWS SQS</text>
        {SQS_EVENTS.map(({ label, color }, i) => (
          <g key={label}>
            <rect
              x={EVT_X0 + i * (EVT_W + EVT_GAP)} y={SQS.y + 28}
              width={EVT_W} height={18} rx="4"
              fill={`${color}15`} stroke={`${color}45`} strokeWidth="1"
            />
            <text
              x={EVT_X0 + i * (EVT_W + EVT_GAP) + EVT_W / 2}
              y={SQS.y + 40}
              textAnchor="middle" fontSize="7.5" fontWeight="600" fill={color}
            >{label}</text>
          </g>
        ))}
      </g>

      {/* ── Phase 3: SQS→Lambda + Lambda ── */}
      <g style={vis(3)}>
        <line x1={CX} y1={SQS_BOT} x2={CX} y2={LAM.y}
          stroke="rgba(168,85,247,0.45)" strokeWidth="1.5" markerEnd="url(#goms-arrow)" />
        <rect x={LAM.x} y={LAM.y} width={LAM.w} height={LAM.h} rx={LAM.rx}
          fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.55)" strokeWidth="1.8" />
        <text x={CX} y={LAM.y + 19} textAnchor="middle" fontSize="11" fontWeight="700"
          letterSpacing="1" fill="rgba(168,85,247,0.92)">AWS Lambda</text>
        <text x={CX} y={LAM.y + 34} textAnchor="middle" fontSize="9" fontWeight="500"
          fill="rgba(255,255,255,0.35)">Event Post-Processing</text>
      </g>

      {/* ── Phase 4: Lambda→SNS + SNS pulses + fan-out + services ── */}
      <g style={vis(4)}>
        {/* Lambda→SNS */}
        <line x1={CX} y1={LAM_BOT} x2={SNS.cx} y2={SNS.cy - SNS.r}
          stroke="rgba(255,153,0,0.45)" strokeWidth="1.5" markerEnd="url(#goms-arrow)" />

        {/* SNS pulse rings */}
        {[0, 0.8, 1.6].map((beg, i) => (
          <circle key={i} cx={SNS.cx} cy={SNS.cy} r={SNS.r} fill="none"
            stroke="rgba(255,153,0,0.4)">
            <animate attributeName="r" from={SNS.r} to={SNS.r * 2.1}
              dur="2.4s" begin={`${beg}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.5" to="0"
              dur="2.4s" begin={`${beg}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* SNS circle */}
        <circle cx={SNS.cx} cy={SNS.cy} r={SNS.r}
          fill="rgba(255,153,0,0.1)" stroke="rgba(255,153,0,0.82)"
          strokeWidth="1.8" filter="url(#goms-glow)" />
        <text x={SNS.cx} y={SNS.cy - 2} textAnchor="middle" fontSize="11"
          fontWeight="700" fill="rgba(255,153,0,1)">AWS SNS</text>
        <text x={SNS.cx} y={SNS.cy + 14} textAnchor="middle" fontSize="9"
          fontWeight="500" fill="rgba(255,153,0,0.6)">Fan-out Topic</text>

        {/* Fan-out paths */}
        {SERVICES.map((svc) => (
          <path key={svc.label}
            d={fanPath(svc.cx, SVC_Y - SVC_R)}
            stroke={svc.color} strokeWidth="1.5" fill="none" opacity="0.3"
          />
        ))}

        {/* Animated dots */}
        {SERVICES.map((svc, i) =>
          [0, 1.6, 3.2].map((beg, j) => (
            <circle key={`d-${i}-${j}`} r="4.5" fill={svc.color} opacity="0">
              <animateMotion dur="1.5s" begin={`${i * 0.55 + beg}s`}
                repeatCount="indefinite" path={fanPath(svc.cx, SVC_Y - SVC_R)} />
              <animate attributeName="opacity" from="0.9" to="0.9" dur="1.5s"
                begin={`${i * 0.55 + beg}s`} repeatCount="indefinite" fill="remove" />
            </circle>
          ))
        )}

        {/* Service circles */}
        {SERVICES.map((svc, i) => (
          <g key={svc.label}>
            {[0, 1.5, 3.0].map((beg, j) => (
              <circle key={j} cx={svc.cx} cy={SVC_Y} r={SVC_R} fill="none" stroke={svc.color}>
                <animate attributeName="r" from={SVC_R} to={SVC_R * 1.9}
                  dur="1.6s" begin={`${i * 0.5 + beg}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.35" to="0"
                  dur="1.6s" begin={`${i * 0.5 + beg}s`} repeatCount="indefinite" />
              </circle>
            ))}
            <circle cx={svc.cx} cy={SVC_Y} r={SVC_R}
              fill={`${svc.color}15`} stroke={`${svc.color}60`} strokeWidth="1.5" />
            <text x={svc.cx} y={SVC_Y + 5} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={svc.color}>{svc.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};
