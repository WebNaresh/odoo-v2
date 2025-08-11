import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, parseISO } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the venue ID
    const { id: venueId } = await params;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const courtIds = searchParams.get("courtIds");

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date parameter is required"
        },
        { status: 400 }
      );
    }

    console.log("🔍 [AVAILABILITY API] Checking availability:", {
      venueId,
      date,
      courtIds,
    });

    // Parse the date
    const selectedDate = parseISO(date);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Build court filter
    const courtFilter: any = {
      venueId,
      isActive: true,
    };

    if (courtIds) {
      const courtIdArray = courtIds.split(",").filter(Boolean);
      if (courtIdArray.length > 0) {
        courtFilter.id = { in: courtIdArray };
      }
    }

    // Get courts for the venue
    const courts = await prisma.court.findMany({
      where: courtFilter,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (courts.length === 0) {
      return NextResponse.json({
        success: true,
        availability: {},
      });
    }

    // Get all bookings for the selected date and courts
    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59`);

    const bookings = await prisma.booking.findMany({
      where: {
        courtId: { in: courts.map(c => c.id) },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        id: true,
        courtId: true,
        startTime: true,
        endTime: true,
        playerCount: true,
        status: true,
      },
    });

    console.log("📊 [AVAILABILITY API] Found bookings:", {
      count: bookings.length,
      bookings: bookings.map(b => ({
        courtId: b.courtId,
        startTime: format(b.startTime, "HH:mm"),
        endTime: format(b.endTime, "HH:mm"),
        playerCount: b.playerCount,
        status: b.status,
      })),
    });

    // Calculate availability for each court
    const availability: Record<string, {
      courtId: string;
      courtName: string;
      capacity: number;
      bookedSlots: Array<{
        startTime: string;
        endTime: string;
        bookedPlayers: number;
        availableSpots: number;
        isFullyBooked: boolean;
      }>;
    }> = {};

    courts.forEach(court => {
      const courtBookings = bookings.filter(b => b.courtId === court.id);
      const capacity = (court as any).capacity || 10;

      // Group bookings by time slot
      const slotBookings: Record<string, {
        startTime: string;
        endTime: string;
        totalPlayers: number;
      }> = {};

      courtBookings.forEach(booking => {
        const startTime = format(booking.startTime, "HH:mm");
        const endTime = format(booking.endTime, "HH:mm");
        const slotKey = `${startTime}-${endTime}`;

        if (!slotBookings[slotKey]) {
          slotBookings[slotKey] = {
            startTime,
            endTime,
            totalPlayers: 0,
          };
        }

        slotBookings[slotKey].totalPlayers += booking.playerCount;
      });

      // Convert to booked slots array
      const bookedSlots = Object.values(slotBookings).map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        bookedPlayers: slot.totalPlayers,
        availableSpots: Math.max(0, capacity - slot.totalPlayers),
        isFullyBooked: slot.totalPlayers >= capacity,
      }));

      availability[court.id] = {
        courtId: court.id,
        courtName: court.name,
        capacity,
        bookedSlots,
      };
    });

    console.log("✅ [AVAILABILITY API] Availability calculated:", {
      courtsChecked: courts.length,
      availabilityKeys: Object.keys(availability),
      availabilityDetails: Object.entries(availability).map(([courtId, data]) => ({
        courtId,
        bookedSlotsCount: data.bookedSlots.length,
        bookedSlots: data.bookedSlots,
      })),
    });

    return NextResponse.json({
      success: true,
      availability,
      date: dateStr,
    });

  } catch (error) {
    console.error("❌ [AVAILABILITY API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check availability",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
