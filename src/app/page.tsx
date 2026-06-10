import { InfiniteCanvas, CanvasNode } from "@/components/InfiniteCanvas";
import { ProfileSection } from "@/components/ProfileSection";

const Portfolio = () => (
  <InfiniteCanvas>
    <CanvasNode x={-300} y={-100}>
      <ProfileSection />
    </CanvasNode>
  </InfiniteCanvas>
);

export default Portfolio;
