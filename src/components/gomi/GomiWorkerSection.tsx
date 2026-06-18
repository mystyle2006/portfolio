"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1440;
const H = 680;
const ICON = 64;
const R = ICON / 2;
const MAX_PHASE = 3;

const POD_SIZE = 60;
const POD_ICON = 44;

// 2×3 pod grid: bottom row = newly scaled pods (dashed)
const PODS = [
  { cx: 158, cy: 215, scaled: false },
  { cx: 238, cy: 215, scaled: false },
  { cx: 158, cy: 315, scaled: false },
  { cx: 238, cy: 315, scaled: false },
  { cx: 158, cy: 415, scaled: true },
  { cx: 238, cy: 415, scaled: true },
];

type NodeDef = { cx: number; cy: number; icon: string; label: string; sub?: string; phase: number };

const NODES: Record<string, NodeDef> = {
  sqs:     { cx: 600,  cy: 315, icon: "/icons/aws_sqs_icon.webp",          label: "AWS SQS",      sub: "Event Buffer",    phase: 1 },
  lambda1: { cx: 890,  cy: 215, icon: "/icons/aws_lambda_icon.png",        label: "λ Worker",     sub: "order.created",   phase: 2 },
  lambda2: { cx: 890,  cy: 315, icon: "/icons/aws_lambda_icon.png",        label: "λ Worker",     sub: "order.updated",   phase: 2 },
  lambda3: { cx: 890,  cy: 415, icon: "/icons/aws_lambda_icon.png",        label: "λ Worker",     sub: "order.cancelled", phase: 2 },
  oms:     { cx: 1190, cy: 215, icon: "/icons/client_icon.png",            label: "OMS",          sub: "Order Update",    phase: 3 },
  wms:     { cx: 1190, cy: 315, icon: "/icons/truck.png",                  label: "WMS",          sub: "Stock Sync",      phase: 3 },
  notify:  { cx: 1190, cy: 415, icon: "/icons/push_notification_icon.png", label: "Notification", sub: "FCM / APNs",      phase: 3 },
};

type ArrowDef = { x1: number; y1: number; x2: number; y2: number; phase: number };

const ARROWS: ArrowDef[] = [
  // K8s (box right) → SQS
  { x1: 355, y1: 315, x2: 568, y2: 315, phase: 1 },
  // SQS → Lambda workers
  { x1: 632, y1: 303, x2: 858, y2: 215, phase: 2 },
  { x1: 632, y1: 315, x2: 858, y2: 315, phase: 2 },
  { x1: 632, y1: 327, x2: 858, y2: 415, phase: 2 },
  // Lambda workers → Downstream
  { x1: 922, y1: 215, x2: 1158, y2: 215, phase: 3 },
  { x1: 922, y1: 315, x2: 1158, y2: 315, phase: 3 },
  { x1: 922, y1: 415, x2: 1158, y2: 415, phase: 3 },
];

