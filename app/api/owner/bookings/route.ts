import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const venueId = searchParams.get("venueId");
    const courtId = searchParams.get("courtId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const ownerId = session.user.id;

    // First, get all venues owned by the user
    const ownerVenues = await prisma.venue.findMany({
      where: {
        ownerId: ownerId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        courts: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const venueIds = ownerVenues.map(venue => venue.id);
    const courtIds = ownerVenues.flatMap(venue => venue.courts.map(court => court.id));

    if (courtIds.length === 0) {
      return NextResponse.json({
        success: true,
        bookings: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        }
      });
    }

    // Build where clause for bookings
    const whereClause: any = {
      courtId: {
        in: courtIds
      }
    };

    // Add filters
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (courtId) {
      whereClause.courtId = courtId;
    }

    if (startDate) {
      whereClause.bookingDate = {
        ...whereClause.bookingDate,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereClause.bookingDate = {
        ...whereClause.bookingDate,
        lte: new Date(endDate)
      };
    }

    // If venueId is specified, filter by courts in that venue
    if (venueId) {
      const venue = ownerVenues.find(v => v.id === venueId);
      if (venue) {
        whereClause.courtId = {
          in: venue.courts.map(court => court.id)
        };
      }
    }

    // Get total count for pagination
    const totalBookings = await prisma.booking.count({
      where: whereClause
    });

    // Get bookings with pagination
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        court: {
          select: {
            id: true,
            name: true,
            courtType: true,
            pricePerHour: true,
            venue: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        },
        timeSlot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format bookings for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customer: {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
        image: booking.user.image
      },
      venue: {
        id: booking.court.venue.id,
        name: booking.court.venue.name,
        address: booking.court.venue.address
      },
      court: {
        id: booking.court.id,
        name: booking.court.name,
        type: booking.court.courtType,
        pricePerHour: booking.court.pricePerHour
      },
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    const totalPages = Math.ceil(totalBookings / limit);

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total: totalBookings,
        totalPages
      },
      venues: ownerVenues
    });

  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bookings"
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { bookingId, status, paymentStatus } = body;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking ID is required"
        },
        { status: 400 }
      );
    }

    const ownerId = session.user.id;

    // Verify that the booking belongs to the owner's venue
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        court: {
          venue: {
            ownerId: ownerId
          }
        }
      },
      include: {
        court: {
          include: {
            venue: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found or you don't have permission to modify it"
        },
        { status: 404 }
      );
    }

    // Update booking
    const updateData: any = {};
    if (status) {
      updateData.status = status.toUpperCase();
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus.toUpperCase();
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        court: {
          select: {
            id: true,
            name: true,
            venue: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Booking updated successfully"
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update booking"
      },
      { status: 500 }
    );
  }
}
