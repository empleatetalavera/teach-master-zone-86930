import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Usuarios de prueba para evaluadores SEPE
const testUsers = [
  {
    email: "alumnocertificados@talentcloudsolution.es",
    password: "d123456-A",
    fullName: "Alumno Certificados (Prueba SEPE)",
    role: "student",
  },
  {
    email: "tutorcertificados@talentcloudsolution.es",
    password: "d123456-T",
    fullName: "Tutor Certificados (Prueba SEPE)",
    role: "teacher",
  },
];

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

    // Get the training center for "Empleate Talavera" or the first one available
    const { data: centerData } = await supabaseAdmin
      .from("training_centers")
      .select("id")
      .ilike("name", "%empleate%")
      .limit(1)
      .maybeSingle();

    const trainingCenterId = centerData?.id || null;
    console.log(`Using training center: ${trainingCenterId}`);

    const results = [];

    for (const testUser of testUsers) {
      console.log(`Processing user: ${testUser.email}`);

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === testUser.email);

      if (existingUser) {
        console.log(`User ${testUser.email} already exists, updating password...`);
        
        // Update password for existing user
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password: testUser.password }
        );

        if (updateError) {
          console.error(`Error updating user ${testUser.email}:`, updateError);
          results.push({ email: testUser.email, status: "error", message: updateError.message });
        } else {
          results.push({ email: testUser.email, status: "updated", message: "Contraseña actualizada" });
        }
        continue;
      }

      // Create new user
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: testUser.fullName,
        },
      });

      if (createError) {
        console.error(`Error creating user ${testUser.email}:`, createError);
        results.push({ email: testUser.email, status: "error", message: createError.message });
        continue;
      }

      if (!authData.user) {
        results.push({ email: testUser.email, status: "error", message: "No se pudo crear el usuario" });
        continue;
      }

      // Assign role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({
          user_id: authData.user.id,
          role: testUser.role,
        }, { onConflict: 'user_id' });

      if (roleError) {
        console.error(`Error assigning role for ${testUser.email}:`, roleError);
      }

      // Create/update profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: authData.user.id,
          full_name: testUser.fullName,
          training_center_id: trainingCenterId,
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`Error creating profile for ${testUser.email}:`, profileError);
      }

      // If student, enroll in the ADGG0408 course
      if (testUser.role === "student") {
        const { data: courseData } = await supabaseAdmin
          .from("courses")
          .select("id")
          .ilike("title", "%ADGG0408%")
          .limit(1)
          .maybeSingle();

        if (courseData) {
          await supabaseAdmin
            .from("enrollments")
            .upsert({
              user_id: authData.user.id,
              course_id: courseData.id,
            }, { onConflict: 'user_id,course_id' });
          console.log(`Student enrolled in course ${courseData.id}`);
        }
      }

      // If teacher, assign as tutor of the course
      if (testUser.role === "teacher") {
        const { data: courseData } = await supabaseAdmin
          .from("courses")
          .select("id")
          .ilike("title", "%ADGG0408%")
          .limit(1)
          .maybeSingle();

        if (courseData) {
          await supabaseAdmin
            .from("courses")
            .update({ tutor_id: authData.user.id })
            .eq("id", courseData.id);
          console.log(`Teacher assigned as tutor for course ${courseData.id}`);
        }
      }

      results.push({ 
        email: testUser.email, 
        status: "created", 
        message: "Usuario creado correctamente",
        userId: authData.user.id
      });
    }

    console.log("SEPE test users creation completed:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Usuarios de prueba SEPE procesados",
        results,
        credentials: testUsers.map(u => ({
          email: u.email,
          password: u.password,
          role: u.role
        }))
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
