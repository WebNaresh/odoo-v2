import nodemailer from "nodemailer";

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email options interface
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Email service class
class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    // Validate required environment variables
    const requiredEnvVars = {
      NEXT_MAIL_ID: process.env.NEXT_MAIL_ID,
      NEXT_PASSWORD: process.env.NEXT_PASSWORD,
      NEXT_SMTP_HOST: process.env.NEXT_SMTP_HOST,
    };

    // Check for missing environment variables
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }

    // Configure email settings
    this.config = {
      host: requiredEnvVars.NEXT_SMTP_HOST!,
      port: 587, // Gmail SMTP port for TLS
      secure: false, // Use TLS (not SSL)
      auth: {
        user: requiredEnvVars.NEXT_MAIL_ID!,
        pass: requiredEnvVars.NEXT_PASSWORD!,
      },
    };

    this.initializeTransporter();
  }

  /**
   * Initialize the Nodemailer transporter
   */
  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport(this.config);
      console.log("✅ [EMAIL SERVICE] Transporter initialized successfully");
    } catch (error) {
      console.error("❌ [EMAIL SERVICE] Failed to initialize transporter:", error);
      throw new Error("Failed to initialize email transporter");
    }
  }

  /**
   * Verify the email configuration
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.error("❌ [EMAIL SERVICE] Transporter not initialized");
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("✅ [EMAIL SERVICE] Connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ [EMAIL SERVICE] Connection verification failed:", error);
      return false;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error("❌ [EMAIL SERVICE] Transporter not initialized");
      return false;
    }

    try {
      console.log(`📧 [EMAIL SERVICE] Sending email to: ${options.to}`);
      console.log(`📧 [EMAIL SERVICE] Subject: ${options.subject}`);

      const mailOptions = {
        from: options.from || `"Venue Management System" <${this.config.auth.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ [EMAIL SERVICE] Email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("❌ [EMAIL SERVICE] Failed to send email:", error);
      return false;
    }
  }

  /**
   * Send venue approval email
   */
  async sendVenueApprovalEmail(
    ownerEmail: string,
    ownerName: string,
    venueName: string,
    adminNotes?: string
  ): Promise<boolean> {
    const subject = `🎉 Venue Approved: ${venueName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Venue Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>Your venue has been approved</p>
            </div>
            <div class="content">
              <h2>Hello ${ownerName},</h2>
              <p>Great news! Your venue <strong>"${venueName}"</strong> has been successfully approved and is now live on our platform.</p>
              
              ${adminNotes ? `
                <div class="highlight">
                  <h3>📝 Admin Notes:</h3>
                  <p>${adminNotes}</p>
                </div>
              ` : ''}
              
              <h3>🚀 Next Steps:</h3>
              <ul>
                <li>Your venue is now visible to customers</li>
                <li>You can start receiving bookings immediately</li>
                <li>Manage your venue settings and availability</li>
                <li>Add courts and set pricing</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/owner/venues" class="button">
                  Manage Your Venue
                </a>
              </div>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Welcome to our venue network!</p>
              <p><strong>The Venue Management Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: ownerEmail,
      subject,
      html,
    });
  }

  /**
   * Send venue rejection email
   */
  async sendVenueRejectionEmail(
    ownerEmail: string,
    ownerName: string,
    venueName: string,
    rejectionReason: string
  ): Promise<boolean> {
    const subject = `Venue Review Update: ${venueName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Venue Review Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Venue Review Update</h1>
              <p>Action required for your venue submission</p>
            </div>
            <div class="content">
              <h2>Hello ${ownerName},</h2>
              <p>Thank you for submitting your venue <strong>"${venueName}"</strong> for review. After careful consideration, we need you to address some items before we can approve your venue.</p>
              
              <div class="highlight">
                <h3>📝 Items to Address:</h3>
                <p>${rejectionReason}</p>
              </div>
              
              <h3>🔧 Next Steps:</h3>
              <ul>
                <li>Review the feedback provided above</li>
                <li>Make the necessary updates to your venue</li>
                <li>Resubmit your venue for review</li>
                <li>Contact support if you need clarification</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/owner/venues" class="button">
                  Edit Your Venue
                </a>
              </div>
              
              <p>We're here to help you succeed! Once you've addressed these items, we'll be happy to review your venue again.</p>
              
              <p>Thank you for your patience and cooperation.</p>
              <p><strong>The Venue Management Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>Need help? Contact our support team for assistance.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: ownerEmail,
      subject,
      html,
    });
  }
}

// Create and export a singleton instance
let emailService: EmailService | null = null;

export const getEmailService = (): EmailService => {
  if (!emailService) {
    try {
      emailService = new EmailService();
    } catch (error) {
      console.error("❌ [EMAIL SERVICE] Failed to initialize email service:", error);
      throw error;
    }
  }
  return emailService;
};

// Export the email service instance for direct use
export const emailService = getEmailService();

// Export types for use in other files
export type { EmailConfig, EmailOptions };
