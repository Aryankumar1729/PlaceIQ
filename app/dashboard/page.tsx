import HeroSearch from "@/components/ui/HeroSearch";
import StatsRow from "@/components/ui/StatsRow";
import CompanyGrid from "@/components/cards/CompanyGrid";
import PrepTargets from "@/components/cards/PrepTargets";
import DashboardGreeting from "@/components/ui/DashboardGreeting";
import TrackerSummary from "@/components/cards/TrackerSummary";
import SuggestedNextStep from "@/components/cards/SuggestedNextStep";


export default function DashboardPage() {
  return (
    <div className="py-4">
      <DashboardGreeting />
      <HeroSearch />
      <StatsRow />

      {/* Grid for prep targets + tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        <SuggestedNextStep />
        <PrepTargets />
      </div>

      <div className="mb-16">
        <TrackerSummary />
      </div>

      <CompanyGrid />
    </div>
  );
}
