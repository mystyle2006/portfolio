import { InfiniteCanvas, CanvasNode } from "@/components/InfiniteCanvas";
import { ProfileSection } from "@/components/ProfileSection";
import NavOrb, { NAV_ORBS } from "@/components/NavOrb";

const Portfolio = () => (
  <InfiniteCanvas>
    {/* Profile */}
    <CanvasNode x={-300} y={-100}>
      <ProfileSection />
    </CanvasNode>

    {/* Navigation orbs */}
    {NAV_ORBS.map(({ label, x, y }) => (
      <CanvasNode key={label} x={x} y={y}>
        <NavOrb label={label} />
      </CanvasNode>
    ))}
  </InfiniteCanvas>
);

export default Portfolio;
