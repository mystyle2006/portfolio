"use client";

import { useEffect, useState } from "react";
import { InfiniteCanvas, CanvasNode, useCanvas } from "./InfiniteCanvas";
import { ProfileSection } from "./profile/ProfileSection";
import { NavOrb, NAV_ORBS } from "./NavOrb";
import { JelpalaSection } from "./jelpala/JelpalaSection";
import { JelpalaSystemDesignSection } from "./jelpala/JelpalaSystemDesignSection";
import { JelpalaMessagingSection } from "./jelpala/JelpalaMessagingSection";
import { JelpalaMatchingSection } from "./jelpala/JelpalaMatchingSection";

/* ── CanvasNavButton ─────────────────────────────────────────────────── */

type ArrowDir   = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";
type LabelSide  = "left" | "right";

const ARROW_PATH: Record<ArrowDir, string> = {
  up:         "M8 13V3M8 3L3 8M8 3L13 8",
  down:       "M8 3V13M8 13L3 8M8 13L13 8",
  left:       "M13 8H3M3 8L8 3M3 8L8 13",
  right:      "M3 8H13M13 8L8 3M13 8L8 13",
  "up-left":  "M13 13L3 3M3 3H9M3 3V9",
  "up-right": "M3 13L13 3M13 3H7M13 3V9",
  "down-left":  "M13 3L3 13M3 13H9M3 13V7",
  "down-right": "M3 3L13 13M13 13H7M13 13V7",
};

const CanvasNavButton = ({
  label,
  destination,
  arrow = "up",
  visible = true,
  labelSide = "right",
}: {
  label: string;
  destination: { x: number; y: number };
  arrow?: ArrowDir;
  visible?: boolean;
  labelSide?: LabelSide;
}) => {
  const { panTo } = useCanvas();

  const btn = (
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
  );

  const lbl = (
    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 500, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );

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
      {labelSide === "left" ? <>{lbl}{btn}</> : <>{btn}{lbl}</>}
    </div>
  );
};

/* ── 섹션별 네비게이션 버튼 설정 ────────────────────────────────────── */

const SECTION_NAV_BUTTONS = {

  jelpala: [
    // 상단 중앙
    { x: -1635, y: -1457, label: "View System Design",           destination: { x: -1435, y: -2178 }, arrow: "up"      as ArrowDir, labelSide: "right" as LabelSide },
    // 좌측 상단 모서리
    { x: -2360, y: -1420, label: "Distributed Real-Time Messaging", destination: { x: -3410, y: -1909 }, arrow: "up-left" as ArrowDir, labelSide: "right" as LabelSide },
    // 좌측 하단 모서리
    { x: -2360, y: -700,  label: "Matching Architecture",        destination: { x: -3514, y: 187 }, arrow: "down-left" as ArrowDir, labelSide: "right" as LabelSide },
  ],

  // projects: [],
  // skills: [],

} satisfies Record<string, { x: number; y: number; label: string; destination: { x: number; y: number }; arrow: ArrowDir; labelSide: LabelSide }[]>;

/* ── PortfolioCanvas ─────────────────────────────────────────────────── */

const PROFILE_DONE_MS = 4200;
const ORB_STAGGER_MS  = 180;
const ORB_ENTRANCE_MS = 550;
const IDLE_START_MS   = PROFILE_DONE_MS + NAV_ORBS.length * ORB_STAGGER_MS + ORB_ENTRANCE_MS;

export const PortfolioCanvas = () => {
  const [visibleOrbCount, setVisibleOrbCount] = useState(0);
  const [orbsIdle, setOrbsIdle]               = useState(false);
  const [jelpalaReady, setJelpalaReady]           = useState(false);
  const [sysDesignReady, setSysDesignReady]         = useState(false);
  const [messagingReady, setMessagingReady]         = useState(false);
  const [matchingReady, setMatchingReady]           = useState(false);

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

      {SECTION_NAV_BUTTONS.jelpala.map(({ x, y, label, destination, arrow, labelSide }) => (
        <CanvasNode key={label} x={x} y={y}>
          <CanvasNavButton label={label} destination={destination} arrow={arrow} labelSide={labelSide} visible={jelpalaReady} />
        </CanvasNode>
      ))}

      {/* ── Jelpala System Design ────────────────────────────────────── */}
      <CanvasNode x={-2235} y={-2588} width={1600} height={870}>
        <JelpalaSystemDesignSection
          skipAnimation={sysDesignReady}
          onAnimationComplete={() => setSysDesignReady(true)}
        />
      </CanvasNode>

      {/* ── Distributed Real-Time Messaging ─────────────────────────── */}
      <CanvasNode x={-4310} y={-2359} width={1800} height={900}>
        <JelpalaMessagingSection
          skipAnimation={messagingReady}
          onAnimationComplete={() => setMessagingReady(true)}
        />
      </CanvasNode>

      {/* ── Jelpala Matching Architecture ──────────────────────────── */}
      <CanvasNode x={-4314} y={-213} width={1600} height={2500}>
        <JelpalaMatchingSection
          skipAnimation={matchingReady}
          onAnimationComplete={() => setMatchingReady(true)}
        />
      </CanvasNode>

    </InfiniteCanvas>
  );
};
