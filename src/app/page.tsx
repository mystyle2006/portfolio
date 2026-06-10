import { InfiniteCanvas, CanvasNode } from "@/components/InfiniteCanvas";
import { ProfileCard } from "@/components/ProfileCard";

const Portfolio = () => (
  <InfiniteCanvas>
    {/* 카드 너비 340px, 높이 약 320px 기준으로 원점 중앙 배치 */}
    <CanvasNode x={-170} y={-170}>
      <ProfileCard />
    </CanvasNode>
  </InfiniteCanvas>
);

export default Portfolio;
