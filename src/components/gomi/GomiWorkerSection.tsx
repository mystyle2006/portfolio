"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";

const W = 1440;
const H = 680;
const MAX_PHASE = 3;

// Lambda grid: 3 cols × 4 rows
const POD_SIZE = 80;
const POD_ICON = 52;
const POD_GAP  = 24;

const LAMBDA_BOX = { left: 560, top: 120, width: 840, height: 500 };
const GRID_W = 3 * POD_SIZE + 2 * POD_GAP; // 288
const GRID_H = 4 * POD_SIZE + 3 * POD_GAP; // 392
const GRID_LEFT = LAMBDA_BOX.left + (LAMBDA_BOX.width  - GRID_W) / 2; // 836
const GRID_TOP  = LAMBDA_BOX.top  + (LAMBDA_BOX.height - GRID_H) / 2; // 174

const LAMBDAS = Array.from({ length: 12 }, (_, i) => ({
  cx: GRID_LEFT + (i % 3) * (POD_SIZE + POD_GAP) + POD_SIZE / 2,
  cy: GRID_TOP  + Math.floor(i / 3) * (POD_SIZE + POD_GAP) + POD_SIZE / 2,
  appearPhase: i < 3 ? 1 : i < 9 ? 2 : 3,
}));

const SQS_BOX = { left: 80, top: 120, width: 400, height: 500 };
const SQS_CX  = SQS_BOX.left + SQS_BOX.width / 2; // 280

// phase별 SQS/Lambda 수치
const FILL_PCT     = [0, 24, 62, 92];
const QUEUE_COUNT  = ["—", "328", "1,842", "4,900+"];
const LAMBDA_COUNT = ["—", "3", "9", "12"];

const SQS_EVENTS = [
  { label: "order.created",   color: "#34D399" },
  { label: "order.updated",   color: "#FBBF24" },
  { label: "order.cancelled", color: "#F87171" },
];

