import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DemoAccount = {
  email: string;
  password: string;
  role: "admin" | "teacher" | "student";
  full_name?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional custom accounts via body, otherwise default demo accounts
    const body = (await req.json().catch(() => ({}))) as {
      accounts?: DemoAccount[];
    };

    const accounts: DemoAccount[] = body.accounts ?? [
      { email: "alumna@talentcloud.demo", password: "Demo2025!", role: "student", full_name: "María García" },
      { email: "tutora@talentcloud.demo", password: "Demo2025!", role: "teacher", full_name: "Ana Martínez" },
      { email: "admin@talentcloud.demo", password: "Demo2025!", role: "admin", full_name: "Laura Sánchez" },
    ];

    // Safety guard: only allow seeding for the demo domain
    for (const acc of accounts) {
      if (!acc.email.endsWith("@talentcloud.demo")) {
        return new Response(
          JSON.stringify({ error: "Solo se permiten emails @talentcloud.demo" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: Array<{ email: string; created: boolean; userId: string | null; role: string; note?: string }> = [];

    for (const acc of accounts) {
      let userId: string | null = null;
      let created = false;

      // Try to create user; if exists, ignore error
      const { data: createdUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: acc.full_name ? { full_name: acc.full_name } : undefined,
      });

      if (createdUser?.user) {
        userId = createdUser.user.id;
        created = true;
      } else {
        // If already exists, try to find by listing users (small set, OK to paginate a little)
        // We will try first 10 pages with 100 users each (more than enough for demo projects)
        for (let page = 1; page <= 10 && !userId; page++) {
          const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
          if (listErr) break;
          const found = list?.users?.find((u) => u.email?.toLowerCase() === acc.email.toLowerCase());
          if (found) userId = found.id;
          if (!list || list.users.length < 100) break; // no more pages
        }
      }

      if (!userId) {
        results.push({ email: acc.email, created: false, userId: null, role: acc.role, note: createErr?.message || "No se pudo obtener el usuario" });
        continue;
      }

      // Ensure role mapping exists
      const { error: roleErr } = await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: acc.role },
        { onConflict: "user_id,role" }
      );

      results.push({ email: acc.email, created, userId, role: acc.role, note: roleErr ? roleErr.message : undefined });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
