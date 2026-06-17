"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { GomiAnimation } from "./GomiAnimation";

const TITLE    = "Reducing Settlement Processing Time by Over 80%";
const SUBTITLE = "Built in close collaboration with finance and operations teams to automate reconciliation and settlement workflows across multiple marketplaces.";

const Cursor = ({ visible }: { visible: boolean }) => (
  <span
    className="inline-block w-[3px] h-[0.85em] bg-white align-middle ml-[3px] translate-y-[-2px]"
    style={{ opacity: visible ? 1 : 0, transition: "opacity 0.1s" }}
  />
);

export const GomiSection = ({
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
        <h1 className="text-[48px] font-extrabold leading-tight tracking-tight min-h-[1em]"
          style={{ marginBottom: "20px" }}>
          {titleText}
          {phase === "title" && <Cursor visible={cursorVisible} />}
        </h1>

        <p className="text-[15px] leading-relaxed text-zinc-400" style={fadeUp(0)}>
          {SUBTITLE}
        </p>

        {/* stats */}
        <div className="flex items-center gap-6" style={{ ...fadeUp(120), marginTop: "36px", flexWrap: "nowrap" }}>
          {[
            { value: "5,000+", label: "Monthly Orders Processed", color: "rgba(52,211,153,0.9)" },
          ].map(({ value, label, color }) => (
            <div key={label} className="flex flex-col gap-1" style={{ flexShrink: 0 }}>
              <span className="font-black" style={{ fontSize: "33px", whiteSpace: "nowrap", color }}>{value}</span>
              <span className="text-white" style={{ fontSize: "15px", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 우측 애니메이션 영역 ── */}
      <div className="flex-1 relative" style={{ padding: "16px 12px 16px 0" }}>
        <GomiAnimation
          active={contentVisible}
          skipAnimation={skipAnimation}
          onComplete={handleAnimationComplete}
        />
      </div>
    </div>
  );
};
