import Image from "next/image";

const Keyword = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white">{children}</span>
);

export const ProfileSection = () => (
  <div className="flex items-start gap-8">

    {/* ── Photo ── */}
    <Image
      src="/me.jpeg"
      alt="Inho Lee"
      width={160}
      height={160}
      className="rounded-full object-cover object-top shrink-0"
    />

    {/* ── Text ── */}
    <div className="space-y-4 pt-2">
      <div>
        <h1 className="text-[52px] font-bold tracking-tight leading-none text-white">
          INHO LEE
        </h1>
        <p className="text-[16px] text-zinc-400 mt-3">
          Full-Stack Engineer &nbsp;·&nbsp; Toronto, ON
        </p>
      </div>

      <p className="text-[15px] text-zinc-300 leading-[1.8] max-w-[380px]">
        <Keyword>Full-stack engineer</Keyword> with <Keyword>7 years of experience</Keyword>{" "}
        building scalable services across e-commerce, SaaS, and consumer platforms.
        Focused on <Keyword>system performance</Keyword>,{" "}
        <Keyword>cloud-native AWS</Keyword> architectures, and{" "}
        <Keyword>CI/CD</Keyword>-driven delivery.
      </p>
    </div>

  </div>
);
