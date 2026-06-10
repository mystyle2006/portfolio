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

        {/* Achievements — fade in after typing */}
        <ul
          className="space-y-3"
          style={{
            opacity: bioVisible ? 1 : 0,
            transform: bioVisible ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {[
            <>Designed and implemented an <Keyword>automated settlement platform</Keyword> that reduced reconciliation time from <Keyword>15 days to 2 days</Keyword> and improved operational efficiency by <Keyword>80%</Keyword>.</>,
            <>Designed a highly available <Keyword>event-driven notification system</Keyword> using <Keyword>AWS SQS and Lambda</Keyword>, reliably delivering messages to <Keyword>5,000+ recipients</Keyword>.</>,
            <>Redesigned a legacy payment platform by unifying <Keyword>three separate payment services</Keyword> into a single scalable architecture, reducing production issues and improving maintainability.</>,
            <>Optimized critical backend services by redesigning data access patterns and database architecture, reducing <Keyword>API response times from 5s to under 500ms</Keyword>.</>,
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-[14px] text-zinc-400 leading-[1.75]">
              <span className="mt-[7px] w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
};
