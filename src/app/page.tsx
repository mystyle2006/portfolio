"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ── constants ────────────────────────────────────────────────────── */

const MIN_SCALE = 0.02;
const MAX_SCALE = 20;
const GRID_BASE  = 40;   // canvas-space grid unit (px at scale = 1)

/* ── helpers ──────────────────────────────────────────────────────── */

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

/** Pick a grid step so the rendered dot-spacing stays in [MIN_PX, MAX_PX]. */
function adaptiveGridStep(scale: number, minPx = 20, maxPx = 140): number {
  let step = GRID_BASE;
  while (step * scale < minPx) step *= 4;
  while (step * scale > maxPx) step /= 4;
  return step;
}

/* ── component ────────────────────────────────────────────────────── */

export default function InfiniteCanvas() {
  /* refs for zero-re-render hot path */
  const containerRef    = useRef<HTMLDivElement>(null);
  const canvasLayerRef  = useRef<HTMLDivElement>(null);
  const gridRef         = useRef<HTMLDivElement>(null);
  const rafId           = useRef(0);
  const isDragging      = useRef(false);
  const lastPtr         = useRef({ x: 0, y: 0 });

  /* transform lives in a ref so wheel / pointer handlers never go stale */
  const cam = useRef({ x: 0, y: 0, scale: 1 });

  /* React state — only what the UI actually needs to re-render */
  const [scale100, setScale100]   = useState(100);
  const [spaceDown, setSpaceDown] = useState(false);
  const [panning,   setPanning]   = useState(false);

  /* ── flush: apply cam ref → DOM (one rAF per frame) ──────────── */
  const flush = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const { x, y, scale } = cam.current;

      if (canvasLayerRef.current) {
        canvasLayerRef.current.style.transform =
          `translate(${x}px,${y}px) scale(${scale})`;
      }

      if (gridRef.current) {
        const step  = adaptiveGridStep(scale);
        const gPx   = step * scale;
        const gx    = ((x % gPx) + gPx) % gPx;
        const gy    = ((y % gPx) + gPx) % gPx;
        const dotR  = clamp(gPx * 0.038, 0.6, 2.4);
        const el    = gridRef.current;
        el.style.backgroundSize     = `${gPx}px ${gPx}px`;
        el.style.backgroundPosition = `${gx}px ${gy}px`;
        el.style.backgroundImage    =
          `radial-gradient(circle,#3a3a3a ${dotR}px,transparent ${dotR}px)`;
      }

      setScale100(Math.round(scale * 100));
    });
  }, []);

  /* ── init: centre the origin on screen ───────────────────────── */
  useEffect(() => {
    cam.current = {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
      scale: 1,
    };
    flush();
  }, [flush]);

  /* ── zoom around a screen point ──────────────────────────────── */
  const zoomAt = useCallback((sx: number, sy: number, factor: number) => {
    const prev     = cam.current.scale;
    const newScale = clamp(prev * factor, MIN_SCALE, MAX_SCALE);
    const sf       = newScale / prev;
    cam.current = {
      scale: newScale,
      x: sx - (sx - cam.current.x) * sf,
      y: sy - (sy - cam.current.y) * sf,
    };
    flush();
  }, [flush]);

  /* ── reset view ───────────────────────────────────────────────── */
  const resetView = useCallback(() => {
    cam.current = {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
      scale: 1,
    };
    flush();
  }, [flush]);

  /* ── wheel: scroll → pan, ctrl+scroll / pinch → zoom ─────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        /* pinch or ctrl+scroll → zoom centred on cursor */
        zoomAt(e.clientX, e.clientY, 1 - e.deltaY * 0.004);
      } else {
        /* two-finger or scroll wheel → pan */
        cam.current.x -= e.deltaX;
        cam.current.y -= e.deltaY;
        flush();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, flush]);

  /* ── keyboard: Space = pan mode, Ctrl/Cmd+0 = reset ──────────── */
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setSpaceDown(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        resetView();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup",   up);
    };
  }, [resetView]);

  /* ── pointer events: drag to pan ─────────────────────────────── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    /* left drag OR middle click OR space+left */
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      isDragging.current  = true;
      lastPtr.current     = { x: e.clientX, y: e.clientY };
      setPanning(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    cam.current.x += e.clientX - lastPtr.current.x;
    cam.current.y += e.clientY - lastPtr.current.y;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    flush();
  }, [flush]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    setPanning(false);
  }, []);

  /* ── cursor ───────────────────────────────────────────────────── */
  const cursor = panning ? "grabbing" : spaceDown ? "grab" : "default";

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#1e1e1e",
        cursor,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* ── dot-grid background ── */}
      <div
        ref={gridRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      {/* ── canvas transform layer ── */}
      <div
        ref={canvasLayerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        {/* origin cross */}
        <svg
          width="0"
          height="0"
          style={{
            position: "absolute",
            transform: "translate(-50%,-50%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <line x1="-20" y1="0" x2="20" y2="0" stroke="#3f3f46" strokeWidth="1" />
          <line x1="0" y1="-20" x2="0" y2="20" stroke="#3f3f46" strokeWidth="1" />
          <circle r="3" fill="#6366f1" />
        </svg>
      </div>

      {/* ── HUD: zoom controls (bottom-centre) ── */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "#2c2c2c",
          border: "1px solid #3f3f3f",
          borderRadius: 10,
          padding: "4px 6px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <HudBtn label="Zoom out" onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 0.8)}>
          <Minus />
        </HudBtn>

        {/* zoom % — click to reset to 100 % */}
        <button
          title="Reset zoom (Ctrl+0)"
          onClick={resetView}
          style={{
            background: "none",
            border: "none",
            color: "#a1a1aa",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "ui-monospace, monospace",
            minWidth: 52,
            textAlign: "center",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          {scale100}%
        </button>

        <HudBtn label="Zoom in" onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.25)}>
          <Plus />
        </HudBtn>
      </div>

      {/* ── shortcuts hint (bottom-right) ── */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 5,
          pointerEvents: "none",
        }}
      >
        {([
          ["Scroll",        "Pan"],
          ["Ctrl + Scroll", "Zoom"],
          ["Pinch",         "Zoom"],
        ] as const).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <kbd style={{
              fontSize: 10,
              color: "#52525b",
              fontFamily: "ui-monospace, monospace",
              background: "#262626",
              border: "1px solid #3f3f3f",
              borderRadius: 4,
              padding: "1px 7px",
            }}>
              {k}
            </kbd>
            <span style={{ fontSize: 10, color: "#52525b" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── small reusable pieces ────────────────────────────────────────── */

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
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: hov ? "#3f3f3f" : "transparent",
        border: "none",
        borderRadius: 6,
        color: hov ? "#e4e4e7" : "#a1a1aa",
        cursor: "pointer",
        transition: "background 0.1s, color 0.1s",
        flexShrink: 0,
      }}
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
