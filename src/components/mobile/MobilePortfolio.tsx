"use client";

import { useState } from "react";
import Image from "next/image";
import { MobileCanvasProvider } from "./MobileCanvasProvider";

/* ── 디자인 토큰 ──────────────────────────────────────────────────────── */

const CARD = {
  bg: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderAccent: "1px solid rgba(255,255,255,0.12)",
} as const;

const YEAR_COLOR: Record<string, string> = {
  "2026": "#DBEAFE",
  "2025": "#FFE4E6",
  "2024": "#D1FAE5",
  "2023": "#EDE9FE",
};

const ACCENT: Record<string, string> = {
  "2026": "#60A5FA",
  "2025": "#F9A8D4",
  "2024": "#34D399",
  "2023": "#A78BFA",
};

/* ── 공통 컴포넌트 ────────────────────────────────────────────────────── */

const K = ({ children, color = "#93C5FD" }: { children: React.ReactNode; color?: string }) => (
  <span className="font-semibold" style={{ color }}>
    {children}
  </span>
);

const Chip = ({ label, accent }: { label: string; accent?: string }) => (
  <span
    className="text-[11px] font-mono px-2 py-0.5 rounded"
    style={{
      background: accent ? `${accent}18` : "rgba(255,255,255,0.06)",
      color: accent ?? "rgba(255,255,255,0.55)",
      border: `1px solid ${accent ? `${accent}30` : "rgba(255,255,255,0.1)"}`,
    }}
  >
    {label}
  </span>
);

const Arrow = ({ down }: { down?: boolean }) => (
  <span className="text-zinc-700 text-sm select-none">{down ? "↓" : "→"}</span>
);

const Dot = () => (
  <span className="mt-[7px] w-[3px] h-[3px] rounded-full bg-zinc-600 shrink-0 inline-block" />
);

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* 카드 래퍼 */
const Card = ({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) => (
  <div
    className={`rounded-2xl p-4 ${className}`}
    style={{
      background: CARD.bg,
      border: accent ? `1px solid ${accent}25` : CARD.border,
    }}
  >
    {children}
  </div>
);

/* 섹션 구분선 */
const SectionDivider = ({ year, title }: { year: string; title: string }) => (
  <div className="flex items-center gap-3 pt-10 pb-3 px-4">
    <span
      className="text-[11px] font-bold px-2.5 py-1 rounded-full text-zinc-900 shrink-0"
      style={{ background: YEAR_COLOR[year] }}
    >
      {year}
    </span>
    <span className="text-sm font-semibold text-zinc-400">{title}</span>
    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
  </div>
);

/* 서브섹션 헤더 */
const SubHeader = ({
  label,
  accent,
}: {
  label: string;
  accent?: string;
}) => (
  <div className="flex items-center gap-2 mb-3 px-4">
    <div
      className="w-1 h-4 rounded-full shrink-0"
      style={{ background: accent ?? "rgba(255,255,255,0.15)" }}
    />
    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
  </div>
);

/* 플로우 스텝 */
const FlowStep = ({
  num,
  title,
  body,
  accent = "#60A5FA",
}: {
  num: number;
  title: string;
  body: React.ReactNode;
  accent?: string;
}) => (
  <div className="flex gap-3">
    <div
      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-zinc-900 mt-0.5"
      style={{ background: accent }}
    >
      {num}
    </div>
    <div>
      <div className="text-sm font-semibold text-white mb-0.5">{title}</div>
      <div className="text-xs text-zinc-400 leading-relaxed">{body}</div>
    </div>
  </div>
);

/* 통계 행 */
const StatRow = ({
  stats,
}: {
  stats: Array<{ value: string; label: string; color?: string }>;
}) => (
  <div className="flex items-center gap-4 flex-wrap">
    {stats.map(({ value, label, color }, i) => (
      <div key={label} className="flex items-center gap-4">
        {i > 0 && <span className="text-white/10 text-xl">|</span>}
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-lg leading-none" style={{ color: color ?? "#60A5FA" }}>
            {value}
          </span>
          <span className="text-white text-[11px]">{label}</span>
        </div>
      </div>
    ))}
  </div>
);

/* 파이프라인 흐름 (가로 → 세로 자동) */
const Pipeline = ({
  steps,
  accent,
}: {
  steps: string[];
  accent?: string;
}) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {steps.map((s, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <Chip label={s} accent={accent} />
        {i < steps.length - 1 && <Arrow />}
      </div>
    ))}
  </div>
);

