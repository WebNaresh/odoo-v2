import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    console.log("🔍 [BAN INFO API] Checking ban status for email:", email);

    // Find user by email and check ban status
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isBanned) {
      return NextResponse.json(
        { error: "User is not banned" },
        { status: 404 }
      );
    }

    console.log("✅ [BAN INFO API] Found banned user:", {
      email: user.email,
      bannedAt: user.bannedAt,
      hasReason: !!user.banReason,
    });

    // Return ban information
    return NextResponse.json({
      email: user.email,
      name: user.name,
      isBanned: user.isBanned,
      bannedAt: user.bannedAt,
      banReason: user.banReason,
    });
  } catch (error) {
    console.error("❌ [BAN INFO API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
