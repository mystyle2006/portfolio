"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1600;
const H = 870;
const ICON = 54;
const R = ICON / 2;
const MAX_PHASE = 5;

type NodeDef = {
  cx: number; cy: number;
  icon: string;
  label: string;
  sub?: string;
  phase: number;
};

/* ── Row 1: Clients → Lambda API Writer
   Row 2: Outbox Poller → SNS → SQS × 3 → Lambda × 3 → Services × 3 ── */
const NODES: Record<string, NodeDef> = {
  clientMobile:  { cx:  75, cy: 190, icon: "/icons/client_icon.png",            label: "Mobile App",    sub: "iOS / Android", phase: 0 },
  clientWeb:     { cx:  75, cy: 315, icon: "/icons/client_icon.png",            label: "Web App",       sub: "Browser",       phase: 0 },
  lambdaWriter:  { cx: 255, cy: 252, icon: "/icons/aws_lambda_icon.png",        label: "Lambda API",    sub: "Writer",        phase: 1 },
  outboxPoller:  { cx: 425, cy: 490, icon: "/icons/aws_lambda_icon.png",        label: "Outbox Poller", sub: "Scheduled",     phase: 3 },
  snsTopic:      { cx: 615, cy: 490, icon: "/icons/aws_icon.png",               label: "SNS Topic",     sub: "Fan-out Hub",   phase: 3 },
  sqsEmail:      { cx: 810, cy: 375, icon: "/icons/aws_sqs_icon.webp",          label: "SQS",           sub: "Email Queue",   phase: 4 },
  sqsPush:       { cx: 810, cy: 490, icon: "/icons/aws_sqs_icon.webp",          label: "SQS",           sub: "Push Queue",    phase: 4 },
  sqsSms:        { cx: 810, cy: 605, icon: "/icons/aws_sqs_icon.webp",          label: "SQS",           sub: "SMS Queue",     phase: 4 },
  lambdaEmail:   { cx: 990, cy: 375, icon: "/icons/aws_lambda_icon.png",        label: "Lambda",        sub: "Email Worker",  phase: 5 },
  lambdaPush:    { cx: 990, cy: 490, icon: "/icons/aws_lambda_icon.png",        label: "Lambda",        sub: "Push Worker",   phase: 5 },
  lambdaSms:     { cx: 990, cy: 605, icon: "/icons/aws_lambda_icon.png",        label: "Lambda",        sub: "SMS Worker",    phase: 5 },
  mailgun:       { cx:1175, cy: 375, icon: "/icons/mailgun_icon.png",           label: "Mailgun",       sub: "Email",         phase: 5 },
  fcm:           { cx:1175, cy: 490, icon: "/icons/push_notification_icon.png", label: "Push Service",  sub: "FCM / APNs",    phase: 5 },
  twilio:        { cx:1175, cy: 605, icon: "/icons/sms_icon.png",              label: "Twilio",         sub: "SMS",           phase: 5 },
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
  // Clients → Lambda API Writer
  { x1: 102, y1: 190, x2: 228, y2: 238, phase: 1 },
  { x1: 102, y1: 315, x2: 228, y2: 266, phase: 1 },
  // Lambda API → DB Outbox (write — same transaction)
  { x1: 282, y1: 252, x2: 315, y2: 252, phase: 2 },
  // DB Outbox → Outbox Poller (poll pending)
  { x1: 407, y1: 365, x2: 425, y2: 463,
    customPath: "M 407 365 C 407 445, 425 445, 425 463", phase: 3 },
  // Outbox Poller → SNS Topic (publish)
  { x1: 452, y1: 490, x2: 588, y2: 490, phase: 3 },
  // SNS fan-out → SQS Queues
  { x1: 642, y1: 472, x2: 783, y2: 392, phase: 4 },
  { x1: 642, y1: 490, x2: 783, y2: 490, phase: 4 },
  { x1: 642, y1: 508, x2: 783, y2: 598, phase: 4 },
  // SQS → Lambda Workers
  { x1: 837, y1: 375, x2: 963, y2: 375, phase: 5 },
  { x1: 837, y1: 490, x2: 963, y2: 490, phase: 5 },
  { x1: 837, y1: 605, x2: 963, y2: 605, phase: 5 },
  // Lambda Workers → DB Outbox (status update SENT / FAIL)
  { x1: 963, y1: 365, x2: 407, y2: 358,
    customPath: "M 963 365 C 963 210, 407 210, 407 358",
    color: "rgba(167,243,208,0.28)", dashed: true, phase: 5 },
  // Lambda Workers → Notification Services
  { x1: 1017, y1: 375, x2: 1148, y2: 375, phase: 5 },
  { x1: 1017, y1: 490, x2: 1148, y2: 490, phase: 5 },
  { x1: 1017, y1: 605, x2: 1148, y2: 605, phase: 5 },
];

