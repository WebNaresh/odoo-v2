import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required"
        },
        { status: 401 }
      );
    }

    // Validate booking ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid booking ID"
        },
        { status: 400 }
      );
    }

    // Get booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        court: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
        timeSlot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
            isAvailable: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found"
        },
        { status: 404 }
      );
    }

    // Check if user owns this booking or is admin
    if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied"
        },
        { status: 403 }
      );
    }

    // Calculate booking status details
    const now = new Date();
    const bookingTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    const isUpcoming = bookingTime > now;
    const isOngoing = now >= bookingTime && now <= endTime;
    const isPast = endTime < now;

    const timeDiff = bookingTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    const canCancel = isUpcoming && hoursDiff > 2 && booking.status !== 'CANCELLED';

    // Format response
    const bookingStatus = {
      id: booking.id,
      reference: booking.bookingReference,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      playerCount: booking.playerCount,
      totalPrice: booking.totalPrice,
      notes: booking.notes,
      cancellationReason: booking.cancellationReason,
      isRefundable: booking.isRefundable,
      refundAmount: booking.refundAmount,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,

      // Booking timing
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,

      // Status flags
      isUpcoming,
      isOngoing,
      isPast,
      canCancel,
      hoursUntilBooking: Math.max(0, hoursDiff),

      // Venue and court info
      venue: {
        id: booking.court.venue.id,
        name: booking.court.venue.name,
        address: booking.court.venue.address,
      },
      court: {
        id: booking.court.id,
        name: booking.court.name,
        courtType: booking.court.courtType,
      },

      // Time slot info
      timeSlot: booking.timeSlot ? {
        id: booking.timeSlot.id,
        status: booking.timeSlot.status,
        isAvailable: booking.timeSlot.isAvailable,
      } : null,

      // User info (for admin)
      user: session.user.role === 'ADMIN' ? {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
      } : undefined,
    };

    return NextResponse.json({
      success: true,
      booking: bookingStatus,
    });

  } catch (error) {
    console.error("Get booking status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch booking status"
      },
      { status: 500 }
    );
  }
}
