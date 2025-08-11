import Razorpay from "razorpay";

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured. Please check your environment variables.");
}

// Create Razorpay instance
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Razorpay configuration
export const razorpayConfig = {
    keyId: process.env.RAZORPAY_KEY_ID,
    currency: "INR",
    company: {
        name: "Venue Booking Platform",
        description: "Sports Venue Booking System",
        logo: "/logo.png", // Add your logo path
    },
    theme: {
        color: "#3B82F6", // Primary blue color
    },
};

// Types for Razorpay
export interface RazorpayOrderData {
    amount: number; // Amount in paise (multiply by 100)
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
}

export interface RazorpayPaymentData {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface CreateOrderResponse {
    success: boolean;
    order?: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
    };
    error?: string;
}

// Create Razorpay order
export async function createRazorpayOrder(
    amount: number,
    receipt: string,
    notes?: Record<string, string>
): Promise<CreateOrderResponse> {
    try {
        console.log("💳 [RAZORPAY] Creating order:", {
            amount: amount * 100, // Convert to paise
            currency: razorpayConfig.currency,
            receipt,
            notes,
        });

        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert rupees to paise
            currency: razorpayConfig.currency,
            receipt,
            notes,
        });

        console.log("✅ [RAZORPAY] Order created successfully:", {
            orderId: order.id,
            amount: order.amount,
            status: order.status,
        });

        return {
            success: true,
            order: {
                id: order.id,
                amount: Number(order.amount),
                currency: order.currency,
                receipt: order.receipt || "",
                status: order.status,
            },
        };
    } catch (error) {
        console.error("❌ [RAZORPAY] Order creation failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create order",
        };
    }
}

// Verify Razorpay payment signature
export async function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): Promise<boolean> {
    try {
        const crypto = require("crypto");
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        const isValid = expectedSignature === signature;

        console.log("🔐 [RAZORPAY] Signature verification:", {
            orderId,
            paymentId,
            isValid,
        });

        return isValid;
    } catch (error) {
        console.error("❌ [RAZORPAY] Signature verification failed:", error);
        return false;
    }
}

// Get payment details
export async function getRazorpayPayment(paymentId: string) {
    try {
        const payment = await razorpay.payments.fetch(paymentId);

        console.log("📋 [RAZORPAY] Payment details fetched:", {
            paymentId: payment.id,
            amount: payment.amount,
            status: payment.status,
            method: payment.method,
        });

        return {
            success: true,
            payment,
        };
    } catch (error) {
        console.error("❌ [RAZORPAY] Failed to fetch payment:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch payment",
        };
    }
}

// Refund payment
export async function createRazorpayRefund(
    paymentId: string,
    amount?: number,
    notes?: Record<string, string>
) {
    try {
        const refundData: any = {
            payment_id: paymentId,
            notes,
        };

        if (amount) {
            refundData.amount = amount * 100; // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, refundData);

        console.log("💰 [RAZORPAY] Refund created:", {
            refundId: refund.id,
            paymentId: refund.payment_id,
            amount: refund.amount,
            status: refund.status,
        });

        return {
            success: true,
            refund,
        };
    } catch (error) {
        console.error("❌ [RAZORPAY] Refund creation failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create refund",
        };
    }
} 