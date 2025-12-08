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
    const { userId, newPassword, newEmail } = await req.json();
    console.log("Update user request for userId:", userId, "- Password change:", !!newPassword, "- Email change:", !!newEmail);

    if (!userId || (!newPassword && !newEmail)) {
      console.log("Missing userId or both newPassword and newEmail");
      return new Response(
        JSON.stringify({ error: "userId y newPassword o newEmail son requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (newPassword && newPassword.length < 6) {
      console.log("Password too short");
      return new Response(
        JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Basic email validation
    if (newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        console.log("Invalid email format");
        return new Response(
          JSON.stringify({ error: "El formato del email no es válido" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.log("No authorization header");
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Extract the JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    console.log("Token extracted, length:", token.length);

    // Create admin client to verify the user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the user's token using admin client
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.log("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "No autorizado - sesión inválida" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentUserId = userData.user.id;
    console.log("Authenticated user:", currentUserId);

    // Check if user has admin or super_admin role using admin client
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUserId)
      .single();

    console.log("Role data:", roleData, "Role error:", roleError?.message);

    if (roleError || !roleData || (roleData.role !== "admin" && roleData.role !== "super_admin")) {
      console.log("Permission denied - role:", roleData?.role);
      return new Response(
        JSON.stringify({ error: "No tienes permisos de administrador" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User has role:", roleData.role, "- proceeding with update");

    // Build update object
    const updateData: { password?: string; email?: string } = {};
    if (newPassword) updateData.password = newPassword;
    if (newEmail) updateData.email = newEmail;

    // Update the user using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (updateError) {
      console.error("Error updating user:", updateError);
      const errorType = newPassword ? "contraseña" : "email";
      return new Response(
        JSON.stringify({ error: `Error al actualizar ${errorType}: ` + updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const updateType = newPassword ? "Contraseña" : "Email";
    console.log(`${updateType} updated successfully for user:`, userId);

    return new Response(
      JSON.stringify({ success: true, message: `${updateType} actualizado/a correctamente` }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Caught error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
