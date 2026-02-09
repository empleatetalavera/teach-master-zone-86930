import { Card } from "@/components/ui/card";
import { BookOpen, LayoutDashboard, ShieldCheck, ClipboardList, Users, FileText } from "lucide-react";

export const CampusEnvironmentsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            ¿Qué te ofrece nuestro{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              campus online?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Podrás contratar una plataforma de aprendizaje LMS con todos los recursos elearning que necesitas para impartir formación online
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Entorno Virtual de Formación */}
          <Card className="p-8 border-border/50 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Entorno virtual de formación</h3>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                Pueden acceder a este entorno tanto alumnos como tutores, coordinadores y 
                cualquier personal docente interno o externo a través de invitaciones.
              </p>
              <p>
                En este entorno se encuentran los contenidos y recursos formativos en 
                distintos formatos y las evaluaciones: contenidos interactivos multimedia 
                (CIM) en formato SCORM, vídeos, actividades y manuales, así como el resto de 
                herramientas elearning colaborativas: foros, chat y aplicación de correo 
                electrónico.
              </p>
            </div>
          </Card>
          
          {/* Entorno de Administración */}
          <Card className="p-8 border-border/50 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Entorno de administración</h3>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                Pueden acceder a este entorno de administración el administrador del campus 
                y el personal de administración. Se pueden tener distintos permisos de acceso.
              </p>
              <p>
                En este entorno se puede administrar todo el campus, desde el alta y edición de 
                alumnos y grupos hasta la creación de nuevas acciones formativas, así como 
                la posibilidad de editarlas agregando nuevos contenidos, actividades y 
                exámenes.
              </p>
            </div>
          </Card>
        </div>

        {/* Requisitos CFC */}
        <div className="mt-16">
          <div className="text-center mb-10 space-y-3">
            <h3 className="text-3xl font-bold">
              Cumplimiento{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CFC
              </span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nuestra plataforma cumple con los requisitos de la Comisión de Formación Continuada para cursos acreditados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-border/50 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center mb-4">
                <ClipboardList className="w-5 h-5 text-primary-foreground" />
              </div>
              <h4 className="font-semibold mb-2">Evaluación tipo test</h4>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Mínimo 5 opciones de respuesta</li>
                <li>• Banco de preguntas aleatorias</li>
                <li>• Máximo 3 intentos por prueba</li>
                <li>• 70% de aciertos para aprobar</li>
              </ul>
            </Card>

            <Card className="p-6 border-border/50 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <h4 className="font-semibold mb-2">Calificación mínima</h4>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Calificación mínima configurable para obtener certificado</li>
                <li>• Obligatoria en cursos de 40h o más</li>
                <li>• Reflejada en la guía didáctica</li>
              </ul>
            </Card>

            <Card className="p-6 border-border/50 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <h4 className="font-semibold mb-2">Aula virtual completa</h4>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Guía didáctica incluida</li>
                <li>• Foros de participación formativa</li>
                <li>• Foro de consultas al tutor</li>
                <li>• Obligatorio en cursos de 20h+</li>
              </ul>
            </Card>

            <Card className="p-6 border-border/50 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h4 className="font-semibold mb-2">Participación formativa</h4>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Foros obligatorios para alumnos</li>
                <li>• Debates y reflexión sobre contenidos</li>
                <li>• Cafetería virtual disponible</li>
                <li>• Seguimiento de participación</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
