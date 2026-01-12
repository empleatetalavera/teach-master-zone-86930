import { useState } from 'react';
import { Download, BookOpen, FileText, CheckCircle2, ChevronDown, ChevronUp, Building2, Users, Mail, Receipt, Wallet, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface UnitManualContentProps {
  unitId: string;
  unitTitle: string;
}

// Contenido completo de los manuales basado en los PDFs
const MANUAL_CONTENT: Record<string, {
  title: string;
  pdfUrl: string;
  sections: Array<{
    title: string;
    subsections: Array<{
      title: string;
      content: string[];
      keyPoints?: string[];
    }>;
  }>;
}> = {
  'UF0517': {
    title: 'UF0517 - Organización Empresarial y de Recursos Humanos',
    pdfUrl: '/documents/manuales/UF0517_UD1_organizacion_entidades.pdf',
    sections: [
      {
        title: 'UD1: La Organización de Entidades Públicas y Privadas',
        subsections: [
          {
            title: '1.1 Funciones de las Empresas',
            content: [
              'Las empresas son unidades económicas que combinan recursos humanos, materiales, técnicos y financieros para producir bienes o servicios destinados al mercado.',
              'Las funciones principales de la empresa incluyen: función comercial (compras y ventas), función de producción (transformación de materias primas), función financiera (obtención y gestión de recursos económicos), función de recursos humanos (selección, contratación y formación del personal), y función administrativa (planificación, organización, dirección y control).',
              'Las empresas se clasifican según distintos criterios: por su tamaño (microempresas, pequeñas, medianas y grandes), por su actividad (sector primario, secundario o terciario), por la titularidad del capital (públicas, privadas o mixtas), y por su forma jurídica (empresario individual, sociedades).'
            ],
            keyPoints: ['Unidad económica de producción', 'Funciones empresariales', 'Criterios de clasificación']
          },
          {
            title: '1.2 Elementos Componentes de la Organización',
            content: [
              'La organización empresarial se compone de varios elementos fundamentales que interactúan entre sí para conseguir los objetivos establecidos.',
              'Los recursos materiales incluyen instalaciones, maquinaria, equipos informáticos, materias primas y productos en proceso o terminados.',
              'Los recursos humanos son el conjunto de personas que trabajan en la empresa, desde la dirección hasta los operarios.',
              'Los recursos financieros comprenden el capital propio, préstamos, créditos y cualquier otra forma de financiación.',
              'Los recursos técnicos incluyen los conocimientos, tecnologías, patentes y procesos productivos que utiliza la empresa.'
            ],
            keyPoints: ['Recursos materiales', 'Recursos humanos', 'Recursos financieros', 'Recursos técnicos']
          },
          {
            title: '1.3 Las Relaciones Organizacionales',
            content: [
              'Las relaciones en la organización pueden ser formales (establecidas oficialmente) o informales (surgidas espontáneamente).',
              'Las relaciones lineales son aquellas que se establecen entre un superior y un subordinado, siguiendo la cadena de mando.',
              'Las relaciones de staff son relaciones de asesoramiento que no implican autoridad directa sobre otros empleados.',
              'Las relaciones funcionales se basan en la especialización y pueden cruzar las líneas de autoridad tradicionales.'
            ],
            keyPoints: ['Relaciones formales e informales', 'Línea de mando', 'Staff y asesoría']
          },
          {
            title: '1.4 Funciones del Área Administrativa',
            content: [
              'El área administrativa realiza funciones de apoyo a todas las demás áreas de la empresa.',
              'Gestión documental: recepción, registro, clasificación, archivo y distribución de documentos.',
              'Comunicación: atención telefónica, gestión de correspondencia, comunicaciones internas y externas.',
              'Gestión de información: elaboración de informes, estadísticas, bases de datos y documentación.',
              'Apoyo administrativo: gestión de agendas, organización de reuniones, viajes y eventos.',
              'Control: verificación de procedimientos, cumplimiento de normativas y seguimiento de indicadores.'
            ],
            keyPoints: ['Gestión documental', 'Comunicación', 'Apoyo administrativo', 'Control']
          }
        ]
      },
      {
        title: 'UD2: La Organización de los Recursos Humanos',
        subsections: [
          {
            title: '2.1 Departamento de Recursos Humanos',
            content: [
              'El departamento de recursos humanos es el encargado de gestionar todo lo relacionado con el personal de la empresa.',
              'Sus funciones principales incluyen: planificación de plantillas, reclutamiento y selección de personal, contratación, formación y desarrollo, administración de personal, relaciones laborales, y prevención de riesgos laborales.',
              'La estructura del departamento varía según el tamaño de la empresa, pudiendo estar integrado en la dirección general en pequeñas empresas o constituir un área independiente en organizaciones mayores.'
            ],
            keyPoints: ['Gestión del personal', 'Funciones de RRHH', 'Estructura organizativa']
          },
          {
            title: '2.2 Selección de Personal',
            content: [
              'El proceso de selección comienza con el análisis del puesto de trabajo y la definición del perfil del candidato ideal.',
              'El reclutamiento puede ser interno (promoción de empleados actuales) o externo (búsqueda en el mercado laboral).',
              'Las fuentes de reclutamiento externo incluyen: oficinas de empleo, portales web de empleo, empresas de selección, universidades, redes sociales profesionales.',
              'Las técnicas de selección más habituales son: análisis de currículum, entrevistas personales, pruebas psicotécnicas, dinámicas de grupo y pruebas profesionales.'
            ],
            keyPoints: ['Análisis de puestos', 'Reclutamiento', 'Técnicas de selección']
          },
          {
            title: '2.3 El Contrato de Trabajo',
            content: [
              'El contrato de trabajo es el acuerdo entre empresario y trabajador por el que este presta servicios a cambio de una retribución.',
              'Los elementos esenciales son: consentimiento, objeto lícito, causa del contrato y forma (puede ser verbal o escrita según el tipo).',
              'Los tipos de contrato más habituales son: indefinido, temporal (por obra o servicio, eventual, de interinidad), de formación y aprendizaje, y de prácticas.',
              'El contrato debe especificar: identidad de las partes, fecha de inicio, duración, lugar de trabajo, categoría profesional, salario, jornada y convenio aplicable.'
            ],
            keyPoints: ['Elementos del contrato', 'Tipos de contrato', 'Contenido mínimo']
          },
          {
            title: '2.4 La Nómina',
            content: [
              'La nómina es el documento que recoge la liquidación de haberes del trabajador correspondiente a un periodo de tiempo.',
              'La estructura de la nómina incluye: encabezamiento (datos de empresa y trabajador), devengos (percepciones salariales y no salariales), deducciones (cotizaciones a la Seguridad Social, IRPF, anticipos), y líquido a percibir.',
              'Las percepciones salariales incluyen: salario base, complementos salariales (antigüedad, peligrosidad, nocturnidad), horas extraordinarias.',
              'Las percepciones no salariales son: dietas, gastos de transporte, indemnizaciones, prestaciones de la Seguridad Social.',
              'Las deducciones principales son: cotización a la Seguridad Social (contingencias comunes, desempleo, formación profesional) y retención del IRPF.'
            ],
            keyPoints: ['Estructura de la nómina', 'Percepciones', 'Deducciones', 'Líquido a percibir']
          }
        ]
      }
    ]
  },
  'UF0518': {
    title: 'UF0518 - Gestión Auxiliar de la Correspondencia y Paquetería',
    pdfUrl: '/documents/manuales/UF0518_UD1_correspondencia.pdf',
    sections: [
      {
        title: 'UD1: Tratamiento de la Correspondencia y Paquetería',
        subsections: [
          {
            title: '1.1 La Comunicación Escrita en la Empresa',
            content: [
              'La comunicación escrita es fundamental en las relaciones empresariales por su carácter formal y probatorio.',
              'La correspondencia comercial incluye: cartas, informes, memorandos, circulares, notas internas, correos electrónicos.',
              'Principios de la comunicación escrita empresarial: claridad, concisión, corrección, coherencia, cortesía y adaptación al destinatario.',
              'La imagen corporativa se refleja en la calidad de las comunicaciones escritas, por lo que es importante cuidar el formato, presentación y contenido.'
            ],
            keyPoints: ['Comunicación empresarial', 'Tipos de correspondencia', 'Principios de redacción']
          },
          {
            title: '1.2 Recepción de la Correspondencia',
            content: [
              'La recepción de correspondencia debe seguir un procedimiento estandarizado para garantizar su correcta gestión.',
              'Pasos en la recepción: recogida de la correspondencia, apertura (excepto correspondencia personal o confidencial), comprobación de que el contenido coincide con el sobre, sellado de entrada con fecha y hora.',
              'Registro de entrada: asignación de número correlativo, anotación de fecha, remitente, asunto y destino interno.',
              'Clasificación inicial: urgente, confidencial, ordinaria, publicidad, según departamento destinatario.',
              'Distribución interna: reparto a los departamentos o personas correspondientes según los procedimientos establecidos.'
            ],
            keyPoints: ['Procedimiento de recepción', 'Registro de entrada', 'Clasificación', 'Distribución']
          },
          {
            title: '1.3 Envío de la Correspondencia',
            content: [
              'El proceso de envío incluye: preparación del documento, revisión, firma, registro de salida, preparación del envío y expedición.',
              'Registro de salida: número correlativo, fecha, destinatario, asunto, tipo de envío y persona que autoriza.',
              'Tipos de envío postal: carta ordinaria, carta certificada, carta certificada urgente, burofax, paquetería.',
              'Servicios adicionales: acuse de recibo, reembolso, valores declarados, seguro.',
              'Envíos alternativos: mensajería privada, servicios de paquetería urgente, correo electrónico certificado.'
            ],
            keyPoints: ['Proceso de envío', 'Registro de salida', 'Tipos de envío', 'Servicios adicionales']
          },
          {
            title: '1.4 Medios y Equipos de Correspondencia',
            content: [
              'Equipos utilizados: máquinas de franquear, básculas postales, abridoras de sobres, plegadoras, ensobradoras.',
              'La franqueadora permite calcular automáticamente el franqueo según peso y destino, agilizando el envío masivo.',
              'El correo electrónico se ha convertido en el medio principal de comunicación, requiriendo conocimientos de netiqueta y gestión de bandejas.',
              'Sistemas de gestión documental: permiten digitalizar, clasificar, almacenar y recuperar correspondencia de forma electrónica.',
              'Archivado: la correspondencia debe conservarse según los plazos legales establecidos para cada tipo de documento.'
            ],
            keyPoints: ['Equipos de oficina', 'Franqueadoras', 'Correo electrónico', 'Gestión documental']
          },
          {
            title: '1.5 Gestión de Paquetería',
            content: [
              'La paquetería requiere procedimientos específicos por sus características de tamaño, peso y fragilidad.',
              'Recepción de paquetes: comprobación del estado externo, verificación de remitente y destinatario, firma del albarán de entrega.',
              'Registro de paquetería: identificación del paquete, procedencia, fecha, contenido declarado, departamento destinatario.',
              'Envío de paquetes: embalaje adecuado, etiquetado correcto, documentación aduanera si es internacional, seguro si es necesario.',
              'Almacenamiento temporal: zona habilitada, control de entradas y salidas, notificación al destinatario.'
            ],
            keyPoints: ['Recepción de paquetes', 'Registro', 'Envío', 'Almacenamiento']
          }
        ]
      }
    ]
  },
  'UF0519': {
    title: 'UF0519 - Gestión Auxiliar de Documentación Económico-Administrativa y Comercial',
    pdfUrl: '/documents/manuales/UF0519_UD1_documentacion_administrativa.pdf',
    sections: [
      {
        title: 'UD1: Gestión Auxiliar de Documentación Administrativa Básica',
        subsections: [
          {
            title: '1.1 Los Documentos Administrativos',
            content: [
              'Los documentos administrativos son la expresión escrita de los actos de la Administración o de las empresas.',
              'Elementos del documento: encabezamiento (membrete, fecha, referencia), cuerpo (contenido principal), cierre (firma, sello, anexos).',
              'Funciones de los documentos: probatoria (acreditan hechos), informativa, de control interno, legal (cumplimiento normativo).',
              'Características: autenticidad, integridad, fiabilidad, disponibilidad, confidencialidad según su naturaleza.',
              'Clasificación: por origen (internos/externos), por función (administrativos, comerciales, contables), por formato (papel/digital).'
            ],
            keyPoints: ['Elementos documentales', 'Funciones', 'Características', 'Clasificación']
          },
          {
            title: '1.2 Documentos de Compraventa: El Pedido',
            content: [
              'El pedido es el documento mediante el cual el comprador solicita mercancías o servicios al vendedor.',
              'Elementos del pedido: datos del comprador, datos del proveedor, fecha, número de pedido, descripción de productos, cantidades, precios, condiciones de entrega y pago.',
              'Tipos de pedido: pedido en firme (compromiso definitivo), pedido condicional, pedido de prueba, pedido periódico.',
              'El pedido puede realizarse por distintos medios: carta, fax, teléfono, correo electrónico, plataforma de compras electrónica.',
              'Es importante confirmar la recepción del pedido y verificar las condiciones acordadas antes de procesar.'
            ],
            keyPoints: ['Contenido del pedido', 'Tipos', 'Medios de realización', 'Confirmación']
          },
          {
            title: '1.3 El Albarán de Entrega',
            content: [
              'El albarán o nota de entrega acredita que las mercancías han sido entregadas al comprador.',
              'Contenido: datos de proveedor y cliente, fecha de entrega, número de albarán, descripción de mercancías, cantidades, referencia al pedido.',
              'El albarán debe ser firmado por el receptor como prueba de la recepción conforme.',
              'Es fundamental verificar que la mercancía recibida coincide con lo indicado en el albarán antes de firmar.',
              'El albarán sirve de base para la elaboración de la factura correspondiente.',
              'Se deben anotar las incidencias (mercancía dañada, faltante, diferencias) antes de firmar.'
            ],
            keyPoints: ['Función del albarán', 'Contenido', 'Verificación', 'Incidencias']
          },
          {
            title: '1.4 La Factura',
            content: [
              'La factura es el documento mercantil que acredita la operación de compraventa y sus condiciones económicas.',
              'Elementos obligatorios: número correlativo, fecha de expedición, datos completos de emisor y receptor (NIF, razón social, domicilio), descripción de operaciones, base imponible, tipo de IVA, cuota, total.',
              'Tipos de factura: ordinaria (completa), simplificada (tickets hasta 400€), rectificativa (corrección de errores), recapitulativa, proforma (sin valor fiscal), electrónica.',
              'Plazos de emisión: antes del día 16 del mes siguiente a la operación para destinatarios empresarios.',
              'Conservación: las facturas deben conservarse durante 4 años (obligación fiscal) o 6 años (obligación mercantil).',
              'La factura electrónica tiene la misma validez legal que la factura en papel si cumple los requisitos de autenticidad e integridad.'
            ],
            keyPoints: ['Elementos obligatorios', 'Tipos de factura', 'Plazos', 'Conservación']
          },
          {
            title: '1.5 El Recibo y la Domiciliación Bancaria',
            content: [
              'El recibo es el documento que acredita el pago de una cantidad de dinero.',
              'Elementos del recibo: fecha, importe en cifras y letras, concepto, datos del pagador y del receptor, firma.',
              'La domiciliación bancaria es la autorización para que el acreedor cargue automáticamente los recibos en la cuenta del deudor.',
              'Ventajas de la domiciliación: comodidad, puntualidad en los pagos, reducción de gestiones administrativas.',
              'Tipos de domiciliación: SEPA (zona euro), con adeudo único o recurrente.',
              'El ordenante puede devolver los recibos domiciliados en un plazo de 8 semanas (adeudos autorizados) o 13 meses (no autorizados).'
            ],
            keyPoints: ['El recibo', 'Domiciliación bancaria', 'Tipos de domiciliación', 'Devolución de recibos']
          }
        ]
      },
      {
        title: 'UD2: Gestión Básica de Tesorería',
        subsections: [
          {
            title: '2.1 Operaciones Básicas de Cobro y Pago',
            content: [
              'La tesorería gestiona los flujos de cobros y pagos de la empresa para garantizar la liquidez necesaria.',
              'Medios de cobro y pago: efectivo (hasta límites legales), cheque, pagaré, transferencia bancaria, tarjeta, domiciliación.',
              'El arqueo de caja consiste en verificar que el dinero en caja coincide con los registros contables.',
              'La conciliación bancaria compara los movimientos registrados con los del extracto bancario para detectar diferencias.',
              'Es fundamental controlar los vencimientos de cobros y pagos para evitar descubiertos y retrasos.'
            ],
            keyPoints: ['Flujos de tesorería', 'Medios de pago', 'Arqueo de caja', 'Conciliación bancaria']
          },
          {
            title: '2.2 El Cheque',
            content: [
              'El cheque es un documento de pago por el que el librador ordena a su banco pagar una cantidad al beneficiario.',
              'Elementos del cheque: nombre "cheque", orden de pago, nombre del librado (banco), lugar de pago, fecha y lugar de emisión, firma del librador.',
              'Tipos de cheque: al portador, nominativo (a la orden, no a la orden), cruzado, conformado, bancario.',
              'Plazos de presentación: 15 días si se emite en España, 20 días en Europa, 60 días en otros países.',
              'El impago del cheque puede generar responsabilidades civiles y, en caso de mala fe, penales.'
            ],
            keyPoints: ['Elementos del cheque', 'Tipos', 'Plazos de presentación', 'Impago']
          },
          {
            title: '2.3 El Pagaré',
            content: [
              'El pagaré es una promesa de pago por la que el firmante se compromete a pagar una cantidad en una fecha determinada.',
              'A diferencia del cheque, el pagaré tiene vencimiento diferido (a fecha fija o a un plazo desde la emisión).',
              'Elementos: mención "pagaré", promesa de pago, vencimiento, lugar de pago, beneficiario, fecha y lugar de emisión, firma.',
              'El pagaré es endosable (puede transmitirse) y avalable (puede garantizarse por un tercero).',
              'En caso de impago, el beneficiario puede reclamar judicial y extrajudicialmente contra firmante, endosantes y avalistas.'
            ],
            keyPoints: ['Características del pagaré', 'Elementos', 'Endoso y aval', 'Impago']
          },
          {
            title: '2.4 La Letra de Cambio',
            content: [
              'La letra de cambio es un documento por el que el librador ordena al librado pagar al tenedor una cantidad en una fecha.',
              'Intervinientes: librador (quien emite), librado (quien debe pagar), tomador o beneficiario (quien cobra).',
              'Elementos formales: denominación "letra de cambio", orden incondicional de pago, nombre del librado, vencimiento, lugar de pago, beneficiario, fecha y lugar de libramiento, firma del librador.',
              'La aceptación es el acto por el que el librado se compromete a pagar la letra.',
              'La letra puede descontarse en el banco, obteniendo liquidez antes del vencimiento a cambio de un coste financiero.'
            ],
            keyPoints: ['Intervinientes', 'Elementos formales', 'Aceptación', 'Descuento']
          },
          {
            title: '2.5 Libros de Registro Obligatorios',
            content: [
              'Los empresarios deben llevar registros contables obligatorios según la normativa mercantil y fiscal.',
              'Libros contables obligatorios: libro diario (movimientos cronológicos), libro de inventarios y cuentas anuales.',
              'Libros fiscales: libro registro de facturas emitidas, libro registro de facturas recibidas, libro registro de bienes de inversión.',
              'Los libros deben conservarse durante 6 años desde el cierre del ejercicio correspondiente.',
              'La contabilidad puede llevarse en formato electrónico cumpliendo los requisitos de autenticidad y conservación.'
            ],
            keyPoints: ['Libros contables', 'Libros fiscales', 'Conservación', 'Formato electrónico']
          }
        ]
      },
      {
        title: 'UD3: Gestión y Control Básico de Existencias',
        subsections: [
          {
            title: '3.1 Concepto y Tipos de Existencias',
            content: [
              'Las existencias son bienes que la empresa posee para su venta o para ser utilizados en el proceso productivo.',
              'Tipos de existencias: mercaderías (productos comprados para reventa), materias primas, productos en curso, productos semiterminados, productos terminados, subproductos, envases y embalajes.',
              'Las existencias representan una inversión importante que debe gestionarse eficientemente.',
              'El objetivo de la gestión de existencias es mantener un nivel óptimo que evite tanto el exceso (costes de almacenamiento) como la rotura de stock (pérdida de ventas).'
            ],
            keyPoints: ['Tipos de existencias', 'Inversión en stock', 'Gestión óptima']
          },
          {
            title: '3.2 El Almacén',
            content: [
              'El almacén es el espacio físico destinado a la recepción, conservación y expedición de mercancías.',
              'Funciones del almacén: recepción y verificación, almacenamiento, conservación, preparación de pedidos, expedición.',
              'Tipos de almacén: de materias primas, de productos terminados, de tránsito, de consolidación, de distribución.',
              'La organización del almacén debe facilitar la localización de productos, optimizar el espacio y agilizar las operaciones.',
              'Zonas del almacén: recepción, almacenamiento, preparación de pedidos, expedición, devoluciones.'
            ],
            keyPoints: ['Funciones del almacén', 'Tipos', 'Organización', 'Zonas']
          },
          {
            title: '3.3 Métodos de Valoración de Existencias',
            content: [
              'La valoración de existencias es necesaria para determinar el coste de las ventas y el valor del inventario.',
              'Métodos de valoración: FIFO (primera entrada, primera salida), PMP (precio medio ponderado), precio estándar.',
              'El método FIFO valora las salidas al precio de las unidades más antiguas del almacén.',
              'El PMP calcula un coste promedio de las existencias después de cada entrada.',
              'El Plan General Contable español no permite el método LIFO (última entrada, primera salida).',
              'El método elegido debe aplicarse consistentemente para todos los productos de características similares.'
            ],
            keyPoints: ['FIFO', 'PMP', 'Consistencia en la aplicación']
          },
          {
            title: '3.4 Control de Inventarios',
            content: [
              'El inventario es la relación detallada y valorada de todas las existencias en un momento determinado.',
              'Tipos de inventario: permanente (registro continuo), periódico (recuento físico en fechas determinadas), rotativo (verificación parcial continua).',
              'La ficha de almacén registra las entradas, salidas y existencias de cada producto.',
              'El control de inventarios incluye: verificación de existencias físicas, comprobación de registros, detección de diferencias, análisis de rotación.',
              'Las diferencias de inventario pueden deberse a: errores de registro, mermas, roturas, deterioros, robos.',
              'El análisis ABC clasifica los productos según su importancia (valor económico, rotación) para priorizar el control.'
            ],
            keyPoints: ['Tipos de inventario', 'Ficha de almacén', 'Control de diferencias', 'Análisis ABC']
          },
          {
            title: '3.5 Documentación de Almacén',
            content: [
              'La documentación de almacén acredita los movimientos de entrada, salida y situación de las existencias.',
              'Documentos de entrada: albarán de proveedor, nota de devolución, parte de producción, nota de traspaso.',
              'Documentos de salida: albarán de expedición, nota de devolución a proveedor, parte de consumo interno.',
              'Documentos de situación: ficha de producto, inventario, informe de stock.',
              'La documentación debe archivarse ordenadamente para facilitar la trazabilidad de las operaciones.',
              'Los sistemas informáticos de gestión de almacén (SGA) automatizan el registro y control de la documentación.'
            ],
            keyPoints: ['Documentos de entrada', 'Documentos de salida', 'Documentos de situación', 'Sistemas SGA']
          }
        ]
      }
    ]
  }
};

// Función para obtener contenido por título de unidad
function getManualContentByTitle(unitTitle: string): typeof MANUAL_CONTENT[keyof typeof MANUAL_CONTENT] | null {
  const title = unitTitle.toLowerCase();
  
  if (title.includes('organizaci') || title.includes('entidades') || title.includes('recursos humanos') || title.includes('uf0517')) {
    return MANUAL_CONTENT['UF0517'];
  }
  if (title.includes('correspondencia') || title.includes('paquet') || title.includes('uf0518')) {
    return MANUAL_CONTENT['UF0518'];
  }
  if (title.includes('documentaci') || title.includes('tesorería') || title.includes('existencias') || title.includes('uf0519')) {
    return MANUAL_CONTENT['UF0519'];
  }
  
  // Default: return all content combined
  return null;
}

export function UnitManualContent({ unitId, unitTitle }: UnitManualContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  const manualContent = getManualContentByTitle(unitTitle);
  
  // If no specific content, show all manuals
  const allContent = manualContent ? [manualContent] : Object.values(MANUAL_CONTENT);
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const getSectionIcon = (index: number) => {
    const icons = [Building2, Users, Mail, Receipt, Wallet, Package];
    const Icon = icons[index % icons.length];
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {allContent.map((manual, manualIndex) => (
        <div key={manualIndex} className="bg-background rounded-lg border overflow-hidden">
          {/* Header del Manual */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{manual.title}</h3>
                  <p className="text-xs text-muted-foreground">{manual.sections.length} unidades didácticas</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={manual.pdfUrl} download className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar PDF</span>
                </a>
              </Button>
            </div>
          </div>
          
          {/* Contenido del Manual */}
          <div className="p-4 space-y-4">
            {manual.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border rounded-lg overflow-hidden">
                {/* Título de la Sección */}
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {sectionIndex + 1}
                    </Badge>
                    <h4 className="font-medium text-sm">{section.title}</h4>
                  </div>
                </div>
                
                {/* Subsecciones */}
                <div className="divide-y">
                  {section.subsections.map((subsection, subIndex) => {
                    const sectionId = `${manualIndex}-${sectionIndex}-${subIndex}`;
                    const isExpanded = expandedSections.has(sectionId);
                    
                    return (
                      <Collapsible key={subIndex} open={isExpanded} onOpenChange={() => toggleSection(sectionId)}>
                        <CollapsibleTrigger className="w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-primary/10 rounded text-primary">
                                {getSectionIcon(subIndex)}
                              </div>
                              <span className="text-sm font-medium">{subsection.title}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-4">
                            {/* Contenido */}
                            <div className="space-y-3 text-sm text-muted-foreground">
                              {subsection.content.map((paragraph, pIndex) => (
                                <p key={pIndex} className="leading-relaxed text-justify">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                            
                            {/* Puntos Clave */}
                            {subsection.keyPoints && subsection.keyPoints.length > 0 && (
                              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 mt-3">
                                <h5 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Puntos Clave
                                </h5>
                                <div className="flex flex-wrap gap-1.5">
                                  {subsection.keyPoints.map((point, pointIndex) => (
                                    <Badge key={pointIndex} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                                      {point}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Botón de descarga global */}
      <div className="flex flex-wrap gap-2 pt-2">
        {Object.values(MANUAL_CONTENT).map((manual, idx) => (
          <Button key={idx} variant="outline" size="sm" asChild>
            <a href={manual.pdfUrl} download className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {manual.title.split(' - ')[0]}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
