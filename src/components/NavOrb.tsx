"use client";

import { useCanvas } from "./InfiniteCanvas";

export const NAV_ORBS: {
  title: string;
  x: number;
  y: number;
  bg: string;
  floatDuration: string;
  floatDelay: string;
  destination?: { x: number; y: number };
}[] = [
  { title: "2026",       x: -490, y: -310, bg: "#DBEAFE", floatDuration: "3.8s", floatDelay: "0.0s", destination: { x: -1544, y: -1071 } },
  { title: "Projects",   x:   60, y: -360, bg: "#FCE7F3", floatDuration: "4.5s", floatDelay: "0.6s" },
  { title: "2024",       x:  460, y: -280, bg: "#D1FAE5", floatDuration: "3.3s", floatDelay: "1.3s", destination: { x: 1816, y: -878 } },
  { title: "Experience", x:  530, y:   60, bg: "#EDE9FE", floatDuration: "5.0s", floatDelay: "0.3s" },
  { title: "Contact",    x:  140, y:  280, bg: "#FEF3C7", floatDuration: "4.2s", floatDelay: "1.8s" },
  { title: "2025",       x: -530, y:   60, bg: "#FFE4E6", floatDuration: "3.6s", floatDelay: "0.9s", destination: { x: -1544, y: 792 } },
];

export const NavOrb = ({
  title,
  bg,
  floatDuration,
  floatDelay,
  visible,
  idle,
  destination,
  onNavigate,
}: {
  title: string;
  bg: string;
  floatDuration: string;
  floatDelay: string;
  visible: boolean;
  idle: boolean;
  destination?: { x: number; y: number };
  onNavigate?: () => void;
}) => {
  const { panTo } = useCanvas();

  const animation = idle
    ? `orbFloat ${floatDuration} ease-in-out ${floatDelay} infinite`
    : visible
    ? "orbBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards"
    : "none";

  const handleClick = () => {
    if (destination) {
      panTo(destination.x, destination.y);
      onNavigate?.();
    }
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={handleClick}
      className="w-[140px] h-[140px] rounded-full flex items-center justify-center select-none
        shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:scale-110"
      style={{
        background: bg,
        opacity: visible ? 1 : 0,
        animation,
        cursor: destination ? "pointer" : "default",
        transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease",
      }}
    >
      <span className="text-[28px] text-zinc-900 font-bold tracking-wide text-center leading-tight px-4">
        {title}
      </span>
    </div>
  );
};
