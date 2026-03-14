import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      pdfUrl, 
      pdfBase64, 
      fileName, 
      unitTitle, 
      formativeUnitId,
      courseId,
      generateSlides = true,
      generateActivities = true,
      generateTests = true,
      pdfTextContent // Pre-extracted text content from PDF
    } = await req.json();
    
    if (!unitTitle) {
      return new Response(
        JSON.stringify({ error: "Se requiere el título de la unidad" }),
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

    // Use provided text content, or try to get it from existing slides/content
    let contentText = pdfTextContent || "";
    
    if (!contentText && formativeUnitId) {
      // Try to get existing content from the formative unit
      const { data: unit } = await supabase
        .from("formative_units")
        .select("title, description, content, objectives")
        .eq("id", formativeUnitId)
        .single();
      
      if (unit) {
        if (unit.objectives) contentText += `Objetivos: ${unit.objectives}\n`;
        if (unit.description) contentText += `${unit.description}\n`;
        if (unit.content) contentText += `${unit.content}\n`;
      }

      // Get existing slides content
      const { data: existingSlides } = await supabase
        .from("unit_syllabus_slides")
        .select("title, content, key_terms, slide_type")
        .eq("formative_unit_id", formativeUnitId)
        .eq("is_active", true)
        .order("order_index");

      if (existingSlides && existingSlides.length > 0) {
        for (const slide of existingSlides) {
          if (slide.content) contentText += `\n### ${slide.title}\n${slide.content}\n`;
        }
      }
    }

    if (!contentText || contentText.trim().length < 100) {
      return new Response(
        JSON.stringify({ error: "No hay suficiente contenido para generar material. Sube primero el manual PDF o proporciona el texto." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trim content to fit in context window (approx 80k chars ~ 20k tokens)
    const maxChars = 80000;
    if (contentText.length > maxChars) {
      contentText = contentText.substring(0, maxChars);
    }

    const results: any = {};

    // ===== 1. GENERATE INTERACTIVE SCORM SLIDES =====
    if (generateSlides) {
      console.log("Generating SCORM slides...");
      const slidesPrompt = `Eres un experto en diseño instruccional e-learning para CERTIFICADOS DE PROFESIONALIDAD en España.
Convierte el contenido en slides interactivos SCORM.

TIPOS DE SLIDES:
1. "title" - Portada con título y subtítulo
2. "content" - Contenido teórico extenso en Markdown (200-400 palabras)
3. "quiz" - Test de autoevaluación con 4 opciones
4. "accordion" - Contenido desplegable para profundizar
5. "summary" - Resumen con puntos clave
6. "tabs" - Contenido organizado en pestañas

ESTRUCTURA OBLIGATORIA:
- Mínimo 80 slides
- 60% contenido teórico, 25% quiz, 15% otros (accordion, summary, tabs)
- Cada 3-4 slides de contenido → 1 quiz
- Contenido extenso y detallado (NO resúmenes superficiales)
- Cubre TODO el temario del PDF sin omitir secciones

Responde SOLO con JSON válido (sin markdown ni backticks):
{"slides":[{"slide_type":"title|content|quiz|summary|accordion|tabs","title":"...","content":"contenido en markdown","key_terms":["t1","t2"],"quiz_data":{"question":"...","options":[{"id":"a","text":"...","isCorrect":false},{"id":"b","text":"...","isCorrect":true},{"id":"c","text":"...","isCorrect":false},{"id":"d","text":"...","isCorrect":false}],"explanation":"...","hint":"..."},"accordion_items":[{"title":"...","content":"..."}],"tabs_data":[{"title":"...","content":"..."}]}]}`;

      const slidesResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: slidesPrompt },
            { role: "user", content: `UNIDAD DIDÁCTICA: "${unitTitle}"\n\nCONTENIDO COMPLETO DEL MANUAL:\n\n${contentText}` },
          ],
          temperature: 0.5,
        }),
      });

      if (!slidesResponse.ok) {
        const status = slidesResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Límite de peticiones excedido. Inténtalo en unos minutos." }), 
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), 
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        console.error("Slides AI error:", slidesResponse.status);
      } else {
        const aiResp = await slidesResponse.json();
        const raw = aiResp.choices?.[0]?.message?.content || "";
        try {
          let jsonStr = raw;
          if (jsonStr.includes("```json")) jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
          else if (jsonStr.includes("```")) jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
          
          // Handle truncated JSON - find last complete slide
          if (!jsonStr.endsWith("]}")) {
            const lastExplanation = jsonStr.lastIndexOf('"explanation"');
            const lastHint = jsonStr.lastIndexOf('"hint"');
            const lastKeyTerms = jsonStr.lastIndexOf('"key_terms"');
            const cutPoint = Math.max(lastExplanation, lastHint, lastKeyTerms);
            if (cutPoint > 0) {
              // Find the closing of the current slide object after cutPoint
              let braceCount = 0;
              let endIdx = cutPoint;
              for (let i = cutPoint; i < jsonStr.length; i++) {
                if (jsonStr[i] === '{') braceCount++;
                if (jsonStr[i] === '}') {
                  braceCount--;
                  if (braceCount <= -1) { endIdx = i + 1; break; }
                }
              }
              jsonStr = jsonStr.substring(0, endIdx) + "]}";
            }
          }
          
          const parsed = JSON.parse(jsonStr);
          results.slides = parsed.slides || [];
          console.log(`Generated ${results.slides.length} slides`);
        } catch (e) {
          console.error("Error parsing slides JSON:", e);
          results.slidesError = "Error al parsear las diapositivas generadas";
        }
      }
    }

    // ===== 2. GENERATE DEVELOPMENT ACTIVITIES =====
    if (generateActivities) {
      console.log("Generating development activities...");
      const activitiesPrompt = `Eres un experto en diseño de actividades de aprendizaje para certificados de profesionalidad en España.
Genera actividades de desarrollo (casos prácticos, ejercicios, supuestos) basadas en el contenido del manual.

REQUISITOS:
- Genera entre 3 y 5 actividades de desarrollo
- Cada actividad debe ser un caso práctico realista y aplicado
- Incluye instrucciones detalladas, contexto del caso y criterios de evaluación
- Las actividades deben cubrir diferentes niveles de complejidad
- Vincula cada actividad a competencias profesionales del temario

Responde SOLO con JSON válido (sin markdown):
{"activities":[{"title":"Título de la actividad","description":"Descripción breve","instructions":"Instrucciones detalladas del caso práctico y qué debe hacer el alumno (mín 200 palabras)","evaluation_criteria":["criterio1","criterio2","criterio3"],"estimated_hours":2,"difficulty":"basico|intermedio|avanzado","competences":["competencia1","competencia2"]}]}`;

      const actResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: activitiesPrompt },
            { role: "user", content: `UNIDAD DIDÁCTICA: "${unitTitle}"\n\nCONTENIDO:\n\n${contentText.substring(0, 40000)}` },
          ],
          temperature: 0.6,
        }),
      });

      if (actResponse.ok) {
        const aiResp = await actResponse.json();
        const raw = aiResp.choices?.[0]?.message?.content || "";
        try {
          let jsonStr = raw;
          if (jsonStr.includes("```json")) jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
          else if (jsonStr.includes("```")) jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
          const parsed = JSON.parse(jsonStr);
          results.activities = parsed.activities || [];
          console.log(`Generated ${results.activities.length} activities`);
        } catch (e) {
          console.error("Error parsing activities:", e);
          results.activitiesError = "Error al parsear las actividades";
        }
      }
    }

    // ===== 3. GENERATE EVALUATION TESTS =====
    if (generateTests) {
      console.log("Generating evaluation tests...");
      const testsPrompt = `Eres un experto en evaluación para certificados de profesionalidad en España.
Genera preguntas tipo test de evaluación basadas en el contenido del manual.

REQUISITOS:
- Genera exactamente 20 preguntas tipo test
- Cada pregunta debe tener 4 opciones (solo una correcta)
- Las preguntas deben cubrir todo el temario de la unidad
- Incluye preguntas de diferentes niveles: conocimiento, comprensión y aplicación
- La explicación debe ser pedagógica y útil para el alumno

Responde SOLO con JSON válido (sin markdown):
{"questions":[{"question":"Texto de la pregunta","options":[{"id":"a","text":"Opción A","isCorrect":false},{"id":"b","text":"Opción B","isCorrect":true},{"id":"c","text":"Opción C","isCorrect":false},{"id":"d","text":"Opción D","isCorrect":false}],"explanation":"Explicación de por qué la respuesta correcta es correcta","difficulty":"facil|media|dificil","topic":"Tema o sección del temario"}]}`;

      const testResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: testsPrompt },
            { role: "user", content: `UNIDAD DIDÁCTICA: "${unitTitle}"\n\nCONTENIDO:\n\n${contentText.substring(0, 40000)}` },
          ],
          temperature: 0.4,
        }),
      });

      if (testResponse.ok) {
        const aiResp = await testResponse.json();
        const raw = aiResp.choices?.[0]?.message?.content || "";
        try {
          let jsonStr = raw;
          if (jsonStr.includes("```json")) jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
          else if (jsonStr.includes("```")) jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
          
          // Handle truncated JSON for questions
          if (!jsonStr.endsWith("]}")) {
            const lastExpl = jsonStr.lastIndexOf('"explanation"');
            if (lastExpl > 0) {
              let braceCount = 0;
              let endIdx = lastExpl;
              for (let i = lastExpl; i < jsonStr.length; i++) {
                if (jsonStr[i] === '{') braceCount++;
                if (jsonStr[i] === '}') {
                  braceCount--;
                  if (braceCount <= -1) { endIdx = i + 1; break; }
                }
              }
              jsonStr = jsonStr.substring(0, endIdx) + "]}";
            }
          }
          
          const parsed = JSON.parse(jsonStr);
          results.questions = parsed.questions || [];
          console.log(`Generated ${results.questions.length} questions`);
        } catch (e) {
          console.error("Error parsing tests:", e);
          results.testsError = "Error al parsear los tests";
        }
      }
    }

    // ===== SAVE TO DATABASE =====
    if (formativeUnitId && courseId) {
      // Save slides to unit_syllabus_slides
      if (results.slides && results.slides.length > 0) {
        // Delete existing slides for this unit
        await supabase
          .from("unit_syllabus_slides")
          .delete()
          .eq("formative_unit_id", formativeUnitId);

        const slidesToInsert = results.slides.map((slide: any, idx: number) => ({
          formative_unit_id: formativeUnitId,
          order_index: idx + 1,
          slide_type: slide.slide_type || "content",
          title: slide.title || `Slide ${idx + 1}`,
          content: slide.content || "",
          key_terms: slide.key_terms || [],
          quiz_data: slide.quiz_data || null,
          is_active: true,
        }));

        const { error: slidesErr } = await supabase
          .from("unit_syllabus_slides")
          .insert(slidesToInsert);
        
        if (slidesErr) console.error("Error saving slides:", slidesErr);
        else console.log(`Saved ${slidesToInsert.length} slides to DB`);
      }

      // Save activities to development_activities
      if (results.activities && results.activities.length > 0) {
        const activitiesToInsert = results.activities.map((act: any) => ({
          course_id: courseId,
          formative_unit_id: formativeUnitId,
          title: act.title,
          description: act.description || "",
          instructions: act.instructions || "",
          submission_type: "file",
          max_score: 100,
          is_active: true,
        }));

        const { error: actErr } = await supabase
          .from("development_activities")
          .insert(activitiesToInsert);
        
        if (actErr) console.error("Error saving activities:", actErr);
        else console.log(`Saved ${activitiesToInsert.length} activities to DB`);
      }

      // Save questions to self_assessment_questions
      if (results.questions && results.questions.length > 0) {
        const questionsToInsert = results.questions.map((q: any, idx: number) => ({
          course_id: courseId,
          formative_unit_id: formativeUnitId,
          question_text: q.question,
          option_a: q.options?.[0]?.text || "",
          option_b: q.options?.[1]?.text || "",
          option_c: q.options?.[2]?.text || "",
          option_d: q.options?.[3]?.text || "",
          correct_option: q.options?.findIndex((o: any) => o.isCorrect) === 0 ? "a" 
            : q.options?.findIndex((o: any) => o.isCorrect) === 1 ? "b"
            : q.options?.findIndex((o: any) => o.isCorrect) === 2 ? "c" : "d",
          explanation: q.explanation || "",
          order_index: idx + 1,
          is_active: true,
        }));

        // Delete existing questions for this unit
        await supabase
          .from("self_assessment_questions")
          .delete()
          .eq("formative_unit_id", formativeUnitId);

        const { error: qErr } = await supabase
          .from("self_assessment_questions")
          .insert(questionsToInsert);
        
        if (qErr) console.error("Error saving questions:", qErr);
        else console.log(`Saved ${questionsToInsert.length} questions to DB`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        slides: results.slides || [],
        slideCount: results.slides?.length || 0,
        activities: results.activities || [],
        activityCount: results.activities?.length || 0,
        questions: results.questions || [],
        questionCount: results.questions?.length || 0,
        errors: {
          slides: results.slidesError,
          activities: results.activitiesError,
          tests: results.testsError,
        }
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
