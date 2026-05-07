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

      // Fallback: if no explicit identifier, try resolving by current hostname (custom domain)
      if (!centerIdentifier) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        const isMatrixDomain =
          host === 'talentcloudsolution.es' ||
          host === 'www.talentcloudsolution.es' ||
          host === 'localhost' ||
          host === '127.0.0.1' ||
          host.includes('lovable.app') ||
          host.includes('lovableproject.com');

        if (isMatrixDomain || !host) {
          console.log('[useCenterBranding] Matrix/dev host, using default branding');
          setBranding(defaultBranding);
          setLoading(false);
          return;
        }

        try {
          const cleanHost = host.replace(/^www\./, '');
          const { data: centers } = await supabase
            .from('training_centers')
            .select('*')
            .eq('is_active', true);

          const matched = (centers || []).find((c: any) => {
            if (!c.custom_domain) return false;
            const d = String(c.custom_domain)
              .replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0]
              .toLowerCase();
            return d === cleanHost.toLowerCase();
          });

          if (matched) {
            const centerBranding: CenterBrandingConfig = {
              centerName: matched.name,
              centerLogo: matched.logo_url || defaultBranding.centerLogo,
              primaryColor: matched.primary_color,
              secondaryColor: matched.secondary_color,
              officialBadge: matched.official_badge || undefined,
              footerText: matched.footer_text || `${matched.name} - Todos los derechos reservados`,
              slug: matched.slug,
            };
            console.log('[useCenterBranding] Resolved by domain:', cleanHost, centerBranding);
            setBranding(centerBranding);
            setLoading(false);
            return;
          }

          console.warn('[useCenterBranding] No center matches host:', cleanHost);
        } catch (e) {
          console.error('[useCenterBranding] Domain lookup error:', e);
        }

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
