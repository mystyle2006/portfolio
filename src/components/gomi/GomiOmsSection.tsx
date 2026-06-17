"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1440;
const H = 680;
const ICON = 64;
const R    = ICON / 2;
const MAX_PHASE = 5;

type NodeDef = {
  cx: number; cy: number;
  icon: string; label: string; sub?: string;
  phase: number;
};

const NODES: Record<string, NodeDef> = {
  tiki:     { cx: 88,   cy: 195, icon: "/icons/tiki_icon.png",              label: "Tiki",         sub: "Webhook",       phase: 0 },
  lazada:   { cx: 88,   cy: 315, icon: "/icons/lazada_icon.png",            label: "Lazada",       sub: "Webhook",       phase: 0 },
  shopee:   { cx: 88,   cy: 435, icon: "/icons/shopee_icon.png",            label: "Shopee",       sub: "Webhook",       phase: 0 },
  gomimall: { cx: 88,   cy: 555, icon: "/icons/gomimall_icon.png",          label: "GomiMall",     sub: "Webhook",       phase: 0 },
  sqs:      { cx: 580,  cy: 260, icon: "/icons/aws_sqs_icon.webp",          label: "AWS SQS",      sub: "Event Queue",   phase: 2 },
  lambda:   { cx: 800,  cy: 260, icon: "/icons/aws_lambda_icon.png",        label: "AWS Lambda",   sub: "Consumer",      phase: 3 },
  sns:      { cx: 1020, cy: 260, icon: "/icons/aws_icon.png",               label: "AWS SNS",      sub: "Fan-out Topic", phase: 4 },
  oms:      { cx: 1300, cy: 200, icon: "/icons/client_icon.png",            label: "OMS",          sub: "Order Mgmt",    phase: 5 },
  wms:      { cx: 1300, cy: 340, icon: "/icons/truck.png",                  label: "WMS",          sub: "Warehouse",     phase: 5 },
  notify:   { cx: 1300, cy: 480, icon: "/icons/push_notification_icon.png", label: "Notification", sub: "FCM / APNs",    phase: 5 },
};

type ArrowDef = {
  x1: number; y1: number; x2: number; y2: number;
  customPath?: string; phase: number;
  color?: string; dashed?: boolean;
};

const ARROWS: ArrowDef[] = [
  // Sources → NestJS
  { x1: 120, y1: 195, x2: 294, y2: 305, phase: 1 },
  { x1: 120, y1: 315, x2: 294, y2: 355, phase: 1 },
  { x1: 120, y1: 435, x2: 294, y2: 405, phase: 1 },
  { x1: 120, y1: 555, x2: 294, y2: 437, phase: 1 },
  // NestJS → SQS
  { x1: 350, y1: 371, x2: 548, y2: 260, phase: 2 },
  // SQS → Lambda
  { x1: 612, y1: 260, x2: 768, y2: 260, phase: 3 },
  // Lambda → SNS
  { x1: 832, y1: 260, x2: 988, y2: 260, phase: 4 },
  // SNS → Services
  { x1: 1052, y1: 248, x2: 1268, y2: 200, phase: 5 },
  { x1: 1052, y1: 260, x2: 1268, y2: 340, phase: 5 },
  { x1: 1052, y1: 272, x2: 1268, y2: 480, phase: 5 },
];

function bezier(a: ArrowDef): string {
  if (a.customPath) return a.customPath;
  const dx = Math.abs(a.x2 - a.x1) * 0.45;
  return `M ${a.x1} ${a.y1} C ${a.x1 + dx} ${a.y1}, ${a.x2 - dx} ${a.y2}, ${a.x2} ${a.y2}`;
}

const SQS_EVENTS = [
  { label: "order.created",   color: "#34D399" },
  { label: "order.cancelled", color: "#FBBF24" },
  { label: "order.updated",   color: "#F87171" },
];

