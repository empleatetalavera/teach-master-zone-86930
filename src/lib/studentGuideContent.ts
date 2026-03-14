// Contenido genérico de la Guía del Alumno - Adaptado al Campus TalentCloudSolution
// Neutralizado para soportar marca blanca: todos los datos específicos de centro/certificado
// se inyectan dinámicamente desde generateStudentGuidePDF.ts usando courseData y branding.
// Este archivo actúa como referencia de estructura, pero NO se importa en el generador PDF.

export const studentGuideContent = {
  title: "GUÍA DEL ALUMNO",
  subtitle: "Certificado de Profesionalidad",
  
  // Mapeo de recursos del campus a terminología SEPE
  campusResourceMapping: {
    // A) ORGANIZARME - Área izquierda
    organizarme: {
      miAgenda: {
        campusName: "Calendario",
        sepeEquivalent: "MI AGENDA",
        description: "Consulta las fechas de tutorías, entregas y evaluaciones"
      },
      misProgresos: {
        campusName: "Calificaciones",
        sepeEquivalent: "MIS PROGRESOS",
        description: "Seguimiento de tu progreso y notas en el curso"
      },
      comoHacerMiCurso: {
        campusName: "Guía del Alumno + Programa Formativo",
        sepeEquivalent: "CÓMO HACER MI CURSO",
        description: "Documentación sobre cómo está estructurado el curso"
      },
      planDeTrabajo: {
        campusName: "Plan de Trabajo / Mi Agenda",
        sepeEquivalent: "PLAN DE TRABAJO",
        description: "Planificación didáctica y fechas del curso"
      }
    },
    // B) COMUNICARME - Área derecha
    comunicarme: {
      miPerfil: {
        campusName: "Perfil (icono usuario)",
        sepeEquivalent: "MI PERFIL",
        description: "Datos personales y documentación"
      },
      misContactos: {
        campusName: "Contacto (botón en cabecera del curso)",
        sepeEquivalent: "MIS CONTACTOS",
        description: "Comunicación con tutor y soporte"
      },
      correo: {
        campusName: "Mensajería del Campus",
        sepeEquivalent: "CORREO",
        description: "Correo interno para comunicarte con tutores"
      },
      chat: {
        campusName: "WhatsApp Dudas",
        sepeEquivalent: "CHAT / CONTACTA EN DIRECTO",
        description: "Comunicación directa por WhatsApp"
      },
      foro: {
        campusName: "Foro",
        sepeEquivalent: "FOROS",
        description: "Debates y consultas con compañeros y tutores"
      }
    },
    // C) RECURSOS - Área central
    recursos: {
      introduccion: {
        campusName: "Pestaña Inicio",
        sepeEquivalent: "INTRODUCCIÓN",
        description: "Vídeo de presentación y objetivos del curso"
      },
      formacionEnCampus: {
        campusName: "Módulos > Unidades Formativas > Contenido Interactivo",
        sepeEquivalent: "FORMACIÓN EN CAMPUS",
        description: "Acceso a los contenidos multimedia (SCORM/CIM)"
      },
      contenidoInteractivo: {
        campusName: "Temario Interactivo (ScormProfessionalViewer)",
        sepeEquivalent: "CONTENIDO INTERACTIVO MULTIMEDIA (CIM)",
        description: "Contenido teórico con índice, test y ejercicios integrados"
      },
      materialComplementario: {
        campusName: "Descargas (dentro del visor) + PDFs de manuales",
        sepeEquivalent: "MATERIAL COMPLEMENTARIO",
        description: "Documentos PDF, vídeos y audios de apoyo"
      },
      actividadesAprendizaje: {
        campusName: "Actividades (botón en cada UF)",
        sepeEquivalent: "ACTIVIDADES DE APRENDIZAJE",
        description: "Casos prácticos y ejercicios evaluables"
      },
      evaluaciones: {
        campusName: "Exámenes",
        sepeEquivalent: "EVALUACIÓN",
        description: "Test de evaluación y pruebas finales"
      },
      tutoriasPresenciales: {
        campusName: "Tutorías",
        sepeEquivalent: "TUTORÍAS PRESENCIALES",
        description: "Sesiones presenciales en el centro de formación"
      },
      cronograma: {
        campusName: "Cronograma",
        sepeEquivalent: "CRONOGRAMA DEL CURSO",
        description: "Línea temporal de módulos y fechas"
      },
      tiemposInvertidos: {
        campusName: "Tiempos Invertidos",
        sepeEquivalent: "SEGUIMIENTO DEL TIEMPO",
        description: "Registro del tiempo de formación"
      }
    }
  },
  
  sections: [
    {
      number: "1",
      title: "PRESENTACIÓN",
      content: `Estimado/a alumno/a, antes de nada queremos darte la bienvenida a tu curso.

A lo largo del curso vamos a acompañarte en tu proceso formativo de una manera cercana y ofreciéndote todo nuestro apoyo para que puedas sacar el máximo provecho de la formación.

Se trata de un trabajo en equipo, entre todos los que formamos parte de nuestro Centro (alumnos, tutores, orientadores, dirección,…), donde tu interés y motivación es vital para que podamos alcanzar juntos los objetivos planteados. Por ello, vamos a estar en continuo contacto para comprobar tus progresos, resolver tus dudas y orientarte en todos los aspectos que necesites.`
    },
    {
      number: "2",
      title: "ASPECTOS GENERALES DEL CERTIFICADO DE PROFESIONALIDAD",
      note: "Los datos de identificación, itinerario, objetivos y salidas laborales se generan dinámicamente desde los metadatos del curso (courseData).",
      subsections: [
        {
          number: "2.1",
          title: "IDENTIFICACIÓN",
          content: `Los datos de identificación del certificado (denominación, código, familia profesional y nivel de cualificación) se obtienen automáticamente de la ficha del curso.`
        },
        {
          number: "2.2",
          title: "ITINERARIO FORMATIVO",
          content: `La estructura de módulos y unidades formativas se genera automáticamente a partir de los módulos configurados en el curso.`
        },
        {
          number: "2.3",
          title: "OBJETIVOS GENERALES",
          content: `Los objetivos generales y específicos se obtienen de los metadatos del curso y de cada módulo/unidad formativa.`
        },
        {
          number: "2.4",
          title: "MÓDULO DE PRÁCTICAS: FORMACIÓN PRÁCTICA EN CENTROS DE TRABAJO",
          content: `El módulo de formación práctica en centros de trabajo se realiza, preferentemente, una vez hayas superado el resto de módulos formativos del certificado de profesionalidad al que corresponde tu curso.

Este módulo de formación práctica puede comenzar hasta cuatro meses después de que hayas finalizado tu formación.

En el caso de que dispongas de alguna experiencia en alguna ocupación relacionada con el certificado de profesionalidad, podrás solicitar la exención de este módulo ante la Administración y no tendrás que realizarlo.

Este módulo es necesario para poder solicitar y recibir el certificado de profesionalidad al que corresponde tu curso.`
        },
        {
          number: "2.5",
          title: "REQUISITOS DE ACCESO Y PRUEBA DE COMPETENCIA DIGITAL",
          content: `Este curso está dirigido a todas aquellas personas que deseen desarrollar su actividad profesional en el ámbito correspondiente al certificado de profesionalidad.

Para acceder a este curso deberás cumplir los requisitos de acceso establecidos en la normativa reguladora del certificado de profesionalidad correspondiente.

Nota: para poder desarrollar el certificado de profesionalidad en modalidad teleformación has debido superar la prueba de competencia tecnológica que se habrá realizado antes del inicio de la acción formativa.

En esta prueba has debido de poner de manifiesto tu conocimiento sobre una serie de actividades básicas relativas a:
- Descarga y envío de archivos.
- Manejo del correo electrónico.
- Participación en las herramientas de comunicación Campus.

De esta forma nos aseguramos que reúnes las competencias digitales requeridas para seguir con aprovechamiento la formación a través Campus Virtual.`
        },
        {
          number: "2.6",
          title: "SALIDAS LABORALES",
          content: `Las salidas laborales asociadas a este certificado de profesionalidad se corresponden con las ocupaciones y puestos de trabajo recogidos en el Real Decreto que lo regula.

Tu tutor-formador te orientará sobre las principales salidas profesionales y los sectores productivos donde podrás desarrollar tu actividad.`
        }
      ]
    },
    {
      number: "3",
      title: "EL CAMPUS VIRTUAL Y LAS APLICACIONES INFORMÁTICAS NECESARIAS PARA LA FORMACIÓN",
      intro: `CONOCE EL CAMPUS VIRTUAL ANTES DE INICIAR TU CURSO…

- Diez días antes de la fecha de inicio de tu curso te serán enviadas tus claves de acceso al Campus Virtual (usuario y contraseña) a través del correo electrónico que indicaste en la inscripción al curso.
- Desde la fecha de recepción de tus contraseñas para acceder al Campus Virtual hasta el día antes de la fecha de inicio del curso deberás acceder al Campus para verificar que tus claves son correctas.`,
      subsections: [
        {
          number: "3.1",
          title: "REQUISITOS TÉCNICOS DEL EQUIPO INFORMÁTICO",
          content: `Es aconsejable y necesario que antes de iniciar el curso compruebes algunas opciones en la configuración de tu ordenador desde el que accederás al Campus, con el fin de que no se produzca ningún problema durante dicho acceso.

REQUISITOS TÉCNICOS DEL SISTEMA:

CONEXIÓN A INTERNET: Se recomienda un ancho de banda mínimo de 1 Mbps.

NAVEGADORES Y VERSIONES:
- Google Chrome (recomendado), versión actualizada
- Mozilla Firefox, versión actualizada
- Microsoft Edge, versión actualizada

RESOLUCIÓN MÍNIMA DE PANTALLA: Se aconseja una resolución mínima de pantalla de 1024 x 768 píxeles.

OFFICE: 2016 o superior / LibreOffice.

ACROBAT READER: https://get.adobe.com/es/reader/

Hardware mínimo:
- Monitor (recomendado 17")
- Teclado y ratón
- Procesador Intel Core i3 o equivalente
- Memoria (RAM) 4Gb

Se recomienda que el sistema siempre tenga instaladas todas las actualizaciones disponibles que provea el fabricante.`
        },
        {
          number: "3.2",
          title: "FUNCIONAMIENTO, RECURSOS Y UTILIDADES DEL CAMPUS",
          content: `Cada vez que accedas al Campus Virtual te aparecerá una pantalla con todos los cursos en los que estás matriculado/a. Pulsando sobre el nombre del curso podrás acceder al contenido y el resto de materiales didácticos y recursos.

La navegación principal del curso se estructura en el MENÚ LATERAL IZQUIERDO con las siguientes opciones:

INICIO - Bienvenida y objetivos del curso
GUÍA DEL ALUMNO - Este documento que estás leyendo
PROGRAMA FORMATIVO - Estructura y objetivos específicos
PLAN DE TRABAJO - Planificación didáctica y fechas
CRONOGRAMA - Línea temporal del curso
MÓDULOS - Contenido formativo organizado por unidades
CALIFICACIONES - Tu progreso y notas
EXÁMENES - Evaluaciones programadas
TUTORÍAS - Sesiones presenciales y virtuales
CALENDARIO - Agenda con todos los eventos
FORO - Debates y consultas
TIEMPOS INVERTIDOS - Registro de dedicación

CÓMO ACCEDER A LOS CONTENIDOS:

1. Haz clic en "Módulos" en el menú lateral
2. Despliega el módulo formativo pulsando sobre él
3. Dentro de cada módulo encontrarás las Unidades Formativas
4. En cada Unidad Formativa dispones de:
   - CONTENIDO INTERACTIVO (CIM) - El temario teórico con ejercicios
   - VÍDEOS, AUDIOS Y DOCUMENTOS - Material complementario
   - ACTIVIDADES - Casos prácticos y ejercicios evaluables
   - TEST DE AUTOEVALUACIÓN - Pruebas de conocimiento

HERRAMIENTAS DE COMUNICACIÓN:

Para contactar con tu tutor/a-formador/a dispones de:
- Botón "CONTACTO" en la cabecera del curso - Mensajería interna
- Botón "WHATSAPP DUDAS" - Chat directo con el centro
- FORO del curso - Consultas públicas con otros alumnos`
        },
        {
          number: "3.3",
          title: "EL CONTENIDO INTERACTIVO MULTIMEDIA (CIM) / TEMARIO",
          content: `El Contenido Interactivo Multimedia es el corazón de tu formación online. Se accede desde cada Unidad Formativa pulsando el botón "TEMARIO".

ESTRUCTURA DEL VISOR INTERACTIVO:

ÍNDICE LATERAL IZQUIERDO
- Muestra todos los puntos y subpuntos del temario
- Un "tick verde" indica los apartados ya completados
- Puedes navegar pulsando directamente sobre cualquier punto

BARRA SUPERIOR
- Glosario - Definiciones de términos clave
- Descargas - PDFs del manual para imprimir
- Ejercicios - Actividades prácticas integradas
- Test - Cuestionarios de autoevaluación

ÁREA CENTRAL DE CONTENIDO
- Texto teórico con explicaciones detalladas
- Tablas y esquemas interactivos
- Imágenes y gráficos explicativos
- Vídeos y audios integrados
- Ejercicios y tests con feedback inmediato

ASISTENTE DE AYUDA
- En la esquina inferior derecha encontrarás un asistente
- Puedes consultarle dudas sobre el contenido
- Te ayudará con la navegación por el temario

RECURSOS COMPLEMENTARIOS DISPONIBLES:

En el visor y en la sección de Descargas encontrarás:
- Documentos de apoyo (PDFs del temario)
- Vídeos de apoyo y demostrativos
- Audios explicativos
- Enlaces a recursos externos`
        },
        {
          number: "3.4",
          title: "APLICACIONES INFORMÁTICAS",
          content: `Las aplicaciones informáticas necesarias para este certificado de profesionalidad dependerán de los módulos y unidades formativas que lo componen.

Tu tutor-formador te facilitará las instrucciones para descargar e instalar las aplicaciones necesarias en cada módulo.

CÓMO ACCEDER A LAS APLICACIONES:
Las instrucciones para descargar e instalar las aplicaciones necesarias las encontrarás en cada Unidad Formativa correspondiente, dentro del Contenido Interactivo Multimedia. Tu tutor-formador te facilitará también las instrucciones necesarias.`
        }
      ]
    },
    {
      number: "4",
      title: "FECHAS Y LUGAR DE REALIZACIÓN",
      content: `Las fechas de realización de este curso son variables según la convocatoria en la que te encuentres matriculado/a.

Deberás desarrollar cada módulo formativo/unidad formativa según el calendario establecido en el PLAN DE TRABAJO.

La dirección del centro de formación se indicará en la documentación proporcionada al inicio del curso.

En el ANEXO I "CALENDARIO Y PLAN DE TRABAJO" podrás encontrar la planificación por semanas, así como la secuencia de las actividades y tareas programadas para realizar en cada unidad didáctica.`
    },
    {
      number: "5",
      title: "METODOLOGÍA DE ESTUDIO",
      subsections: [
        {
          number: "5.1",
          title: "TAREAS/ACTIVIDADES",
          content: `A) INTRODUCCIÓN AL MÓDULO FORMATIVO O UNIDAD FORMATIVA
- Visualiza el vídeo de presentación
- Descarga los objetivos y contenidos que vas a estudiar
- Acude a la videoconferencia de presentación con tu tutor formador
- Realiza el cuestionario de conocimientos previos

B) DESARROLLA LA FORMACIÓN EN EL CAMPUS VIRTUAL
1) Estudia los contenidos de cada unidad didáctica:
- Accede al Contenido Interactivo Multimedia
- Realiza los ejercicios de autoevaluación
- Completa los test de autoevaluación al finalizar cada unidad

2) Consulta el material didáctico complementario:
- Documentos de apoyo
- Vídeos de apoyo
- Audios

3) Realiza las actividades de aprendizaje propuestas:
- Respeta las fechas indicadas en el PLAN DE TRABAJO
- Las actividades pueden ser individuales o en grupo
- La entrega se realiza a través del Campus Virtual

4) Participa en los foros disponibles:
- Foros de debate
- Foro de consultas/dudas
- Foro de programación/resolución de actividades
- Foro de dudas técnicas

C) DESARROLLA LA FORMACIÓN EN EL CENTRO DE FORMACIÓN
En las fechas y lugar indicados en el PLAN DE TRABAJO, deberás asistir a las sesiones presenciales donde se trabajarán los conocimientos adquiridos en la plataforma.

D) PARTICIPA EN LAS TUTORÍAS VIRTUALES
Las tutorías virtuales se realizarán a través de chat. Al menos tendrás una tutoría virtual de repaso al finalizar cada Unidad o Módulo Formativo.

E) REALIZA LAS PRUEBAS DE EVALUACIÓN
- TEST FINAL EN CAMPUS (CIM)
- PRUEBA DE EVALUACIÓN FINAL PRESENCIAL
- CUESTIONARIO DE SATISFACCIÓN`
        },
        {
          number: "5.2",
          title: "TIEMPO DE DEDICACIÓN",
          content: `Para desarrollar tu curso correctamente debes dedicar un tiempo cada día al estudio de los contenidos y la realización de las actividades de aprendizaje.

Es fundamental que mantengas una disciplina de estudio constante para poder cumplir con los plazos establecidos y aprovechar al máximo la formación.

Tu tutor-formador te orientará sobre el tiempo recomendado de dedicación diaria según el módulo formativo o unidad formativa que estés cursando.`
        }
      ]
    },
    {
      number: "6",
      title: "SISTEMA DE TUTORÍAS",
      subsections: [
        {
          number: "6.1",
          title: "TUTORÍAS VIRTUALES",
          content: `Las tutorías virtuales son sesiones en directo con tu tutor-formador a través del Campus Virtual.

Tipos de tutorías virtuales:
- Tutorías grupales: Sesiones programadas con todo el grupo de alumnos.
- Tutorías individuales: Puedes solicitarlas a través del correo electrónico del Campus.

Herramientas utilizadas:
- Chat del Campus Virtual
- Contacta en Directo (videollamada)

En estas sesiones podrás:
- Plantear tus dudas
- Repasar los principales contenidos
- Recibir orientación sobre la prueba de evaluación final

Tu tutor-formador te informará con antelación de las fechas y horarios de las tutorías programadas.`
        },
        {
          number: "6.2",
          title: "TUTORÍAS PRESENCIALES",
          content: `Las tutorías presenciales se desarrollan en el Centro de Formación según el calendario establecido.

En estas sesiones:
- Se desarrollarán actividades de aprendizaje prácticas
- Se realizarán pruebas de evaluación
- Contarás con un formador que te guiará en el desarrollo de las actividades

Toda la información relativa a las tutorías presenciales la encontrarás en:
- El apartado TUTORÍA PRESENCIAL del Campus
- El CUADERNO DEL ALUMNO
- A través de comunicaciones de tu tutor-formador`
        }
      ]
    },
    {
      number: "7",
      title: "SISTEMA DE EVALUACIÓN",
      subsections: [
        {
          number: "7.1",
          title: "ACTIVIDADES Y PRUEBAS EVALUABLES",
          content: `Para superar cada módulo formativo o unidad formativa deberás realizar las siguientes pruebas:

1. TEST FINAL EN CAMPUS (CIM)
- Dispones de un solo intento
- Podrás conocer los resultados una vez lo hayas realizado

2. PRUEBA DE EVALUACIÓN FINAL PRESENCIAL
En el Centro de Formación, en la fecha y lugar indicados en el PLAN DE TRABAJO.

Las pruebas de evaluación constan de varias partes:
- Pruebas de evaluación de conocimiento: Pruebas objetivas (tipo test, respuestas cortas, etc.)
- Pruebas de evaluación de destrezas: Pruebas prácticas en situaciones de trabajo simuladas
- Pruebas de evaluación de actitudes: Observación de conductas y comportamientos

Criterios de evaluación:
- Para superar el módulo formativo es necesario obtener una puntuación mínima de 5
- En caso de no superarlo se considerará NO APTO

Segunda convocatoria:
Si no superas la primera convocatoria o no asistes por causa justificada, podrás presentarte a la segunda convocatoria en la fecha que te indicará tu tutor-formador.

IMPORTANTE: Para poder presentarte a la prueba de evaluación final debes haber realizado el total de las actividades de aprendizaje establecidas en el Campus Virtual, así como haber participado en los foros programados.`
        },
        {
          number: "7.2",
          title: "FECHA Y LUGAR DE LA PRUEBA DE EVALUACIÓN FINAL PRESENCIAL",
          content: `Las fechas de las pruebas de evaluación final presencial se encuentran en el documento PLAN DE TRABAJO y en MI AGENDA del Campus Virtual.

El lugar de realización de las pruebas será el Centro de Formación. Consulta la dirección exacta en la documentación proporcionada al inicio del curso o contacta con tu tutor-formador.

IMPORTANTE:
- Debes presentarte con tu DNI/NIE original
- Llega con al menos 15 minutos de antelación
- Lleva el material necesario según las indicaciones de tu tutor-formador`
        }
      ]
    },
    {
      number: "8",
      title: "TITULACIÓN OBTENIDA",
      content: `Una vez superados todos los módulos formativos del certificado de profesionalidad, incluido el módulo de prácticas profesionales no laborales, podrás solicitar el CERTIFICADO DE PROFESIONALIDAD correspondiente ante la Administración competente.

Este certificado tiene carácter oficial y validez en todo el territorio nacional, acreditando las competencias profesionales adquiridas.

Para la solicitud del certificado deberás presentar la documentación requerida por la Administración competente de tu Comunidad Autónoma.`
    },
    {
      number: "9",
      title: "CAU: CENTRO DE ATENCIÓN DE USUARIOS PARA DUDAS TÉCNICAS",
      content: `El Centro de Atención de Usuarios (CAU) es el servicio de soporte técnico para resolver incidencias relacionadas con el funcionamiento del Campus Virtual.

Los datos de contacto del CAU (teléfono, email y horario) se proporcionan en la documentación de inicio del curso y están disponibles en el Campus Virtual.

TIPOS DE INCIDENCIAS:
- Problemas de acceso al Campus
- Errores en la visualización de contenidos
- Problemas con la entrega de actividades
- Incidencias con las herramientas de comunicación

Antes de contactar con el CAU:
- Consulta los vídeos tutoriales disponibles en el Campus
- Revisa las preguntas frecuentes (FAQ)
- Verifica que tu equipo cumple con los requisitos técnicos`
    },
    {
      number: "10",
      title: "SERVICIO DE ATENCIÓN AL CLIENTE",
      content: `El Servicio de Atención al Cliente está a tu disposición para cualquier consulta o incidencia relacionada con tu formación que no sea de carácter técnico.

Los datos de contacto del centro (teléfono, email y horario) están disponibles en el Campus Virtual.

TIPOS DE CONSULTAS:
- Información sobre el curso y su contenido
- Dudas sobre la planificación y calendario
- Gestiones administrativas
- Solicitud de certificados y diplomas
- Reclamaciones y sugerencias

Los datos del centro de formación se muestran en la sección de contacto del Campus Virtual.`
    }
  ],
  
  anexo: {
    title: "ANEXO I: CALENDARIO Y PLAN DE TRABAJO",
    content: `El calendario y plan de trabajo específico de tu acción formativa te será proporcionado al inicio del curso.

Este documento incluye:
- Fechas de inicio y fin de cada módulo/unidad formativa
- Calendario de tutorías presenciales
- Fechas de entrega de actividades de aprendizaje
- Fechas de pruebas de evaluación (1ª y 2ª convocatoria)
- Programación semanal de contenidos y actividades

Consulta MI AGENDA en el Campus Virtual para ver el calendario actualizado de todas las actividades programadas.`
  }
};
