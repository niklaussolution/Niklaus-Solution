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

  const element = document.createElement('div');
  element.innerHTML = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; background: #ffffff; color: #333;">
      <!-- Header Section -->
      <div style="text-align: center; border-bottom: 3px solid #f97316; padding-bottom: 30px; margin-bottom: 30px;">
        <div style="font-size: 32px; font-weight: bold; color: #f97316; margin-bottom: 5px;">🎓 NIKLAUS SOLUTIONS</div>
        <div style="font-size: 14px; color: #666; letter-spacing: 1px;">WORKSHOP REGISTRATION INVOICE</div>
      </div>

      <!-- Bill Info Section -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <!-- Bill From -->
        <div>
          <div style="font-size: 12px; color: #f97316; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Bill From</div>
          <div style="font-size: 14px; line-height: 1.8;">
            <strong style="font-size: 16px; color: #333;">Niklaus Solutions</strong><br/>
            Workshop Training Division<br/>
            Email: <a href="mailto:support@theniklaus.com" style="color: #f97316; text-decoration: none;">support@theniklaus.com</a><br/>
            Web: <a href="https://www.theniklaus.com" style="color: #f97316; text-decoration: none;">www.theniklaus.com</a>
          </div>
        </div>

        <!-- Bill Details -->
        <div>
          <div style="font-size: 12px; color: #f97316; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Bill Details</div>
          <div style="font-size: 14px; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <strong>Invoice No:</strong>
              <span style="color: #f97316; font-weight: bold;">${billData.registrationId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <strong>Invoice Date:</strong>
              <span>${invoiceDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <strong>Payment ID:</strong>
              <span style="color: #28a745; font-weight: bold;">✓ ${billData.paymentId}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing To Section -->
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <div style="font-size: 12px; color: #f97316; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Bill To</div>
        <div style="font-size: 14px; line-height: 1.8;">
          <strong style="font-size: 16px; color: #333;">${billData.fullName}</strong><br/>
          <span>${billData.organization}</span><br/>
          <span>📧 ${billData.email}</span><br/>
          <span>📱 ${billData.phone}</span>
        </div>
      </div>

      <!-- Service Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white;">
            <th style="padding: 15px; text-align: left; border: none; font-weight: bold;">Service Description</th>
            <th style="padding: 15px; text-align: center; border: none; font-weight: bold; width: 120px;">Quantity</th>
            <th style="padding: 15px; text-align: right; border: none; font-weight: bold; width: 120px;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #fafafa; border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 15px; border: none;">
              <strong>${billData.workshopTitle}</strong><br/>
              <span style="color: #666; font-size: 12px;">Online Workshop Registration & Access</span>
            </td>
            <td style="padding: 15px; text-align: center; border: none;">1</td>
            <td style="padding: 15px; text-align: right; border: none; font-weight: bold; color: #f97316; font-size: 16px;">₹${billData.amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals Section -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 15px; border-top: 2px solid #f97316; border-bottom: 2px solid #f97316; background: #fff9f5; margin-bottom: 15px;">
            <strong style="font-size: 16px;">Total Amount:</strong>
            <strong style="font-size: 18px; color: #f97316;">₹${billData.amount.toFixed(2)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 15px; background: #28a745; color: white; border-radius: 6px; font-weight: bold;">
            <span>Payment Status:</span>
            <span>✓ PAID</span>
          </div>
        </div>
      </div>

      <!-- Footer Section -->
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316;">
        <div style="font-size: 13px; line-height: 1.6; color: #555;">
          <strong style="color: #333; display: block; margin-bottom: 8px;">📝 Important Information:</strong>
          <ul style="margin: 0; padding-left: 20px;">
            <li>This bill is proof of your workshop registration and payment.</li>
            <li>Workshop access credentials will be sent to your registered email within 24 hours.</li>
            <li>Please keep this document for your records.</li>
            <li>For any queries, contact: support@theniklaus.com</li>
          </ul>
        </div>
      </div>

      <!-- Certificate Notice -->
      <div style="margin-top: 30px; padding: 15px; background: #fffbea; border: 1px solid #f97316; border-radius: 6px; text-align: center;">
        <strong style="color: #f97316;">🏆 Certificate of Completion</strong><br/>
        <span style="font-size: 13px; color: #666;">You will receive a certificate upon successful completion of the workshop.</span>
      </div>

      <!-- Company Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 5px 0;">© ${new Date().getFullYear()} Niklaus Solutions. All rights reserved.</p>
        <p style="margin: 5px 0;">This is an electronically generated document and requires no signature.</p>
      </div>
    </div>
  `;

  const opt = {
    margin: 5,
    filename: `${billData.registrationId}_bill.pdf`,
    image: { type: "jpeg" as "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait' as 'portrait', unit: 'mm', format: 'a4' },
  };

  html2pdf().set(opt).from(element).save();
};

export const generateAndEmailBill = async (billData: BillData) => {
  // This function can be used to send the bill via email
  // For now, we'll just generate it locally
  generatePDFBill(billData);
};
