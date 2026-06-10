import { InfiniteCanvas, CanvasNode } from "@/components/InfiniteCanvas";
import { ProfileCard } from "@/components/ProfileCard";

const Portfolio = () => (
  <InfiniteCanvas>
    {/* 카드 너비 360px, 대략적인 높이 460px 기준으로 원점 중앙 배치 */}
    <CanvasNode x={-180} y={-240}>
      <ProfileCard />
    </CanvasNode>
  </InfiniteCanvas>
);

export default Portfolio;
