import { Suspense } from "react";
import PrepHero from "@/components/ui/PrepHero";
import PYQList from "@/components/cards/PYQList";

export default function PrepPage() {
  return (
    <div className="p-8 lg:p-10 max-w-4xl">
      <Suspense fallback={<div className="h-40 animate-pulse bg-slate-100 rounded-xl" />}>
        <PrepHero />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100 rounded-xl mt-6" />}>
        <PYQList />
      </Suspense>
    </div>
  );
}
