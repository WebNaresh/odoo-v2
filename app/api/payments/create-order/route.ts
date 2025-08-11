import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const createOrderSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
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

    const { bookingId, amount } = validationResult.data;

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        court: {
          include: {
            venue: true,
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

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied"
        },
        { status: 403 }
      );
    }

    if (booking.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: "Booking is already paid"
        },
        { status: 400 }
      );
    }

    // Create Razorpay order
    // Keep receipt under 40 characters (Razorpay limit)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const shortBookingId = bookingId.slice(-8); // Last 8 characters of booking ID
    const receipt = `BK_${shortBookingId}_${timestamp}`; // Format: BK_12345678_87654321 (max 23 chars)

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
      bookingId,
      timestamp,
    });

    const notes = {
      bookingId: booking.id,
      userId: session.user.id,
      courtId: booking.courtId,
      venueName: booking.court.venue.name,
      courtName: booking.court.name,
      userEmail: booking.user.email,
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

    // Update booking with payment order ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentId: orderResult.order.id,
        paymentStatus: "PENDING",
      },
    });

    console.log("✅ [PAYMENT ORDER] Order created successfully:", {
      orderId: orderResult.order.id,
      bookingId,
      amount,
    });

    return NextResponse.json({
      success: true,
      order: orderResult.order,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        venueName: booking.court.venue.name,
        courtName: booking.court.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        playerCount: booking.playerCount,
        totalPrice: booking.totalPrice,
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
