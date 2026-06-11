"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { Zap, ArrowLeftRight, Users, ShieldCheck } from "lucide-react";
import { useCanvas } from "../InfiniteCanvas";

const W = 1800;
const H = 900;
const MAX_PHASE = 4;

/* ── ECS 인스턴스 박스 ── */
const EcsBox = ({ num, visible }: { num: string; visible: boolean }) => (
  <div style={{
    width: 110, minHeight: 148,
    border: "1px solid rgba(255,153,0,0.3)", borderRadius: 8,
    background: "rgba(255,153,0,0.04)",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "10px 8px", gap: 6,
    opacity: visible ? 1 : 0, transition: "opacity 0.5s ease",
  }}>
    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,153,0,0.85)", textAlign: "center", lineHeight: 1.3 }}>
      ECS Instance {num}
    </span>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, justifyContent: "center" }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Zap size={15} color="rgba(255,255,255,0.7)" />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>Socket.IO</span>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>Server</span>
    </div>
    <div style={{ display: "flex", gap: 5 }}>
      <span style={{ fontSize: 9, color: "rgba(99,179,237,0.85)", border: "1px solid rgba(99,179,237,0.3)", borderRadius: 3, padding: "1px 5px" }}>Sub</span>
      <span style={{ fontSize: 9, color: "rgba(251,191,36,0.85)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 3, padding: "1px 5px" }}>Pub</span>
    </div>
  </div>
);

/* ── Why 아이템 ── */
const WhyItem = ({
  icon, title, desc, visible,
}: { icon: React.ReactNode; title: string; desc: string; visible: boolean }) => (
  <div style={{
    display: "flex", gap: 16, alignItems: "flex-start",
    opacity: visible ? 1 : 0, transition: "opacity 0.5s ease",
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: "rgba(99,179,237,0.1)", border: "1px solid rgba(99,179,237,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{desc}</div>
    </div>
  </div>
);

/* ── How it works 스텝 ── */
const HowStep = ({ num, label, desc, visible }: { num: number; label: string; desc: string; visible: boolean }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 145,
    opacity: visible ? 1 : 0, transition: "opacity 0.5s ease",
  }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
      background: "rgba(99,179,237,0.15)", border: "1px solid rgba(99,179,237,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color: "rgba(99,179,237,0.9)",
    }}>{num}</div>
    <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", textAlign: "center" }}>{label}</span>
    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.4 }}>{desc}</span>
  </div>
);

