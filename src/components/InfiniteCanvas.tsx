"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomControls } from "./ZoomControls";

/* ── constants ──────────────────────────────────────────────────────── */

const MIN_SCALE = 0.02;
const MAX_SCALE = 20;
const GRID_BASE = 40;

/* ── helpers ────────────────────────────────────────────────────────── */

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

function adaptiveGridStep(scale: number, minPx = 20, maxPx = 140): number {
  let step = GRID_BASE;
  while (step * scale < minPx) step *= 4;
  while (step * scale > maxPx) step /= 4;
  return step;
}

/* ── CanvasNode ─────────────────────────────────────────────────────── */

/**
 * 캔버스 좌표계의 특정 위치에 콘텐츠를 배치합니다.
 * x, y는 캔버스 원점(0, 0) 기준 픽셀 좌표입니다.
 */
export function CanvasNode({
  x = 0,
  y = 0,
  children,
}: {
  x?: number;
  y?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      {children}
    </div>
  );
}

/* ── InfiniteCanvas ─────────────────────────────────────────────────── */

export function InfiniteCanvas({ children }: { children?: React.ReactNode }) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const gridRef        = useRef<HTMLDivElement>(null);
  const rafId          = useRef(0);
  const isDragging     = useRef(false);
  const lastPtr        = useRef({ x: 0, y: 0 });
  const cam            = useRef({ x: 0, y: 0, scale: 1 });

  const [scale100, setScale100] = useState(100);
  const [spaceDown, setSpaceDown] = useState(false);
  const [panning, setPanning]     = useState(false);

  /* flush: cam ref → DOM (one rAF per frame) */
  const flush = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const { x, y, scale } = cam.current;

      if (canvasLayerRef.current) {
        canvasLayerRef.current.style.transform =
          `translate(${x}px,${y}px) scale(${scale})`;
      }

      if (gridRef.current) {
        const step = adaptiveGridStep(scale);
        const gPx  = step * scale;
        const gx   = ((x % gPx) + gPx) % gPx;
        const gy   = ((y % gPx) + gPx) % gPx;
        const dotR = clamp(gPx * 0.038, 0.6, 2.4);
        const el   = gridRef.current;
        el.style.backgroundSize     = `${gPx}px ${gPx}px`;
        el.style.backgroundPosition = `${gx}px ${gy}px`;
        el.style.backgroundImage    =
          `radial-gradient(circle,#3a3a3a ${dotR}px,transparent ${dotR}px)`;
      }

      setScale100(Math.round(scale * 100));
    });
  }, []);

  /* init: centre origin on screen */
  useEffect(() => {
    cam.current = {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
      scale: 1,
    };
    flush();
  }, [flush]);

  /* zoom centred on a screen point */
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

  /* reset to 100% centred */
  const resetView = useCallback(() => {
    cam.current = {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
      scale: 1,
    };
    flush();
  }, [flush]);

  /* wheel: scroll → pan, ctrl+scroll/pinch → zoom */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        zoomAt(e.clientX, e.clientY, 1 - e.deltaY * 0.004);
      } else {
        cam.current.x -= e.deltaX;
        cam.current.y -= e.deltaY;
        flush();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, flush]);

  /* keyboard: Space = pan cursor, Ctrl/Cmd+0 = reset */
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

  /* pointer drag to pan */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      isDragging.current = true;
      lastPtr.current    = { x: e.clientX, y: e.clientY };
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

  const cursor = panning ? "grabbing" : spaceDown ? "grab" : "default";

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="fixed inset-0 overflow-hidden bg-[#1e1e1e] select-none touch-none"
      style={{ cursor }}
    >
      {/* dot-grid background */}
      <div ref={gridRef} className="absolute inset-0 pointer-events-none" />

      {/* canvas transform layer */}
      <div
        ref={canvasLayerRef}
        className="absolute top-0 left-0"
        style={{ transformOrigin: "0 0", willChange: "transform" }}
      >
        {/* origin crosshair */}
        <svg
          width="0"
          height="0"
          className="absolute overflow-visible pointer-events-none"
          style={{ transform: "translate(-50%,-50%)" }}
        >
          <line x1="-20" y1="0" x2="20" y2="0" stroke="#3f3f46" strokeWidth="1" />
          <line x1="0" y1="-20" x2="0" y2="20" stroke="#3f3f46" strokeWidth="1" />
          <circle r="3" fill="#6366f1" />
        </svg>

        {/* canvas content — CanvasNode로 원하는 위치에 배치 */}
        {children}
      </div>

      {/* zoom HUD */}
      <ZoomControls
        scale={scale100}
        onZoomIn={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.25)}
        onZoomOut={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 0.8)}
        onReset={resetView}
      />

      {/* keyboard shortcuts hint */}
      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-1.5 pointer-events-none">
        {(["Scroll/Pan", "Ctrl+Scroll/Zoom", "Pinch/Zoom"] as const).map((hint) => {
          const [key, label] = hint.split("/");
          return (
            <div key={hint} className="flex items-center gap-2">
              <kbd className="text-[10px] text-[#52525b] font-mono bg-[#262626] border border-[#3f3f3f] rounded px-1.5 py-px">
                {key}
              </kbd>
              <span className="text-[10px] text-[#52525b]">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
