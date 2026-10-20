import { CTA } from "./_components/sections/cta";
import { FAQ } from "./_components/sections/faq";
import { FeaturesBento } from "./_components/sections/features-bento";
import { Hero } from "./_components/sections/hero";
import { HowItWorks } from "./_components/sections/how-it-works";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturesBento />
      <FAQ />
      <CTA />
    </>
  );
}