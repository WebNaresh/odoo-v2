import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const venue = await prisma.venue.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id, // Ensure user owns this venue
      },
      include: {
        supportedSports: {
          select: {
            id: true,
            name: true,
            category: true,
            isPopular: true,
          }
        },
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
      return NextResponse.json(
        { 
          success: false,
          error: "Venue not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      venue,
    });
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch venue" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Check if venue exists and user owns it
    const venue = await prisma.venue.findFirst({
      where: {
        id: params.id,
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
          venueId: params.id,
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
        where: { venueId: params.id }
      });

      // Delete time slots for courts
      await tx.timeSlot.deleteMany({
        where: {
          court: {
            venueId: params.id
          }
        }
      });

      // Delete bookings for courts
      await tx.booking.deleteMany({
        where: {
          court: {
            venueId: params.id
          }
        }
      });

      // Delete courts
      await tx.court.deleteMany({
        where: { venueId: params.id }
      });

      // Finally delete the venue
      await tx.venue.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Venue deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting venue:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to delete venue" 
      },
      { status: 500 }
    );
  }
}
