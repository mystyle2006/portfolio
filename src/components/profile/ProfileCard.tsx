import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LinkedinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const SKILLS = [
  "TypeScript", "Node.js", "NestJS", "Spring Boot",
  "React.js", "Next.js", "AWS", "Docker", "Redis", "MySQL",
];

const Keyword = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white font-medium">{children}</span>
);

export const ProfileCard = () => (
  <Card className="w-[340px] bg-[#141414] border-white/[0.07] text-white rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
    <div className="p-6 space-y-5">

      {/* ── Identity ── */}
      <div className="flex items-center gap-4">
        <Image
          src="/me.jpeg"
          alt="Inho Lee"
          width={64}
          height={64}
          className="rounded-full object-cover object-top shrink-0"
        />
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold tracking-tight leading-snug">
            Inho Lee
          </h2>
          <p className="text-[13px] text-zinc-400 mt-0.5">Backend Engineer</p>
          <p className="text-[11px] text-zinc-600 mt-1">
            Toronto, ON · 7 yrs exp
          </p>
        </div>
      </div>

      {/* ── Bio ── */}
      <p className="text-[13px] text-zinc-500 leading-[1.7]">
        <Keyword>Backend engineer</Keyword> with <Keyword>7 years</Keyword> building
        scalable services across e-commerce, SaaS, and consumer apps.
        Focused on <Keyword>system performance</Keyword>,{" "}
        <Keyword>cloud-native AWS</Keyword> architectures, and{" "}
        <Keyword>CI/CD</Keyword> delivery.
      </p>

      {/* ── Skills ── */}
      <div className="flex flex-wrap gap-1.5">
        {SKILLS.map((skill) => (
          <Badge
            key={skill}
            className="text-[11px] font-normal bg-white/[0.05] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] transition-colors px-2.5 py-0.5 rounded-lg"
          >
            {skill}
          </Badge>
        ))}
      </div>

      {/* ── Contact ── */}
      <div className="flex items-center gap-4 pt-1">
        <a
          href="mailto:sayyou0918@gmail.com"
          className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <MailIcon />
          sayyou0918@gmail.com
        </a>
        <a
          href="https://linkedin.com/in/inho-lee"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <LinkedinIcon />
          LinkedIn
        </a>
      </div>

    </div>
  </Card>
);
