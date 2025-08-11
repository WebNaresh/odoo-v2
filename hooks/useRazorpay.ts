"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CreateOrderData {
  timeSlotId: string;
  courtId: string;
  playerCount: number;
  notes?: string;
}

interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to ensure body pointer events are restored
  const restoreBodyPointerEvents = () => {
    if (typeof window !== "undefined") {
      // Remove pointer-events: none from body
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";

      // Also check for any Razorpay overlay elements and remove them
      const overlays = document.querySelectorAll('[id*="razorpay"], [class*="razorpay"]');
      overlays.forEach(overlay => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      });

      console.log("🔧 [RAZORPAY HOOK] Body pointer events restored");
    }
  };

  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Create payment order
  const createOrder = async (data: CreateOrderData) => {
    try {
      setIsLoading(true);
      console.log("💳 [RAZORPAY HOOK] Creating order:", data);

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      console.log("✅ [RAZORPAY HOOK] Order created:", result.order);
      return result;
    } catch (error) {
      console.error("❌ [RAZORPAY HOOK] Order creation failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create order");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify payment
  const verifyPayment = async (data: VerifyPaymentData) => {
    try {
      setIsProcessing(true);
      console.log("🔐 [RAZORPAY HOOK] Verifying payment:", {
        orderId: data.razorpay_order_id,
        paymentId: data.razorpay_payment_id,
      });

      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Payment verification failed");
      }

      console.log("✅ [RAZORPAY HOOK] Payment verified:", result);
      toast.success("Payment successful! Your booking is confirmed.");
      return result;
    } catch (error) {
      console.error("❌ [RAZORPAY HOOK] Payment verification failed:", error);
      toast.error(error instanceof Error ? error.message : "Payment verification failed");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Process payment
  const processPayment = async (
    slotData: {
      timeSlotId: string;
      courtId: string;
      playerCount: number;
      venueName: string;
      courtName: string;
      notes?: string;
    },
    userDetails: {
      name: string;
      email: string;
      contact?: string;
    },
    onSuccess?: (result: any) => void,
    onFailure?: (error: any) => void
  ) => {
    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay. Please try again.");
      }

      // Create order
      const orderResult = await createOrder({
        timeSlotId: slotData.timeSlotId,
        courtId: slotData.courtId,
        playerCount: slotData.playerCount,
        notes: slotData.notes,
      });

      if (!orderResult.order) {
        throw new Error("Failed to create payment order");
      }

      // Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_zDdFEkUTt7BzV7",
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: "Venue Booking Platform",
        description: `Booking for ${slotData.courtName} at ${slotData.venueName}`,
        order_id: orderResult.order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            console.log("💳 [RAZORPAY HOOK] Payment completed, verifying...");

            // Verify payment
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Restore body pointer events after successful payment
            setTimeout(() => {
              restoreBodyPointerEvents();
            }, 100);

            if (onSuccess) {
              onSuccess(verificationResult);
            }
          } catch (error) {
            console.error("❌ [RAZORPAY HOOK] Payment verification failed:", error);

            // Restore body pointer events after failed payment
            setTimeout(() => {
              restoreBodyPointerEvents();
            }, 100);

            if (onFailure) {
              onFailure(error);
            }
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.contact,
        },
        notes: {
          timeSlotId: slotData.timeSlotId,
          courtId: slotData.courtId,
          venueName: slotData.venueName,
          courtName: slotData.courtName,
          playerCount: slotData.playerCount.toString(),
          notes: slotData.notes || "",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: () => {
            console.log("💳 [RAZORPAY HOOK] Payment modal dismissed");

            // Restore body pointer events when modal is dismissed
            setTimeout(() => {
              restoreBodyPointerEvents();
            }, 100);

            toast.error("Payment cancelled");
            if (onFailure) {
              onFailure(new Error("Payment cancelled by user"));
            }
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("❌ [RAZORPAY HOOK] Payment process failed:", error);

      // Restore body pointer events on any error
      setTimeout(() => {
        restoreBodyPointerEvents();
      }, 100);

      toast.error(error instanceof Error ? error.message : "Payment failed");
      if (onFailure) {
        onFailure(error);
      }
    }
  };

  return {
    processPayment,
    createOrder,
    verifyPayment,
    restoreBodyPointerEvents,
    isLoading,
    isProcessing,
  };
}