export const GomiWorkerSection = ({
  onAnimationComplete,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
}) => {
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);

  useEffect(() => {
    if (skipAnimation) return;
    const t: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase(0), 200),
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2200),
    ];
    t.push(setTimeout(() => onAnimationComplete?.(), 3000));
    return () => t.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity:    phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  const fillPct    = phase >= 0 ? FILL_PCT[phase]    : 0;
  const queueNum   = phase >= 0 ? QUEUE_COUNT[phase]  : "—";
  const lambdaNum  = phase >= 0 ? LAMBDA_COUNT[phase] : "—";

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff", borderRadius: 20 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 0, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          SQS-Driven Lambda Auto Scaling
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>
          As order volume surges, events accumulate in SQS. Lambda monitors queue depth and <br />
          automatically provisions concurrent workers — scaling from 3 to 12 instances on demand.
        </p>
      </div>

      {/* ── SQS 박스 ── */}
      <div style={{
        position: "absolute",
        left: SQS_BOX.left, top: SQS_BOX.top,
        width: SQS_BOX.width, height: SQS_BOX.height,
        border: "1.5px dashed rgba(255,153,0,0.35)", borderRadius: 14,
        pointerEvents: "none",
        ...fade(0),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 14,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,153,0,0.7)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Image src="/icons/aws_icon.png" width={14} height={14} alt="AWS" style={{ objectFit: "contain" }} />
          AWS SQS
        </div>
      </div>

      {/* SQS 아이콘 */}
      <div style={{
        position: "absolute",
        left: SQS_CX - 32, top: 148,
        width: 64, display: "flex", flexDirection: "column", alignItems: "center",
        ...fade(0),
      }}>
        <Image src="/icons/aws_sqs_icon.webp" width={64} height={64} alt="SQS" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,153,0,0.85)", marginTop: 6, whiteSpace: "nowrap" }}>
          Event Queue
        </span>
      </div>

      {/* Queue depth 숫자 */}
      <div style={{
        position: "absolute",
        left: SQS_BOX.left + 20, top: 248,
        width: SQS_BOX.width - 40,
        display: "flex", flexDirection: "column", alignItems: "center",
        ...fade(0),
      }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", fontWeight: 600 }}>
          QUEUE DEPTH
        </span>
        <span style={{
          fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em",
          color: phase >= 3 ? "#F87171" : phase >= 2 ? "#FB923C" : "#FBBF24",
          transition: "color 0.6s ease",
          marginTop: 4,
        }}>
          {queueNum}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>events</span>
      </div>

      {/* Fill bar */}
      <div style={{
        position: "absolute",
        left: SQS_CX - 80, top: 340,
        width: 160, height: 240,
        border: "1px solid rgba(255,153,0,0.25)", borderRadius: 8,
        overflow: "hidden",
        background: "rgba(255,153,0,0.03)",
        ...fade(0),
      }}>
        {/* 채워지는 컬러 fill */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: `${fillPct}%`,
          background: "linear-gradient(to top, rgba(239,68,68,0.45), rgba(251,191,36,0.28))",
          transition: "height 1s ease",
          borderRadius: "0 0 7px 7px",
        }} />
        {/* 이벤트 태그 (fill 위에 표시) */}
        <div style={{
          position: "absolute", bottom: 8, left: 8, right: 8,
          display: "flex", flexDirection: "column", gap: 4,
          opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          {SQS_EVENTS.map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 화살표 (SQS → Lambda) ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}
        viewBox={`0 0 ${W} ${H}`}
      >
        <defs>
          <marker id="gwrk-ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.3)" />
          </marker>
        </defs>
        <path
          d={`M 482 370 C 510 370, 530 370, 558 370`}
          stroke="rgba(255,255,255,0.2)" strokeWidth={1.5}
          fill="none" markerEnd="url(#gwrk-ah)"
          style={fade(1)}
        />
      </svg>

      {/* 화살표 레이블 */}
      <div style={{
        position: "absolute",
        left: 488, top: 350,
        fontSize: 10, fontWeight: 600,
        color: "rgba(255,255,255,0.3)",
        whiteSpace: "nowrap",
        ...fade(1),
      }}>
        triggers scaling
      </div>

      {/* ── Lambda 박스 ── */}
      <div style={{
        position: "absolute",
        left: LAMBDA_BOX.left, top: LAMBDA_BOX.top,
        width: LAMBDA_BOX.width, height: LAMBDA_BOX.height,
        border: "1.5px dashed rgba(168,85,247,0.35)", borderRadius: 14,
        pointerEvents: "none",
        ...fade(0),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 14,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(168,85,247,0.75)",
        }}>
          Lambda Pool
        </div>

        {/* Concurrency 카운터 */}
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 8, padding: "5px 14px", whiteSpace: "nowrap",
          opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          <span style={{ fontSize: 11, color: "rgba(168,85,247,0.85)", fontWeight: 700 }}>
            Concurrency
          </span>
          <span style={{
            fontSize: 16, fontWeight: 800,
            color: "rgba(255,255,255,0.9)",
            transition: "color 0.5s ease",
          }}>
            {lambdaNum}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>instances</span>
        </div>
      </div>

      {/* Lambda 인스턴스 그리드 */}
      {LAMBDAS.map((lam, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: lam.cx - POD_SIZE / 2,
            top:  lam.cy - POD_SIZE / 2,
            width: POD_SIZE, height: POD_SIZE, borderRadius: "50%",
            background: "rgba(168,85,247,0.1)",
            border: "1.5px solid rgba(168,85,247,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: phase >= lam.appearPhase ? 1 : 0,
            transition: `opacity 0.4s ease ${(i % 3) * 80}ms`,
          }}
        >
          <Image
            src="/icons/aws_lambda_icon.png"
            width={POD_ICON} height={POD_ICON}
            alt="Lambda"
            style={{ objectFit: "contain" }}
          />
        </div>
      ))}

    </div>
  );
};
