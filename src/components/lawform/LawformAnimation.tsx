"use client";

import { useEffect, useState } from "react";

const VW = 820;
const VH = 520;

const SNS   = { x: 310, y: 175 };
const SNS_R = 58;

const CHANNELS = [
  { x: 105, y: 385, label: "Email",  color: "#60A5FA" },
  { x: 310, y: 410, label: "Push",   color: "#34D399" },
  { x: 515, y: 385, label: "SMS",    color: "#FBBF24" },
];

function fanPath(ch: { x: number; y: number }): string {
  const midY = (SNS.y + ch.y) / 2 + 18;
  return `M ${SNS.x} ${SNS.y + SNS_R} C ${SNS.x} ${midY}, ${ch.x} ${midY}, ${ch.x} ${ch.y - 30}`;
}

export const LawformAnimation = ({
  active,
  skipAnimation: _skip,
  onComplete,
}: {
  active: boolean;
  skipAnimation: boolean;
  onComplete: () => void;
}) => {
  const [count, setCount] = useState(5127);

  useEffect(() => {
    const t = setTimeout(onComplete, 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(
      () => setCount((c) => c + Math.floor(Math.random() * 4) + 1),
      820,
    );
    return () => clearInterval(id);
  }, [active]);

  return (
    <div style={{
      width: "100%", height: "100%", position: "relative",
      opacity: active ? 1 : 0,
      transform: active ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: "100%", height: "100%", marginTop: "-40px" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="lf-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 암시적 추가 fan-out 선 (노드 없음) */}
        {[
          { x:  18, y: 318 },
          { x: 200, y: 455 },
          { x: 422, y: 352 },
          { x: 608, y: 302 },
        ].map((ch, i) => (
          <path key={`ghost-${i}`} d={fanPath(ch)}
            stroke="rgba(255,255,255,0.07)" strokeWidth={1} fill="none" />
        ))}

        {/* Fan-out 연결선 */}
        {CHANNELS.map((ch, i) => (
          <path
            key={`ln-${i}`}
            d={fanPath(ch)}
            stroke={ch.color}
            strokeWidth={1.5}
            fill="none"
            opacity={0.18}
          />
        ))}

        {/* SNS 외부 펄스 링 */}
        {[0, 0.8, 1.6].map((beg, i) => (
          <circle key={`ring-${i}`} cx={SNS.x} cy={SNS.y} r={SNS_R} fill="none"
            stroke="rgba(255,153,0,0.45)">
            <animate attributeName="r" from={SNS_R} to={SNS_R * 2} dur="2.4s"
              begin={`${beg}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.5" to="0" dur="2.4s"
              begin={`${beg}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* SNS 노드 */}
        <circle cx={SNS.x} cy={SNS.y} r={SNS_R}
          fill="rgba(255,153,0,0.1)" stroke="rgba(255,153,0,0.82)" strokeWidth={1.8}
          filter="url(#lf-glow)" />
        <text x={SNS.x} y={SNS.y + 6} fontSize="16" fontWeight="800"
          fill="rgba(255,153,0,1)" textAnchor="middle">AWS SNS</text>
        <text x={SNS.x} y={SNS.y + SNS_R + 22} fontSize="13" fontWeight="600"
          fill="rgba(255,153,0,0.6)" textAnchor="middle">Fan-out Topic</text>

        {/* 채널 노드 (SQS + Lambda) */}
        {CHANNELS.map((ch, i) => (
          <g key={`ch-${i}`}>
            {/* 수신 펄스 */}
            {[0, 1.6, 3.2].map((beg, j) => (
              <circle key={j} cx={ch.x} cy={ch.y} fill="none" stroke={ch.color}>
                <animate attributeName="r" from="30" to="56" dur="1.6s"
                  begin={`${i * 0.55 + beg}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.38" to="0" dur="1.6s"
                  begin={`${i * 0.55 + beg}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {/* 노드 원 */}
            <circle cx={ch.x} cy={ch.y} r="30"
              fill={`${ch.color}18`} stroke={`${ch.color}62`} strokeWidth={1.5} />
            <text x={ch.x} y={ch.y + 6} fontSize="12" fontWeight="700"
              fill={ch.color} textAnchor="middle">{ch.label}</text>
            {/* 하단 레이블 */}
            <text x={ch.x} y={ch.y + 52} fontSize="13" fontWeight="600"
              fill="rgba(255,255,255,0.85)" textAnchor="middle">SQS + Lambda</text>
          </g>
        ))}

        {/* 이동 도트 (안 움직일 때 숨김) */}
        {CHANNELS.map((ch, i) =>
          [0, 1.6, 3.2].map((beg, j) => (
            <circle key={`dot-${i}-${j}`} r="5" fill={ch.color} opacity="0">
              <animateMotion dur="1.55s" begin={`${i * 0.55 + beg}s`}
                repeatCount="indefinite" path={fanPath(ch)} />
              <animate attributeName="opacity" from="0.95" to="0.95"
                dur="1.55s" begin={`${i * 0.55 + beg}s`}
                repeatCount="indefinite" fill="remove" />
            </circle>
          ))
        )}

        {/* 알림 카운터 */}
        <text x={672} y={125} fontSize="10" fontWeight="600" letterSpacing="2"
          fill="rgba(255,255,255,0.3)" textAnchor="middle">DELIVERED TODAY</text>
        <text x={672} y={185} fontSize="52" fontWeight="900"
          fill="#ffffff" textAnchor="middle">{count.toLocaleString()}</text>

        {/* 채널별 구분선 */}
        <line x1={610} y1={240} x2={740} y2={240}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1} />

        {/* 채널별 레이블 */}
        {CHANNELS.map((ch, i) => (
          <g key={`stat-${i}`}>
            <circle cx={614} cy={264 + i * 34} r="4" fill={ch.color} />
            <text x={626} y={269 + i * 34} fontSize="12"
              fill="rgba(255,255,255,0.52)">{ch.label}</text>
          </g>
        ))}

        {/* 하단 통계 */}
        <line x1={610} y1={370} x2={740} y2={370}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        {[
          { label: "Delivery Rate", value: "99.9%" },
          { label: "Avg Latency",   value: "< 2s"  },
        ].map(({ label, value }, i) => (
          <g key={`meta-${i}`}>
            <text x={614} y={393 + i * 30} fontSize="11"
              fill="rgba(255,255,255,0.32)">{label}</text>
            <text x={738} y={393 + i * 30} fontSize="11" fontWeight="700"
              fill="rgba(255,255,255,0.72)" textAnchor="end">{value}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};
