"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const NAME     = "INHO LEE";
const SUBTITLE = "Full-Stack Engineer  ·  Toronto, ON";

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
  const [nameText, setNameText]         = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  const [phase, setPhase]               = useState<"name" | "subtitle" | "done">("name");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [bioVisible, setBioVisible]       = useState(false);

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
            setTimeout(() => setBioVisible(true), 100);
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
      <div className="space-y-4 pt-2">

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

      </div>
    </div>
  );
};
