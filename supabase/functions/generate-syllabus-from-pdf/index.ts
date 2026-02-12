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

    const systemPrompt = `Eres un experto en diseño instruccional y e-learning para CERTIFICADOS DE PROFESIONALIDAD en España. Tu tarea es convertir el contenido de un documento PDF educativo en una estructura de slides interactivos EXHAUSTIVA y COMPLETA para una plataforma de formación online homologada por el SEPE.

CONTEXTO CRÍTICO: Este contenido es para un CERTIFICADO DE PROFESIONALIDAD oficial del sistema de Formación Profesional para el Empleo en España. El contenido debe ser:
- EXTENSO: Mínimo 80-120 slides por módulo formativo
- COMPLETO: Cubrir TODO el temario del PDF sin omitir nada
- DETALLADO: Cada concepto debe desarrollarse en profundidad
- PEDAGÓGICO: Incluir ejemplos, casos prácticos, autoevaluaciones frecuentes

TIPOS DE SLIDES A GENERAR:

1. **intro** - Slides de introducción con:
   - Objetivos de aprendizaje SMART
   - Competencias a desarrollar
   - Mapa conceptual del tema
   - Relación con otras unidades

2. **content** - Slides de contenido teórico EXTENSOS con:
   - Mínimo 300-500 palabras por slide
   - Uso rico de Markdown (##, ###, **negrita**, *cursiva*, listas, bloques de código)
   - Ejemplos prácticos del mundo laboral
   - Citas normativas cuando aplique
   - Definiciones precisas de términos técnicos

3. **quiz** - Tests de autoevaluación con:
   - 4 opciones (solo una correcta)
   - Preguntas que evalúen comprensión, no memorización
   - Explicación detallada de por qué cada opción es correcta/incorrecta
   - Pista pedagógica

4. **table** - Tablas comparativas con:
   - Headers claros y descriptivos
   - Múltiples filas de datos (mínimo 4-5)
   - Contenido útil para el estudio

5. **checklist** - Listas de verificación para:
   - Procedimientos paso a paso
   - Protocolos de actuación
   - Requisitos legales

6. **exercise** - Ejercicios prácticos con:
   - Supuestos prácticos realistas
   - Instrucciones detalladas
   - Criterios de evaluación

7. **summary** - Resúmenes con:
   - Conceptos clave en formato esquemático
   - Relaciones entre conceptos
   - Puntos importantes para el examen

ESTRUCTURA OBLIGATORIA PARA CERTIFICADOS PROFESIONALES:
- Por cada TEMA/UNIDAD del PDF: 15-25 slides
- Ratio obligatorio: 60% contenido, 20% quizzes, 10% ejercicios, 10% tablas/checklists
- Cada 3-4 slides de contenido → 1 quiz de autoevaluación
- Cada tema → mínimo 1 ejercicio práctico
- Cada tema → 1 resumen final

REGLAS ESTRICTAS:
- Genera MÍNIMO 80 slides para un módulo completo
- Los slides de contenido deben ser EXTENSOS (300-500 palabras cada uno)
- Incluye SIEMPRE términos clave (key_terms) con 3-5 términos por slide
- Los quiz deben tener explicaciones de 50+ palabras
- Las tablas deben tener headers y mínimo 4-5 filas de datos útiles
- Los ejercicios deben ser aplicables al entorno laboral real
- NO OMITAS contenido del PDF original

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "slides": [
    {
      "slide_type": "intro|content|quiz|table|checklist|exercise|summary",
      "title": "Título descriptivo del slide",
      "section_title": "Nombre de la sección/tema",
      "content": "Contenido EXTENSO en Markdown (para intro, content, exercise, summary)",
      "key_terms": ["término1", "término2", "término3"],
      "table_data": { "headers": ["Col1", "Col2", "Col3"], "rows": [["dato1", "dato2", "dato3"], ...] },
      "quiz_data": { 
        "question": "Pregunta clara y precisa", 
        "options": [
          {"id": "a", "text": "Opción A detallada", "isCorrect": false},
          {"id": "b", "text": "Opción B detallada", "isCorrect": true},
          {"id": "c", "text": "Opción C detallada", "isCorrect": false},
          {"id": "d", "text": "Opción D detallada", "isCorrect": false}
        ],
        "explanation": "Explicación pedagógica completa de 50+ palabras...",
        "hint": "Pista para orientar al alumno"
      },
      "checklist_items": [{"id": "1", "text": "Paso detallado 1"}, ...]
    }
  ]
}`;

    const userPrompt = `CERTIFICADO DE PROFESIONALIDAD - Módulo: "${unitTitle}"

INSTRUCCIONES CRÍTICAS:
1. Analiza TODO el contenido del PDF proporcionado
2. Genera MÍNIMO 80 slides interactivos que cubran TODO el temario
3. NO OMITAS ningún tema o concepto del PDF
4. Cada sección del PDF debe tener múltiples slides de contenido + quizzes

Contenido del PDF a convertir en slides interactivos:

${pdfContent}

${!generateQuizzes ? "NOTA: No generes slides de tipo quiz." : "Genera quiz de autoevaluación cada 3-4 slides de contenido."}
${!generateExercises ? "NOTA: No generes slides de tipo exercise." : "Genera ejercicios prácticos para cada tema principal."}

RECUERDA: 
- Mínimo 80 slides para el módulo completo
- Contenido EXTENSO y DETALLADO (300-500 palabras por slide de contenido)
- Cubre TODO el temario sin omisiones
- Incluye términos clave en cada slide`;

    console.log("Calling Lovable AI Gateway with extended generation...");
    
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
        max_tokens: 30000,
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
