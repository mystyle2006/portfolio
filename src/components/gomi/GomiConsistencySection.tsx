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

const PLATFORM_ICONS = [
  "/icons/tiki_icon.png",
  "/icons/lazada_icon.png",
  "/icons/shopee_icon.png",
  "/icons/gomimall_icon.png",
];

// mkt = null → OMS/WMS match, no lookup needed
// omsWrong = true → OMS was out-of-sync, corrected to mkt value
// wmsWrong = true → WMS was out-of-sync, corrected to mkt value
const ROWS: {
  id: string;
  oms: string;
  wms: string;
  mkt: string | null;
  omsWrong: boolean;
  wmsWrong: boolean;
  alert: boolean;
}[] = [
  { id: "TK-28391", oms: "SHIPPED",   wms: "SHIPPED",   mkt: null,        omsWrong: false, wmsWrong: false, alert: false },
  { id: "LA-90234", oms: "SHIPPED",   wms: "CANCELLED", mkt: "CANCELLED", omsWrong: true,  wmsWrong: false, alert: true  },
  { id: "SH-47821", oms: "DELIVERED", wms: "SHIPPED",   mkt: "DELIVERED", omsWrong: false, wmsWrong: true,  alert: false },
  { id: "GM-12009", oms: "CANCELLED", wms: "CANCELLED", mkt: null,        omsWrong: false, wmsWrong: false, alert: false },
];

const Chip = ({
  status,
  dim = false,
}: {
  status: string;
  dim?: boolean;
}) => (
  <span style={{
    display: "inline-block",
    padding: "3px 9px", borderRadius: 6,
    background: `${STATUS_COLOR[status]}${dim ? "0A" : "18"}`,
    border: `1px solid ${STATUS_COLOR[status]}${dim ? "28" : "40"}`,
    color: STATUS_COLOR[status],
    fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
    opacity: dim ? 0.45 : 1,
    textDecoration: dim ? "line-through" : "none",
  }}>
    {status}
  </span>
);

