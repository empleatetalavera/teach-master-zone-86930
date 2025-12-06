import { useEffect } from "react";
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

// Default TalentCloud brand colors
const DEFAULT_PRIMARY = "174 62% 47%";
const DEFAULT_SECONDARY = "174 50% 38%";

const Index = () => {
  // Reset colors to TalentCloud defaults when visiting the public homepage
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', DEFAULT_PRIMARY);
    root.style.setProperty('--secondary', DEFAULT_SECONDARY);
    root.style.setProperty('--primary-glow', '174 62% 60%');
    root.style.setProperty('--accent', '174 70% 42%');
    root.style.setProperty('--ring', DEFAULT_PRIMARY);
    root.style.setProperty('--sidebar-primary', DEFAULT_PRIMARY);
    root.style.setProperty('--sidebar-ring', DEFAULT_PRIMARY);
  }, []);

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