/* ── Sticky 헤더 ──────────────────────────────────────────────────────── */

const MobileHeader = () => {
  const YEARS = [
    { label: "2026", id: "jelpala" },
    { label: "2025", id: "lawform" },
    { label: "2024", id: "washswat" },
    { label: "2023", id: "gomi" },
  ];

  return (
    <header
      className="sticky top-0 z-50 px-4 pt-3 pb-2.5"
      style={{
        background: "rgba(9,9,11,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <button
        onClick={() => scrollTo("profile")}
        className="text-[10px] font-bold text-zinc-500 tracking-widest block mb-2"
      >
        INHO LEE
      </button>
      <div className="flex gap-2">
        {YEARS.map(({ label, id }) => (
          <button
            key={label}
            onClick={() => scrollTo(id)}
            className="flex-1 text-[11px] font-bold py-1 rounded-lg text-zinc-900"
            style={{ background: YEAR_COLOR[label] }}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};

/* ── Profile ──────────────────────────────────────────────────────────── */

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/inho-lee-6040ba3b3",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/mystyle2006",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "Blog",
    href: "https://blog-dun-xi.vercel.app/",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
];

const MobileProfileSection = () => (
  <section id="profile" className="px-4 pt-6 pb-4">
    <div className="flex items-center gap-3 mb-4">
      <Image
        src="/me.jpeg"
        alt="Inho Lee"
        width={64}
        height={64}
        className="rounded-full object-cover object-top shrink-0"
      />
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">INHO LEE</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Backend Engineer · Toronto, ON</p>
      </div>
    </div>

    <p className="text-sm text-zinc-400 leading-relaxed mb-4">
      Building scalable business systems across{" "}
      <K>web, mobile, backend, and cloud</K>.{" "}
      <K>7 years of experience</K> delivering{" "}
      <K>payment platforms</K>, <K>settlement automation</K>,{" "}
      <K>logistics services</K>, and{" "}
      <K>high-performance applications</K>—from architecture design to production deployment.
    </p>

    <div className="flex items-center gap-2.5">
      {SOCIAL_LINKS.map(({ label, href, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          {icon}
        </a>
      ))}
    </div>
  </section>
);

/* ── Jelpala 메인 ─────────────────────────────────────────────────────── */

const JELPALA_FEATURES = [
  { title: "Google Maps Integration", body: "Real-time route planning, truck stop search, distance & ETA." },
  { title: "Stripe Connect", body: "Secure payments and payouts." },
  { title: "Authentication & Roles", body: "Role-based access for customers, drivers, and admins." },
  { title: "Document Upload", body: "Driver license and required documents, secure storage on S3." },
  { title: "Matching System", body: "Redis GEO-based driver-shipment matching in real time." },
  { title: "Notification System", body: "Multi-channel: Push, Email, and SMS." },
  { title: "Point System", body: "Reward-based points for user engagement and driver incentives." },
];

const USER_IMAGES = [
  "/jelpala_preview/user/user_1.PNG",
  "/jelpala_preview/user/user_2.PNG",
  "/jelpala_preview/user/user_3.jpg",
  "/jelpala_preview/user/user_4.jpg",
  "/jelpala_preview/user/user_5.jpg",
  "/jelpala_preview/user/user_6.jpg",
  "/jelpala_preview/user/user_7.jpg",
  "/jelpala_preview/user/user_8.jpg",
  "/jelpala_preview/user/user_9.png",
  "/jelpala_preview/user/IMG_8637 (1).PNG",
];

const DRIVER_IMAGES = [
  "/jelpala_preview/driver/driver1.jpeg",
  "/jelpala_preview/driver/driver2.PNG",
  "/jelpala_preview/driver/driver3.PNG",
  "/jelpala_preview/driver/driver4.PNG",
  "/jelpala_preview/driver/driver5.PNG",
  "/jelpala_preview/driver/driver6.PNG",
  "/jelpala_preview/driver/driver7.jpeg",
];

const MobileJelpalaSection = () => {
  const [tab, setTab] = useState<"features" | "previews">("features");
  const [group, setGroup] = useState<"user" | "driver">("user");
  const [idx, setIdx] = useState(0);
  const acc = ACCENT["2026"];
  const images = group === "user" ? USER_IMAGES : DRIVER_IMAGES;
  const maxIdx = images.length - 2;

  return (
    <section id="jelpala" className="px-4 pb-4">
      <Card accent={acc}>
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Jelpala</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-3">Real-Time Freight Matching Platform</p>
        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
          North America&apos;s First Semi-Truck Sharing Platform.
        </p>

        <ul className="flex flex-col gap-2 mb-4">
          {[
            <>Designed and implemented customer, driver, and admin platforms for Web, iOS, and Android using <K>React Native Expo</K>.</>,
            <>Architected scalable cloud infrastructure on <K>AWS ECS</K>, <K>Redis</K>, <K>RDS</K>, <K>SQS</K>, <K>Lambda</K> and <K>S3</K>.</>,
            <>Built a <K>location-based matching system</K> using <K>Redis GEO</K> to connect drivers with nearby shipments in real time.</>,
            <>Designed and implemented <K>a Docker-based CI/CD pipeline</K> using <K>GitHub Actions</K>.</>,
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm">
              <Dot />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        <StatRow stats={[
          { value: "Redis GEO", label: "Based Matching", color: acc },
          { value: "Real-time", label: "Messaging",      color: acc },
          { value: "3,000+",   label: "Concurrent Users", color: acc },
        ]} />

        {/* 탭 */}
        <div className="flex mt-5 mb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {(["features", "previews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="pb-2.5 mr-5 text-xs"
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? "#fff" : "rgba(255,255,255,0.3)",
                borderBottom: tab === t ? `2px solid ${acc}` : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {t === "features" ? "Key Features" : "App Previews"}
            </button>
          ))}
        </div>

        {tab === "features" && (
          <div className="flex flex-col gap-3">
            {JELPALA_FEATURES.map(({ title, body }) => (
              <div key={title} className="flex items-start gap-2">
                <div
                  className="shrink-0 w-1.5 h-1.5 rounded-full mt-[6px]"
                  style={{ background: acc }}
                />
                <div>
                  <div className="text-sm font-semibold text-white/90">{title}</div>
                  <div className="text-xs text-zinc-500 leading-relaxed mt-0.5">{body}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "previews" && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {(["user", "driver"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => { setGroup(g); setIdx(0); }}
                  className="text-xs px-3 py-1 rounded-full transition-all"
                  style={{
                    background: group === g ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "1px solid",
                    borderColor: group === g ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                    color: group === g ? "#fff" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {g === "user" ? "User App" : "Driver App"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: idx === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M7.5 2L4 6l3.5 4" stroke={idx === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="flex-1 flex justify-center gap-2">
                {images.slice(idx, idx + 2).map((src, i) => (
                  <div
                    key={idx + i}
                    className="flex-1 rounded-xl overflow-hidden relative"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", aspectRatio: "9/19" }}
                  >
                    <Image src={src} alt={`preview-${idx + i}`} fill style={{ objectFit: "cover" }} sizes="160px" />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIdx((i) => Math.min(maxIdx, i + 1))}
                disabled={idx >= maxIdx}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: idx >= maxIdx ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 2L8 6l-3.5 4" stroke={idx >= maxIdx ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="flex justify-center gap-1.5">
              {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  style={{
                    width: i === idx ? 14 : 4, height: 4, borderRadius: 3,
                    background: i === idx ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)",
                    border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 서브섹션 링크 */}
      <div className="mt-3 flex flex-col gap-2">
        {[
          { id: "jelpala-sysdesign", label: "System Design" },
          { id: "jelpala-messaging", label: "Distributed Real-Time Messaging" },
          { id: "jelpala-matching",  label: "Matching Architecture" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors text-left"
            style={{ background: "rgba(255,255,255,0.02)", border: CARD.border }}
          >
            {label}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 ml-2">
              <path d="M6 2v8M2 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>
    </section>
  );
};

/* ── Jelpala System Design ────────────────────────────────────────────── */

const MobileJelpalaSystemDesign = () => {
  const acc = ACCENT["2026"];
  return (
    <section id="jelpala-sysdesign" className="px-4 pb-4">
      <SubHeader label="System Design" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">Jelpala System Architecture</h3>
        <p className="text-xs text-zinc-500 mb-4">Full AWS cloud infrastructure powering the service</p>

        <div className="flex flex-col gap-3">
          {[
            {
              label: "Client Layer",
              items: ["Mobile App", "Trucking Co.", "Admin"],
            },
            {
              label: "API Layer",
              items: ["ALB", "API Servers (Spring Boot)", "Batch Services"],
            },
            {
              label: "Data Layer",
              items: ["Amazon RDS", "ElastiCache (Redis)", "Amazon S3"],
            },
            {
              label: "Event Layer",
              items: ["AWS SQS", "AWS Lambda"],
            },
            {
              label: "External",
              items: ["FCM / APNs", "Mailgun", "Twilio", "Payment Gateway"],
            },
          ].map(({ label, items }, i, arr) => (
            <div key={label}>
              <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">{label}</div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <Chip key={item} label={item} accent={acc} />
                ))}
              </div>
              {i < arr.length - 1 && (
                <div className="flex justify-center mt-2">
                  <Arrow down />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

/* ── Jelpala Messaging ────────────────────────────────────────────────── */

const MobileJelpalaMessaging = () => {
  const acc = ACCENT["2026"];
  return (
    <section id="jelpala-messaging" className="px-4 pb-4">
      <SubHeader label="Distributed Real-Time Messaging" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">Per-Channel Pub/Sub Routing</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Each ECS instance subscribes only to its own clients' channels, delivering messages to the exact instance and eliminating unnecessary broadcasting.
        </p>

        <div className="flex flex-col gap-3 mb-4">
          <FlowStep num={1} accent={acc}
            title="Client Connects"
            body="The ECS instance subscribes to a dedicated Redis channel user:{id} for each connected client."
          />
          <FlowStep num={2} accent={acc}
            title="Message Sent"
            body="The sending ECS publishes a message to the recipient's Redis channel user:{id}."
          />
          <FlowStep num={3} accent={acc}
            title="Redis Routes"
            body="Redis delivers the message only to the instance subscribed to that channel."
          />
          <FlowStep num={4} accent={acc}
            title="Delivered"
            body="The target ECS delivers the message to the client in real time via Socket.IO."
          />
        </div>

        <div className="rounded-xl p-3" style={{ background: `${acc}0d`, border: `1px solid ${acc}20` }}>
          <div className="text-xs font-semibold text-zinc-300 mb-2">Why Per-Channel?</div>
          <div className="flex flex-col gap-1.5">
            {[
              ["Selective Subscription", "No cross-instance interference"],
              ["No Broadcast Overhead", "No irrelevant message processing"],
              ["Horizontal Scalability", "Add / remove instances without coordination"],
              ["Fault Isolation", "A failed instance affects only its own clients"],
            ].map(([key, val]) => (
              <div key={key} className="flex gap-2 text-xs">
                <span className="font-semibold shrink-0" style={{ color: acc }}>{key}</span>
                <span className="text-zinc-500">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

/* ── Jelpala Matching ─────────────────────────────────────────────────── */

const MobileJelpalaMatching = () => {
  const acc = ACCENT["2026"];
  return (
    <section id="jelpala-matching" className="px-4 pb-4">
      <SubHeader label="Matching Architecture" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">Redis GEO-Based Real-Time Matching</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">4-step flow from location update to match confirmation</p>

        <div className="flex flex-col gap-4">
          <FlowStep num={1} accent={acc}
            title="Driver Location Update"
            body={<>N drivers send location every <K color={acc}>300m</K> → SQS buffers write load → Lambda batch-processes via <K color={acc}>Redis GEOADD</K></>}
          />
          <FlowStep num={2} accent={acc}
            title="User Matching Request"
            body={<><K color={acc}>GEORADIUS</K> returns nearby drivers by proximity → Round 1: notify Top 5 → expand radius on no response → notify Top 20</>}
          />
          <FlowStep num={3} accent={acc}
            title="Notify Drivers"
            body={<>Online drivers → direct <K color={acc}>Socket.IO</K> push / Offline → fallback to <K color={acc}>FCM/APNs</K></>}
          />
          <FlowStep num={4} accent={acc}
            title="Matching Confirmation"
            body={<><K color={acc}>Redis SETNX</K> distributed lock grants ownership to the first responder → atomic commit via DB transaction</>}
          />
        </div>
      </Card>
    </section>
  );
};

/* ── Lawform 메인 ─────────────────────────────────────────────────────── */

const MobileLawformSection = () => {
  const acc = ACCENT["2025"];
  return (
    <section id="lawform" className="px-4 pb-4">
      <Card accent={acc}>
        <h2 className="text-xl font-extrabold leading-tight tracking-tight text-white mb-1">
          Building a Highly Available Notification System at Lawform
        </h2>
        <p className="text-xs text-zinc-500 mb-3">
          Event-driven architecture using AWS SQS and Lambda
        </p>

        <ul className="flex flex-col gap-2 mb-4">
          {[
            <>Built an <K color={acc}>event-driven</K> notification system using <K color={acc}>AWS SNS</K> and <K color={acc}>SQS</K> fan-out, decoupling business logic from notification delivery.</>,
            <>Implemented the <K color={acc}>Transactional Outbox</K> pattern to guarantee reliable event publishing and prevent notification loss.</>,
            <>Leveraged <K color={acc}>AWS Lambda</K> as SQS consumers to automatically scale based on traffic demand.</>,
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm">
              <Dot />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        <StatRow stats={[
          { value: "5,000+", label: "Daily Recipients",  color: acc },
          { value: "99.9%",  label: "High Availability", color: acc },
        ]} />

        {/* SNS Fan-out 시각화 */}
        <div className="mt-5 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: CARD.border }}>
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Notification Flow</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Chip label="Spring API" accent={acc} />
              <Arrow />
              <Chip label="DB Outbox" accent={acc} />
              <Arrow />
              <Chip label="SNS Topic" accent={acc} />
            </div>
            <div className="pl-4 flex flex-col gap-1.5">
              {[
                { ch: "Email", svc: "Mailgun" },
                { ch: "Push",  svc: "FCM / APNs" },
                { ch: "SMS",   svc: "Twilio" },
              ].map(({ ch, svc }) => (
                <div key={ch} className="flex items-center gap-1.5 text-xs">
                  <span className="text-zinc-700">└</span>
                  <Chip label="SQS" />
                  <Arrow />
                  <Chip label="Lambda" />
                  <Arrow />
                  <span className="text-zinc-400">{ch} <span className="text-zinc-600">({svc})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-3">
        <button
          onClick={() => scrollTo("lawform-ham")}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.02)", border: CARD.border }}
        >
          High-Availability Messaging Architecture
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
            <path d="M6 2v8M2 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  );
};

/* ── Lawform HAM ──────────────────────────────────────────────────────── */

const MobileLawformHAM = () => {
  const acc = ACCENT["2025"];
  return (
    <section id="lawform-ham" className="px-4 pb-4">
      <SubHeader label="High-Availability Messaging Architecture" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">Transactional Outbox Pattern</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Atomically binds DB transactions with message publishing to eliminate message loss at the source
        </p>

        {/* Outbox 상태 흐름 */}
        <div className="mb-4">
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">Outbox State</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: "PENDING",  color: "#FBBF24" },
              { label: "SENDING",  color: "#60A5FA" },
              { label: "SENT",     color: "#34D399" },
              { label: "FAIL",     color: "#F87171" },
            ].map(({ label, color }, i, arr) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ color, background: `${color}18` }}>{label}</span>
                {i < arr.length - 1 && i !== 2 && <Arrow />}
                {i === 2 && <span className="text-zinc-700 text-xs">/</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { title: "Zero Message Loss",      body: "Wraps business logic and message storage in a single DB transaction to prevent loss" },
            { title: "Automatic Retry",         body: "Re-polls FAIL state records for automatic retry" },
            { title: "Full Audit Trail",        body: "Full delivery status of every notification traceable in the DB" },
            { title: "Transactional Safety",    body: "Notifications are cancelled together when a transaction rolls back" },
          ].map(({ title, body }, i) => (
            <FlowStep key={title} num={i + 1} accent={acc} title={title} body={body} />
          ))}
        </div>
      </Card>
    </section>
  );
};

/* ── Washswat 메인 ────────────────────────────────────────────────────── */

const MobileWashswatSection = () => {
  const acc = ACCENT["2024"];
  return (
    <section id="washswat" className="px-4 pb-4">
      <Card accent={acc}>
        <h2 className="text-xl font-extrabold leading-tight tracking-tight text-white mb-1">
          Multi-Payment Gateway Integration at Washswat
        </h2>
        <p className="text-xs text-zinc-500 mb-3">
          Consolidating Multiple Payment Gateways into a Scalable Architecture
        </p>

        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
          The legacy payment system had separate business logic scattered across each provider,
          causing severe code duplication and skyrocketing maintenance costs.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Designed an IoC-based <K color={acc}>PaymentGateway interface</K> to make each provider
          implementation swappable via dependency injection, consolidating all business logic into a single location.
        </p>

        <StatRow stats={[
          { value: "35%", label: "Code Reduction",       color: acc },
          { value: "80%", label: "Faster PG Integration", color: "#60A5FA" },
        ]} />

        {/* Before / After */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
            <div className="text-[10px] font-bold text-red-400 mb-2 uppercase tracking-wider">Before</div>
            <div className="flex flex-col gap-1.5">
              {["KakaoPay Service", "TossPay Service", "NaverPay Service"].map((s) => (
                <div key={s} className="text-xs px-2 py-1 rounded" style={{ background: "rgba(248,113,113,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  {s}
                </div>
              ))}
              <div className="text-[10px] text-red-400/60 mt-1">Duplicated logic (pay / cancel / refund)</div>
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: `${acc}0a`, border: `1px solid ${acc}25` }}>
            <div className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: acc }}>After</div>
            <div className="flex flex-col gap-1.5">
              <div className="text-xs px-2 py-1 rounded text-center font-semibold" style={{ background: `${acc}15`, color: acc }}>
                Business Logic
              </div>
              <div className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>PaymentGateway</div>
              {["KakaoPay", "TossPay", "NaverPay"].map((s) => (
                <div key={s} className="text-xs px-2 py-1 rounded text-center" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-3">
        <button
          onClick={() => scrollTo("washswat-deploy")}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.02)", border: CARD.border }}
        >
          Safely Deploying a Unified Payment System
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
            <path d="M6 2v8M2 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  );
};

/* ── Washswat Deploy ──────────────────────────────────────────────────── */

const MobileWashswatDeploy = () => {
  const acc = ACCENT["2024"];
  return (
    <section id="washswat-deploy" className="px-4 pb-4">
      <SubHeader label="Safely Deploying a Unified Payment System" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">Risk-Based Progressive Rollout</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Deploy from lowest-traffic PG first — catch potential issues early with minimal blast radius
        </p>

        <div className="flex flex-col gap-3">
          {[
            { pg: "NaverPay",  usage: "15%", color: "#60A5FA" },
            { pg: "TossPay",   usage: "32%", color: "#34D399" },
            { pg: "KakaoPay",  usage: "53%", color: acc },
          ].map(({ pg, usage, color }, i) => (
            <div key={pg} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: CARD.border }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-zinc-900" style={{ background: color }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-white">{pg}</span>
                </div>
                <span className="text-xs font-bold" style={{ color }}>{usage}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["DEPLOYING", "MONITORING", "STABLE"].map((s, si) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{
                      background: si === 0 ? `${color}20` : si === 1 ? "rgba(251,191,36,0.15)" : "rgba(52,211,153,0.15)",
                      color: si === 0 ? color : si === 1 ? "#FBBF24" : "#34D399",
                    }}>{s}</span>
                    {si < 2 && <Arrow />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1 flex-1 text-xs text-zinc-600">
            <span>0%</span><Arrow /><span className="text-zinc-500">15%</span><Arrow /><span className="text-zinc-500">47%</span><Arrow /><span style={{ color: acc }} className="font-bold">100%</span>
          </div>
          <span className="text-[10px] text-zinc-600">Coverage</span>
        </div>
      </Card>
    </section>
  );
};

/* ── Gomi 메인 ────────────────────────────────────────────────────────── */

const GOMI_KEYWORDS = [
  { text: "Real-Time Multi-Channel Order Integration", color: "#60A5FA", id: "gomi-oms" },
  { text: "Order Processing Scalability",              color: "#34D399", id: "gomi-worker" },
  { text: "Duplicate Settlement Prevention",           color: "#FBBF24", id: "gomi-duplicate" },
  { text: "OMS / WMS Data Consistency",               color: "#A78BFA", id: "gomi-consistency" },
];

const MobileGomiSection = () => {
  const acc = ACCENT["2023"];
  return (
    <section id="gomi" className="px-4 pb-4">
      <Card accent={acc}>
        <h2 className="text-xl font-extrabold leading-tight tracking-tight text-white mb-1">
          Reducing Settlement Processing Time by Over 80%
        </h2>
        <p className="text-xs text-zinc-500 mb-3">
          Finance & operations teams collaboration
        </p>

        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Built in close collaboration with finance and operations teams to automate
          reconciliation and settlement workflows across multiple marketplaces.
        </p>

        <StatRow stats={[
          { value: "50,000+", label: "Monthly Orders Processed", color: acc },
        ]} />

        <div className="mt-5 flex flex-col gap-2">
          {GOMI_KEYWORDS.map(({ text, color, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="flex items-center gap-3 text-left w-full p-3 rounded-xl group"
              style={{ background: "rgba(255,255,255,0.02)", border: CARD.border }}
            >
              <div className="w-0.5 h-8 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-sm font-semibold text-white/80 flex-1 leading-snug">{text}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-zinc-700">
                <path d="M6 2v8M2 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </Card>
    </section>
  );
};

/* ── Gomi OMS ─────────────────────────────────────────────────────────── */

const MobileGomiOMS = () => {
  const acc = "#60A5FA";
  return (
    <section id="gomi-oms" className="px-4 pb-4">
      <SubHeader label="Real-Time Multi-Channel Order Integration" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">Multi-Platform Order Event Pipeline</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Kubernetes NestJS receives webhooks from 4 marketplaces → fan-out via AWS event pipeline
        </p>

        <div className="flex flex-col gap-2.5">
          <div>
            <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">Sources</div>
            <Pipeline steps={["Tiki", "Lazada", "Shopee", "GomiMall"]} accent={acc} />
          </div>
          <div className="flex justify-center"><Arrow down /></div>
          <div>
            <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">Processing</div>
            <Pipeline steps={["Kubernetes (NestJS)", "AWS SQS", "AWS Lambda", "AWS SNS"]} accent={acc} />
          </div>
          <div className="flex justify-center"><Arrow down /></div>
          <div>
            <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">Downstream</div>
            <div className="flex gap-1.5 flex-wrap">
              {["OMS (Order Mgmt)", "WMS (Warehouse)", "Notification (FCM)"].map((s) => (
                <Chip key={s} label={s} accent={acc} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl p-3" style={{ background: `${acc}0a`, border: `1px solid ${acc}20` }}>
          <div className="text-[10px] font-semibold text-zinc-500 mb-1.5">SQS Event Types</div>
          <div className="flex gap-1.5 flex-wrap">
            {["order.created", "order.cancelled", "order.updated"].map((e) => (
              <span key={e} className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: `${acc}15`, color: acc }}>{e}</span>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

/* ── Gomi Worker ──────────────────────────────────────────────────────── */

const MobileGomiWorker = () => {
  const acc = "#34D399";
  return (
    <section id="gomi-worker" className="px-4 pb-4">
      <SubHeader label="Order Processing Scalability" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">SQS-Driven Lambda Auto Scaling</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Monitors SQS queue depth during order surges and auto-scales Lambda from 2 to 16 instances
        </p>

        <div className="overflow-hidden rounded-xl" style={{ border: CARD.border }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                {["Queue", "Lambda", "Orders/min"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-zinc-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { q: "328",    l: "2",  o: "520",   ratio: 0.1 },
                { q: "1,842",  l: "4",  o: "2,100", ratio: 0.3 },
                { q: "8,400",  l: "8",  o: "8,900", ratio: 0.6 },
                { q: "47,000+",l: "16", o: "52,000+", ratio: 1.0 },
              ].map(({ q, l, o, ratio }, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td className="px-3 py-2 text-zinc-400">{q}</td>
                  <td className="px-3 py-2">
                    <span className="font-bold" style={{ color: acc }}>{l}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">{o}</span>
                      <div className="flex-1 h-1 rounded-full bg-zinc-800 max-w-[40px]">
                        <div className="h-1 rounded-full" style={{ width: `${ratio * 100}%`, background: acc }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
};

/* ── Gomi Duplicate ───────────────────────────────────────────────────── */

const MobileGomiDuplicate = () => {
  const acc = "#FBBF24";
  return (
    <section id="gomi-duplicate" className="px-4 pb-4">
      <SubHeader label="Duplicate Settlement Prevention" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">2-Layer Duplicate Prevention</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Prevents duplicate settlements caused by repeated marketplace webhooks at both the application and database level
        </p>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-3" style={{ background: `${acc}0a`, border: `1px solid ${acc}25` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-zinc-900" style={{ background: acc }}>01</span>
              <span className="text-sm font-semibold text-white">Idempotency Key</span>
              <span className="text-[10px] text-zinc-500">Application level</span>
            </div>
            <p className="text-xs text-zinc-400 mb-2 leading-relaxed">
              Unique key assigned to each webhook: <span className="font-mono" style={{ color: acc }}>orderId + eventType + platform</span>
            </p>
            <div className="rounded-lg p-2 text-[11px] font-mono text-zinc-500" style={{ background: "rgba(0,0,0,0.3)" }}>
              "TK-9821-order.created-tiki"
            </div>
            <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
              <div>Key exists → <span className="text-zinc-400">skip (already processed)</span></div>
              <div>Key absent → <span style={{ color: acc }}>process + store key</span></div>
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-zinc-900" style={{ background: "#A78BFA" }}>02</span>
              <span className="text-sm font-semibold text-white">DB Unique Constraint</span>
              <span className="text-[10px] text-zinc-500">Database level</span>
            </div>
            <div className="rounded-lg p-2 text-[11px] font-mono text-zinc-500 leading-relaxed" style={{ background: "rgba(0,0,0,0.3)" }}>
              <div className="text-purple-400">CREATE UNIQUE INDEX ON</div>
              <div className="pl-2">settlements</div>
              <div className="pl-2 text-zinc-600">(order_id, event_type, platform)</div>
            </div>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              Even under concurrent webhook retries, the DB acts as the final safeguard against duplicate inserts
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};

/* ── Gomi Consistency ─────────────────────────────────────────────────── */

const MobileGomiConsistency = () => {
  const acc = "#A78BFA";
  return (
    <section id="gomi-consistency" className="px-4 pb-4">
      <SubHeader label="OMS / WMS Data Consistency" accent={acc} />
      <Card>
        <h3 className="text-base font-bold text-white mb-1">Daily Data Reconciliation</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Every day at 03:00 AM — when OMS / WMS discrepancies are detected, marketplaces serve as the source of truth to reconcile both systems
        </p>

        <div className="flex flex-col gap-3 mb-4">
          <FlowStep num={1} accent={acc} title="OMS vs WMS Comparison" body="Validate order status consistency between the two internal systems" />
          <FlowStep num={2} accent={acc} title="Fetch Marketplace Source" body="Fetch source-of-truth order status from Tiki / Lazada / Shopee / GomiMall" />
          <FlowStep num={3} accent={acc} title="Reconcile & Notify" body="Correct the mismatched system status and send an internal alert" />
        </div>

        {/* 예시 데이터 */}
        <div className="rounded-xl overflow-hidden" style={{ border: CARD.border }}>
          <div className="px-3 py-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.03)" }}>
            Reconciliation Example
          </div>
          {[
            { id: "TK-28391", oms: "SHIPPED",   wms: "SHIPPED",   result: "✓", resultColor: "#34D399" },
            { id: "LA-90234", oms: "SHIPPED",   wms: "CANCELLED", result: "⚠ OMS fixed", resultColor: "#FBBF24" },
            { id: "SH-47821", oms: "DELIVERED", wms: "SHIPPED",   result: "⚠ WMS fixed", resultColor: "#FBBF24" },
            { id: "GM-12009", oms: "CANCELLED", wms: "CANCELLED", result: "✓", resultColor: "#34D399" },
          ].map(({ id, oms, wms, result, resultColor }) => (
            <div key={id} className="px-3 py-2.5 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-[11px] font-mono text-zinc-500 shrink-0 w-[72px]">{id}</span>
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <div className="text-[10px] text-zinc-600 truncate">OMS: <span className="text-zinc-400">{oms}</span></div>
                <div className="text-[10px] text-zinc-600 truncate">WMS: <span className="text-zinc-400">{wms}</span></div>
              </div>
              <span className="text-[10px] font-semibold shrink-0" style={{ color: resultColor }}>{result}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { v: "2",        l: "Discrepancies fixed" },
            { v: "1",        l: "Alerts sent" },
            { v: "03:02 AM", l: "Completed at" },
          ].map(({ v, l }) => (
            <div key={l} className="rounded-lg p-2" style={{ background: `${acc}0a`, border: `1px solid ${acc}20` }}>
              <div className="text-sm font-bold" style={{ color: acc }}>{v}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

/* ── MobilePortfolio (최상위) ─────────────────────────────────────────── */

export const MobilePortfolio = () => (
  <MobileCanvasProvider>
    <div className="min-h-screen text-white" style={{ background: "#09090b" }}>
      <MobileHeader />

      <MobileProfileSection />

      <SectionDivider year="2026" title="Jelpala" />
      <MobileJelpalaSection />
      <MobileJelpalaSystemDesign />
      <MobileJelpalaMessaging />
      <MobileJelpalaMatching />

      <SectionDivider year="2025" title="Lawform" />
      <MobileLawformSection />
      <MobileLawformHAM />

      <SectionDivider year="2024" title="Washswat" />
      <MobileWashswatSection />
      <MobileWashswatDeploy />

      <SectionDivider year="2023" title="Gomi" />
      <MobileGomiSection />
      <MobileGomiOMS />
      <MobileGomiWorker />
      <MobileGomiDuplicate />
      <MobileGomiConsistency />

      <div className="h-12" />
    </div>
  </MobileCanvasProvider>
);
