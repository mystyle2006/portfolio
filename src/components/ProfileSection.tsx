"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const NAME     = "INHO LEE";
const SUBTITLE = "Full-Stack Engineer  ·  Toronto, ON";

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/inho-lee-6040ba3b3",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/mystyle2006",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c.002.001.003 0 .005 0 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "Blog",
    href: "https://blog-dun-xi.vercel.app/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
];

/* ── Keyword highlight ── */
const Keyword = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white font-semibold underline decoration-indigo-400/60 decoration-2 underline-offset-[3px]">
    {children}
  </span>
);

/* ── Blinking cursor ── */
const Cursor = ({ visible }: { visible: boolean }) => (
  <span
    className="inline-block w-[2px] h-[0.85em] bg-white align-middle ml-[2px] translate-y-[-1px]"
    style={{ opacity: visible ? 1 : 0, transition: "opacity 0.1s" }}
  />
);

/* ── Main component ── */
export const ProfileSection = () => {
  const [nameText, setNameText]           = useState("");
  const [subtitleText, setSubtitleText]   = useState("");
  const [phase, setPhase]                 = useState<"name" | "subtitle" | "done">("name");
  const [cursorVisible, setCursorVisible]   = useState(true);
  const [bioVisible, setBioVisible]         = useState(false);
  const [visibleIconCount, setVisibleIconCount] = useState(0);

  /* cursor blink */
  useEffect(() => {
    const timer = setInterval(() => setCursorVisible((prev) => !prev), 530);
    return () => clearInterval(timer);
  }, []);

  /* typewriter: name → subtitle → done */
  useEffect(() => {
    let index = 0;

    if (phase === "name") {
      const timer = setInterval(() => {
        index++;
        setNameText(NAME.slice(0, index));
        if (index >= NAME.length) {
          clearInterval(timer);
          setTimeout(() => setPhase("subtitle"), 320);
        }
      }, 90);
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
              setBioVisible(true);
              // 아이콘을 바이오 페이드인(600ms) 이후 하나씩 등장
              SOCIAL_LINKS.forEach((_, index) => {
                setTimeout(() => setVisibleIconCount(index + 1), 700 + index * 180);
              });
            }, 100);
          }, 280);
        }
      }, 40);
      return () => clearInterval(timer);
    }
  }, [phase]);

  return (
    <div className="flex items-start gap-8 w-[760px]">

      {/* ── Photo ── */}
      <Image
        src="/me.jpeg"
        alt="Inho Lee"
        width={160}
        height={160}
        className="rounded-full object-cover object-top shrink-0"
      />

      {/* ── Text ── */}
      <div className="space-y-5 pt-2">

        <div>
          {/* Name */}
          <h1 className="text-[52px] font-bold tracking-tight leading-none text-white min-h-[1.15em]">
            {nameText}
            {phase === "name" && <Cursor visible={cursorVisible} />}
          </h1>

          {/* Subtitle */}
          <p className="text-[16px] text-zinc-400 mt-3 min-h-[1.5em]">
            {subtitleText}
            {phase === "subtitle" && <Cursor visible={cursorVisible} />}
          </p>
        </div>

        {/* Bio + Social wrapper */}
        <div className="flex flex-col gap-6">

          {/* Bio — fade in after typing */}
          <p
            className="text-[15px] text-zinc-400 leading-[1.8]"
            style={{
              opacity: bioVisible ? 1 : 0,
              transform: bioVisible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            Building scalable business systems across{" "}
            <Keyword>web, mobile, backend, and cloud</Keyword>.{" "}
            <Keyword>7 years of experience</Keyword> delivering{" "}
            <Keyword>payment platforms</Keyword>,{" "}
            <Keyword>settlement automation</Keyword>,{" "}
            <Keyword>logistics services</Keyword>, and{" "}
            <Keyword>high-performance applications</Keyword>—from{" "}
            architecture design to production deployment.
          </p>

          {/* Social links — appear one by one after bio */}
          <div className="flex items-center gap-3" onPointerDown={(e) => e.stopPropagation()}>
          {SOCIAL_LINKS.map(({ label, href, icon }, index) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              className="w-9 h-9 rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/25 hover:bg-white/[0.08] transition-all duration-200"
              style={{
                opacity: visibleIconCount > index ? 1 : 0,
                transform: visibleIconCount > index ? "scale(1)" : "scale(0.5)",
                transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {icon}
            </a>
          ))}
          </div>

        </div>{/* end bio+social wrapper */}

      </div>
    </div>
  );
};
