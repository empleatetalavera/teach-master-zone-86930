import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, MapPin, Phone, Mail, BookOpen, FileText, CheckCircle2, AlertCircle, GraduationCap, Users, Building2, Briefcase, Globe, ClipboardList } from "lucide-react";
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

// Datos del Centro según Anexo III del Proyecto Formativo
const datosDelCentro = {
  nombre: "EMPLEATE TALAVERA FORMACIÓN",
  cif: "B45878253",
  web: "WWW.EMPLEATETALAVERA.ES",
  direccion: "C/ Marqués de Mirasol, 19",
  codigoPostal: "45600",
  localidad: "Talavera de la Reina",
  provincia: "Toledo",
  ambitoGeografico: "ESTATAL",
  maximoAlumnos: 15
};

// Planificación didáctica completa basada en el Anexo III/IV del SEPE
const planificacionDidactica = [
  {
    modulo: "MF0969_1: Técnicas administrativas básicas de oficina",
    horasMF: 150,
    tutores: 1,
    unidades: [
      { codigo: "UF0517", titulo: "Organización empresarial y de recursos humanos", horas: 30, dias: "Del día 1 al día 11", tutorias: "NO PROCEDE" },
      { codigo: "UF0518", titulo: "Gestión auxiliar de la correspondencia y paquetería en la empresa", horas: 30, dias: "Del día 12 al día 22", tutorias: "NO PROCEDE" },
      { codigo: "UF0519", titulo: "Gestión auxiliar de documentación económico-administrativa y comercial", horas: 90, dias: "Del día 23 al día 60", tutorias: "NO PROCEDE" }
    ]
  },
  {
    modulo: "MF0970_1: Operaciones básicas de comunicación",
    horasMF: 120,
    tutores: 1,
    unidades: [
      { codigo: "UF0520", titulo: "Comunicación en las relaciones profesionales", horas: 50, dias: "Del día 61 al día 79", tutorias: "NO PROCEDE" },
      { codigo: "UF0521", titulo: "Comunicación oral y escrita en la empresa", horas: 70, dias: "Del día 80 al día 108", tutorias: "NO PROCEDE" }
    ]
  },
  {
    modulo: "MF0971_1: Reproducción y archivo",
    horasMF: 120,
    tutores: 1,
    unidades: [
      { codigo: "UF0513", titulo: "Gestión auxiliar de archivo en soporte convencional o informático", horas: 60, dias: "Del día 109 al día 131", tutorias: "NO PROCEDE" },
      { codigo: "UF0514", titulo: "Gestión auxiliar de reproducción en soporte convencional o informático", horas: 60, dias: "Del día 132 al día 156", tutorias: "Días 150-153: Tutorías presenciales (10 horas)" }
    ]
  },
  {
    modulo: "MP0112: Módulo de prácticas profesionales no laborales",
    horasMF: 40,
    tutores: 1,
    unidades: [
      { codigo: "MP0112", titulo: "Prácticas profesionales no laborales de Operaciones auxiliares de servicios administrativos y generales", horas: 40, dias: "Del día 157 al día 166 (jornadas de 4 horas)", tutorias: "NO PROCEDE" }
    ]
  }
];

// Fechas de evaluación por convocatoria
const evaluacionesData = [
  { convocatoria: "1ª Convocatoria", descripcion: "Al finalizar cada módulo/unidad formativa", color: "bg-green-100 text-green-800 border-green-200" },
  { convocatoria: "2ª Convocatoria", descripcion: "Fecha alternativa si no superas la primera", color: "bg-amber-100 text-amber-800 border-amber-200" }
];

// Selección del alumnado según el proyecto formativo
const seleccionAlumnado = [
  "Número máximo de alumnos",
  "Ámbito geográfico",
  "Medios de difusión",
  "Procedimiento de solicitud, inscripción, selección y matriculación",
  "Procedimiento de seguimiento del alumnado",
  "Instrumentos para el seguimiento del alumnado"
];

export function CourseWorkPlan({ course, modules, centerSlug }: CourseWorkPlanProps) {
  const { branding } = useCenterBranding(centerSlug || undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {branding?.centerLogo && (
                <img src={branding.centerLogo} alt={branding.centerName} className="h-12 object-contain" />
              )}
              <img src="/branding/sepe-logo.png" alt="SEPE" className="h-10 object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Plan de Trabajo / Mi Agenda
              </CardTitle>
              <CardDescription>
                Planificación Didáctica (Anexo III) y Programación Didáctica (Anexo IV)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 1. Planificación didáctica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            1. Planificación Didáctica del Curso Completo (Anexo III)
          </CardTitle>
          <CardDescription>
            Distribución de módulos, unidades formativas y calendario de impartición
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulos de Certificado (MF)</TableHead>
                  <TableHead className="text-center w-20">Horas MF</TableHead>
                  <TableHead>Unidades Formativas (UF)</TableHead>
                  <TableHead className="text-center w-20">Horas UF</TableHead>
                  <TableHead className="w-44">Fechas de Impartición</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planificacionDidactica.map((modulo, index) => (
                  modulo.unidades.map((uf, ufIndex) => (
                    <TableRow key={`plan-${index}-${ufIndex}`}>
                      {ufIndex === 0 && (
                        <>
                          <TableCell rowSpan={modulo.unidades.length} className="font-medium bg-muted/30 align-top">
                            {modulo.modulo}
                          </TableCell>
                          <TableCell rowSpan={modulo.unidades.length} className="text-center font-semibold bg-muted/30 align-top">
                            {modulo.horasMF}
                          </TableCell>
                        </>
                      )}
                      <TableCell>{uf.codigo}: {uf.titulo}</TableCell>
                      <TableCell className="text-center">{uf.horas}</TableCell>
                      <TableCell className="text-sm">{uf.dias}</TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fechas de Realización de Tutorías Presenciales
            </h4>
            <p className="text-sm text-amber-700">
              En los días comprendidos entre el <strong>día 150 y el 153</strong>, los alumnos asistirán a tutorías presenciales durante <strong>10 horas</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Calendario de evaluaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            2. Fechas de Pruebas de Evaluación
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
              <li>• Las pruebas de evaluación final se realizan de forma <strong>presencial en el centro de formación</strong></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 3. Centro de formación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            3. Lugar de Realización de Pruebas y Tutorías Presenciales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Dirección del Centro de Formación</h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>{datosDelCentro.nombre}</strong></p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{datosDelCentro.direccion}</span>
                </div>
                <p className="ml-6">{datosDelCentro.codigoPostal} {datosDelCentro.localidad} ({datosDelCentro.provincia})</p>
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
        <p>Planificación conforme al Anexo III y IV de la especialidad formativa ADGG0408</p>
        <p>Servicio Público de Empleo Estatal (SEPE) - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
