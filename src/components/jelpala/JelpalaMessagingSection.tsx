"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { GitBranch, ArrowLeftRight, Users, ShieldCheck } from "lucide-react";
import { useCanvas } from "../InfiniteCanvas";

const W = 1800;
const H = 900;
const MAX_PHASE = 4;

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

const HowStep = ({ num, label, desc, visible }: { num: number; label: string; desc: string; visible: boolean }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: 170,
    opacity: visible ? 1 : 0, transition: "opacity 0.5s ease",
  }}>
    <div style={{
      width: 33, height: 33, borderRadius: "50%", flexShrink: 0,
      background: "rgba(99,179,237,0.15)", border: "1px solid rgba(99,179,237,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 700, color: "rgba(99,179,237,0.9)",
    }}>{num}</div>
    <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", textAlign: "center" }}>{label}</span>
    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.4 }}>{desc}</span>
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

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ── 제목 ── */}
      <div style={{ position: "absolute", left: 40, top: 38, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Distributed Real-Time Messaging
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6, marginBottom: 0, maxWidth: 660, lineHeight: 1.55 }}>
          Per-channel Pub/Sub routing — each ECS instance subscribes only to channels of its connected clients,
          so messages are delivered exclusively to the target instance without broadcasting to all servers.
        </p>
      </div>

      {/* ── Driver App ── */}
      <div style={{ position: "absolute", left: 49, top: 294, width: 52, display: "flex", flexDirection: "column", alignItems: "center", ...fade(1) }}>
        <Image src="/icons/client_icon.png" width={52} height={52} alt="Driver App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>Driver App</span>
      </div>

      {/* ── ECS 1 박스 (sender) ── */}
      <div style={{
        position: "absolute", left: 190, top: 258, width: 160, height: 140,
        border: "1px solid rgba(255,153,0,0.35)", borderRadius: 10,
        background: "rgba(255,153,0,0.04)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7,
        ...fade(1),
      }}>
        <Image src="/icons/spring_java_icon.png" width={36} height={36} alt="ECS 1" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,153,0,0.85)" }}>ECS Instance 1</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Driver&apos;s server</span>
        <span style={{ fontSize: 10, color: "rgba(251,146,60,0.88)", border: "1px solid rgba(251,146,60,0.28)", borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" }}>
          PUB → user:{"{id}"}
        </span>
      </div>

      {/* ── Redis Pub/Sub 박스 ── */}
      <div style={{
        position: "absolute", left: 460, top: 278, width: 160, height: 172,
        border: "1.5px solid rgba(239,68,68,0.4)", borderRadius: 10,
        background: "rgba(239,68,68,0.06)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
        ...fade(2),
      }}>
        <Image src="/icons/redis_icon.png" width={44} height={44} alt="Redis" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Redis Pub/Sub</span>
        <span style={{ fontSize: 10, color: "rgba(239,68,68,0.82)", border: "1px solid rgba(239,68,68,0.28)", borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" }}>
          channel: user:{"{id}"}
        </span>
      </div>

      {/* ── ECS 3 박스 (not subscribed, dimmed) ── */}
      <div style={{
        position: "absolute", left: 740, top: 200, width: 160, height: 88,
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
        background: "rgba(255,255,255,0.02)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
        opacity: phase >= 4 ? 0.45 : 0, transition: "opacity 0.5s ease",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>ECS Instance 3</span>
        <span style={{ fontSize: 11, color: "rgba(239,68,68,0.65)", fontWeight: 600 }}>× Not Subscribed</span>
      </div>

      {/* ── ECS 2 박스 (subscribed, receiver) ── */}
      <div style={{
        position: "absolute", left: 740, top: 368, width: 160, height: 140,
        border: "1px solid rgba(52,211,153,0.38)", borderRadius: 10,
        background: "rgba(52,211,153,0.05)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7,
        ...fade(3),
      }}>
        <Image src="/icons/spring_java_icon.png" width={36} height={36} alt="ECS 2" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(52,211,153,0.88)" }}>ECS Instance 2</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Customer&apos;s server</span>
        <span style={{ fontSize: 10, color: "rgba(52,211,153,0.9)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" }}>
          SUB: user:{"{id}"} ✓
        </span>
      </div>

      {/* ── Customer App ── */}
      <div style={{ position: "absolute", left: 994, top: 412, width: 52, display: "flex", flexDirection: "column", alignItems: "center", ...fade(3) }}>
        <Image src="/icons/client_icon.png" width={52} height={52} alt="Customer App" style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", marginTop: 5 }}>Customer App</span>
      </div>

      {/* ── How it works ── */}
      <div style={{ position: "absolute", left: 40, top: 570, ...fade(4) }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 18, letterSpacing: "0.05em" }}>
          HOW IT WORKS
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          {[
            { num: 1, label: "Client Connects",  desc: "ECS subscribes to the client's dedicated Pub/Sub channel" },
            { num: 2, label: "Message Sent",      desc: "Connected ECS publishes to the recipient's channel on Redis" },
            { num: 3, label: "Redis Routes",      desc: "Delivers only to the ECS instance subscribed to that channel" },
            { num: 4, label: "Delivered",         desc: "Target ECS forwards the message to the client via Socket.IO" },
          ].map((step, i) => (
            <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
              <HowStep {...step} visible={phase >= 4} />
              {i < 3 && (
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
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.28)" />
          </marker>
          <marker id="msg-ah-orange" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(251,146,60,0.75)" />
          </marker>
          <marker id="msg-ah-green" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(52,211,153,0.75)" />
          </marker>
          <marker id="msg-ah-red" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(239,68,68,0.6)" />
          </marker>
        </defs>

        {/* ① Driver App → ECS 1 */}
        <path d="M 101 320 C 140 320, 175 328, 190 328"
          stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none"
          markerEnd="url(#msg-ah)"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease" }} />

        {/* ② ECS 1 → Redis (PUBLISH) */}
        <path d="M 350 328 C 395 328, 440 364, 460 364"
          stroke="rgba(251,146,60,0.6)" strokeWidth="1.8" fill="none"
          markerEnd="url(#msg-ah-orange)"
          style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="405" y="316" fontSize="12" fill="rgba(251,146,60,0.92)" textAnchor="middle" fontWeight="700"
          style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}>Publish</text>

        {/* ③ Redis → ECS 2 (subscribed, success) */}
        <path d="M 620 364 C 668 364, 700 438, 740 438"
          stroke="rgba(52,211,153,0.68)" strokeWidth="2" fill="none"
          markerEnd="url(#msg-ah-green)"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="682" y="415" fontSize="12" fill="rgba(52,211,153,0.88)" textAnchor="middle" fontWeight="600"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}>Subscribed ✓</text>

        {/* ④ Redis → ECS 3 (not subscribed, rejected) */}
        <path d="M 620 364 C 668 364, 700 244, 740 244"
          stroke="rgba(239,68,68,0.42)" strokeWidth="1.2" fill="none" strokeDasharray="5 3"
          markerEnd="url(#msg-ah-red)"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="682" y="298" fontSize="12" fill="rgba(239,68,68,0.65)" textAnchor="middle"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease" }}>× Ignored</text>

        {/* ⑤ ECS 2 → Customer App */}
        <path d="M 900 438 L 994 438"
          stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" fill="none"
          markerEnd="url(#msg-ah-green)"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <text x="947" y="428" fontSize="12" fill="rgba(52,211,153,0.62)" textAnchor="middle"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}>Socket.IO</text>
      </svg>

      {/* ── 구분선 ── */}
      <div style={{
        position: "absolute", left: 1140, top: 40, width: 1, height: 820,
        background: "rgba(255,255,255,0.07)",
        ...fade(0),
      }} />

      {/* ── 우측 패널 ── */}
      <div style={{ position: "absolute", left: 1170, top: 38, right: 30 }}>
        <div style={{ ...fade(0) }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>Why Per-Channel Routing?</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 42, marginTop: 36 }}>
          <WhyItem
            icon={<GitBranch size={20} color="rgba(99,179,237,0.85)" />}
            title="Selective Subscription"
            desc="Each ECS instance subscribes only to the Pub/Sub channels of its connected clients — no cross-instance noise."
            visible={phase >= 1}
          />
          <WhyItem
            icon={<ArrowLeftRight size={20} color="rgba(99,179,237,0.85)" />}
            title="No Broadcast Overhead"
            desc="Redis delivers to the exact instance the recipient is connected to. Other instances never process unrelated messages."
            visible={phase >= 2}
          />
          <WhyItem
            icon={<Users size={20} color="rgba(99,179,237,0.85)" />}
            title="Horizontal Scalability"
            desc="Add or remove ECS instances freely. Each manages its own client channels independently with no coordination needed."
            visible={phase >= 3}
          />
          <WhyItem
            icon={<ShieldCheck size={20} color="rgba(99,179,237,0.85)" />}
            title="Fault Isolation"
            desc="Channel-level isolation limits blast radius. A failing instance affects only its own connected clients, not the entire cluster."
            visible={phase >= 4}
          />
        </div>
      </div>

      {/* ── 뒤로가기 버튼 ── */}
      <button
        onClick={() => panTo(-1544, -1071)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 84, left: 1560,
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
          <path d="M4 4L14 14M14 14H8M14 14V8" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
