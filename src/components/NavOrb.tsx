const NavOrb = ({ label }: { label: string }) => (
  <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center cursor-pointer select-none
    bg-[#1a1a1a] border border-white/[0.1]
    hover:border-white/25 hover:bg-[#222]
    transition-all duration-200 hover:scale-105"
  >
    <span className="text-[11px] text-zinc-500 font-medium tracking-wide text-center leading-tight px-2">
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

export default NavOrb;
