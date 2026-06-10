"use client";

export const NavOrb = ({ label, visible }: { label: string; visible: boolean }) => (
  <div
    className="w-[108px] h-[108px] rounded-full flex items-center justify-center cursor-pointer select-none
      bg-white shadow-[0_4px_24px_rgba(0,0,0,0.25)]
      hover:shadow-[0_6px_32px_rgba(0,0,0,0.35)] hover:scale-105
      transition-[box-shadow,transform] duration-200"
    style={{
      opacity: visible ? 1 : 0,
      animation: visible ? "orbBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
    }}
  >
    <span className="text-[12px] text-zinc-500 font-medium tracking-wide text-center leading-tight px-3">
      {label}
    </span>
  </div>
);

export const NAV_ORBS: { label: string; x: number; y: number }[] = [
  { label: "Work",       x: -490, y: -310 },
  { label: "Projects",   x:   60, y: -360 },
  { label: "Skills",     x:  460, y: -280 },
  { label: "Experience", x:  530, y:   60 },
  { label: "Contact",    x:  140, y:  280 },
  { label: "About",      x: -530, y:   60 },
];
