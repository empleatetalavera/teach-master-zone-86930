import { BookOpen, Users, FileText, Clock, Target, Award, CheckCircle2, GraduationCap, Building2, Calendar, ClipboardList, BarChart3, Briefcase, Settings } from "lucide-react";
import { useCenterBranding } from "@/hooks/useCenterBranding";

interface Module {
  id: string;
  title: string;
  description?: string | null;
  duration_minutes?: number;
  formative_units?: FormativeUnit[];
}

interface FormativeUnit {
  id: string;
  title: string;
  description?: string | null;
  duration_hours?: number | null;
  objectives?: string | null;
}

interface CourseTrainingProgramProps {
  course: {
    title: string;
    description?: string;
    duration_hours?: number;
    objectives?: string;
    specific_objectives?: string[];
    training_center_id?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
  };
  modules: Module[];
  centerSlug?: string | null;
}

export function CourseTrainingProgram({ course, modules, centerSlug }: CourseTrainingProgramProps) {
  const { branding } = useCenterBranding(centerSlug);

  const totalModules = modules.length;
  const totalUnits = modules.reduce((acc, m) => acc + (m.formative_units?.length || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <div className="flex justify-center gap-4 mb-4 items-center">
          {branding.centerLogo && (
            <img src={branding.centerLogo} alt={branding.centerName} className="h-12 object-contain" />
          )}
          <img src="/branding/sepe-logo.png" alt="SEPE" className="h-10 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">
          PROGRAMA FORMATIVO
        </h1>
        <p className="text-lg text-muted-foreground">
          {course.title}
        </p>
        <p className="text-sm mt-2" style={{ color: branding.secondaryColor }}>
          {branding.centerName}
        </p>
      </div>

      {/* Section 1: Course Data */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">1. Datos de la Acción Formativa</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-medium">Denominación:</span>
              <span className="text-muted-foreground">{course.title}</span>
            </div>
            {course.category && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium">Familia Profesional:</span>
                <span className="text-muted-foreground">{course.category}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Duración:</span>
              <span className="text-muted-foreground">{course.duration_hours || 0} horas</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium">Modalidad:</span>
              <span className="text-muted-foreground">Teleformación</span>
            </div>
            {course.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Inicio:</span>
                <span className="text-muted-foreground">
                  {new Date(course.start_date).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
            {course.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Fin:</span>
                <span className="text-muted-foreground">
                  {new Date(course.end_date).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalModules}</div>
            <div className="text-xs text-muted-foreground">Módulos</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalUnits}</div>
            <div className="text-xs text-muted-foreground">Unidades Formativas</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{course.duration_hours || 0}h</div>
            <div className="text-xs text-muted-foreground">Duración Total</div>
          </div>
        </div>
      </section>

      {/* Section 2: Objectives */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">2. Objetivos</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">2.1 Objetivo General</h3>
            <p className="text-sm text-muted-foreground">
              {course.objectives || "Al finalizar la acción formativa, el alumno habrá adquirido los conocimientos y competencias profesionales necesarios para desempeñar las funciones propias del perfil profesional."}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">2.2 Objetivos Específicos</h3>
            <ul className="space-y-2">
              {course.specific_objectives && course.specific_objectives.length > 0 ? (
                course.specific_objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Comprender los conceptos fundamentales de la materia</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Aplicar los conocimientos adquiridos en casos prácticos</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Desarrollar habilidades de análisis crítico y resolución de problemas</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Program Structure */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">3. Estructura del Programa</h2>
        </div>
        
        <div className="space-y-4">
          {modules.map((module, moduleIdx) => (
            <div key={module.id} className="border rounded-lg overflow-hidden">
              <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {moduleIdx + 1}
                  </span>
                  <span className="font-semibold text-sm">{module.title}</span>
                </div>
                {module.duration_minutes && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.round(module.duration_minutes / 60)}h
                  </span>
                )}
              </div>
              
              {module.description && (
                <div className="px-4 py-2 bg-muted/30">
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                </div>
              )}

              {module.formative_units && module.formative_units.length > 0 && (
                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Unidades Formativas:</p>
                  {module.formative_units.map((unit, unitIdx) => (
                    <div key={unit.id} className="flex items-start gap-2 p-2 bg-muted/20 rounded text-sm">
                      <span className="text-xs text-primary font-medium mt-0.5">
                        UF{unitIdx + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-xs">{unit.title}</span>
                        {unit.duration_hours && (
                          <span className="text-xs text-muted-foreground ml-2">({unit.duration_hours}h)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Methodology */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">4. Metodología</h2>
        </div>
        
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">4.1 Modalidad de Impartición</h3>
            <p className="text-sm text-muted-foreground">
              La acción formativa se desarrollará en modalidad <strong>teleformación</strong>, a través del 
              campus virtual, permitiendo el acceso flexible a los contenidos las 24 horas del día.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">4.2 Recursos Didácticos</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Contenidos multimedia interactivos (SCORM)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Manuales descargables en formato PDF
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Vídeos explicativos y presentaciones
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Ejercicios prácticos y casos de estudio
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Foros de debate y comunicación
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: Evaluation */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">5. Sistema de Evaluación</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-3">5.1 Tipos de Evaluación</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  A
                </div>
                <div>
                  <h4 className="font-medium text-sm">Autoevaluaciones</h4>
                  <p className="text-xs text-muted-foreground">Tests de repaso sin impacto en la nota final</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  B
                </div>
                <div>
                  <h4 className="font-medium text-sm">Actividades de Desarrollo</h4>
                  <p className="text-xs text-muted-foreground">Tareas prácticas evaluadas por el tutor (30% nota)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  C
                </div>
                <div>
                  <h4 className="font-medium text-sm">Evaluaciones Finales</h4>
                  <p className="text-xs text-muted-foreground">Exámenes por módulo/unidad formativa (70% nota)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <h4 className="font-semibold text-red-800 mb-1">Criterios de Superación</h4>
            <p className="text-sm text-red-900">
              Para superar la acción formativa es necesario obtener una calificación mínima del <strong>50%</strong> en 
              cada uno de los módulos y completar todas las actividades obligatorias.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Tutoring */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">6. Sistema Tutorial</h2>
        </div>
        
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm">
            Durante toda la acción formativa contarás con el apoyo de un tutor-formador especializado 
            que te guiará en el proceso de aprendizaje.
          </p>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Tutorías Virtuales</h4>
              <p className="text-xs text-muted-foreground">
                Comunicación asíncrona a través de mensajería y foros del campus.
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Tutorías Síncronas</h4>
              <p className="text-xs text-muted-foreground">
                Sesiones programadas por videoconferencia (individuales o grupales).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-6 border-t text-sm text-muted-foreground">
        <p>Documento conforme a los requisitos del</p>
        <p className="font-semibold">Servicio Público de Empleo Estatal (SEPE)</p>
        <p className="mt-2">Versión 1.0 - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
