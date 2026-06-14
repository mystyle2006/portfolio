"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import Image from "next/image";
import { MapBackground } from "./MapBackground";
import { useCanvas } from "../InfiniteCanvas";

const USER_IMAGES = [
  "/jelpala_preview/user/user_1.PNG",
  "/jelpala_preview/user/user_2.PNG",
  "/jelpala_preview/user/user_3.jpg",
  "/jelpala_preview/user/user_4.jpg",
  "/jelpala_preview/user/user_5.jpg",
  "/jelpala_preview/user/user_6.jpg",
  "/jelpala_preview/user/user_7.jpg",
  "/jelpala_preview/user/user_8.jpg",
  "/jelpala_preview/user/user_9.png",
  "/jelpala_preview/user/IMG_8637 (1).PNG",
];

const DRIVER_IMAGES = [
  "/jelpala_preview/driver/driver1.jpeg",
  "/jelpala_preview/driver/driver2.PNG",
  "/jelpala_preview/driver/driver3.PNG",
  "/jelpala_preview/driver/driver4.PNG",
  "/jelpala_preview/driver/driver5.PNG",
  "/jelpala_preview/driver/driver6.PNG",
  "/jelpala_preview/driver/driver7.jpeg",
];

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
  const [mapDone,       setMapDone]       = useState(true);
  const [activeTab,     setActiveTab]     = useState<"features" | "previews">("features");
  const [previewGroup,  setPreviewGroup]  = useState<"user" | "driver">("user");
  const [slideIndex,    setSlideIndex]    = useState(0);
  const [lightbox,      setLightbox]      = useState<string | null>(null);
  const notifiedRef = useRef(false);

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
            <>Designed and implemented customer, driver, and admin platforms for Web, iOS, and Android using <K>React Native Expo</K>.</>,
            <>Architected scalable cloud infrastructure on <K>AWS ECS</K>, <K>Redis</K>, <K>RDS</K>, <K>SQS</K>, <K>Lambda</K> and <K>S3</K>.</>,
            <>Built a <K>location-based matching system</K> using <K>Redis GEO</K> to connect drivers with nearby shipments in real time.</>,
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

      {/* ── 우측 탭 영역 ── */}
      <div
        className="flex-1 relative flex flex-col"
        style={{ ...fadeUp(0), padding: "8px 40px 40px 32px" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* 탭 헤더 */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {(["features", "previews"] as const).map((tab) => {
            const label = tab === "features" ? "Key Features" : "App Previews";
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "0 0 14px",
                  marginRight: 32,
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  color: active ? "#ffffff" : "rgba(255,255,255,0.35)",
                  borderBottom: active ? "2px solid #ffffff" : "2px solid transparent",
                  marginBottom: -1,
                  transition: "color 0.2s ease, border-color 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div style={{ flex: 1, position: "relative" }}>
          {activeTab === "features" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
              {[
                {
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C7.24 2 5 4.24 5 7c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 10 5a1.5 1.5 0 0 1 0 3.5z" fill="rgba(96,165,250,0.9)"/></svg>,
                  title: "Google Maps Integration",
                  body: "Real-time route planning, truck stop search, distance & ETA calculation.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="11" rx="2" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6"/><path d="M2 8h16" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6"/><rect x="5" y="11" width="3" height="2" rx="0.5" fill="rgba(96,165,250,0.9)"/></svg>,
                  title: "Stripe Payment Integration",
                  body: "Secure payments and payouts with Stripe Connect.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6"/><path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                  title: "Authentication & Roles",
                  body: "Secure login system with role-based access for customers, drivers, and admins.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6"/><path d="M7 7h6M7 10h6M7 13h4" stroke="rgba(96,165,250,0.9)" strokeWidth="1.4" strokeLinecap="round"/></svg>,
                  title: "Document & Image Upload",
                  body: "Upload driver license and other required documents securely.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" fill="rgba(96,165,250,0.9)"/><circle cx="10" cy="10" r="7" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6"/><path d="M10 3V1M10 19v-2M3 10H1M19 10h-2" stroke="rgba(96,165,250,0.9)" strokeWidth="1.4" strokeLinecap="round"/></svg>,
                  title: "Matching System",
                  body: "Smart driver-shipment matching based on location, route, and availability in real time.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 0 0-6 6c0 3-1.5 4-1.5 4h15S16 11 16 8a6 6 0 0 0-6-6z" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6"/><path d="M8.5 16a1.5 1.5 0 0 0 3 0" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                  title: "Notification System",
                  body: "Multi-channel notifications via Push, Email, and SMS.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="rgba(96,165,250,0.9)" strokeWidth="1.6"/><path d="M10 6v1.5m0 5V14m0-6.5a2 2 0 0 1 2 2c0 1.1-.9 1.8-2 2s-2 .9-2 2a2 2 0 0 0 2 2" stroke="rgba(96,165,250,0.9)" strokeWidth="1.4" strokeLinecap="round"/></svg>,
                  title: "Point System",
                  body: "Reward-based point system for user engagement and driver incentives.",
                },
              ].map(({ icon, title, body }) => (
                <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: "rgba(96,165,250,0.08)",
                    border: "1px solid rgba(96,165,250,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.88)", marginBottom: 4 }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
                      {body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "previews" && (() => {
            const images = previewGroup === "user" ? USER_IMAGES : DRIVER_IMAGES;
            const PER_PAGE = 3;
            const maxIndex = Math.max(0, images.length - PER_PAGE);
            const visible = images.slice(slideIndex, slideIndex + PER_PAGE);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
                {/* User / Driver 서브탭 */}
                <div style={{ display: "flex", gap: 8 }}>
                  {(["user", "driver"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => { setPreviewGroup(g); setSlideIndex(0); }}
                      style={{
                        padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: previewGroup === g ? "rgba(255,255,255,0.12)" : "transparent",
                        border: "1px solid",
                        borderColor: previewGroup === g ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                        color: previewGroup === g ? "#fff" : "rgba(255,255,255,0.4)",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}
                    >
                      {g === "user" ? "User" : "Driver"}
                    </button>
                  ))}
                </div>

                {/* 슬라이드 영역 */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  {/* Prev */}
                  <button
                    onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                    disabled={slideIndex === 0}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: slideIndex === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      cursor: slideIndex === 0 ? "default" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M7.5 2L4 6l3.5 4" stroke={slideIndex === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* 이미지 3장 */}
                  <div style={{ display: "flex", gap: 10, flex: 1, justifyContent: "center" }}>
                    {visible.map((src, i) => (
                      <div
                        key={slideIndex + i}
                        onPointerDown={(e) => { e.stopPropagation(); setLightbox(src); }}
                        style={{
                          flex: "0 0 calc(33.33% - 7px)",
                          borderRadius: 16,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.04)",
                          aspectRatio: "9/19",
                          position: "relative",
                          cursor: "zoom-in",
                          transition: "transform 0.2s ease, border-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                      >
                        <Image
                          src={src}
                          alt={`preview-${slideIndex + i}`}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="200px"
                        />
                      </div>
                    ))}
                    {/* 빈 슬롯 채우기 */}
                    {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ flex: "0 0 calc(33.33% - 7px)" }} />
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setSlideIndex((i) => Math.min(maxIndex, i + 1))}
                    disabled={slideIndex >= maxIndex}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: slideIndex >= maxIndex ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      cursor: slideIndex >= maxIndex ? "default" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4.5 2L8 6l-3.5 4" stroke={slideIndex >= maxIndex ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* 페이지 인디케이터 */}
                <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlideIndex(i)}
                      style={{
                        width: i === slideIndex ? 16 : 5, height: 5, borderRadius: 3, border: "none",
                        background: i === slideIndex ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                        cursor: "pointer", padding: 0, transition: "all 0.25s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── 라이트박스 ── */}
      {lightbox && (
        <div
          onPointerDown={(e) => { e.stopPropagation(); setLightbox(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{ position: "relative", maxHeight: "90vh", maxWidth: "90vw" }}
          >
            <Image
              src={lightbox}
              alt="preview"
              width={400}
              height={860}
              style={{ objectFit: "contain", maxHeight: "90vh", width: "auto", borderRadius: 20 }}
            />
            <button
              onPointerDown={(e) => { e.stopPropagation(); setLightbox(null); }}
              style={{
                position: "absolute", top: -14, right: -14,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff", fontSize: 16, lineHeight: 1,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

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
