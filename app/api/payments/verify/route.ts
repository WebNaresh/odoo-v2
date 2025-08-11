import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyRazorpaySignature, getRazorpayPayment, razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Helper function to generate booking reference
function generateBookingReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BK${timestamp}${random}`.toUpperCase();
}

// Validation schema
const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
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
    console.log("🔐 [PAYMENT VERIFY] Verifying payment:", {
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      bookingId: body.bookingId,
    });

    // Validate input
    const validationResult = verifyPaymentSchema.safeParse(body);
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validationResult.data;

    // Verify payment signature
    const isSignatureValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      console.error("❌ [PAYMENT VERIFY] Invalid signature");
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed"
        },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const paymentResult = await getRazorpayPayment(razorpay_payment_id);
    if (!paymentResult.success) {
      console.error("❌ [PAYMENT VERIFY] Failed to fetch payment details");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to verify payment"
        },
        { status: 500 }
      );
    }

    const payment = paymentResult.payment;

    if (!payment) {
      console.error("❌ [PAYMENT VERIFY] Payment data not found");
      return NextResponse.json(
        {
          success: false,
          error: "Payment data not found"
        },
        { status: 500 }
      );
    }

    // Get order details to extract booking information
    const orderResult = await razorpay.orders.fetch(razorpay_order_id);
    if (!orderResult || !orderResult.notes) {
      console.error("❌ [PAYMENT VERIFY] Failed to fetch order details");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to verify order details"
        },
        { status: 500 }
      );
    }

    const orderNotes = orderResult.notes;
    console.log("📋 [PAYMENT VERIFY] Order notes:", orderNotes);

    // Extract booking details from order notes
    const timeSlotId = orderNotes.timeSlotId as string;
    const courtId = orderNotes.courtId as string;
    const venueName = orderNotes.venueName as string;
    const courtName = orderNotes.courtName as string;
    const userEmail = orderNotes.userEmail as string;
    const slotDate = orderNotes.slotDate as string;
    const slotStartTime = orderNotes.slotStartTime as string;
    const slotEndTime = orderNotes.slotEndTime as string;
    const playerCount = orderNotes.playerCount as string;
    const userNotes = orderNotes.notes as string;

    // Validate required fields
    if (!timeSlotId || !courtId || !slotDate || !slotStartTime || !playerCount) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order data"
        },
        { status: 400 }
      );
    }

    // Validate that the order belongs to the current user
    if (orderNotes.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied"
        },
        { status: 403 }
      );
    }

    // Create booking after successful payment
    console.log("🚀 [PAYMENT VERIFY] Creating booking after successful payment");

    const slotDateTime = new Date(`${slotDate}T${slotStartTime}:00`);
    const slotEndDateTime = new Date(`${slotDate}T${slotEndTime}:00`);

    // Final conflict check before creating booking
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

    // Get court details for capacity check
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

    const maxCapacity = court.capacity;
    const currentBookedPlayers = existingBookings.reduce(
      (total, booking) => total + booking.playerCount,
      0
    );

    if (currentBookedPlayers + parseInt(playerCount) > maxCapacity) {
      return NextResponse.json(
        {
          success: false,
          error: `Slot no longer available. Capacity exceeded.`
        },
        { status: 409 }
      );
    }

    // Create the booking
    const createdBooking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        courtId: courtId,
        timeSlotId: null, // No database time slot for dynamic slots
        bookingDate: slotDateTime,
        startTime: slotDateTime,
        endTime: slotEndDateTime,
        duration: 60, // 1 hour
        totalPrice: Number(payment.amount) / 100, // Convert from paise to rupees
        playerCount: parseInt(playerCount),
        bookingReference: generateBookingReference(),
        notes: userNotes || undefined,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentId: razorpay_payment_id,
        paymentMethod: payment.method || "razorpay",
        paidAt: new Date(),
        paymentDetails: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          createdAt: new Date(payment.created_at * 1000),
        },
      },
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

    console.log("✅ [PAYMENT VERIFY] Payment verified and booking created successfully:", {
      bookingId: createdBooking.id,
      paymentId: razorpay_payment_id,
      amount: payment.amount,
      status: createdBooking.paymentStatus,
      bookingReference: createdBooking.bookingReference,
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: createdBooking.id,
        bookingReference: createdBooking.bookingReference,
        status: createdBooking.status,
        paymentStatus: createdBooking.paymentStatus,
        paidAt: createdBooking.paidAt,
        venueName: venueName,
        courtName: courtName,
        startTime: createdBooking.startTime,
        endTime: createdBooking.endTime,
        playerCount: createdBooking.playerCount,
        totalPrice: createdBooking.totalPrice,
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
      },
    });

  } catch (error) {
    console.error("❌ [PAYMENT VERIFY] Error verifying payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify payment"
      },
      { status: 500 }
    );
  }
}
