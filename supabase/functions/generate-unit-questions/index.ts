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
    const { courseId, formativeUnitId, formativeUnitTitle, numberOfQuestions = 15 } = await req.json();

    if (!courseId || !formativeUnitId) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros obligatorios" }),
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get formative unit content
    const { data: unit } = await supabase
      .from("formative_units")
      .select("title, description, content, objectives")
      .eq("id", formativeUnitId)
      .single();

    // Get syllabus slides for this unit
    const { data: slides } = await supabase
      .from("unit_syllabus_slides")
      .select("title, content, key_terms, slide_type")
      .eq("formative_unit_id", formativeUnitId)
      .eq("is_active", true)
      .order("order_index");

    let unitContent = "";
    if (unit) {
      if (unit.objectives) unitContent += `Objetivos: ${unit.objectives}\n`;
      if (unit.description) unitContent += `${unit.description}\n`;
      if (unit.content) unitContent += `${unit.content}\n`;
    }

    if (slides && slides.length > 0) {
      for (const slide of slides) {
        if (slide.content) unitContent += `\n### ${slide.title}\n${slide.content}\n`;
        if (slide.key_terms?.length > 0) unitContent += `Términos clave: ${slide.key_terms.join(", ")}\n`;
      }
    }

    if (!unitContent.trim()) {
      unitContent = `Unidad Formativa: ${formativeUnitTitle}\n\nGenera preguntas genéricas pero relevantes para esta unidad de formación profesional.`;
    }

    // Truncate if too long
    if (unitContent.length > 20000) {
      unitContent = unitContent.substring(0, 20000) + "\n...[contenido truncado]";
    }

    const systemPrompt = `Eres un experto en evaluación educativa. Genera preguntas de test de opción múltiple basadas en el contenido proporcionado.

REGLAS:
1. Genera exactamente ${numberOfQuestions} preguntas
2. Cada pregunta tiene 4 opciones (a, b, c, d), solo UNA correcta
3. Diferentes niveles: conocimiento, comprensión, aplicación
4. Preguntas claras, sin ambigüedades
5. Evita "todas las anteriores" o "ninguna de las anteriores"
6. Distribuye respuestas correctas aleatoriamente entre a, b, c, d
7. Las explicaciones deben ser BREVES (máximo 1 frase)
8. Las opciones deben ser CONCISAS (máximo 15 palabras cada una)

Responde ÚNICAMENTE con JSON válido (sin markdown, sin backticks):
{"questions":[{"id":"q1","question":"...","options":[{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],"correctOptionId":"b","explanation":"..."}]}`;

    const userPrompt = `Unidad Formativa: "${formativeUnitTitle}"

Contenido:
${unitContent}

Genera ${numberOfQuestions} preguntas de evaluación basadas en este contenido.`;

    console.log("Generating", numberOfQuestions, "questions for unit:", formativeUnitTitle);

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
          JSON.stringify({ error: "Límite de peticiones excedido. Inténtalo en unos minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error al generar preguntas con IA" }),
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

    // Parse JSON from response
    let jsonContent = content.trim();
    // Remove markdown code blocks if present
    const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(jsonContent);
    } catch {
      // Try to salvage truncated JSON by finding last complete question
      let salvaged = false;
      // Find positions of all "explanation" keys followed by a value and closing brace
      const expMatches = [...jsonContent.matchAll(/"explanation"\s*:\s*"[^"]*"\s*\}/g)];
      if (expMatches.length > 0) {
        const lastMatch = expMatches[expMatches.length - 1];
        const cutPos = lastMatch.index! + lastMatch[0].length;
        const trimmed = jsonContent.substring(0, cutPos) + "]}";
        try {
          parsedQuestions = JSON.parse(trimmed);
          salvaged = true;
          console.log(`Salvaged truncated JSON with ${parsedQuestions.questions?.length || 0} questions`);
        } catch { /* fall through */ }
      }
      if (!salvaged) {
        console.error("JSON parse error, content:", content.substring(0, 500));
        return new Response(
          JSON.stringify({ error: "Error al parsear la respuesta de la IA. Inténtalo de nuevo." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const questions = (parsedQuestions.questions || []).filter((q: any) =>
      q.id && q.question && q.options?.length === 4 && q.correctOptionId && q.explanation
    );

    // Delete existing questions for this unit
    await supabase
      .from("self_assessment_questions")
      .delete()
      .eq("course_id", courseId)
      .eq("formative_unit_id", formativeUnitId);

    // Insert new questions
    const rows = questions.map((q: any, i: number) => ({
      course_id: courseId,
      formative_unit_id: formativeUnitId,
      question_text: q.question,
      options: q.options,
      correct_option_id: q.correctOptionId,
      explanation: q.explanation,
      order_index: i + 1,
      is_active: true,
    }));

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("self_assessment_questions")
        .insert(rows);

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Error al guardar las preguntas" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Saved ${rows.length} questions for unit ${formativeUnitTitle}`);

    return new Response(
      JSON.stringify({ success: true, questionCount: rows.length }),
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
