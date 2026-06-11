"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1600;
const H = 820;
const ICON = 64;
const R   = ICON / 2;
const MAX_PHASE = 5;

type NodeDef = {
  cx: number; cy: number;
  icon: string;
  label: string;
  sub?: string;
  phase: number;
};

const NODES: Record<string, NodeDef> = {
  clientMobile:   { cx: 90,   cy: 195, icon: "/icons/client_icon.png",            label: "Mobile App",        sub: "iOS / Android", phase: 0 },
  clientTrucking: { cx: 90,   cy: 335, icon: "/icons/client_icon.png",            label: "Trucking Co.",      sub: "Web",           phase: 0 },
  clientAdmin:    { cx: 90,   cy: 475, icon: "/icons/client_icon.png",            label: "Admin",             sub: "Web",           phase: 0 },
  alb:            { cx: 285,  cy: 335, icon: "/icons/aws_elb_icon.webp",          label: "Load Balancer",     sub: "ALB",           phase: 1 },
  apiServers:     { cx: 500,  cy: 245, icon: "/icons/spring_java_icon.png",       label: "API Servers",       sub: "Spring Boot",   phase: 2 },
  batchServices:  { cx: 500,  cy: 460, icon: "/icons/spring_java_icon.png",       label: "Batch Services",    sub: "Spring Boot",   phase: 2 },
  rds:            { cx: 775,  cy: 195, icon: "/icons/aws_rds_icon.webp",          label: "Amazon RDS",        sub: "MySQL",         phase: 3 },
  elasticache:    { cx: 775,  cy: 335, icon: "/icons/redis_icon.png",             label: "ElastiCache",       sub: "Redis",         phase: 3 },
  s3:             { cx: 775,  cy: 475, icon: "/icons/aws_s3_icon.webp",           label: "Amazon S3",         sub: "File Storage",  phase: 3 },
  sqs:            { cx: 455,  cy: 665, icon: "/icons/aws_sqs_icon.webp",          label: "AWS SQS",           sub: "Queue",         phase: 4 },
  lambda:         { cx: 645,  cy: 665, icon: "/icons/aws_lambda_icon.png",        label: "AWS Lambda",        sub: "Workers",       phase: 4 },
  pushNotif:      { cx: 1065, cy: 195, icon: "/icons/push_notification_icon.png", label: "Push Notification", sub: "FCM / APNs",    phase: 5 },
  emailSvc:       { cx: 1065, cy: 325, icon: "/icons/mailgun_icon.png",           label: "Email Service",     sub: "Mailgun",       phase: 5 },
  smsSvc:         { cx: 1065, cy: 455, icon: "/icons/sms_icon.png",              label: "SMS Service",        sub: "Twilio",        phase: 5 },
  payment:        { cx: 1065, cy: 585, icon: "/icons/payment_icon.png",           label: "Payment Gateway",   sub: "",              phase: 5 },
};

type Arrow = {
  x1: number; y1: number;
  x2: number; y2: number;
  vertical?: boolean;
  color?: string;
  dashed?: boolean;
  phase: number;
};

const ARROWS: Arrow[] = [
  // Clients → ALB
  { x1: 122, y1: 195, x2: 253, y2: 320, phase: 1 },
  { x1: 122, y1: 335, x2: 253, y2: 335, phase: 1 },
  { x1: 122, y1: 475, x2: 253, y2: 350, phase: 1 },
  // ALB → API + Batch
  { x1: 317, y1: 318, x2: 468, y2: 245, phase: 2 },
  { x1: 317, y1: 352, x2: 468, y2: 460, phase: 2 },
  // API ↔ Batch (Pub/Sub — dashed blue bidirectional)
  { x1: 483, y1: 277, x2: 483, y2: 428, vertical: true, color: "rgba(99,179,237,0.5)", dashed: true, phase: 2 },
  // API → Stores
  { x1: 532, y1: 230, x2: 743, y2: 195, phase: 3 },
  { x1: 532, y1: 248, x2: 743, y2: 335, phase: 3 },
  { x1: 532, y1: 265, x2: 743, y2: 468, phase: 3 },
  // Batch → SQS
  { x1: 462, y1: 492, x2: 447, y2: 633, phase: 4 },
  // SQS → Lambda
  { x1: 487, y1: 665, x2: 613, y2: 665, phase: 4 },
  // Lambda → External Services
  { x1: 677, y1: 648, x2: 1033, y2: 325, phase: 5 },
  { x1: 677, y1: 660, x2: 1033, y2: 455, phase: 5 },
  { x1: 677, y1: 672, x2: 1033, y2: 578, phase: 5 },
  // ElastiCache → Push (Pub/Sub Real-time)
  { x1: 807, y1: 318, x2: 1033, y2: 195, phase: 5 },
];

