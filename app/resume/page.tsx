import ResumeHero from "@/components/ui/ResumeHero";
import ResumeUploader from "@/components/cards/ResumeUploader";
import ResumeSampleScore from "@/components/cards/ResumeSampleScore";

export default function ResumePage() {
  return (
    <div className="p-8 lg:p-10 max-w-3xl">
      <ResumeHero />
      <ResumeUploader />
      <ResumeSampleScore />
    </div>
  );
}
