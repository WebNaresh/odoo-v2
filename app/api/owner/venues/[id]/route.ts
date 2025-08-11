import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

// Validation schema for updating venue
const updateVenueSchema = z.object({
  name: z.string().min(1, "Venue name is required").max(100, "Venue name is too long"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required").max(500, "Address is too long"),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).length(2), // [longitude, latitude]
  }).optional(),
  amenities: z.array(z.string()).default([]),
  sports: z.array(z.string()).min(1, "At least one sport is required"),
  photoUrls: z.array(z.string().url("Invalid URL format")).default([]),
  operatingHours: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    tuesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    wednesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    thursday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    friday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    saturday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    sunday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
  }),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔄 [UPDATE VENUE API] Starting venue update request for ID:", id);

    const session = await getServerSession(authOptions);
    console.log("👤 [UPDATE VENUE API] Session user:", {
      id: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    });

    if (!session?.user?.email) {
      console.log("❌ [UPDATE VENUE API] Unauthorized - no session");
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
      console.log("❌ [UPDATE VENUE API] Forbidden - user role:", session.user.role);
      return NextResponse.json(
        {
          success: false,
          error: "Only facility owners can update venues"
        },
        { status: 403 }
      );
    }

    // Validate venue ID
    if (!id || typeof id !== 'string') {
      console.log("❌ [UPDATE VENUE API] Invalid venue ID:", id);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid venue ID"
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log("📝 [UPDATE VENUE API] Request body received:", {
      name: body.name,
      address: body.address,
      amenitiesCount: body.amenities?.length || 0,
      sportsCount: body.sports?.length || 0,
      photoUrlsCount: body.photoUrls?.length || 0,
    });

    const validationResult = updateVenueSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("❌ [UPDATE VENUE API] Validation failed:", validationResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid venue data",
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const venueData = validationResult.data;

    // Check if venue exists and belongs to the user
    const existingVenue = await prisma.venue.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        name: true,
      },
    });

    if (!existingVenue) {
      console.log("❌ [UPDATE VENUE API] Venue not found:", id);
      return NextResponse.json(
        {
          success: false,
          error: "Venue not found"
        },
        { status: 404 }
      );
    }

    if (existingVenue.ownerId !== session.user.id) {
      console.log("❌ [UPDATE VENUE API] Access denied - venue belongs to different owner:", {
        venueOwnerId: existingVenue.ownerId,
        sessionUserId: session.user.id,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Access denied - you can only update your own venues"
        },
        { status: 403 }
      );
    }

    console.log("✅ [UPDATE VENUE API] Venue ownership verified, proceeding with update");

    // Update the venue
    const updatedVenue = await prisma.venue.update({
      where: { id },
      data: {
        name: venueData.name,
        description: venueData.description || null,
        address: venueData.address,
        location: venueData.location,
        amenities: venueData.amenities,
        sports: venueData.sports,
        photoUrls: venueData.photoUrls,
        operatingHours: venueData.operatingHours,
        updatedAt: new Date(),
      },
      include: {
        courts: {
          include: {
            timeSlots: true,
          },
        },
        _count: {
          select: {
            courts: true,
          },
        },
      },
    });

    console.log("✅ [UPDATE VENUE API] Venue updated successfully:", {
      id: updatedVenue.id,
      name: updatedVenue.name,
      courtsCount: updatedVenue._count.courts,
    });

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
      message: "Venue updated successfully"
    });

  } catch (error) {
    console.error("❌ [UPDATE VENUE API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update venue",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
