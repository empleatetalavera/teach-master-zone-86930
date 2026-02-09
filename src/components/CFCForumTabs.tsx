import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForum } from "@/components/CourseForum";
import { MessageSquare, Wrench, FileText, HelpCircle } from "lucide-react";

interface CFCForumTabsProps {
  courseId: string;
  isAdmin?: boolean;
  isTeacher?: boolean;
}

/**
 * CFC mandatory forums:
 * 1. Foro de participación formativa (debate, preguntas, reflexiones)
 * 2. Foro de ayuda técnica (problemas técnicos)
 * 3. Foro de apoyo administrativo (gestión, certificados, plazos)
 */
export function CFCForumTabs({ courseId, isAdmin = false, isTeacher = false }: CFCForumTabsProps) {
  const isEditable = isAdmin || isTeacher;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Foros del Curso
        </CardTitle>
        <CardDescription>
          El tutor responderá en un máximo de 48 horas. Participación obligatoria en el foro formativo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="formative" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="formative" className="gap-1 text-xs">
              <HelpCircle className="h-3 w-3" />
              Formativo
            </TabsTrigger>
            <TabsTrigger value="technical" className="gap-1 text-xs">
              <Wrench className="h-3 w-3" />
              Ayuda Técnica
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-1 text-xs">
              <FileText className="h-3 w-3" />
              Administrativo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="formative">
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 text-xs text-blue-700 dark:text-blue-300">
              <strong>Foro de participación formativa:</strong> Pregunta, aclara, debate y reflexiona sobre los temas del curso.
              La participación es <strong>obligatoria</strong> y puede organizarse en diferentes hilos temáticos.
            </div>
            <CourseForum courseId={courseId} isAdmin={isAdmin} isEditable={isEditable} />
          </TabsContent>

          <TabsContent value="technical">
            <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 text-xs text-amber-700 dark:text-amber-300">
              <strong>Foro de ayuda técnica:</strong> Notifica y recibe ayuda en casos de problemas técnicos:
              conexión, descargas, navegación, etc.
            </div>
            <CourseForum courseId={courseId} isAdmin={isAdmin} isEditable={isEditable} />
          </TabsContent>

          <TabsContent value="admin">
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 text-xs text-green-700 dark:text-green-300">
              <strong>Foro de apoyo administrativo:</strong> Recibe ayuda u orientación sobre gestión administrativa
              del curso: documentación, plazos, matrícula, certificados, justificantes, etc.
            </div>
            <CourseForum courseId={courseId} isAdmin={isAdmin} isEditable={isEditable} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
