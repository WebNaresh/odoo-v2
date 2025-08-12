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

  /**
   * Send user ban notification email
   */
  async sendUserBanEmail(
    userEmail: string,
    userName: string,
    banReason: string
  ): Promise<boolean> {
    const subject = "Account Suspended - QuickCourt";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Suspended</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight-box { background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Suspended</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>

              <p>We regret to inform you that your QuickCourt account has been suspended due to a violation of our terms of service.</p>

              <div class="highlight-box">
                <h3>Suspension Reason:</h3>
                <p><strong>${banReason}</strong></p>
              </div>

              <p>During this suspension period, you will not be able to:</p>
              <ul>
                <li>Access your account</li>
                <li>Make new bookings</li>
                <li>Manage your venues (if applicable)</li>
                <li>Use any QuickCourt services</li>
              </ul>

              <p>If you believe this suspension was made in error or would like to appeal this decision, please contact our support team with your account details and explanation.</p>

              <p>We appreciate your understanding and cooperation in maintaining a safe and respectful community for all users.</p>

              <p><strong>The QuickCourt Team</strong></p>
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
      to: userEmail,
      subject,
      html,
    });
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(
    bookingDetails: {
      userEmail: string;
      userName: string;
      bookingReference: string;
      venueName: string;
      venueAddress: string;
      venuePhone?: string;
      venueEmail?: string;
      courtName: string;
      date: string;
      startTime: string;
      endTime: string;
      playerCount: number;
      totalPrice: number;
      paymentId: string;
      paymentMethod: string;
      paidAt: Date;
      notes?: string;
      venueInstructions?: string;
      cancellationPolicy?: string;
    }
  ): Promise<boolean> {
    const subject = `🎉 Booking Confirmed - ${bookingDetails.venueName}`;

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (time: string) => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              margin: 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 30px;
            }
            .success-badge {
              background: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 20px;
            }
            .booking-card {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 24px;
              margin: 24px 0;
            }
            .booking-header {
              border-bottom: 2px solid #e9ecef;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .booking-ref {
              font-size: 18px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 4px;
            }
            .venue-name {
              font-size: 20px;
              font-weight: 600;
              color: #059669;
              margin-bottom: 8px;
            }
            .detail-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin: 20px 0;
            }
            .detail-item {
              background: white;
              padding: 16px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .detail-label {
              font-size: 12px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .detail-value {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }
            .payment-section {
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              border-radius: 8px;
              padding: 20px;
              margin: 24px 0;
            }
            .payment-header {
              display: flex;
              align-items: center;
              margin-bottom: 16px;
            }
            .payment-icon {
              background: #0ea5e9;
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              font-weight: bold;
            }
            .payment-title {
              font-size: 18px;
              font-weight: 600;
              color: #0c4a6e;
            }
            .venue-info {
              background: #fefce8;
              border: 1px solid #fde047;
              border-radius: 8px;
              padding: 20px;
              margin: 24px 0;
            }
            .info-title {
              font-size: 16px;
              font-weight: 600;
              color: #a16207;
              margin-bottom: 12px;
              display: flex;
              align-items: center;
            }
            .info-icon {
              margin-right: 8px;
            }
            .button {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              text-align: center;
              transition: background-color 0.2s;
            }
            .button:hover {
              background: #059669;
            }
            .footer {
              background: #f8f9fa;
              text-align: center;
              padding: 30px;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-links {
              margin: 16px 0;
            }
            .footer-links a {
              color: #059669;
              text-decoration: none;
              margin: 0 12px;
            }
            @media (max-width: 600px) {
              .container { padding: 10px; }
              .content { padding: 24px 20px; }
              .detail-grid { grid-template-columns: 1fr; }
              .header { padding: 30px 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <h1>🎉 Booking Confirmed!</h1>
                <p>Your venue booking has been successfully confirmed</p>
              </div>

              <div class="content">
                <div class="success-badge">✅ Payment Successful</div>

                <p>Hello <strong>${bookingDetails.userName}</strong>,</p>

                <p>Great news! Your booking has been confirmed and payment has been processed successfully. Here are your booking details:</p>

                <div class="booking-card">
                  <div class="booking-header">
                    <div class="booking-ref">Booking Reference: ${bookingDetails.bookingReference}</div>
                    <div class="venue-name">${bookingDetails.venueName}</div>
                  </div>

                  <div class="detail-grid">
                    <div class="detail-item">
                      <div class="detail-label">Court</div>
                      <div class="detail-value">${bookingDetails.courtName}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Date</div>
                      <div class="detail-value">${formatDate(bookingDetails.date)}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Time</div>
                      <div class="detail-value">${formatTime(bookingDetails.startTime)} - ${formatTime(bookingDetails.endTime)}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Players</div>
                      <div class="detail-value">${bookingDetails.playerCount} ${bookingDetails.playerCount === 1 ? 'Player' : 'Players'}</div>
                    </div>
                  </div>

                  ${bookingDetails.notes ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <div class="detail-label">Notes</div>
                      <div style="color: #4b5563; margin-top: 4px;">${bookingDetails.notes}</div>
                    </div>
                  ` : ''}
                </div>

                <div class="payment-section">
                  <div class="payment-header">
                    <div class="payment-icon">💳</div>
                    <div class="payment-title">Payment Confirmation</div>
                  </div>

                  <div class="detail-grid">
                    <div class="detail-item">
                      <div class="detail-label">Amount Paid</div>
                      <div class="detail-value" style="color: #059669; font-size: 18px;">${formatCurrency(bookingDetails.totalPrice)}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Payment Method</div>
                      <div class="detail-value">${bookingDetails.paymentMethod}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Transaction ID</div>
                      <div class="detail-value" style="font-family: monospace; font-size: 14px;">${bookingDetails.paymentId}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Payment Date</div>
                      <div class="detail-value">${bookingDetails.paidAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })}</div>
                    </div>
                  </div>
                </div>

                <div class="venue-info">
                  <div class="info-title">
                    <span class="info-icon">📍</span>
                    Venue Information
                  </div>
                  <p><strong>Address:</strong> ${bookingDetails.venueAddress}</p>
                  ${bookingDetails.venuePhone ? `<p><strong>Phone:</strong> ${bookingDetails.venuePhone}</p>` : ''}
                  ${bookingDetails.venueEmail ? `<p><strong>Email:</strong> ${bookingDetails.venueEmail}</p>` : ''}
                </div>

                ${bookingDetails.venueInstructions ? `
                  <div class="venue-info" style="background: #f0f9ff; border-color: #bae6fd;">
                    <div class="info-title" style="color: #0c4a6e;">
                      <span class="info-icon">📋</span>
                      Venue Instructions
                    </div>
                    <p>${bookingDetails.venueInstructions}</p>
                  </div>
                ` : ''}

                ${bookingDetails.cancellationPolicy ? `
                  <div class="venue-info" style="background: #fef2f2; border-color: #fecaca;">
                    <div class="info-title" style="color: #b91c1c;">
                      <span class="info-icon">⚠️</span>
                      Cancellation Policy
                    </div>
                    <p>${bookingDetails.cancellationPolicy}</p>
                  </div>
                ` : ''}

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/bookings" class="button">
                    View My Bookings
                  </a>
                </div>

                <p>Please arrive at the venue 10-15 minutes before your scheduled time. If you need to make any changes or have questions, please contact the venue directly or reach out to our support team.</p>

                <p>Thank you for choosing our platform for your venue booking!</p>

                <p><strong>The Venue Booking Team</strong></p>
              </div>

              <div class="footer">
                <p>This is an automated confirmation email for your booking.</p>
                <div class="footer-links">
                  <a href="${process.env.NEXTAUTH_URL}/bookings">My Bookings</a>
                  <a href="${process.env.NEXTAUTH_URL}/support">Support</a>
                  <a href="${process.env.NEXTAUTH_URL}/contact">Contact Us</a>
                </div>
                <p>&copy; ${new Date().getFullYear()} Venue Booking Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: bookingDetails.userEmail,
      subject,
      html,
    });
  }

  /**
   * Send OTP verification email
   */
  async sendOtpEmail(
    userEmail: string,
    userName: string,
    otp: string
  ): Promise<boolean> {
    const subject = "Your QuickCourt Verification Code";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #00884d 0%, #00a855 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              margin: 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 30px;
            }
            .otp-container {
              background: #f8f9fa;
              border: 2px solid #00884d;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: 700;
              color: #00884d;
              letter-spacing: 8px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
            }
            .otp-label {
              font-size: 14px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .warning-box {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
            }
            .warning-title {
              font-weight: 600;
              color: #92400e;
              margin-bottom: 8px;
            }
            .footer {
              background: #f8f9fa;
              text-align: center;
              padding: 30px;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            @media (max-width: 600px) {
              .container { padding: 10px; }
              .content { padding: 24px 20px; }
              .header { padding: 30px 20px; }
              .otp-code { font-size: 28px; letter-spacing: 4px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <h1>🔐 Email Verification</h1>
                <p>Complete your QuickCourt account setup</p>
              </div>

              <div class="content">
                <p>Hello <strong>${userName || 'there'}</strong>,</p>

                <p>Thank you for signing up with QuickCourt! To complete your account setup, please verify your email address using the verification code below:</p>

                <div class="otp-container">
                  <div class="otp-label">Your Verification Code</div>
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Enter this code in the verification form</p>
                </div>

                <div class="warning-box">
                  <div class="warning-title">⚠️ Important Security Information</div>
                  <ul style="margin: 8px 0; padding-left: 20px; color: #92400e;">
                    <li>This code will expire in <strong>5 minutes</strong></li>
                    <li>Never share this code with anyone</li>
                    <li>QuickCourt will never ask for this code via phone or email</li>
                    <li>If you didn't request this code, please ignore this email</li>
                  </ul>
                </div>

                <p>Once verified, you'll be able to:</p>
                <ul>
                  <li>Book sports venues and courts</li>
                  <li>Manage your bookings</li>
                  <li>Access exclusive deals and offers</li>
                  <li>Connect with the sports community</li>
                </ul>

                <p>If you're having trouble with verification or didn't request this code, please contact our support team.</p>

                <p>Welcome to QuickCourt!</p>
                <p><strong>The QuickCourt Team</strong></p>
              </div>

              <div class="footer">
                <p>This is an automated verification email. Please do not reply to this email.</p>
                <p>Need help? Contact our support team for assistance.</p>
                <p>&copy; ${new Date().getFullYear()} QuickCourt. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  /**
   * Send user unban notification email
   */
  async sendUserUnbanEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    const subject = "Account Reinstated - QuickCourt";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Reinstated</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight-box { background: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Reinstated</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>

              <p>We're pleased to inform you that your QuickCourt account has been reinstated and is now active again.</p>

              <div class="highlight-box" style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9;">
                <h3>Welcome Back!</h3>
                <p>Your account is now fully restored with all previous privileges.</p>
              </div>

              <p>You can now:</p>
              <ul>
                <li>Access your account normally</li>
                <li>Make new bookings</li>
                <li>Manage your venues (if applicable)</li>
                <li>Use all QuickCourt services</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/auth/signin" class="button">
                  Sign In to Your Account
                </a>
              </div>

              <p>We appreciate your patience during the suspension period and look forward to providing you with excellent service.</p>

              <p>Please remember to follow our community guidelines to ensure a positive experience for all users.</p>

              <p><strong>The QuickCourt Team</strong></p>
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
      to: userEmail,
      subject,
      html,
    });
  }
}

// Create and export a singleton instance
let emailServiceInstance: EmailService | null = null;

export const getEmailService = (): EmailService => {
  if (!emailServiceInstance) {
    try {
      emailServiceInstance = new EmailService();
    } catch (error) {
      console.error("❌ [EMAIL SERVICE] Failed to initialize email service:", error);
      throw error;
    }
  }
  return emailServiceInstance;
};

// Export the email service instance for direct use
export const emailService = getEmailService();

// Export types for use in other files
export type { EmailConfig };
