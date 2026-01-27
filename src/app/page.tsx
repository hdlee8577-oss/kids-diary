import { HomeHero } from "@/components/home/HomeHero";
import { ProfileSection } from "@/components/home/ProfileSection";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <ProfileSection />
      <div className="mt-8">
        <HomeHero />
      </div>
    </main>
  );
}
