import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Clock, MapPin, Phone, Mail, BookOpen, FileText, CheckCircle2, AlertCircle, GraduationCap, Users, Building2 } from "lucide-react";
import { useCenterBranding } from "@/hooks/useCenterBranding";

interface CourseWorkPlanProps {
  course: {
    id: string;
    title: string;
    duration_hours: number;
    start_date?: string;
    end_date?: string;
  };
  modules: Array<{
    id: string;
    title: string;
    duration_minutes: number;
    start_date?: string | null;
    end_date?: string | null;
    formative_units?: Array<{
      id: string;
      title: string;
      duration_hours: number | null;
      start_date?: string | null;
      end_date?: string | null;
    }>;
  }>;
  centerSlug?: string | null;
}

// Planificación didáctica basada en el Anexo III/IV del SEPE
const planificacionDidactica = [
  {
    modulo: "MF0969_1: Técnicas administrativas básicas de oficina",
    horasMF: 150,
    unidades: [
      { codigo: "UF0517", titulo: "Organización empresarial y de recursos humanos", horas: 30, dias: "Del día 1 al día 11", tutorias: "NO PROCEDE" },
      { codigo: "UF0518", titulo: "Gestión auxiliar de la correspondencia y paquetería en la empresa", horas: 30, dias: "Del día 12 al día 22", tutorias: "NO PROCEDE" },
      { codigo: "UF0519", titulo: "Gestión auxiliar de documentación económico-administrativa y comercial", horas: 90, dias: "Del día 23 al día 60", tutorias: "NO PROCEDE" }
    ]
  },
  {
    modulo: "MF0970_1: Operaciones básicas de comunicación",
    horasMF: 120,
    unidades: [
      { codigo: "UF0520", titulo: "Comunicación en las relaciones profesionales", horas: 50, dias: "Del día 61 al día 79", tutorias: "NO PROCEDE" },
      { codigo: "UF0521", titulo: "Comunicación oral y escrita en la empresa", horas: 70, dias: "Del día 80 al día 108", tutorias: "NO PROCEDE" }
    ]
  },
  {
    modulo: "MF0971_1: Reproducción y archivo",
    horasMF: 120,
    unidades: [
      { codigo: "UF0513", titulo: "Gestión auxiliar de archivo en soporte convencional o informático", horas: 60, dias: "Del día 109 al día 131", tutorias: "NO PROCEDE" },
      { codigo: "UF0514", titulo: "Gestión auxiliar de reproducción en soporte convencional o informático", horas: 60, dias: "Del día 132 al día 156", tutorias: "Días 150-153: Tutorías presenciales (10 horas)" }
    ]
  },
  {
    modulo: "MP0112: Módulo de prácticas profesionales no laborales",
    horasMF: 40,
    unidades: [
      { codigo: "MP0112", titulo: "Prácticas en empresa", horas: 40, dias: "Del día 157 al día 166 (jornadas de 4 horas)", tutorias: "NO PROCEDE" }
    ]
  }
];

// Fechas de evaluación por convocatoria
const evaluacionesData = [
  { convocatoria: "1ª Convocatoria", descripcion: "Al finalizar cada módulo/unidad formativa", color: "bg-green-100 text-green-800 border-green-200" },
  { convocatoria: "2ª Convocatoria", descripcion: "Fecha alternativa si no superas la primera", color: "bg-amber-100 text-amber-800 border-amber-200" }
];

export function CourseWorkPlan({ course, modules, centerSlug }: CourseWorkPlanProps) {
  const { branding } = useCenterBranding(centerSlug || undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            {branding?.centerLogo ? (
              <img src={branding.centerLogo} alt={branding.centerName} className="h-12 object-contain" />
            ) : (
              <img src="/branding/sepe-logo.png" alt="SEPE" className="h-10 object-contain" />
            )}
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Plan de Trabajo / Mi Agenda
              </CardTitle>
              <CardDescription>
                Planificación didáctica del curso - {course.title}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Datos del curso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Datos de la Acción Formativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="font-semibold">Certificado de Profesionalidad</Badge>
              </div>
              <p className="font-medium">{course.title}</p>
              <p className="text-sm text-muted-foreground">Código: ADGG0408</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span><strong>Duración:</strong> {course.duration_hours} horas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span><strong>Fechas:</strong> Del día 1 al día 166</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span><strong>Nivel:</strong> 1</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planificación didáctica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Planificación Didáctica del Curso
          </CardTitle>
          <CardDescription>
            Distribución de módulos, unidades formativas y calendario de impartición
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {planificacionDidactica.map((modulo, index) => (
              <AccordionItem key={index} value={`modulo-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant="secondary" className="shrink-0">{modulo.horasMF}h</Badge>
                    <span className="font-medium">{modulo.modulo}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2 space-y-3">
                    {modulo.unidades.map((uf, ufIndex) => (
                      <div key={ufIndex} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{uf.codigo}</Badge>
                              <span className="font-medium text-sm">{uf.titulo}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{uf.horas}h</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md">
                            <Calendar className="h-4 w-4" />
                            <span><strong>Fechas:</strong> {uf.dias}</span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${uf.tutorias !== "NO PROCEDE" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-600"}`}>
                            <Users className="h-4 w-4" />
                            <span><strong>Tutorías:</strong> {uf.tutorias}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Calendario de evaluaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Fechas de Pruebas de Evaluación
          </CardTitle>
          <CardDescription>
            Consulta las fechas de las evaluaciones en el <strong>CRONOGRAMA</strong> del curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {evaluacionesData.map((evalItem, index) => (
              <div key={index} className={`border rounded-lg p-4 ${evalItem.color}`}>
                <h4 className="font-semibold mb-1">{evalItem.convocatoria}</h4>
                <p className="text-sm">{evalItem.descripcion}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Importante
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Las fechas exactas se comunicarán por <strong>correo interno del campus</strong></li>
              <li>• Consulta regularmente la sección <strong>CRONOGRAMA</strong> para ver las actualizaciones</li>
              <li>• Las pruebas de evaluación final podrán realizarse de forma presencial o telemática según se indique</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Centro de formación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Centro de Formación y Contacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Datos del Centro</h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>{branding?.centerName || "Empleate Formación"}</strong></p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>C/ Corredera, 24 - 1ª Planta</span>
                </div>
                <p className="ml-6">45600 Talavera de la Reina (Toledo)</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Centro de Atención al Usuario (CAU)</h4>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span><strong>Teléfono:</strong> 665 673 416</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span><strong>Horario:</strong> L-V de 09:00 a 15:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span><strong>Email:</strong> formacion.empleate@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer SEPE */}
      <div className="text-center text-xs text-muted-foreground border-t pt-4">
        <p>Planificación conforme al Anexo III y IV de la especialidad formativa</p>
        <p>Servicio Público de Empleo Estatal (SEPE) - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
