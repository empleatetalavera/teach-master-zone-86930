import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

interface BrandingConfig {
  centerName: string;
  centerLogo: string;
  primaryColor: string;
  secondaryColor: string;
  officialBadge?: string;
  footerText?: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  loading: boolean;
  refreshBranding: () => Promise<void>;
}

// Default TalentCloud branding (matrix)
const defaultBranding: BrandingConfig = {
  centerName: "TalentCloudSolution",
  centerLogo: "/branding/talentcloud-logo.png",
  primaryColor: "hsl(174, 62%, 47%)",
  secondaryColor: "hsl(174, 50%, 38%)",
  officialBadge: "Centro Acreditado SEPE",
  footerText: "TalentCloudSolution - Todos los derechos reservados",
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { user, userRole, loading: authLoading } = useAuth();
  // Initialize with null to avoid showing default branding during load
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadBranding = async () => {
    // ============================================================
    // MODELO A: Branding fijo por dominio
    // ============================================================
    // - Dominio matriz (talentcloudsolution.es / lovable preview / dev)
    //   → SIEMPRE branding TalentCloudSolution, sin importar el usuario
    // - Dominio personalizado de un centro (custom_domain configurado)
    //   → SIEMPRE branding de ese centro
    // - Cada centro = su propia identidad visual = su propio dominio.
    // ============================================================

    const rawHost = (typeof window !== 'undefined' ? window.location.hostname : '') || '';
    const currentDomain = rawHost.toLowerCase();
    const currentCleanDomain = currentDomain.replace(/^www\./, '');

    const isMatrixDomain =
      currentCleanDomain === 'talentcloudsolution.es' ||
      currentDomain === 'localhost' ||
      currentDomain === '127.0.0.1' ||
      currentDomain.endsWith('.lovable.app') ||
      currentDomain.endsWith('.lovableproject.com');

    console.log('[useBranding] host:', currentDomain, 'isMatrix:', isMatrixDomain);

    // ----- DOMINIO MATRIZ -----
    // SIEMPRE branding matriz, sea quien sea el usuario.
    if (isMatrixDomain) {
      console.log('[useBranding] Matrix domain → applying TalentCloudSolution branding (fixed)');
      setBranding(defaultBranding);
      applyBrandingToDOM(defaultBranding);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // ----- DOMINIO DE CENTRO -----
    // Buscar qué centro reclama este dominio.
    try {
      const { data: centersByDomain, error: domainError } = await (supabase as any)
        .from('centers_public_branding')
        .select('*');

      if (domainError) {
        console.error('[useBranding] Error fetching centers:', domainError);
      }

      if (centersByDomain && centersByDomain.length > 0) {
        const matchedCenter = centersByDomain.find((center: any) => {
          if (!center.custom_domain) return false;
          const centerDomain = String(center.custom_domain)
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]
            .trim();
          return centerDomain === currentCleanDomain;
        });

        if (matchedCenter) {
          const centerBranding: BrandingConfig = {
            centerName: matchedCenter.name,
            centerLogo: matchedCenter.logo_url || defaultBranding.centerLogo,
            primaryColor: matchedCenter.primary_color,
            secondaryColor: matchedCenter.secondary_color,
            officialBadge: matchedCenter.official_badge || undefined,
            footerText: matchedCenter.footer_text || `${matchedCenter.name} - Todos los derechos reservados`,
          };
          console.log('[useBranding] Resolved by domain →', matchedCenter.name);
          setBranding(centerBranding);
          applyBrandingToDOM(centerBranding);
          setLoading(false);
          setInitialized(true);
          return;
        }

        console.warn('[useBranding] No center matches host:', currentCleanDomain,
          'available domains:', centersByDomain.map((c: any) => c.custom_domain));
      }
    } catch (error) {
      console.error('[useBranding] Domain lookup exception:', error);
    }

    // Estamos en un dominio NO-matriz pero ningún centro lo reclama:
    // fallback al branding por defecto, pero avisamos en consola.
    console.warn('[useBranding] Custom-looking host without matching center, falling back to default');
    setBranding(defaultBranding);
    applyBrandingToDOM(defaultBranding);
    setLoading(false);
    setInitialized(true);
  };

  const applyBrandingToDOM = (config: BrandingConfig) => {
    const root = document.documentElement;
    
    // Parse HSL values and apply to CSS variables
    const parsePrimaryColor = parseHSL(config.primaryColor);
    const parseSecondaryColor = parseHSL(config.secondaryColor);
    
    // Always set both primary and secondary to ensure consistency
    root.style.setProperty('--primary', parsePrimaryColor);
    root.style.setProperty('--secondary', parseSecondaryColor);
    
    // Ensure foreground colors are always set for visibility
    root.style.setProperty('--primary-foreground', '0 0% 100%');
    root.style.setProperty('--secondary-foreground', '0 0% 100%');
    root.style.setProperty('--accent-foreground', '0 0% 100%');
    
    // Also update related CSS variables for complete theme consistency
    root.style.setProperty('--primary-glow', adjustLightness(parsePrimaryColor, 13));
    root.style.setProperty('--accent', adjustLightness(parsePrimaryColor, -5));
    root.style.setProperty('--ring', parsePrimaryColor);
    root.style.setProperty('--sidebar-primary', parsePrimaryColor);
    root.style.setProperty('--sidebar-ring', parsePrimaryColor);
  };

  const adjustLightness = (hslString: string, amount: number): string => {
    const parts = hslString.split(' ');
    if (parts.length === 3) {
      const lightness = parseFloat(parts[2]);
      const newLightness = Math.min(100, Math.max(0, lightness + amount));
      return `${parts[0]} ${parts[1]} ${newLightness}%`;
    }
    return hslString;
  };

  const parseHSL = (hslString: string): string => {
    // Extract HSL values from string like "hsl(177, 33%, 52%)"
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      return `${match[1]} ${match[2]}% ${match[3]}%`;
    }
    return hslString;
  };

  const refreshBranding = async () => {
    setLoading(true);
    await loadBranding();
  };

  useEffect(() => {
    // En Modelo A el branding NO depende del usuario logueado en dominios matriz.
    // Solo recargamos si todavía no está inicializado, o si refreshBranding() se llama explícitamente.
    if (!initialized) {
      loadBranding();
    }
  }, [authLoading, initialized]);

  // Don't render children until branding is initialized to prevent flash
  if (!initialized || branding === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-24 rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
