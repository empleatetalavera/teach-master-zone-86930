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
  primaryColor: "hsl(174, 62%, 47%)",
  secondaryColor: "hsl(174, 50%, 38%)",
  officialBadge: "Centro Acreditado SEPE",
  footerText: "TalentCloudSolution - Todos los derechos reservados",
};

/**
 * Hook to load training center branding by slug or CIF
 * Used for public pages like login where the user is not authenticated yet
 * Supports both slug (e.g., "grupoarma") and CIF (e.g., "B45878253")
 */
export function useCenterBranding(centerIdentifier?: string | null) {
  const [branding, setBranding] = useState<CenterBrandingConfig>(defaultBranding);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCenterBranding = async () => {
      console.log('[useCenterBranding] Starting load with identifier:', centerIdentifier);
      
      if (!centerIdentifier) {
        console.log('[useCenterBranding] No identifier provided, using default branding');
        setBranding(defaultBranding);
        setLoading(false);
        return;
      }

      try {
        // Check if the identifier looks like a CIF (starts with letter + numbers)
        const isCIF = /^[A-Z][0-9]{7,8}[A-Z0-9]?$/i.test(centerIdentifier);
        
        console.log('[useCenterBranding] Identifier type:', isCIF ? 'CIF' : 'slug', 'value:', centerIdentifier);
        
        let center = null;
        let error = null;

        if (isCIF) {
          // Query by CIF
          const result = await supabase
            .from('training_centers')
            .select('*')
            .eq('cif', centerIdentifier.toUpperCase())
            .eq('is_active', true)
            .maybeSingle();
          
          center = result.data;
          error = result.error;
        } else {
          // Query by slug
          const result = await supabase
            .from('training_centers')
            .select('*')
            .eq('slug', centerIdentifier)
            .eq('is_active', true)
            .maybeSingle();
          
          center = result.data;
          error = result.error;
        }

        console.log('[useCenterBranding] Query result:', { center, error });

        if (error) {
          console.error('[useCenterBranding] Database error:', error);
          setBranding(defaultBranding);
          setLoading(false);
          return;
        }

        if (!center) {
          console.warn(`[useCenterBranding] Center not found for identifier: ${centerIdentifier}`);
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
  }, [centerIdentifier]);

  return { branding, loading };
}
