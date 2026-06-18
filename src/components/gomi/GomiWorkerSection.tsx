"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import Image from "next/image";

const W = 1440;
const H = 680;
const MAX_PHASE = 4;

/* ── Source 아이콘 ── */
const SOURCES = [
  { icon: "/icons/tiki_icon.png",     label: "Tiki",     cy: 220, color: "#64B5F6" },
  { icon: "/icons/lazada_icon.png",   label: "Lazada",   cy: 310, color: "#FFB74D" },
  { icon: "/icons/shopee_icon.png",   label: "Shopee",   cy: 400, color: "#EF5350" },
  { icon: "/icons/gomimall_icon.png", label: "GomiMall", cy: 490, color: "#66BB6A" },
];
const SRC_CX   = 100;
const SRC_ICON = 48;

// Source → SQS dot 경로 (오른쪽 엣지에서 SQS 왼쪽으로)
const DOT_PATHS = SOURCES.map(
  (s) => `M 124 ${s.cy} C 162 ${s.cy}, 192 370, 200 370`
);
const DOT_DUR   = 1.75; // seconds
const MAX_DOTS  = 5;

/* ── SQS ── */
const SQS_BOX = { left: 200, top: 120, width: 280, height: 500 };
const SQS_CX  = SQS_BOX.left + SQS_BOX.width / 2; // 340

/* ── Lambda grid: 4 cols × 4 rows = 16 ── */
const POD_SIZE = 66;
const POD_GAP  = 18;
const LAMBDA_BOX = { left: 550, top: 120, width: 860, height: 500 };
const GRID_W = 4 * POD_SIZE + 3 * POD_GAP; // 318
const GRID_H = 4 * POD_SIZE + 3 * POD_GAP; // 318
const GRID_LEFT = LAMBDA_BOX.left + (LAMBDA_BOX.width - GRID_W) / 2; // 821
const GRID_TOP  = LAMBDA_BOX.top  + (LAMBDA_BOX.height - GRID_H) / 2; // 211

const LAMBDAS = Array.from({ length: 16 }, (_, i) => ({
  cx: GRID_LEFT + (i % 4) * (POD_SIZE + POD_GAP) + POD_SIZE / 2,
  cy: GRID_TOP  + Math.floor(i / 4) * (POD_SIZE + POD_GAP) + POD_SIZE / 2,
  // 2 → 4 → 8 → 16 doubling
  appearPhase: i < 2 ? 1 : i < 4 ? 2 : i < 8 ? 3 : 4,
}));

/* ── Phase별 수치 ── */
const FILL_PCT      = [0, 22, 52, 78, 95];
const QUEUE_COUNT   = ["—", "328", "1,842", "8,400", "47,000+"];
const LAMBDA_COUNT  = [0, 2, 4, 8, 16];
const ORDER_TARGETS = [0, 520, 2100, 8900, 52000];