export const GomiOmsSection = ({
  onAnimationComplete,
  onNavReady,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  onNavReady?: () => void;
  skipAnimation?: boolean;
}) => {
  const { panTo } = useCanvas();
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);

  useEffect(() => {
    if (skipAnimation) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let p = 0; p <= MAX_PHASE; p++) {
      timers.push(setTimeout(() => setPhase(p), 200 + p * 380));
    }
    timers.push(setTimeout(() => {
      onNavReady?.();
      onAnimationComplete?.();
    }, 200 + MAX_PHASE * 380 + 600));
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
          Multi-Platform Order Event Pipeline
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>
          Incoming orders from Tiki, Lazada, Shopee, and Gomi are received via webhooks on a Kubernetes-backed NestJS server. <br />
          Processed events are published to SQS and consumed by AWS Lambda, which orchestrates downstream delivery through SNS fan-out to OMS, WMS, and notification services.
        </p>
      </div>

      {/* Webhook Sources 그룹 박스 */}
      <div style={{
        position: "absolute", left: 24, top: 130, width: 132, height: 470,
        border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 12,
        pointerEvents: "none", ...fade(0),
      }}>
        <span style={{
          position: "absolute", top: -11, left: 10,
          background: "#0f1117", padding: "0 6px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.32)",
        }}>
          Webhook Sources
        </span>
      </div>

      {/* Kubernetes Cluster 박스 */}
      <div style={{
        position: "absolute", left: 224, top: 245, width: 195, height: 264,
        border: "1.5px dashed rgba(50,108,229,0.4)", borderRadius: 12,
        pointerEvents: "none", ...fade(1),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 12,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(50,108,229,0.8)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          Kubernetes Cluster
        </div>
      </div>

      {/* AWS Cloud 박스 */}
      <div style={{
        position: "absolute", left: 446, top: 148, width: 748, height: 270,
        border: "1.5px dashed rgba(255,153,0,0.3)", borderRadius: 14,
        pointerEvents: "none", ...fade(2),
      }}>
        <div style={{
          position: "absolute", top: -13, left: 14,
          background: "#0f1117", padding: "0 8px",
          fontSize: 12, fontWeight: 600, color: "rgba(255,153,0,0.65)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Image src="/icons/aws_icon.png" width={20} height={20} alt="AWS" style={{ objectFit: "contain" }} />
          AWS Cloud
        </div>
      </div>

      {/* Downstream 박스 */}
      <div style={{
        position: "absolute", left: 1204, top: 138, width: 216, height: 404,
        border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12,
        pointerEvents: "none", ...fade(5),
      }}>
        <span style={{
          position: "absolute", top: -11, left: 10,
          background: "#0f1117", padding: "0 6px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)",
        }}>
          Downstream Services
        </span>
      </div>

      {/* NestJS 3-pod 수직 배열 (K8s replicas) */}
      <div style={{ position: "absolute", left: 294, top: 277, width: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, ...fade(1) }}>
        <Image src="/icons/nest_icon.png" width={56} height={56} alt="NestJS Pod" style={{ objectFit: "contain" }} />
        <Image src="/icons/nest_icon.png" width={56} height={56} alt="NestJS Pod" style={{ objectFit: "contain" }} />
        <Image src="/icons/nest_icon.png" width={56} height={56} alt="NestJS Pod" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)", whiteSpace: "nowrap", marginTop: 2 }}>
          NestJS
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap", marginTop: -6 }}>
          Webhook Server
        </span>
      </div>

      {/* SVG 화살표 */}
      <svg
        style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}
        viewBox={`0 0 ${W} ${H}`}
      >
        <defs>
          <marker id="goms-ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.28)" />
          </marker>
        </defs>
        {ARROWS.map((a, i) => (
          <path
            key={i}
            d={bezier(a)}
            stroke={a.color ?? "rgba(255,255,255,0.18)"}
            strokeWidth={1.5}
            fill="none"
            markerEnd="url(#goms-ah)"
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
          <Image
            src={node.icon}
            width={ICON} height={ICON}
            alt={node.label}
            style={{ objectFit: "contain" }}
          />
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

      {/* SQS 이벤트 태그 */}
      <div style={{
        position: "absolute",
        left: 580 - 110,
        top: 260 + R + 40,
        display: "flex", flexDirection: "column", gap: 4,
        ...fade(2),
      }}>
        {SQS_EVENTS.map(({ label, color }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => panTo(1596, 761)}
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
