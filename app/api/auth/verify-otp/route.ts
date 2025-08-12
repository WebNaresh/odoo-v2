import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { otpStorage } from "../send-otp/route";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    // Get stored OTP data
    const storedData = otpStorage.get(email);
    
    if (!storedData) {
      return NextResponse.json(
        { success: false, message: "OTP not found or expired" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(email);
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 }
      );
    }

    // Check attempts limit (max 3 attempts)
    if (storedData.attempts >= 3) {
      otpStorage.delete(email);
      return NextResponse.json(
        { success: false, message: "Too many failed attempts. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      // Increment attempts
      storedData.attempts += 1;
      otpStorage.set(email, storedData);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` 
        },
        { status: 400 }
      );
    }

    // OTP is valid - remove from storage
    otpStorage.delete(email);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
