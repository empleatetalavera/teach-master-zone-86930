import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, MapPin, Phone, Mail, BookOpen, FileText, CheckCircle2, AlertCircle, GraduationCap, Users, Building2, Briefcase, Globe, ClipboardList, Paperclip, Download } from "lucide-react";
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

      {/* 1. Datos del Centro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            1. Datos del Centro que Solicita la Acreditación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <strong>Nombre:</strong>
                  <p className="text-muted-foreground">{datosDelCentro.nombre}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <strong>CIF/NIF/NIE:</strong>
                  <p className="text-muted-foreground">{datosDelCentro.cif}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <strong>Sitio Web:</strong>
                  <p className="text-muted-foreground">{datosDelCentro.web}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <strong>Dirección:</strong>
                  <p className="text-muted-foreground">{datosDelCentro.direccion}</p>
                  <p className="text-muted-foreground">{datosDelCentro.codigoPostal} {datosDelCentro.localidad} ({datosDelCentro.provincia})</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <strong>Ámbito Geográfico:</strong>
                  <p className="text-muted-foreground">{datosDelCentro.ambitoGeografico}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Caracterización de la Acción Formativa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            2. Caracterización de la Acción Formativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Código</TableHead>
                    <TableHead>Denominación</TableHead>
                    <TableHead className="w-28 text-center">Duración Total</TableHead>
                    <TableHead className="w-24 text-center">Nivel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">ADGG0408</TableCell>
                    <TableCell className="font-medium">Operaciones auxiliares de servicios administrativos y generales</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{course.duration_hours || 430} horas</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge>Nivel 1</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold mb-2">Relación de Módulos y Unidades Formativas</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Módulo/Unidad Formativa</TableHead>
                      <TableHead className="text-center w-24">Duración</TableHead>
                      <TableHead className="text-center w-32">Nº Tutores</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planificacionDidactica.map((modulo, index) => (
                      <>
                        <TableRow key={`modulo-${index}`} className="bg-primary/5">
                          <TableCell className="font-semibold">{modulo.modulo}</TableCell>
                          <TableCell className="text-center font-semibold">{modulo.horasMF}h</TableCell>
                          <TableCell className="text-center"></TableCell>
                        </TableRow>
                        {modulo.unidades.map((uf, ufIndex) => (
                          <TableRow key={`uf-${index}-${ufIndex}`}>
                            <TableCell className="pl-8">
                              <span className="text-xs text-muted-foreground mr-2">{uf.codigo}:</span>
                              {uf.titulo}
                            </TableCell>
                            <TableCell className="text-center">{uf.horas}h</TableCell>
                            <TableCell className="text-center">{ufIndex === 0 ? modulo.tutores : ""}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Organización y Gestión */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            3. Organización y Gestión de la Acción Formativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Selección del alumnado</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {seleccionAlumnado.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Número máximo de alumnos
                </h4>
                <p className="text-2xl font-bold text-primary">{datosDelCentro.maximoAlumnos}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Según art. 6 y art. 30 de la Orden ESS/1897/2013
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Ámbito geográfico
                </h4>
                <p className="text-2xl font-bold text-primary">{datosDelCentro.ambitoGeografico}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cobertura nacional para la impartición
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Planificación didáctica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            4. Planificación Didáctica del Curso Completo (Anexo III)
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

      {/* 5. Calendario de evaluaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            5. Fechas de Pruebas de Evaluación
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

      {/* 6. Centro de formación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            6. Lugar de Realización de Pruebas y Tutorías Presenciales
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

      {/* 7. Documentación Anexos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-primary" />
            7. Documentación Oficial - Anexos III, IV y V
          </CardTitle>
          <CardDescription>
            Documentos oficiales del proyecto formativo conforme a la normativa SEPE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Anexo III */}
            <a 
              href="/documents/anexos/ANEXO_III_Planificacion_Didactica.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="group border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-primary">Anexo III</h4>
                  <p className="text-xs text-muted-foreground">Planificación Didáctica</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Organización temporal y secuenciación de módulos y unidades formativas
              </p>
              <div className="flex items-center gap-1 text-xs text-primary">
                <Download className="h-3 w-3" />
                <span>Descargar PDF</span>
              </div>
            </a>

            {/* Anexo IV */}
            <a 
              href="/documents/anexos/ANEXO_IV_Programacion_Didactica.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="group border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-primary">Anexo IV</h4>
                  <p className="text-xs text-muted-foreground">Programación Didáctica</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Contenidos, objetivos y criterios de evaluación por unidad formativa
              </p>
              <div className="flex items-center gap-1 text-xs text-primary">
                <Download className="h-3 w-3" />
                <span>Descargar PDF</span>
              </div>
            </a>

            {/* Anexo V */}
            <a 
              href="/documents/anexos/ANEXO_V_Guia_Aprendizaje.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="group border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-primary">Anexo V</h4>
                  <p className="text-xs text-muted-foreground">Guía de Aprendizaje</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Instrucciones metodológicas y orientaciones para el alumno
              </p>
              <div className="flex items-center gap-1 text-xs text-primary">
                <Download className="h-3 w-3" />
                <span>Descargar PDF</span>
              </div>
            </a>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Estos documentos están disponibles según la Orden TMS/369/2019 para acreditación de especialidades formativas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer SEPE */}
      <div className="text-center text-xs text-muted-foreground border-t pt-4">
        <p>Planificación conforme al Anexo III, IV y V de la especialidad formativa ADGG0408</p>
        <p>Servicio Público de Empleo Estatal (SEPE) - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
