import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

interface EmailBillParams {
  recipientEmail: string;
  recipientName: string;
  billBuffer: Buffer;
  billFilename: string;
  workshopTitle: string;
  registrationId: string;
  amount: number;
}

interface ConfirmationEmailParams {
  recipientEmail: string;
  recipientName: string;
  workshopTitle: string;
  workshopDate?: string;
  registrationId: string;
}

/**
 * Send bill via email with PDF attachment
 */
export async function sendBillEmail(params: EmailBillParams) {
  try {
    const {
      recipientEmail,
      recipientName,
      billBuffer,
      billFilename,
      workshopTitle,
      registrationId,
      amount,
    } = params;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@theniklaus.com',
      to: recipientEmail,
      subject: `Workshop Registration Confirmation - ${workshopTitle}`,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 5px; }
              .header h1 { margin: 0; }
              .content { padding: 20px; background-color: #f9fafb; border-radius: 5px; margin-top: 20px; }
              .info-row { margin: 10px 0; }
              .label { font-weight: bold; color: #1e40af; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              .button { display: inline-block; padding: 10px 20px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Niklaus Solutions!</h1>
                <p>Your Workshop Registration is Confirmed</p>
              </div>

              <div class="content">
                <p>Dear ${recipientName},</p>

                <p>Thank you for registering with <strong>Niklaus Solutions</strong>! We are excited to have you join us.</p>

                <div class="info-row">
                  <span class="label">Registration ID:</span> ${registrationId}
                </div>

                <div class="info-row">
                  <span class="label">Workshop:</span> ${workshopTitle}
                </div>

                <div class="info-row">
                  <span class="label">Amount Paid:</span> ₹${amount.toFixed(2)}
                </div>

                <p style="margin-top: 20px; color: #666;">
                  Your registration bill is attached to this email. Please keep it for your records.
                </p>

                <p style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #1e40af; margin-top: 20px;">
                  <strong>What's Next?</strong><br>
                  We will send you the workshop schedule, login details, and course materials within 24 hours. Make sure to check your email regularly.
                </p>

                <p style="margin-top: 20px;">
                  If you have any questions or need assistance, feel free to reply to this email or contact us at <strong>info@theniklaus.com</strong>.
                </p>

                <p style="margin-top: 20px;">
                  Best regards,<br>
                  <strong>The Niklaus Solutions Team</strong>
                </p>
              </div>

              <div class="footer">
                <p>© 2025 Niklaus Solutions. All rights reserved.</p>
                <p>Visit us at <a href="https://theniklaus.com">www.theniklaus.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: billFilename,
          content: billBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Bill email sent:', info.response);

    return {
      success: true,
      message: 'Bill email sent successfully',
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending bill email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send workshop confirmation email to admin
 */
export async function sendAdminNotification(
  workshopTitle: string,
  userName: string,
  email: string,
  phone: string,
  organization: string,
  registrationId: string,
  amount: number
) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@theniklaus.com';

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@theniklaus.com',
      to: adminEmail,
      subject: `New Workshop Registration - ${workshopTitle}`,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 5px; }
              .content { padding: 20px; background-color: #f9fafb; border-radius: 5px; margin-top: 20px; }
              .info-row { margin: 10px 0; }
              .label { font-weight: bold; color: #1e40af; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
              th { background-color: #1e40af; color: white; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Workshop Registration</h1>
              </div>

              <div class="content">
                <p>A new registration has been received for <strong>${workshopTitle}</strong></p>

                <table>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                  <tr>
                    <td><span class="label">Registration ID</span></td>
                    <td>${registrationId}</td>
                  </tr>
                  <tr>
                    <td><span class="label">Student Name</span></td>
                    <td>${userName}</td>
                  </tr>
                  <tr>
                    <td><span class="label">Email</span></td>
                    <td>${email}</td>
                  </tr>
                  <tr>
                    <td><span class="label">Phone</span></td>
                    <td>${phone}</td>
                  </tr>
                  <tr>
                    <td><span class="label">Organization</span></td>
                    <td>${organization}</td>
                  </tr>
                  <tr>
                    <td><span class="label">Workshop</span></td>
                    <td>${workshopTitle}</td>
                  </tr>
                  <tr>
                    <td><span class="label">Amount</span></td>
                    <td>₹${amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><span class="label">Registration Date</span></td>
                    <td>${new Date().toLocaleString()}</td>
                  </tr>
                </table>

                <p style="margin-top: 20px; color: #666;">
                  Please verify the payment and send the workshop details to the student.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent:', info.response);

    return {
      success: true,
      message: 'Admin notification sent successfully',
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending admin notification:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  sendBillEmail,
  sendAdminNotification,
};
