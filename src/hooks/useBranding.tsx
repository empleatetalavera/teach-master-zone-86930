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

// Default TalentCloud branding
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
    if (!user) {
      setBranding(defaultBranding);
      applyBrandingToDOM(defaultBranding);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Super admins always see TalentCloudSolution branding
    if (userRole === 'super_admin') {
      setBranding(defaultBranding);
      applyBrandingToDOM(defaultBranding);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      // Get user's training center
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('training_center_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.training_center_id) {
        setBranding(defaultBranding);
        applyBrandingToDOM(defaultBranding);
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Get center branding
      const { data: center, error: centerError } = await supabase
        .from('training_centers')
        .select('*')
        .eq('id', profile.training_center_id)
        .eq('is_active', true)
        .single();

      if (centerError || !center) {
        setBranding(defaultBranding);
        applyBrandingToDOM(defaultBranding);
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Apply center branding
      const centerBranding: BrandingConfig = {
        centerName: center.name,
        centerLogo: center.logo_url || defaultBranding.centerLogo,
        primaryColor: center.primary_color,
        secondaryColor: center.secondary_color,
        officialBadge: center.official_badge || undefined,
        footerText: center.footer_text || `${center.name} - Todos los derechos reservados`,
      };

      setBranding(centerBranding);
      applyBrandingToDOM(centerBranding);
    } catch (error) {
      console.error('Error loading branding:', error);
      setBranding(defaultBranding);
      applyBrandingToDOM(defaultBranding);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
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
    // Wait for auth to finish loading before loading branding
    if (!authLoading) {
      loadBranding();
    }
  }, [user, userRole, authLoading]);

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