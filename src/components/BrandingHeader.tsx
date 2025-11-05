import { getCurrentBranding } from "@/lib/branding";
import { Badge } from "@/components/ui/badge";

export function BrandingHeader() {
  const branding = getCurrentBranding();

  return (
    <div className="border-b border-border/50 bg-card">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={branding.centerLogo} 
            alt={branding.centerName}
            className="h-16 object-contain"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.style.display = "none";
            }}
          />
          {branding.officialBadge && (
            <Badge variant="secondary" className="text-xs">
              {branding.officialBadge}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <img 
            src="/branding/sepe-gobierno-logo.png"
            alt="Gobierno de España - Ministerio de Trabajo - SEPE"
            className="h-16 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  );
}
