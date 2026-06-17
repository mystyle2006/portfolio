"use client";

import { useEffect, useRef, useState } from "react";

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
    if (!notifiedRef.current) {
      notifiedRef.current = true;
      onAnimationComplete?.();
    }
  }, [contentVisible]);

  return (
    <div
      className="w-[1440px] rounded-2xl overflow-hidden relative text-white flex"
      style={{ minHeight: "600px" }}
    >
      <div
        className="px-14 py-12 w-[860px] shrink-0 relative z-10 select-text"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* title */}
        <h1 className="text-[54px] font-extrabold leading-tight tracking-tight min-h-[1em]"
          style={{ marginBottom: "20px" }}>
          {titleText}
          {phase === "title" && <Cursor visible={cursorVisible} />}
        </h1>

        {/* subtitle */}
        <p className="text-[15px] leading-relaxed text-zinc-400"
          style={{
            opacity:    contentVisible ? 1 : 0,
            transform:  contentVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
          {SUBTITLE}
        </p>
      </div>
    </div>
  );
};
