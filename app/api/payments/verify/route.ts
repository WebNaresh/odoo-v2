import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyRazorpaySignature, getRazorpayPayment } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    // Update booking with payment details
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentId: razorpay_payment_id,
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paidAt: new Date(),
        paymentMethod: payment.method || "razorpay",
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

    console.log("✅ [PAYMENT VERIFY] Payment verified successfully:", {
      bookingId: updatedBooking.id,
      paymentId: razorpay_payment_id,
      amount: payment.amount,
      status: updatedBooking.paymentStatus,
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        bookingReference: updatedBooking.bookingReference,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        paidAt: updatedBooking.paidAt,
        venueName: updatedBooking.court.venue.name,
        courtName: updatedBooking.court.name,
        startTime: updatedBooking.startTime,
        endTime: updatedBooking.endTime,
        playerCount: updatedBooking.playerCount,
        totalPrice: updatedBooking.totalPrice,
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
