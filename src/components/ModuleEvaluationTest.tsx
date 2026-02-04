import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  FileQuestion, CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
  Loader2, Trophy, AlertCircle, Clock, RotateCcw, Sparkles, Wand2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ModuleEvaluationTestProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  moduleId: string;
  moduleTitle: string;
  courseId?: string;
  enrollmentId?: string;
  inline?: boolean;
  onComplete?: (result: TestResult) => void;
}

interface Question {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  unit?: string;
}

interface TestResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  answers: Record<string, string>;
}

// Generate 50 questions covering all units of the module
const generateModuleQuestions = (moduleTitle: string): Question[] => {
  const questions: Question[] = [];
  
  // Questions for administrative modules (MF0969_1 style)
  if (moduleTitle.toLowerCase().includes('técnicas administrativas') || moduleTitle.toLowerCase().includes('mf0969')) {
    // UF0517 - Organización Empresarial
    const uf0517Questions: Question[] = [
      {
        id: "q1",
        question: "¿Cuál es la función principal del departamento de Recursos Humanos?",
        options: [
          { id: "a", text: "Gestionar las finanzas de la empresa" },
          { id: "b", text: "Gestionar el personal y sus necesidades" },
          { id: "c", text: "Producir bienes y servicios" },
          { id: "d", text: "Diseñar productos nuevos" }
        ],
        correctOptionId: "b",
        explanation: "El departamento de RRHH se encarga de la gestión del personal, incluyendo selección, formación, nóminas y relaciones laborales.",
        unit: "UF0517"
      },
      {
        id: "q2",
        question: "¿Qué tipo de estructura organizativa se caracteriza por la especialización funcional?",
        options: [
          { id: "a", text: "Estructura lineal" },
          { id: "b", text: "Estructura funcional" },
          { id: "c", text: "Estructura matricial" },
          { id: "d", text: "Estructura divisional" }
        ],
        correctOptionId: "b",
        explanation: "La estructura funcional agrupa las actividades por funciones especializadas como marketing, finanzas, producción, etc.",
        unit: "UF0517"
      },
      {
        id: "q3",
        question: "¿Cuál es el órgano máximo de gobierno de una Sociedad Anónima?",
        options: [
          { id: "a", text: "El Consejo de Administración" },
          { id: "b", text: "La Junta General de Accionistas" },
          { id: "c", text: "El Director General" },
          { id: "d", text: "El Comité de Dirección" }
        ],
        correctOptionId: "b",
        explanation: "La Junta General de Accionistas es el órgano supremo de gobierno donde se toman las decisiones más importantes de la sociedad.",
        unit: "UF0517"
      },
      {
        id: "q4",
        question: "¿Qué significa el acrónimo PYME?",
        options: [
          { id: "a", text: "Pequeña y Mediana Empresa" },
          { id: "b", text: "Programa de Mejora Empresarial" },
          { id: "c", text: "Plan de Marketing Empresarial" },
          { id: "d", text: "Producción y Manufactura Económica" }
        ],
        correctOptionId: "a",
        explanation: "PYME significa Pequeña y Mediana Empresa, clasificación basada en número de empleados y volumen de negocio.",
        unit: "UF0517"
      },
      {
        id: "q5",
        question: "¿Cuál es la característica principal de una empresa individual?",
        options: [
          { id: "a", text: "Responsabilidad limitada" },
          { id: "b", text: "El titular responde con todo su patrimonio" },
          { id: "c", text: "Capital mínimo de 60.000€" },
          { id: "d", text: "Necesita al menos 3 socios" }
        ],
        correctOptionId: "b",
        explanation: "En la empresa individual el empresario responde de las deudas con todo su patrimonio personal (responsabilidad ilimitada).",
        unit: "UF0517"
      },
      {
        id: "q6",
        question: "¿Qué documento acredita la inscripción de una empresa en el Registro Mercantil?",
        options: [
          { id: "a", text: "DNI del empresario" },
          { id: "b", text: "Escritura de constitución" },
          { id: "c", text: "Certificación registral" },
          { id: "d", text: "Licencia de actividad" }
        ],
        correctOptionId: "c",
        explanation: "La certificación registral es el documento que acredita que una empresa está inscrita en el Registro Mercantil.",
        unit: "UF0517"
      },
      {
        id: "q7",
        question: "¿Cuántos empleados como máximo puede tener una microempresa según criterios UE?",
        options: [
          { id: "a", text: "5 empleados" },
          { id: "b", text: "10 empleados" },
          { id: "c", text: "25 empleados" },
          { id: "d", text: "50 empleados" }
        ],
        correctOptionId: "b",
        explanation: "Según la UE, una microempresa tiene menos de 10 empleados y un volumen de negocio inferior a 2 millones de euros.",
        unit: "UF0517"
      },
      {
        id: "q8",
        question: "¿Qué órgano de la Administración General del Estado coordina las políticas ministeriales?",
        options: [
          { id: "a", text: "El Congreso" },
          { id: "b", text: "El Consejo de Ministros" },
          { id: "c", text: "El Senado" },
          { id: "d", text: "El Tribunal Constitucional" }
        ],
        correctOptionId: "b",
        explanation: "El Consejo de Ministros es el órgano colegiado del Gobierno que coordina las políticas de los distintos ministerios.",
        unit: "UF0517"
      },
      {
        id: "q9",
        question: "¿Cuál es el capital mínimo para constituir una Sociedad Limitada?",
        options: [
          { id: "a", text: "1€" },
          { id: "b", text: "3.000€" },
          { id: "c", text: "60.000€" },
          { id: "d", text: "No hay mínimo" }
        ],
        correctOptionId: "a",
        explanation: "Desde la reforma de 2022, el capital mínimo para constituir una SL es de 1€, aunque históricamente era de 3.000€.",
        unit: "UF0517"
      },
      {
        id: "q10",
        question: "¿Qué institución europea es responsable de la política monetaria?",
        options: [
          { id: "a", text: "La Comisión Europea" },
          { id: "b", text: "El Parlamento Europeo" },
          { id: "c", text: "El Banco Central Europeo" },
          { id: "d", text: "El Consejo de la UE" }
        ],
        correctOptionId: "c",
        explanation: "El BCE es responsable de la política monetaria de la zona euro y de mantener la estabilidad de precios.",
        unit: "UF0517"
      }
    ];

    // UF0518 - Correspondencia
    const uf0518Questions: Question[] = [
      {
        id: "q11",
        question: "¿Cuál es el primer paso en el tratamiento de la correspondencia entrante?",
        options: [
          { id: "a", text: "Clasificar por departamentos" },
          { id: "b", text: "Recepción y registro" },
          { id: "c", text: "Distribución interna" },
          { id: "d", text: "Archivo" }
        ],
        correctOptionId: "b",
        explanation: "El primer paso es la recepción y registro de la correspondencia para tener constancia documental de su entrada.",
        unit: "UF0518"
      },
      {
        id: "q12",
        question: "¿Qué tipo de envío postal garantiza la entrega en mano al destinatario?",
        options: [
          { id: "a", text: "Carta ordinaria" },
          { id: "b", text: "Carta certificada" },
          { id: "c", text: "Burofax" },
          { id: "d", text: "Paquete postal" }
        ],
        correctOptionId: "c",
        explanation: "El burofax garantiza la entrega en mano y tiene valor legal como medio probatorio.",
        unit: "UF0518"
      },
      {
        id: "q13",
        question: "¿Qué elemento NO es obligatorio en una carta comercial?",
        options: [
          { id: "a", text: "Membrete" },
          { id: "b", text: "Fecha" },
          { id: "c", text: "Firma" },
          { id: "d", text: "Fotografía del remitente" }
        ],
        correctOptionId: "d",
        explanation: "La fotografía del remitente no es un elemento de las cartas comerciales. Los elementos obligatorios son membrete, fecha, destinatario, cuerpo y firma.",
        unit: "UF0518"
      },
      {
        id: "q14",
        question: "¿Cuál es la función del libro registro de correspondencia?",
        options: [
          { id: "a", text: "Almacenar las cartas físicamente" },
          { id: "b", text: "Controlar la entrada y salida de documentos" },
          { id: "c", text: "Destruir documentos antiguos" },
          { id: "d", text: "Clasificar por colores" }
        ],
        correctOptionId: "b",
        explanation: "El libro registro permite controlar y tener constancia de toda la correspondencia entrante y saliente de la organización.",
        unit: "UF0518"
      },
      {
        id: "q15",
        question: "¿Qué sistema de clasificación ordena los documentos por orden alfabético?",
        options: [
          { id: "a", text: "Sistema cronológico" },
          { id: "b", text: "Sistema numérico" },
          { id: "c", text: "Sistema alfabético" },
          { id: "d", text: "Sistema geográfico" }
        ],
        correctOptionId: "c",
        explanation: "El sistema alfabético ordena los documentos según el abecedario, normalmente por apellidos o nombres de empresas.",
        unit: "UF0518"
      },
      {
        id: "q16",
        question: "¿Cuál es el plazo máximo de conservación de documentación fiscal general?",
        options: [
          { id: "a", text: "2 años" },
          { id: "b", text: "4 años" },
          { id: "c", text: "6 años" },
          { id: "d", text: "10 años" }
        ],
        correctOptionId: "b",
        explanation: "La documentación fiscal debe conservarse durante 4 años, que es el plazo de prescripción tributaria.",
        unit: "UF0518"
      },
      {
        id: "q17",
        question: "¿Qué significa 'franqueo concertado'?",
        options: [
          { id: "a", text: "Pagar los sellos en efectivo" },
          { id: "b", text: "Un acuerdo de pago con Correos para envíos masivos" },
          { id: "c", text: "Envío gratuito" },
          { id: "d", text: "Servicio urgente" }
        ],
        correctOptionId: "b",
        explanation: "El franqueo concertado es un acuerdo con Correos que permite a las empresas realizar envíos masivos con tarifas especiales.",
        unit: "UF0518"
      },
      {
        id: "q18",
        question: "¿Qué tipo de archivo contiene documentos de uso frecuente?",
        options: [
          { id: "a", text: "Archivo histórico" },
          { id: "b", text: "Archivo definitivo" },
          { id: "c", text: "Archivo activo" },
          { id: "d", text: "Archivo pasivo" }
        ],
        correctOptionId: "c",
        explanation: "El archivo activo o de gestión contiene la documentación de uso frecuente y consulta habitual.",
        unit: "UF0518"
      },
      {
        id: "q19",
        question: "¿Cuál es la diferencia principal entre carta certificada y burofax?",
        options: [
          { id: "a", text: "El color del sobre" },
          { id: "b", text: "El burofax certifica el contenido, la carta solo la entrega" },
          { id: "c", text: "El precio" },
          { id: "d", text: "El tamaño del documento" }
        ],
        correctOptionId: "b",
        explanation: "El burofax certifica tanto la entrega como el contenido del documento, mientras que la carta certificada solo certifica la entrega.",
        unit: "UF0518"
      },
      {
        id: "q20",
        question: "¿Qué es el expurgo de documentos?",
        options: [
          { id: "a", text: "Organizar documentos" },
          { id: "b", text: "Eliminar documentos que ya no tienen valor" },
          { id: "c", text: "Digitalizar documentos" },
          { id: "d", text: "Clasificar por fechas" }
        ],
        correctOptionId: "b",
        explanation: "El expurgo es el proceso de eliminación controlada de documentos que han perdido su valor administrativo, legal o histórico.",
        unit: "UF0518"
      }
    ];

    // UF0519 - Documentación Administrativa
    const uf0519Questions: Question[] = [
      {
        id: "q21",
        question: "¿Qué documento acredita la entrega de mercancía?",
        options: [
          { id: "a", text: "Factura" },
          { id: "b", text: "Albarán" },
          { id: "c", text: "Pedido" },
          { id: "d", text: "Presupuesto" }
        ],
        correctOptionId: "b",
        explanation: "El albarán o nota de entrega acredita que la mercancía ha sido entregada y recibida por el cliente.",
        unit: "UF0519"
      },
      {
        id: "q22",
        question: "¿Cuál es el IVA general en España?",
        options: [
          { id: "a", text: "4%" },
          { id: "b", text: "10%" },
          { id: "c", text: "21%" },
          { id: "d", text: "25%" }
        ],
        correctOptionId: "c",
        explanation: "El tipo general del IVA en España es del 21%. Existen tipos reducidos del 10% y superreducido del 4%.",
        unit: "UF0519"
      },
      {
        id: "q23",
        question: "¿Qué documento se emite para corregir errores en una factura?",
        options: [
          { id: "a", text: "Factura proforma" },
          { id: "b", text: "Factura simplificada" },
          { id: "c", text: "Factura rectificativa" },
          { id: "d", text: "Factura recapitulativa" }
        ],
        correctOptionId: "c",
        explanation: "La factura rectificativa se emite para corregir errores o modificar datos de una factura ya emitida.",
        unit: "UF0519"
      },
      {
        id: "q24",
        question: "¿Qué concepto aparece en la nómina como 'devengos'?",
        options: [
          { id: "a", text: "Las deducciones del trabajador" },
          { id: "b", text: "Las cantidades que percibe el trabajador" },
          { id: "c", text: "Los impuestos a pagar" },
          { id: "d", text: "Las cuotas patronales" }
        ],
        correctOptionId: "b",
        explanation: "Los devengos son todas las percepciones que tiene derecho a cobrar el trabajador: salario base, complementos, horas extra, etc.",
        unit: "UF0519"
      },
      {
        id: "q25",
        question: "¿Cuál es el medio de pago más seguro para operaciones de alto importe?",
        options: [
          { id: "a", text: "Efectivo" },
          { id: "b", text: "Cheque al portador" },
          { id: "c", text: "Transferencia bancaria" },
          { id: "d", text: "Pagaré" }
        ],
        correctOptionId: "c",
        explanation: "La transferencia bancaria es el medio más seguro ya que deja constancia electrónica y no implica manejo de efectivo o documentos físicos.",
        unit: "UF0519"
      },
      {
        id: "q26",
        question: "¿Qué es el arqueo de caja?",
        options: [
          { id: "a", text: "Contar el dinero físico y compararlo con los registros" },
          { id: "b", text: "Guardar el dinero en la caja fuerte" },
          { id: "c", text: "Pagar a los proveedores" },
          { id: "d", text: "Calcular el IVA" }
        ],
        correctOptionId: "a",
        explanation: "El arqueo de caja es la verificación del dinero físico existente comparándolo con el saldo teórico según los registros.",
        unit: "UF0519"
      },
      {
        id: "q27",
        question: "¿Qué tipo de cheque solo puede cobrarse en cuenta bancaria?",
        options: [
          { id: "a", text: "Cheque al portador" },
          { id: "b", text: "Cheque cruzado" },
          { id: "c", text: "Cheque nominativo" },
          { id: "d", text: "Cheque conformado" }
        ],
        correctOptionId: "b",
        explanation: "El cheque cruzado (con dos líneas paralelas) solo puede cobrarse mediante ingreso en cuenta, no en efectivo.",
        unit: "UF0519"
      },
      {
        id: "q28",
        question: "¿Qué método de valoración de existencias asigna el coste medio a las salidas?",
        options: [
          { id: "a", text: "FIFO" },
          { id: "b", text: "LIFO" },
          { id: "c", text: "PMP (Precio Medio Ponderado)" },
          { id: "d", text: "Identificación específica" }
        ],
        correctOptionId: "c",
        explanation: "El método PMP calcula el coste medio de las existencias y lo asigna a cada unidad que sale del almacén.",
        unit: "UF0519"
      },
      {
        id: "q29",
        question: "¿Qué documento justifica el pago de una factura?",
        options: [
          { id: "a", text: "Albarán" },
          { id: "b", text: "Pedido" },
          { id: "c", text: "Recibo" },
          { id: "d", text: "Presupuesto" }
        ],
        correctOptionId: "c",
        explanation: "El recibo es el documento que justifica que se ha realizado un pago y que el acreedor ha recibido el importe.",
        unit: "UF0519"
      },
      {
        id: "q30",
        question: "¿Cuál es el plazo de pago máximo legal entre empresas en España?",
        options: [
          { id: "a", text: "30 días" },
          { id: "b", text: "60 días" },
          { id: "c", text: "90 días" },
          { id: "d", text: "120 días" }
        ],
        correctOptionId: "b",
        explanation: "La Ley de Morosidad establece un plazo máximo de pago de 60 días naturales entre empresas.",
        unit: "UF0519"
      },
      {
        id: "q31",
        question: "¿Qué significa IRPF?",
        options: [
          { id: "a", text: "Impuesto sobre la Renta de las Personas Físicas" },
          { id: "b", text: "Impuesto Regional de Personas Fiscales" },
          { id: "c", text: "Ingreso Regular de Pagos Financieros" },
          { id: "d", text: "Índice de Retención de Productos Fiscales" }
        ],
        correctOptionId: "a",
        explanation: "IRPF son las siglas del Impuesto sobre la Renta de las Personas Físicas, que grava la renta obtenida por los ciudadanos.",
        unit: "UF0519"
      },
      {
        id: "q32",
        question: "¿Qué es la conciliación bancaria?",
        options: [
          { id: "a", text: "Abrir una cuenta nueva" },
          { id: "b", text: "Comparar el extracto bancario con los registros contables" },
          { id: "c", text: "Solicitar un préstamo" },
          { id: "d", text: "Cerrar una cuenta" }
        ],
        correctOptionId: "b",
        explanation: "La conciliación bancaria es el proceso de verificar que los movimientos del extracto bancario coinciden con los registros contables de la empresa.",
        unit: "UF0519"
      },
      {
        id: "q33",
        question: "¿Qué documento se utiliza para solicitar productos a un proveedor?",
        options: [
          { id: "a", text: "Factura" },
          { id: "b", text: "Albarán" },
          { id: "c", text: "Pedido" },
          { id: "d", text: "Recibo" }
        ],
        correctOptionId: "c",
        explanation: "El pedido es el documento que el cliente envía al proveedor solicitando productos o servicios.",
        unit: "UF0519"
      },
      {
        id: "q34",
        question: "¿Qué tipo de existencias son los materiales que se incorporan al producto final?",
        options: [
          { id: "a", text: "Productos terminados" },
          { id: "b", text: "Materias primas" },
          { id: "c", text: "Material de oficina" },
          { id: "d", text: "Mercaderías" }
        ],
        correctOptionId: "b",
        explanation: "Las materias primas son los materiales básicos que se transforman e incorporan al producto final durante el proceso productivo.",
        unit: "UF0519"
      },
      {
        id: "q35",
        question: "¿Cuándo se utiliza una factura proforma?",
        options: [
          { id: "a", text: "Para corregir errores" },
          { id: "b", text: "Como presupuesto o para trámites aduaneros" },
          { id: "c", text: "Para el cliente final en tiendas" },
          { id: "d", text: "Para agrupar varias operaciones" }
        ],
        correctOptionId: "b",
        explanation: "La factura proforma se usa como presupuesto vinculante, para trámites aduaneros o para solicitar créditos documentarios.",
        unit: "UF0519"
      },
      {
        id: "q36",
        question: "¿Qué elemento NO es obligatorio en una factura ordinaria?",
        options: [
          { id: "a", text: "Número de factura" },
          { id: "b", text: "NIF del emisor" },
          { id: "c", text: "Fecha de emisión" },
          { id: "d", text: "Fotografía del producto" }
        ],
        correctOptionId: "d",
        explanation: "La fotografía del producto no es obligatoria. Los elementos obligatorios incluyen número, fecha, NIF, descripción de productos y precios.",
        unit: "UF0519"
      },
      {
        id: "q37",
        question: "¿Qué método FIFO significa?",
        options: [
          { id: "a", text: "First In, First Out (Primera entrada, primera salida)" },
          { id: "b", text: "Final Input, Final Output" },
          { id: "c", text: "First Input, Full Output" },
          { id: "d", text: "Fast In, Fast Out" }
        ],
        correctOptionId: "a",
        explanation: "FIFO significa 'First In, First Out' - las primeras unidades que entran al almacén son las primeras que salen.",
        unit: "UF0519"
      },
      {
        id: "q38",
        question: "¿Cuál es la base de cotización de la Seguridad Social?",
        options: [
          { id: "a", text: "Solo el salario base" },
          { id: "b", text: "La remuneración total del trabajador" },
          { id: "c", text: "Solo los complementos" },
          { id: "d", text: "El salario mínimo interprofesional" }
        ],
        correctOptionId: "b",
        explanation: "La base de cotización incluye la remuneración total del trabajador: salario base más complementos salariales.",
        unit: "UF0519"
      },
      {
        id: "q39",
        question: "¿Qué es el stock de seguridad?",
        options: [
          { id: "a", text: "Las existencias máximas" },
          { id: "b", text: "El inventario mínimo para evitar roturas de stock" },
          { id: "c", text: "Los productos caducados" },
          { id: "d", text: "El material de embalaje" }
        ],
        correctOptionId: "b",
        explanation: "El stock de seguridad es el nivel mínimo de inventario que se mantiene para evitar quedarse sin existencias ante variaciones de demanda.",
        unit: "UF0519"
      },
      {
        id: "q40",
        question: "¿Qué impuesto grava las transmisiones patrimoniales onerosas?",
        options: [
          { id: "a", text: "IVA" },
          { id: "b", text: "IRPF" },
          { id: "c", text: "ITP (Impuesto de Transmisiones Patrimoniales)" },
          { id: "d", text: "Impuesto de Sociedades" }
        ],
        correctOptionId: "c",
        explanation: "El ITP grava las transmisiones patrimoniales onerosas entre particulares, como la compraventa de vehículos usados o viviendas de segunda mano.",
        unit: "UF0519"
      }
    ];

    // Additional general questions
    const generalQuestions: Question[] = [
      {
        id: "q41",
        question: "¿Cuál es el objetivo principal de la gestión administrativa?",
        options: [
          { id: "a", text: "Maximizar beneficios a cualquier coste" },
          { id: "b", text: "Organizar y coordinar eficientemente los recursos" },
          { id: "c", text: "Reducir el personal" },
          { id: "d", text: "Aumentar la burocracia" }
        ],
        correctOptionId: "b",
        explanation: "La gestión administrativa busca organizar y coordinar eficientemente los recursos para alcanzar los objetivos organizacionales.",
        unit: "General"
      },
      {
        id: "q42",
        question: "¿Qué habilidad es fundamental para un auxiliar administrativo?",
        options: [
          { id: "a", text: "Conocimientos de mecánica" },
          { id: "b", text: "Organización y gestión documental" },
          { id: "c", text: "Diseño gráfico avanzado" },
          { id: "d", text: "Programación de aplicaciones" }
        ],
        correctOptionId: "b",
        explanation: "La organización y gestión documental es una competencia fundamental del auxiliar administrativo.",
        unit: "General"
      },
      {
        id: "q43",
        question: "¿Qué normativa regula la protección de datos en España?",
        options: [
          { id: "a", text: "Ley de Ordenación del Comercio" },
          { id: "b", text: "LOPDGDD y RGPD" },
          { id: "c", text: "Ley General Tributaria" },
          { id: "d", text: "Estatuto de los Trabajadores" }
        ],
        correctOptionId: "b",
        explanation: "La protección de datos se regula por el RGPD europeo y la LOPDGDD (Ley Orgánica de Protección de Datos y Garantía de Derechos Digitales).",
        unit: "General"
      },
      {
        id: "q44",
        question: "¿Cuál es el horario máximo de trabajo semanal según el Estatuto de los Trabajadores?",
        options: [
          { id: "a", text: "35 horas" },
          { id: "b", text: "37,5 horas" },
          { id: "c", text: "40 horas" },
          { id: "d", text: "45 horas" }
        ],
        correctOptionId: "c",
        explanation: "El Estatuto de los Trabajadores establece una jornada máxima de 40 horas semanales de trabajo efectivo.",
        unit: "General"
      },
      {
        id: "q45",
        question: "¿Qué es un ERP?",
        options: [
          { id: "a", text: "Un tipo de documento comercial" },
          { id: "b", text: "Un sistema de planificación de recursos empresariales" },
          { id: "c", text: "Un impuesto especial" },
          { id: "d", text: "Una técnica de archivo" }
        ],
        correctOptionId: "b",
        explanation: "ERP (Enterprise Resource Planning) es un sistema de software que integra y gestiona todos los procesos de negocio de una organización.",
        unit: "General"
      },
      {
        id: "q46",
        question: "¿Cuál es la función del libro de visitas de la Inspección de Trabajo?",
        options: [
          { id: "a", text: "Registrar a los clientes que visitan la empresa" },
          { id: "b", text: "Documentar las actuaciones de la Inspección de Trabajo" },
          { id: "c", text: "Controlar el horario de los empleados" },
          { id: "d", text: "Anotar los pedidos de proveedores" }
        ],
        correctOptionId: "b",
        explanation: "El libro de visitas es obligatorio para documentar las actuaciones de los inspectores de trabajo en la empresa.",
        unit: "General"
      },
      {
        id: "q47",
        question: "¿Qué significa digitalización de documentos?",
        options: [
          { id: "a", text: "Destruir documentos físicos" },
          { id: "b", text: "Convertir documentos físicos a formato electrónico" },
          { id: "c", text: "Clasificar documentos por fecha" },
          { id: "d", text: "Enviar documentos por correo" }
        ],
        correctOptionId: "b",
        explanation: "La digitalización consiste en convertir documentos en papel a formato electrónico mediante escaneado u otros métodos.",
        unit: "General"
      },
      {
        id: "q48",
        question: "¿Qué es el flujo de caja o cash flow?",
        options: [
          { id: "a", text: "El dinero que tiene la empresa en el banco" },
          { id: "b", text: "El movimiento de entrada y salida de dinero" },
          { id: "c", text: "Los beneficios anuales" },
          { id: "d", text: "Los gastos fijos" }
        ],
        correctOptionId: "b",
        explanation: "El flujo de caja representa todos los movimientos de entrada y salida de dinero de la empresa en un período determinado.",
        unit: "General"
      },
      {
        id: "q49",
        question: "¿Cuál es el objetivo del control de calidad?",
        options: [
          { id: "a", text: "Aumentar los costes de producción" },
          { id: "b", text: "Garantizar que los productos cumplen los estándares establecidos" },
          { id: "c", text: "Reducir el personal" },
          { id: "d", text: "Eliminar toda la documentación" }
        ],
        correctOptionId: "b",
        explanation: "El control de calidad verifica que los productos y servicios cumplen con los estándares y especificaciones establecidos.",
        unit: "General"
      },
      {
        id: "q50",
        question: "¿Qué es la confidencialidad en el trabajo administrativo?",
        options: [
          { id: "a", text: "Compartir toda la información con compañeros" },
          { id: "b", text: "Proteger la información sensible de accesos no autorizados" },
          { id: "c", text: "Guardar los documentos en carpetas de colores" },
          { id: "d", text: "Publicar datos en redes sociales" }
        ],
        correctOptionId: "b",
        explanation: "La confidencialidad implica proteger la información sensible de la empresa y de terceros, limitando el acceso solo a personas autorizadas.",
        unit: "General"
      }
    ];

    questions.push(...uf0517Questions, ...uf0518Questions, ...uf0519Questions, ...generalQuestions);
  } else {
    // Generic questions for other modules
    for (let i = 1; i <= 50; i++) {
      questions.push({
        id: `q${i}`,
        question: `Pregunta ${i} del módulo ${moduleTitle}`,
        options: [
          { id: "a", text: "Opción A" },
          { id: "b", text: "Opción B" },
          { id: "c", text: "Opción C" },
          { id: "d", text: "Opción D" }
        ],
        correctOptionId: ["a", "b", "c", "d"][Math.floor(Math.random() * 4)],
        explanation: "Explicación de la respuesta correcta.",
        unit: "General"
      });
    }
  }

  // Shuffle questions
  return questions.sort(() => Math.random() - 0.5);
};

