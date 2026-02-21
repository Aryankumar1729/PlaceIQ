import { Suspense } from "react";
import PrepHero from "@/components/ui/PrepHero";
import PYQList from "@/components/cards/PYQList";

export default function PrepPage() {
  return (
    <div className="p-8 lg:p-10 max-w-4xl">
      <Suspense fallback={<div className="h-40" />}>
        <PrepHero />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <PYQList />
      </Suspense>
    </div>
  );
}