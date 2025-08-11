import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    console.log("🔍 API: Checking user for email:", email);

    if (!email) {
      console.log("❌ API: No email provided");
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("📊 API: User found:", !!existingUser);
    if (existingUser) {
      console.log("👤 API: User details:", {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        createdAt: existingUser.createdAt,
      });
    }

    const response = {
      exists: !!existingUser,
      user: existingUser,
      isNewUser: !existingUser,
    };

    console.log("📤 API: Sending response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 API: Error checking user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
