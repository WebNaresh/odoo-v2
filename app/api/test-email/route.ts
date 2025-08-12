import { NextRequest, NextResponse } from "next/server";
import { getEmailService } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { success: false, message: "Test endpoint only available in development" },
        { status: 403 }
      );
    }

    const { email, type = "otp" } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const emailService = getEmailService();

    let result = false;
    let message = "";

    switch (type) {
      case "otp":
        const testOtp = "1234";
        result = await emailService.sendOtpEmail(email, "Test User", testOtp);
        message = result ? `OTP email sent to ${email}` : "Failed to send OTP email";
        break;

      case "connection":
        result = await emailService.verifyConnection();
        message = result ? "Email service connection verified" : "Email service connection failed";
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid test type. Use 'otp' or 'connection'" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: process.env.NODE_ENV === "development" ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { message: "Test endpoint only available in development" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Email test endpoint",
    usage: {
      "POST /api/test-email": {
        body: {
          email: "test@example.com",
          type: "otp | connection"
        },
        description: "Test email functionality"
      }
    },
    examples: [
      {
        description: "Test OTP email",
        curl: `curl -X POST ${process.env.NEXTAUTH_URL}/api/test-email -H "Content-Type: application/json" -d '{"email":"test@example.com","type":"otp"}'`
      },
      {
        description: "Test email connection",
        curl: `curl -X POST ${process.env.NEXTAUTH_URL}/api/test-email -H "Content-Type: application/json" -d '{"email":"test@example.com","type":"connection"}'`
      }
    ]
  });
}
