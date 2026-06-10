"use client";

export const NAV_ORBS: {
  label: string;
  x: number;
  y: number;
  bg: string;
  floatDuration: string;
  floatDelay: string;
}[] = [
  { label: "Work",       x: -490, y: -310, bg: "#DBEAFE", floatDuration: "3.8s", floatDelay: "0.0s" },
  { label: "Projects",   x:   60, y: -360, bg: "#FCE7F3", floatDuration: "4.5s", floatDelay: "0.6s" },
  { label: "Skills",     x:  460, y: -280, bg: "#D1FAE5", floatDuration: "3.3s", floatDelay: "1.3s" },
  { label: "Experience", x:  530, y:   60, bg: "#EDE9FE", floatDuration: "5.0s", floatDelay: "0.3s" },
  { label: "Contact",    x:  140, y:  280, bg: "#FEF3C7", floatDuration: "4.2s", floatDelay: "1.8s" },
  { label: "About",      x: -530, y:   60, bg: "#FFE4E6", floatDuration: "3.6s", floatDelay: "0.9s" },
];

export const NavOrb = ({
  label,
  bg,
  floatDuration,
  floatDelay,
  visible,
  idle,
}: {
  label: string;
  bg: string;
  floatDuration: string;
  floatDelay: string;
  visible: boolean;
  idle: boolean;
}) => {
  const animation = idle
    ? `orbFloat ${floatDuration} ease-in-out ${floatDelay} infinite`
    : visible
    ? "orbBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards"
    : "none";

  return (
    <div
      className="w-[108px] h-[108px] rounded-full flex items-center justify-center cursor-pointer select-none
        shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:scale-105
        transition-[box-shadow,transform] duration-200"
      style={{
        background: bg,
        opacity: visible ? 1 : 0,
        animation,
      }}
    >
      <span className="text-[14px] text-zinc-700 font-bold tracking-wide text-center leading-tight px-3">
        {label}
      </span>
    </div>
  );
};
