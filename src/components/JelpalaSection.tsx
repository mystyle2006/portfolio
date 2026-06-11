"use client";

import { useEffect, useState, CSSProperties } from "react";
import { MapBackground } from "./MapBackground";
import { useCanvas } from "./InfiniteCanvas";

const TITLE    = "Jelpala";
const SUBTITLE = "Real-Time Freight Matching Platform";

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

export const JelpalaSection = ({
  onAnimationComplete,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
}) => {
  const { panTo } = useCanvas();

  const [titleText,     setTitleText]     = useState(skipAnimation ? TITLE    : "");
  const [subtitleText,  setSubtitleText]  = useState(skipAnimation ? SUBTITLE : "");
  const [phase,         setPhase]         = useState<"title" | "subtitle" | "done">(skipAnimation ? "done" : "title");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [statsVisible,  setStatsVisible]  = useState(skipAnimation);

  /* cursor blink */
  useEffect(() => {
    const timer = setInterval(() => setCursorVisible((prev) => !prev), 530);
    return () => clearInterval(timer);
  }, []);

  /* typewriter: title → subtitle → done (skipAnimation 시 실행 안 함) */
  useEffect(() => {
    if (skipAnimation) return;
    let index = 0;

    if (phase === "title") {
      const timer = setInterval(() => {
        index++;
        setTitleText(TITLE.slice(0, index));
        if (index >= TITLE.length) {
          clearInterval(timer);
          setTimeout(() => setPhase("subtitle"), 280);
        }
      }, 80);
      return () => clearInterval(timer);
    }

    if (phase === "subtitle") {
      const timer = setInterval(() => {
        index++;
        setSubtitleText(SUBTITLE.slice(0, index));
        if (index >= SUBTITLE.length) {
          clearInterval(timer);
          setTimeout(() => {
            setPhase("done");
            setTimeout(() => {
              setStatsVisible(true);
              onAnimationComplete?.();
            }, 100);
          }, 200);
        }
      }, 35);
      return () => clearInterval(timer);
    }
  }, [phase, skipAnimation]);

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
      {/* ── 좌측 텍스트 영역 (pan 차단 + 텍스트 선택 허용) ── */}
      <div
        className="px-14 py-12 w-[620px] shrink-0 relative z-10 select-text"
        onPointerDown={(e) => e.stopPropagation()}
      >

        {/* title */}
        <h1 className="text-[80px] font-extrabold leading-none tracking-tight min-h-[1em]" style={{ marginBottom: "14px" }}>
          {titleText}
          {phase === "title" && <Cursor visible={cursorVisible} />}
        </h1>

        {/* subtitle */}
        <p className="text-[22px] font-medium text-zinc-400 min-h-[1.5em] mb-12">
          {subtitleText}
          {phase === "subtitle" && <Cursor visible={cursorVisible} />}
        </p>

        {/* description */}
        <p className="text-[15px] leading-relaxed text-zinc-400" style={fadeUp(0)}>
          North America&apos;s First Semi-Truck Sharing Platform.
        </p>

        {/* role list */}
        <ul className="flex flex-col gap-2.5" style={{ ...fadeUp(80), marginTop: "20px" }}>
          {[
            <>Led the <K>end-to-end development</K> of Jelpala, a logistics marketplace connecting shippers and truck drivers across <K>North America</K>.</>,
            <>Designed and implemented <K>customer, driver, and admin platforms</K> for <K>Web, iOS, and Android</K>.</>,
            <>Architected scalable cloud infrastructure on <K>AWS ECS</K>, <K>Redis</K>, <K>RDS</K>, and <K>S3</K>.</>,
            <>Built a <K>location-based matching system</K> using <K>Redis GEO</K> to connect drivers with nearby shipments in real time.</>,
            <>Integrated <K>Stripe</K> payments, <K>Mailgun</K> notifications, and <K>CI/CD pipelines</K> for production.</>,
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 leading-relaxed text-zinc-400" style={{ fontSize: "13px" }}>
              <span style={{ marginTop: "9px", width: "4px", height: "4px", borderRadius: "50%", background: "#52525b", flexShrink: 0, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* stats */}
        <div className="flex items-center gap-4" style={{ ...fadeUp(200), marginTop: "32px" }}>
          {[
            { value: "Redis GEO", label: "Based Matching" },
            { value: "Real-time", label: "Message Processing" },
            { value: "3,000+",    label: "Concurrent Users" },
          ].map(({ value, label }, i) => (
            <>
              {i > 0 && (
                <span key={`sep-${i}`} style={{ color: "rgba(255,255,255,0.1)", fontSize: "20px", userSelect: "none" }}>|</span>
              )}
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[22px] font-black text-blue-400">{value}</span>
                <span className="text-[13px] text-white">{label}</span>
              </div>
            </>
          ))}
        </div>

      </div>

      {/* ── 우측 지도 영역 (pan 허용) ── */}
      <div className="flex-1 relative">
        <MapBackground active={statsVisible} skipAnimation={skipAnimation} />
      </div>

      {/* ── 프로필로 돌아가기 버튼 ── */}
      <button
        onClick={() => panTo(80, 10)}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center z-20"
        style={{
          background: "#ffffff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 4L14 14M14 14V6M14 14H6" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
