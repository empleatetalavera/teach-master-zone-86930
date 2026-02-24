import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface FormativeUnit {
  id: string;
  title: string;
  duration_hours?: number | null;
  objectives?: string | null;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  duration_minutes?: number;
  formative_units?: FormativeUnit[];
}

interface ProyectoFormativoParams {
  courseTitle: string;
  courseCode: string;
  durationHours: number;
  startDate?: string | null;
  endDate?: string | null;
  objectives?: string | null;
  professionalFamily?: string;
  qualificationLevel?: number | null;
  modules: Module[];
  centerName: string;
  centerPhone?: string;
  centerEmail?: string;
  centerAddress?: string;
  centerCity?: string;
  centerProvince?: string;
  centerPostalCode?: string;
  centerCif?: string;
  platformUrl?: string;
}

const BLUE_HEADER: [number, number, number] = [44, 62, 80];
const LIGHT_BLUE: [number, number, number] = [189, 215, 238];
const WHITE: [number, number, number] = [255, 255, 255];

// =============================================
// BOE CURRICULUM DATA - SSC_C_017_5B
// =============================================
interface ModuleCurriculum {
  code: string;
  title: string;
  hours: number;
  ras: { ra: string; title: string; ces: string[] }[];
}

const BOE_CURRICULUM: ModuleCurriculum[] = [
  {
    code: "1705",
    title: "Programación didáctica de los Grados A, B y C del Sistema de Formación Profesional",
    hours: 90,
    ras: [
      {
        ra: "RA1", title: "Identifica la normativa vigente del Sistema de Formación Profesional como sistema único e integrado, aplicándola en la programación didáctica de las acciones formativas.",
        ces: [
          "CE1.1 Se ha analizado la estructura del Sistema de Formación Profesional, identificando sus elementos y ordenación.",
          "CE1.2 Se han diferenciado los grados A, B, C, D y E, analizando la oferta formativa.",
          "CE1.3 Se ha identificado la normativa reguladora vigente del Sistema de Formación Profesional.",
          "CE1.4 Se han identificado los aspectos legislativos más relevantes para el diseño, programación, impartición y evaluación de acciones formativas.",
          "CE1.5 Se ha tenido en cuenta la normativa de igualdad de oportunidades.",
        ]
      },
      {
        ra: "RA2", title: "Analiza la estructura y el contenido de los Grados A, B y C, identificando sus elementos, requisitos de los prescriptores, procedimientos de evaluación y acreditación.",
        ces: [
          "CE2.1 Se han identificado los elementos que definen la estructura de los grados A, B y C.",
          "CE2.2 Se han analizado los requisitos de acceso y perfiles de destinatarios.",
          "CE2.3 Se han diferenciado las vías de acreditación de competencias profesionales.",
          "CE2.4 Se han examinado los procedimientos de evaluación y certificación.",
        ]
      },
      {
        ra: "RA3", title: "Coordina, con el resto del equipo, la formación técnica y profesional para el desarrollo de las acciones formativas.",
        ces: [
          "CE3.1 Se han identificado los diferentes agentes que intervienen en las acciones formativas.",
          "CE3.2 Se han establecido protocolos de coordinación con el equipo docente.",
          "CE3.3 Se han fomentado actitudes de compromiso, coordinación y corresponsabilidad.",
          "CE3.4 Se han discriminado las modalidades de impartición (presencial, semipresencial, virtual).",
        ]
      },
      {
        ra: "RA4", title: "Diseña la programación didáctica de acciones formativas de los Grados A, B y C, teniendo en cuenta los elementos que la componen.",
        ces: [
          "CE4.1 Se ha comprendido la finalidad de la programación didáctica.",
          "CE4.2 Se han analizado condiciones previas y necesidades de los destinatarios.",
          "CE4.3 Se han identificado los elementos de la programación (competencias, RA, CE, contenidos, temporalización, metodología, evaluación).",
          "CE4.4 Se han descrito objetivos y contenidos formativo-profesionales.",
          "CE4.5 Se han planificado metodologías constructivistas, integradoras y competenciales.",
          "CE4.6 Se han detallado espacios, recursos y materiales según modalidad.",
          "CE4.7 Se han determinado procedimientos e instrumentos de evaluación.",
        ]
      },
      {
        ra: "RA5", title: "Temporaliza la programación didáctica de las acciones formativas, secuenciando los contenidos y actividades.",
        ces: [
          "CE5.1 Se han distribuido contenidos y actividades según duración y horario.",
          "CE5.2 Se han analizado características, condiciones y medios utilizados.",
          "CE5.3 Se han secuenciado bloques formativos con metodologías ajustadas.",
          "CE5.4 Se ha estructurado una guía diferenciada según modalidad.",
          "CE5.5 Se ha revisado la planificación de forma continua.",
        ]
      },
    ]
  },
  {
    code: "1706",
    title: "Gestión de materiales, medios y recursos didácticos de los Grados A, B y C del Sistema de Formación Profesional",
    hours: 90,
    ras: [
      {
        ra: "RA1", title: "Selecciona materiales, medios y recursos didácticos, aplicándolos en las distintas acciones formativas.",
        ces: [
          "CE1.1 Se han caracterizado los materiales, medios y recursos didácticos en función de la modalidad.",
          "CE1.2 Se han establecido diferencias entre medios y recursos didácticos.",
          "CE1.3 Se han identificado posibilidades didácticas de los distintos medios y recursos.",
          "CE1.4 Se han diferenciado fuentes y recursos actualizados según modalidad.",
          "CE1.5 Se ha examinado la legislación sobre propiedad intelectual.",
        ]
      },
      {
        ra: "RA2", title: "Diseña materiales y recursos didácticos dirigidos a favorecer la adquisición del aprendizaje.",
        ces: [
          "CE2.1 Se han identificado criterios técnicos y pedagógicos para la elaboración de materiales.",
          "CE2.2 Se han elaborado materiales adaptados a cada módulo profesional.",
          "CE2.3 Se han seleccionado fuentes para elaborar materiales gráficos (mapas conceptuales, infografías, etc.).",
          "CE2.4 Se han determinado recursos digitales considerando TIC e IA.",
          "CE2.5 Se ha elaborado material multimedia interactivo de calidad.",
        ]
      },
      {
        ra: "RA3", title: "Determina y organiza los recursos personales, espacios/instalaciones y distribución temporal.",
        ces: [
          "CE3.1 Se han identificado espacios y tiempos en relación a las acciones formativas.",
          "CE3.2 Se han analizado modelos de agrupamiento según participantes.",
        ]
      },
      {
        ra: "RA4", title: "Utiliza materiales, medios técnicos y recursos audiovisuales y multimedia según especificaciones técnicas.",
        ces: [
          "CE4.1 Se han dispuesto medios y recursos atendiendo a normas de seguridad.",
          "CE4.2 Se ha utilizado el entorno virtual de enseñanza-aprendizaje.",
          "CE4.3 Se ha comprobado el funcionamiento de los medios previamente.",
          "CE4.4 Se han aplicado medidas de prevención de riesgos laborales.",
        ]
      },
      {
        ra: "RA5", title: "Diseña la evaluación de materiales, medios y recursos didácticos planteados.",
        ces: [
          "CE5.1 Se han planificado estrategias y técnicas de evaluación de materiales.",
          "CE5.2 Se han diseñado criterios y procedimientos de evaluación.",
          "CE5.3 Se han establecido indicadores de evaluación en diferentes momentos.",
          "CE5.4 Se han evaluado y actualizado materiales para futuras acciones formativas.",
        ]
      },
    ]
  },
  {
    code: "1707",
    title: "Orientación profesional en los Grados A, B y C del Sistema de Formación Profesional",
    hours: 60,
    ras: [
      {
        ra: "RA1", title: "Selecciona cauces informativos y estrategias de búsqueda y actualización de la información del entorno profesional y productivo.",
        ces: [
          "CE1.1 Se han identificado fuentes actualizadas del contexto socio-laboral.",
          "CE1.2 Se han determinado técnicas y estrategias de búsqueda de empleo.",
          "CE1.3 Se ha reflexionado sobre actitudes, aptitudes y competencias requeridas.",
          "CE1.4 Se ha recopilado información sobre oferta formativa y contexto profesional.",
        ]
      },
      {
        ra: "RA2", title: "Determina técnicas específicas en el proceso de información y orientación profesional al alumnado.",
        ces: [
          "CE2.1 Se han definido perfiles profesionales reconociendo características del alumnado.",
          "CE2.2 Se han analizado características del alumnado destinatario.",
          "CE2.3 Se han concretado oportunidades de formación afines al perfil profesional.",
          "CE2.4 Se han establecido medios para favorecer la toma de decisiones.",
        ]
      },
      {
        ra: "RA3", title: "Asesora al alumnado sobre itinerarios formativos, formación profesional y oportunidades de empleo.",
        ces: [
          "CE3.1 Se han facilitado herramientas de autoconocimiento al alumnado.",
          "CE3.2 Se han proporcionado recursos para la búsqueda de empleo.",
          "CE3.3 Se han identificado itinerarios formativos y profesionales.",
        ]
      },
      {
        ra: "RA4", title: "Analiza mecanismos que garantizan la calidad de las acciones formativas, diseñando estrategias de innovación educativa.",
        ces: [
          "CE4.1 Se han identificado indicadores de calidad en formación profesional.",
          "CE4.2 Se han diseñado estrategias de innovación educativa.",
          "CE4.3 Se han analizado mecanismos de cooperación territorial.",
        ]
      },
      {
        ra: "RA5", title: "Aplica competencias digitales en el proceso de búsqueda de información y orientación profesional.",
        ces: [
          "CE5.1 Se han utilizado herramientas digitales para la orientación profesional.",
          "CE5.2 Se ha analizado el impacto de las TIC en el sector productivo.",
        ]
      },
      {
        ra: "RA6", title: "Caracteriza los retos ambientales y sociales a los que se enfrenta el entorno profesional y productivo.",
        ces: [
          "CE6.1 Se han identificado retos ambientales y sociales del sector.",
          "CE6.2 Se han analizado medidas de desarrollo sostenible aplicables.",
        ]
      },
    ]
  },
  {
    code: "1783",
    title: "Evaluación del proceso de enseñanza-aprendizaje de los Grados A, B y C del Sistema de la Formación Profesional",
    hours: 60,
    ras: [
      {
        ra: "RA1", title: "Analiza la normativa vigente sobre la evaluación, aplicándola al proceso de evaluación y calificación.",
        ces: [
          "CE1.1 Se ha identificado la normativa vigente de evaluación del Sistema de FP.",
          "CE1.2 Se han diferenciado los tipos de evaluación según normativa.",
          "CE1.3 Se han analizado los procedimientos de calificación.",
        ]
      },
      {
        ra: "RA2", title: "Analiza la finalidad y tipología de la evaluación en el actual Sistema de la Formación Profesional.",
        ces: [
          "CE2.1 Se ha analizado la finalidad de la evaluación formativa y sumativa.",
          "CE2.2 Se han identificado los tipos de evaluación: inicial, continua y final.",
        ]
      },
      {
        ra: "RA3", title: "Verifica el nivel formativo inicial del alumnado realizando una evaluación diagnóstica.",
        ces: [
          "CE3.1 Se han determinado técnicas para la recogida de información inicial.",
          "CE3.2 Se han seleccionado técnicas idóneas para la evaluación inicial.",
          "CE3.3 Se han utilizado instrumentos para comprobar el nivel inicial.",
          "CE3.4 Se ha adaptado la programación según resultados de la evaluación diagnóstica.",
        ]
      },
      {
        ra: "RA4", title: "Analiza pruebas e instrumentos de evaluación en acciones formativas atendiendo a las diferentes modalidades.",
        ces: [
          "CE4.1 Se han seleccionado herramientas e instrumentos de evaluación.",
          "CE4.2 Se han escogido pruebas según taxonomía de Bloom.",
          "CE4.3 Se han detallado ítems y normas de aplicación y corrección.",
          "CE4.4 Se han utilizado técnicas cuantitativas y cualitativas.",
        ]
      },
      {
        ra: "RA5", title: "Implementa técnicas de evaluación continua a lo largo del periodo formativo.",
        ces: [
          "CE5.1 Se han seleccionado técnicas de evaluación continua (observación, rúbricas, etc.).",
          "CE5.2 Se ha analizado el nivel de conocimientos adquiridos progresivamente.",
          "CE5.3 Se han realizado actividades evaluables de forma periódica.",
        ]
      },
      {
        ra: "RA6", title: "Determina procedimientos y pruebas de evaluación final que verifiquen el nivel de aprendizaje alcanzado.",
        ces: [
          "CE6.1 Se ha seguido el procedimiento de evaluación y autoevaluación final.",
          "CE6.2 Se ha analizado el contexto adecuándose a las características del grupo.",
          "CE6.3 Se han seleccionado indicadores de evaluación claros y objetivos.",
          "CE6.4 Se han aplicado pruebas teórico-prácticas.",
        ]
      },
      {
        ra: "RA7", title: "Programa la evaluación de la práctica docente, analizando los resultados para mejorar la calidad.",
        ces: [
          "CE7.1 Se han desarrollado los elementos de la programación didáctica evaluándolos.",
          "CE7.2 Se ha valorado la idoneidad de procedimientos y metodologías.",
          "CE7.3 Se ha reflexionado sobre el procedimiento de evaluación empleado.",
          "CE7.4 Se ha valorado la competencia digital docente.",
        ]
      },
    ]
  },
  {
    code: "1784",
    title: "Procesos para impartir acciones formativas de los Grados A, B y C del Sistema de Formación Profesional",
    hours: 90,
    ras: [
      {
        ra: "RA1", title: "Desarrolla estrategias facilitadoras del proceso de aprendizaje, propiciando condiciones favorables.",
        ces: [
          "CE1.1 Se han identificado principios y factores del proceso de enseñanza-aprendizaje.",
          "CE1.2 Se ha informado al alumnado sobre la estructura del programa formativo.",
          "CE1.3 Se han reconocido los elementos del proceso de enseñanza-aprendizaje.",
          "CE1.4 Se han comprobado condiciones ambientales, materiales y tecnológicas.",
          "CE1.5 Se ha generado un clima integrador entre el alumnado.",
        ]
      },
      {
        ra: "RA2", title: "Genera canales de cohesión y participación activa entre el alumnado.",
        ces: [
          "CE2.1 Se han discriminado las características del aprendizaje en grupo.",
          "CE2.2 Se han aplicado técnicas grupales (iniciación, producción, evaluación, cohesión).",
          "CE2.3 Se han propuesto dinámicas de grupo fomentando la creatividad y resolución de conflictos.",
        ]
      },
      {
        ra: "RA3", title: "Selecciona técnicas de comunicación, favoreciendo el buen clima y la relación entre personas.",
        ces: [
          "CE3.1 Se han reconocido los elementos de la comunicación en contexto formativo.",
          "CE3.2 Se han definido las etapas del proceso de comunicación.",
          "CE3.3 Se han reconocido los tipos de comunicación (verbal, no verbal, sincrónica, asincrónica, digital).",
          "CE3.4 Se han definido espacios y canales de comunicación según modalidad.",
        ]
      },
      {
        ra: "RA4", title: "Analiza estrategias metodológicas, utilizándolas para la comprobación de resultados de aprendizaje.",
        ces: [
          "CE4.1 Se han revisado las características de los métodos de aprendizaje (ABP, cooperativo, gamificación, etc.).",
          "CE4.2 Se han empleado metodologías activas.",
          "CE4.3 Se han discriminado métodos de enseñanza según objetivos y características del grupo.",
          "CE4.4 Se han identificado los elementos de una sesión formativa.",
          "CE4.5 Se ha empleado la técnica de microenseñanza y autoscopia.",
        ]
      },
      {
        ra: "RA5", title: "Reconoce aspectos psicopedagógicos que interceden en las acciones formativas.",
        ces: [
          "CE5.1 Se han identificado los principales factores psicopedagógicos del aprendizaje.",
          "CE5.2 Se han aplicado estrategias de motivación y atención personalizada.",
        ]
      },
      {
        ra: "RA6", title: "Determina instrumentos y procedimientos en el proceso de aprendizaje mediante estrategias personalizadas.",
        ces: [
          "CE6.1 Se han establecido condiciones y seleccionado instrumentos de verificación.",
          "CE6.2 Se ha identificado tipología de alumnado con necesidades específicas.",
          "CE6.3 Se ha elaborado un cronograma de actividades adaptado.",
          "CE6.4 Se han llevado a cabo estrategias metodológicas diferenciadas.",
          "CE6.5 Se han establecido cauces de comunicación sistemáticos y personalizados.",
        ]
      },
    ]
  },
  {
    code: "1785",
    title: "Acción tutorial de los Grados A, B y C del Sistema de Formación Profesional",
    hours: 60,
    ras: [
      {
        ra: "RA1", title: "Determina las condiciones y requisitos iniciales de una acción formativa en modalidad presencial, semipresencial y virtual.",
        ces: [
          "CE1.1 Se han identificado las características de la formación según régimen y modalidad.",
          "CE1.2 Se han considerado los requisitos de los centros para impartir formación.",
          "CE1.3 Se han considerado espacios, equipamientos, recursos y ratios.",
          "CE1.4 Se ha verificado que la modalidad responda a las características del alumnado.",
        ]
      },
      {
        ra: "RA2", title: "Reconoce la figura del tutor/a, asesorando, tutorizando e informando al alumnado.",
        ces: [
          "CE2.1 Se han determinado las funciones del personal de tutoría.",
          "CE2.2 Se ha definido la información que se ofrecerá al alumnado.",
          "CE2.3 Se ha establecido el plan de formación individual.",
          "CE2.4 Se han seleccionado técnicas, estrategias y recursos didácticos.",
          "CE2.5 Se han propuesto actividades con instrucciones claras y criterios bien definidos.",
          "CE2.6 Se han utilizado técnicas de dinamización grupal.",
        ]
      },
      {
        ra: "RA3", title: "Establece técnicas de tutorización presenciales, semipresenciales y virtuales con herramientas de seguimiento.",
        ces: [
          "CE3.1 Se han determinado funciones, habilidades y competencias del tutor.",
          "CE3.2 Se ha comprobado la accesibilidad del alumnado a materiales y plataforma.",
          "CE3.3 Se ha redactado la guía del alumnado como paso previo al inicio.",
          "CE3.4 Se han establecido métodos y herramientas tutoriales según perfil del alumnado.",
          "CE3.5 Se ha verificado el funcionamiento de la plataforma virtual.",
          "CE3.6 Se ha concretado el calendario de tutorías individuales y colectivas.",
        ]
      },
      {
        ra: "RA4", title: "Determina estrategias didácticas de las acciones formativas, seleccionando técnicas de comunicación.",
        ces: [
          "CE4.1 Se ha dado a conocer al alumnado el seguimiento del proceso de aprendizaje.",
          "CE4.2 Se han determinado actividades y trabajos según forma de conexión.",
          "CE4.3 Se ha determinado la participación en herramientas de comunicación (chat, foros).",
          "CE4.4 Se han establecido canales para la resolución de dudas.",
          "CE4.5 Se ha informado sobre procedimiento de la prueba de evaluación final presencial.",
        ]
      },
      {
        ra: "RA5", title: "Establece las condiciones para el desarrollo de la formación dual, en coordinación con la empresa.",
        ces: [
          "CE5.1 Se han definido las finalidades de la formación en empresa.",
          "CE5.2 Se ha organizado la formación dual en régimen general e intensivo.",
          "CE5.3 Se han previsto programas de formación individualizados.",
          "CE5.4 Se ha informado al alumnado del procedimiento de formación en empresa.",
        ]
      },
      {
        ra: "RA6", title: "Define los requisitos de superación de la acción formativa, comunicando la valoración del progreso.",
        ces: [
          "CE6.1 Se han previsto los requisitos de superación comunicándolos al alumnado.",
          "CE6.2 Se han definido instrumentos y procedimientos de evaluación.",
          "CE6.3 Se ha previsto la elaboración de una evaluación inicial.",
          "CE6.4 Se han comunicado los requisitos mínimos para la prueba final.",
          "CE6.5 Se ha asesorado individualmente al alumnado sobre su evolución.",
        ]
      },
    ]
  },
  {
    code: "1786",
    title: "Competencia digital para la práctica docente",
    hours: 30,
    ras: [
      {
        ra: "RA1", title: "Utiliza las competencias digitales en los procesos de enseñanza-aprendizaje.",
        ces: [
          "CE1.1 Se han utilizado estrategias de comunicación organizativa entre agentes educativos.",
          "CE1.2 Se han empleado tecnologías digitales corporativas y plataformas.",
          "CE1.3 Se ha gestionado la información a través de herramientas digitales.",
          "CE1.4 Se han aplicado buenas prácticas de seguridad y protección de datos.",
        ]
      },
    ]
  },
  {
    code: "1782",
    title: "Prevención de riesgos laborales",
    hours: 10,
    ras: [
      {
        ra: "RA1", title: "Aplica protocolos establecidos en materia de prevención de riesgos laborales.",
        ces: [
          "CE1.1 Se han identificado los factores de riesgo en la actividad profesional.",
          "CE1.2 Se han clasificado los tipos de daños profesionales.",
          "CE1.3 Se ha determinado la evaluación de riesgos en la empresa.",
          "CE1.4 Se han analizado los protocolos de actuación en caso de emergencia.",
          "CE1.5 Se han determinado los principales derechos y deberes en materia de PRL.",
          "CE1.6 Se han identificado técnicas básicas de primeros auxilios.",
        ]
      },
    ]
  },
];

