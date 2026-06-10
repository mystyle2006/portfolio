import { InfiniteCanvas, CanvasNode } from "@/components/InfiniteCanvas";
import { ProfileSection } from "@/components/ProfileSection";

const Portfolio = () => (
  <InfiniteCanvas>
    <CanvasNode x={-260} y={-180}>
      <ProfileSection />
    </CanvasNode>
  </InfiniteCanvas>
);

export default Portfolio;
