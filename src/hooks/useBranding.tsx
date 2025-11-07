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
  primaryColor: "hsl(177, 33%, 52%)",
  secondaryColor: "hsl(177, 40%, 42%)",
  officialBadge: "Centro Acreditado SEPE",
  footerText: "TalentCloudSolution - Todos los derechos reservados",
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [loading, setLoading] = useState(true);

  const loadBranding = async () => {
    if (!user) {
      setBranding(defaultBranding);
      setLoading(false);
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
        setLoading(false);
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
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const applyBrandingToDOM = (config: BrandingConfig) => {
    const root = document.documentElement;
    
    // Parse HSL values and apply to CSS variables
    const parsePrimaryColor = parseHSL(config.primaryColor);
    const parseSecondaryColor = parseHSL(config.secondaryColor);
    
    if (parsePrimaryColor) {
      root.style.setProperty('--primary', parsePrimaryColor);
    }
    
    if (parseSecondaryColor) {
      root.style.setProperty('--secondary', parseSecondaryColor);
    }
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
    loadBranding();
  }, [user]);

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
