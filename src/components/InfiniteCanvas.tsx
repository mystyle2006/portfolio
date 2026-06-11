"use client";

import { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import { ZoomControls } from "./ZoomControls";

/* ── Viewport type ──────────────────────────────────────────────────── */

interface Viewport {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/* ── Canvas context ─────────────────────────────────────────────────── */

interface CanvasContextValue {
  panTo: (canvasX: number, canvasY: number, durationMs?: number) => void;
  getViewport: () => Viewport;
  subscribeViewport: (listener: (vp: Viewport) => void) => () => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export const useCanvas = (): CanvasContextValue => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside InfiniteCanvas");
  return ctx;
};

/* ── constants ──────────────────────────────────────────────────────── */

const MIN_SCALE      = 0.02;
const MAX_SCALE      = 20;
const GRID_BASE_SIZE = 40;
const CULL_MARGIN    = 50; // 뷰포트 밖 여유 픽셀

/* ── helpers ────────────────────────────────────────────────────────── */

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const adaptiveGridStep = (scale: number, minPixels = 20, maxPixels = 140): number => {
  let step = GRID_BASE_SIZE;
  while (step * scale < minPixels) step *= 4;
  while (step * scale > maxPixels) step /= 4;
  return step;
};

const isInViewport = (
  x: number,
  y: number,
  width: number,
  height: number,
  vp: Viewport,
): boolean =>
  x + width  > vp.left   - CULL_MARGIN &&
  x          < vp.right  + CULL_MARGIN &&
  y + height > vp.top    - CULL_MARGIN &&
  y          < vp.bottom + CULL_MARGIN;

/* ── CanvasNode ─────────────────────────────────────────────────────── */

export const CanvasNode = ({
  x = 0,
  y = 0,
  width,
  height,
  children,
}: {
  x?: number;
  y?: number;
  width?: number;   // 콘텐츠 너비 — 제공 시 화면 밖에서 언마운트
  height?: number;  // 콘텐츠 높이 — 제공 시 화면 밖에서 언마운트
  children: React.ReactNode;
}) => {
  const ctx = useContext(CanvasContext);

  // 초기 mounted 상태를 렌더 시점의 viewport로 즉시 판단
  const [mounted, setMounted] = useState(() => {
    if (width === undefined || height === undefined) return true;
    return isInViewport(x, y, width, height, ctx?.getViewport() ?? {
      left: -960, top: -540, right: 960, bottom: 540,
    });
  });

  useEffect(() => {
    if (!ctx || width === undefined || height === undefined) return;
    const check = (vp: Viewport) => setMounted(isInViewport(x, y, width, height, vp));
    return ctx.subscribeViewport(check);
  }, [ctx, x, y, width, height]);

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {mounted ? children : null}
    </div>
  );
};

/* ── InfiniteCanvas ─────────────────────────────────────────────────── */

export const InfiniteCanvas = ({ children }: { children?: React.ReactNode }) => {
  const containerRef       = useRef<HTMLDivElement>(null);
  const canvasLayerRef     = useRef<HTMLDivElement>(null);
  const gridRef            = useRef<HTMLDivElement>(null);
  const animationFrameId   = useRef(0);
  const isDragging         = useRef(false);
  const lastPointer        = useRef({ x: 0, y: 0 });
  const camera             = useRef({ x: 0, y: 0, scale: 1 });
  const viewportRef        = useRef<Viewport>({
    left:   typeof window !== "undefined" ? -window.innerWidth  / 2 : -960,
    top:    typeof window !== "undefined" ? -window.innerHeight / 2 : -540,
    right:  typeof window !== "undefined" ?  window.innerWidth  / 2 :  960,
    bottom: typeof window !== "undefined" ?  window.innerHeight / 2 :  540,
  });
  const viewportListeners  = useRef<Set<(vp: Viewport) => void>>(new Set());

  const [scale100, setScale100]         = useState(100);
  const [isSpaceDown, setIsSpaceDown]   = useState(false);
  const [isPanning, setIsPanning]       = useState(false);
  const [canvasCoords, setCanvasCoords] = useState({ x: 0, y: 0 });

  const getViewport = useCallback((): Viewport => viewportRef.current, []);

  const subscribeViewport = useCallback((listener: (vp: Viewport) => void) => {
    viewportListeners.current.add(listener);
    return () => { viewportListeners.current.delete(listener); };
  }, []);

  /* applyCamera: camera ref → DOM, viewport 갱신 및 구독자 알림 */
  const applyCamera = useCallback(() => {
    const { x, y, scale } = camera.current;

    if (canvasLayerRef.current) {
      canvasLayerRef.current.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
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

    const centerX = Math.round((window.innerWidth  / 2 - x) / scale);
    const centerY = Math.round((window.innerHeight / 2 - y) / scale);
    setCanvasCoords({ x: centerX, y: centerY });

    // 뷰포트 계산 및 구독자 알림
    const vp: Viewport = {
      left:   -x / scale,
      top:    -y / scale,
      right:  -x / scale + window.innerWidth  / scale,
      bottom: -y / scale + window.innerHeight / scale,
    };
    viewportRef.current = vp;
    viewportListeners.current.forEach((fn) => fn(vp));
  }, []);

  /* flush: rAF-debounced wrapper */
  const flush = useCallback(() => {
    cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(applyCamera);
  }, [applyCamera]);

  /* panTo: 특정 캔버스 좌표로 부드럽게 이동 */
  const panTo = useCallback((canvasX: number, canvasY: number, durationMs = 900) => {
    const startX     = camera.current.x;
    const startY     = camera.current.y;
    const targetCamX = window.innerWidth  / 2 - canvasX * camera.current.scale;
    const targetCamY = window.innerHeight / 2 - canvasY * camera.current.scale;
    const startTime  = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (now: number) => {
      const t     = Math.min((now - startTime) / durationMs, 1);
      const eased = easeInOutCubic(t);
      camera.current.x = startX + (targetCamX - startX) * eased;
      camera.current.y = startY + (targetCamY - startY) * eased;
      applyCamera();
      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [applyCamera]);

  /* init */
  useEffect(() => {
    camera.current = {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
      scale: 1,
    };
    flush();
  }, [flush]);

  /* zoom */
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

  const resetView = useCallback(() => {
    camera.current = { x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 1 };
    flush();
  }, [flush]);

  /* wheel */
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

  /* keyboard */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !event.repeat) { event.preventDefault(); setIsSpaceDown(true); }
      if ((event.metaKey || event.ctrlKey) && event.key === "0") { event.preventDefault(); resetView(); }
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

  /* pointer drag */
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

  const contextValue = { panTo, getViewport, subscribeViewport };

  return (
    <CanvasContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="fixed inset-0 overflow-hidden bg-[#1e1e1e] select-none touch-none"
        style={{ cursor }}
      >
        <div ref={gridRef} className="absolute inset-0 pointer-events-none" />

        <div
          ref={canvasLayerRef}
          className="absolute top-0 left-0"
          style={{ transformOrigin: "0 0", willChange: "transform" }}
        >
          <svg
            width="0" height="0"
            className="absolute overflow-visible pointer-events-none"
            style={{ transform: "translate(-50%,-50%)" }}
          >
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#3f3f46" strokeWidth="1" />
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#3f3f46" strokeWidth="1" />
            <circle r="3" fill="#6366f1" />
          </svg>
          {children}
        </div>

        <ZoomControls
          scale={scale100}
          onZoomIn={() => zoomAt(
            window.innerWidth / 2, window.innerHeight / 2,
            clamp(camera.current.scale + 0.05, MIN_SCALE, MAX_SCALE) / camera.current.scale,
          )}
          onZoomOut={() => zoomAt(
            window.innerWidth / 2, window.innerHeight / 2,
            clamp(camera.current.scale - 0.05, MIN_SCALE, MAX_SCALE) / camera.current.scale,
          )}
          onReset={resetView}
        />

        <div className="fixed top-4 right-4 pointer-events-none">
          <span className="text-[11px] font-mono text-[#52525b]">
            {canvasCoords.x}, {canvasCoords.y}
          </span>
        </div>

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
    </CanvasContext.Provider>
  );
};
