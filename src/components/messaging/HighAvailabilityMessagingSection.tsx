"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1600;
const H = 870;
const ICON = 60;
const R = ICON / 2;
const MAX_PHASE = 5;

type NodeDef = {
  cx: number; cy: number;
  icon: string;
  label: string;
  sub?: string;
  phase: number;
};

const NODES: Record<string, NodeDef> = {
  clientMobile: { cx: 90,   cy: 240, icon: "/icons/client_icon.png",            label: "Mobile App",   sub: "iOS / Android", phase: 0 },
  clientWeb:    { cx: 90,   cy: 380, icon: "/icons/client_icon.png",            label: "Web App",      sub: "Browser",       phase: 0 },
  lambdaPub:    { cx: 280,  cy: 310, icon: "/icons/aws_lambda_icon.png",        label: "Lambda",       sub: "Publisher",     phase: 1 },
  snsTopic:     { cx: 475,  cy: 310, icon: "/icons/aws_icon.png",               label: "SNS Topic",    sub: "Fan-out Hub",   phase: 2 },
  sqsEmail:     { cx: 680,  cy: 190, icon: "/icons/aws_sqs_icon.webp",          label: "SQS",          sub: "Email Queue",   phase: 3 },
  sqsPush:      { cx: 680,  cy: 310, icon: "/icons/aws_sqs_icon.webp",          label: "SQS",          sub: "Push Queue",    phase: 3 },
  sqsSms:       { cx: 680,  cy: 430, icon: "/icons/aws_sqs_icon.webp",          label: "SQS",          sub: "SMS Queue",     phase: 3 },
  lambdaEmail:  { cx: 870,  cy: 190, icon: "/icons/aws_lambda_icon.png",        label: "Lambda",       sub: "Email Worker",  phase: 4 },
  lambdaPush:   { cx: 870,  cy: 310, icon: "/icons/aws_lambda_icon.png",        label: "Lambda",       sub: "Push Worker",   phase: 4 },
  lambdaSms:    { cx: 870,  cy: 430, icon: "/icons/aws_lambda_icon.png",        label: "Lambda",       sub: "SMS Worker",    phase: 4 },
  mailgun:      { cx: 1090, cy: 190, icon: "/icons/mailgun_icon.png",           label: "Mailgun",      sub: "Email",         phase: 5 },
  fcm:          { cx: 1090, cy: 310, icon: "/icons/push_notification_icon.png", label: "Push Service", sub: "FCM / APNs",    phase: 5 },
  twilio:       { cx: 1090, cy: 430, icon: "/icons/sms_icon.png",              label: "Twilio",        sub: "SMS",           phase: 5 },
};

type Arrow = {
  x1: number; y1: number;
  x2: number; y2: number;
  color?: string;
  dashed?: boolean;
  customPath?: string;
  phase: number;
};

const ARROWS: Arrow[] = [
  // Clients → Lambda Publisher
  { x1: 120, y1: 240, x2: 250, y2: 295, phase: 1 },
  { x1: 120, y1: 380, x2: 250, y2: 325, phase: 1 },
  // Lambda Publisher → SNS Topic
  { x1: 310, y1: 310, x2: 445, y2: 310, phase: 2 },
  // SNS fan-out → SQS Queues
  { x1: 505, y1: 290, x2: 650, y2: 205, phase: 3 },
  { x1: 505, y1: 310, x2: 650, y2: 310, phase: 3 },
  { x1: 505, y1: 330, x2: 650, y2: 415, phase: 3 },
  // SQS → Lambda Consumers
  { x1: 710, y1: 190, x2: 840, y2: 190, phase: 4 },
  { x1: 710, y1: 310, x2: 840, y2: 310, phase: 4 },
  { x1: 710, y1: 430, x2: 840, y2: 430, phase: 4 },
  // Lambda Consumers → Notification Services
  { x1: 900, y1: 190, x2: 1060, y2: 190, phase: 5 },
  { x1: 900, y1: 310, x2: 1060, y2: 310, phase: 5 },
  { x1: 900, y1: 430, x2: 1060, y2: 430, phase: 5 },
];

function bezier(a: Arrow): string {
  if (a.customPath) return a.customPath;
  const dx = Math.abs(a.x2 - a.x1) * 0.45;
  return `M ${a.x1} ${a.y1} C ${a.x1 + dx} ${a.y1}, ${a.x2 - dx} ${a.y2}, ${a.x2} ${a.y2}`;
}

