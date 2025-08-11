import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the dynamic route parameter (Next.js 15+ requirement)
    const { id } = await params;
    console.log("🔍 [USER BAN API] Starting ban request for user:", id);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("❌ [USER BAN API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      console.log("❌ [USER BAN API] Forbidden - user role:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent self-banning
    if (session.user.id === id) {
      console.log("❌ [USER BAN API] Attempted self-ban by:", session.user.email);
      return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    console.log("🔍 [USER BAN API] Ban reason:", reason);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      console.log("❌ [USER BAN API] User not found:", id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isBanned) {
      console.log("❌ [USER BAN API] User already banned:", user.email);
      return NextResponse.json({ error: "User is already banned" }, { status: 400 });
    }

    console.log("✅ [USER BAN API] Found user:", user.name, "Email:", user.email);

    // Ban the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason || null,
        updatedAt: new Date(),
      },
    });

    console.log("✅ [USER BAN API] User banned successfully");

    // Send email notification to banned user
    if (user.email && user.name) {
      try {
        await emailService.sendUserBanEmail(
          user.email,
          user.name,
          reason || "No reason provided"
        );
        console.log("✅ [USER BAN API] Ban notification email sent");
      } catch (emailError) {
        console.error("❌ [USER BAN API] Email failed but user banned:", emailError);
        // Don't fail the request if email fails
      }
    }

    // Log the ban action for audit purposes
    console.log("📝 [USER BAN API] Audit log:", {
      action: "USER_BANNED",
      adminId: session.user.id,
      adminEmail: session.user.email,
      targetUserId: id,
      targetUserEmail: user.email,
      reason: reason || "No reason provided",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isBanned: updatedUser.isBanned,
        bannedAt: updatedUser.bannedAt,
        banReason: updatedUser.banReason,
      },
      message: "User banned successfully",
    });
  } catch (error) {
    console.error("❌ [USER BAN API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
