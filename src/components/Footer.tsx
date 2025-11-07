import { Mail, Phone, MapPin } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";

export const Footer = () => {
  const { branding } = useBranding();
  
  return (
    <footer className="bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <img 
              src={branding.centerLogo} 
              alt={branding.centerName}
              className="h-12 object-contain"
            />
            <p className="text-sm text-muted-foreground">
              {branding.officialBadge || "Plataforma e-learning profesional"}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/platform" className="hover:text-primary transition-colors">Características</a></li>
              <li><a href="/shop" className="hover:text-primary transition-colors">Precios</a></li>
              <li><a href="/case-studies" className="hover:text-primary transition-colors">Casos de Éxito</a></li>
              <li><a href="/documentation" className="hover:text-primary transition-colors">Documentación</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-colors">Sobre Nosotros</a></li>
              <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contacto</a></li>
              <li><a href="/support" className="hover:text-primary transition-colors">Soporte</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:comercial@talentcloudsolution.es" className="hover:text-primary">
                  comercial@talentcloudsolution.es
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+34665673416" className="hover:text-primary">
                  +34 665 673 416
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Talavera de la Reina, Toledo</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>{branding.footerText || `© ${new Date().getFullYear()} ${branding.centerName}. Todos los derechos reservados.`}</p>
        </div>
      </div>
    </footer>
  );
};
