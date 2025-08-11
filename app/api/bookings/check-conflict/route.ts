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

    // Parse dynamic time slot ID (format: courtId-date-time)
    // Example: "689a049014b8bae39a3d570f-2025-08-12-08:00"
    let courtId: string;
    let slotDate: string;
    let slotStartTime: string;

    if (timeSlotId.includes('-') && timeSlotId.split('-').length >= 3) {
      // Dynamic time slot ID
      const parts = timeSlotId.split('-');
      courtId = parts[0];
      slotDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
      slotStartTime = parts[4];

      console.log("🔍 [CONFLICT CHECK] Parsed dynamic time slot:", {
        timeSlotId,
        courtId,
        slotDate,
        slotStartTime,
      });
    } else {
      // Database time slot ID - try to find it in database
      const dbTimeSlot = await prisma.timeSlot.findUnique({
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
        },
      });

      if (!dbTimeSlot) {
        return NextResponse.json(
          {
            success: false,
            error: "Time slot not found"
          },
          { status: 404 }
        );
      }

      courtId = dbTimeSlot.courtId;
      slotDate = dbTimeSlot.date.toISOString().split('T')[0];
      slotStartTime = dbTimeSlot.startTime.toISOString().split('T')[1].substring(0, 5);
    }

    // Get court information
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: {
        id: true,
        name: true,
        capacity: true,
        isActive: true,
      },
    });

    if (!court) {
      return NextResponse.json(
        {
          success: false,
          error: "Court not found"
        },
        { status: 404 }
      );
    }

    if (!court.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Court is not active"
        },
        { status: 400 }
      );
    }

    // Check for existing bookings for this time slot
    const slotDateTime = new Date(`${slotDate}T${slotStartTime}:00`);
    const slotEndTime = new Date(slotDateTime.getTime() + 60 * 60 * 1000); // Assume 1 hour slots

    console.log("🔍 [CONFLICT CHECK] Checking for existing bookings:", {
      courtId,
      slotDateTime,
      slotEndTime,
    });

    const existingBookings = await prisma.booking.findMany({
      where: {
        courtId: courtId,
        startTime: {
          gte: slotDateTime,
          lt: slotEndTime,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        id: true,
        playerCount: true,
        userId: true,
      },
    });

    console.log("📋 [CONFLICT CHECK] Found existing bookings:", existingBookings);

    // Check if user already has a booking for this slot
    const userBooking = existingBookings.find(
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
    const maxCapacity = court.capacity;
    const currentBookedPlayers = existingBookings.reduce(
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
    console.log("✅ [CONFLICT CHECK] No conflicts found:", {
      maxCapacity,
      currentBookedPlayers,
      availableSpots,
      requestedSpots: playerCount,
    });

    return NextResponse.json({
      success: true,
      available: true,
      maxCapacity,
      currentBookedPlayers,
      availableSpots,
      requestedSpots: playerCount,
      timeSlot: {
        id: timeSlotId,
        date: slotDate,
        startTime: slotStartTime,
        endTime: `${String(parseInt(slotStartTime.split(':')[0]) + 1).padStart(2, '0')}:${slotStartTime.split(':')[1]}`,
        price: 500, // Default price - should be calculated based on court pricing
        court: {
          id: court.id,
          name: court.name,
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
