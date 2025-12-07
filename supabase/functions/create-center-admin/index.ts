import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, trainingCenterId } = await req.json();

    if (!email || !password || !trainingCenterId) {
      return new Response(
        JSON.stringify({ error: "Email, contraseña y centro de formación son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the training center exists
    const { data: center, error: centerErr } = await supabaseAdmin
      .from("training_centers")
      .select("id, name")
      .eq("id", trainingCenterId)
      .single();

    if (centerErr || !center) {
      return new Response(
        JSON.stringify({ error: "Centro de formación no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the user
    const { data: createdUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    });

    if (createErr || !createdUser?.user) {
      return new Response(
        JSON.stringify({ error: createErr?.message || "Error al crear usuario" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = createdUser.user.id;

    // Assign admin role
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleErr) {
      return new Response(
        JSON.stringify({ error: roleErr.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile linked to training center
    await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName || `Admin ${center.name}`,
        training_center_id: trainingCenterId,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Administrador del centro ${center.name} creado correctamente`,
        email,
        userId,
        centerName: center.name
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
