import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY no está configurada");
    }

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "El contenido no puede estar vacío" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("[check-plagiarism] Analizando documento:", { 
      title, 
      contentLength: content.length 
    });

    const systemPrompt = `Eres un experto en detección de plagio académico y originalidad de contenido. Tu tarea es analizar textos académicos y proporcionar un informe detallado sobre su originalidad.

Debes analizar el texto en busca de:
1. Patrones de escritura que sugieran contenido copiado o generado automáticamente
2. Falta de voz propia o estilo personal
3. Transiciones abruptas que sugieran texto pegado de múltiples fuentes
4. Uso excesivo de terminología técnica sin explicación (común en copias de Wikipedia o documentos técnicos)
5. Inconsistencias en el nivel de vocabulario o complejidad
6. Ausencia de análisis crítico propio

Proporciona un informe estructurado en formato JSON con:
- originalityScore: número entre 0-100 (100 = completamente original)
- risk: "bajo" | "medio" | "alto"
- summary: resumen ejecutivo del análisis (máximo 200 caracteres)
- findings: array de hallazgos específicos, cada uno con:
  - type: "suspicious" | "warning" | "positive"
  - description: descripción del hallazgo
  - excerpt: fragmento de texto relevante (si aplica)
- recommendations: array de recomendaciones para el profesor`;

    const userPrompt = `Analiza el siguiente documento académico:

Título: ${title || 'Sin título'}

Contenido:
${content}

Proporciona un análisis detallado de originalidad y posible plagio.`;

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
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_originality",
              description: "Devuelve el informe de originalidad estructurado",
              parameters: {
                type: "object",
                properties: {
                  originalityScore: {
                    type: "number",
                    description: "Puntuación de originalidad entre 0-100"
                  },
                  risk: {
                    type: "string",
                    enum: ["bajo", "medio", "alto"],
                    description: "Nivel de riesgo de plagio"
                  },
                  summary: {
                    type: "string",
                    description: "Resumen ejecutivo del análisis"
                  },
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["suspicious", "warning", "positive"]
                        },
                        description: { type: "string" },
                        excerpt: { type: "string" }
                      },
                      required: ["type", "description"]
                    }
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["originalityScore", "risk", "summary", "findings", "recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "report_originality" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Límite de solicitudes excedido. Por favor, intenta de nuevo más tarde." 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Fondos insuficientes. Por favor, añade créditos a tu espacio de trabajo de Lovable AI." 
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      const errorText = await response.text();
      console.error("[check-plagiarism] Error del gateway AI:", response.status, errorText);
      throw new Error("Error al comunicarse con el servicio de IA");
    }

    const data = await response.json();
    console.log("[check-plagiarism] Respuesta recibida:", JSON.stringify(data));

    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "report_originality") {
      throw new Error("Respuesta inesperada del servicio de IA");
    }

    const report = JSON.parse(toolCall.function.arguments);
    
    console.log("[check-plagiarism] Informe generado:", {
      score: report.originalityScore,
      risk: report.risk,
      findingsCount: report.findings?.length || 0
    });

    return new Response(
      JSON.stringify({
        success: true,
        report
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("[check-plagiarism] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido al analizar el contenido" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
