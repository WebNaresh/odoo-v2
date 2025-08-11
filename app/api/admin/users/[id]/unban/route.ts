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
    console.log("🔍 [USER UNBAN API] Starting unban request for user:", id);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("❌ [USER UNBAN API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      console.log("❌ [USER UNBAN API] Forbidden - user role:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        banReason: true,
      },
    });

    if (!user) {
      console.log("❌ [USER UNBAN API] User not found:", id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isBanned) {
      console.log("❌ [USER UNBAN API] User is not banned:", user.email);
      return NextResponse.json({ error: "User is not banned" }, { status: 400 });
    }

    console.log("✅ [USER UNBAN API] Found banned user:", user.name, "Email:", user.email);

    // Unban the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBanned: false,
        bannedAt: null,
        banReason: null,
        updatedAt: new Date(),
      },
    });

    console.log("✅ [USER UNBAN API] User unbanned successfully");

    // Send email notification to unbanned user
    if (user.email && user.name) {
      try {
        await emailService.sendUserUnbanEmail(
          user.email,
          user.name
        );
        console.log("✅ [USER UNBAN API] Unban notification email sent");
      } catch (emailError) {
        console.error("❌ [USER UNBAN API] Email failed but user unbanned:", emailError);
        // Don't fail the request if email fails
      }
    }

    // Log the unban action for audit purposes
    console.log("📝 [USER UNBAN API] Audit log:", {
      action: "USER_UNBANNED",
      adminId: session.user.id,
      adminEmail: session.user.email,
      targetUserId: id,
      targetUserEmail: user.email,
      previousBanReason: user.banReason,
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
      message: "User unbanned successfully",
    });
  } catch (error) {
    console.error("❌ [USER UNBAN API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