const CorrectedCell = ({
  current,
  corrected,
  wrong,
  label,
}: {
  current: string;
  corrected: string | null;
  wrong: boolean;
  label?: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
    {wrong && corrected ? (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Chip status={current} dim />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>→</span>
        <Chip status={corrected} />
      </div>
    ) : (
      <Chip status={current} />
    )}
    {wrong && (
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
        {label ?? "corrected from Marketplace"}
      </span>
    )}
  </div>
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
      setTimeout(() => setPhase(3), 1800),
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
    transform: phase >= p ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
  });

  const mismatchCount = ROWS.filter((r) => r.mkt !== null).length;
  const alertCount    = ROWS.filter((r) => r.alert).length;

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
          When a mismatch is detected between OMS and WMS order states, the Marketplace is used as the source of truth to reconcile both systems — and an internal alert is triggered when needed.
        </p>
      </div>

      {/* ─ 프로세스 플로우 (3단계) ─ */}
      <div style={{
        position: "absolute", left: 40, top: 100, right: 40,
        display: "flex", alignItems: "stretch", gap: 0,
        ...fade(0),
      }}>
        {/* Step 1 */}
        <div style={{
          flex: 1, padding: "14px 18px",
          background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.18)",
          borderRadius: "10px 0 0 10px",
          ...slideUp(0),
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(96,165,250,0.6)", letterSpacing: "0.08em", marginBottom: 5 }}>
            STEP 1
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 3 }}>
            OMS vs WMS Comparison
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            Verify that both internal systems have consistent order states
          </div>
        </div>

        {/* Arrow 1 */}
        <div style={{
          width: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.12)" }} />
          <svg style={{ position: "absolute" }} width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M1 8h14M15 8l-5-4M15 8l-5 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{
            position: "absolute", top: -16,
            fontSize: 9, fontWeight: 600, color: "rgba(248,113,113,0.7)", whiteSpace: "nowrap", letterSpacing: "0.04em",
          }}>
            if mismatch
          </span>
        </div>

        {/* Step 2 */}
        <div style={{
          flex: 1, padding: "14px 18px",
          background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)",
          borderTop: "1px solid rgba(251,191,36,0.18)",
          ...slideUp(0, 80),
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(251,191,36,0.6)", letterSpacing: "0.08em", marginBottom: 5 }}>
            STEP 2
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {PLATFORM_ICONS.map((src, i) => (
                <Image key={i} src={src} width={14} height={14} alt="" style={{ objectFit: "contain" }} />
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Fetch Marketplace Source</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            Pull the original order state from each platform as the source of truth
          </div>
        </div>

        {/* Arrow 2 */}
        <div style={{ width: 60, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.12)" }} />
          <svg style={{ position: "absolute" }} width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M1 8h14M15 8l-5-4M15 8l-5 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Step 3 */}
        <div style={{
          flex: 1, padding: "14px 18px",
          background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)",
          borderRadius: "0 10px 10px 0",
          ...slideUp(0, 160),
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(52,211,153,0.6)", letterSpacing: "0.08em", marginBottom: 5 }}>
            STEP 3
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 3 }}>
            Reconcile &amp; Notify
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            Correct the out-of-sync system · send an internal alert if needed
          </div>
        </div>
      </div>

      {/* ─ 비교 테이블 ─ */}
      <div style={{
        position: "absolute", left: 40, top: 210, width: W - 80,
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
        overflow: "hidden",
        ...fade(1),
      }}>

        {/* 헤더 */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.025)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ flex: "0 0 160px", padding: "12px 20px 12px 22px", display: "flex", alignItems: "flex-end" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}>ORDER ID</span>
          </div>

          <div style={{
            flex: "1 1 0", padding: "10px 18px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            borderTop: "2px solid rgba(96,165,250,0.65)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
              <Image src="/icons/client_icon.png" width={18} height={18} alt="OMS" style={{ objectFit: "contain" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#60A5FA" }}>OMS</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.26)" }}>Order Mgmt System</span>
          </div>

          <div style={{
            flex: "1 1 0", padding: "10px 18px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            borderTop: "2px solid rgba(52,211,153,0.65)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
              <Image src="/icons/truck.png" width={18} height={18} alt="WMS" style={{ objectFit: "contain" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#34D399" }}>WMS</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.26)" }}>Warehouse Mgmt System</span>
          </div>

          {/* Marketplace 헤더 (Source of Truth) */}
          <div style={{
            flex: "0 0 220px", padding: "10px 18px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            borderTop: "2px solid rgba(251,191,36,0.65)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
              {PLATFORM_ICONS.map((src, i) => (
                <Image key={i} src={src} width={14} height={14} alt="" style={{ objectFit: "contain" }} />
              ))}
              <span style={{ fontSize: 12, fontWeight: 700, color: "#FBBF24", marginLeft: 3 }}>Marketplace</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(251,191,36,0.5)", fontWeight: 600 }}>Source of Truth</span>
          </div>

          <div style={{
            flex: "1 1 0", padding: "12px 18px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "flex-end",
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}>ACTION</span>
          </div>
        </div>

        {/* 데이터 행 */}
        {ROWS.map(({ id, oms, wms, mkt, omsWrong, wmsWrong, alert }, i) => {
          const hasMismatch = omsWrong || wmsWrong;
          return (
            <div key={id} style={{
              display: "flex", alignItems: "stretch",
              borderBottom: i < ROWS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              background: hasMismatch ? "rgba(248,113,113,0.04)" : "transparent",
              borderLeft: hasMismatch ? "3px solid rgba(248,113,113,0.45)" : "3px solid transparent",
              ...slideUp(2, i * 60),
            }}>
              {/* Order ID */}
              <div style={{ flex: "0 0 157px", padding: "16px 20px 16px 19px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{
                  fontSize: 12, fontFamily: "ui-monospace, monospace",
                  color: hasMismatch ? "#F87171" : "rgba(255,255,255,0.45)",
                  fontWeight: hasMismatch ? 600 : 400,
                }}>
                  {id}
                </span>
                {hasMismatch && (
                  <span style={{ fontSize: 10, color: "rgba(248,113,113,0.6)", marginTop: 3 }}>⚠ mismatch</span>
                )}
              </div>

              {/* OMS */}
              <div style={{ flex: "1 1 0", padding: "16px 18px", borderLeft: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center" }}>
                <CorrectedCell current={oms} corrected={mkt} wrong={omsWrong} />
              </div>

              {/* WMS */}
              <div style={{ flex: "1 1 0", padding: "16px 18px", borderLeft: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center" }}>
                <CorrectedCell current={wms} corrected={mkt} wrong={wmsWrong} />
              </div>

              {/* Marketplace Source */}
              <div style={{ flex: "0 0 220px", padding: "16px 18px", borderLeft: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center" }}>
                {mkt ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Chip status={mkt} />
                    <span style={{ fontSize: 10, color: "rgba(251,191,36,0.55)", fontWeight: 500 }}>
                      used as correction reference
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>—</span>
                )}
              </div>

              {/* Action */}
              <div style={{ flex: "1 1 0", padding: "16px 18px", borderLeft: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8 }}>
                {hasMismatch ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#34D399", fontWeight: 600 }}>✓ synced</span>
                      {alert && (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                          borderRadius: 5, padding: "2px 7px",
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#FBBF24" }}>alert sent</span>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                      {omsWrong ? `OMS ${oms} → ${mkt}` : `WMS ${wms} → ${mkt}`}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>✓ in sync</span>
                )}
              </div>
            </div>
          );
        })}

        {/* 요약 바 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "13px 22px",
          background: "rgba(167,139,250,0.05)",
          borderTop: "1px solid rgba(167,139,250,0.1)",
          ...slideUp(3),
        }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {ROWS.length} orders compared
          </span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ fontSize: 12, color: "#F87171", fontWeight: 600 }}>
            {mismatchCount} mismatches resolved
          </span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ fontSize: 12, color: "#FBBF24", fontWeight: 600 }}>
            {alertCount} internal alert{alertCount !== 1 ? "s" : ""} sent
          </span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            completed 03:02 AM · 0 errors
          </span>
        </div>
      </div>
    </div>
  );
};
