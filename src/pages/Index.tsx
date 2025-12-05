import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TechnicalFeaturesSection } from "@/components/TechnicalFeaturesSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { CampusEnvironmentsSection } from "@/components/CampusEnvironmentsSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { CustomizationSection } from "@/components/CustomizationSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { AssociatedCentersSection } from "@/components/AssociatedCentersSection";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ExperienceSection />
      <FeaturesSection />
      <TechnicalFeaturesSection />
      <CampusEnvironmentsSection />
      <BenefitsSection />
      <CustomizationSection />
      <TestimonialsSection />
      <AssociatedCentersSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
