import { FeaturesBento } from "@/components/sections/features-bento/features-bento";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturesBento />
      {/* <Features /> */}
      {/* <Pricing /> */}
      {/* <Testimonials /> */}
      {/* <Footer /> */}
    </>
  );
}