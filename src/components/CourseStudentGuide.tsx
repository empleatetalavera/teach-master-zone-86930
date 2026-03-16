import { 
  BookOpen, Users, FileText, MessageSquare, Calendar, Award, Clock, Monitor, 
  CheckCircle2, HelpCircle, Phone, Mail, GraduationCap, Target, ShieldCheck, 
  HeadphonesIcon, Settings, Play, ChevronDown, ChevronUp, AlertCircle, 
  Download, Video, Headphones, Building2, Briefcase, Globe, ListChecks,
  UserCheck, ClipboardList, Lightbulb, Folder, Timer, FileDown
} from "lucide-react";
import React, { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { generateStudentGuidePDF } from "@/lib/generateStudentGuidePDF";
import { supabase } from "@/integrations/supabase/client";
import { PDFDocument, rgb } from "pdf-lib";

interface CourseStudentGuideProps {
  course: {
    id?: string;
    title: string;
    description?: string;
    duration_hours?: number;
    objectives?: string;
    specific_objectives?: string[];
    training_center_id?: string;
    support_email?: string;
    support_phone?: string;
    course_code?: string | null;
    professional_family?: string | null;
    qualification_level?: number | null;
    student_guide_pdf_url?: string | null;
  };
  centerSlug?: string | null;
}

export function CourseStudentGuide({ course }: CourseStudentGuideProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    presentacion: true,
    aspectos: false,
    campus: false,
    metodologia: false,
    tutorias: false,
    evaluacion: false,
    titulacion: false,
    cau: false,
    atencion: false,
  });

  const renderSectionHeader = (id: string, Icon: any, number: string, title: string) => (
    <CollapsibleTrigger className="flex items-center gap-3 w-full p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg hover:from-primary/15 hover:to-primary/10 transition-all cursor-pointer group">
      <span className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </span>
      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {number}
      </span>
      <span className="text-lg font-bold flex-1 text-left">{title}</span>
      {openSections[id] ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </CollapsibleTrigger>
  );

  // Get dynamic course data
  const courseCode = course.course_code || "Sin código";
  const professionalFamily = course.professional_family || "Sin especificar";
  const qualificationLevel = course.qualification_level ?? null;

  const handleDownloadPDF = async () => {
    try {
      // Prioridad 1: PDF personalizado subido por el admin del centro
      const customUploadedUrl = course.student_guide_pdf_url;
      const customPdfUrl = customUploadedUrl || '/documents/guia_alumno_custom.pdf';
      try {
        const response = await fetch(customPdfUrl);
        if (response.ok) {
          const pdfBytes = await response.arrayBuffer();
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const pages = pdfDoc.getPages();
          
          // Cubrir el pie de página en todas las páginas con un rectángulo blanco
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height: pageHeight } = page.getSize();
            // Cubrir la franja inferior donde aparece el footer
            page.drawRectangle({
              x: 0,
              y: 0,
              width: width,
              height: 35,
              color: rgb(1, 1, 1),
            });
            // En la última página, cubrir también la sección de firma (mitad inferior)
            if (i === pages.length - 1) {
              page.drawRectangle({
                x: 0,
                y: 0,
                width: width,
                height: pageHeight * 0.55,
                color: rgb(1, 1, 1),
              });
            }
          }
          
          const modifiedPdfBytes = await pdfDoc.save();
          const blob = new Blob([modifiedPdfBytes as BlobPart], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `Guia_Alumno_${course.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
          link.rel = 'noopener';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
          return;
        }
      } catch (fetchErr) {
        console.warn('Error processing custom guide, falling back to generated PDF:', fetchErr);
      }

      // Fallback: generar guía dinámica (sin pie de página)
      let modulesData: any[] = [];
      if (course.id) {
        const { data: mods } = await supabase
          .from('modules')
          .select('id, title, description, duration_minutes, objectives, order_index')
          .eq('course_id', course.id)
          .eq('is_active', true)
          .order('order_index');

        if (mods && mods.length > 0) {
          const moduleIds = mods.map((m) => m.id);
          const { data: ufs } = await supabase
            .from('formative_units')
            .select('id, module_id, title, description, duration_hours, objectives, order_index')
            .in('module_id', moduleIds)
            .eq('is_active', true)
            .order('order_index');

          modulesData = mods.map((mod) => ({
            title: mod.title,
            durationMinutes: mod.duration_minutes,
            description: mod.description,
            objectives: mod.objectives,
            formativeUnits: (ufs || [])
              .filter((uf) => uf.module_id === mod.id)
              .map((uf) => ({
                title: uf.title,
                durationHours: uf.duration_hours,
                objectives: uf.objectives,
              })),
          }));
        }
      }

      const contactEmail = course.support_email || 'formacion.empleate@gmail.com';
      const contactPhone = course.support_phone || '665 673 416';
      const genericCenterName = 'Centro Acreditado SEPE';

      await generateStudentGuidePDF(
        course.title,
        {
          centerName: genericCenterName,
          contactEmail,
          contactPhone,
          address: '',
          cif: '',
          sepeRegistryNumber: '',
        },
        {
          title: course.title,
          code: course.course_code,
          professionalFamily: course.professional_family,
          qualificationLevel: course.qualification_level,
          durationHours: course.duration_hours,
          objectives: course.objectives,
          modules: modulesData,
          supportEmail: contactEmail,
          supportPhone: contactPhone,
        }
      );
    } catch (error) {
      console.error('Error generating student guide PDF:', error);
      alert('Error al generar la Guía del Alumno. Inténtelo de nuevo.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center pb-6 border-b bg-gradient-to-br from-primary/5 to-transparent p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-primary mb-2">
          GUÍA DEL ALUMNO
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          {course.title}
        </p>
        <p className="text-sm mt-2 text-muted-foreground">
          Guía general para certificados de profesionalidad
        </p>
        {course.duration_hours && (
          <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{course.duration_hours} horas</span>
          </div>
        )}
        
        {/* Botón descargar PDF */}
        <div className="mt-4">
          <Button 
            onClick={handleDownloadPDF} 
            variant="outline" 
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Guía del Alumno (PDF)
          </Button>
        </div>
      </div>

      {/* Section 1: Presentación */}
      <Collapsible open={openSections.presentacion} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, presentacion: open }))}>
        {renderSectionHeader("presentacion", BookOpen, "1", "PRESENTACIÓN")}
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
              <p className="text-gray-800 leading-relaxed">
                Estimado/a alumno/a, antes de nada queremos darte la <strong>bienvenida</strong> a tu curso.
              </p>
              <p className="text-gray-800 leading-relaxed mt-3">
                A lo largo del curso vamos a acompañarte en tu proceso formativo de una manera cercana y 
                ofreciéndote todo nuestro apoyo para que puedas sacar el máximo provecho de la formación.
              </p>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              Se trata de un <strong>trabajo en equipo</strong>, entre todos los que formamos parte de nuestro Centro 
              (alumnos, tutores, orientadores, dirección,…), donde tu interés y motivación es vital para que 
              podamos alcanzar juntos los objetivos planteados.
            </p>
            
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-amber-900 text-sm">
                Vamos a estar en continuo contacto para comprobar tus progresos, resolver tus dudas y orientarte 
                en todos los aspectos que necesites.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  ¿Qué encontrarás en esta guía?
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Información general del certificado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Cómo navegar por el campus virtual</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Metodología de estudio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Sistema de evaluación</span>
                  </li>
                </ul>
              </div>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Tu equipo de apoyo
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Tutor/a formador/a</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Orientador/a académico/a</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Soporte técnico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Coordinación del curso</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 2: Aspectos Generales */}
      <Collapsible open={openSections.aspectos} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, aspectos: open }))}>
        {renderSectionHeader("aspectos", GraduationCap, "2", "ASPECTOS GENERALES DEL CERTIFICADO")}
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            {/* 2.1 Identificación */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.1</span> Identificación
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-semibold bg-muted w-1/3">DENOMINACIÓN:</td>
                      <td className="p-3">{course.title}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-semibold bg-muted">CÓDIGO:</td>
                      <td className="p-3">{courseCode}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-semibold bg-muted">FAMILIA PROFESIONAL:</td>
                      <td className="p-3">{professionalFamily}</td>
                    </tr>
                    {qualificationLevel !== null && (
                      <tr className="border-b">
                        <td className="p-3 font-semibold bg-muted">NIVEL DE CUALIFICACIÓN:</td>
                        <td className="p-3">{qualificationLevel}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="p-3 font-semibold bg-muted">DURACIÓN:</td>
                      <td className="p-3">{course.duration_hours || 'N/D'} horas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2.2 Itinerario Formativo */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.2</span> Itinerario Formativo
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                El curso se compone de los siguientes módulos y unidades formativas:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Estructura modular</span>
                </div>
                <p className="text-sm text-blue-900">
                  Consulta el contenido del curso para ver el detalle de módulos formativos, 
                  unidades formativas y horas de cada uno.
                </p>
              </div>
            </div>

            {/* 2.3 Objetivos */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.3</span> Objetivos Generales
              </h3>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-green-900 text-sm">
                  {course.objectives || 
                    "Con este curso aprenderás a desarrollar las competencias profesionales necesarias para el desempeño de las funciones propias de la ocupación relacionada con el certificado de profesionalidad."}
                </p>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Nota:</strong> En el Campus Virtual, en el apartado INTRODUCCIÓN de cada unidad formativa 
                  dispones del documento "Objetivos y contenidos" donde se detallan los objetivos específicos.
                </p>
              </div>
            </div>

            {/* 2.4 Prácticas */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.4</span> Módulo de Prácticas
              </h3>
              <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Formación Práctica en Centros de Trabajo</h4>
                    <ul className="text-sm text-amber-900 space-y-1">
                      <li>• Se realiza una vez superado el resto de módulos formativos</li>
                      <li>• Puede comenzar hasta 4 meses después de finalizar la formación</li>
                      <li>• Si dispones de experiencia laboral, puedes solicitar la exención</li>
                      <li>• Es necesario para obtener el certificado de profesionalidad</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 2.5 Requisitos */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.5</span> Requisitos de Acceso
              </h3>
              <div className="border rounded-lg p-4">
                {qualificationLevel === 1 ? (
                  <p className="text-sm mb-3">Al tratarse de un certificado de <strong>Nivel 1</strong>, no existen requisitos formativos de acceso. Podrás acceder a este curso independientemente de tu nivel de estudios previo.</p>
                ) : qualificationLevel && qualificationLevel >= 2 ? (
                  <>
                    <p className="text-sm mb-3">Al tratarse de un certificado de <strong>Nivel {qualificationLevel}</strong>, deberás cumplir alguno de los siguientes requisitos:</p>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Título de ESO/Bachiller o equivalente</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Título de Técnico/Técnico Superior</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Certificado de profesionalidad del mismo nivel</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Competencias clave del nivel correspondiente</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm mb-3">Consulta los requisitos específicos de acceso a este curso.</p>
                )}
              </div>
              <div className="mt-3 bg-primary/5 border-l-4 border-primary p-3 rounded-r-lg">
                <p className="text-xs">
                  <strong>Modalidad teleformación:</strong> Para el desarrollo del curso en modalidad teleformación 
                  debes haber superado la prueba de competencia tecnológica.
                </p>
              </div>
            </div>

            {/* 2.6 Salidas Laborales */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.6</span> Salidas Laborales
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Ámbito Profesional
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Empresas públicas y privadas del sector correspondiente a la familia profesional.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Ocupaciones
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Consulta la ficha del certificado para ver las ocupaciones y puestos de trabajo relevantes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 3: Campus Virtual */}
      <Collapsible open={openSections.campus} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, campus: open }))}>
        {renderSectionHeader("campus", Monitor, "3", "EL CAMPUS VIRTUAL Y LAS APLICACIONES INFORMÁTICAS")}
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            {/* Intro */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
              <p className="text-sm font-medium">
                CONOCE EL CAMPUS VIRTUAL ANTES DE INICIAR TU CURSO…
              </p>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li>• Diez días antes de la fecha de inicio te serán enviadas tus claves de acceso al Campus Virtual.</li>
                <li>• Deberás acceder al Campus para verificar que tus claves son correctas antes del inicio del curso.</li>
              </ul>
            </div>

            {/* 3.1 Requisitos Técnicos */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">3.1</span> Requisitos Técnicos del Equipo Informático
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Conexión y Navegadores
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Ancho de banda mínimo de 1 Mbps
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Google Chrome (recomendado), Firefox, Edge
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Resolución mínima: 1024 x 768 px
                    </li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Hardware y Software
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Procesador Intel Core i3 / RAM 4Gb
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Office 2016+ / LibreOffice
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Acrobat Reader / Lector PDF
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3.2 Funcionamiento y Recursos - TABLA SEPE */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">3.2</span> Funcionamiento, Recursos y Utilidades del Campus
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                La navegación principal del curso se estructura en el <strong>MENÚ LATERAL IZQUIERDO</strong> con las siguientes opciones:
              </p>

              {/* Tabla de Menú del Campus */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border text-sm">
                  <thead>
                    <tr className="bg-primary/10">
                      <th className="border p-3 text-left font-semibold">Menú Campus</th>
                      <th className="border p-3 text-left font-semibold">Equivalente SEPE</th>
                      <th className="border p-3 text-left font-semibold">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 font-medium">📋 Inicio</td>
                      <td className="border p-3">INTRODUCCIÓN</td>
                      <td className="border p-3 text-muted-foreground">Bienvenida y objetivos del curso</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">📚 Guía del Alumno</td>
                      <td className="border p-3">CÓMO HACER MI CURSO</td>
                      <td className="border p-3 text-muted-foreground">Este documento con toda la información</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">📝 Programa Formativo</td>
                      <td className="border p-3">PLANIFICACIÓN DIDÁCTICA</td>
                      <td className="border p-3 text-muted-foreground">Estructura y objetivos específicos</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">📅 Plan de Trabajo</td>
                      <td className="border p-3">MI AGENDA / PLAN DE TRABAJO</td>
                      <td className="border p-3 text-muted-foreground">Planificación didáctica y fechas</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">📆 Cronograma</td>
                      <td className="border p-3">CRONOGRAMA DEL CURSO</td>
                      <td className="border p-3 text-muted-foreground">Línea temporal del curso</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">📂 Módulos</td>
                      <td className="border p-3">FORMACIÓN EN CAMPUS</td>
                      <td className="border p-3 text-muted-foreground">Contenido formativo por unidades</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">📊 Calificaciones</td>
                      <td className="border p-3">MIS PROGRESOS</td>
                      <td className="border p-3 text-muted-foreground">Tu progreso y notas en el curso</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">✅ Exámenes</td>
                      <td className="border p-3">EVALUACIÓN</td>
                      <td className="border p-3 text-muted-foreground">Evaluaciones programadas</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">👥 Tutorías</td>
                      <td className="border p-3">TUTORÍAS PRESENCIALES</td>
                      <td className="border p-3 text-muted-foreground">Sesiones presenciales y virtuales</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">📅 Calendario</td>
                      <td className="border p-3">MI AGENDA</td>
                      <td className="border p-3 text-muted-foreground">Agenda con todos los eventos</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">💬 Foro</td>
                      <td className="border p-3">FOROS</td>
                      <td className="border p-3 text-muted-foreground">Debates y consultas</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">⏱️ Tiempos Invertidos</td>
                      <td className="border p-3">SEGUIMIENTO DEL TIEMPO</td>
                      <td className="border p-3 text-muted-foreground">Registro de dedicación SEPE</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Herramientas de Comunicación */}
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Herramientas de Comunicación
              </h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border text-sm">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="border p-3 text-left font-semibold">Recurso Campus</th>
                      <th className="border p-3 text-left font-semibold">Equivalente SEPE</th>
                      <th className="border p-3 text-left font-semibold">Cómo usarlo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 font-medium">Perfil (icono usuario)</td>
                      <td className="border p-3">MI PERFIL</td>
                      <td className="border p-3 text-muted-foreground">Editar datos personales y foto</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">Botón "Contacto"</td>
                      <td className="border p-3">MIS CONTACTOS / CORREO</td>
                      <td className="border p-3 text-muted-foreground">Mensajería interna con tutor</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">WhatsApp Dudas</td>
                      <td className="border p-3">CHAT / CONTACTA EN DIRECTO</td>
                      <td className="border p-3 text-muted-foreground">Comunicación directa rápida</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">Foro del curso</td>
                      <td className="border p-3">FOROS</td>
                      <td className="border p-3 text-muted-foreground">Debates con compañeros y tutores</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3.3 Contenido Interactivo Multimedia (CIM) */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">3.3</span> El Contenido Interactivo Multimedia (CIM) / Temario
              </h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  El <strong>Contenido Interactivo Multimedia (CIM)</strong> es el corazón de tu formación online. 
                  Se accede desde cada Unidad Formativa pulsando el botón <strong>"TEMARIO"</strong>.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    Índice Lateral Izquierdo
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Muestra todos los puntos del temario</li>
                    <li>• Un "tick verde" indica apartados completados</li>
                    <li>• Navega pulsando sobre cualquier punto</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Barra Superior
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Glosario</strong> - Definiciones clave</li>
                    <li>• <strong>Descargas</strong> - PDFs del manual</li>
                    <li>• <strong>Ejercicios</strong> - Actividades prácticas</li>
                    <li>• <strong>Test</strong> - Autoevaluaciones</li>
                  </ul>
                </div>
              </div>

              {/* Estructura del Contenido */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="border p-3 text-left font-semibold">Sección del CIM</th>
                      <th className="border p-3 text-left font-semibold">Contenido</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 font-medium">Área Central</td>
                      <td className="border p-3 text-muted-foreground">Texto teórico, tablas, imágenes, vídeos y tests integrados</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">Descargas</td>
                      <td className="border p-3 text-muted-foreground">PDFs del manual para estudio offline</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Ejercicios</td>
                      <td className="border p-3 text-muted-foreground">Actividades prácticas con feedback inmediato</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-medium">Asistente IA</td>
                      <td className="border p-3 text-muted-foreground">Ayuda contextual y resolución de dudas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3.4 Ayuda */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">3.4</span> Ayuda y Preguntas Frecuentes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm mb-2">
                    Antes de comenzar es recomendable que visualices los recursos de ayuda disponibles 
                    en la sección de <strong>Soporte</strong> que te mostrarán cómo utilizar el Campus.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    También dispones de un apartado de preguntas frecuentes (FAQ's) para resolver dudas comunes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 4: Metodología de Estudio */}
      <Collapsible open={openSections.metodologia} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, metodologia: open }))}>
        <CollapsibleTrigger asChild>
          <SectionHeader id="metodologia" icon={Target} number="4" title="METODOLOGÍA DE ESTUDIO" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-blue-900 text-sm">
                En este apartado te facilitamos las orientaciones y explicaciones necesarias para que sepas 
                cómo debes realizar el curso y las posibilidades que te ofrece el Campus Virtual para el estudio.
              </p>
            </div>

            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-primary">4.1</span> Tareas y Actividades
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              Para conocer qué contenidos debes estudiar o qué actividades debes realizar en cada momento, 
              acude a tu <strong>PLAN DE TRABAJO</strong> o al icono <strong>MI AGENDA</strong> del Campus Virtual.
            </p>

            {/* Pasos del proceso formativo */}
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">A</span>
                  Introducción al Módulo/Unidad Formativa
                </h4>
                <ul className="text-sm space-y-1 ml-8">
                  <li>• Ve el vídeo de presentación</li>
                  <li>• Descarga los objetivos y contenidos</li>
                  <li>• Acude a la videoconferencia de presentación</li>
                  <li>• Realiza el cuestionario de conocimientos previos</li>
                </ul>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">B</span>
                  Desarrolla la Formación en Campus Virtual
                </h4>
                <div className="ml-8 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Play className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Contenido Interactivo Multimedia (CIM)</strong>
                      <p className="text-xs text-muted-foreground">Estudia los contenidos multimedia de forma secuencial</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Material Complementario</strong>
                      <p className="text-xs text-muted-foreground">Documentos de apoyo, vídeos y audios para ampliar información</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <ClipboardList className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Actividades de Aprendizaje</strong>
                      <p className="text-xs text-muted-foreground">Casos prácticos y ejercicios para entregar al tutor</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Foros de Debate</strong>
                      <p className="text-xs text-muted-foreground">Participa en las discusiones propuestas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Test de Autoevaluación</strong>
                      <p className="text-xs text-muted-foreground">Comprueba tu nivel de asimilación de contenidos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">C</span>
                  Formación en el Centro (si aplica)
                </h4>
                <p className="text-sm ml-8">
                  Acude a las sesiones presenciales donde se trabajarán los conocimientos adquiridos 
                  en la plataforma con actividades prácticas.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">D</span>
                  Participa en las Tutorías Virtuales
                </h4>
                <p className="text-sm ml-8">
                  Asiste a las tutorías de repaso al finalizar cada Unidad o Módulo Formativo 
                  donde podrás plantear dudas al tutor.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">E</span>
                  Realiza las Pruebas de Evaluación
                </h4>
                <p className="text-sm ml-8">
                  Una vez estudiados todos los contenidos y realizadas las actividades, 
                  realiza las pruebas de evaluación del módulo o unidad formativa.
                </p>
              </div>
            </div>

            {/* Tiempo de dedicación */}
            <div className="mt-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">4.2</span> Tiempo de Dedicación
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <Timer className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-900">
                    Debes planificar tu tiempo de estudio de acuerdo a las horas establecidas para cada 
                    módulo/unidad formativa. Recuerda que el tiempo de conexión queda registrado para 
                    cumplir con los requisitos de seguimiento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 5: Sistema de Tutorías */}
      <Collapsible open={openSections.tutorias} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, tutorias: open }))}>
        <CollapsibleTrigger asChild>
          <SectionHeader id="tutorias" icon={Users} number="5" title="SISTEMA DE TUTORÍAS" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            <p className="text-sm text-muted-foreground">
              Durante el desarrollo del curso contarás con el apoyo de un tutor/a-formador/a que te 
              acompañará en tu proceso de aprendizaje.
            </p>

            {/* 5.1 Tutorías Virtuales */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">5.1</span> Tutorías Virtuales
              </h3>
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-900 mb-2">
                      Se realizan a través de <strong>chat o videoconferencia</strong>. 
                      Al menos, tendrás una tutoría virtual de repaso al finalizar cada Unidad o Módulo Formativo.
                    </p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Consulta las fechas en MI AGENDA o en el PLAN DE TRABAJO</li>
                      <li>• Podrás plantear tus dudas al tutor/a-formador/a</li>
                      <li>• También puedes solicitar tutorías individuales por correo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 5.2 Tutorías Presenciales */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">5.2</span> Tutorías Presenciales
              </h3>
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-green-900 mb-2">
                      Sesiones presenciales en el Centro de Formación donde se desarrollarán 
                      actividades prácticas y/o pruebas de evaluación.
                    </p>
                    <ul className="text-green-800 space-y-1">
                      <li>• La asistencia puede ser obligatoria según el módulo</li>
                      <li>• Consulta la ubicación y horarios en tu documentación</li>
                      <li>• El tutor/a te informará previamente de las actividades</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Canales de contacto */}
            <div className="mt-4">
              <h4 className="font-semibold mb-3">Canales de comunicación con el tutor:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm border rounded-lg p-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Correo interno del campus</span>
                </div>
                <div className="flex items-center gap-2 text-sm border rounded-lg p-3">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>Foros de consulta/dudas</span>
                </div>
                <div className="flex items-center gap-2 text-sm border rounded-lg p-3">
                  <Video className="h-4 w-4 text-primary" />
                  <span>Videoconferencia / Chat</span>
                </div>
                <div className="flex items-center gap-2 text-sm border rounded-lg p-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>Teléfono (si disponible)</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-blue-800 mb-1">Tiempo de respuesta</h4>
              <p className="text-sm text-blue-900">
                El tutor/a responderá a tus consultas en un plazo máximo de <strong>48 horas hábiles</strong>.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 6: Sistema de Evaluación */}
      <Collapsible open={openSections.evaluacion} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, evaluacion: open }))}>
        <CollapsibleTrigger asChild>
          <SectionHeader id="evaluacion" icon={Award} number="6" title="SISTEMA DE EVALUACIÓN" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            {/* 6.1 Actividades y Pruebas */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">6.1</span> Actividades y Pruebas Evaluables
              </h3>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Tests de Autoevaluación
                  </h4>
                  <p className="text-sm text-green-900">
                    Cuestionarios para comprobar el grado de asimilación de los contenidos. 
                    Son orientativos y puedes realizarlos varias veces.
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Actividades de Aprendizaje
                  </h4>
                  <p className="text-sm text-blue-900 mb-2">
                    Casos prácticos, ejercicios y tareas que debes entregar al tutor para su corrección. 
                    Recibirás feedback y puntuación (1-10).
                  </p>
                  <div className="bg-blue-100 rounded p-2 text-xs text-blue-800">
                    <strong>Importante:</strong> La entrega fuera de plazo puede penalizar tu nota.
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Test Final en Campus (CIM)
                  </h4>
                  <p className="text-sm text-amber-900">
                    Evaluación final en el Campus Virtual. Dispondrás de <strong>un solo intento</strong> 
                    y podrás conocer los resultados una vez finalizado.
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Prueba de Evaluación Final Presencial
                  </h4>
                  <p className="text-sm text-red-900 mb-2">
                    Examen presencial en el Centro de Formación que incluye:
                  </p>
                  <ul className="text-sm text-red-800 ml-4 space-y-1">
                    <li>• Prueba de conocimientos (tipo test, respuestas cortas)</li>
                    <li>• Prueba de destrezas cognitivas y habilidades prácticas</li>
                    <li>• Evaluación de actitudes y comportamientos</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-gray-100 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  RECUERDA
                </h4>
                <p className="text-sm">
                  Para poder presentarte a la prueba de evaluación final debes haber realizado 
                  el <strong>100% de las actividades de aprendizaje</strong> establecidas en el Campus Virtual, 
                  así como haber participado en los foros programados.
                </p>
              </div>
            </div>

            {/* 6.2 Fecha y lugar */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">6.2</span> Fecha y Lugar de la Prueba Final
              </h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm mb-3">
                  Las fechas de las pruebas de evaluación se comunicarán a través del <strong>correo interno del campus</strong> y 
                  estarán visibles en la sección <strong>CRONOGRAMA</strong> del curso.
                </p>
                <div className="bg-white border rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Centro de Formación
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Empleate Formación</strong></p>
                    <p>C/ Marqués de Mirasol, 19</p>
                    <p>45600 Talavera de la Reina (Toledo)</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="font-semibold text-green-800">1ª Convocatoria</p>
                    <p className="text-green-700 text-xs">Al finalizar el módulo/unidad formativa</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="font-semibold text-amber-800">2ª Convocatoria</p>
                    <p className="text-amber-700 text-xs">Fecha alternativa si no superas la primera</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Contacto: <strong>665 673 416</strong> (L-V 09:00-14:00) | formacion.empleate@gmail.com</span>
              </div>
            </div>

            {/* Criterios de calificación */}
            <div className="border-2 border-primary rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3 text-center">
                Criterios de Calificación
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Componente</th>
                      <th className="text-center p-2">Peso</th>
                      <th className="text-center p-2">Nota mínima</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Formación en Campus</td>
                      <td className="text-center p-2">Variable</td>
                      <td className="text-center p-2">50%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Tutorías Presenciales</td>
                      <td className="text-center p-2">Variable</td>
                      <td className="text-center p-2">Asistencia</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Prueba Final Presencial</td>
                      <td className="text-center p-2">-</td>
                      <td className="text-center p-2 font-semibold">50%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 7: Titulación */}
      <Collapsible open={openSections.titulacion} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, titulacion: open }))}>
        <CollapsibleTrigger asChild>
          <SectionHeader id="titulacion" icon={GraduationCap} number="7" title="TITULACIÓN OBTENIDA" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <GraduationCap className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-800 mb-2">Certificado de Profesionalidad</h4>
                  <p className="text-sm text-green-900 mb-3">
                    Al superar con éxito todos los módulos formativos (incluyendo el módulo de prácticas), 
                    podrás solicitar el <strong>Certificado de Profesionalidad</strong> correspondiente 
                    ante la Administración competente.
                  </p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Titulación oficial con validez en todo el territorio nacional
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Acredita competencias profesionales del Catálogo Nacional
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Expedido por el SEPE o la Comunidad Autónoma
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Diploma del curso:</strong> Al finalizar el curso también recibirás un diploma 
                acreditativo expedido por el centro de formación.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 8: CAU */}
      <Collapsible open={openSections.cau} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, cau: open }))}>
        <CollapsibleTrigger asChild>
          <SectionHeader id="cau" icon={HeadphonesIcon} number="8" title="CAU: CENTRO DE ATENCIÓN DE USUARIOS" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-4">
            <p className="text-sm">
              Si experimentas <strong>problemas técnicos</strong> con la plataforma o el acceso al campus, 
              contacta con el Centro de Atención de Usuarios:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  <HelpCircle className="h-5 w-5" />
                  Visita Virtual y FAQ
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Antes de plantear tu consulta, consulta los vídeos tutoriales y las preguntas frecuentes.
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    Vídeos tutoriales de navegación
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Preguntas frecuentes (FAQ's)
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  <HeadphonesIcon className="h-5 w-5" />
                  Contacto Soporte Técnico
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>formacion.empleate@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>665 673 416</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>L-V: 09:00 - 14:00h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-sm text-amber-900">
                <strong>Nota:</strong> Para dudas relacionadas con el <em>contenido del curso</em>, 
                contacta con tu tutor/a-formador/a a través de la mensajería del campus.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 9: Servicio de Atención al Cliente */}
      <Collapsible open={openSections.atencion} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, atencion: open }))}>
        <CollapsibleTrigger asChild>
          <SectionHeader id="atencion" icon={Phone} number="9" title="SERVICIO DE ATENCIÓN AL CLIENTE" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-4">
            <p className="text-sm">
              Para consultas administrativas, certificaciones, o cualquier otra gestión no relacionada 
              con el contenido o la plataforma:
            </p>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-5">
              <h4 className="font-semibold mb-3">Centro de Atención al Alumno</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{course.support_email || 'formacion.empleate@gmail.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{course.support_phone || '665 673 416'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Horario de atención: L-V 09:00-14:00</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Footer */}
      <div className="text-center pt-6 border-t bg-gradient-to-br from-gray-50 to-transparent p-6 rounded-xl">
        <div className="flex justify-center gap-4 mb-3">
          <img src="/branding/sepe-logo.png" alt="SEPE" className="h-8 object-contain opacity-70" />
        </div>
        <p className="text-sm text-muted-foreground">Documento conforme a los requisitos del</p>
        <p className="font-semibold text-primary">Servicio Público de Empleo Estatal (SEPE)</p>
        <p className="text-xs text-muted-foreground mt-2">
          Versión 1.0 - {new Date().getFullYear()} | Documento general
        </p>
      </div>
    </div>
  );
}
