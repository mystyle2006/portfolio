"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { useCanvas } from "../InfiniteCanvas";

const TITLE    = "Reducing Settlement Processing Time by Over 80%";
const SUBTITLE = "Built in close collaboration with finance and operations teams to automate reconciliation and settlement workflows across multiple marketplaces.";

const KEYWORDS: { text: string; color: string; destination?: { x: number; y: number } }[] = [
  { text: "Real-Time Multi-Channel Order Integration", color: "#60A5FA", destination: { x: 3348, y: -87 } },
  { text: "Order Processing Scalability",              color: "#34D399", destination: { x: 3503, y: 963 } },
  { text: "Duplicate Settlement Prevention",           color: "#FBBF24" },
  { text: "OMS/WMS Data Consistency",                  color: "#A78BFA" },
];

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
  const [kwPhase,        setKwPhase]        = useState(skipAnimation ? KEYWORDS.length - 1 : -1);
  const notifiedRef = useRef(false);
  const { panTo } = useCanvas();

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
    const timers: ReturnType<typeof setTimeout>[] = [];
    KEYWORDS.forEach((_, i) =>
      timers.push(setTimeout(() => setKwPhase(i), i * 220))
    );
    timers.push(setTimeout(() => {
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        onAnimationComplete?.();
      }
    }, KEYWORDS.length * 220 + 300));
    return () => timers.forEach(clearTimeout);
  }, [contentVisible]);

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

        <div className="flex items-center gap-6" style={{ ...fadeUp(120), marginTop: "36px", flexWrap: "nowrap" }}>
          {[
            { value: "50,000+", label: "Monthly Orders Processed", color: "rgba(52,211,153,0.9)" },
          ].map(({ value, label, color }) => (
            <div key={label} className="flex flex-col gap-1" style={{ flexShrink: 0 }}>
              <span className="font-black" style={{ fontSize: "33px", whiteSpace: "nowrap", color }}>{value}</span>
              <span className="text-white" style={{ fontSize: "15px", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 우측 키워드 영역 ── */}
      <div
        className="flex-1 flex flex-col justify-center"
        style={{ padding: "48px 48px 48px 24px", gap: "20px" }}
      >
        {KEYWORDS.map(({ text, color, destination }, i) => {
          const visible = kwPhase >= i;
          return (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(20px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              <div style={{
                width: "3px",
                height: "36px",
                borderRadius: "2px",
                background: color,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}>
                {text}
              </span>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => destination && panTo(destination.x, destination.y)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