function bezier(a: Arrow): string {
  if (a.customPath) return a.customPath;
  const dx = Math.abs(a.x2 - a.x1) * 0.45;
  return `M ${a.x1} ${a.y1} C ${a.x1 + dx} ${a.y1}, ${a.x2 - dx} ${a.y2}, ${a.x2} ${a.y2}`;
}

const STATUS_ITEMS = [
  { label: "PENDING", color: "#F59E0B" },
  { label: "SENDING", color: "#60A5FA" },
  { label: "SENT",    color: "#34D399" },
  { label: "FAIL",    color: "#F87171" },
];

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
          position: "absolute", left: 165, top: 105, width: 910, height: 600,
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

        {/* Same Transaction 경계 (Lambda API + DB Outbox) */}
        <div style={{
          position: "absolute", left: 168, top: 128, width: 358, height: 255,
          border: "1.5px dashed rgba(99,179,237,0.4)", borderRadius: 12,
          pointerEvents: "none", ...fade(1),
        }}>
          <span style={{
            position: "absolute", top: -11, left: 10,
            background: "#0f1117", padding: "0 7px",
            fontSize: 11, fontWeight: 600, color: "rgba(99,179,237,0.72)",
          }}>
            Same Transaction
          </span>
        </div>

        {/* DB Outbox 박스 (RDS + 상태 뱃지) */}
        <div style={{
          position: "absolute", left: 315, top: 145, width: 190, height: 228,
          border: "1px solid rgba(255,153,0,0.28)", borderRadius: 10,
          background: "rgba(20,20,30,0.7)",
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 12,
          ...fade(2),
        }}>
          <Image src="/icons/aws_rds_icon.webp" width={36} height={36} alt="RDS"
            style={{ objectFit: "contain", marginBottom: 5 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.82)", marginBottom: 12 }}>
            Outbox Table
          </span>
          {STATUS_ITEMS.map(({ label, color }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", paddingLeft: 22, marginBottom: 7,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.06em" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* SQS Queues 그룹 박스 */}
        <div style={{
          position: "absolute", left: 724, top: 318, width: 175, height: 365,
          border: "1px solid rgba(255,153,0,0.2)", borderRadius: 10,
          background: "rgba(255,153,0,0.025)",
          pointerEvents: "none", ...fade(4),
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
          position: "absolute", left: 905, top: 318, width: 165, height: 365,
          border: "1px solid rgba(99,179,237,0.2)", borderRadius: 10,
          background: "rgba(99,179,237,0.025)",
          pointerEvents: "none", ...fade(5),
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
          position: "absolute", left: 1085, top: 318, width: 210, height: 365,
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

        {/* 우측 패널: Why Outbox Pattern? */}
        <div style={{ position: "absolute", left: 1322, top: 100, width: 252, ...fade(5) }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#fff" }}>
            Why Outbox Pattern?
          </h3>
          {[
            { title: "Zero Message Loss",    body: "Outbox write and business data share one DB transaction — no message is lost even on process crash." },
            { title: "Automatic Retry",       body: "FAIL status is re-polled and retried until SENT." },
            { title: "Full Audit Trail",      body: "Every notification tracks PENDING → SENDING → SENT / FAIL for debugging." },
            { title: "Transactional Safety",  body: "If the DB write fails, neither business data nor the notification is persisted — both rollback atomically." },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginBottom: 4 }}>
                {title}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", lineHeight: 1.65 }}>
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
            <marker id="ha-ah-green" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="rgba(167,243,208,0.38)" />
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
              markerEnd={a.dashed ? "url(#ha-ah-green)" : "url(#ha-ah)"}
              style={{ opacity: phase >= a.phase ? 1 : 0, transition: "opacity 0.5s ease" }}
            />
          ))}

          {/* Write 레이블 */}
          <text x={297} y={242} fontSize={10} fill="rgba(255,255,255,0.42)" textAnchor="middle"
            style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}>
            Write
          </text>
          {/* Poll 레이블 */}
          <text x={414} y={432} fontSize={10} fill="rgba(255,255,255,0.42)" textAnchor="middle"
            style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}>
            Poll
          </text>
          {/* Publish 레이블 */}
          <text x={520} y={479} fontSize={10} fill="rgba(255,255,255,0.42)" textAnchor="middle"
            style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}>
            Publish
          </text>
          {/* SENT / FAIL 레이블 (arch 위) */}
          <text x={685} y={200} fontSize={9} fill="rgba(167,243,208,0.5)" textAnchor="middle"
            style={{ opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.5s ease" }}>
            Update Status
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
        onClick={() => panTo(-1544, 792)}
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
