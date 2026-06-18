"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { useCanvas } from "../InfiniteCanvas";

const W = 1440;
const H = 680;
const MAX_PHASE = 2;

const POD_SIZE = 88;
const POD_ICON = 64;
const POD_GAP  = 28;

// K8s 박스: 제목 영역 아래 거의 전체를 차지
const K8S = { left: 40, top: 120, width: 1360, height: 500 };

const GRID_W    = 4 * POD_SIZE + 3 * POD_GAP; // 436
const GRID_H    = 3 * POD_SIZE + 2 * POD_GAP; // 320
const GRID_LEFT = K8S.left + (K8S.width  - GRID_W) / 2; // 502
const GRID_TOP  = K8S.top  + (K8S.height - GRID_H) / 2; // 210

// 4×3 = 12 pods, 마지막 행(i≥8) = scaling out
const PODS = Array.from({ length: 12 }, (_, i) => ({
  cx:      GRID_LEFT + (i % 4) * (POD_SIZE + POD_GAP) + POD_SIZE / 2,
  cy:      GRID_TOP  + Math.floor(i / 4) * (POD_SIZE + POD_GAP) + POD_SIZE / 2,
  scaling: i >= 8,
}));

export const GomiWorkerSection = ({
  onAnimationComplete,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
}) => {
  const { panTo } = useCanvas();
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);

  useEffect(() => {
    if (skipAnimation) return;
    const t: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase(0), 200),
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 1300),
    ];
    t.push(setTimeout(() => onAnimationComplete?.(), 2000));
    return () => t.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity:    phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff", borderRadius: 20 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 0, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Horizontal Scale-Out
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>
          When order volume surges, Kubernetes HPA detects rising queue depth and provisions additional <br />
          webhook worker pods automatically — no manual intervention required.
        </p>
      </div>

      {/* K8s Cluster 박스 */}
      <div style={{
        position: "absolute",
        left: K8S.left, top: K8S.top, width: K8S.width, height: K8S.height,
        border: "1.5px dashed rgba(50,108,229,0.4)", borderRadius: 14,
        pointerEvents: "none",
        ...fade(0),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 14,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(50,108,229,0.8)",
        }}>
          Kubernetes Cluster
        </div>

        {/* HPA 뱃지 */}
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(50,108,229,0.08)", border: "1px solid rgba(50,108,229,0.3)",
          borderRadius: 8, padding: "5px 14px", whiteSpace: "nowrap",
          opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(50,108,229,0.9)", letterSpacing: "0.08em" }}>HPA</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>min 2  →  max 12 replicas</span>
        </div>
      </div>

      {/* "⚡ Order Surge" 트리거 뱃지 */}
      <div style={{
        position: "absolute",
        left: K8S.left + 20, top: K8S.top + 20,
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)",
        borderRadius: 8, padding: "4px 12px",
        ...fade(1),
      }}>
        <span style={{ fontSize: 12 }}>⚡</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(251,191,36,0.85)" }}>Order Surge Detected</span>
      </div>

      {/* "↑ scaling out" 레이블 (row 3 우측) */}
      <div style={{
        position: "absolute",
        left: GRID_LEFT + GRID_W + 20,
        top:  GRID_TOP + 2 * (POD_SIZE + POD_GAP) + POD_SIZE / 2 - 10,
        fontSize: 11, fontWeight: 600,
        color: "rgba(50,108,229,0.7)",
        letterSpacing: "0.04em",
        ...fade(2),
      }}>
        ↑ scaling out
      </div>

      {/* Pod 그리드 */}
      {PODS.map((pod, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: pod.cx - POD_SIZE / 2,
            top:  pod.cy - POD_SIZE / 2,
            width:  POD_SIZE,
            height: POD_SIZE,
            borderRadius: "50%",
            background: pod.scaling
              ? "rgba(50,108,229,0.06)"
              : "rgba(224,35,78,0.1)",
            border: pod.scaling
              ? "1.5px dashed rgba(50,108,229,0.5)"
              : "1.5px solid rgba(224,35,78,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: phase >= (pod.scaling ? 2 : 1)
              ? (pod.scaling ? 0.65 : 1)
              : 0,
            transition: `opacity 0.45s ease ${(pod.scaling ? (i - 8) : i) * 60}ms`,
          }}
        >
          <Image
            src="/icons/nest_icon.png"
            width={POD_ICON} height={POD_ICON}
            alt="Worker Pod"
            style={{ objectFit: "contain" }}
          />
        </div>
      ))}

      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => panTo(3348, -87)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          width: 44, height: 44, borderRadius: "50%",
          background: "#ffffff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 3L3 13M3 13H9M3 13V7" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
