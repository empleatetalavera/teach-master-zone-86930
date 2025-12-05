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
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email y contraseña son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if super_admin already exists
    const { data: existingRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "super_admin")
      .limit(1);

    if (existingRoles && existingRoles.length > 0) {
      return new Response(
        JSON.stringify({ error: "Ya existe un super_admin en el sistema" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Assign super_admin role
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "super_admin" });

    if (roleErr) {
      return new Response(
        JSON.stringify({ error: roleErr.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile
    await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName || "Super Admin TalentCloud",
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Super admin creado correctamente",
        email,
        userId 
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
