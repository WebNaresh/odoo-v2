import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { timeSlotId, playerCount } = body;

    // Validate input
    if (!timeSlotId || !playerCount) {
      return NextResponse.json(
        {
          success: false,
          error: "Time slot ID and player count are required"
        },
        { status: 400 }
      );
    }

    if (playerCount < 1 || playerCount > 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Player count must be between 1 and 50"
        },
        { status: 400 }
      );
    }

    // Get time slot with current bookings
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: {
        court: {
          select: {
            id: true,
            name: true,
            capacity: true,
            isActive: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          select: {
            id: true,
            playerCount: true,
            userId: true,
          },
        },
      },
    });

    if (!timeSlot) {
      return NextResponse.json(
        {
          success: false,
          error: "Time slot not found"
        },
        { status: 404 }
      );
    }

    if (!timeSlot.court.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Court is not active"
        },
        { status: 400 }
      );
    }

    if (!timeSlot.isAvailable || timeSlot.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          success: false,
          error: "Time slot is not available",
          conflict: true,
        },
        { status: 409 }
      );
    }

    // Check if user already has a booking for this slot
    const userBooking = timeSlot.bookings.find(
      booking => booking.userId === session.user.id
    );

    if (userBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "You already have a booking for this time slot",
          conflict: true,
        },
        { status: 409 }
      );
    }

    // Calculate capacity
    const maxCapacity = timeSlot.maxCapacity || timeSlot.court.capacity;
    const currentBookedPlayers = timeSlot.bookings.reduce(
      (total, booking) => total + booking.playerCount,
      0
    );
    const availableSpots = maxCapacity - currentBookedPlayers;

    if (playerCount > availableSpots) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient capacity. Available spots: ${availableSpots}`,
          conflict: true,
          availableSpots,
          requestedSpots: playerCount,
        },
        { status: 409 }
      );
    }

    // Check if booking would exceed court capacity
    if (currentBookedPlayers + playerCount > maxCapacity) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking would exceed court capacity (${maxCapacity} max)`,
          conflict: true,
          maxCapacity,
          currentBookedPlayers,
          requestedSpots: playerCount,
        },
        { status: 409 }
      );
    }

    // No conflicts found
    return NextResponse.json({
      success: true,
      available: true,
      maxCapacity,
      currentBookedPlayers,
      availableSpots,
      requestedSpots: playerCount,
      timeSlot: {
        id: timeSlot.id,
        date: timeSlot.date,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        price: timeSlot.price,
        court: {
          id: timeSlot.court.id,
          name: timeSlot.court.name,
        },
      },
    });

  } catch (error) {
    console.error("Booking conflict check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check booking conflicts"
      },
      { status: 500 }
    );
  }
}
