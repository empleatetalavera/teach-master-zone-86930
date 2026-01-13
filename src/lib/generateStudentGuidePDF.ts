import jsPDF from 'jspdf';
import { studentGuideContent } from './studentGuideContent';

interface CenterBranding {
  centerName: string;
  centerLogo?: string;
  primaryColor?: string;
}

export const generateStudentGuidePDF = async (
  courseTitle: string,
  branding: CenterBranding
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  const addNewPage = () => {
    doc.addPage();
    yPos = 20;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > 270) {
      addNewPage();
    }
  };

  // Helper to add wrapped text
  const addText = (text: string, fontSize: number, isBold = false, color = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(fontSize * 0.5);
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.45;
    });
    yPos += 3;
  };

  // Title page
  doc.setFillColor(0, 128, 128);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('GUÍA DEL ALUMNO', pageWidth / 2, 35, { align: 'center' });
  
  yPos = 80;
  doc.setTextColor(0, 0, 0);
  addText(courseTitle, 16, true);
  yPos += 10;
  addText(branding.centerName, 14, false, [0, 128, 128]);
  yPos += 5;
  addText('Centro Acreditado SEPE', 11);
  
  yPos += 20;
  doc.setDrawColor(0, 128, 128);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Content sections
  studentGuideContent.sections.forEach((section) => {
    checkPageBreak(30);
    
    // Section header
    doc.setFillColor(0, 128, 128);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${section.number}. ${section.title}`, margin + 3, yPos + 2);
    yPos += 15;
    doc.setTextColor(0, 0, 0);

    // Section content
    if (section.content) {
      addText(section.content, 10);
      yPos += 5;
    }
    
    if (section.intro) {
      addText(section.intro, 10);
      yPos += 5;
    }

    // Subsections
    if (section.subsections) {
      section.subsections.forEach((sub) => {
        checkPageBreak(20);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 100, 100);
        doc.text(`${sub.number} ${sub.title}`, margin, yPos);
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        
        if (sub.content) {
          addText(sub.content, 9);
        }
        yPos += 5;
      });
    }
    yPos += 10;
  });

  // Anexo
  checkPageBreak(40);
  doc.setFillColor(0, 128, 128);
  doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(studentGuideContent.anexo.title, margin + 3, yPos + 2);
  yPos += 15;
  doc.setTextColor(0, 0, 0);
  addText(studentGuideContent.anexo.content, 10);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`${branding.centerName} - Guía del Alumno`, margin, 290);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 25, 290);
  }

  doc.save(`Guia_Alumno_${courseTitle.replace(/\s+/g, '_')}.pdf`);
};
