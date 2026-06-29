"use client";

import { CanvasContext } from "@/components/InfiniteCanvas";

const SECTION_MAP: Array<{ x: number; y: number; id: string }> = [
  { x: 80,    y: 10,    id: "profile" },
  { x: -1544, y: -1071, id: "jelpala" },
  { x: -1435, y: -2178, id: "jelpala-sysdesign" },
  { x: -3410, y: -1909, id: "jelpala-messaging" },
  { x: -3514, y: 187,   id: "jelpala-matching" },
  { x: 1816,  y: -878,  id: "washswat" },
  { x: 1816,  y: -2000, id: "washswat-deploy" },
  { x: 1596,  y: 761,   id: "gomi" },
  { x: 3348,  y: -87,   id: "gomi-oms" },
  { x: 3503,  y: 963,   id: "gomi-worker" },
  { x: 3384,  y: 2171,  id: "gomi-duplicate" },
  { x: 3342,  y: 3343,  id: "gomi-consistency" },
  { x: -1544, y: 792,   id: "lawform" },
  { x: -1611, y: 2004,  id: "lawform-ham" },
];

const coordToId = (cx: number, cy: number): string | null => {
  let best: { dist: number; id: string } | null = null;
  for (const s of SECTION_MAP) {
    const dist = Math.hypot(cx - s.x, cy - s.y);
    if (!best || dist < best.dist) best = { dist, id: s.id };
  }
  return best?.id ?? null;
};

export const MobileCanvasProvider = ({ children }: { children: React.ReactNode }) => (
  <CanvasContext.Provider
    value={{
      panTo: (x, y) => {
        const id = coordToId(x, y);
        if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      getViewport: () => ({ left: 0, top: 0, right: 0, bottom: 0 }),
      subscribeViewport: () => () => {},
    }}
  >
    {children}
  </CanvasContext.Provider>
);