export const HighAvailabilityMessagingSection = ({
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
      style={{ width: W, height: H, position: "relative", color: "#fff", borderRadius: 20 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div style={{ position: "absolute", inset: 0, transform: "translateY(-50px)" }}>

        {/* 제목 */}
        <div style={{ position: "absolute", left: 40, top: 30, ...fade(0) }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            High-Availability Messaging Architecture
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "6px 0 0", fontWeight: 500 }}>
            Scalable Notification Processing for 5,000+ Recipients
          </p>
        </div>

        {/* AWS Cloud 테두리 */}
        <div style={{
          position: "absolute", left: 195, top: 110, width: 780, height: 520,
          border: "1.5px dashed rgba(255,153,0,0.3)", borderRadius: 16,
          pointerEvents: "none", ...fade(1),
        }}>
          <div style={{
            position: "absolute", top: -13, left: 14,
            background: "#0f1117", padding: "0 8px",
            fontSize: 12, fontWeight: 600, color: "rgba(255,153,0,0.65)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Image src="/icons/aws_icon.png" width={72} height={72} alt="AWS" style={{ objectFit: "contain" }} />
            AWS Cloud
          </div>
        </div>

        {/* SQS Queues 그룹 박스 */}
        <div style={{
          position: "absolute", left: 600, top: 120, width: 175, height: 400,
          border: "1px solid rgba(255,153,0,0.2)", borderRadius: 10,
          background: "rgba(255,153,0,0.025)",
          pointerEvents: "none", ...fade(3),
        }}>
          <span style={{
            position: "absolute", top: -11, left: 10,
            background: "#0f1117", padding: "0 6px",
            fontSize: 11, fontWeight: 600, color: "rgba(255,153,0,0.5)",
          }}>
            SQS Queues
          </span>
        </div>

        {/* Lambda Consumers 그룹 박스 */}
        <div style={{
          position: "absolute", left: 797, top: 120, width: 165, height: 400,
          border: "1px solid rgba(99,179,237,0.2)", borderRadius: 10,
          background: "rgba(99,179,237,0.025)",
          pointerEvents: "none", ...fade(4),
        }}>
          <span style={{
            position: "absolute", top: -11, left: 10,
            background: "#0f1117", padding: "0 6px",
            fontSize: 11, fontWeight: 600, color: "rgba(99,179,237,0.5)",
          }}>
            Lambda Consumers
          </span>
        </div>

        {/* Notification Services 박스 */}
        <div style={{
          position: "absolute", left: 1005, top: 120, width: 210, height: 390,
          border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
          background: "rgba(255,255,255,0.018)",
          pointerEvents: "none", ...fade(5),
        }}>
          <span style={{
            position: "absolute", top: -11, left: 10,
            background: "#0f1117", padding: "0 6px",
            fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.38)",
          }}>
            Notification Services
          </span>
        </div>

        {/* 우측 패널: Why SNS Fan-out? */}
        <div style={{ position: "absolute", left: 1255, top: 100, width: 315, ...fade(5) }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 18px", color: "#fff" }}>
            Why SNS Fan-out?
          </h3>
          {[
            { title: "Independent Scaling",  body: "Email, Push, and SMS each scale independently via dedicated SQS queues." },
            { title: "Fault Isolation",       body: "Email delivery failure doesn't affect Push or SMS — queues buffer and retry separately." },
            { title: "5,000+ Throughput",     body: "SNS publishes once; all consumers receive simultaneously for massive parallel delivery." },
            { title: "Auto-scaling Lambda",   body: "Lambda auto-scales with SQS depth, handling sudden traffic bursts without manual intervention." },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginBottom: 5 }}>
                {title}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>
                {body}
              </div>
            </div>
          ))}
        </div>

        {/* SVG 화살표 */}
        <svg
          style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}
          viewBox={`0 0 ${W} ${H}`}
        >
          <defs>
            <marker id="ha-ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
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
              strokeDasharray={a.dashed ? "4 3" : undefined}
              markerEnd="url(#ha-ah)"
              style={{ opacity: phase >= a.phase ? 1 : 0, transition: "opacity 0.5s ease" }}
            />
          ))}

          <text x={378} y={298} fontSize={11} fill="rgba(255,255,255,0.5)" textAnchor="middle"
            style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}>
            Publish
          </text>
          <text x={580} y={288} fontSize={11} fill="rgba(255,255,255,0.5)" textAnchor="middle"
            style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}>
            Fan-out
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
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)", whiteSpace: "nowrap", marginTop: 6 }}>
              {node.label}
            </span>
            {node.sub && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap", marginTop: 2 }}>
                {node.sub}
              </span>
            )}
          </div>
        ))}

      </div>

      {/* 뒤로가기 버튼 (프로필로) */}
      <button
        onClick={() => panTo(0, 0)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          width: 48, height: 48, borderRadius: "50%",
          background: "#ffffff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 14L14 4M14 4H8M14 4V10" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
