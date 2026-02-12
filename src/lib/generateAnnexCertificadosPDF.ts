import jsPDF from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AnnexCertificadosPDFData {
  centerName: string;
  centerCIF?: string;
  centerAddress?: string;
  signerName: string;
  signerDni: string;
  signerPosition: string;
  signerEmail: string;
  signedAt: string;
  signatureData?: string | null;
  certificados?: Array<{
    codigo: string;
    nombre: string;
    nivel: string;
  }>;
}

export async function generateAnnexCertificadosPDF(data: AnnexCertificadosPDFData) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const signedDate = data.signedAt
    ? format(new Date(data.signedAt), "dd 'de' MMMM 'de' yyyy", { locale: es })
    : "________________";

  // --- Helpers ---
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

  const addParagraph = (text: string) => {
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 4.5 + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  };

  const addBullet = (text: string) => {
    const lines = doc.splitTextToSize(text, contentWidth - 8);
    checkPageBreak(lines.length * 4.5 + 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("•", margin + 2, y);
    doc.text(lines, margin + 8, y);
    y += lines.length * 4.5 + 2;
  };

  const addLetterItem = (letter: string, text: string) => {
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    checkPageBreak(lines.length * 4.5 + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${letter})`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(lines, margin + 10, y);
    y += lines.length * 4.5 + 3;
  };

  // ===== PAGE 1 =====
  addHeader();
  y = 24;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ANEXO CONTRATO CAMPUS TALENTCLOUD:", pageWidth / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(12);
  doc.text("ACREDITACIÓN CERTIFICADOS DE PROFESIONALIDAD", pageWidth / 2, y, { align: "center" });
  y += 12;

  // COMPARECEN
  addTitle("COMPARECEN");

  addParagraph(
    `De una parte, TalentCloud Solutions S.L., con domicilio en España, como distribuidor autorizado de los contenidos y plataforma de teleformación para Certificados de Profesionalidad (en adelante "TalentCloud").`
  );

  addParagraph(
    `De otra parte, D./Dña. ${data.signerName}, con DNI/NIE ${data.signerDni}, en representación de ${data.centerName} (en adelante "el Licenciatario"), con CIF ${data.centerCIF || "____________"}, en calidad de ${data.signerPosition}, y domicilio en ${data.centerAddress || "____________________________________________"}.`
  );

  y += 3;
  addTitle("EXPONEN");

  addBullet(
    "Que TalentCloud Solutions S.L. es titular/distribuidor autorizado de la plataforma de teleformación y los materiales virtuales de aprendizaje de los certificados de profesionalidad detallados en la cláusula SEGUNDA, los cuales cumplen con los requisitos establecidos en la Orden TMS/369/2019 de 28 de marzo, por la que se regula el Registro Estatal de Entidades de Formación del sistema de formación profesional para el empleo en el ámbito laboral."
  );

  addBullet(
    "Que el Licenciatario está interesado en hacer uso bajo el formato de licencia de los contenidos para acreditarse ante la Administración competente como entidad impartidora en la modalidad teleformación, en virtud de lo previsto en la Resolución de 26 de Mayo de 2014 del Servicio Público de Empleo, artículo 4 apartado a)."
  );

  addBullet(
    "Que para lo anterior ha suscrito un contrato para la cesión del derecho de uso de los contenidos virtuales de aprendizaje y de uso de plataforma para la acreditación ante cualquier administración pública estatal o autonómica y la posterior impartición de los Certificados de Profesionalidad en la modalidad teleformación."
  );

  y += 3;
  addTitle("CLÁUSULAS ESPECÍFICAS");

  // PRIMERA
  addTitle("PRIMERA.- Objeto del Acuerdo.");
  addParagraph(
    "El presente contrato tiene por objeto regular las condiciones sobre la cesión del derecho de uso de todos los materiales y soportes didácticos necesarios para la acreditación ante la Administración competente y la posterior impartición de los Certificados de Profesionalidad en la modalidad teleformación."
  );

  // SEGUNDA
  addTitle("SEGUNDA.- Certificados cuyo uso se cede.");
  if (data.certificados && data.certificados.length > 0) {
    // Draw table
    checkPageBreak(10 + data.certificados.length * 7);
    const tableX = margin;
    const colWidths = [15, 80, 50, 15];
    const headerLabels = ["#", "Certificado", "Código", "Nivel"];
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.3);

    // Header row
    let tx = tableX;
    doc.setFillColor(230, 240, 250);
    doc.rect(tableX, y - 4, contentWidth, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    headerLabels.forEach((label, i) => {
      doc.text(label, tx + 2, y);
      tx += colWidths[i];
    });
    doc.line(tableX, y + 3, tableX + contentWidth, y + 3);
    y += 7;

    doc.setFont("helvetica", "normal");
    data.certificados.forEach((cert, idx) => {
      checkPageBreak(7);
      tx = tableX;
      doc.setFontSize(8);
      doc.text(`${idx + 1}`, tx + 2, y);
      tx += colWidths[0];
      const nameLines = doc.splitTextToSize(cert.nombre, colWidths[1] - 4);
      doc.text(nameLines[0], tx + 2, y);
      tx += colWidths[1];
      doc.text(cert.codigo, tx + 2, y);
      tx += colWidths[2];
      doc.text(cert.nivel, tx + 2, y);
      doc.line(tableX, y + 3, tableX + contentWidth, y + 3);
      y += 7;
    });
    y += 3;
  } else {
    addParagraph(
      "Los certificados de profesionalidad objeto de este anexo se detallarán en documento adjunto o se indicarán a continuación: ________________________________________________"
    );
  }

  // TERCERA
  addTitle("TERCERA.- Acreditaciones ante la Administración competente.");
  addLetterItem(
    "a",
    "TalentCloud pone a disposición del Licenciatario los siguientes materiales didácticos necesarios con marca blanca, para que inicie el proceso de acreditación ante la Administración competente:"
  );
  addBullet("Contenido Interactivo Multimedia (CIM) para cubrir el trabajo autónomo del alumno.");
  addBullet("Actividades complementarias para cubrir el trabajo colaborativo del alumno.");
  addBullet("Vídeos didácticos sobre las competencias profesionales de cada unidad didáctica.");
  addBullet("Modelo de contenido para tutorías presenciales.");
  addBullet("Modelo de exámenes presenciales.");
  addBullet("Modelo de guía del alumno, guía del tutor/formador y proyecto formativo.");

  // CUARTA
  addTitle("CUARTA.- Contenidos y operativa.");
  addLetterItem(
    "a",
    "Cada Certificado de Profesionalidad consta de un número determinado de unidades formativas, disponiendo cada una de ellas de todos los elementos necesarios para la acreditación y posterior impartición. Aunque el proceso de acreditaciones se hace de un Certificado completo, la impartición posterior también podrá realizarse parcialmente por módulo o unidad formativa."
  );
  addLetterItem(
    "b",
    "Los Certificados de Profesionalidad se ceden en modo de licencias unipersonales de uso temporal, entendiendo por una licencia la matriculación online de un alumno con todo el material didáctico necesario. Las licencias podrán ser por Certificado completo, parciales por módulo formativo o por unidad didáctica."
  );
  addLetterItem(
    "c",
    "El Licenciatario cuando quiera impartir los contenidos irá solicitando la activación de las licencias según las vaya necesitando en cada una de las unidades formativas, módulos o Certificados completos."
  );
  addLetterItem(
    "d",
    "TalentCloud pone a disposición del Licenciatario el contenido de sus certificados de profesionalidad. Si durante el proceso de acreditación o en cualquier otro momento se solicitasen adaptaciones o cambios sobre el contenido contratado, la ejecución por parte de TalentCloud no queda contemplada bajo el alcance de este contrato."
  );

  // QUINTA
  addTitle("QUINTA.- Obligaciones de las partes.");
  addLetterItem(
    "a",
    "TalentCloud adquiere el compromiso de puesta a disposición del Licenciatario de todos los materiales y soportes didácticos necesarios para la acreditación/impartición de Certificados de Profesionalidad adquiridos."
  );
  addLetterItem(
    "b",
    "TalentCloud se compromete a poner a disposición del Licenciatario aquellas mejoras que incorpore posteriormente a los certificados adquiridos."
  );

  // SEXTA
  addTitle("SEXTA.- Condiciones económicas.");
  addLetterItem(
    "a",
    "El precio por licencia de uso de los Certificados está reflejado en el catálogo de precios de certificados vigente. En caso de modificación de estos precios el Licenciatario será notificado sobre dicho cambio en las condiciones."
  );
  addLetterItem(
    "b",
    "El Licenciatario debe hacer inicialmente, con la firma del presente contrato, la compra de una licencia completa del certificado a acreditar."
  );
  addLetterItem(
    "c",
    "En el caso que no exista otro contrato que comprometa una facturación mínima de 500€/año, cada año natural tras la firma del contrato TalentCloud facturará al cliente 500€ (impuestos no incluidos) en concepto de precompra de las licencias que se consumirán durante los siguientes 12 meses. Del importe asociado a dicho pago anticipado se descontará el precio de las licencias que el cliente consuma durante el año hasta que se agote el saldo."
  );
  addLetterItem(
    "d",
    "El saldo favorable al cliente que no se consuma durante un año natural desde su abono, se usará para cubrir los costes de mantenimiento del servicio activo y disponible. Este saldo no usado no será reembolsable ni acumulable para el cliente en ningún momento."
  );
  addLetterItem(
    "e",
    "Para realizar el primer ingreso se debe indicar claramente el nombre del Licenciatario. El pago se realizará mediante transferencia bancaria a la cuenta: ES14 0182 0861 6802 0169 9387 (BBVA)."
  );
  addLetterItem(
    "f",
    "El número de cuenta que autoriza el Licenciatario para la domiciliación de los siguientes pagos: ____________________________. En caso de cambio de nº de cuenta el Licenciatario se compromete a enviar documento de autorización de domiciliación en su nueva cuenta."
  );

  // SÉPTIMA
  addTitle("SÉPTIMA.- Facturación y pago.");
  addLetterItem(
    "a",
    "El pedido inicial se facturará a la firma del contrato y los pedidos posteriores de consumo se facturarán mensualmente, según el número de licencias activadas cada mes."
  );

  // OCTAVA
  addTitle("OCTAVA.- Explotación de derechos.");
  addParagraph(
    "El alcance de la colaboración se circunscribe a la impartición de títulos de las unidades formativas, respetando en todo momento la integridad de la obra. Para cualquier ampliación, reducción o modificación de la misma por parte del Licenciatario se deberá contar con una autorización expresa de TalentCloud."
  );
  addParagraph(
    "El Licenciatario y cualquier empresa vinculada al mismo, se compromete a no desarrollar los certificados de profesionalidad detallados en el presente Convenio por un período de 4 años desde la firma del mismo."
  );

  // Firma
  checkPageBreak(60);
  y += 5;
  addParagraph(
    `Estando ambas partes de acuerdo con todo lo expuesto en el presente ANEXO AL CONTRATO lo firman digitalmente a través de la plataforma TalentCloud en fecha ${signedDate}.`
  );

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Por el Licenciatario (${data.centerName})`, margin, y);
  doc.text("TalentCloud Solutions S.L.", pageWidth / 2 + 10, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Representante: D./Dña. ${data.signerName}`, margin, y);
  doc.text("Administración", pageWidth / 2 + 10, y);
  y += 5;
  doc.text(`DNI/NIE: ${data.signerDni}`, margin, y);
  y += 5;

  // Signature
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
  doc.text("Este anexo ha sido firmado electrónicamente y tiene plena validez legal conforme al Reglamento (UE) Nº 910/2014 (eIDAS).", margin, y);

  // Headers & footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) addHeader();
    addFooter(i, totalPages);
  }

  const fileName = `Anexo_CertProfesionalidad_${data.centerName.replace(/\s+/g, "_")}_${format(new Date(data.signedAt), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}
