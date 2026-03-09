import jsPDF from "jspdf";
import QRCode from "qrcode";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface CertData {
  studentName: string;
  studentDni: string;
  courseTitle: string;
  durationHours: number;
  courseCode?: string;
  issueDate: string;
  verificationCode: string;
  courseId: string;
  enrolledAt?: string | null;
  completedAt?: string | null;
}

const loadImageAsDataUrl = async (src: string): Promise<string | null> => {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      setTimeout(reject, 5000);
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d")?.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
};

// Sanitize text for jsPDF (replace smart quotes, special chars)
const sanitize = (text: string): string =>
  text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u201E]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013]/g, "-")
    .replace(/[\u2014]/g, "--")
    .replace(/[\u2026]/g, "...")
    .replace(/[\u2192]/g, "->")
    .replace(/[\u00BA]/g, "o")
    .replace(/[\u00AA]/g, "a");

export async function generateEmpleateTalaveraCertPDF(cert: CertData) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  // ===== COLORS from the certificate model =====
  const bgTeal = [129, 164, 147]; // olive/sage green background
  const darkTeal = [0, 75, 85]; // dark teal for left stripe
  const white = [255, 255, 255];
  const navyBlue = [0, 60, 100]; // title color

  // ===== PAGE 1: ANVERSO =====

  // Left dark stripe
  pdf.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  pdf.rect(0, 0, 12, H, "F");

  // Main background
  pdf.setFillColor(bgTeal[0], bgTeal[1], bgTeal[2]);
  pdf.rect(12, 0, W - 12, H, "F");

  // Decorative geometric patterns (subtle hexagon shapes on right side)
  pdf.saveGraphicsState();
  pdf.setGState(new (pdf as any).GState({ opacity: 0.08 }));
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  // Draw some geometric hexagons
  const drawHex = (cx: number, cy: number, r: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    for (let i = 0; i < 6; i++) {
      const next = (i + 1) % 6;
      pdf.line(pts[i][0], pts[i][1], pts[next][0], pts[next][1]);
    }
  };
  // Right side decorative hexagons
  drawHex(W - 25, 25, 18);
  drawHex(W - 10, 50, 15);
  drawHex(W - 30, 70, 12);
  drawHex(W - 15, 100, 18);
  drawHex(W - 35, 130, 14);
  drawHex(W - 10, 160, 16);
  drawHex(W - 25, H - 20, 18);
  pdf.restoreGraphicsState();

  // Logo - Empleate Talavera
  const logoData = await loadImageAsDataUrl("/branding/empleate-talavera-logo.png");
  if (logoData) {
    pdf.addImage(logoData, "PNG", W / 2 - 35, 10, 70, 28);
  } else {
    // Fallback text logo
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.text("EMPLEATE TALAVERA", W / 2, 28, { align: "center" });
    pdf.setFontSize(8);
    pdf.text("F O R M A C I O N", W / 2, 34, { align: "center" });
  }

  // "CERTIFICADO DE APROVECHAMIENTO"
  let y = 50;
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text("CERTIFICADO DE APROVECHAMIENTO", W / 2, y, { align: "center" });

  // Student name + DNI/NIE
  y += 16;
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  const nameText = sanitize(cert.studentName.toUpperCase());
  const dniText = cert.studentDni ? `con DNI/NIE  ${cert.studentDni}` : "";
  pdf.text(nameText, W / 2 - 30, y, { align: "center" });
  if (dniText) {
    pdf.setFontSize(11);
    pdf.text(dniText, W / 2 + 50, y, { align: "center" });
  }

  // "Ha superado con exito..."
  y += 10;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text(
    sanitize("Ha superado con exito los objetivos pedagogicos establecidos en la especialidad Formativa"),
    W / 2,
    y,
    { align: "center" }
  );

  // Course title - BIG and prominent
  y += 14;
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  const titleText = sanitize(`Incorporacion a la Empresa Agraria ${cert.durationHours}H`);
  const titleLines = pdf.splitTextToSize(titleText, W - 80);
  pdf.text(titleLines, W / 2, y, { align: "center" });

  // "CON UN TOTAL DE XXX H LECTIVAS..."
  y += titleLines.length * 9 + 6;
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(white[0], white[1], white[2]);
  const totalLine = sanitize(
    `CON UN TOTAL DE ${cert.durationHours} H LECTIVAS REPARTIDAS EN LOS BLOQUES DE CONTENIDOS QUE FIGURAN EN EL DORSO PARA QUE ASI CONSTE Y SURTA LOS`
  );
  pdf.text(totalLine, W / 2, y, { align: "center" });
  y += 4;
  const issueDate = format(new Date(cert.issueDate), "dd/MM/yyyy");
  pdf.text(
    sanitize(`EFECTOS OPORTUNOS EXPEDIDO EL PRESENTE DIPLOMA CON FECHA ${issueDate}`),
    W / 2,
    y,
    { align: "center" }
  );

  // Homologation text
  y += 6;
  pdf.setFontSize(5.5);
  pdf.setFont("helvetica", "bold");
  const homoText = sanitize(
    "ESTE CURSO HA SIDO HOMOLOGADO POR LA CONSEJERIA DE AGRICULTURA, GANADERIA Y DESARROLLO RURAL DE LA JUNTA DE COMUNIDADES DE CASTILLA-LA MANCHA (JCCM) PARA LA FORMACION DE INCORPORACION A LA EMPRESA AGRARIA."
  );
  const homoLines = pdf.splitTextToSize(homoText, W - 60);
  pdf.text(homoLines, W / 2, y, { align: "center" });

  // Expediente / Registro section
  y += homoLines.length * 3.5 + 8;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  const expCode = cert.courseCode || "[NUMERO DE EXPEDIENTE]";
  pdf.text(sanitize(`NUMERO DE EXPEDIENTE: ${expCode}`), 50, y);
  y += 6;
  pdf.text(sanitize(`FECHA DE REGISTRO: ${issueDate}`), 50, y);
  y += 6;
  pdf.text(sanitize(`REGISTRO OFICIAL: ${cert.verificationCode}`), 50, y);

  // QR code next to expediente
  const verifyUrl = `${window.location.origin}/verificar-diploma/${cert.verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });
  pdf.addImage(qrDataUrl, "PNG", W - 75, y - 18, 22, 22);

  // ===== BOTTOM: Stamp + Signature =====
  const bottomY = H - 52;

  // Left: Stamp/Sello (use generated stamp or text fallback)
  const stampData = await loadImageAsDataUrl("/branding/empleate-talavera-stamp.png");
  if (stampData) {
    pdf.addImage(stampData, "PNG", 40, bottomY - 5, 35, 25);
  }

  // Signature line left
  pdf.setDrawColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  pdf.setLineWidth(0.3);
  pdf.line(30, bottomY + 24, 110, bottomY + 24);

  // Signer name
  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  pdf.text("Fdo: Esmeralda Juarez Correas", 70, bottomY + 29, { align: "center" });
  pdf.text(sanitize("Directora Empleate Talavera Formacion"), 70, bottomY + 33, { align: "center" });

  // Right: "Alumno/a" signature line
  pdf.line(W - 110, bottomY + 24, W - 35, bottomY + 24);
  pdf.setFontSize(7);
  pdf.text("Alumno/a", W - 72, bottomY + 29, { align: "center" });

  // Bottom left info
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 140, 140);
  pdf.text(sanitize("Modalidad: Online (Teleformacion)"), 25, H - 8);

  // ===== PAGE 2: DORSO — Programa Formativo =====
  pdf.addPage();

  // Same background
  pdf.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  pdf.rect(0, 0, 12, H, "F");
  pdf.setFillColor(bgTeal[0], bgTeal[1], bgTeal[2]);
  pdf.rect(12, 0, W - 12, H, "F");

  // Decorative hexagons
  pdf.saveGraphicsState();
  pdf.setGState(new (pdf as any).GState({ opacity: 0.08 }));
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  drawHex(W - 25, 25, 18);
  drawHex(W - 10, 50, 15);
  drawHex(W - 30, 130, 14);
  drawHex(W - 15, 160, 16);
  drawHex(W - 25, H - 20, 18);
  pdf.restoreGraphicsState();

  // Logo top-left
  if (logoData) {
    pdf.addImage(logoData, "PNG", 20, 8, 50, 20);
  }

  // "Programa Formativo" title
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text("Programa Formativo", 80, 22);

  // Left column: 4 mandatory modules (bullet list)
  let ly = 50;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(white[0], white[1], white[2]);

  // Fetch course modules
  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, duration_minutes, is_elective, order_index")
    .eq("course_id", cert.courseId)
    .eq("is_active", true)
    .order("order_index");

  const mandatoryModules = (modules || []).filter((m) => !m.is_elective);
  const electiveModule = (modules || []).filter((m) => m.is_elective)[0];

  mandatoryModules.forEach((m) => {
    const hours = m.duration_minutes ? Math.round(m.duration_minutes / 60) : 0;
    const text = sanitize(`${m.title} (${hours} horas)`);
    // Bullet
    pdf.setFillColor(255, 255, 255);
    pdf.circle(25, ly - 1.2, 1.2, "F");
    // Text
    const lines = pdf.splitTextToSize(text, 105);
    pdf.text(lines, 30, ly);
    ly += lines.length * 5 + 3;
  });

  // Right column: Elective options
  if (electiveModule) {
    let ry = 42;
    const rx = W / 2 + 10;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);

    const electiveTitle = sanitize(
      "CONOCIMIENTOS TECNICOS Y SECTORIALES QUE SEAN DE INTERES PARA LA EXPLOTACION AGRARIA, A ELEGIR POR LA PERSONA INTERESADA. (50 horas lectivas):"
    );
    const etLines = pdf.splitTextToSize(electiveTitle, W / 2 - 30);
    pdf.text(etLines, rx, ry);
    ry += etLines.length * 4.5 + 4;

    // Fetch formative units for this elective module
    const { data: electiveUnits } = await supabase
      .from("formative_units")
      .select("id, title, description, duration_hours")
      .eq("module_id", electiveModule.id)
      .eq("is_active", true)
      .order("order_index");

    // Also check which one this student selected
    const { data: { user } } = await supabase.auth.getUser();
    let selectedUnitId: string | null = null;
    if (user) {
      const { data: selection } = await supabase
        .from("student_elective_selections")
        .select("formative_unit_id")
        .eq("user_id", user.id)
        .eq("module_id", electiveModule.id)
        .maybeSingle();
      selectedUnitId = selection?.formative_unit_id || null;
    }

    pdf.setFontSize(9);
    (electiveUnits || []).forEach((unit) => {
      const isSelected = unit.id === selectedUnitId;
      const hours = unit.duration_hours || 50;

      // Track title
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      const prefix = isSelected ? ">> " : "- ";
      pdf.text(sanitize(`${prefix}${unit.title} (${hours}h)${isSelected ? " [ELEGIDO]" : ""} :`), rx, ry);
      ry += 5;

      // Sub-items from description
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(white[0], white[1], white[2]);
      if (unit.description) {
        const subItems = unit.description
          .split("\n")
          .map((l) => l.replace(/^[-*•]\s*/, "").trim())
          .filter((l) => l.length > 0 && l.length < 100);
        subItems.forEach((item) => {
          pdf.text(sanitize(item), rx, ry);
          ry += 4.5;
        });
      }
      ry += 2;
    });
  }

  // QR code bottom-right
  pdf.addImage(qrDataUrl, "PNG", W - 50, H - 45, 28, 28);

  // CSV text
  pdf.setFontSize(5);
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text(`CSV: ${cert.verificationCode}`, W - 36, H - 14, { align: "center" });

  // Download
  const fileName = sanitize(`Certificado_${cert.studentName.replace(/[^a-zA-Z0-9 ]/g, "")}_Joven_Agricultor.pdf`).replace(/ /g, "_");
  pdf.save(fileName);
}
