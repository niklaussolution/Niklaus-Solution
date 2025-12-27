
import jsPDF from 'jspdf';
// Optionally, you can import the loadImageAsDataUrl from certificateGenerator if you want to add a logo

interface BillData {
  registrationId: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  workshopTitle: string;
  amount: number;
  paymentDate: string;
  paymentId: string;
}


export const generatePDFBill = (billData: BillData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const orange = [255, 149, 0];
  const lightGray = [245, 245, 245];
  const darkGray = [60, 60, 60];
  const accentGreen = [76, 175, 80];
  const margin = 18;
  let y = margin;

  // Header
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('NIKLAUS SOLUTIONS', margin, 15);
  doc.setFontSize(11);
  doc.text('WORKSHOP REGISTRATION INVOICE', margin, 21);

  // Bill Details
  y = 32;
  doc.setFontSize(10);
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text('Bill From', margin, y);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Niklaus Solutions', margin, y + 6);
  doc.text('Workshop Training Division', margin, y + 12);
  doc.text('support@theniklaus.com', margin, y + 18);
  doc.text('www.theniklaus.com', margin, y + 24);

  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text('Bill Details', pageWidth / 2 + 5, y);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`Invoice No: ${billData.registrationId}`, pageWidth / 2 + 5, y + 6);
  doc.text(`Invoice Date: ${new Date(billData.paymentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2 + 5, y + 12);
  doc.text(`Payment ID: ${billData.paymentId}`, pageWidth / 2 + 5, y + 18);

  // Bill To
  y += 34;
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text('Bill To', margin, y);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(billData.fullName, margin, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(billData.organization, margin, y + 12);
  doc.text(billData.email, margin, y + 18);
  doc.text(billData.phone, margin, y + 24);

  // Table Header
  y += 32;
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Service Description', margin + 2, y + 7);
  doc.text('Quantity', pageWidth / 2, y + 7, { align: 'center' });
  doc.text('Amount', pageWidth - margin - 2, y + 7, { align: 'right' });

  // Table Row
  y += 12;
  doc.setFillColor(255, 255, 255);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.rect(margin, y, pageWidth - margin * 2, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text(billData.workshopTitle, margin + 2, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text('1', pageWidth / 2, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text(`${billData.amount.toFixed(2)}`, pageWidth - margin - 2, y + 8, { align: 'right' });

  // Total
  y += 18;
  doc.setDrawColor(orange[0], orange[1], orange[2]);
  doc.setLineWidth(0.7);
  doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Total Amount:', pageWidth - margin - 60, y + 8);
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text(`${billData.amount.toFixed(2)}`, pageWidth - margin - 2, y + 8, { align: 'right' });

  // Payment Status
  y += 16;
  doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.setTextColor(255, 255, 255);
  doc.rect(pageWidth - margin - 60, y, 60, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAID', pageWidth - margin - 30, y + 7, { align: 'center' });

  // Important Info
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text('Important Information:', margin, y);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(9);
  const infoLines = [
    'This bill is proof of your workshop registration and payment.',
    'Workshop access credentials will be sent to your registered email within 24 hours.',
    'Please keep this document for your records.',
    'For any queries, contact: support@theniklaus.com'
  ];
  infoLines.forEach((line, i) => {
    doc.text(line, margin, y + 6 + i * 5);
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`© ${new Date().getFullYear()} Niklaus Solutions. All rights reserved.`, margin, pageHeight - 10);
  doc.text('This is an electronically generated document and requires no signature.', margin, pageHeight - 5);

  // Save/download silently
  doc.save(`${billData.registrationId}_bill.pdf`);
};

export const generateAndEmailBill = async (billData: BillData) => {
  generatePDFBill(billData);
};