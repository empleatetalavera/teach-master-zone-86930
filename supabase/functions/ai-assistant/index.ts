import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on context
    let systemPrompt = `Eres Esmeralda, la asistente virtual educativa del Campus Virtual Emplate Talavera.

Tu presentación es: "Bienvenida, soy Esmeralda, tu asistente virtual. ¿En qué podemos ayudarla?"

Tu misión es ayudar a los usuarios (estudiantes, profesores y administradores) a:
- Resolver dudas sobre el contenido de los cursos y módulos específicos
- Explicar conceptos de forma clara y concisa relacionados con el material actual
- Guiar en el uso de la plataforma
- Proporcionar información sobre certificaciones SEPE
- Ayudar con evaluaciones y actividades del curso actual

Características importantes:
- Responde en español
- Sé amable, profesional y educativo
- Proporciona respuestas concisas pero completas
- Si no sabes algo, admítelo honestamente
- Anima al aprendizaje activo
- Cuando hables sobre el contenido del curso, hazlo de forma específica usando la información del contexto proporcionado
- Siempre te identificas como Esmeralda cuando te pregunten quién eres`;

    // Add context-specific information
    if (context?.page) {
      systemPrompt += `\n\nUbicación del usuario: ${context.page}`;
    }
    if (context?.userRole) {
      systemPrompt += `\nRol del usuario: ${context.userRole}`;
    }
    if (context?.courseInfo) {
      systemPrompt += `\n\nINFORMACIÓN CONTEXTUAL IMPORTANTE:\n${context.courseInfo}`;
      systemPrompt += `\n\nUsa esta información contextual para proporcionar respuestas específicas y relevantes al curso/módulo actual. Menciona detalles específicos del contenido cuando sea apropiado.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Límite de solicitudes alcanzado. Por favor, intenta nuevamente en unos momentos." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Servicio temporalmente no disponible. Por favor, contacta al administrador." 
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error al procesar la solicitud" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ 
        error: e instanceof Error ? e.message : "Error desconocido" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
