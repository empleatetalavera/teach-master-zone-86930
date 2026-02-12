import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moduleId, moduleTitle, numberOfQuestions = 30 } = await req.json();
    
    if (!moduleId) {
      return new Response(
        JSON.stringify({ error: "No se proporcionó el ID del módulo" }),
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

    // Initialize Supabase client to fetch module content
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch module content: formative units and their syllabus slides
    const { data: formativeUnits, error: unitsError } = await supabase
      .from("formative_units")
      .select(`
        id,
        title,
        description,
        content,
        objectives
      `)
      .eq("module_id", moduleId)
      .eq("is_active", true)
      .order("order_index");

    let moduleContent = "";
    let unitTitles: string[] = [];

    if (formativeUnits && formativeUnits.length > 0) {
      for (const unit of formativeUnits) {
        unitTitles.push(unit.title);
        moduleContent += `\n\n## ${unit.title}\n`;
        if (unit.description) moduleContent += `${unit.description}\n`;
        if (unit.objectives) moduleContent += `Objetivos: ${unit.objectives}\n`;
        if (unit.content) moduleContent += `${unit.content}\n`;

        // Fetch syllabus slides for this unit
        const { data: slides } = await supabase
          .from("unit_syllabus_slides")
          .select("title, content, key_terms, slide_type")
          .eq("formative_unit_id", unit.id)
          .eq("is_active", true)
          .order("order_index");

        if (slides && slides.length > 0) {
          for (const slide of slides) {
            if (slide.content) {
              moduleContent += `\n### ${slide.title}\n${slide.content}\n`;
            }
            if (slide.key_terms && slide.key_terms.length > 0) {
              moduleContent += `Términos clave: ${slide.key_terms.join(", ")}\n`;
            }
          }
        }
      }
    }

    // Also fetch module direct content if available
    const { data: moduleData } = await supabase
      .from("modules")
      .select("title, description, content, objectives")
      .eq("id", moduleId)
      .single();

    if (moduleData) {
      if (moduleData.description) moduleContent = `Descripción: ${moduleData.description}\n` + moduleContent;
      if (moduleData.objectives) moduleContent = `Objetivos del módulo: ${moduleData.objectives}\n` + moduleContent;
      if (moduleData.content) moduleContent += `\nContenido adicional: ${moduleData.content}\n`;
    }

    // If no content found, generate generic questions with module title context
    if (!moduleContent.trim()) {
      moduleContent = `Módulo: ${moduleTitle}\n\nGenera preguntas genéricas pero relevantes para un módulo de formación profesional con este título.`;
    }

    // Truncate content if too long
    const maxContentLength = 25000;
    if (moduleContent.length > maxContentLength) {
      moduleContent = moduleContent.substring(0, maxContentLength) + "\n...[contenido truncado]";
    }

    const systemPrompt = `Eres un experto en evaluación educativa y diseño de tests para formación profesional. Tu tarea es generar preguntas de test de opción múltiple basadas en el contenido proporcionado.

REGLAS ESTRICTAS:
1. Genera exactamente ${numberOfQuestions} preguntas
2. Cada pregunta debe tener 4 opciones (a, b, c, d)
3. Solo UNA opción es correcta
4. Las preguntas deben cubrir TODO el contenido proporcionado de forma equilibrada
5. Incluye preguntas de diferentes niveles: conocimiento, comprensión, aplicación
6. Las explicaciones deben ser educativas y ayudar al aprendizaje
7. Las preguntas deben ser claras, sin ambigüedades
8. Evita preguntas con "todas las anteriores" o "ninguna de las anteriores"
9. Distribuye las respuestas correctas de forma aleatoria entre a, b, c, d

Si hay varias unidades formativas, distribuye las preguntas entre todas ellas.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "questions": [
    {
      "id": "q1",
      "question": "Texto de la pregunta",
      "options": [
        { "id": "a", "text": "Opción A" },
        { "id": "b", "text": "Opción B" },
        { "id": "c", "text": "Opción C" },
        { "id": "d", "text": "Opción D" }
      ],
      "correctOptionId": "b",
      "explanation": "Explicación detallada de por qué esta es la respuesta correcta y por qué las otras son incorrectas.",
      "unit": "Nombre de la unidad formativa o 'General'"
    }
  ]
}`;

    const userPrompt = `Módulo: "${moduleTitle}"
${unitTitles.length > 0 ? `Unidades formativas: ${unitTitles.join(", ")}` : ""}

Contenido del módulo para basar las preguntas:

${moduleContent}

Genera ${numberOfQuestions} preguntas de evaluación basadas en este contenido. Las preguntas deben evaluar la comprensión real del alumno sobre los conceptos presentados.`;

    console.log("Generating questions with AI for module:", moduleTitle);
    console.log("Content length:", moduleContent.length);
    
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
        max_tokens: 32000,
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

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content received:", content.substring(0, 1000));
      return new Response(
        JSON.stringify({ error: "Error al parsear la respuesta de la IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate questions structure
    const questions = parsedQuestions.questions || [];
    const validQuestions = questions.filter((q: any) => 
      q.id && q.question && q.options && Array.isArray(q.options) && 
      q.options.length === 4 && q.correctOptionId && q.explanation
    );

    console.log(`Generated ${validQuestions.length} valid questions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        questions: validQuestions,
        questionCount: validQuestions.length,
        unitsIncluded: unitTitles
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
