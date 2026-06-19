"use client";

import { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";

const W = 1440;
const H = 680;
const MAX_PHASE = 3;

const STATUS_COLOR: Record<string, string> = {
  SHIPPED:   "#34D399",
  DELIVERED: "#60A5FA",
  CANCELLED: "#9CA3AF",
  PENDING:   "#FBBF24",
};

const ROWS = [
  { id: "TK-28391", oms: "SHIPPED",   mkt: "SHIPPED",   wms: "SHIPPED",   ok: true  },
  { id: "LA-90234", oms: "CANCELLED", mkt: "CANCELLED", wms: "CANCELLED", ok: true  },
  { id: "SH-47821", oms: "SHIPPED",   mkt: "PENDING",   wms: "SHIPPED",   ok: false },
  { id: "GM-12009", oms: "DELIVERED", mkt: "DELIVERED", wms: "DELIVERED", ok: true  },
];

const PLATFORM_ICONS = [
  "/icons/tiki_icon.png",
  "/icons/lazada_icon.png",
  "/icons/shopee_icon.png",
  "/icons/gomimall_icon.png",
];

const StatusChip = ({ status, highlight = false }: { status: string; highlight?: boolean }) => (
  <span style={{
    display: "inline-block",
    padding: "4px 10px", borderRadius: 6,
    background: `${STATUS_COLOR[status]}${highlight ? "28" : "18"}`,
    border: `1px solid ${STATUS_COLOR[status]}${highlight ? "70" : "40"}`,
    color: STATUS_COLOR[status],
    fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
    boxShadow: highlight ? `0 0 10px ${STATUS_COLOR[status]}30` : "none",
  }}>
    {status}
  </span>
);

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
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 1900),
    ];
    t.push(setTimeout(() => onAnimationComplete?.(), 2700));
    return () => t.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  const slideUp = (p: number, delay = 0): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
  });

  return (
    <div
      style={{ width: W, height: H, position: "relative", color: "#fff", borderRadius: 20 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ─ 제목 ─ */}
      <div style={{ position: "absolute", left: 40, top: 0, right: 40, ...fade(0) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            OMS / WMS Data Consistency
          </h2>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
            background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: 8, padding: "5px 12px",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#A78BFA" strokeWidth="1.8" />
              <path d="M12 7v5l3 3" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(167,139,250,0.9)", letterSpacing: "0.05em" }}>
              Daily · 03:00 AM
            </span>
          </div>
        </div>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", marginTop: 7, lineHeight: 1.6 }}>
          Each marketplace, OMS, and WMS maintains its own order state. A nightly Reconciliation job
          performs a 3-way comparison to detect and auto-correct any discrepancies.
        </p>
      </div>

      {/* ─ 비교 테이블 ─ */}
      <div style={{
        position: "absolute", left: 40, top: 120, width: W - 80,
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14,
        overflow: "hidden",
        ...fade(0),
      }}>

        {/* 시스템 헤더 */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.025)",
          ...fade(1),
        }}>
          {/* Order ID 컬럼 */}
          <div style={{ flex: "0 0 170px", padding: "16px 20px 16px 24px", display: "flex", alignItems: "flex-end" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}>
              ORDER ID
            </span>
          </div>

          {/* OMS 컬럼 헤더 */}
          <div style={{
            flex: "1 1 0", padding: "14px 20px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            borderTop: "2px solid rgba(96,165,250,0.7)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <Image src="/icons/client_icon.png" width={22} height={22} alt="OMS" style={{ objectFit: "contain" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#60A5FA" }}>OMS</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Order Management System</span>
          </div>

          {/* Marketplace 컬럼 헤더 */}
          <div style={{
            flex: "1 1 0", padding: "14px 20px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            borderTop: "2px solid rgba(251,191,36,0.7)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              {PLATFORM_ICONS.map((src, i) => (
                <Image key={i} src={src} width={18} height={18} alt="Platform" style={{ objectFit: "contain" }} />
              ))}
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FBBF24", marginLeft: 4 }}>Marketplace</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Tiki · Lazada · Shopee · GomiMall</span>
          </div>

          {/* WMS 컬럼 헤더 */}
          <div style={{
            flex: "1 1 0", padding: "14px 20px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            borderTop: "2px solid rgba(52,211,153,0.7)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <Image src="/icons/truck.png" width={22} height={22} alt="WMS" style={{ objectFit: "contain" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#34D399" }}>WMS</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Warehouse Management System</span>
          </div>

          {/* Match 컬럼 헤더 */}
          <div style={{
            flex: "0 0 120px", padding: "16px 20px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "flex-end",
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}>
              MATCH
            </span>
          </div>
        </div>

        {/* 데이터 행 */}
        {ROWS.map(({ id, oms, mkt, wms, ok }, i) => (
          <div key={id} style={{
            display: "flex", alignItems: "stretch",
            borderBottom: i < ROWS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            background: !ok ? "rgba(248,113,113,0.05)" : "transparent",
            borderLeft: !ok ? "3px solid rgba(248,113,113,0.5)" : "3px solid transparent",
            ...slideUp(2, i * 70),
          }}>
            {/* Order ID */}
            <div style={{ flex: "0 0 167px", padding: "20px 20px 20px 21px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{
                fontSize: 12, fontFamily: "ui-monospace, monospace",
                color: !ok ? "#F87171" : "rgba(255,255,255,0.48)",
                fontWeight: !ok ? 600 : 400,
              }}>
                {id}
              </span>
              {!ok && (
                <span style={{ fontSize: 10, color: "rgba(248,113,113,0.65)", marginTop: 4 }}>
                  ⚠ discrepancy
                </span>
              )}
            </div>

            {/* OMS */}
            <div style={{
              flex: "1 1 0", padding: "20px",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center",
            }}>
              <StatusChip status={oms} />
            </div>

            {/* Marketplace */}
            <div style={{
              flex: "1 1 0", padding: "20px",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <StatusChip status={mkt} highlight={!ok} />
              {!ok && (
                <span style={{ fontSize: 10, color: "#FBBF24", marginTop: 6, fontWeight: 500 }}>
                  ← differs from OMS &amp; WMS
                </span>
              )}
            </div>

            {/* WMS */}
            <div style={{
              flex: "1 1 0", padding: "20px",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center",
            }}>
              <StatusChip status={wms} />
            </div>

            {/* Match */}
            <div style={{
              flex: "0 0 120px", padding: "20px",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center",
            }}>
              {ok
                ? <span style={{ fontSize: 16, color: "#34D399" }}>✓</span>
                : <span style={{ fontSize: 12, fontWeight: 700, color: "#F87171" }}>✗</span>
              }
            </div>
          </div>
        ))}

        {/* 결과 / 수정 바 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "15px 24px",
          background: "rgba(167,139,250,0.05)",
          borderTop: "1px solid rgba(167,139,250,0.12)",
          ...slideUp(3),
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
            background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.28)",
            borderRadius: 7, padding: "4px 10px",
          }}>
            <span style={{ fontSize: 11, color: "#F87171", fontWeight: 700 }}>1 discrepancy detected</span>
          </div>

          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>SH-47821</span>
            {" "}Marketplace status auto-synced:{" "}
            <span style={{ color: "#FBBF24", fontWeight: 600 }}>PENDING</span>
            {" → "}
            <span style={{ color: "#34D399", fontWeight: 600 }}>SHIPPED</span>
          </span>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: 7, padding: "4px 10px",
            }}>
              <span style={{ fontSize: 11, color: "#34D399", fontWeight: 600 }}>✓ sync complete</span>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>03:02 AM · 0 errors</span>
          </div>
        </div>
      </div>
    </div>
  );
};
