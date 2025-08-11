import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCourtSchema } from "@/types/court";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
          error: "Only facility owners can access this endpoint"
        },
        { status: 403 }
      );
    }

    console.log("🏟️ [COURT DETAILS API] Fetching court details for ID:", id);

    const court = await prisma.court.findFirst({
      where: {
        id: id,
        venue: {
          ownerId: session.user.id, // Ensure user owns the venue
        }
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            bookings: true,
            timeSlots: true,
          }
        }
      }
    });

    if (!court) {
      console.log("❌ [COURT DETAILS API] Court not found or access denied for ID:", id);
      return NextResponse.json(
        {
          success: false,
          error: "Court not found or access denied"
        },
        { status: 404 }
      );
    }

    console.log("✅ [COURT DETAILS API] Court details fetched successfully:", {
      id: court.id,
      name: court.name,
      venueId: court.venueId
    });

    return NextResponse.json({
      success: true,
      court,
    });
  } catch (error) {
    console.error("❌ [COURT DETAILS API] Error fetching court details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch court details",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
          error: "Only facility owners can update courts"
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("🏟️ [COURT UPDATE API] Updating court with data:", { id, ...body });

    // Add the ID to the body for validation
    const dataWithId = { ...body, id };

    // Validate request data
    const validationResult = updateCourtSchema.safeParse(dataWithId);

    if (!validationResult.success) {
      console.log("❌ [COURT UPDATE API] Validation failed:", validationResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { name, courtType, sportId, pricePerHour, operatingHours, isActive } = validationResult.data;

    // Verify that the court exists and belongs to the authenticated user
    const existingCourt = await prisma.court.findFirst({
      where: {
        id: id,
        venue: {
          ownerId: session.user.id,
        }
      },
      include: {
        venue: true
      }
    });

    if (!existingCourt) {
      return NextResponse.json(
        {
          success: false,
          error: "Court not found or you don't have permission to update it"
        },
        { status: 404 }
      );
    }

    // If sportId is being updated, verify that the sport exists
    if (sportId && sportId !== existingCourt.sportId) {
      const sport = await prisma.sport.findUnique({
        where: { id: sportId }
      });

      if (!sport) {
        return NextResponse.json(
          {
            success: false,
            error: "Sport not found"
          },
          { status: 404 }
        );
      }
    }

    // If name is being updated, check for duplicates in the same venue
    if (name && name !== existingCourt.name) {
      const duplicateCourt = await prisma.court.findFirst({
        where: {
          name,
          venueId: existingCourt.venueId,
          id: { not: id }, // Exclude current court
        }
      });

      if (duplicateCourt) {
        return NextResponse.json(
          {
            success: false,
            error: "A court with this name already exists in this venue"
          },
          { status: 409 }
        );
      }
    }

    // Build update data (only include fields that are provided)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (courtType !== undefined) updateData.courtType = courtType;
    if (sportId !== undefined) updateData.sportId = sportId;
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour;
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update the court
    const court = await prisma.court.update({
      where: { id },
      data: updateData,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            bookings: true,
            timeSlots: true,
          }
        }
      }
    });

    console.log("✅ [COURT UPDATE API] Court updated successfully:", {
      id: court.id,
      name: court.name,
      venueId: court.venueId
    });

    return NextResponse.json({
      success: true,
      court,
    });
  } catch (error) {
    console.error("❌ [COURT UPDATE API] Error updating court:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update court",
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
          error: "Only facility owners can delete courts"
        },
        { status: 403 }
      );
    }

    console.log("🏟️ [COURT DELETE API] Deleting court with ID:", id);

    // Verify that the court exists and belongs to the authenticated user
    const court = await prisma.court.findFirst({
      where: {
        id: id,
        venue: {
          ownerId: session.user.id,
        }
      },
      include: {
        venue: true,
        _count: {
          select: {
            bookings: true,
            timeSlots: true,
          }
        }
      }
    });

    if (!court) {
      return NextResponse.json(
        {
          success: false,
          error: "Court not found or you don't have permission to delete it"
        },
        { status: 404 }
      );
    }

    // Check if court has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        courtId: id,
        status: {
          in: ["PENDING", "CONFIRMED"]
        }
      }
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete court with active bookings. Please cancel all bookings first."
        },
        { status: 400 }
      );
    }

    // Delete court and related data
    await prisma.$transaction(async (tx) => {
      // Delete time slots
      await tx.timeSlot.deleteMany({
        where: { courtId: id }
      });

      // Delete completed/cancelled bookings
      await tx.booking.deleteMany({
        where: { courtId: id }
      });

      // Finally delete the court
      await tx.court.delete({
        where: { id: id }
      });
    });

    console.log("✅ [COURT DELETE API] Court deleted successfully:", {
      id: id,
      name: court.name,
      venueId: court.venueId
    });

    return NextResponse.json({
      success: true,
      message: "Court deleted successfully",
    });
  } catch (error) {
    console.error("❌ [COURT DELETE API] Error deleting court:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete court",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
