"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { WashswatDeployAnimation } from "./WashswatDeployAnimation";

const TITLE    = "Safely Deploying a Unified Payment System";
const SUBTITLE = "A risk-based progressive rollout strategy to protect hundreds of daily users";

const K = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white font-semibold underline decoration-blue-400/50 decoration-2 underline-offset-[3px]">
    {children}
  </span>
);

const Cursor = ({ visible }: { visible: boolean }) => (
  <span
    className="inline-block w-[3px] h-[0.85em] bg-white align-middle ml-[3px] translate-y-[-2px]"
    style={{ opacity: visible ? 1 : 0, transition: "opacity 0.1s" }}
  />
);

export const WashswatDeploySection = ({
  onAnimationComplete,
  onNavReady,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  onNavReady?: () => void;
  skipAnimation?: boolean;
}) => {
  const [titleText,     setTitleText]     = useState(skipAnimation ? TITLE : "");
  const [phase,         setPhase]         = useState<"title" | "done">(skipAnimation ? "done" : "title");
  const [cursorVisible, setCursorVisible] = useState(true);
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

  const handleAnimComplete = () => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    onAnimationComplete?.();
  };

  const fadeUp = (delay: number): CSSProperties => ({
    opacity:   contentVisible ? 1 : 0,
    transform: contentVisible ? "translateY(0)" : "translateY(16px)",
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
        {/* title */}
        <h1 className="text-[44px] font-extrabold leading-tight tracking-tight min-h-[1em]"
          style={{ marginBottom: "14px" }}>
          {titleText}
          {phase === "title" && <Cursor visible={cursorVisible} />}
        </h1>

        {/* subtitle */}
        <p className="text-[15px] leading-relaxed text-zinc-400" style={fadeUp(0)}>
          {SUBTITLE}
        </p>

        {/* description */}
        <div style={{ ...fadeUp(80), marginTop: "24px" }}>
          <p className="text-[15px] leading-relaxed text-zinc-400" style={{ marginBottom: "16px" }}>
            Deploying all payment gateways simultaneously posed unacceptable risk — any failure
            would immediately impact every customer attempting to pay.
          </p>
          <p className="text-[15px] leading-relaxed text-zinc-400" style={{ marginBottom: "16px" }}>
            We analyzed <K>transaction frequency</K> across all payment methods and defined a
            deployment order from <K>least-used to most-used</K>, so that potential issues
            would surface at minimal customer impact first.
          </p>
          <p className="text-[15px] leading-relaxed text-zinc-400">
            Each gateway was deployed individually, monitored for stability, then cleared before
            proceeding to the next — a <K>progressive rollout</K> that protected the majority
            of users throughout the migration.
          </p>
        </div>
      </div>

      {/* ── 우측 애니메이션 영역 ── */}
      <div className="flex-1 relative" style={{ padding: "16px 12px 16px 0" }}>
        <WashswatDeployAnimation
          active={contentVisible}
          skipAnimation={skipAnimation}
          onComplete={handleAnimComplete}
        />
      </div>
    </div>
  );
};
