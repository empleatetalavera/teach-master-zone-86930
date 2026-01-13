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
    const { pdfContent, unitTitle, generateQuizzes = true, generateExercises = true } = await req.json();
    
    if (!pdfContent) {
      return new Response(
        JSON.stringify({ error: "No se proporcionó contenido del PDF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY no está configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Eres un experto en diseño instruccional y e-learning. Tu tarea es convertir el contenido de un documento PDF educativo en una estructura de slides interactivos para una plataforma de formación online.

IMPORTANTE: Debes generar contenido EXTENSO y DETALLADO. Cada slide de contenido debe tener varios párrafos explicativos.

Para cada sección del contenido, debes crear slides de diferentes tipos:

1. **intro** - Slide de introducción con objetivos y resumen del tema
2. **content** - Slides de contenido teórico con explicaciones detalladas en Markdown (usa ##, ###, **negrita**, *cursiva*, listas, etc.)
3. **quiz** - Tests de autoevaluación con 4 opciones (solo una correcta) y explicación de la respuesta
4. **table** - Tablas comparativas o de datos cuando sea apropiado
5. **checklist** - Listas de verificación para procedimientos o pasos
6. **exercise** - Ejercicios prácticos para el alumno
7. **summary** - Resumen de conceptos clave

REGLAS:
- Genera MÍNIMO 15-20 slides por unidad
- Los slides de contenido deben ser EXTENSOS (mínimo 200 palabras cada uno)
- Incluye términos clave (key_terms) en cada slide
- Los quiz deben tener 4 opciones, solo 1 correcta, con explicación detallada
- Usa Markdown rico en los contenidos
- Las tablas deben tener headers y múltiples filas de datos
- Los ejercicios deben ser prácticos y aplicables

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "slides": [
    {
      "slide_type": "intro|content|quiz|table|checklist|exercise|summary",
      "title": "Título del slide",
      "section_title": "Nombre de la sección",
      "content": "Contenido en Markdown (para intro, content, exercise, summary)",
      "key_terms": ["término1", "término2"],
      "table_data": { "headers": ["Col1", "Col2"], "rows": [["dato1", "dato2"]] },
      "quiz_data": { 
        "question": "Pregunta", 
        "options": [
          {"id": "a", "text": "Opción A", "isCorrect": false},
          {"id": "b", "text": "Opción B", "isCorrect": true},
          {"id": "c", "text": "Opción C", "isCorrect": false},
          {"id": "d", "text": "Opción D", "isCorrect": false}
        ],
        "explanation": "Explicación de por qué la respuesta correcta es...",
        "hint": "Pista opcional"
      },
      "checklist_items": [{"id": "1", "text": "Paso 1"}, {"id": "2", "text": "Paso 2"}]
    }
  ]
}

Solo incluye los campos relevantes para cada tipo de slide. Por ejemplo, un slide de tipo "content" no necesita quiz_data ni table_data.`;

    const userPrompt = `Unidad formativa: "${unitTitle}"

Contenido del PDF a convertir:

${pdfContent}

${!generateQuizzes ? "NOTA: No generes slides de tipo quiz." : ""}
${!generateExercises ? "NOTA: No generes slides de tipo exercise." : ""}

Genera los slides interactivos siguiendo las instrucciones del sistema. Recuerda: contenido EXTENSO y DETALLADO.`;

    console.log("Calling Lovable AI Gateway...");
    
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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de peticiones excedido. Inténtalo de nuevo en unos minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Contacta al administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error al procesar con IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: "No se recibió respuesta de la IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI Response received, parsing JSON...");

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes("```json")) {
      jsonContent = content.split("```json")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      jsonContent = content.split("```")[1].split("```")[0].trim();
    }

    let parsedSlides;
    try {
      parsedSlides = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content received:", content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Error al parsear la respuesta de la IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        slides: parsedSlides.slides,
        slideCount: parsedSlides.slides?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
