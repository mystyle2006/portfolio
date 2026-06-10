import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, GraduationCap } from "lucide-react";

const LinkedinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const SKILLS: Record<string, string[]> = {
  Backend:  ["Node.js", "NestJS", "Spring Boot", "TypeScript", "Prisma"],
  Frontend: ["React.js", "Next.js", "React Query", "Tailwind CSS"],
  Infra:    ["AWS", "Docker", "MySQL", "Redis", "MongoDB"],
  DevOps:   ["CI/CD", "Jest", "Puppeteer"],
};

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="text-indigo-400 font-semibold">{children}</span>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-2.5">
    {children}
  </p>
);

const Divider = () => <div className="h-px bg-white/[0.06]" />;

export const ProfileCard = () => (
  <Card className="w-[360px] bg-[#1c1c1e] border-white/[0.08] text-white shadow-[0_24px_64px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden">

    {/* ── Header: photo + name ── */}
    <div className="flex items-center gap-4 px-6 pt-6 pb-5">
      <div className="relative shrink-0">
        <Image
          src="/me.jpeg"
          alt="Inho Lee"
          width={72}
          height={72}
          className="rounded-full object-cover object-top ring-2 ring-indigo-500/30"
        />
        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#1c1c1e]" />
      </div>
      <div>
        <h2 className="text-[17px] font-bold leading-tight tracking-tight">Inho Lee</h2>
        <p className="text-sm text-zinc-400 mt-0.5">Full-Stack Engineer</p>
        <p className="text-xs text-zinc-600 mt-1.5">7 Years Experience</p>
      </div>
    </div>

    <div className="px-6 space-y-5 pb-6">
      <Divider />

      {/* ── Bio ── */}
      <div>
        <SectionLabel>About</SectionLabel>
        <p className="text-[13px] text-zinc-400 leading-relaxed">
          <Highlight>Full-stack engineer</Highlight> with{" "}
          <Highlight>7 years of experience</Highlight> building{" "}
          <Highlight>scalable web applications</Highlight> and{" "}
          <Highlight>backend services</Highlight> across e-commerce, SaaS,
          and consumer platforms. Track record of improving{" "}
          <Highlight>system performance</Highlight>, leading cross-functional
          teams, and driving <Highlight>CI/CD</Highlight>,{" "}
          <Highlight>test automation</Highlight>, and{" "}
          <Highlight>cloud-native AWS</Highlight> adoption.
        </p>
      </div>

      <Divider />

      {/* ── Skills ── */}
      <div>
        <SectionLabel>Skills</SectionLabel>
        <div className="space-y-2.5">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category} className="flex gap-2 items-start flex-wrap">
              <span className="text-[11px] text-zinc-600 w-16 shrink-0 pt-0.5">
                {category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="text-[11px] bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.1] transition-colors px-2 py-0 rounded-md font-normal"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── Info ── */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>Toronto, ON, Canada</span>
        </div>
        <a
          href="mailto:sayyou0918@gmail.com"
          className="flex items-center gap-2 text-[12px] text-zinc-500 hover:text-indigo-400 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          sayyou0918@gmail.com
        </a>
        <a
          href="https://linkedin.com/in/inho-lee"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[12px] text-zinc-500 hover:text-indigo-400 transition-colors"
        >
          <LinkedinIcon />
          linkedin.com/in/inho-lee
        </a>
        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span>B.Eng. Computer Engineering · KOREATECH</span>
        </div>
      </div>
    </div>
  </Card>
);
