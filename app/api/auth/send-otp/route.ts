import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEmailService } from "@/lib/email";

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = sendOtpSchema.parse(body);

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiration time (5 minutes from now)
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Store OTP with email as key
    otpStorage.set(email, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Send OTP via email
    try {
      const emailService = getEmailService();
      const emailSent = await emailService.sendOtpEmail(
        email,
        "", // We don't have the user's name yet
        otp
      );

      if (!emailSent) {
        throw new Error("Failed to send email");
      }

      console.log(`✅ OTP sent successfully to ${email}`);
    } catch (emailError) {
      console.error("❌ Failed to send OTP email:", emailError);

      // If email fails, remove the OTP and return error
      otpStorage.delete(email);
      throw new Error("Failed to send OTP email");
    }
  }

    return NextResponse.json({
    success: true,
    message: "OTP sent successfully",
    // In development, return OTP for testing
    ...(process.env.NODE_ENV === "development" && { otp }),
  });

} catch (error) {
  console.error("Send OTP error:", error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { success: false, message: "Invalid email address" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: false, message: "Failed to send OTP" },
    { status: 500 }
  );
}
}

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (data.expiresAt < now) {
      otpStorage.delete(email);
    }
  }
}, 60000); // Clean up every minute

export { otpStorage };