export function generateProyectoFormativoPDF(params: ProyectoFormativoParams) {
  // LANDSCAPE orientation as per SEPE template
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const formatDate = (d?: string | null) => {
    if (!d) return "Por determinar";
    return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const addPageNumber = () => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 6, { align: "center" });
    }
  };

  const checkPageBreak = (needed: number) => {
    if (currentY + needed > pageHeight - 15) {
      doc.addPage();
      currentY = margin;
    }
  };

  const sectionHeader = (text: string) => {
    checkPageBreak(12);
    doc.setFillColor(...BLUE_HEADER);
    doc.rect(margin, currentY, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(text, margin + 3, currentY + 5.5);
    doc.setTextColor(0);
    currentY += 10;
  };

  // ===== PAGE 1: COVER =====
  currentY = 35;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...BLUE_HEADER);
  doc.text("PROYECTO FORMATIVO", pageWidth / 2, currentY, { align: "center" });
  currentY += 12;
  doc.setFontSize(20);
  doc.text("AULA VIRTUAL", pageWidth / 2, currentY, { align: "center" });
  currentY += 16;

  doc.setDrawColor(...BLUE_HEADER);
  doc.setLineWidth(0.5);
  doc.line(margin + 40, currentY, pageWidth - margin - 40, currentY);
  currentY += 12;

  doc.setTextColor(50);
  doc.setFontSize(11);
  doc.text("CERTIFICADO PROFESIONAL:", margin + 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  currentY += 7;
  const cpText = `${params.courseCode} - ${params.courseTitle}`;
  const cpLines = doc.splitTextToSize(cpText, contentWidth - 40);
  doc.text(cpLines, margin + 20, currentY);
  currentY += cpLines.length * 5 + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("EXPEDIENTE:", margin + 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("(A cumplimentar antes del inicio de la acción formativa)", margin + 50, currentY);
  currentY += 12;

  // Center info block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CENTRO DE FORMACIÓN:", margin + 20, currentY);
  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(params.centerName, margin + 20, currentY);
  currentY += 5;
  if (params.centerCif) { doc.text(`CIF: ${params.centerCif}`, margin + 20, currentY); currentY += 5; }
  if (params.centerAddress) {
    doc.text(params.centerAddress, margin + 20, currentY); currentY += 5;
    doc.text(`${params.centerPostalCode || ""} ${params.centerCity || ""} (${params.centerProvince || ""})`, margin + 20, currentY);
    currentY += 5;
  }
  if (params.centerPhone) { doc.text(`Tel: ${params.centerPhone}`, margin + 20, currentY); currentY += 5; }
  if (params.centerEmail) { doc.text(`Email: ${params.centerEmail}`, margin + 20, currentY); }

  // ===== PAGE 2: INSTRUCCIONES =====
  doc.addPage();
  currentY = margin;
  sectionHeader("INSTRUCCIONES");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const instrLines = [
    "El presente Anexo al proyecto formativo, deberá de cumplimentarse y entregarse para la impartición a través de aula virtual, tal y como recoge el artículo 28, de la orden 178/2020, de 19 de noviembre.",
    "",
    "Este anexo diseñado para la formación auxiliar a través de aula virtual, consta de:",
    "  1. Los datos de los recursos humanos y técnicos.",
    "  2. La programación de los contenidos impartidos a través del aula virtual.",
    "",
    "Se recuerda, así mismo:",
    "  1. Que se considera aula virtual, al entorno de aprendizaje, donde el formador/a y el alumnado interactúan, de forma concurrente y en tiempo real, a través de un sistema de comunicación telemático de carácter síncrono.",
    "  2. No se podrá utilizar el aula virtual para la realización de la prueba final de módulo.",
    "  3. A título orientativo, en aquellos certificados profesionales que posean \"Especificaciones de los certificados profesionales en modalidad de teleformación\" en forma de ficha, en el anexo I de la Orden ESS/1897/2013, de 10 de octubre, se pueden consultar que contenidos son los idóneos para su impartición a través de esta modalidad.",
    "",
    "El presente F-11 sólo se debe cumplimentar para aquellos contenidos que se vayan a impartir mediante aula virtual.",
    "Este documento se debe presentar cuando se comunique el uso del aula virtual, a través de \"incidencias/otras\"."
  ];
  instrLines.forEach(line => {
    const splitLines = doc.splitTextToSize(line || " ", contentWidth - 6);
    checkPageBreak(splitLines.length * 4);
    doc.text(splitLines, margin + 3, currentY);
    currentY += splitLines.length * 4 + 1;
  });

  // ===== PAGE 3: RECURSOS HUMANOS Y TÉCNICOS =====
  doc.addPage();
  currentY = margin;
  sectionHeader("RECURSOS HUMANOS Y TÉCNICOS DEL AULA VIRTUAL");

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "RECURSOS HUMANOS", colSpan: 4, styles: { fillColor: BLUE_HEADER } }]],
    body: [
      [
        { content: "Nombre del tutor/a\n-formador/a responsable:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 50 } },
        { content: "(A cumplimentar con datos del tutor asignado)" },
        { content: "Teléfono de contacto:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 40 } },
        { content: params.centerPhone || "" }
      ],
      [
        { content: "E-mail", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
        { content: params.centerEmail || "(A cumplimentar)", colSpan: 3 }
      ]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "DATOS DEL AULA ON-LINE ACCESO ALUMNADO", colSpan: 2, styles: { fillColor: BLUE_HEADER } }]],
    body: [
      [{ content: "Aula virtual (nombre):", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 50 } }, "TalentCloud Solution - Campus Virtual"],
      [{ content: "URL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.platformUrl || "https://campus.talentcloudsolution.com"],
      [{ content: "Usuario:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, "(Se proporcionará individualmente al alumnado)"],
      [{ content: "Contraseña:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, "(Se proporcionará individualmente al alumnado)"]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "DATOS DEL AULA ON-LINE ACCESO AL ADMINISTRADOR", colSpan: 3, styles: { fillColor: BLUE_HEADER } }]],
    body: [
      [
        { content: "URL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
        { content: "Usuario:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
        { content: "Contraseña:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }
      ],
      [params.platformUrl || "https://campus.talentcloudsolution.com", "(Datos reservados)", "(Datos reservados)"]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });

  // ===== F11 PAGES: One per module with real BOE data =====
  BOE_CURRICULUM.forEach((modCurr) => {
    doc.addPage();
    currentY = margin;

    sectionHeader(`F11- PROGRAMACIÓN DIDÁCTICA: ${modCurr.code}. ${modCurr.title}`);

    // Header info
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: [
        [
          { content: "DURACIÓN ACCIÓN", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 35 } },
          { content: `${params.durationHours}h`, styles: { cellWidth: 25 } },
          { content: "FECHA INICIO", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 30 } },
          { content: formatDate(params.startDate), styles: { cellWidth: 30 } },
          { content: "FECHA FIN", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 25 } },
          { content: formatDate(params.endDate), styles: { cellWidth: 30 } },
          { content: "HORAS MÓDULO", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 30 } },
          { content: `${modCurr.hours}h`, styles: { cellWidth: 20 } }
        ]
      ],
      theme: "grid",
      bodyStyles: { fontSize: 7.5 },
      styles: { cellPadding: 2 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 3;

    // CP and Module
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: [
        [
          { content: "CÓDIGO Y DENOMINACIÓN DEL\nCERTIFICADO PROFESIONAL", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 55 } },
          { content: `${params.courseCode} - ${params.courseTitle}` }
        ],
        [
          { content: "CÓDIGO Y DENOMINACIÓN DEL\nMÓDULO PROFESIONAL", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 55 } },
          { content: `${modCurr.code}. ${modCurr.title} (${modCurr.hours}h)` }
        ]
      ],
      theme: "grid",
      bodyStyles: { fontSize: 7.5 },
      styles: { cellPadding: 3 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 5;

    // Main programming table: RA + CE + Methodology + Spaces
    const bodyRows: any[][] = [];

    modCurr.ras.forEach((ra) => {
      // First row: RA title with all CEs
      const cesText = ra.ces.join("\n");
      bodyRows.push([
        { content: `${ra.ra}: ${ra.title}`, styles: { fontStyle: "bold", fontSize: 7 } },
        { content: cesText },
        { content: getMethodologyText(modCurr.code) },
        { content: "Campus Virtual TalentCloud Solution\n\nAula virtual síncrona (videoconferencia)\n\nPlataforma LMS con acceso 24h" },
        { content: modCurr.code === "1782" ? "X" : "", styles: { halign: "center" as const } }
      ]);
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        { content: "Resultados de Aprendizaje (RA)\nObjetivos específicos", styles: { cellWidth: 55 } },
        { content: "Criterios de Evaluación (CE)\nContenidos y secuenciación" },
        { content: "Estrategias metodológicas,\nactividades de aprendizaje\ny recursos didácticos", styles: { cellWidth: 55 } },
        { content: "AULA / TALLER\n(espacios, instalaciones\ny equipamiento)", styles: { cellWidth: 45 } },
        { content: "EN LA\nEMPRESA\n(X)", styles: { cellWidth: 16 } }
      ]],
      body: bodyRows,
      theme: "grid",
      headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 7, fontStyle: "bold", halign: "center" as const, valign: "middle" as const },
      bodyStyles: { fontSize: 6.5, valign: "top" as const },
      styles: { cellPadding: 2, overflow: "linebreak" as const },
      didDrawPage: () => {
        // Header on each new page
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`${modCurr.code}. ${modCurr.title}`, margin, margin - 3);
        doc.setTextColor(0);
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;
  });

  // ===== LAST SECTION: PRL =====
  doc.addPage();
  currentY = margin;
  sectionHeader("F11- PROGRAMACIÓN DIDÁCTICA. CONTENIDO PREVENCIÓN DE RIESGOS LABORALES");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("La formación en PRL es obligatoria para todo el alumnado que tenga que hacer FORMACIÓN EN EMPRESAS y debe justificarse la formación recibida.", margin + 3, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["ENTIDAD IMPARTIDORA", "MODALIDAD DE FORMACIÓN", "PROGRAMA"]],
    body: [[
      "☒ Formación impartida por el centro de formación.\n☐ Formación impartida por empresa externa.",
      "☐ Presencial\n☒ Teleformación",
      "☐ Formación complementaria\n☐ Formación propia\n☒ Módulo formativo dentro del CP"
    ]],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 4 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: [
      [
        { content: "Fecha inicio formación PRL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
        formatDate(params.startDate),
        { content: "Fecha fin formación PRL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
        formatDate(params.endDate)
      ]
    ],
    theme: "grid",
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "COMPETENCIAS QUE SE ADQUIEREN CON LA FORMACIÓN DE PRL", colSpan: 1, styles: { fillColor: BLUE_HEADER } }]],
    body: [
      ["1. Resaltar la importancia de la cultura preventiva en todos los ámbitos de la empresa."],
      ["2. Clasificar y describir los tipos de daños profesionales (accidentes de trabajo y enfermedades profesionales)."],
      ["3. Determinar la evaluación de riesgos y definir técnicas de prevención y protección."],
      ["4. Realizar el análisis de los protocolos de actuación en caso de emergencia."],
      ["5. Determinar los principales derechos y deberes en materia de prevención de riesgos laborales."],
      ["6. Clasificar las distintas formas de gestión de la prevención en la empresa."],
      ["7. Valorar la importancia del plan preventivo y su contenido."],
      ["8. Determinar los requisitos para la vigilancia de la salud."],
      ["9. Identificar las técnicas básicas de primeros auxilios."]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    styles: { cellPadding: 2.5 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 6;

  checkPageBreak(40);
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Espacios, instalaciones\ny equipamiento", "Contenidos", "Estrategias metodológicas", "PRUEBA DE EVALUACIÓN"]],
    body: [[
      "Campus Virtual\nTalentCloud Solution\n(Plataforma LMS)",
      "Módulo 1782: Prevención de riesgos laborales\n- Factores de riesgo\n- Daños profesionales\n- Evaluación de riesgos\n- Protocolos de emergencia\n- Derechos y deberes PRL\n- Primeros auxilios",
      "• Contenido Interactivo Multimedia\n• Test de autoevaluación\n• Actividades prácticas\n• Foro temático\n• Recursos complementarios",
      "Test de evaluación tipo test\nFecha: Por determinar\n\nRequisito previo a la\nformación en empresa"
    ]],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 7, halign: "center" as const },
    bodyStyles: { fontSize: 7, valign: "top" as const },
    styles: { cellPadding: 3, minCellHeight: 30 }
  });

  // Page numbers
  addPageNumber();

  const fileName = `Proyecto_Formativo_AV_${params.courseCode.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(fileName);
}

function getMethodologyText(moduleCode: string): string {
  const base = [
    "• Contenido Interactivo Multimedia (CIM)",
    "• Actividades de aprendizaje evaluables",
    "• Foros temáticos",
    "• Tests de autoevaluación",
    "• Tutorías virtuales síncronas",
    "• Tutorías presenciales",
  ];

  switch (moduleCode) {
    case "1705":
      return [...base, "• Casos prácticos de programación didáctica", "• Elaboración de programaciones"].join("\n");
    case "1706":
      return [...base, "• Diseño de materiales didácticos", "• Prácticas con herramientas multimedia"].join("\n");
    case "1707":
      return [...base, "• Análisis del mercado laboral", "• Simulación de orientación profesional"].join("\n");
    case "1783":
      return [...base, "• Diseño de instrumentos de evaluación", "• Prácticas de corrección y calificación"].join("\n");
    case "1784":
      return [...base, "• Microenseñanza y autoscopia", "• Dinámicas de grupo", "• Simulación docente"].join("\n");
    case "1785":
      return [...base, "• Guías de tutoría", "• Seguimiento individualizado", "• Coordinación con empresa"].join("\n");
    case "1786":
      return [...base, "• Herramientas digitales educativas", "• Plataformas LMS y IA educativa"].join("\n");
    case "1782":
      return [...base, "• Análisis de riesgos", "• Protocolos de emergencia", "• Primeros auxilios"].join("\n");
    default:
      return base.join("\n");
  }
}
