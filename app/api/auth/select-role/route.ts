import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    // Validate role selection
    if (!role || !["USER", "FACILITY_OWNER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role selection" },
        { status: 400 }
      );
    }

    // Update user role in database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { role },
    });

    console.log("Role updated in database:", {
      userId: updatedUser.id,
      email: updatedUser.email,
      newRole: updatedUser.role,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