export function ModuleEvaluationTest({
  open,
  onOpenChange,
  moduleId,
  moduleTitle,
  courseId,
  enrollmentId,
  inline = false,
  onComplete
}: ModuleEvaluationTestProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiQuestionsGenerated, setAiQuestionsGenerated] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [showReview, setShowReview] = useState(false);

  // Generate questions with AI based on module content
  const handleGenerateAIQuestions = async () => {
    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-module-questions', {
        body: {
          moduleId,
          moduleTitle,
          numberOfQuestions: 50
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAiQuestionsGenerated(true);
        toast({
          title: "¡Preguntas generadas!",
          description: `Se han creado ${data.questions.length} preguntas basadas en el contenido del módulo.`,
        });
      } else {
        throw new Error("No se generaron preguntas");
      }
    } catch (err) {
      console.error("Error generating AI questions:", err);
      toast({
        title: "Error al generar preguntas",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive"
      });
      // Fall back to default questions
      setQuestions(generateModuleQuestions(moduleTitle));
    } finally {
      setGeneratingAI(false);
    }
  };

  // Load questions when dialog opens or component mounts (inline mode)
  useEffect(() => {
    if ((open || inline) && !testStarted) {
      setQuestions(generateModuleQuestions(moduleTitle));
      setAnswers({});
      setCurrentQuestionIndex(0);
      setTestCompleted(false);
      setResult(null);
      setShowReview(false);
    }
  }, [open, inline, moduleTitle, testStarted]);

  // Timer
  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setTestStarted(true);
    setTimeRemaining(60 * 60);
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleFinishTest = async () => {
    const correctAnswers = questions.filter(q => answers[q.id] === q.correctOptionId).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 50;

    const testResult: TestResult = {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      passed,
      answers
    };

    setResult(testResult);
    setTestCompleted(true);

    // Save result to database
    if (user && enrollmentId) {
      try {
        const { error } = await supabase
          .from("evaluation_attempts")
          .insert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            evaluation_id: moduleId, // Using module ID as evaluation ID for module tests
            score,
            status: 'completed',
            completed_at: new Date().toISOString(),
            answers: answers,
            attempt_number: 1,
            time_spent_seconds: 3600 - timeRemaining
          });

        if (error) console.error("Error saving test result:", error);
      } catch (err) {
        console.error("Error saving test result:", err);
      }
    }

    toast({
      title: passed ? "¡Test completado!" : "Test finalizado",
      description: passed 
        ? `Has aprobado con un ${score}% de aciertos.`
        : `Has obtenido un ${score}%. Necesitas al menos 50% para aprobar.`,
      variant: passed ? "default" : "destructive"
    });
  };

  const handleRetry = () => {
    setQuestions(generateModuleQuestions(moduleTitle));
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTestStarted(false);
    setTestCompleted(false);
    setResult(null);
    setShowReview(false);
    setTimeRemaining(60 * 60);
    setAiQuestionsGenerated(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((Object.keys(answers).length) / questions.length) * 100 : 0;

  // Call onComplete when test is finished
  useEffect(() => {
    if (result && onComplete) {
      onComplete(result);
    }
  }, [result, onComplete]);

  const testContent = (
    <ScrollArea className="flex-1 px-1">
      {!testStarted ? (
        /* Start Screen */
        <div className="space-y-6 py-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <FileQuestion className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Evaluación Final del Módulo</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Este test evalúa todos los conocimientos adquiridos en el módulo. 
              Dispones de 60 minutos para completar las {questions.length || 50} preguntas.
            </p>
          </div>

          {/* AI Generation Option */}
          {!aiQuestionsGenerated && (
            <div className="max-w-lg mx-auto">
              <Alert className="border-primary/30 bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription className="ml-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-sm">
                      Genera preguntas personalizadas basadas en el contenido real del módulo usando IA.
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGenerateAIQuestions}
                      disabled={generatingAI}
                      className="shrink-0"
                    >
                      {generatingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generar con IA
                        </>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {aiQuestionsGenerated && (
            <div className="max-w-lg mx-auto">
              <Alert className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="ml-2 text-green-700 dark:text-green-400">
                  ✓ Preguntas generadas con IA basadas en el contenido del módulo ({questions.length} preguntas)
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <FileQuestion className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">{questions.length || 50} Preguntas</p>
                <p className="text-xs text-muted-foreground">Tipo test múltiple</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="font-semibold">60 Minutos</p>
                <p className="text-xs text-muted-foreground">Tiempo límite</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="font-semibold">50% Mínimo</p>
                <p className="text-xs text-muted-foreground">Para aprobar</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={handleStartTest} className="px-8" disabled={generatingAI}>
              Comenzar Test
            </Button>
          </div>
        </div>
          ) : testCompleted && result ? (
            /* Results Screen */
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  result.passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.passed ? (
                    <Trophy className="h-12 w-12 text-green-600" />
                  ) : (
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  )}
                </div>
                <h3 className="text-2xl font-bold">
                  {result.passed ? '¡Enhorabuena!' : 'No has superado el test'}
                </h3>
                <p className="text-muted-foreground">
                  {result.passed 
                    ? 'Has completado satisfactoriamente la evaluación del módulo.'
                    : 'No te preocupes, puedes volver a intentarlo.'}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-5xl font-bold text-primary">{result.score}%</div>
                      <p className="text-muted-foreground">Puntuación obtenida</p>
                      <div className="flex justify-center gap-8 pt-4">
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-green-600">{result.correctAnswers}</p>
                          <p className="text-xs text-muted-foreground">Correctas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-red-600">{result.totalQuestions - result.correctAnswers}</p>
                          <p className="text-xs text-muted-foreground">Incorrectas</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowReview(!showReview)}
                  >
                    {showReview ? 'Ocultar Revisión' : 'Ver Revisión'}
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleRetry}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              </div>

              {showReview && (
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold text-lg">Revisión de Respuestas</h4>
                  {questions.map((q, idx) => {
                    const userAnswer = answers[q.id];
                    const isCorrect = userAnswer === q.correctOptionId;
                    return (
                      <Card key={q.id} className={`${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Tu respuesta: {q.options.find(o => o.id === userAnswer)?.text || 'Sin respuesta'}
                              </p>
                              {!isCorrect && (
                                <p className="text-xs text-green-700 mt-1">
                                  Correcta: {q.options.find(o => o.id === q.correctOptionId)?.text}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2 italic">{q.explanation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Test in Progress */
            <div className="space-y-6 py-4">
              {/* Progress and Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm">
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {Object.keys(answers).length} respondidas
                  </Badge>
                </div>
                <Badge 
                  variant={timeRemaining < 300 ? "destructive" : "outline"} 
                  className="text-sm font-mono"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(timeRemaining)}
                </Badge>
              </div>

              <Progress value={progress} className="h-2" />

              {/* Current Question */}
              {currentQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {currentQuestionIndex + 1}. {currentQuestion.question}
                    </CardTitle>
                    {currentQuestion.unit && (
                      <Badge variant="secondary" className="w-fit">{currentQuestion.unit}</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option) => (
                        <div 
                          key={option.id} 
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            answers[currentQuestion.id] === option.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleAnswer(currentQuestion.id, option.id)}
                        >
                          <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                          <Label 
                            htmlFor={`${currentQuestion.id}-${option.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinishTest}
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Finalizar Test
                    </Button>
                  )}
                </div>
              </div>

              {/* Question Navigator */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Navegación Rápida</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {questions.map((q, idx) => (
                      <Button
                        key={q.id}
                        variant={currentQuestionIndex === idx ? "default" : answers[q.id] ? "secondary" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0 text-xs"
                        onClick={() => setCurrentQuestionIndex(idx)}
                      >
                        {idx + 1}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      );

  // If inline mode, render without Dialog
  if (inline) {
    return (
      <div className="w-full">
        {testContent}
      </div>
    );
  }

  // Otherwise, render with Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileQuestion className="h-5 w-5 text-primary" />
            </div>
            Test de Evaluación del Módulo
          </DialogTitle>
          <DialogDescription>
            {moduleTitle} - 50 preguntas tipo test
          </DialogDescription>
        </DialogHeader>
        {testContent}
      </DialogContent>
    </Dialog>
  );
}
