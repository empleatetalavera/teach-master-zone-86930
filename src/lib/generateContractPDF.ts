import jsPDF from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ContractPDFData {
  centerName: string;
  signerName: string;
  signerDni: string;
  signerPosition: string;
  signerEmail: string;
  signedAt: string;
  contractVersion: string;
  contractType: string;
  signatureData?: string | null;
  planName?: string;
  planPrice?: string;
  planCommitment?: string;
}

const PLANS_MAP: Record<string, { name: string; price: string; commitment: string }> = {
  mensual: { name: "Alquiler Mensual", price: "500€/mes", commitment: "Sin compromiso de permanencia" },
  trimestral: { name: "Plan Trimestral", price: "400€/mes", commitment: "Compromiso mínimo 3 meses" },
  anual: { name: "Tarifa Plana Anual", price: "350€/mes + IVA", commitment: "Compromiso mínimo 12 meses" },
  anual_contenido: { name: "Tarifa Plana Anual + Contenido", price: "450€/mes + IVA", commitment: "Compromiso mínimo 12 meses" },
};

export async function generateContractPDF(data: ContractPDFData) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const plan = PLANS_MAP[data.contractType] || {
    name: data.planName || data.contractType,
    price: data.planPrice || "",
    commitment: data.planCommitment || "",
  };

  const signedDate = format(new Date(data.signedAt), "dd 'de' MMMM 'de' yyyy", { locale: es });

  // --- Helper functions ---
  const addHeader = () => {
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, pageWidth, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TALENTCLOUD SOLUTION", margin, 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("eLEARNING INNOVATION", pageWidth - margin, 9, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(margin, 280, pageWidth - margin, 280);
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth / 2, 286, { align: "center" });
    doc.setTextColor(0, 0, 0);
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 272) {
      doc.addPage();
      y = 22;
      addHeader();
    }
  };

  const addTitle = (text: string) => {
    checkPageBreak(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(text, margin, y);
    y += 7;
  };

  const addClause = (num: string, text: string) => {
    const lines = doc.splitTextToSize(text, contentWidth - 8);
    checkPageBreak(lines.length * 4.5 + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${num}.`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(lines, margin + 8, y);
    y += lines.length * 4.5 + 4;
  };

  const addParagraph = (text: string) => {
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 4.5 + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  };

  // ===== PAGE 1 =====
  addHeader();
  y = 24;

  // Main title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const title = "CONDICIONES GENERALES CONTRATACIÓN DE";
  const title2 = "CAMPUS TALENTCLOUD SOLUTION";
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 7;
  doc.text(title2, pageWidth / 2, y, { align: "center" });
  y += 10;

  // Parties
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const partiesText1 = `De una parte, TalentCloud Solutions S.L., con domicilio en España (en adelante "TalentCloud").`;
  const lines1 = doc.splitTextToSize(partiesText1, contentWidth);
  doc.text(lines1, margin, y);
  y += lines1.length * 4.5 + 4;

  const partiesText2 = `De otra parte, ${data.signerName} con DNI/NIE: ${data.signerDni}, en representación de ${data.centerName} (en adelante "El Cliente"), con CIF ____________, en calidad de ${data.signerPosition}, y domicilio en ____________________________________________.`;
  const lines2 = doc.splitTextToSize(partiesText2, contentWidth);
  doc.text(lines2, margin, y);
  y += lines2.length * 4.5 + 4;

  addParagraph("Reconociéndose previa y recíprocamente la capacidad legal necesaria y suficiente para la formalización y firma del presente contrato, a cuyo objeto es el siguiente.");

  y += 3;
  addTitle("CONDICIONES GENERALES CONTRATACIÓN DE CAMPUS TALENTCLOUD");
  addParagraph("Las presentes cláusulas aplicarán con carácter general a la contratación de la plataforma virtual de aprendizaje online, en adelante Campus TalentCloud.");

  // Clauses
  addClause("1", "TalentCloud es distribuidor autorizado de Campus TalentCloud, compatible con las normas internacionales SCORM y de un amplio catálogo de cursos. Así como contenidos que han sido adaptados a los programas formativos del Fichero de Especialidades Formativas del SEPE u Organismos autonómicos competentes, Certificados de Profesionalidad entre otros.");

  addClause("2", "TalentCloud pone a disposición del Cliente una plataforma de formación online personalizada con su imagen, de la que se le facilitarán datos de administración para la gestión de la misma.");

  addClause("3", "En ningún caso la prestación de los servicios contratados por el Cliente supone la transmisión de la titularidad de los derechos de explotación que ostenta TalentCloud.");

  addClause("4", "El alcance de la colaboración se circunscribe a la impartición de títulos de contenidos respetando en todo momento la integridad de la obra, para cualquier modificación de la misma por parte del Cliente se deberá contar con la autorización escrita de TalentCloud.");

  addClause("5", "Si el Cliente hace uso de un contenido del catálogo de TalentCloud, los mismos se ceden en forma de licencias de uso, entendiendo que se activa una licencia en el momento de matriculación de un alumno en un grupo formativo, y la duración de dicha licencia activa es de 180 días.");

  addClause("6", "Para solicitar cualquier acreditación sobre Certificados de Profesionalidad ante terceros el cliente deberá contar con autorización expresa de TalentCloud. Salvo que en las condiciones particulares se indique otras condiciones.");

  addClause("7", "El Cliente se compromete a hacer frente ante terceros de aquellas responsabilidades que fueran exigibles derivadas del uso de su plataforma de formación online. Especialmente de aquel contenido que no fuese licenciado por TalentCloud.");

  addClause("8", `El plan contratado es: ${plan.name} - ${plan.price}. ${plan.commitment}.`);

  addClause("9", "Para la activación del servicio, se realizará un pago inicial. Los pagos se realizarán mediante transferencia bancaria a la cuenta: ES14 0182 0861 6802 0169 9387 (BBVA). Para realizar el ingreso se debe indicar claramente el nombre del cliente.");

  addClause("10", "El número de cuenta que autoriza el cliente para la domiciliación de los siguientes pagos: ____________________________. En caso de cambio de nº de cuenta el cliente se compromete a enviar documento de autorización de domiciliación en su nueva cuenta.");

  // Page 2 clauses
  addClause("11", "En el Campus TalentCloud se podrán impartir acciones formativas no pertenecientes a TalentCloud, cuyo alojamiento se facturará según las condiciones específicas. El Cliente puede subir contenido de terceros al Campus TalentCloud y reconoce tener todos los derechos de explotación necesarios para realizar esa acción y posteriores eximiendo a TalentCloud de cualquier incidencia que pueda surgir con ese contenido.");

  addClause("12", "Para el uso de demos el Cliente deberá utilizar el usuario de alumno que se le facilita en el momento de la provisión del campus, facturándose el resto de alumnos matriculados independientemente del uso de los mismos.");

  addClause("13", "Los consumos o gastos que se realicen en aplicación de este contrato serán facturados por TalentCloud al Cliente, teniendo como forma de pago la domiciliación bancaria. En el caso de contratación de nuevos servicios, estos deberán ser abonados antes de su provisión para la puesta en marcha del servicio.");

  addClause("14", "En caso de detectar cualquier irregularidad en el uso de estos perfiles, TalentCloud facturará las cantidades no cobradas en su caso, y habilitará a TalentCloud para la resolución unilateral del convenio.");

  addClause("15", "En caso de impago de los servicios prestados por TalentCloud, se suspenderán todos los servicios al Cliente hasta la regularización de la deuda contraída. Esta suspensión será comunicada al Cliente antes de su ejecución. En caso de persistir la deuda, se resolverá este contrato y todas las obligaciones que emanan de él para TalentCloud.");

  addClause("16", "En caso de devolución de recibos, TalentCloud repercutirá el coste de devolución y los gastos de gestión al Cliente para continuar con el servicio.");

  addClause("17", "TalentCloud se reserva el derecho de modificar las presentes condiciones generales de contratación de Campus TalentCloud. Con carácter previo a la aplicación de las nuevas condiciones TalentCloud comunicará dichos cambios al Cliente, teniendo éste un plazo de 3 días hábiles para comunicar la NO aceptación de las mismas, lo que conllevará la resolución anticipada del presente acuerdo.");

  addClause("18", `El presente contrato tiene una vigencia según el plan contratado (${plan.commitment}), prorrogable de forma automática por periodos iguales. Para resolver el presente contrato, la parte que quiera rescindir deberá comunicarlo a la otra con una antelación mínima de 90 días antes de la renovación.`);

  addClause("19", "En los casos de baja anticipada del servicio antes del vencimiento del contrato, implicará la aplicación de una penalización única que vendrá reflejada en las cláusulas específicas.");

  addClause("20", "El Cliente consiente en este acto la cesión, total o parcial, de cualesquiera derechos u obligaciones titularidad de TalentCloud, derivados del presente contrato siempre que tal cesión no altere en forma alguna los citados derechos u obligaciones.");

  addClause("21", "Las cuestiones litigiosas a que pudiera dar lugar la interpretación y cumplimiento del presente Contrato quedarán sometidas a la jurisdicción de los Jueces y Tribunales de España.");

  addClause("22", "Con arreglo a la Ley Orgánica 3/2018 de 5 de diciembre de Protección de Datos de Carácter Personal y Garantía de los Derechos Digitales, TalentCloud como encargado del tratamiento, y el Cliente como responsable, mantienen que la efectiva realización del presente contrato implica la necesidad de que ambas partes traten los datos personales de los alumnos conforme al contrato de tratamiento de datos que se anexa.");

  // Subencargados table
  checkPageBreak(25);
  addTitle("XXIII. Subencargados del Tratamiento");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  // Simple table
  const tableY = y;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(margin, tableY, contentWidth, 7);
  doc.rect(margin, tableY + 7, contentWidth, 7);
  doc.line(margin + 8, tableY, margin + 8, tableY + 14);
  doc.line(margin + 70, tableY, margin + 70, tableY + 14);
  doc.setFont("helvetica", "bold");
  doc.text("#", margin + 4, tableY + 5, { align: "center" });
  doc.text("Nombre", margin + 38, tableY + 5, { align: "center" });
  doc.text("Ámbito de aplicación", margin + 70 + (contentWidth - 70 - 8) / 2, tableY + 5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("1", margin + 4, tableY + 12, { align: "center" });
  doc.text("Lovable Cloud Infrastructure", margin + 38, tableY + 12, { align: "center" });
  doc.text("Hosting y operación de la plataforma", margin + 70 + (contentWidth - 70 - 8) / 2, tableY + 12, { align: "center" });
  y = tableY + 20;

  // Signature section
  checkPageBreak(60);
  addTitle("XXIV. Firma y Conformidad");
  addParagraph(`En prueba de conformidad, se firma el presente contrato electrónicamente a través de la plataforma TalentCloud en fecha ${signedDate}.`);
  addParagraph("Estando ambas partes de acuerdo con todo lo expuesto en el presente CONTRATO lo firman digitalmente.");

  y += 5;
  // Two column signature
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Por ${data.centerName}`, margin, y);
  doc.text("TalentCloud Solutions S.L.", pageWidth / 2 + 10, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Representante: D. ${data.signerName}`, margin, y);
  doc.text("Administración", pageWidth / 2 + 10, y);
  y += 5;
  doc.text(`DNI/NIE: ${data.signerDni}`, margin, y);
  y += 5;
  doc.text(`Email: ${data.signerEmail}`, margin, y);
  y += 5;

  // Signature image
  if (data.signatureData) {
    checkPageBreak(35);
    y += 3;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Firma digital del representante:", margin, y);
    y += 3;
    try {
      doc.addImage(data.signatureData, "PNG", margin, y, 50, 20);
      y += 23;
    } catch {
      doc.text("[Firma digital registrada]", margin, y + 5);
      y += 10;
    }
  }

  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text(`Versión del contrato: v${data.contractVersion}`, margin, y);
  y += 4;
  doc.text("Este contrato ha sido firmado electrónicamente y tiene plena validez legal conforme al Reglamento (UE) Nº 910/2014 (eIDAS).", margin, y);

  // Add headers and footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) addHeader();
    addFooter(i, totalPages);
  }

  // Save
  const fileName = `Contrato_${data.centerName.replace(/\s+/g, "_")}_${format(new Date(data.signedAt), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}
