import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

interface BillData {
  registrationId: string;
  userName: string;
  email: string;
  phone: string;
  organization: string;
  workshopTitle: string;
  workshopId: string;
  amount: number;
  paymentId: string;
  paymentDate: string;
  billDate: string;
  transactionId?: string;
  gstPercentage?: number;
}

/**
 * Generate PDF bill for workshop registration
 */
export async function generateBillPDF(billData: BillData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Company Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('NIKLAUS SOLUTIONS', { align: 'center' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Professional Tech Workshops & Training', { align: 'center' });

      doc
        .fontSize(9)
        .text('Email: info@theniklaus.com | Phone: +91-9876543210', {
          align: 'center',
        });

      doc
        .moveTo(50, doc.y + 10)
        .lineTo(550, doc.y + 10)
        .stroke();

      doc.moveDown(0.5);

      // Invoice Title and Details
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('WORKSHOP REGISTRATION BILL', { align: 'left' });

      const invoiceY = doc.y;
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Bill #: ${billData.registrationId}`, 350, invoiceY);
      doc.text(`Bill Date: ${billData.billDate}`, 350, invoiceY + 20);
      doc.text(`Payment Date: ${billData.paymentDate}`, 350, invoiceY + 40);

      doc.moveDown(2);

      // Bill To Section
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('BILL TO:');

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Name: ${billData.userName}`)
        .text(`Email: ${billData.email}`)
        .text(`Phone: ${billData.phone}`)
        .text(`Organization: ${billData.organization}`);

      doc.moveDown(1);

      // Invoice Table Header
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 250;
      const col3 = 380;
      const col4 = 480;

      // Header Background
      doc.rect(col1, tableTop, 500, 30).fill('#1e40af');
      doc.fillColor('white');

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', col1 + 10, tableTop + 8);
      doc.text('QUANTITY', col3 + 10, tableTop + 8);
      doc.text('RATE', col4 + 10, tableTop + 8);

      // Reset color for content
      doc.fillColor('black');

      // Table Content
      let currentY = tableTop + 40;

      // Workshop Line Item
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(billData.workshopTitle, col1 + 10, currentY);
      doc.text('1', col3 + 10, currentY);
      doc.text(`₹${billData.amount.toFixed(2)}`, col4 + 10, currentY);

      // Calculate totals
      const gstPercentage = billData.gstPercentage || 18;
      const gstAmount = (billData.amount * gstPercentage) / 100;
      const totalAmount = billData.amount + gstAmount;

      currentY += 40;

      // Summary Lines
      doc
        .moveTo(col1, currentY)
        .lineTo(550, currentY)
        .stroke();

      currentY += 15;

      // Subtotal
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Workshop Fee:', col3, currentY);
      doc.text(`₹${billData.amount.toFixed(2)}`, col4, currentY);

      currentY += 20;

      // GST
      doc.text(`GST (${gstPercentage}%):`, col3, currentY);
      doc.text(`₹${gstAmount.toFixed(2)}`, col4, currentY);

      currentY += 20;

      // Total
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('TOTAL AMOUNT:', col3, currentY);
      doc.text(`₹${totalAmount.toFixed(2)}`, col4, currentY);

      currentY += 30;

      // Payment Information
      doc
        .moveTo(col1, currentY)
        .lineTo(550, currentY)
        .stroke();

      currentY += 15;

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('PAYMENT INFORMATION');

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Payment Method: Online (Razorpay)`)
        .text(`Transaction ID: ${billData.paymentId}`)
        .text(`Payment Status: Completed`)
        .text(`Amount Paid: ₹${totalAmount.toFixed(2)}`);

      currentY = doc.y + 20;

      // Terms and Conditions
      doc
        .moveTo(col1, currentY)
        .lineTo(550, currentY)
        .stroke();

      currentY += 15;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TERMS & CONDITIONS:');

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(
          '1. This bill is valid only with the workshop registration confirmation email.',
          col1,
          currentY + 15
        )
        .text(
          '2. All payments are non-refundable after 7 days of registration.',
          col1
        )
        .text('3. Please check your email for workshop schedule and login details.', col1)
        .text(
          '4. For any queries, contact support at info@theniklaus.com',
          col1
        );

      doc.moveDown(2);

      // Footer
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(0.5);

      doc
        .fontSize(9)
        .font('Helvetica')
        .text('Thank you for choosing Niklaus Solutions!', { align: 'center' });
      doc.text('For support, visit www.theniklaus.com', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate and return bill as downloadable file
 */
export async function getBillAsFile(billData: BillData): Promise<{
  buffer: Buffer;
  filename: string;
  mimeType: string;
}> {
  const buffer = await generateBillPDF(billData);
  const filename = `bill_${billData.registrationId}_${Date.now()}.pdf`;

  return {
    buffer,
    filename,
    mimeType: 'application/pdf',
  };
}

export default {
  generateBillPDF,
  getBillAsFile,
};
