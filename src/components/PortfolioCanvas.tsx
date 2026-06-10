"use client";

import { useEffect, useState } from "react";
import { InfiniteCanvas, CanvasNode } from "./InfiniteCanvas";
import { ProfileSection } from "./ProfileSection";
import { NavOrb, NAV_ORBS } from "./NavOrb";

// 프로필 애니메이션 완료 시점 (name + subtitle 타이핑 + bio 페이드인 + 소셜 아이콘)
const PROFILE_ANIMATION_DURATION_MS = 4200;
const ORB_STAGGER_MS = 180;

export const PortfolioCanvas = () => {
  const [visibleOrbCount, setVisibleOrbCount] = useState(0);

  useEffect(() => {
    NAV_ORBS.forEach((_, index) => {
      const delay = PROFILE_ANIMATION_DURATION_MS + index * ORB_STAGGER_MS;
      const timer = setTimeout(() => setVisibleOrbCount(index + 1), delay);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <InfiniteCanvas>
      {/* Profile */}
      <CanvasNode x={-300} y={-100}>
        <ProfileSection />
      </CanvasNode>

      {/* Navigation orbs */}
      {NAV_ORBS.map(({ label, x, y }, index) => (
        <CanvasNode key={label} x={x} y={y}>
          <NavOrb label={label} visible={visibleOrbCount > index} />
        </CanvasNode>
      ))}
    </InfiniteCanvas>
  );
};
