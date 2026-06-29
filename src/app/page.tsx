"use client";

import { PortfolioCanvas } from "@/components/PortfolioCanvas";
import { MobilePortfolio } from "@/components/mobile/MobilePortfolio";
import { useIsMobile } from "@/hooks/useIsMobile";

const Portfolio = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobilePortfolio /> : <PortfolioCanvas />;
};

export default Portfolio;
