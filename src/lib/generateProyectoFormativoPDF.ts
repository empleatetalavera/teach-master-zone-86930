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
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  
  // Sanitize text to avoid jsPDF encoding issues with special chars
  const sanitize = (t: string) => t
    .replace(/→/g, '>').replace(/—/g, '-').replace(/–/g, '-')
    .replace(/\u201c/g, '"').replace(/\u201d/g, '"')
    .replace(/\u2018/g, "'").replace(/\u2019/g, "'")
    .replace(/●/g, '-').replace(/•/g, '-');
  const _origText = doc.text.bind(doc);
  (doc as any).text = (text: any, x: number, y: number, options?: any) => {
    if (typeof text === 'string') text = sanitize(text);
    else if (Array.isArray(text)) text = text.map((t: any) => typeof t === 'string' ? sanitize(t) : t);
    return _origText(text, x, y, options);
  };
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

  const subHeader = (text: string) => {
    checkPageBreak(10);
    doc.setFillColor(...LIGHT_BLUE);
    doc.rect(margin, currentY, contentWidth, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(text, margin + 3, currentY + 5);
    currentY += 9;
  };

  const paragraph = (text: string, fontSize = 8) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(30);
    const lines = doc.splitTextToSize(text, contentWidth - 6);
    checkPageBreak(lines.length * 4 + 2);
    doc.text(lines, margin + 3, currentY);
    currentY += lines.length * 4 + 2;
  };

  const bulletList = (items: string[], fontSize = 8) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(30);
    items.forEach(item => {
      const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 10);
      checkPageBreak(lines.length * 4 + 1);
      doc.text(lines, margin + 5, currentY);
      currentY += lines.length * 4 + 1;
    });
    currentY += 2;
  };

  const platformUrl = params.platformUrl || `https://campus.${params.centerName.toLowerCase().replace(/\s+/g, '')}.com`;
  const fullAddress = `${params.centerAddress || ""}, ${params.centerPostalCode || ""} ${params.centerCity || ""} (${params.centerProvince || ""})`;

  // ===== PAGE 1: COVER =====
  currentY = 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...BLUE_HEADER);
  doc.text("PROYECTO FORMATIVO", pageWidth / 2, currentY, { align: "center" });
  currentY += 14;
  doc.setFontSize(16);
  doc.text("Modalidad Teleformación", pageWidth / 2, currentY, { align: "center" });
  currentY += 16;

  doc.setDrawColor(...BLUE_HEADER);
  doc.setLineWidth(0.5);
  doc.line(margin + 40, currentY, pageWidth - margin - 40, currentY);
  currentY += 14;

  doc.setTextColor(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CERTIFICADO PROFESIONAL:", margin + 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  currentY += 7;
  const cpLines = doc.splitTextToSize(`${params.courseCode} - ${params.courseTitle}`, contentWidth - 40);
  doc.text(cpLines, margin + 20, currentY);
  currentY += cpLines.length * 5 + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CENTRO DE FORMACIÓN:", margin + 20, currentY);
  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(params.centerName, margin + 20, currentY); currentY += 5;
  if (params.centerCif) { doc.text(`CIF: ${params.centerCif}`, margin + 20, currentY); currentY += 5; }
  if (params.centerAddress) {
    doc.text(fullAddress, margin + 20, currentY); currentY += 5;
  }
  if (params.centerPhone) { doc.text(`Tel: ${params.centerPhone}`, margin + 20, currentY); currentY += 5; }
  if (params.centerEmail) { doc.text(`Email: ${params.centerEmail}`, margin + 20, currentY); currentY += 5; }
  currentY += 5;
  doc.text(`Sitio WEB: ${platformUrl}`, margin + 20, currentY);

  // ===== PAGE 2: CLAVES DE ACCESO =====
  doc.addPage();
  currentY = margin;
  sectionHeader(`CLAVES DE ACCESO AL CAMPUS ${params.centerName.toUpperCase()}`);

  paragraph("En la solicitud telemática de acreditación del certificado de profesionalidad en modalidad teleformación, se han incluido unas claves de acceso con un perfil de administrador, que permiten el acceso a las herramientas y recursos necesarios para gestionar, administrar, organizar, diseñar, impartir y evaluar acciones formativas a través de Internet tal y como se indica en el punto \"1. Requisitos técnicos de la plataforma de teleformación\" del anexo II de la Orden ESS/1897/2013, de 10 de octubre.");
  currentY += 3;
  paragraph("No obstante, a continuación facilitamos las siguientes claves de acceso para los perfiles de alumno y de tutor-formador para poder verificar las herramientas y recursos de los que van a disponer:");
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin + 30, right: margin + 30 },
    head: [["CLAVE ALUMNO", "CLAVE TUTOR-FORMADOR"]],
    body: [
      ["Usuario: ALUMNOCERTIFICADOS\nContraseña: (A facilitar)", "Usuario: TUTORCERTIFICADOS\nContraseña: (A facilitar)"]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, halign: "center" as const },
    bodyStyles: { fontSize: 9, halign: "center" as const },
    styles: { cellPadding: 5 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ===== PAGE 3: DATOS DEL CENTRO =====
  doc.addPage();
  currentY = margin;
  sectionHeader("1. DATOS DEL CENTRO QUE SOLICITA LA ACREDITACIÓN");

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: [
      [{ content: "Nombre:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 40 } }, params.centerName],
      [{ content: "CIF/NIF/NIE:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.centerCif || "(A cumplimentar)"],
      [{ content: "Sitio WEB:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, platformUrl],
      [{ content: "Dirección:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, fullAddress],
      [{ content: "Teléfono:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.centerPhone || ""],
      [{ content: "Email:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.centerEmail || ""],
    ],
    theme: "grid",
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ===== SECTION 2: CARACTERIZACIÓN =====
  sectionHeader("2. CARACTERIZACIÓN DE LA ACCIÓN FORMATIVA");

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Código", "Denominación"]],
    body: [[params.courseCode, params.courseTitle]],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 6;

  subHeader("Relación de módulos y unidades formativas");

  const modulesTableBody: any[][] = BOE_CURRICULUM.map(m => [
    `${m.code}. ${m.title}`,
    `${m.hours}`,
    "2"
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Módulo", "Duración (horas)", "Nº tutores-formadores"]],
    body: modulesTableBody,
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    styles: { cellPadding: 2.5 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 4;

  paragraph("Nota: Para establecer el número de tutores-formadores se atiende a lo estipulado en el art. 6 y el artículo 30 de la Orden ESS/1897/2013 de 10 de octubre, y en el apartado 4 de la Disposición adicional quinta de la Resolución de 26 de mayo del Servicio Público de Empleo Estatal.", 7);

  // ===== SECTION 3: ORGANIZACIÓN Y GESTIÓN =====
  doc.addPage();
  currentY = margin;
  sectionHeader("3. ORGANIZACIÓN Y GESTIÓN DE LA ACCIÓN FORMATIVA");

  // 3a: Selección del alumnado
  subHeader("Selección del alumnado");
  paragraph("Para la selección del alumnado de la acción formativa se tendrán en cuenta las siguientes cuestiones:");
  bulletList([
    "Número máximo de alumnos",
    "Ámbito geográfico",
    "Medios de difusión",
    "Procedimiento de solicitud, inscripción, selección y matriculación",
    "Procedimiento de seguimiento del alumnado",
    "Instrumentos para el seguimiento del alumnado"
  ]);

  subHeader("a) NÚMERO MÁXIMO DE ALUMNOS");
  paragraph("15. No obstante, el número de alumnos se ajustará a lo establecido en el apartado 3 del artículo 6 de la Orden ESS/1897/2013 de 10 de octubre, y a la disponibilidad de plazas para la realización de las sesiones presenciales (pruebas de evaluación final y, en su caso, tutorías presenciales).");

  subHeader("b) ÁMBITO GEOGRÁFICO");
  paragraph("ESTATAL");
  paragraph("Los centros acreditados para las sesiones presenciales en los que tendrán lugar las pruebas de evaluación final y las tutorías presenciales son:");

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["DIRECCIÓN DEL CENTRO DE FORMACIÓN"]],
    body: [[`${params.centerName}\n${fullAddress}`]],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 4 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 4;
  paragraph("Nota: se ampliarán los centros en función de las necesidades del alumnado y de la impartición.", 7);

  subHeader("c) MEDIOS DE DIFUSIÓN");
  paragraph("c.1) Página Web de la entidad. Siempre, a través de la Web de la entidad, donde se recogerá la siguiente información: objetivos y programa de la acción formativa, fechas de realización, metodología y requisitos de acceso.");
  paragraph("En relación a los requisitos de acceso se publicará la información relativa a:");
  bulletList([
    "Requisitos para el acceso a certificados de profesionalidad de niveles 2 y/o 3 según lo establecido en el art. 5.5.c y 20 del RD 34/2008, modificados y/o incorporados por el RD 1675/2010 y el RD 189/2013, y lo establecido en el artículo 4 o en el anexo del Real Decreto que aprueba cada certificado de profesionalidad.",
    "Requisitos de comprobación o acreditación de las competencias digitales establecida en el apartado 2 del artículo 6 de la Orden ESS/1897/2013.",
    "Otros requisitos establecidos en base a la normativa que regule la formación financiada con fondos públicos."
  ], 7);
  paragraph("c.2) Otros según normativa. Además, en caso de acciones formativas financiadas con fondos públicos, a través de los medios que se establezcan en las bases de la convocatoria.", 7);

  // d) Procedimiento de solicitud
  checkPageBreak(60);
  subHeader("d) PROCEDIMIENTO DE SOLICITUD, INSCRIPCIÓN, SELECCIÓN Y MATRICULACIÓN");
  
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("Inscripción.", margin + 3, currentY); currentY += 5;
  paragraph("La persona solicitante debe completar la solicitud de inscripción en la acción formativa por vía telemática a través de la página Web de la entidad. En esta solicitud se incluyen datos personales y, en caso de formación financiada a través de la iniciativa privada, los datos sobre modo de pago. El plazo de inscripción estará abierto todo el año.");

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("Recogida de datos y comprobación de requisitos.", margin + 3, currentY); currentY += 5;
  paragraph("Desde la entidad un/a orientador/a académico contactará con la persona solicitante con objeto de:");
  bulletList([
    "Informar de las fechas del curso.",
    "Recabar la información/documentación acreditativa del cumplimiento de los requisitos para acceder a la formación del certificado de profesionalidad.",
    `Realización de la prueba de competencia digital, establecida en el apartado 2 del artículo 6 de la Orden ESS/1897/2013, o recopilación de la documentación que acredite la exención. Para la realización de dicha prueba se facilitará a través de correo electrónico la URL de acceso al Campus ${params.centerName}, una guía de uso, e instrucciones junto con claves de acceso temporal.`,
    "Recabar la información/documentación para acreditación de requisitos establecidos en la normativa de formación financiada con fondos públicos.",
    "Informar sobre las fechas de desarrollo, o realizar directamente vía telemática, pruebas específicas para la selección.",
    "Recabar y registrar en la plataforma LMS: sexo, edad, nivel formativo, situación laboral, provincia/CA de residencia, medio de conocimiento, experiencia online, razones de elección de teleformación, valoración sobre la modalidad."
  ], 7);

  checkPageBreak(30);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("Matriculación.", margin + 3, currentY); currentY += 5;
  paragraph("El proceso de matriculación depende de la vía de financiación:");
  bulletList([
    "En caso de financiación privada: aportar toda la documentación, haber realizado el ingreso del precio del curso, y haber desarrollado la prueba de competencia digital, con una antelación mínima de 10 días.",
    "En caso de financiación pública: la matriculación se realizará una vez la Administración Competente haya dado el visto bueno a la selección del alumnado."
  ], 7);

  checkPageBreak(30);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("Comunicación de inicio.", margin + 3, currentY); currentY += 5;
  paragraph("Una vez cumplido lo establecido, desde la entidad, con una antelación mínima de 7 días a la fecha de inicio, se facilitará a través de correo electrónico:");
  bulletList([
    "URL de acceso al Campus.",
    "Claves de acceso a la plataforma.",
    "Guía del alumno.",
    "Guía de uso de la plataforma LMS.",
    "Fechas de inicio y fin de la acción formativa.",
    "Información de los tutores-formadores y horario de tutorías.",
    "Medios de contacto con la entidad.",
    `Instrucciones para el/la alumno/a para responder confirmando el correcto acceso al Campus ${params.centerName}.`
  ], 7);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  checkPageBreak(10);
  doc.text("Comprobación de acceso a Campus.", margin + 3, currentY); currentY += 5;
  paragraph(`Desde la entidad, el/la orientador/a académico/a contactará con aquellos/as alumnos/as que no hayan confirmado su acceso al Campus ${params.centerName} con una antelación mínima de 2 días a la fecha de inicio.`);

  // e) Procedimiento de seguimiento
  checkPageBreak(40);
  subHeader("e) PROCEDIMIENTO DE SEGUIMIENTO DEL ALUMNADO");
  paragraph("Una vez iniciada la acción formativa el seguimiento del alumnado se desarrollará a través de los medios y herramientas, así como en los momentos, que se indican a continuación:");

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("1) Durante la formación en la plataforma de formación virtual", margin + 3, currentY); currentY += 5;
  bulletList([
    "Inicio: sesión inicial con el tutor-formador para informar sobre objetivos, organización, programación didáctica, planificación de la evaluación. Realización de encuesta de diagnóstico inicial sobre conocimientos previos y motivación.",
    "Semanalmente: seguimiento del desarrollo y contacto a través del correo electrónico para informar sobre tareas pendientes. Apoyo a través de las herramientas de la plataforma LMS.",
    "A lo largo del curso: tutorías virtuales a través de videoconferencia, chat, foro, para evaluar el desarrollo e informar sobre las pruebas de evaluación.",
    "A la finalización: contacto individualizado con cada alumno para comentar el desarrollo y los resultados obtenidos."
  ], 7);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); 
  checkPageBreak(20);
  doc.text("2) Durante las tutorías presenciales en el centro de formación", margin + 3, currentY); currentY += 5;
  bulletList([
    "Antes: al menos 10 días, comunicación de lugar, fechas y horario por el tutor-formador.",
    "Supervisión por parte del formador durante el desarrollo.",
    "Contacto del tutor-formador tras la finalización y comunicación de resultados."
  ], 7);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  checkPageBreak(15);
  doc.text("3) Tras la finalización de la formación", margin + 3, currentY); currentY += 5;
  bulletList([
    "Contacto del tutor-formador con el alumno vía correo electrónico o telefónico, para valoración de la satisfacción e impacto de la formación sobre el desarrollo profesional, laboral y personal.",
    "Durante la formación se utilizarán preferentemente las herramientas de comunicación de la plataforma. En caso de no obtener respuesta, se utilizarán medios externos (correo electrónico o teléfono)."
  ], 7);

  // f) Instrumentos de seguimiento
  checkPageBreak(15);
  subHeader("f) INSTRUMENTOS PARA EL SEGUIMIENTO DEL ALUMNADO");
  paragraph(`Siguiendo la normativa para el desarrollo del seguimiento, la plataforma de teleformación debe posibilitar la emisión de una serie de informes de seguimiento. La plataforma dispone de estos informes a los que se puede acceder a través de Menú/Administración/Informes. Al acceder a esta área se muestra la equivalencia entre los informes requeridos en la Orden ESS/1897/2013 y la denominación de estos informes en el Campus ${params.centerName}.`);

  // Perfil de tutores
  checkPageBreak(30);
  subHeader("Perfil de los tutores-formadores intervinientes");

  const tutorProfileRows = BOE_CURRICULUM.filter(m => m.code !== "1782").map(m => [
    m.code,
    m.title,
    "Licenciado, Ingeniero, Arquitecto o el título de grado correspondiente u otros títulos equivalentes.",
    "1 año"
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Módulo", "Denominación", "Acreditación requerida", "Experiencia profesional"]],
    body: tutorProfileRows,
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    styles: { cellPadding: 2 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // RECURSOS MATERIALES
  checkPageBreak(20);
  subHeader("Recursos materiales y humanos");

  doc.setFont("helvetica", "bold"); doc.setFontSize(9); 
  checkPageBreak(10);
  doc.text("RECURSOS MATERIALES", margin + 3, currentY); currentY += 6;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("A) Recursos para la formación en la plataforma de teleformación", margin + 3, currentY); currentY += 5;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("Recursos tecnológicos generales:", margin + 5, currentY); currentY += 5;
  bulletList([
    `Plataforma de teleformación: Campus ${params.centerName} - Plataforma LMS.`,
    "Herramientas de comunicación síncrona: Chat, Videoconferencia, Mensajería instantánea.",
    "Herramientas de comunicación asíncrona: Foros de debate, Correo electrónico interno, Tablón de anuncios.",
    "Herramientas de seguimiento y evaluación: Tests autoevaluables, Actividades evaluables, Informes de seguimiento, Registro de actividad.",
    "Herramientas de gestión: Gestión de alumnos, Gestión de tutores, Calendario, Expediente académico.",
    "Accesibilidad: Compatible con los principales navegadores web, acceso 24h/365d."
  ], 7);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  checkPageBreak(15);
  doc.text("Recursos tecnológicos específicos para la acción formativa:", margin + 5, currentY); currentY += 5;
  bulletList([
    "Contenidos Interactivos Multimedia (CIM) para cada módulo formativo/unidad formativa.",
    "Actividades de autoevaluación integradas en el CIM.",
    "Tests de evaluación por módulo/unidad formativa.",
    "Actividades de aprendizaje evaluables (casos prácticos, ejercicios teórico-prácticos).",
    "Foros de debate temáticos por unidad didáctica.",
    "Documentos de apoyo y material complementario (documentos PDF, vídeos, enlaces web).",
    "Glosario de términos."
  ], 7);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  checkPageBreak(20);
  doc.text("Recursos didácticos:", margin + 5, currentY); currentY += 5;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["ALUMNO", "TUTOR-FORMADOR"]],
    body: [[
      "• Guía del alumno\n• Guía de uso de la plataforma LMS\n• Contenido Interactivo Multimedia (CIM)\n• Cuaderno del alumno (ejercicios y actividades)\n• Material complementario (documentos, vídeos)\n• Glosario de términos",
      "• Guía del tutor-formador\n• Orientaciones metodológicas por módulo/UF\n• Cuaderno del formador\n• Instrumentos de evaluación\n• Guía de uso de la plataforma LMS\n• Plantillas de documentación preceptiva"
    ]],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8, halign: "center" as const },
    bodyStyles: { fontSize: 7.5 },
    styles: { cellPadding: 4 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 6;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  checkPageBreak(15);
  doc.text("B) Recursos para las sesiones presenciales en el centro de formación", margin + 3, currentY); currentY += 5;
  bulletList([
    "Aula equipada con capacidad mínima de 15 alumnos.",
    "Equipos informáticos con conexión a Internet para cada alumno.",
    "Proyector multimedia y pantalla de proyección.",
    "Pizarra (tradicional y/o digital).",
    "Material fungible (papel, bolígrafos, etc.).",
    "Impresora para la impresión de pruebas de evaluación."
  ], 7);

  // RECURSOS HUMANOS
  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  checkPageBreak(15);
  doc.text("RECURSOS HUMANOS", margin + 3, currentY); currentY += 6;

  const rrhhData = [
    { role: "a) Personal de venta/captación", desc: "Información a personas interesadas sobre la acción formativa. Asesoramiento sobre cuestiones del procedimiento de inscripción/matriculación, financiación y requisitos de acceso." },
    { role: "b) Personal administrativo y de orientación académica", desc: "Realización de la prueba de competencia digital durante el proceso de inscripción/matriculación. Selección de participantes, constitución de grupos y gestión de documentación. Comunicación de inicio de acciones formativas a la Administración Competente. Gestión del aprovisionamiento de recursos materiales. Asesoramiento al alumno para el inicio y durante el desarrollo de la acción formativa. Supervisión del desarrollo correcto de la acción formativa." },
    { role: "c) Tutor/a-formador/a", desc: "Acogida de los alumnos y explicación del proceso formativo en la sesión inicial. Información al alumno sobre los hitos del curso. Seguimiento del alumnado a través de las vías de contacto e instrumentos de seguimiento. Corrección de actividades de aprendizaje. Información puntual y periódica al alumnado sobre resultados. Atención de consultas individuales. Adaptación de procesos de aprendizaje. Organización de tutorías virtuales grupales. Coordinación con el formador para sesiones presenciales. Comunicación de incidencias." },
    { role: "d) Formador/a (si distinto del tutor)", desc: "Organización con el tutor-formador de las sesiones presenciales. Desarrollo de las sesiones presenciales y corrección de actividades e instrumentos de evaluación. Atención de consultas de alumnos durante sesiones presenciales. Control de asistencia. Comunicación de incidencias al tutor-formador. Cumplimentación de documentación preceptiva." },
    { role: "e) Personal informático", desc: "Mantenimiento del funcionamiento de la plataforma de teleformación. Atención y resolución de incidencias de alumnos recibidas a través del CAU. Prestación de ayuda y soporte técnico al personal. Gestión de quejas y reclamaciones técnicas." },
    { role: "f) Personal de administración", desc: "Gestión de cobros (formación privada y/o pública). Atención de quejas y reclamaciones económicas. Justificación económica y/o liquidación en formación pública." },
    { role: "g) Personal de atención al cliente", desc: "Recepción/recogida de quejas y reclamaciones. Derivación al personal administrativo y de gestión académica de la acción formativa." },
    { role: "h) Tutor de empresa", desc: "Desarrollo, junto con el tutor-formador, de la programación didáctica y planificación de la evaluación. Supervisión y apoyo al alumno durante la formación práctica. Atención de dudas y consultas. Comunicación de incidencias. Evaluación de la formación práctica junto con el tutor-formador." }
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Perfil", "Descripción de funciones"]],
    body: rrhhData.map(r => [r.role, r.desc]),
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 7, valign: "top" as const },
    styles: { cellPadding: 3, overflow: "linebreak" as const },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" } }
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Sistemas de gestión de la calidad
  checkPageBreak(25);
  subHeader("Sistemas de gestión de la calidad de la formación");
  paragraph("La entidad dispone de un sistema de gestión de la calidad conforme a la norma UNE EN ISO 9001:2015. El alcance de las actividades certificadas incluye: Prestación de los servicios de formación general, incluyendo formación profesional para el empleo y certificados de profesionalidad.");
  paragraph("En el Anexo B se adjunta documentación acreditativa del sistema de gestión de la calidad.");

  // Indicadores de calidad
  checkPageBreak(25);
  subHeader("Indicadores e instrumentos para la medición de la calidad y la mejora continua");
  bulletList([
    "Encuesta de satisfacción del alumnado al finalizar cada módulo formativo/unidad formativa.",
    "Encuesta de satisfacción global al finalizar la acción formativa.",
    "Encuesta de evaluación del tutor-formador por parte del alumnado.",
    "Encuesta de valoración del impacto de la formación (3-6 meses tras la finalización).",
    "Informe de resultados de evaluación del aprendizaje por módulo/UF.",
    "Informe de seguimiento de la acción formativa (indicadores de actividad, participación, abandono).",
    "Registro de incidencias técnicas y pedagógicas.",
    "Informe de reclamaciones y sugerencias.",
    "Auditoría interna del proceso formativo."
  ], 7);

  // ===== SECTION 4: PROCESO FORMATIVO =====
  doc.addPage();
  currentY = margin;
  sectionHeader("4. PROCESO FORMATIVO");

  paragraph("A continuación, se incluye la siguiente documentación adjunta:");

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: [
      ["Planificación didáctica (curso completo)", "Según formato del Anexo III"],
      ["Programaciones didácticas (Por módulo/UF)", "Según formato del Anexo IV"],
      ["Planificaciones de la evaluación (Por módulo/UF)", "Según formato del Anexo V"],
    ],
    theme: "grid",
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold" } }
  });
  currentY = (doc as any).lastAutoTable.finalY + 6;

  paragraph("ANEXO A: Documentación acreditativa del derecho de uso de la plataforma de teleformación y del contenido virtual de aprendizaje.");
  paragraph("ANEXO B: Documentación justificativa de la implantación de un sistema de gestión de la calidad de la formación.");

  // ===== ANNEX III: PLANIFICACIÓN DIDÁCTICA =====
  doc.addPage();
  currentY = margin;
  sectionHeader("ANEXO III - PLANIFICACIÓN DIDÁCTICA (CURSO COMPLETO) - Modalidad Teleformación");

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: [
      [{ content: "CERTIFICADO PROFESIONAL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 55 } }, `${params.courseCode} - ${params.courseTitle}`],
      [{ content: "DURACIÓN DEL CERTIFICADO:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, `${params.durationHours} horas`],
      [{ content: "FECHAS DE IMPARTICIÓN:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, `Del ${formatDate(params.startDate)} al ${formatDate(params.endDate)}`],
      [{ content: "CENTRO DE FORMACIÓN:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.centerName],
      [{ content: "DIRECCIÓN:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.centerAddress || ""],
      [{ content: "LOCALIDAD:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.centerCity || ""],
      [{ content: "PROVINCIA:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.centerProvince || ""],
    ],
    theme: "grid",
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  subHeader("PLANIFICACIÓN DIDÁCTICA DEL CURSO COMPLETO");

  // Calculate cumulative days for each module
  let cumulativeDays = 0;
  const planificationRows = BOE_CURRICULUM.map(m => {
    const daysForModule = Math.ceil(m.hours / 4); // ~4h/day
    const startDay = cumulativeDays + 1;
    const endDay = cumulativeDays + daysForModule;
    cumulativeDays = endDay;
    return [
      `${m.code}. ${m.title}`,
      `${m.hours}`,
      `Del día ${startDay}º al ${endDay}º`
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["MÓDULOS DEL CERTIFICADO (MF)", "HORAS", "FECHAS DE IMPARTICIÓN"]],
    body: planificationRows,
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    styles: { cellPadding: 3 },
    columnStyles: { 1: { halign: "center" as const, cellWidth: 20 }, 2: { cellWidth: 55 } }
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ===== ESTRATEGIAS METODOLÓGICAS (NOTA INFORMATIVA) =====
  checkPageBreak(40);
  subHeader("ESTRATEGIAS METODOLÓGICAS, ACTIVIDADES DE APRENDIZAJE Y RECURSOS DIDÁCTICOS");
  paragraph("La formación desarrollada en la plataforma de teleformación se basará en el uso de una o varias de las siguientes estrategias metodológicas y recursos didácticos, así como de las actividades de aprendizaje que se indican a continuación:");

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Estrategia / Recurso", "Descripción"]],
    body: [
      ["Presentación", "La sesión inicial del módulo/UF tiene como objetivo informar al alumno sobre cuestiones generales relativas a la organización de la formación, presentación de tutores-formadores, exposición de objetivos, etc."],
      ["Estudio directo: CIM", "Aprendizaje a través del estudio directo del Contenido Interactivo Multimedia (CIM): documentos de lectura, vídeos didácticos, enlaces web, demos/tutoriales, glosario. Incluye actividades de autoevaluación integradas (ordenar conceptos, relacionar, completar, verdadero/falso, etc.)."],
      ["Actividades de aprendizaje", "Individual y/o grupal: Estudios de caso con situaciones reales o ficticias. Ejercicios teórico-prácticos. El enunciado incluye la forma de realización (individual, grupal o mixta) y los instrumentos de comunicación (foro, chat)."],
      ["Foros de debate", "Debates dirigidos moderados por el tutor-formador donde el alumnado expresa su opinión sobre aspectos relacionados con la unidad didáctica."],
      ["Tutorías virtuales", "En cada UD: foro de resolución de dudas. En fechas programadas: chat en directo. Al finalizar el módulo/UF: tutoría virtual grupal final. Las tutorías individuales podrán concertarse en cualquier momento."],
      ["Evaluación diagnóstica", "Determinación de la situación de partida del alumnado mediante una prueba de evaluación diagnóstica. El análisis se utiliza para la adaptación de las actividades propuestas."],
      ["Medidas de apoyo", "Ante déficits de aprendizaje, actividades adicionales y medidas de apoyo al alumnado para alcanzar los objetivos de la acción formativa."],
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 7, valign: "top" as const },
    styles: { cellPadding: 3, overflow: "linebreak" as const },
    columnStyles: { 0: { cellWidth: 45, fontStyle: "bold" } }
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ===== ANNEX IV (F11): PROGRAMACIÓN DIDÁCTICA POR MÓDULO =====
  BOE_CURRICULUM.forEach((modCurr) => {
    doc.addPage();
    currentY = margin;

    sectionHeader(`ANEXO IV - PROGRAMACIÓN DIDÁCTICA: ${modCurr.code}. ${modCurr.title}`);

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
      const cesText = ra.ces.join("\n");
      bodyRows.push([
        { content: `${ra.ra}: ${ra.title}`, styles: { fontStyle: "bold", fontSize: 7 } },
        { content: cesText },
        { content: getMethodologyText(modCurr.code) },
        { content: `Campus ${params.centerName}\n\nAula virtual sincrona (videoconferencia)\n\nPlataforma LMS con acceso 24h` },
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
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`${modCurr.code}. ${modCurr.title}`, margin, margin - 3);
        doc.setTextColor(0);
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;
  });

  // ===== ANNEX V: PLANIFICACIÓN DE LA EVALUACIÓN =====
  doc.addPage();
  currentY = margin;
  sectionHeader("ANEXO V - PLANIFICACIÓN DE LA EVALUACIÓN DEL APRENDIZAJE");

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: [
      [{ content: "CERTIFICADO PROFESIONAL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 55 } }, `${params.courseCode} - ${params.courseTitle}`],
      [{ content: "DURACIÓN:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, `${params.durationHours} horas`],
      [{ content: "CENTRO:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, params.centerName],
    ],
    theme: "grid",
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  const evalRows = BOE_CURRICULUM.map(m => [
    `${m.code}. ${m.title}`,
    `${m.hours}h`,
    "Evaluación continua:\n• Tests de autoevaluación (CIM)\n• Actividades evaluables (casos prácticos)\n• Participación en foros\n\nEvaluación final:\n• Prueba de evaluación final presencial\n(1ª y 2ª convocatoria)",
    "• Tests objetivos (tipo test)\n• Ejercicios teórico-prácticos\n• Casos prácticos\n• Rúbricas de evaluación\n• Registro de participación",
    "Presencial en el\ncentro de formación\n\nFecha: Por determinar\n(se comunicará con\nmín. 10 días antelación)"
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Módulo Profesional", "Horas", "Sistema de evaluación", "Instrumentos de evaluación", "Lugar y fecha de evaluación final"]],
    body: evalRows,
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 7, halign: "center" as const },
    bodyStyles: { fontSize: 6.5, valign: "top" as const },
    styles: { cellPadding: 2, overflow: "linebreak" as const },
    columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 18, halign: "center" as const } }
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ===== F11: AULA VIRTUAL =====
  doc.addPage();
  currentY = margin;
  sectionHeader("F11 - PROYECTO FORMATIVO AULA VIRTUAL");

  // Instrucciones F11
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const instrLines = [
    "El presente Anexo al proyecto formativo, deberá de cumplimentarse y entregarse para la impartición a través de aula virtual, tal y como recoge el artículo 28 de la Orden 178/2020.",
    "",
    "Este anexo diseñado para la formación auxiliar a través de aula virtual, consta de:",
    "  1. Los datos de los recursos humanos y técnicos.",
    "  2. La programación de los contenidos impartidos a través del aula virtual.",
    "",
    "Se recuerda que se considera aula virtual al entorno de aprendizaje donde el formador/a y el alumnado interactúan, de forma concurrente y en tiempo real, a través de un sistema de comunicación telemático de carácter síncrono.",
    "No se podrá utilizar el aula virtual para la realización de la prueba final de módulo.",
    "El presente F-11 sólo se debe cumplimentar para aquellos contenidos que se vayan a impartir mediante aula virtual.",
  ];
  instrLines.forEach(line => {
    const splitLines = doc.splitTextToSize(line || " ", contentWidth - 6);
    checkPageBreak(splitLines.length * 4);
    doc.text(splitLines, margin + 3, currentY);
    currentY += splitLines.length * 4 + 1;
  });
  currentY += 4;

  // Recursos humanos y técnicos del aula virtual
  subHeader("RECURSOS HUMANOS Y TÉCNICOS DEL AULA VIRTUAL");

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
  currentY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "DATOS DEL AULA ON-LINE ACCESO ALUMNADO", colSpan: 2, styles: { fillColor: BLUE_HEADER } }]],
    body: [
      [{ content: "Aula virtual (nombre):", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 50 } }, `Campus ${params.centerName} - Plataforma LMS`],
      [{ content: "URL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, platformUrl],
      [{ content: "Usuario:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, "(Se proporcionará individualmente al alumnado)"],
      [{ content: "Contraseña:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } }, "(Se proporcionará individualmente al alumnado)"]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 6;

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
      [platformUrl, "(Datos reservados)", "(Datos reservados)"]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ===== F11 Programming per module =====
  BOE_CURRICULUM.forEach((modCurr) => {
    doc.addPage();
    currentY = margin;

    sectionHeader(`F11- PROGRAMACIÓN DIDÁCTICA AULA VIRTUAL: ${modCurr.code}. ${modCurr.title}`);

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

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: [
        [
          { content: "CERTIFICADO PROFESIONAL", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 55 } },
          { content: `${params.courseCode} - ${params.courseTitle}` }
        ],
        [
          { content: "MÓDULO PROFESIONAL", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 55 } },
          { content: `${modCurr.code}. ${modCurr.title} (${modCurr.hours}h)` }
        ]
      ],
      theme: "grid",
      bodyStyles: { fontSize: 7.5 },
      styles: { cellPadding: 3 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 5;

    const bodyRows: any[][] = [];
    modCurr.ras.forEach((ra) => {
      const cesText = ra.ces.join("\n");
      bodyRows.push([
        { content: `${ra.ra}: ${ra.title}`, styles: { fontStyle: "bold", fontSize: 7 } },
        { content: cesText },
        { content: getMethodologyText(modCurr.code) },
        { content: `Campus ${params.centerName}\n\nAula virtual sincrona (videoconferencia)\n\nPlataforma LMS con acceso 24h` },
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
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`F11 - ${modCurr.code}. ${modCurr.title}`, margin, margin - 3);
        doc.setTextColor(0);
      }
    });
  });

  // ===== PRL SECTION =====
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
      `Campus ${params.centerName}\n(Plataforma LMS)`,
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

  const fileName = `Proyecto_Formativo_${params.courseCode.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(fileName);
}

function getMethodologyText(moduleCode: string): string {
  const base = [
    "• Contenido Interactivo Multimedia (CIM)",
    "• Actividades de aprendizaje evaluables",
    "• Foros temáticos de debate",
    "• Tests de autoevaluación",
    "• Tutorías virtuales síncronas",
    "• Tutorías presenciales",
    "• Documentos y vídeos de apoyo",
  ];

  switch (moduleCode) {
    case "1705":
      return [...base, "• Casos prácticos de programación didáctica", "• Elaboración de programaciones"].join("\n");
    case "1706":
      return [...base, "• Diseño de materiales didácticos", "• Prácticas con herramientas multimedia", "• Elaboración de presentaciones"].join("\n");
    case "1707":
      return [...base, "• Análisis del mercado laboral", "• Simulación de orientación profesional"].join("\n");
    case "1783":
      return [...base, "• Diseño de instrumentos de evaluación", "• Prácticas de corrección y calificación", "• Rúbricas de evaluación"].join("\n");
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
