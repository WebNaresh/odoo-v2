import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🚀 [VENUE DETAILS API] Starting venue details request for ID:", id);

    const session = await getServerSession(authOptions);
    console.log("👤 [VENUE DETAILS API] Session user:", {
      id: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    });

    if (!session?.user?.email) {
      console.log("❌ [VENUE DETAILS API] Unauthorized - no session");
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized"
        },
        { status: 401 }
      );
    }

    // Only allow FACILITY_OWNER users
    if (session.user.role !== "FACILITY_OWNER") {
      console.log("❌ [VENUE DETAILS API] Forbidden - user role:", session.user.role);
      return NextResponse.json(
        {
          success: false,
          error: "Only facility owners can access venue details"
        },
        { status: 403 }
      );
    }

    // Validate venue ID
    if (!id || typeof id !== 'string') {
      console.log("❌ [VENUE DETAILS API] Invalid venue ID:", id);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid venue ID"
        },
        { status: 400 }
      );
    }

    console.log("🔍 [VENUE DETAILS API] Fetching venue details for ID:", id);

    const venue = await prisma.venue.findFirst({
      where: {
        id: id,
        ownerId: session.user.id, // Ensure user owns this venue
      },
      include: {
        courts: {
          select: {
            id: true,
            name: true,
            courtType: true,
            pricePerHour: true,
            isActive: true,
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            courts: true,
          }
        }
      }
    });

    if (!venue) {
      console.log("❌ [VENUE DETAILS API] Venue not found or access denied for ID:", id);
      return NextResponse.json(
        {
          success: false,
          error: "Venue not found or access denied"
        },
        { status: 404 }
      );
    }

    console.log("✅ [VENUE DETAILS API] Venue details fetched successfully:", {
      id: venue.id,
      name: venue.name,
      courtsCount: venue._count?.courts || 0,
      reviewsCount: venue._count?.reviews || 0,
      sportsCount: venue.sports?.length || 0
    });

    return NextResponse.json({
      success: true,
      venue,
    });
  } catch (error) {
    console.error("💥 [VENUE DETAILS API] Error fetching venue details:", error);
    console.error("🔍 [VENUE DETAILS API] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch venue details",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🚀 [VENUE DELETE API] Starting venue deletion request for ID:", id);

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized"
        },
        { status: 401 }
      );
    }

    // Only allow FACILITY_OWNER users
    if (session.user.role !== "FACILITY_OWNER") {
      return NextResponse.json(
        {
          success: false,
          error: "Only facility owners can delete venues"
        },
        { status: 403 }
      );
    }

    // Validate venue ID
    if (!id || typeof id !== 'string') {
      console.log("❌ [VENUE DELETE API] Invalid venue ID:", id);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid venue ID"
        },
        { status: 400 }
      );
    }

    // Check if venue exists and user owns it
    const venue = await prisma.venue.findFirst({
      where: {
        id: id,
        ownerId: session.user.id,
      },
      include: {
        courts: true,
        reviews: true,
      }
    });

    if (!venue) {
      return NextResponse.json(
        {
          success: false,
          error: "Venue not found or you don't have permission to delete it"
        },
        { status: 404 }
      );
    }

    // Check if venue has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        court: {
          venueId: id,
        },
        status: {
          in: ["PENDING", "CONFIRMED"]
        }
      }
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete venue with active bookings. Please cancel all bookings first."
        },
        { status: 400 }
      );
    }

    // Delete venue and related data
    await prisma.$transaction(async (tx) => {
      // Delete reviews
      await tx.review.deleteMany({
        where: { venueId: id }
      });

      // Delete time slots for courts
      await tx.timeSlot.deleteMany({
        where: {
          court: {
            venueId: id
          }
        }
      });

      // Delete bookings for courts
      await tx.booking.deleteMany({
        where: {
          court: {
            venueId: id
          }
        }
      });

      // Delete courts
      await tx.court.deleteMany({
        where: { venueId: id }
      });

      // Finally delete the venue
      await tx.venue.delete({
        where: { id: id }
      });
    });

    console.log("✅ [VENUE DELETE API] Venue deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Venue deleted successfully"
    });
  } catch (error) {
    console.error("💥 [VENUE DELETE API] Error deleting venue:", error);
    console.error("🔍 [VENUE DELETE API] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete venue",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
