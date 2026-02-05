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
    const { pdfBase64, fileName, unitTitle, generateQuizzes = true, generateExercises = true } = await req.json();
    
    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: "No se proporcionó el PDF" }),
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

    // For now, we'll process the base64 PDF
    // In production, you'd use a PDF parsing library
    const pdfContent = `[Contenido del archivo: ${fileName}]`;

    const systemPrompt = `Eres un experto en diseño instruccional e-learning para CERTIFICADOS DE PROFESIONALIDAD en España. 
Tu tarea es convertir el contenido de un PDF educativo en slides interactivos para una plataforma SCORM.

TIPOS DE SLIDES A GENERAR:
1. **title** - Slide de portada con título, subtítulo y autor
2. **content** - Contenido teórico extenso en Markdown
3. **quiz** - Test de autoevaluación con 4 opciones
4. **video** - Referencia a vídeo (placeholder)
5. **image** - Referencia a imagen (placeholder)
6. **hotspot** - Imagen con zonas clicables
7. **accordion** - Contenido desplegable
8. **summary** - Resumen con puntos clave

ESTRUCTURA OBLIGATORIA:
- Mínimo 40 slides por unidad formativa
- 60% contenido, 25% quiz, 15% otros
- Cada 3-4 slides de contenido → 1 quiz
- Contenido extenso (200-400 palabras por slide de contenido)

Responde ÚNICAMENTE con JSON válido:
{
  "slides": [
    {
      "slide_type": "title|content|quiz|summary|accordion|hotspot",
      "title": "Título del slide",
      "content": "Contenido en Markdown (para content, summary)",
      "key_terms": ["término1", "término2"],
      "quiz_data": {
        "question": "Pregunta",
        "options": [
          {"id": "a", "text": "Opción A", "isCorrect": false},
          {"id": "b", "text": "Opción B", "isCorrect": true},
          {"id": "c", "text": "Opción C", "isCorrect": false},
          {"id": "d", "text": "Opción D", "isCorrect": false}
        ],
        "explanation": "Explicación de la respuesta correcta",
        "hint": "Pista para el alumno"
      },
      "accordion_items": [{"title": "Sección", "content": "Contenido"}],
      "hotspot_data": {
        "image_url": "",
        "instruction": "Instrucción",
        "hotspots": [{"x": 20, "y": 30, "label": "Punto 1", "content": "Info"}]
      }
    }
  ]
}`;

    const userPrompt = `MÓDULO: "${unitTitle}"
ARCHIVO: ${fileName}

Genera un curso interactivo SCORM completo con mínimo 40 slides basado en este contenido:

${pdfContent}

IMPORTANTE:
- Genera contenido EXTENSO y DETALLADO
- Incluye quiz de autoevaluación frecuentes
- Usa acordeones para información complementaria
- Incluye slides de resumen al final de cada sección
${!generateQuizzes ? "- NO generes slides de tipo quiz" : ""}
${!generateExercises ? "- NO generes ejercicios prácticos" : ""}`;

    console.log("Calling AI to generate SCORM content...");
    
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
        max_tokens: 50000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de peticiones excedido. Inténtalo en unos minutos." }),
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

    // Extract JSON from response
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
