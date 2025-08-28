import nodemailer from 'nodemailer';

export interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class GmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, we'll log emails to console
    // In production, you'd configure with your Gmail app password
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
      }
    });
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      // For now, just log the email to console
      console.log('📧 Email would be sent:');
      console.log(`To: ${params.to}`);
      console.log(`Subject: ${params.subject}`);
      console.log(`Text: ${params.text}`);
      if (params.html) {
        console.log(`HTML: ${params.html}`);
      }
      console.log('---');

      // Uncomment this when you have Gmail credentials:
      // await this.transporter.sendMail({
      //   from: process.env.GMAIL_USER,
      //   to: params.to,
      //   subject: params.subject,
      //   text: params.text,
      //   html: params.html
      // });

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendAppointmentReminder(patientEmail: string, patientName: string, appointmentDate: string, appointmentTime: string): Promise<boolean> {
    const subject = `Appointment Reminder - ${appointmentDate}`;
    const text = `Dear ${patientName},\n\nThis is a reminder about your upcoming appointment on ${appointmentDate} at ${appointmentTime}.\n\nPlease arrive 15 minutes early for check-in.\n\nIf you need to reschedule, please contact our office.\n\nThank you!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>Dear ${patientName},</p>
        <p>This is a reminder about your upcoming appointment:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
        </div>
        <p>Please arrive 15 minutes early for check-in.</p>
        <p>If you need to reschedule, please contact our office.</p>
        <p>Thank you!</p>
      </div>
    `;

    return await this.sendEmail({
      to: patientEmail,
      subject,
      text,
      html
    });
  }

  async sendWelcomeEmail(patientEmail: string, patientName: string): Promise<boolean> {
    const subject = 'Welcome to Our Practice';
    const text = `Dear ${patientName},\n\nWelcome to our practice! We're excited to have you as a patient.\n\nPlease don't hesitate to contact us if you have any questions.\n\nBest regards,\nThe Practice Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Welcome to Our Practice!</h2>
        <p>Dear ${patientName},</p>
        <p>Welcome to our practice! We're excited to have you as a patient.</p>
        <p>Please don't hesitate to contact us if you have any questions.</p>
        <p>Best regards,<br>The Practice Team</p>
      </div>
    `;

    return await this.sendEmail({
      to: patientEmail,
      subject,
      text,
      html
    });
  }
}

export const emailService = new GmailService();