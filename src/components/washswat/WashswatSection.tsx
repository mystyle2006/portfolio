"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { WashswatAnimation } from "./WashswatAnimation";

const TITLE    = "Multi-Payment Gateway Integration at Washswat";
const SUBTITLE = "Consolidating Multiple Payment Gateways into a Scalable Architecture";

const Cursor = ({ visible }: { visible: boolean }) => (
  <span
    className="inline-block w-[3px] h-[0.85em] bg-white align-middle ml-[3px] translate-y-[-2px]"
    style={{ opacity: visible ? 1 : 0, transition: "opacity 0.1s" }}
  />
);

export const WashswatSection = ({
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
  const [statsVisible,  setStatsVisible]  = useState(skipAnimation);
  const notifiedRef = useRef(false);

  /* cursor blink */
  useEffect(() => {
    const timer = setInterval(() => setCursorVisible((prev) => !prev), 530);
    return () => clearInterval(timer);
  }, []);

  /* typewriter: title → done */
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
            setTimeout(() => setStatsVisible(true), 100);
          }, 280);
        }
      }, 60);
      return () => clearInterval(timer);
    }
  }, [phase, skipAnimation]);

  /* nav 버튼 노출 */
  useEffect(() => {
    if (!statsVisible) return;
    onNavReady?.();
  }, [statsVisible]);

  /* 애니메이션 완료 알림 */
  const handleAnimationComplete = () => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    onAnimationComplete?.();
  };

  const fadeUp = (delay: number): CSSProperties => ({
    opacity:    statsVisible ? 1 : 0,
    transform:  statsVisible ? "translateY(0)" : "translateY(16px)",
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
        <h1 className="text-[54px] font-extrabold leading-tight tracking-tight min-h-[1em]" style={{ marginBottom: "14px" }}>
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
            The legacy payment system had separate business logic scattered across each provider, causing severe code duplication and skyrocketing maintenance costs.
          </p>
          <p className="text-[15px] leading-relaxed text-zinc-400">
            Designed an IoC-based <span className="text-white font-semibold">PaymentGateway interface</span> to make each provider implementation swappable via dependency injection, consolidating all business logic into a single location.
          </p>
        </div>

        {/* stats */}
        <div className="flex items-center gap-6" style={{ ...fadeUp(160), marginTop: "36px", flexWrap: "nowrap" }}>
          {[
            { value: "35%",  label: "Code Reduction",      color: "rgba(52,211,153,0.9)" },
            { value: "80%",  label: "Faster PG Integration", color: "rgba(96,165,250,0.9)" },
          ].map(({ value, label, color }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 }}>
              {i > 0 && (
                <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "30px", userSelect: "none" }}>|</span>
              )}
              <div className="flex flex-col gap-1">
                <span className="font-black" style={{ fontSize: "33px", whiteSpace: "nowrap", color }}>{value}</span>
                <span className="text-white" style={{ fontSize: "15px", whiteSpace: "nowrap" }}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 우측 다이어그램 영역 ── */}
      <div className="flex-1 relative" style={{ padding: "16px 12px 16px 0" }}>
        <WashswatAnimation
          active={statsVisible}
          skipAnimation={skipAnimation}
          onComplete={handleAnimationComplete}
        />
      </div>

    </div>
  );
};