function bezier(a: ArrowDef): string {
  const dx = Math.abs(a.x2 - a.x1) * 0.45;
  return `M ${a.x1} ${a.y1} C ${a.x1 + dx} ${a.y1}, ${a.x2 - dx} ${a.y2}, ${a.x2} ${a.y2}`;
}

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
  const { panTo } = useCanvas();
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);

  useEffect(() => {
    if (skipAnimation) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let p = 0; p <= MAX_PHASE; p++) {
      timers.push(setTimeout(() => setPhase(p), 200 + p * 400));
    }
    timers.push(setTimeout(() => onAnimationComplete?.(), 200 + MAX_PHASE * 400 + 600));
    return () => timers.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff", borderRadius: 20 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 0, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Worker Processing Scalability
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>
          Webhook workers scale out horizontally on Kubernetes via HPA, decoupled from order processing. <br />
          SQS buffers incoming events while Lambda handles each order type concurrently — each layer scales independently.
        </p>
      </div>

      {/* Kubernetes Cluster 박스 */}
      <div style={{
        position: "absolute", left: 55, top: 120, width: 300, height: 500,
        border: "1.5px dashed rgba(50,108,229,0.4)", borderRadius: 12,
        pointerEvents: "none", ...fade(0),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 12,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(50,108,229,0.8)",
        }}>
          Kubernetes Cluster
        </div>
        {/* HPA 뱃지 */}
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(50,108,229,0.08)", border: "1px solid rgba(50,108,229,0.3)",
          borderRadius: 8, padding: "4px 12px", whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(50,108,229,0.9)", letterSpacing: "0.08em" }}>HPA</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>min 2 → max 10 replicas</span>
        </div>
      </div>

      {/* Lambda Pool 박스 */}
      <div style={{
        position: "absolute", left: 795, top: 120, width: 260, height: 500,
        border: "1.5px dashed rgba(168,85,247,0.35)", borderRadius: 12,
        pointerEvents: "none", ...fade(2),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 12,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(168,85,247,0.75)",
        }}>
          Lambda Pool
        </div>
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 8, padding: "4px 12px", whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Concurrent Executions</span>
        </div>
      </div>

      {/* Downstream 박스 */}
      <div style={{
        position: "absolute", left: 1105, top: 120, width: 290, height: 500,
        border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12,
        pointerEvents: "none", ...fade(3),
      }}>
        <span style={{
          position: "absolute", top: -11, left: 10,
          background: "#0f1117", padding: "0 6px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)",
        }}>
          Downstream Services
        </span>
      </div>

      {/* K8s Worker Pods */}
      {PODS.map((pod, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: pod.cx - POD_SIZE / 2,
            top: pod.cy - POD_SIZE / 2,
            width: POD_SIZE, height: POD_SIZE, borderRadius: "50%",
            background: pod.scaled ? "rgba(50,108,229,0.06)" : "rgba(224,35,78,0.1)",
            border: pod.scaled
              ? "1.5px dashed rgba(50,108,229,0.5)"
              : "1.5px solid rgba(224,35,78,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: phase >= 0 ? (pod.scaled ? 0.6 : 1) : 0,
            transition: `opacity 0.5s ease ${i * 80}ms`,
          }}
        >
          <Image src="/icons/nest_icon.png" width={POD_ICON} height={POD_ICON} alt="Worker" style={{ objectFit: "contain" }} />
        </div>
      ))}

      {/* scale-out 레이블 */}
      <div style={{
        position: "absolute",
        left: 163, top: 380,
        fontSize: 10, fontWeight: 600,
        color: "rgba(50,108,229,0.65)",
        letterSpacing: "0.04em",
        ...fade(0),
      }}>
        ↑ scaling out
      </div>

      {/* SQS 이벤트 태그 */}
      <div style={{
        position: "absolute",
        left: 600 - 62,
        top: 315 + R + 12,
        display: "flex", flexDirection: "column", gap: 3,
        ...fade(1),
      }}>
        {SQS_EVENTS.map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* SVG 화살표 */}
      <svg
        style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}
        viewBox={`0 0 ${W} ${H}`}
      >
        <defs>
          <marker id="gwrk-ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.28)" />
          </marker>
        </defs>
        {ARROWS.map((a, i) => (
          <path
            key={i}
            d={bezier(a)}
            stroke="rgba(255,255,255,0.18)" strokeWidth={1.5}
            fill="none" markerEnd="url(#gwrk-ah)"
            style={{ opacity: phase >= a.phase ? 1 : 0, transition: "opacity 0.5s ease" }}
          />
        ))}
      </svg>

      {/* 노드 */}
      {Object.entries(NODES).map(([key, node]) => (
        <div
          key={key}
          style={{
            position: "absolute",
            left: node.cx - R,
            top: node.cy - R,
            width: ICON,
            display: "flex", flexDirection: "column", alignItems: "center",
            ...fade(node.phase),
          }}
        >
          <Image src={node.icon} width={ICON} height={ICON} alt={node.label} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)", whiteSpace: "nowrap", marginTop: 6 }}>
            {node.label}
          </span>
          {node.sub && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap", marginTop: 2 }}>
              {node.sub}
            </span>
          )}
        </div>
      ))}

      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => panTo(3348, -87)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          width: 44, height: 44, borderRadius: "50%",
          background: "#ffffff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 3L3 13M3 13H9M3 13V7" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
