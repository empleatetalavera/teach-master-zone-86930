import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CourseContext {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  category?: string;
  level?: string;
}

interface ModuleContext {
  moduleId: string;
  moduleTitle: string;
  moduleDescription: string;
  moduleContent?: string;
  orderIndex: number;
}

interface PageContext {
  page: string;
  course?: CourseContext;
  module?: ModuleContext;
}

export const usePageContext = (): PageContext => {
  const location = useLocation();
  const params = useParams();
  const [context, setContext] = useState<PageContext>({ page: "/" });

  useEffect(() => {
    const loadContext = async () => {
      const path = location.pathname;
      let newContext: PageContext = { page: path };

      // Detect course context
      if (params.courseId) {
        try {
          const { data: course } = await supabase
            .from("courses")
            .select("id, title, description, category, level")
            .eq("id", params.courseId)
            .single();

          if (course) {
            newContext.course = {
              courseId: course.id,
              courseTitle: course.title,
              courseDescription: course.description || "",
              category: course.category || undefined,
              level: course.level || undefined,
            };
          }
        } catch (error) {
          console.error("Error loading course context:", error);
        }
      }

      // Detect module context
      if (params.moduleId && newContext.course) {
        try {
          const { data: module } = await supabase
            .from("modules")
            .select("id, title, description, content, order_index")
            .eq("id", params.moduleId)
            .single();

          if (module) {
            newContext.module = {
              moduleId: module.id,
              moduleTitle: module.title,
              moduleDescription: module.description || "",
              moduleContent: module.content || undefined,
              orderIndex: module.order_index,
            };
          }
        } catch (error) {
          console.error("Error loading module context:", error);
        }
      }

      setContext(newContext);
    };

    loadContext();
  }, [location.pathname, params.courseId, params.moduleId]);

  return context;
};
