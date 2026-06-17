"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { GomiOmsAnimation } from "./GomiOmsAnimation";

const TITLE    = "Multi-Platform Order Event Pipeline";
const SUBTITLE = "Incoming orders from Tiki, Lazada, Shopee, and Gomi are received via webhooks on a Kubernetes-backed NestJS server. Processed events are published to SQS and consumed by AWS Lambda, which orchestrates downstream delivery through SNS fan-out to OMS, WMS, and notification services.";

const Cursor = ({ visible }: { visible: boolean }) => (
  <span
    className="inline-block w-[3px] h-[0.85em] bg-white align-middle ml-[3px] translate-y-[-2px]"
    style={{ opacity: visible ? 1 : 0, transition: "opacity 0.1s" }}
  />
);

export const GomiOmsSection = ({
  onAnimationComplete,
  onNavReady,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  onNavReady?: () => void;
  skipAnimation?: boolean;
}) => {
  const [titleText,      setTitleText]      = useState(skipAnimation ? TITLE : "");
  const [phase,          setPhase]          = useState<"title" | "done">(skipAnimation ? "done" : "title");
  const [cursorVisible,  setCursorVisible]  = useState(true);
  const [contentVisible, setContentVisible] = useState(skipAnimation);
  const notifiedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCursorVisible((prev) => !prev), 530);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (skipAnimation) return;
    let index = 0;
    if (phase === "title") {
      const timer = setInterval(() => {
        index++;
        setTitleText(TITLE.slice(0, index));
        if (index >= TITLE.length) {
          clearInterval(timer);
          setTimeout(() => {
            setPhase("done");
            setTimeout(() => setContentVisible(true), 100);
          }, 280);
        }
      }, 60);
      return () => clearInterval(timer);
    }
  }, [phase, skipAnimation]);

  useEffect(() => {
    if (!contentVisible) return;
    onNavReady?.();
  }, [contentVisible]);

  const handleAnimationComplete = () => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    onAnimationComplete?.();
  };

  const fadeUp = (delay: number): CSSProperties => ({
    opacity:    contentVisible ? 1 : 0,
    transform:  contentVisible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  return (
    <div
      className="w-[1440px] rounded-2xl overflow-hidden relative text-white flex"
      style={{ minHeight: "600px" }}
    >
      {/* ── 좌측 텍스트 영역 ── */}
      <div
        className="px-14 py-12 w-[580px] shrink-0 relative z-10 select-text"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h1 className="text-[42px] font-extrabold leading-tight tracking-tight min-h-[1em]"
          style={{ marginBottom: "20px" }}>
          {titleText}
          {phase === "title" && <Cursor visible={cursorVisible} />}
        </h1>

        <p className="text-[15px] leading-relaxed text-zinc-400" style={fadeUp(0)}>
          {SUBTITLE}
        </p>

        <div style={{ ...fadeUp(120), marginTop: "36px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "4 Marketplaces",    sub: "Tiki · Lazada · Shopee · Gomi" },
            { label: "3 Event Types",     sub: "created · cancelled · updated"  },
            { label: "K8s + NestJS",      sub: "Horizontally scalable ingestion" },
          ].map(({ label, sub }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "3px", height: "28px", borderRadius: "2px", background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", marginTop: "1px" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 우측 애니메이션 영역 ── */}
      <div className="flex-1 relative" style={{ padding: "12px 12px 12px 0" }}>
        <GomiOmsAnimation
          active={contentVisible}
          skipAnimation={skipAnimation}
          onComplete={handleAnimationComplete}
        />
      </div>
    </div>
  );
};
