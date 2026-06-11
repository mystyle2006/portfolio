"use client";

import { useEffect, useState } from "react";
import { InfiniteCanvas, CanvasNode, useCanvas } from "./InfiniteCanvas";
import { ProfileSection } from "./ProfileSection";
import { NavOrb, NAV_ORBS } from "./NavOrb";
import { JelpalaSection } from "./JelpalaSection";

/* ── CanvasNavButton ─────────────────────────────────────────────────── */

type ArrowDir = "up" | "down" | "left" | "right";

const ARROW_PATH: Record<ArrowDir, string> = {
  up:    "M8 13V3M8 3L3 8M8 3L13 8",
  down:  "M8 3V13M8 13L3 8M8 13L13 8",
  left:  "M13 8H3M3 8L8 3M3 8L8 13",
  right: "M3 8H13M13 8L8 3M13 8L8 13",
};

const CanvasNavButton = ({
  label,
  destination,
  arrow = "up",
  visible = true,
}: {
  label: string;
  destination: { x: number; y: number };
  arrow?: ArrowDir;
  visible?: boolean;
}) => {
  const { panTo } = useCanvas();

  return (
    <div
      className="flex items-center gap-3"
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <button
        onClick={() => panTo(destination.x, destination.y)}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "#ffffff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d={ARROW_PATH[arrow]} stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 500, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </div>
  );
};

/* ── 섹션별 네비게이션 버튼 설정 ────────────────────────────────────── */

const SECTION_NAV_BUTTONS = {

  jelpala: [
    { x: -1635, y: -1357, label: "View System Design", destination: { x: 80, y: 10 }, arrow: "up" as ArrowDir },
  ],

  // projects: [],
  // skills: [],

} satisfies Record<string, { x: number; y: number; label: string; destination: { x: number; y: number }; arrow: ArrowDir }[]>;

/* ── PortfolioCanvas ─────────────────────────────────────────────────── */

const PROFILE_DONE_MS = 4200;
const ORB_STAGGER_MS  = 180;
const ORB_ENTRANCE_MS = 550;
const IDLE_START_MS   = PROFILE_DONE_MS + NAV_ORBS.length * ORB_STAGGER_MS + ORB_ENTRANCE_MS;

export const PortfolioCanvas = () => {
  const [visibleOrbCount, setVisibleOrbCount] = useState(0);
  const [orbsIdle, setOrbsIdle]               = useState(false);
  const [jelpalaReady, setJelpalaReady]       = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    NAV_ORBS.forEach((_, index) => {
      timers.push(
        setTimeout(
          () => setVisibleOrbCount(index + 1),
          PROFILE_DONE_MS + index * ORB_STAGGER_MS,
        ),
      );
    });

    timers.push(setTimeout(() => setOrbsIdle(true), IDLE_START_MS));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <InfiniteCanvas>

      {/* ── Profile ─────────────────────────────────────────────────── */}
      <CanvasNode x={-300} y={-100}>
        <ProfileSection />
      </CanvasNode>

      {NAV_ORBS.map(({ title, x, y, bg, floatDuration, floatDelay, destination }, index) => (
        <CanvasNode key={title} x={x} y={y}>
          <NavOrb
            title={title}
            bg={bg}
            floatDuration={floatDuration}
            floatDelay={floatDelay}
            visible={visibleOrbCount > index}
            idle={orbsIdle}
            destination={destination}
          />
        </CanvasNode>
      ))}

      {/* ── Jelpala ─────────────────────────────────────────────────── */}
      <CanvasNode x={-2264} y={-1301} width={1440} height={600}>
        <JelpalaSection
          skipAnimation={jelpalaReady}
          onAnimationComplete={() => setJelpalaReady(true)}
        />
      </CanvasNode>

      {SECTION_NAV_BUTTONS.jelpala.map(({ x, y, label, destination, arrow }) => (
        <CanvasNode key={label} x={x} y={y}>
          <CanvasNavButton label={label} destination={destination} arrow={arrow} visible={jelpalaReady} />
        </CanvasNode>
      ))}

    </InfiniteCanvas>
  );
};
