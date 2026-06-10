import Image from "next/image";

const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const SKILLS = [
  "TypeScript", "Node.js", "NestJS", "Spring Boot",
  "React.js", "Next.js", "AWS", "Docker", "Redis", "MySQL",
];

const Keyword = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white">{children}</span>
);

export const ProfileSection = () => (
  <div className="w-[520px] space-y-8">

    {/* ── Photo + Name ── */}
    <div className="flex items-end gap-6">
      <Image
        src="/me.jpeg"
        alt="Inho Lee"
        width={100}
        height={100}
        className="rounded-2xl object-cover object-top shrink-0"
      />
      <div className="pb-1">
        <h1 className="text-[38px] font-bold tracking-tight leading-none text-white">
          Inho Lee
        </h1>
        <p className="text-[16px] text-zinc-400 mt-2">
          Full-Stack Engineer &nbsp;·&nbsp; Toronto, ON
        </p>
      </div>
    </div>

    {/* ── Bio ── */}
    <p className="text-[15px] text-zinc-300 leading-[1.8]">
      <Keyword>Full-stack engineer</Keyword> with <Keyword>7 years of experience</Keyword>{" "}
      building scalable services across e-commerce, SaaS, and consumer platforms.
      Focused on <Keyword>system performance</Keyword>,{" "}
      <Keyword>cloud-native AWS</Keyword> architectures, and{" "}
      <Keyword>CI/CD</Keyword>-driven delivery.
    </p>

    {/* ── Skills ── */}
    <div className="flex flex-wrap gap-2">
      {SKILLS.map((skill) => (
        <span
          key={skill}
          className="text-[13px] text-zinc-300 border border-white/[0.12] rounded-lg px-3 py-1 hover:text-white hover:border-white/30 transition-colors"
        >
          {skill}
        </span>
      ))}
    </div>

    {/* ── Contact ── */}
    <div className="flex items-center gap-6">
      <a
        href="mailto:sayyou0918@gmail.com"
        className="text-[13px] text-zinc-400 hover:text-white transition-colors"
      >
        sayyou0918@gmail.com
      </a>
      <a
        href="https://linkedin.com/in/inho-lee"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-white transition-colors"
      >
        <LinkedinIcon />
        LinkedIn
      </a>
    </div>

  </div>
);
