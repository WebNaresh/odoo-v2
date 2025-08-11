import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const createOrderSchema = z.object({
  timeSlotId: z.string().min(1, "Time slot ID is required"),
  courtId: z.string().min(1, "Court ID is required"),
  playerCount: z.number().min(1, "Player count must be at least 1"),
  notes: z.string().optional(),
});

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
    console.log("💳 [PAYMENT ORDER] Creating payment order:", body);

    // Validate input
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { timeSlotId, courtId, playerCount, notes } = validationResult.data;

    console.log("🔍 [PAYMENT ORDER] Validating slot availability:", {
      timeSlotId,
      courtId,
      playerCount,
      userId: session.user.id,
    });

    // Parse dynamic time slot ID and validate court
    let slotDate: string;
    let slotStartTime: string;
    let slotEndTime: string;
    let timeSlotPrice: number = 500; // Default price

    if (timeSlotId.includes('-') && timeSlotId.split('-').length >= 3) {
      // Dynamic time slot ID
      const parts = timeSlotId.split('-');
      const parsedCourtId = parts[0];
      slotDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
      slotStartTime = parts[4];

      // Calculate end time (assume 1 hour slots)
      const startHour = parseInt(slotStartTime.split(':')[0]);
      slotEndTime = `${String(startHour + 1).padStart(2, '0')}:${slotStartTime.split(':')[1]}`;

      // Check if court matches
      if (parsedCourtId !== courtId) {
        return NextResponse.json(
          {
            success: false,
            error: "Court and time slot mismatch"
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid time slot format"
        },
        { status: 400 }
      );
    }

    // Get court details
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        venue: true,
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
    const slotEndDateTime = new Date(`${slotDate}T${slotEndTime}:00`);

    const existingBookings = await prisma.booking.findMany({
      where: {
        courtId: courtId,
        startTime: {
          gte: slotDateTime,
          lt: slotEndDateTime,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    // Check capacity
    const maxCapacity = court.capacity;
    const currentBookedPlayers = existingBookings.reduce(
      (total, booking) => total + booking.playerCount,
      0
    );

    if (currentBookedPlayers + playerCount > maxCapacity) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient capacity. Available spots: ${maxCapacity - currentBookedPlayers}`
        },
        { status: 409 }
      );
    }

    // Check for existing booking by same user for same slot
    const userExistingBooking = existingBookings.find(
      booking => booking.userId === session.user.id
    );

    if (userExistingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "You already have a booking for this time slot"
        },
        { status: 409 }
      );
    }

    // Calculate amount
    timeSlotPrice = court.pricePerHour;
    const amount = timeSlotPrice * playerCount;

    // Create Razorpay order
    // Keep receipt under 40 characters (Razorpay limit)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const shortCourtId = courtId.slice(-8); // Last 8 characters of court ID
    const receipt = `CT_${shortCourtId}_${timestamp}`; // Format: CT_12345678_87654321 (max 23 chars)

    // Validate receipt length
    if (receipt.length > 40) {
      console.error("❌ [PAYMENT ORDER] Receipt too long:", receipt.length);
      return NextResponse.json(
        {
          success: false,
          error: "Internal error: Receipt generation failed"
        },
        { status: 500 }
      );
    }

    console.log("📋 [PAYMENT ORDER] Receipt generated:", {
      receipt,
      length: receipt.length,
      courtId,
      timestamp,
    });

    const notes = {
      timeSlotId,
      userId: session.user.id,
      courtId: courtId,
      venueName: court.venue.name,
      courtName: court.name,
      userEmail: session.user.email,
      slotDate,
      slotStartTime,
      slotEndTime,
      playerCount: playerCount.toString(),
      notes: notes || "",
    };

    const orderResult = await createRazorpayOrder(amount, receipt, notes);

    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(
        {
          success: false,
          error: orderResult.error || "Failed to create payment order"
        },
        { status: 500 }
      );
    }

    console.log("✅ [PAYMENT ORDER] Order created successfully:", {
      orderId: orderResult.order.id,
      timeSlotId,
      courtId,
      amount,
    });

    return NextResponse.json({
      success: true,
      order: orderResult.order,
      slotDetails: {
        timeSlotId,
        courtId,
        venueName: court.venue.name,
        courtName: court.name,
        slotDate,
        startTime: slotStartTime,
        endTime: slotEndTime,
        playerCount,
        totalPrice: amount,
        notes,
      },
    });

  } catch (error) {
    console.error("❌ [PAYMENT ORDER] Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment order"
      },
      { status: 500 }
    );
  }
}
