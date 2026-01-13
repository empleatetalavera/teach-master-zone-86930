import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle2, AlertCircle, Building2, Info } from "lucide-react";
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
                Calendario de fechas importantes del curso
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Aviso de tutorías pendientes */}
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Fechas de Tutorías Presenciales</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Las fechas de las <strong>tutorías presenciales</strong> están <strong>pendientes de confirmar</strong>. 
                Se comunicarán próximamente a través del correo interno del campus y aparecerán en el calendario superior.
              </p>
            </div>
          </div>
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
              <li>• Las pruebas de evaluación final se realizan de forma <strong>presencial en el centro de formación</strong></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Centro de formación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Lugar de Realización de Pruebas y Tutorías Presenciales
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
        <p>Planificación conforme al Anexo III y IV de la especialidad formativa</p>
        <p>Servicio Público de Empleo Estatal (SEPE) - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
