"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";

const W = 1440;
const H = 680;
const MAX_PHASE = 3;

const ICON = 56;
const R    = ICON / 2;

const PLATFORM_ICONS = [
  "/icons/tiki_icon.png",
  "/icons/lazada_icon.png",
  "/icons/shopee_icon.png",
  "/icons/gomimall_icon.png",
];

const RECON_STEPS = [
  { step: "01", text: "Fetch latest order records from OMS",                      color: "#60A5FA" },
  { step: "02", text: "Fetch current inventory state from WMS",                   color: "#34D399" },
  { step: "03", text: "Pull order statuses from each Marketplace API",            color: "#FBBF24" },
  { step: "04", text: "3-way comparison  ·  OMS ↔ WMS ↔ Marketplace",            color: "#A78BFA" },
  { step: "05", text: "Detect discrepancies and apply corrections automatically", color: "#F87171" },
];

const OUTCOMES = [
  { icon: "✓", label: "All Match",          sub: "No action required",              color: "#34D399" },
  { icon: "↻", label: "OMS / WMS Mismatch", sub: "Re-sync from authoritative source", color: "#FBBF24" },
  { icon: "⚠", label: "Marketplace Gap",    sub: "Update status + trigger alert",   color: "#F87171" },
];

// Source node centers
const SRC_CX = 40 + 140; // 180
const SRC_NODES = [
  { icon: "/icons/client_icon.png", label: "OMS",         sub: "Order Mgmt",   cy: 220 },
  { icon: "/icons/truck.png",       label: "WMS",         sub: "Warehouse",    cy: 370 },
];

export const GomiConsistencySection = ({
  onAnimationComplete,
  skipAnimation = false,
}: {
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
}) => {
  const [phase, setPhase] = useState(skipAnimation ? MAX_PHASE : -1);

  useEffect(() => {
    if (skipAnimation) return;
    const t = [
      setTimeout(() => setPhase(0),  200),
      setTimeout(() => setPhase(1),  700),
      setTimeout(() => setPhase(2), 1300),
      setTimeout(() => setPhase(3), 1900),
    ];
    t.push(setTimeout(() => onAnimationComplete?.(), 2600));
    return () => t.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  const slideUp = (p: number, delay = 0): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  });

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff", borderRadius: 20 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 제목 */}
      <div style={{ position: "absolute", left: 40, top: 0, ...fade(0) }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          OMS / WMS Data Consistency
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>
          Order data flows across multiple marketplaces, OMS, and WMS — each maintaining its own state. <br />
          A nightly reconciliation job runs at 03:00 AM to detect and correct any discrepancies automatically.
        </p>
      </div>

      {/* ── Data Sources 박스 ── */}
      <div style={{
        position: "absolute", left: 40, top: 120, width: 280, height: 500,
        border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 14,
        pointerEvents: "none", ...fade(0),
      }}>
        <span style={{
          position: "absolute", top: -11, left: 10,
          background: "#0f1117", padding: "0 6px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)",
        }}>
          Data Sources
        </span>
      </div>

      {/* OMS / WMS 노드 */}
      {SRC_NODES.map((node) => (
        <div key={node.label} style={{
          position: "absolute",
          left: SRC_CX - R,
          top: node.cy - R,
          width: ICON,
          display: "flex", flexDirection: "column", alignItems: "center",
          ...fade(1),
        }}>
          <Image src={node.icon} width={ICON} height={ICON} alt={node.label} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)", marginTop: 5, whiteSpace: "nowrap" }}>{node.label}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2, whiteSpace: "nowrap" }}>{node.sub}</span>
        </div>
      ))}

      {/* Marketplace 플랫폼 아이콘들 */}
      <div style={{
        position: "absolute", left: 56, top: 478,
        width: 248,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        ...fade(1),
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          {PLATFORM_ICONS.map((icon, i) => (
            <Image key={i} src={icon} width={36} height={36} alt="Platform" style={{ objectFit: "contain" }} />
          ))}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>Marketplace</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>Tiki · Lazada · Shopee · GomiMall</span>
      </div>

      {/* ── SVG 화살표 ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}
        viewBox={`0 0 ${W} ${H}`}
      >
        <defs>
          <marker id="gcon-ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.28)" />
          </marker>
        </defs>

        {/* Sources → Reconciliation */}
        {[220, 370, 508].map((cy) => (
          <path
            key={cy}
            d={`M 320 ${cy} C 348 ${cy}, 352 370, 380 370`}
            stroke="rgba(255,255,255,0.15)" strokeWidth={1.5}
            fill="none" markerEnd="url(#gcon-ah)"
            style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}
          />
        ))}

        {/* Reconciliation → Outcomes */}
        {[230, 370, 510].map((cy) => (
          <path
            key={cy}
            d={`M 940 370 C 968 370, 972 ${cy}, 1000 ${cy}`}
            stroke="rgba(255,255,255,0.15)" strokeWidth={1.5}
            fill="none" markerEnd="url(#gcon-ah)"
            style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}
          />
        ))}
      </svg>

      {/* ── Reconciliation Engine 박스 ── */}
      <div style={{
        position: "absolute", left: 380, top: 120, width: 560, height: 500,
        border: "1.5px dashed rgba(167,139,250,0.35)", borderRadius: 14,
        pointerEvents: "none", ...fade(0),
      }}>
        <div style={{
          position: "absolute", top: -12, left: 14,
          background: "#0f1117", padding: "0 8px",
          fontSize: 11, fontWeight: 600, color: "rgba(167,139,250,0.75)",
        }}>
          Reconciliation Engine
        </div>
      </div>

      {/* Reconciliation 내용 */}
      <div style={{ position: "absolute", left: 408, top: 148, width: 504 }}>
        {/* 스케줄 뱃지 */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
          background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: 8, padding: "6px 14px",
          ...fade(2),
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#A78BFA" strokeWidth="1.8" />
            <path d="M12 7v5l3 3" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(167,139,250,0.9)", letterSpacing: "0.04em" }}>
            Daily · 03:00 AM
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)" }}>Scheduled Batch Job</span>
        </div>

        {/* 단계 목록 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {RECON_STEPS.map(({ step, text, color }, i) => (
            <div key={step} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
              transition: `opacity 0.4s ease ${i * 90}ms, transform 0.4s ease ${i * 90}ms`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color,
              }}>
                {step}
              </div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.68)", lineHeight: 1.5, paddingTop: 4 }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Resolution 박스 ── */}
      <div style={{
        position: "absolute", left: 1000, top: 120, width: 400, height: 500,
        border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 14,
        pointerEvents: "none", ...fade(0),
      }}>
        <span style={{
          position: "absolute", top: -11, left: 10,
          background: "#0f1117", padding: "0 6px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)",
        }}>
          Resolution
        </span>
      </div>

      {/* Outcome 항목들 */}
      {OUTCOMES.map(({ icon, label, sub, color }, i) => {
        const cy = [230, 370, 510][i];
        return (
          <div key={label} style={{
            position: "absolute",
            left: 1020, top: cy - 22,
            width: 360,
            display: "flex", alignItems: "center", gap: 14,
            ...slideUp(3, i * 100),
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11, flexShrink: 0,
              background: `${color}12`, border: `1px solid ${color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color,
            }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                {sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
