import html2pdf from 'html2pdf.js';

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
  const currentDate = new Date(billData.paymentDate);
  const invoiceDate = currentDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create a standalone HTML document with only compatible CSS
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: white; color: #333; }
body { font-family: Arial, sans-serif; line-height: 1.6; }
.container { max-width: 900px; margin: 0 auto; padding: 40px; background: white; }
.header { text-align: center; border-bottom: 3px solid #ff9500; padding-bottom: 30px; margin-bottom: 30px; }
.header-title { font-size: 32px; font-weight: bold; color: #ff9500; margin-bottom: 5px; }
.header-subtitle { font-size: 14px; color: #666; letter-spacing: 1px; }
.info-grid { display: table; width: 100%; margin-bottom: 40px; }
.info-col { display: table-cell; width: 50%; padding-right: 40px; vertical-align: top; }
.info-section { font-size: 14px; line-height: 1.8; }
.info-label { font-size: 12px; color: #ff9500; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
.info-value { font-size: 16px; color: #333; font-weight: bold; }
.billing-to { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
.billing-to-name { font-size: 16px; color: #333; font-weight: bold; margin-bottom: 5px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
thead { background-color: #ff9500; color: white; }
thead th { padding: 15px; text-align: left; font-weight: bold; border: none; }
tbody tr { background: #fafafa; border-bottom: 1px solid #e0e0e0; }
tbody td { padding: 15px; border: none; }
.service-title { font-weight: bold; font-size: 14px; }
.service-desc { color: #666; font-size: 12px; margin-top: 3px; }
.amount-cell { text-align: right; font-weight: bold; color: #ff9500; font-size: 16px; }
.totals { display: block; text-align: right; margin-bottom: 40px; }
.totals-box { display: inline-block; width: 300px; }
.total-row { display: table; width: 100%; padding: 10px 15px; border-top: 2px solid #ff9500; border-bottom: 2px solid #ff9500; background: #fff9f5; margin-bottom: 15px; font-weight: bold; }
.total-label { display: table-cell; text-align: left; font-size: 16px; }
.total-amount { display: table-cell; text-align: right; font-size: 18px; color: #ff9500; }
.paid-badge { display: table; width: 100%; padding: 10px 15px; background: #4caf50; color: white; border-radius: 6px; font-weight: bold; }
.paid-label { display: table-cell; text-align: left; }
.paid-status { display: table-cell; text-align: right; }
.footer-box { background: #f5f5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9500; margin-bottom: 30px; }
.footer-title { font-size: 13px; color: #333; display: block; margin-bottom: 8px; font-weight: bold; }
.footer-box ul { margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #555; }
.footer-box li { margin-bottom: 5px; }
.certificate-notice { margin-top: 30px; padding: 15px; background: #fffbea; border: 1px solid #ff9500; border-radius: 6px; text-align: center; font-size: 13px; }
.certificate-title { color: #ff9500; font-weight: bold; }
.certificate-desc { color: #666; margin-top: 5px; }
.company-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px; }
.company-footer p { margin: 5px 0; }
a { color: #ff9500; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<div class="header-title">🎓 NIKLAUS SOLUTIONS</div>
<div class="header-subtitle">WORKSHOP REGISTRATION INVOICE</div>
</div>

<div class="info-grid">
<div class="info-col">
<div class="info-label">Bill From</div>
<div class="info-section">
<div class="info-value">Niklaus Solutions</div>
<div>Workshop Training Division</div>
<div>Email: <a href="mailto:support@theniklaus.com">support@theniklaus.com</a></div>
<div>Web: <a href="https://www.theniklaus.com">www.theniklaus.com</a></div>
</div>
</div>
<div class="info-col">
<div class="info-label">Bill Details</div>
<div class="info-section">
<div style="margin-bottom: 8px;"><strong>Invoice No:</strong> <span style="color: #ff9500; font-weight: bold;">${billData.registrationId}</span></div>
<div style="margin-bottom: 8px;"><strong>Invoice Date:</strong> <span>${invoiceDate}</span></div>
<div><strong>Payment ID:</strong> <span style="color: #4caf50; font-weight: bold;">✓ ${billData.paymentId}</span></div>
</div>
</div>
</div>

<div class="billing-to">
<div class="info-label">Bill To</div>
<div class="billing-to-name">${billData.fullName}</div>
<div>${billData.organization}</div>
<div>📧 ${billData.email}</div>
<div>📱 ${billData.phone}</div>
</div>

<table>
<thead>
<tr>
<th>Service Description</th>
<th style="text-align: center; width: 120px;">Quantity</th>
<th style="text-align: right; width: 120px;">Amount (₹)</th>
</tr>
</thead>
<tbody>
<tr>
<td>
<div class="service-title">${billData.workshopTitle}</div>
<div class="service-desc">Online Workshop Registration & Access</div>
</td>
<td style="text-align: center;">1</td>
<td class="amount-cell">₹${billData.amount.toFixed(2)}</td>
</tr>
</tbody>
</table>

<div class="totals">
<div class="totals-box">
<div class="total-row">
<div class="total-label">Total Amount:</div>
<div class="total-amount">₹${billData.amount.toFixed(2)}</div>
</div>
<div class="paid-badge">
<div class="paid-label">Payment Status:</div>
<div class="paid-status">✓ PAID</div>
</div>
</div>
</div>

<div class="footer-box">
<span class="footer-title">📝 Important Information:</span>
<ul>
<li>This bill is proof of your workshop registration and payment.</li>
<li>Workshop access credentials will be sent to your registered email within 24 hours.</li>
<li>Please keep this document for your records.</li>
<li>For any queries, contact: support@theniklaus.com</li>
</ul>
</div>

<div class="certificate-notice">
<div class="certificate-title">🏆 Certificate of Completion</div>
<div class="certificate-desc">You will receive a certificate upon successful completion of the workshop.</div>
</div>

<div class="company-footer">
<p>© ${new Date().getFullYear()} Niklaus Solutions. All rights reserved.</p>
<p>This is an electronically generated document and requires no signature.</p>
</div>
</div>
</body>
</html>`;

  // Use html2pdf to convert HTML string directly
  const opt = {
    margin: 5,
    filename: `${billData.registrationId}_bill.pdf`,
    image: { type: 'jpeg' as any, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true },
    jsPDF: { orientation: 'portrait' as any, unit: 'mm', format: 'a4' },
  };

  html2pdf()
    .set(opt)
    .from(htmlContent)
    .save()
    .catch((error: any) => {
      console.error('PDF generation error:', error);
    });
};

export const generateAndEmailBill = async (billData: BillData) => {
  generatePDFBill(billData);
};
