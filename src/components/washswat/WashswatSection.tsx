"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { useCanvas } from "../InfiniteCanvas";
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
  const { panTo } = useCanvas();

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
            기존 결제 시스템은 각 PG사마다 개별 비즈니스 로직이 산재해 있어 코드 중복과 유지보수 비용이 급증했습니다.
          </p>
          <p className="text-[15px] leading-relaxed text-zinc-400">
            IoC 기반의 <span className="text-white font-semibold">PaymentGateway 인터페이스</span>를 설계해 의존성 주입으로
            각 PG사 구현체를 교체 가능하게 만들고, 비즈니스 로직을 단일 위치에 통합했습니다.
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
