"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomControls } from "./ZoomControls";

/* ── constants ──────────────────────────────────────────────────────── */

const MIN_SCALE = 0.02;
const MAX_SCALE = 20;
const GRID_BASE_SIZE = 40;

/* ── helpers ────────────────────────────────────────────────────────── */

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const adaptiveGridStep = (scale: number, minPixels = 20, maxPixels = 140): number => {
  let step = GRID_BASE_SIZE;
  while (step * scale < minPixels) step *= 4;
  while (step * scale > maxPixels) step /= 4;
  return step;
};

/* ── CanvasNode ─────────────────────────────────────────────────────── */

/**
 * 캔버스 좌표계의 특정 위치에 콘텐츠를 배치합니다.
 * x, y는 캔버스 원점(0, 0) 기준 픽셀 좌표입니다.
 */
export const CanvasNode = ({
  x = 0,
  y = 0,
  children,
}: {
  x?: number;
  y?: number;
  children: React.ReactNode;
}) => (
  <div className="absolute" style={{ left: x, top: y }}>
    {children}
  </div>
);

/* ── InfiniteCanvas ─────────────────────────────────────────────────── */

export const InfiniteCanvas = ({ children }: { children?: React.ReactNode }) => {
  const containerRef     = useRef<HTMLDivElement>(null);
  const canvasLayerRef   = useRef<HTMLDivElement>(null);
  const gridRef          = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef(0);
  const isDragging       = useRef(false);
  const lastPointer      = useRef({ x: 0, y: 0 });
  const camera           = useRef({ x: 0, y: 0, scale: 1 });

  const [scale100, setScale100]       = useState(100);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isPanning, setIsPanning]     = useState(false);

  /* flush: camera ref → DOM (one rAF per frame) */
  const flush = useCallback(() => {
    cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(() => {
      const { x, y, scale } = camera.current;

      if (canvasLayerRef.current) {
        canvasLayerRef.current.style.transform =
          `translate(${x}px,${y}px) scale(${scale})`;
      }

      if (gridRef.current) {
        const step          = adaptiveGridStep(scale);
        const gridPixelSize = step * scale;
        const gridOffsetX   = ((x % gridPixelSize) + gridPixelSize) % gridPixelSize;
        const gridOffsetY   = ((y % gridPixelSize) + gridPixelSize) % gridPixelSize;
        const dotRadius     = clamp(gridPixelSize * 0.038, 0.6, 2.4);

        gridRef.current.style.backgroundSize     = `${gridPixelSize}px ${gridPixelSize}px`;
        gridRef.current.style.backgroundPosition = `${gridOffsetX}px ${gridOffsetY}px`;
        gridRef.current.style.backgroundImage    =
          `radial-gradient(circle,#3a3a3a ${dotRadius}px,transparent ${dotRadius}px)`;
      }

      setScale100(Math.round(scale * 100));
    });
  }, []);

  /* init: centre origin on screen */
  useEffect(() => {
    camera.current = {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
      scale: 1,
    };
    flush();
  }, [flush]);

  /* zoom centred on a screen point */
  const zoomAt = useCallback((screenX: number, screenY: number, factor: number) => {
    const prevScale   = camera.current.scale;
    const newScale    = clamp(prevScale * factor, MIN_SCALE, MAX_SCALE);
    const scaleFactor = newScale / prevScale;
    camera.current = {
      scale: newScale,
      x: screenX - (screenX - camera.current.x) * scaleFactor,
      y: screenY - (screenY - camera.current.y) * scaleFactor,
    };
    flush();
  }, [flush]);

  /* reset to 100% centred */
  const resetView = useCallback(() => {
    camera.current = {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
      scale: 1,
    };
    flush();
  }, [flush]);

  /* wheel: scroll → pan, ctrl+scroll/pinch → zoom */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey) {
        zoomAt(event.clientX, event.clientY, 1 - event.deltaY * 0.004);
      } else {
        camera.current.x -= event.deltaX;
        camera.current.y -= event.deltaY;
        flush();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoomAt, flush]);

  /* keyboard: Space = pan cursor, Ctrl/Cmd+0 = reset */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        setIsSpaceDown(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "0") {
        event.preventDefault();
        resetView();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") setIsSpaceDown(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup",   handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup",   handleKeyUp);
    };
  }, [resetView]);

  /* pointer drag to pan */
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (event.button === 0 || event.button === 1) {
      event.preventDefault();
      isDragging.current  = true;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      setIsPanning(true);
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!isDragging.current) return;
    camera.current.x += event.clientX - lastPointer.current.x;
    camera.current.y += event.clientY - lastPointer.current.y;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    flush();
  }, [flush]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setIsPanning(false);
  }, []);

  const cursor = isPanning ? "grabbing" : isSpaceDown ? "grab" : "default";

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
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
        {[
          { key: "Scroll",        label: "Pan"  },
          { key: "Ctrl + Scroll", label: "Zoom" },
          { key: "Pinch",         label: "Zoom" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <kbd className="text-[10px] text-[#52525b] font-mono bg-[#262626] border border-[#3f3f3f] rounded px-1.5 py-px">
              {key}
            </kbd>
            <span className="text-[10px] text-[#52525b]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
