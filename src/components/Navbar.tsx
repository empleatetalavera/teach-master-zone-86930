import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { ShoppingCartWidget } from "@/components/ShoppingCartWidget";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/branding/talentcloud-logo.png"
              alt="TalentCloudSolution"
              className="h-12 object-contain"
            />
            <img
              src="/branding/sepe-gobierno-logo.png"
              alt="Gobierno de España - Ministerio de Trabajo - SEPE"
              className="h-12 object-contain hidden sm:block"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Características
            </a>
            <a
              href="/#benefits"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Beneficios
            </a>
            <a
              href="/shop"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tienda
            </a>
            <ShoppingCartWidget />
            <Button variant="outline" asChild>
              <a href="/demo">Ver Demo</a>
            </Button>
            <Button variant="default" asChild>
              <a href="/auth">Acceder</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <div className="flex flex-col gap-4">
              <a
                href="/#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="/#benefits"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Beneficios
              </a>
              <a
                href="/shop"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tienda
              </a>
              <Button variant="outline" asChild className="w-full">
                <a href="/demo">Ver Demo</a>
              </Button>
              <Button variant="default" asChild className="w-full">
                <a href="/auth">Acceder</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
