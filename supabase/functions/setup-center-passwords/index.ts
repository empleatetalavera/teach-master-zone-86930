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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get center admin users
    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        training_center_id,
        training_centers!inner(slug, name)
      `)
      .not("training_center_id", "is", null);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    const results: any[] = [];
    const defaultPassword = "Centro2024!";

    for (const user of users || []) {
      // Check if user has admin role
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role === "admin") {
        // Update password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { password: defaultPassword }
        );

        if (updateError) {
          console.error(`Error updating password for ${user.id}:`, updateError);
          results.push({
            userId: user.id,
            center: (user.training_centers as any)?.name,
            success: false,
            error: updateError.message,
          });
        } else {
          // Get email
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
          
          results.push({
            userId: user.id,
            email: authUser?.user?.email,
            center: (user.training_centers as any)?.name,
            slug: (user.training_centers as any)?.slug,
            success: true,
            password: defaultPassword,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contraseñas establecidas",
        accounts: results 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
