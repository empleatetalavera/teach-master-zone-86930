import { PricingSection } from "@/components/PricingSection";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Shop() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Tienda{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Online
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubre nuestros planes de plataforma y licencias SCORM. 
              Añade productos al carrito y completa tu compra de forma segura.
            </p>
          </div>
        </div>
        <PricingSection />
      </div>
      <Footer />
    </main>
  );
}
