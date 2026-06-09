"use client";

import { useState } from "react";

export function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-[#2c2c2c] border border-[#3f3f3f] rounded-[10px] px-1.5 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50">
      <HudBtn label="Zoom out" onClick={onZoomOut}>
        <Minus />
      </HudBtn>

      <button
        title="Reset zoom (Ctrl+0)"
        onClick={onReset}
        className="bg-transparent border-none text-[#a1a1aa] cursor-pointer text-xs font-mono min-w-[52px] text-center px-1 leading-none hover:text-[#e4e4e7] transition-colors"
      >
        {scale}%
      </button>

      <HudBtn label="Zoom in" onClick={onZoomIn}>
        <Plus />
      </HudBtn>
    </div>
  );
}

function HudBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`
        w-7 h-7 flex items-center justify-center
        border-none rounded-md cursor-pointer shrink-0
        transition-[background,color] duration-100
        ${hov ? "bg-[#3f3f3f] text-[#e4e4e7]" : "bg-transparent text-[#a1a1aa]"}
      `}
    >
      {children}
    </button>
  );
}

function Minus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Plus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
