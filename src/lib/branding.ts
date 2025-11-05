// Branding configuration for multi-tenant LMS platform

export interface BrandingConfig {
  centerName: string;
  centerLogo: string;
  primaryColor: string;
  secondaryColor: string;
  officialBadge?: string;
  footer?: string;
}

// Default Emplate Talavera branding
export const defaultBranding: BrandingConfig = {
  centerName: "Emplate Talavera Formación",
  centerLogo: "/branding/emplate-logo.png",
  primaryColor: "hsl(177, 33%, 52%)",
  secondaryColor: "hsl(177, 40%, 42%)",
  officialBadge: "Centro Acreditado SEPE",
  footer: "Emplate Talavera Formación - Todos los derechos reservados",
};

// Example: Custom training center
export const customBrandingExample: BrandingConfig = {
  centerName: "Academia de Formación Profesional",
  centerLogo: "/branding/custom-logo.png",
  primaryColor: "hsl(142, 76%, 36%)",
  secondaryColor: "hsl(221, 83%, 53%)",
  officialBadge: "Centro Acreditado",
  footer: "Academia de Formación - Todos los derechos reservados",
};

// Get current branding (could be from database/localStorage in production)
export function getCurrentBranding(): BrandingConfig {
  // In production, this would fetch from database based on tenant
  // For now, return default SEPE branding
  const stored = localStorage.getItem("brandingConfig");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultBranding;
    }
  }
  return defaultBranding;
}

// Update branding configuration
export function updateBranding(config: BrandingConfig): void {
  localStorage.setItem("brandingConfig", JSON.stringify(config));
  // Trigger a page reload to apply changes
  window.location.reload();
}

// Reset to default SEPE branding
export function resetToDefaultBranding(): void {
  localStorage.setItem("brandingConfig", JSON.stringify(defaultBranding));
  window.location.reload();
}