function bezier(a: Arrow): string {
  if (a.vertical) return `M ${a.x1} ${a.y1} L ${a.x2} ${a.y2}`;
  const dx = Math.abs(a.x2 - a.x1) * 0.45;
  return `M ${a.x1} ${a.y1} C ${a.x1 + dx} ${a.y1}, ${a.x2 - dx} ${a.y2}, ${a.x2} ${a.y2}`;
}

export const JelpalaSystemDesignSection = ({
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
      timers.push(setTimeout(() => setPhase(p), 300 + p * 380));
    }
    timers.push(setTimeout(() => onAnimationComplete?.(), 300 + MAX_PHASE * 380 + 700));
    return () => timers.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff", borderRadius: 20, overflow: "hidden" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 배경 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #0f1117 0%, #161b27 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
      }} />

      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 30, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Jelpala System Design
        </h2>
      </div>

      {/* AWS Cloud 테두리 */}
      <div style={{
        position: "absolute", left: 195, top: 105, width: 740, height: 665,
        border: "1.5px dashed rgba(255,153,0,0.3)", borderRadius: 16,
        pointerEvents: "none", ...fade(1),
      }}>
        <div style={{
          position: "absolute", top: -13, left: 14,
          background: "#0f1117", padding: "0 8px",
          fontSize: 12, fontWeight: 600, color: "rgba(255,153,0,0.65)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Image src="/icons/aws_icon.png" width={16} height={16} alt="AWS" style={{ objectFit: "contain" }} />
          AWS Cloud
        </div>
      </div>

      {/* ECS Cluster 박스 */}
      <div style={{
        position: "absolute", left: 380, top: 155, width: 290, height: 380,
        border: "1px solid rgba(255,153,0,0.2)", borderRadius: 10,
        background: "rgba(255,153,0,0.025)",
        pointerEvents: "none", ...fade(2),
      }}>
        <div style={{
          position: "absolute", top: -11, left: 10,
          background: "#0f1117", padding: "0 6px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,153,0,0.5)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Image src="/icons/aws_ecs.webp" width={13} height={13} alt="ECS" style={{ objectFit: "contain" }} />
          Amazon ECS Cluster
        </div>
      </div>

      {/* External Services 박스 */}
      <div style={{
        position: "absolute", left: 985, top: 140, width: 210, height: 490,
        border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
        background: "rgba(255,255,255,0.018)",
        pointerEvents: "none", ...fade(5),
      }}>
        <span style={{
          position: "absolute", top: -11, left: 10,
          background: "#0f1117", padding: "0 6px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.38)",
        }}>
          External Services
        </span>
      </div>

      {/* SVG 화살표 */}
      <svg
        style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}
        viewBox={`0 0 ${W} ${H}`}
      >
        <defs>
          <marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.28)" />
          </marker>
          <marker id="ah-blue" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(99,179,237,0.6)" />
          </marker>
          <marker id="ah-blue-rev" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto-start-reverse">
            <path d="M7,0 L7,6 L0,3 z" fill="rgba(99,179,237,0.6)" />
          </marker>
        </defs>

        {ARROWS.map((a, i) => (
          <path
            key={i}
            d={bezier(a)}
            stroke={a.color ?? "rgba(255,255,255,0.18)"}
            strokeWidth={1.5}
            fill="none"
            strokeDasharray={a.dashed ? "4 3" : undefined}
            markerEnd={a.vertical ? "url(#ah-blue)" : "url(#ah)"}
            markerStart={a.vertical ? "url(#ah-blue-rev)" : undefined}
            style={{ opacity: phase >= a.phase ? 1 : 0, transition: "opacity 0.5s ease" }}
          />
        ))}

        {/* Publish Events 레이블 */}
        <text
          x={415} y={578} fontSize={10} fill="rgba(255,255,255,0.3)"
          textAnchor="middle"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }}
        >
          Publish Events (Email / SMS)
        </text>
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
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.82)", whiteSpace: "nowrap", marginTop: 6 }}>
            {node.label}
          </span>
          {node.sub && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap", marginTop: 2 }}>
              {node.sub}
            </span>
          )}
        </div>
      ))}

      {/* Pub/Sub 배지 */}
      <div style={{ position: "absolute", left: 516, top: 345, transform: "translateY(-50%)", ...fade(2) }}>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: "rgba(99,179,237,0.9)",
          border: "1px solid rgba(99,179,237,0.3)", borderRadius: 4,
          padding: "2px 7px", background: "rgba(99,179,237,0.08)",
          whiteSpace: "nowrap",
        }}>
          Pub / Sub
        </span>
      </div>

      {/* ElastiCache 서브 레이블 */}
      <div style={{ position: "absolute", left: 822, top: 313, ...fade(3) }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>GEO (Geospatial Index)</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", marginTop: 3 }}>Pub/Sub (Real-time)</div>
      </div>

      {/* 뒤로가기 버튼 (Jelpala 섹션으로) */}
      <button
        onClick={() => panTo(-1544, -1071)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 24, right: 24,
          width: 48, height: 48, borderRadius: "50%",
          background: "#ffffff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 4L14 14M14 14V6M14 14H6" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
