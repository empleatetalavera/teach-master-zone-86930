import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Compass, Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface StudentCourse {
  id: string;
  title: string;
  student_guide_pdf_url: string | null;
}

async function downloadFromUrl(url: string, filename: string) {
  // Use blob delivery to bypass popup blockers (project rule)
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo descargar el archivo");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export default function StudentGuides() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [center, setCenter] = useState<{
    id: string;
    name: string;
    logo_url: string | null;
    primary_color: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    navigation_guide_pdf_url: string | null;
  } | null>(null);
  const [downloadingNav, setDownloadingNav] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("training_center_id")
          .eq("id", user.id)
          .single();

        if (profile?.training_center_id) {
          const { data: centerData } = await supabase
            .from("training_centers")
            .select(
              "id, name, logo_url, primary_color, contact_email, contact_phone, navigation_guide_pdf_url"
            )
            .eq("id", profile.training_center_id)
            .maybeSingle();
          if (centerData) setCenter(centerData as any);
        }

        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("courses(id, title, student_guide_pdf_url)")
          .eq("user_id", user.id);

        const list = (enrollments ?? [])
          .map((e: any) => e.courses)
          .filter(Boolean) as StudentCourse[];
        // dedupe by id
        const seen = new Set<string>();
        setCourses(
          list.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleDownloadNavigationGuide = async () => {
    setDownloadingNav(true);
    try {
      if (center?.navigation_guide_pdf_url) {
        await downloadFromUrl(
          center.navigation_guide_pdf_url,
          "guia-navegacion.pdf"
        );
      } else {
        const { generateCIMNavigationGuidePDF } = await import(
          "@/lib/generateCIMNavigationGuidePDF"
        );
        await generateCIMNavigationGuidePDF({
          centerName: center?.name || "Centro de Formación",
          centerLogo: center?.logo_url || undefined,
          primaryColor: center?.primary_color || undefined,
          contactEmail: center?.contact_email || undefined,
          contactPhone: center?.contact_phone || undefined,
        });
      }
    } catch (e: any) {
      toast.error(e?.message || "No se pudo descargar la guía");
    } finally {
      setDownloadingNav(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Guías y ayuda</h1>
        <p className="text-muted-foreground mt-2">
          Descarga las guías necesarias para usar la plataforma y tus cursos.
        </p>
      </div>

      {/* Sección 1: Guía de Navegación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Guía de Navegación de la plataforma
          </CardTitle>
          <CardDescription>Esta guía explica cómo usar la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <Button
              onClick={handleDownloadNavigationGuide}
              disabled={downloadingNav}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {downloadingNav ? "Descargando..." : "Descargar PDF"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sección 2: Guías de mis cursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Guías de mis cursos
          </CardTitle>
          <CardDescription>
            Guía del Alumno específica de cada curso en el que estás inscrito.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 opacity-40" />
              <p className="text-sm">Aún no estás inscrito en ningún curso.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{course.title}</p>
                  </div>
                  {course.student_guide_pdf_url ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 shrink-0"
                      onClick={() =>
                        downloadFromUrl(
                          course.student_guide_pdf_url!,
                          `guia-alumno-${course.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")}.pdf`
                        ).catch((e) =>
                          toast.error(e?.message || "Error al descargar")
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                      Descargar Guía del Alumno
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground shrink-0">
                      Aún no disponible
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
