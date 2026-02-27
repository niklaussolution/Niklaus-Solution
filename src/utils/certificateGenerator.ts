import jsPDF from 'jspdf';

interface Certificate {
  studentName: string;
  courseName: string; // e.g., "WEB DEVELOPMENT"
  completionDate: string;
  certificateId: string;
  companyLogo?: string;
  companyName?: string;
  signature?: string;
}

const loadImageAsDataUrl = async (imagePath: string): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imagePath;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else { resolve(null); }
      };
      img.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
};

const generateQRCodePlaceholder = (text: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 150;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 150, 150);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 250; i++) {
      ctx.fillRect(Math.random() * 140, Math.random() * 140, 3, 3);
    }
  }
  return canvas.toDataURL('image/png');
};

export const generateCertificatePDF = async (certificateData: Certificate) => {
  try {
    // 'l' for landscape orientation
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth(); 
    const pageHeight = doc.internal.pageSize.getHeight(); 
    
    // Premium Colors
    const lightOrange = [255, 180, 80]; // theme light orange
    const darkOrange = [180, 70, 0];
    const veryDarkOrange = [120, 40, 0];
    const textGray = [80, 80, 80];
    const darkGray = [40, 40, 40];
    const highlightBlue = [0, 110, 180];
    const accentGold = [218, 165, 32];

    // --- 1. LEFT PANEL (1/3 Width) - DARK GRADIENT ORANGE ---
    const leftWidth = pageWidth / 3;
    
    // Use theme light orange as background
    doc.setFillColor(lightOrange[0], lightOrange[1], lightOrange[2]);
    doc.rect(0, 0, leftWidth, pageHeight, 'F');

    



    // POLYGON (HEXAGON) NEST DESIGNER - covers whole orange area, white lines
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.1);
    const centerX = leftWidth / 2;
    const centerY = pageHeight / 2;
    const nestRadius = Math.max(leftWidth, pageHeight) * 0.6;
    const nestLayers = 7;
    // Draw concentric hexagons
    for (let i = 1; i <= nestLayers; i++) {
      const r = (nestRadius / nestLayers) * i;
      const points = [];
      for (let j = 0; j < 6; j++) {
        const angle = (Math.PI / 3) * j - Math.PI / 6; // rotate for flat top
        points.push([
          centerX + r * Math.cos(angle),
          centerY + r * Math.sin(angle)
        ]);
      }
      // Close the hexagon
      points.push(points[0]);
      for (let k = 0; k < 6; k++) {
        doc.line(points[k][0], points[k][1], points[k+1][0], points[k+1][1]);
      }
    }
    // Draw connecting lines (web effect)
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 6;
      const x1 = centerX;
      const y1 = centerY;
      const x2 = centerX + nestRadius * Math.cos(angle);
      const y2 = centerY + nestRadius * Math.sin(angle);
      doc.line(x1, y1, x2, y2);
    }

    // Logo Centered in Orange Panel - Inside hexagon - Much bigger size
    const logoDataUrl = await loadImageAsDataUrl('/icons/logo.png');
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', centerX - 40, centerY - 50, 80, 80);
    }

    // --- 2. RIGHT PANEL CONTENT (2/3 Width) ---
    const rightSideX = leftWidth;
    const rightSideWidth = pageWidth - leftWidth;

    // White background for right panel
    doc.setFillColor(255, 255, 255);
    doc.rect(rightSideX, 0, rightSideWidth, pageHeight, 'F');

    // Date and Certificate ID (Top Left of right panel - removed QR)
    doc.setFontSize(8);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`DATE: ${new Date(certificateData.completionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`, rightSideX + 10, 15);
    doc.text(`C-ID: ${certificateData.certificateId}`, rightSideX + 10, 20);

    // Main Headers
    let currentY = 50;
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('THIS IS TO ACKNOWLEDGE THAT', rightSideX + rightSideWidth / 2, currentY, { align: 'center' });

    // Student Name - Premium styling
    currentY += 22;
    doc.setFontSize(44);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(certificateData.studentName.toUpperCase(), rightSideX + rightSideWidth / 2, currentY, { align: 'center' });
    
    // Decorative underline with gradient effect
    doc.setDrawColor(darkOrange[0], darkOrange[1], darkOrange[2]);
    doc.setLineWidth(1.2);
    doc.line(rightSideX + 35, currentY + 8, pageWidth - 35, currentY + 8);
    
    // Thin accent line
    doc.setDrawColor(accentGold[0], accentGold[1], accentGold[2]);
    doc.setLineWidth(0.3);
    doc.line(rightSideX + 35, currentY + 10, pageWidth - 35, currentY + 10);

    // Achievement Body
    currentY += 18;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('IS OFFICIALLY A NIKLAUS SOLUTIONS CERTIFIED', rightSideX + rightSideWidth / 2, currentY, { align: 'center' });
    
    currentY += 7;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkOrange[0], darkOrange[1], darkOrange[2]);
    doc.text(`${certificateData.courseName.toUpperCase()} PROFESSIONAL`, rightSideX + rightSideWidth / 2, currentY, { align: 'center' });
    
    currentY += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('UPON SUCCESSFULLY COMPLETING ALL CERTIFICATION REQUIREMENTS', rightSideX + rightSideWidth / 2, currentY, { align: 'center' });

    // Administered By
    currentY += 20;
    doc.setFontSize(9);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('ADMINISTERED BY', rightSideX + rightSideWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(highlightBlue[0], highlightBlue[1], highlightBlue[2]);
    doc.text(certificateData.companyName || 'NIKLAUS SOLUTIONS', rightSideX + rightSideWidth / 2, currentY, { align: 'center' });

    // --- 3. SIGNATURE SECTION (Split white panel - Co-Founder Left, CEO Right) ---
    const sigY = pageHeight - 35;
    const coFounderX = rightSideX + (rightSideWidth / 4);
    const ceoX = rightSideX + (rightSideWidth * 3 / 4);

    // CO-FOUNDER SIGNATURE (LEFT HALF OF WHITE PANEL)
    // Load and add Co-Founder signature
    const signature2DataUrl = await loadImageAsDataUrl('/signature2.png');
    if (signature2DataUrl) {
      doc.addImage(signature2DataUrl, 'PNG', coFounderX - 18, sigY - 18, 36, 16);
    }

    // Signature line for Co-Founder
    doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setLineWidth(0.8);
    doc.line(coFounderX - 22, sigY, coFounderX + 22, sigY);

    // Co-Founder Name and Title
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TAMILSELVAN', coFounderX, sigY + 8, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('CO-FOUNDER', coFounderX, sigY + 13, { align: 'center' });

    // CEO SIGNATURE (RIGHT HALF OF WHITE PANEL)
    // Load and add CEO signature
    const signatureDataUrl = await loadImageAsDataUrl('/signature.png');
    if (signatureDataUrl) {
      doc.addImage(signatureDataUrl, 'PNG', ceoX - 18, sigY - 18, 36, 16);
    }

    // Signature line for CEO
    doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setLineWidth(0.8);
    doc.line(ceoX - 22, sigY, ceoX + 22, sigY);

    // CEO Name and Title
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('HARISH G', ceoX, sigY + 8, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('FOUNDER & CEO', ceoX, sigY + 13, { align: 'center' });

    doc.save(`${certificateData.studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
    
  } catch (error) {
    console.error('An error occurred during PDF generation:', error);
  }
};