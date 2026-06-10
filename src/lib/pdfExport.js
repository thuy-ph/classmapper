// Exports a DOM node (the seating map + summary) to a colourful A4 PDF.

import jsPDF from 'jspdf';
// html2canvas-pro (rather than html2canvas) is required because Tailwind v4's
// default color palette uses oklch()/oklab(), which the original html2canvas
// can't parse and throws on.
import html2canvas from 'html2canvas-pro';

export async function exportMapToPdf(node, { classroomName, teacherName, weekLabel, fileName }) {
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#fffaf0',
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  // Header band
  pdf.setFillColor(236, 226, 255);
  pdf.rect(0, 0, pageWidth, 28, 'F');
  pdf.setTextColor(120, 50, 200);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(classroomName || 'Our Classroom', margin, 12);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(90, 90, 110);
  pdf.text(`Teacher: ${teacherName || '—'}`, margin, 19);
  pdf.text(weekLabel || '', margin, 25);

  // Image of the map + summary card
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let renderHeight = imgHeight;
  let renderWidth = imgWidth;
  const maxHeight = pageHeight - 28 - margin * 2;
  if (renderHeight > maxHeight) {
    renderHeight = maxHeight;
    renderWidth = (canvas.width * renderHeight) / canvas.height;
  }

  pdf.addImage(imgData, 'PNG', margin, 34, renderWidth, renderHeight);

  pdf.save(fileName || 'classmapper-seating-map.pdf');
}
