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
    console.log("🔍 [VENUE APPROVAL API] Starting approval request for venue:", id);

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
    const venue = await prisma.venue.findUnique({
      where: { id },
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
      console.log("❌ [VENUE APPROVAL API] Venue not found:", id);
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    console.log("✅ [VENUE APPROVAL API] Found venue:", venue.name, "Owner:", venue.owner?.email);

    // Update venue approval status
    const updatedVenue = await prisma.venue.update({
      where: { id },
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
        if (action === "APPROVED") {
          await emailService.sendVenueApprovalEmail(
            venue.owner.email,
            venue.owner.name,
            venue.name,
            notes
          );
        } else {
          await emailService.sendVenueRejectionEmail(
            venue.owner.email,
            venue.owner.name,
            venue.name,
            notes || "Please review your venue submission and make necessary improvements."
          );
        }
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