export const GomiWorkerSection = ({
  onAnimationComplete,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
}) => {
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);
  const [displayCount, setDisplayCount] = useState(skipAnimation ? ORDER_TARGETS[MAX_PHASE] : 0);
  const countRef = useRef(skipAnimation ? ORDER_TARGETS[MAX_PHASE] : 0);

  /* 페이즈 타이머 */
  useEffect(() => {
    if (skipAnimation) return;
    const t = [
      setTimeout(() => setPhase(0),  200),
      setTimeout(() => setPhase(1),  900),
      setTimeout(() => setPhase(2), 1700),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 3300),
    ];
    t.push(setTimeout(() => onAnimationComplete?.(), 4100));
    return () => t.forEach(clearTimeout);
  }, [skipAnimation]);

  /* 주문 카운터 애니메이션 */
  useEffect(() => {
    if (phase < 0) return;
    const target  = ORDER_TARGETS[phase];
    const startVal = countRef.current;
    const start   = Date.now();
    const dur     = 700;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(startVal + (target - startVal) * eased);
      countRef.current = val;
      setDisplayCount(val);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [phase]);

  const fade = (p: number): CSSProperties => ({
    opacity:    phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  const fillPct   = phase >= 0 ? FILL_PCT[phase]   : 0;
  const queueNum  = phase >= 0 ? QUEUE_COUNT[phase]  : "—";
  const lambdaNum = phase >= 0 ? LAMBDA_COUNT[phase] : 0;
  const visibleDots = phase < 1 ? 0 : phase < 2 ? 1 : phase < 3 ? 2 : phase < 4 ? 3 : MAX_DOTS;

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
          automatically provisions concurrent workers — scaling from 2 to 16 instances on demand.
        </p>
      </div>

      {/* ── Order Sources 박스 ── */}
      <div style={{
        position: "absolute", left: 20, top: 120, width: 160, height: 500,
        border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 12,
        pointerEvents: "none", ...fade(0),
      }}>
        <span style={{
          position: "absolute", top: -11, left: 10,
          background: "#0f1117", padding: "0 6px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)",
        }}>
          Order Sources
        </span>
        {/* orders/min 카운터 */}
        <div style={{
          position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease",
          whiteSpace: "nowrap",
        }}>
          <span style={{
            fontSize: 19, fontWeight: 800,
            color: phase >= 4 ? "#F87171" : phase >= 3 ? "#FB923C" : "#FBBF24",
            transition: "color 0.5s ease",
          }}>
            {displayCount.toLocaleString()}{phase >= 4 ? "+" : ""}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
            orders / min
          </span>
        </div>
      </div>

      {/* Source 아이콘들 */}
      {SOURCES.map((src) => (
        <div key={src.label} style={{
          position: "absolute",
          left: SRC_CX - SRC_ICON / 2,
          top:  src.cy - SRC_ICON / 2,
          width: SRC_ICON, height: SRC_ICON,
          ...fade(0),
        }}>
          <Image src={src.icon} width={SRC_ICON} height={SRC_ICON} alt={src.label} style={{ objectFit: "contain" }} />
        </div>
      ))}

      {/* ── SQS 박스 ── */}
      <div style={{
        position: "absolute",
        left: SQS_BOX.left, top: SQS_BOX.top,
        width: SQS_BOX.width, height: SQS_BOX.height,
        border: "1.5px dashed rgba(255,153,0,0.35)", borderRadius: 14,
        pointerEvents: "none", ...fade(0),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 14,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,153,0,0.7)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Image src="/icons/aws_icon.png" width={14} height={14} alt="AWS" style={{ objectFit: "contain" }} />
          AWS SQS
        </div>
      </div>

      {/* SQS 아이콘 */}
      <div style={{
        position: "absolute", left: SQS_CX - 32, top: 152,
        width: 64, display: "flex", flexDirection: "column", alignItems: "center",
        ...fade(0),
      }}>
        <Image src="/icons/aws_sqs_icon.webp" width={64} height={64} alt="SQS" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,153,0,0.85)", marginTop: 5, whiteSpace: "nowrap" }}>
          Event Queue
        </span>
      </div>

      {/* Queue depth 숫자 */}
      <div style={{
        position: "absolute",
        left: SQS_BOX.left + 16, top: 248,
        width: SQS_BOX.width - 32,
        display: "flex", flexDirection: "column", alignItems: "center",
        ...fade(0),
      }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", fontWeight: 600 }}>
          QUEUE DEPTH
        </span>
        <span style={{
          fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 3,
          color: phase >= 4 ? "#F87171" : phase >= 3 ? "#FB923C" : "#FBBF24",
          transition: "color 0.6s ease",
        }}>
          {queueNum}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>events</span>
      </div>

      {/* Fill bar */}
      <div style={{
        position: "absolute",
        left: SQS_CX - 72, top: 318,
        width: 144, height: 238,
        border: "1px solid rgba(255,153,0,0.25)", borderRadius: 8,
        overflow: "hidden",
        background: "rgba(255,153,0,0.03)",
        ...fade(0),
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${fillPct}%`,
          background: "linear-gradient(to top, rgba(239,68,68,0.5), rgba(251,191,36,0.3))",
          transition: "height 0.9s ease",
        }} />
        <div style={{
          position: "absolute", bottom: 8, left: 8, right: 8,
          display: "flex", flexDirection: "column", gap: 4,
          opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          {[
            { label: "order.created",   color: "#34D399" },
            { label: "order.updated",   color: "#FBBF24" },
            { label: "order.cancelled", color: "#F87171" },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SVG: 도트 애니메이션 + 화살표 ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}
        viewBox={`0 0 ${W} ${H}`}
      >
        <defs>
          <marker id="gwrk-ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.3)" />
          </marker>
        </defs>

        {/* SQS → Lambda 화살표 */}
        <path
          d="M 482 370 C 508 370, 534 370, 548 370"
          stroke="rgba(255,255,255,0.2)" strokeWidth={1.5}
          fill="none" markerEnd="url(#gwrk-ah)"
          style={fade(1)}
        />

        {/* 오더 도트 애니메이션 */}
        {SOURCES.map((src, si) =>
          Array.from({ length: MAX_DOTS }, (_, di) => (
            <circle
              key={`d-${si}-${di}`}
              r={3.5}
              fill={src.color}
              style={{
                opacity: di < visibleDots ? 0.9 : 0,
                transition: "opacity 0.4s ease",
              }}
            >
              <animateMotion
                dur={`${DOT_DUR}s`}
                begin={`${di * (DOT_DUR / MAX_DOTS)}s`}
                repeatCount="indefinite"
                path={DOT_PATHS[si]}
              />
            </circle>
          ))
        )}
      </svg>

      {/* triggers scaling 레이블 */}
      <div style={{
        position: "absolute", left: 488, top: 352,
        fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)",
        whiteSpace: "nowrap", ...fade(1),
      }}>
        triggers scaling
      </div>

      {/* ── Lambda Pool 박스 ── */}
      <div style={{
        position: "absolute",
        left: LAMBDA_BOX.left, top: LAMBDA_BOX.top,
        width: LAMBDA_BOX.width, height: LAMBDA_BOX.height,
        border: "1.5px dashed rgba(168,85,247,0.35)", borderRadius: 14,
        pointerEvents: "none", ...fade(0),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 14,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(168,85,247,0.75)",
        }}>
          Lambda Pool
        </div>
        {/* Concurrency 뱃지 */}
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 8, padding: "5px 16px", whiteSpace: "nowrap",
          opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          <span style={{ fontSize: 11, color: "rgba(168,85,247,0.85)", fontWeight: 700 }}>Concurrency</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>
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
            transition: `opacity 0.35s ease ${(i % 4) * 60}ms`,
          }}
        >
          <Image
            src="/icons/aws_lambda_icon.png"
            width={44} height={44}
            alt="Lambda"
            style={{ objectFit: "contain" }}
          />
        </div>
      ))}
    </div>
  );
};
