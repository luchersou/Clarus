import { FAQ } from "@/components/sections/faq";
import { FeaturesBento } from "@/components/sections/features-bento/features-bento";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturesBento />
      <FAQ />
      {/* <Testimonials /> */}
      {/* <Footer /> */}
    </>
  );
}