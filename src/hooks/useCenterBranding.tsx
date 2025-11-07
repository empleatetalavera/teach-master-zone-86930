import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CenterBrandingConfig {
  centerName: string;
  centerLogo: string;
  primaryColor: string;
  secondaryColor: string;
  officialBadge?: string;
  footerText?: string;
  slug?: string;
}

// Default TalentCloud branding
const defaultBranding: CenterBrandingConfig = {
  centerName: "TalentCloudSolution",
  centerLogo: "/branding/talentcloud-logo.png",
  primaryColor: "hsl(177, 33%, 52%)",
  secondaryColor: "hsl(177, 40%, 42%)",
  officialBadge: "Centro Acreditado SEPE",
  footerText: "TalentCloudSolution - Todos los derechos reservados",
};

/**
 * Hook to load training center branding by slug
 * Used for public pages like login where the user is not authenticated yet
 */
export function useCenterBranding(centerSlug?: string | null) {
  const [branding, setBranding] = useState<CenterBrandingConfig>(defaultBranding);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCenterBranding = async () => {
      console.log('[useCenterBranding] Starting load with slug:', centerSlug);
      
      if (!centerSlug) {
        console.log('[useCenterBranding] No slug provided, using default branding');
        setBranding(defaultBranding);
        setLoading(false);
        return;
      }

      try {
        console.log('[useCenterBranding] Querying training_centers with slug:', centerSlug);
        
        const { data: center, error } = await supabase
          .from('training_centers')
          .select('*')
          .eq('slug', centerSlug)
          .eq('is_active', true)
          .maybeSingle();

        console.log('[useCenterBranding] Query result:', { center, error });

        if (error) {
          console.error('[useCenterBranding] Database error:', error);
          setBranding(defaultBranding);
          setLoading(false);
          return;
        }

        if (!center) {
          console.warn(`[useCenterBranding] Center not found for slug: ${centerSlug}`);
          setBranding(defaultBranding);
          setLoading(false);
          return;
        }

        const centerBranding: CenterBrandingConfig = {
          centerName: center.name,
          centerLogo: center.logo_url || defaultBranding.centerLogo,
          primaryColor: center.primary_color,
          secondaryColor: center.secondary_color,
          officialBadge: center.official_badge || undefined,
          footerText: center.footer_text || `${center.name} - Todos los derechos reservados`,
          slug: center.slug,
        };

        console.log('[useCenterBranding] Center branding loaded successfully:', centerBranding);
        setBranding(centerBranding);
      } catch (error) {
        console.error('[useCenterBranding] Error loading center branding:', error);
        setBranding(defaultBranding);
      } finally {
        setLoading(false);
      }
    };

    loadCenterBranding();
  }, [centerSlug]);

  return { branding, loading };
}
