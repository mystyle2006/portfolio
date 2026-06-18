"use client";

import { useEffect, useState, CSSProperties } from "react";

const W = 1440;
const H = 680;
const MAX_PHASE = 2;

export const GomiDuplicateSection = ({
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
      setTimeout(() => setPhase(0), 200),
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 1300),
    ];
    t.push(setTimeout(() => onAnimationComplete?.(), 2000));
    return () => t.forEach(clearTimeout);
  }, [skipAnimation]);

  const fade = (p: number): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transition: "opacity 0.5s ease",
  });

  const slideUp = (p: number, delay = 0): CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0)" : "translateY(14px)",
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
          Duplicate Settlement Prevention
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>
          Repeated webhook events from Tiki, Lazada, Shopee, and GomiMall can trigger duplicate settlements. <br />
          Two complementary layers eliminate double-charging at both the application and database level.
        </p>
      </div>

      {/* ── Card 1: Idempotency Key ── */}
      <div style={{
        position: "absolute", left: 40, top: 120, width: 660, height: 500,
        border: "1px solid rgba(96,165,250,0.2)", borderRadius: 16,
        background: "rgba(96,165,250,0.03)",
        ...fade(0),
      }}>
        <div style={{
          position: "absolute", right: 20, top: 14,
          fontSize: 72, fontWeight: 900, lineHeight: 1,
          color: "rgba(96,165,250,0.07)", letterSpacing: "-0.04em",
          pointerEvents: "none",
        }}>01</div>

        <div style={{ padding: "28px 32px" }}>
          {/* 아이콘 + 제목 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "rgba(96,165,250,0.12)",
              border: "1px solid rgba(96,165,250,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                  stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#60A5FA" }}>Idempotency Key</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                Application-level duplicate detection
              </p>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.65, marginBottom: 20, ...slideUp(1) }}>
            Every incoming webhook event is assigned a unique idempotency key derived from the order ID,
            event type, and source platform. Before processing, the system checks whether the key has
            already been consumed — if so, the event is silently discarded.
          </p>

          {/* Key 포맷 */}
          <div style={{
            background: "rgba(0,0,0,0.28)", borderRadius: 10,
            border: "1px solid rgba(96,165,250,0.14)",
            padding: "14px 18px", marginBottom: 20,
            fontFamily: "ui-monospace, monospace",
            ...slideUp(1, 80),
          }}>
            <div style={{ fontSize: 10, color: "rgba(96,165,250,0.55)", marginBottom: 7, letterSpacing: "0.07em", fontFamily: "inherit" }}>
              KEY FORMAT
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
              key =&nbsp;
              <span style={{ color: "#60A5FA" }}>orderId</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}> + </span>
              <span style={{ color: "#34D399" }}>eventType</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}> + </span>
              <span style={{ color: "#FBBF24" }}>platform</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", marginTop: 5 }}>
              e.g.&nbsp;
              <span style={{ color: "rgba(255,255,255,0.48)" }}>"TK-9821-order.created-tiki"</span>
            </div>
          </div>

          {/* 플로우 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, ...slideUp(1, 160) }}>
            {[
              { text: "Event arrives via webhook",                icon: "→", color: "rgba(255,255,255,0.48)" },
              { text: "Check key in settlement_keys table",       icon: "→", color: "rgba(255,255,255,0.48)" },
              { text: "Key exists   →   skip (already settled)",  icon: "✗", color: "#F87171" },
              { text: "Key absent   →   process + persist key",   icon: "✓", color: "#34D399" },
            ].map(({ text, icon, color }) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 13, color, flexShrink: 0, width: 16, textAlign: "center", marginTop: 1 }}>{icon}</span>
                <span style={{ fontSize: 13, color, lineHeight: 1.45 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card 2: DB Unique Constraint ── */}
      <div style={{
        position: "absolute", left: 740, top: 120, width: 660, height: 500,
        border: "1px solid rgba(52,211,153,0.2)", borderRadius: 16,
        background: "rgba(52,211,153,0.03)",
        ...fade(0),
      }}>
        <div style={{
          position: "absolute", right: 20, top: 14,
          fontSize: 72, fontWeight: 900, lineHeight: 1,
          color: "rgba(52,211,153,0.07)", letterSpacing: "-0.04em",
          pointerEvents: "none",
        }}>02</div>

        <div style={{ padding: "28px 32px" }}>
          {/* 아이콘 + 제목 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "rgba(52,211,153,0.12)",
              border: "1px solid rgba(52,211,153,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#34D399" strokeWidth="1.8" />
                <path d="M3 5v6c0 1.657 4.029 3 9 3s9-1.343 9-3V5" stroke="#34D399" strokeWidth="1.8" />
                <path d="M3 11v6c0 1.657 4.029 3 9 3s9-1.343 9-3v-6" stroke="#34D399" strokeWidth="1.8" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#34D399" }}>DB Unique Constraint</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                Database-level enforcement
              </p>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.65, marginBottom: 20, ...slideUp(2) }}>
            A composite unique index on&nbsp;
            <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 6px", borderRadius: 4, fontSize: 13, color: "#FBBF24" }}>
              order_id, event_type, platform
            </code>
            &nbsp;acts as a last line of defense — enforcing uniqueness atomically at the storage layer,
            even if the idempotency check is bypassed under race conditions.
          </p>

          {/* SQL 블록 */}
          <div style={{
            background: "rgba(0,0,0,0.28)", borderRadius: 10,
            border: "1px solid rgba(52,211,153,0.14)",
            padding: "14px 18px", marginBottom: 20,
            fontFamily: "ui-monospace, monospace",
            ...slideUp(2, 80),
          }}>
            <div style={{ fontSize: 10, color: "rgba(52,211,153,0.55)", marginBottom: 7, letterSpacing: "0.07em" }}>SCHEMA</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.9, color: "rgba(255,255,255,0.62)" }}>
              <span style={{ color: "#60A5FA" }}>CREATE UNIQUE INDEX</span> ON settlements<br />
              &nbsp;&nbsp;(<span style={{ color: "#FBBF24" }}>order_id</span>, <span style={{ color: "#FBBF24" }}>event_type</span>, <span style={{ color: "#FBBF24" }}>platform</span>);<br />
              <br />
              <span style={{ color: "#60A5FA" }}>INSERT INTO</span> settlements (...)<br />
              &nbsp;&nbsp;<span style={{ color: "#60A5FA" }}>ON CONFLICT DO NOTHING</span>;
            </div>
          </div>

          {/* 장점 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, ...slideUp(2, 160) }}>
            {[
              "Atomic guarantee — no application-level locking",
              "Safe under concurrent webhook replays",
              "Works as a safety net even when idempotency key misses",
            ].map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 13, color: "#34D399", flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", lineHeight: 1.45 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