export const JelpalaMessagingSection = ({
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
      timers.push(setTimeout(() => setPhase(p), 300 + p * 400));
    }
    timers.push(setTimeout(() => onAnimationComplete?.(), 300 + MAX_PHASE * 400 + 700));
    return () => timers.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  /* ECS 박스 x 위치 (4개) */
  const ECS_TOP = 200;
  const ECS_BOXES = [
    { left: 185, num: "1" },
    { left: 310, num: "2" },
    { left: 435, num: "3" },
    { left: 595, num: "N" },
  ];

  /* Redis 박스 */
  const REDIS_LEFT = 185;
  const REDIS_TOP  = 405;
  const REDIS_W    = 520;
  const REDIS_H    = 90;

  /* 클라이언트 노드 */
  const CLIENT_NODES = [
    { cy: 240, label: "Driver App",    sub: "iOS / Android" },
    { cy: 340, label: "Customer App",  sub: "iOS / Android" },
    { cy: 440, label: "Web Client",    sub: "Web / Mobile"  },
  ];

  /* SVG 화살표 경로 */
  const ecsBottomY = ECS_TOP + 148;
  const redisCenterX = REDIS_LEFT + REDIS_W / 2;

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ── 좌측 패널 ── */}

      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 38, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Distributed Real-Time Messaging
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6, marginBottom: 0, maxWidth: 700, lineHeight: 1.55 }}>
          Redis Pub/Sub + Socket.IO for Multi-Instance, Real-Time Communication.<br />
          Events published by any server instance are instantly propagated to all other instances.
        </p>
      </div>

      {/* AFTER 레이블 */}
      <div style={{ position: "absolute", left: 40, top: 162, ...fade(1) }}>
        <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(99,179,237,0.15)", border: "1px solid rgba(99,179,237,0.3)", borderRadius: 4, padding: "2px 8px", color: "rgba(99,179,237,0.9)" }}>
          AFTER
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 10 }}>
          With Redis Pub/Sub (Distributed Real-Time Messaging)
        </span>
      </div>

      {/* 클라이언트 아이콘 */}
      {CLIENT_NODES.map(({ cy, label, sub }) => (
        <div key={label} style={{ position: "absolute", left: 40, top: cy - 24, display: "flex", flexDirection: "column", alignItems: "center", width: 80, ...fade(1) }}>
          <Image src="/icons/client_icon.png" width={48} height={48} alt={label} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 4 }}>{label}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{sub}</span>
        </div>
      ))}

      {/* Clients 레이블 */}
      <div style={{ position: "absolute", left: 46, top: 185, ...fade(1) }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>Clients</span>
      </div>

      {/* ECS 인스턴스 박스 */}
      {ECS_BOXES.map(({ left, num }) => (
        <div key={num} style={{ position: "absolute", left, top: ECS_TOP }}>
          <EcsBox num={num} visible={phase >= 2} />
        </div>
      ))}

      {/* "..." 구분자 */}
      <div style={{ position: "absolute", left: 556, top: ECS_TOP + 60, fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.3)", ...fade(2) }}>
        ···
      </div>

      {/* Redis 박스 */}
      <div style={{
        position: "absolute", left: REDIS_LEFT, top: REDIS_TOP, width: REDIS_W, height: REDIS_H,
        border: "1.5px solid rgba(239,68,68,0.4)", borderRadius: 10,
        background: "rgba(239,68,68,0.06)",
        display: "flex", alignItems: "center", gap: 16, padding: "0 20px",
        ...fade(2),
      }}>
        <Image src="/icons/redis_icon.png" width={48} height={48} alt="Redis" style={{ objectFit: "contain", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Amazon ElastiCache for Redis</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Redis Pub/Sub Message Broker</div>
          <div style={{ display: "flex", gap: 12, marginTop: 5 }}>
            <span style={{ fontSize: 10, color: "rgba(239,68,68,0.7)" }}>Channels match events</span>
            <span style={{ fontSize: 10, color: "rgba(239,68,68,0.7)" }}>Channel-driven status</span>
          </div>
        </div>
      </div>

      {/* RDS */}
      <div style={{ position: "absolute", left: 770, top: 210, display: "flex", flexDirection: "column", alignItems: "center", width: 80, ...fade(3) }}>
        <Image src="/icons/aws_rds_icon.webp" width={52} height={52} alt="RDS" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>Amazon RDS</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>MySQL</span>
      </div>

      {/* S3 */}
      <div style={{ position: "absolute", left: 770, top: 370, display: "flex", flexDirection: "column", alignItems: "center", width: 80, ...fade(3) }}>
        <Image src="/icons/aws_s3_icon.webp" width={52} height={52} alt="S3" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>Amazon S3</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>File Storage</span>
      </div>

      {/* How it works */}
      <div style={{ position: "absolute", left: 40, top: 560, ...fade(4) }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 18, letterSpacing: "0.05em" }}>
          HOW IT WORKS
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          {[
            { num: 1, label: "Event Occurs",    desc: "Driver accepts a delivery" },
            { num: 2, label: "Publish",          desc: "ECS Instance publishes to channel" },
            { num: 3, label: "Redis Pub/Sub",    desc: "Redis distributes to subscribers" },
            { num: 4, label: "Instances Sub",    desc: "Other ECS instances receive message" },
            { num: 5, label: "Emit to Clients",  desc: "Socket.IO emits to connected clients" },
          ].map((step, i) => (
            <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
              <HowStep {...step} visible={phase >= 4} />
              {i < 4 && (
                <svg width="32" height="20" viewBox="0 0 32 20" style={{ flexShrink: 0, marginBottom: 28 }}>
                  <path d="M4 10 H28 M22 4 L28 10 L22 16" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── SVG 화살표 ── */}
      <svg style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="msg-ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.25)" />
          </marker>
          <marker id="msg-ah-blue" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(99,179,237,0.5)" />
          </marker>
        </defs>

        {/* 클라이언트 → ECS1 */}
        {CLIENT_NODES.map(({ cy }, i) => (
          <path key={i}
            d={`M 120 ${cy} C 150 ${cy}, 165 267, 185 267`}
            stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none"
            markerEnd="url(#msg-ah)"
            style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease" }}
          />
        ))}

        {/* ECS → Redis (수직 아래) */}
        {ECS_BOXES.map(({ left }) => {
          const cx = left + 55;
          return (
            <path key={left}
              d={`M ${cx} ${ecsBottomY} L ${cx} ${REDIS_TOP}`}
              stroke="rgba(99,179,237,0.4)" strokeWidth="1.5" fill="none"
              strokeDasharray="4 3"
              markerEnd="url(#msg-ah-blue)"
              style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}
            />
          );
        })}

        {/* Redis → RDS */}
        <path
          d={`M ${REDIS_LEFT + REDIS_W} ${REDIS_TOP + 25} C 760 ${REDIS_TOP + 25}, 760 236, 770 236`}
          stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none"
          markerEnd="url(#msg-ah)"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}
        />

        {/* Redis → S3 */}
        <path
          d={`M ${REDIS_LEFT + REDIS_W} ${REDIS_TOP + 65} C 760 ${REDIS_TOP + 65}, 760 396, 770 396`}
          stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none"
          markerEnd="url(#msg-ah)"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}
        />
      </svg>

      {/* ── 구분선 ── */}
      <div style={{
        position: "absolute", left: 1140, top: 40, width: 1, height: 820,
        background: "rgba(255,255,255,0.07)",
        ...fade(0),
      }} />

      {/* ── 우측 패널: Why Redis Pub/Sub ── */}
      <div style={{ position: "absolute", left: 1170, top: 38, right: 30 }}>
        <div style={{ ...fade(0) }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>Why Redis Pub/Sub?</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 42, marginTop: 36 }}>
          <WhyItem
            icon={<Zap size={20} color="rgba(99,179,237,0.85)" />}
            title="Real-time Event Propagation"
            desc="Events published by one instance are instantly delivered to all subscribed instances."
            visible={phase >= 1}
          />
          <WhyItem
            icon={<ArrowLeftRight size={20} color="rgba(99,179,237,0.85)" />}
            title="Horizontal Scalability"
            desc="Add or remove ECS instances without changing the messaging flow."
            visible={phase >= 2}
          />
          <WhyItem
            icon={<Users size={20} color="rgba(99,179,237,0.85)" />}
            title="Consistent User Experience"
            desc="All users connected to different servers receive the same real-time updates."
            visible={phase >= 3}
          />
          <WhyItem
            icon={<ShieldCheck size={20} color="rgba(99,179,237,0.85)" />}
            title="High Availability"
            desc="No single point of failure in messaging. Redis Cluster enables reliable delivery."
            visible={phase >= 4}
          />
        </div>
      </div>

      {/* ── 뒤로가기 버튼 ── */}
      <button
        onClick={() => panTo(-1544, -1071)}
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
          <path d="M9 3V15M9 15L3 9M9 15L15 9" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
