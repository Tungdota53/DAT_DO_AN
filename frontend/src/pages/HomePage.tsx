import { LandingHero } from "../components/landing/LandingHero";
import { LandingHighlights } from "../components/landing/LandingHighlights";
import { LandingStatus } from "../components/landing/LandingStatus";
import { LandingSteps } from "../components/landing/LandingSteps";
import type { HealthResponse } from "../types/api";

interface HomePageProps {
  loadHealth?: () => Promise<HealthResponse>;
}

export function HomePage({ loadHealth }: HomePageProps) {
  return (
    <>
      <LandingHero />
      <LandingHighlights />
      <LandingSteps />
      <LandingStatus loadHealth={loadHealth} />
    </>
  );
}
