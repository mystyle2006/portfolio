"use client";

import { useEffect, useState } from "react";
import { InfiniteCanvas, CanvasNode } from "./InfiniteCanvas";
import { ProfileSection } from "./ProfileSection";
import { NavOrb, NAV_ORBS } from "./NavOrb";

const PROFILE_DONE_MS  = 4200;
const ORB_STAGGER_MS   = 180;
const ORB_ENTRANCE_MS  = 550; // orbBounce duration
const IDLE_START_MS    =
  PROFILE_DONE_MS + NAV_ORBS.length * ORB_STAGGER_MS + ORB_ENTRANCE_MS;

export const PortfolioCanvas = () => {
  const [visibleOrbCount, setVisibleOrbCount] = useState(0);
  const [orbsIdle, setOrbsIdle]               = useState(false);

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
      <CanvasNode x={-300} y={-100}>
        <ProfileSection />
      </CanvasNode>

      {NAV_ORBS.map(({ title, x, y, bg, floatDuration, floatDelay }, index) => (
        <CanvasNode key={title} x={x} y={y}>
          <NavOrb
            title={title}
            bg={bg}
            floatDuration={floatDuration}
            floatDelay={floatDelay}
            visible={visibleOrbCount > index}
            idle={orbsIdle}
          />
        </CanvasNode>
      ))}
    </InfiniteCanvas>
  );
};
