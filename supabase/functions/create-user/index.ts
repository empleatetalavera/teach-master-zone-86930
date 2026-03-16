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
    const { email, username, password, fullName, role, trainingCenterId } = await req.json();

    console.log(`Creating user: ${email || username} with role ${role}`);

    if (!password || !role) {
      return new Response(
        JSON.stringify({ error: "Password y rol son requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!email && !username) {
      return new Response(
        JSON.stringify({ error: "Email o nombre de usuario son requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client for all operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the user is authenticated using the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user has admin or super_admin role
    console.log(`Checking role for user: ${user.id}`);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    console.log(`Role check result: ${JSON.stringify(roleData)}, error: ${roleError?.message}`);

    if (roleError || !roleData || (roleData.role !== "admin" && roleData.role !== "super_admin")) {
      console.log(`Permission denied: roleError=${roleError?.message}, roleData=${JSON.stringify(roleData)}`);
      return new Response(
        JSON.stringify({ error: "No tienes permisos de administrador" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isSuperAdmin = roleData.role === "super_admin";

    // Get the admin's training center if they're a center admin
    let effectiveTrainingCenterId = trainingCenterId;
    
    if (!isSuperAdmin) {
      // Center admins can only create users for their own center
      const { data: adminProfile } = await supabaseAdmin
        .from("profiles")
        .select("training_center_id")
        .eq("id", user.id)
        .single();
      
      if (adminProfile?.training_center_id) {
        effectiveTrainingCenterId = adminProfile.training_center_id;
        console.log(`Center admin creating user for their center: ${effectiveTrainingCenterId}`);
      }
      
      // Center admins cannot create other admins or super_admins
      if (role === "admin" || role === "super_admin") {
        return new Response(
          JSON.stringify({ error: "No tienes permisos para crear administradores" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // If no email provided, generate one from username
    const effectiveEmail = email || `${username.toLowerCase()}@internal.plataforma.local`;

    // If username provided, check it doesn't already exist in the same center
    if (username && effectiveTrainingCenterId) {
      const { data: existingUser } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .eq("training_center_id", effectiveTrainingCenterId)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: "Ya existe un usuario con este nombre de usuario en este centro." }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Create the new user with admin client
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: effectiveEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || username || undefined,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      const errorMessage = createError.message?.includes("already been registered")
        ? "Ya existe un usuario con este email. Usa otro email o busca el usuario existente."
        : createError.message;
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "No se pudo crear el usuario" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Assign role to the new user
    const { error: roleAssignError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: role,
      });

    if (roleAssignError) {
      console.error("Error assigning role:", roleAssignError);
      return new Response(
        JSON.stringify({ error: "Usuario creado pero no se pudo asignar el rol" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create/update profile with training center and username
    const profileData: any = {
      id: authData.user.id,
    };
    
    if (fullName) profileData.full_name = fullName;
    else if (username) profileData.full_name = username;
    if (effectiveTrainingCenterId) profileData.training_center_id = effectiveTrainingCenterId;
    if (username) profileData.username = username.toLowerCase();

    // Use upsert to handle potential profile already created by trigger
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(profileData, { onConflict: 'id' });

    if (profileError) {
      console.error("Error creating/updating profile:", profileError);
    }

    console.log(`User created successfully: ${effectiveEmail} with role ${role}${username ? ` and username ${username}` : ''}${effectiveTrainingCenterId ? ` and training center ${effectiveTrainingCenterId}` : ''}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Usuario creado correctamente",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        }
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
