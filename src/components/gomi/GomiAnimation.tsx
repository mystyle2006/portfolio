"use client";

import { useEffect, useRef, useState } from "react";

// 정사각형 뷰박스: gap=80, R=60 → 3*80 + 4*60 = 480
const VW = 480;
const VH = 480;
const R  = 60;

// 모든 간격 80px 균등: outer=80, inter=80
const NODES = [
  { id: 0, label: ["Real-Time", "Multi-Channel", "Order Integration"], color: "#60A5FA", cx: 140, cy: 140 },
  { id: 1, label: ["Batch Processing", "Scalability"],                 color: "#34D399", cx: 340, cy: 140 },
  { id: 2, label: ["Duplicate", "Settlement", "Prevention"],           color: "#FBBF24", cx: 140, cy: 340 },
  { id: 3, label: ["OMS/WMS", "Data Consistency"],                     color: "#A78BFA", cx: 340, cy: 340 },
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
  const [phase,      setPhase]      = useState(skipAnimation ? 3 : -1);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    [0, 260, 520, 780].forEach((ms, i) =>
      timers.push(setTimeout(() => setPhase(i), ms))
    );
    timers.push(setTimeout(() => {
      if (!completedRef.current) { completedRef.current = true; onComplete(); }
    }, 1200));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ display: "block" }}>
      {NODES.map(({ id, label, color, cx, cy }, i) => {
        const visible = phase >= i;
        return (
          <g key={id} style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}>
            <circle cx={cx} cy={cy} r={R + 18} fill={`${color}0d`} />
            <circle
              cx={cx} cy={cy} r={R}
              fill="rgba(10,10,16,0.88)"
              stroke={color}
              strokeWidth="1.8"
              style={{ filter: `drop-shadow(0 0 14px ${color}55)` }}
            />
            {label.map((line, li) => {
              const isLast = li === label.length - 1;
              const lineOffset = (li - (label.length - 1) / 2) * 19;
              return (
                <text
                  key={li}
                  x={cx}
                  y={cy + lineOffset}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isLast ? color : "rgba(255,255,255,0.55)"}
                  fontSize={isLast ? 13 : 11.5}
                  fontWeight={isLast ? 700 : 500}
                  style={{ userSelect: "none" }}
                >
                  {line}
                </text>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};
