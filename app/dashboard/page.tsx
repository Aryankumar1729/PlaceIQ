import HeroSearch from "@/components/ui/HeroSearch";
import StatsRow from "@/components/ui/StatsRow";
import CompanyGrid from "@/components/cards/CompanyGrid";
import PrepTargets from "@/components/cards/PrepTargets";
import DashboardGreeting from "@/components/ui/DashboardGreeting";
import TrackerSummary from "@/components/cards/TrackerSummary";



export default function DashboardPage() {
  return (
    <div className="p-8 lg:p-10 max-w-5xl">
      <DashboardGreeting />
      <HeroSearch />
      <StatsRow />
      <PrepTargets />
      <TrackerSummary />

      <CompanyGrid />
    </div>
  );
}
