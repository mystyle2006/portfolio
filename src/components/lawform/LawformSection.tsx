"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { MapBackground } from "../jelpala/MapBackground";
import { useCanvas } from "../InfiniteCanvas";

const TITLE    = "Building a Highly Available Notification System at Lawform";
const SUBTITLE = "Designed an event-driven notification architecture using AWS SQS and Lambda, reliably delivering SMS and email notifications to 5,000+ recipients while improving system responsiveness and fault tolerance.";

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

export const LawformSection = ({
  onAnimationComplete,
  onNavReady,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  onNavReady?: () => void;
  skipAnimation?: boolean;
}) => {
  const { panTo } = useCanvas();

  const [titleText,     setTitleText]     = useState(skipAnimation ? TITLE    : "");
  const [subtitleText,  setSubtitleText]  = useState(skipAnimation ? SUBTITLE : "");
  const [phase,         setPhase]         = useState<"title" | "subtitle" | "done">(skipAnimation ? "done" : "title");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [statsVisible,  setStatsVisible]  = useState(skipAnimation);
  const [mapDone,       setMapDone]       = useState(skipAnimation);
  const notifiedRef = useRef(false);

  /* cursor blink */
  useEffect(() => {
    const timer = setInterval(() => setCursorVisible((prev) => !prev), 530);
    return () => clearInterval(timer);
  }, []);

  /* typewriter: title → subtitle → done */
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
            setTimeout(() => setStatsVisible(true), 100);
          }, 200);
        }
      }, 35);
      return () => clearInterval(timer);
    }
  }, [phase, skipAnimation]);

  /* stats 표시 직후 네비 버튼 노출 */
  useEffect(() => {
    if (!statsVisible) return;
    onNavReady?.();
  }, [statsVisible]);

  /* stats fadeUp 최장 딜레이(200ms) + 트랜지션(600ms) 이후 완료 */
  useEffect(() => {
    if (!statsVisible) return;
    const timer = setTimeout(() => {
      if (notifiedRef.current || !mapDone) return;
      notifiedRef.current = true;
      onAnimationComplete?.();
    }, 800);
    return () => clearTimeout(timer);
  }, [statsVisible, mapDone]);

  useEffect(() => {
    if (!mapDone || !statsVisible) return;
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    onAnimationComplete?.();
  }, [mapDone, statsVisible]);

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
        className="px-14 py-12 w-[620px] shrink-0 relative z-10 select-text"
        onPointerDown={(e) => e.stopPropagation()}
      >

        {/* title */}
        <h1 className="text-[36px] font-extrabold leading-tight tracking-tight min-h-[1em]" style={{ marginBottom: "14px" }}>
          {titleText}
          {phase === "title" && <Cursor visible={cursorVisible} />}
        </h1>

        {/* subtitle */}
        <p className="text-[15px] font-medium text-zinc-400 min-h-[1.5em] mb-12" style={{ lineHeight: "1.6" }}>
          {subtitleText}
          {phase === "subtitle" && <Cursor visible={cursorVisible} />}
        </p>

        {/* role list */}
        <ul className="flex flex-col gap-2.5" style={{ ...fadeUp(80), marginTop: "20px" }}>
          {[
            <>Built an <K>event-driven</K> notification system using <K>AWS SNS</K> and <K>SQS</K> fan-out, decoupling business logic from notification delivery and enabling scalable, fault-tolerant SMS and email processing.</>,
            <>Implemented the <K>Transactional Outbox</K> pattern to guarantee reliable event publishing and prevent notification loss during database transactions.</>,
            <>Leveraged <K>AWS Lambda</K> as SQS consumers to automatically scale notification processing based on traffic demand, reducing infrastructure management overhead and operational costs.</>,
            <>Designed and implemented <K>a Docker-based CI/CD pipeline</K> using <K>GitHub Actions</K>, standardizing build, testing, and deployment processes across environments.</>
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 leading-relaxed text-zinc-400" style={{ fontSize: "15px" }}>
              <span style={{ marginTop: "9px", width: "4px", height: "4px", borderRadius: "50%", background: "#52525b", flexShrink: 0, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* stats */}
        <div className="flex items-center gap-6" style={{ ...fadeUp(200), marginTop: "32px", flexWrap: "nowrap" }}>
          {[
            { value: "Redis GEO", label: "Based Matching" },
            { value: "Real-time", label: "Message Processing" },
            { value: "3,000+",    label: "Concurrent Users" },
          ].map(({ value, label }, i) => (
            <>
              {i > 0 && (
                <span key={`sep-${i}`} style={{ color: "rgba(255,255,255,0.1)", fontSize: "30px", userSelect: "none", flexShrink: 0 }}>|</span>
              )}
              <div key={label} className="flex flex-col gap-1" style={{ flexShrink: 0 }}>
                <span className="font-black text-blue-400" style={{ fontSize: "33px", whiteSpace: "nowrap" }}>{value}</span>
                <span className="text-white" style={{ fontSize: "19px", whiteSpace: "nowrap" }}>{label}</span>
              </div>
            </>
          ))}
        </div>

      </div>

      {/* ── 우측 지도 영역 ── */}
      <div className="flex-1 relative">
        <MapBackground active={statsVisible} skipAnimation={skipAnimation} onComplete={() => setMapDone(true)} />
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
