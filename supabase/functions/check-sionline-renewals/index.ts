import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get settings expiring in the next 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: expiringSettings, error: settingsError } = await supabase
      .from("sionline_settings")
      .select(`
        *,
        training_center:training_centers(id, name, cif)
      `)
      .eq("enabled", true)
      .lte("fecha_renovacion", sevenDaysFromNow.toISOString())
      .gte("fecha_renovacion", now.toISOString());

    if (settingsError) {
      throw settingsError;
    }

    // Get super admins
    const { data: superAdmins, error: adminsError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "super_admin");

    if (adminsError) {
      throw adminsError;
    }

    const notifications: any[] = [];

    for (const setting of expiringSettings || []) {
      const centerName = setting.training_center?.name || "Centro desconocido";
      const renewalDate = new Date(setting.fecha_renovacion).toLocaleDateString("es-ES");
      const daysLeft = Math.ceil(
        (new Date(setting.fecha_renovacion).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if notification already exists for this center/renewal
      for (const admin of superAdmins || []) {
        const { data: existingNotification } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", admin.user_id)
          .eq("type", "sionline_renewal")
          .eq("metadata->>center_id", setting.training_center_id)
          .eq("metadata->>renewal_date", setting.fecha_renovacion)
          .single();

        if (!existingNotification) {
          notifications.push({
            user_id: admin.user_id,
            type: "sionline_renewal",
            title: `🔔 Renovación SíOnline: ${centerName}`,
            message: `El servicio SíOnline del centro "${centerName}" vence el ${renewalDate} (${daysLeft} días). Contactar para renovación.`,
            priority: daysLeft <= 3 ? "high" : "medium",
            metadata: {
              center_id: setting.training_center_id,
              center_name: centerName,
              renewal_date: setting.fecha_renovacion,
              days_left: daysLeft
            }
          });
        }
      }
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiring_centers: expiringSettings?.length || 0,
        notifications_created: notifications.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  } catch (error: any) {
    console.error("Error checking renewals:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
});
