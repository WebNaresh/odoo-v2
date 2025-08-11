import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/generated/prisma";
import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendApprovalEmail(
  ownerEmail: string,
  ownerName: string,
  venueName: string,
  action: "APPROVED" | "REJECTED",
  notes?: string
) {
  const isApproved = action === "APPROVED";
  
  const subject = isApproved 
    ? `🎉 Your venue "${venueName}" has been approved!`
    : `❌ Your venue "${venueName}" submission needs attention`;

  const htmlContent = isApproved ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Congratulations! Your venue has been approved! 🎉</h2>
      
      <p>Dear ${ownerName},</p>
      
      <p>We're excited to inform you that your venue <strong>"${venueName}"</strong> has been successfully approved and is now live on our platform!</p>
      
      <div style="background-color: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #16a34a; margin-top: 0;">What's Next?</h3>
        <ul>
          <li>Your venue is now visible to customers</li>
          <li>You can start receiving bookings immediately</li>
          <li>Access your owner dashboard to manage courts and bookings</li>
          <li>Set up your court schedules and pricing</li>
        </ul>
      </div>
      
      ${notes ? `
        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Admin Notes:</h4>
          <p style="margin-bottom: 0;">${notes}</p>
        </div>
      ` : ''}
      
      <p>
        <a href="${process.env.NEXTAUTH_URL}/owner/venues" 
           style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Manage Your Venue
        </a>
      </p>
      
      <p>Thank you for choosing our platform. We look forward to helping you grow your business!</p>
      
      <p>Best regards,<br>The Sports Venue Team</p>
    </div>
  ` : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Venue Submission Update Required</h2>
      
      <p>Dear ${ownerName},</p>
      
      <p>Thank you for submitting your venue <strong>"${venueName}"</strong> to our platform. After careful review, we need some additional information or changes before we can approve your venue.</p>
      
      ${notes ? `
        <div style="background-color: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Required Changes:</h3>
          <p style="margin-bottom: 0;">${notes}</p>
        </div>
      ` : ''}
      
      <div style="background-color: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #3b82f6; margin-top: 0;">Next Steps:</h3>
        <ul>
          <li>Review the feedback provided above</li>
          <li>Make the necessary changes to your venue information</li>
          <li>Resubmit your venue for review</li>
          <li>Contact our support team if you need assistance</li>
        </ul>
      </div>
      
      <p>
        <a href="${process.env.NEXTAUTH_URL}/owner/venues" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Update Your Venue
        </a>
      </p>
      
      <p>We appreciate your patience and look forward to having your venue on our platform soon!</p>
      
      <p>Best regards,<br>The Sports Venue Team</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Sports Venue Platform" <noreply@sportsvenue.com>',
      to: ownerEmail,
      subject,
      html: htmlContent,
    });
    console.log(`✅ [EMAIL] ${action} email sent to ${ownerEmail}`);
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send ${action} email:`, error);
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 [VENUE APPROVAL API] Starting approval request for venue:", params.id);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("❌ [VENUE APPROVAL API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      console.log("❌ [VENUE APPROVAL API] Forbidden - user role:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, notes } = body;

    if (!action || !["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    console.log("🔍 [VENUE APPROVAL API] Action:", action, "Notes:", notes);

    // Find the venue with owner information
    const venue = await prisma.venues.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!venue) {
      console.log("❌ [VENUE APPROVAL API] Venue not found:", params.id);
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    console.log("✅ [VENUE APPROVAL API] Found venue:", venue.name, "Owner:", venue.owner?.email);

    // Update venue approval status
    const updatedVenue = await prisma.venues.update({
      where: { id: params.id },
      data: {
        approvalStatus: action,
        isActive: action === "APPROVED",
        updatedAt: new Date(),
      },
    });

    console.log("✅ [VENUE APPROVAL API] Venue updated with status:", action);

    // Send email notification to venue owner
    if (venue.owner?.email && venue.owner?.name) {
      try {
        await sendApprovalEmail(
          venue.owner.email,
          venue.owner.name,
          venue.name,
          action,
          notes
        );
        console.log("✅ [VENUE APPROVAL API] Email notification sent");
      } catch (emailError) {
        console.error("❌ [VENUE APPROVAL API] Email failed but venue updated:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      venue: {
        id: updatedVenue.id,
        name: updatedVenue.name,
        approvalStatus: updatedVenue.approvalStatus,
        isActive: updatedVenue.isActive,
      },
      message: `Venue ${action.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("❌ [VENUE APPROVAL API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
