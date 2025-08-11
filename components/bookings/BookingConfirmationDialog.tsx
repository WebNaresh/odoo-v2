"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IndianRupee,
  Clock,
  Users,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useCreateBooking,
  useBookingConflictCheck,
} from "@/hooks/use-bookings";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

interface BookingConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  timeSlot: {
    id: string;
    courtId: string;
    courtName: string;
    venueName: string;
    venueAddress: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    maxCapacity: number;
    currentBookings: number;
  } | null;
  initialPlayerCount?: number;
  queueInfo?: {
    current: number;
    total: number;
  };
}

export function BookingConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  timeSlot,
  initialPlayerCount = 1,
  queueInfo,
}: BookingConfirmationDialogProps) {
  const { data: session } = useSession();
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<
    "confirm" | "processing" | "success" | "error"
  >("confirm");

  const createBookingMutation = useCreateBooking();
  const conflictCheckMutation = useBookingConflictCheck();
  const {
    processPayment,
    isLoading: isPaymentLoading,
    isProcessing: isPaymentProcessing,
  } = useRazorpay();

  const handleClose = () => {
    setStep("confirm");
    setNotes("");
    setPlayerCount(initialPlayerCount);
    onClose();
  };

  const handleConfirmBooking = async () => {
    if (!timeSlot || !session?.user) return;

    setStep("processing");

    try {
      // First check for conflicts
      const conflictResult = await conflictCheckMutation.mutateAsync({
        timeSlotId: timeSlot.id,
        playerCount,
      });

      if (!conflictResult.success) {
        setStep("error");
        return;
      }

      console.log("✅ [BOOKING] Slot available, initiating payment:", {
        timeSlotId: timeSlot.id,
        courtId: timeSlot.courtId,
        playerCount,
      });

      // Initiate Razorpay payment (booking will be created after successful payment)
      await processPayment(
        {
          timeSlotId: timeSlot.id,
          courtId: timeSlot.courtId,
          playerCount,
          venueName: timeSlot.venueName,
          courtName: timeSlot.courtName,
          notes: notes.trim() || undefined,
        },
        {
          name: session.user.name || "User",
          email: session.user.email || "",
          contact: session.user.phone || undefined,
        },
        // Payment success callback
        (paymentResult) => {
          console.log(
            "✅ [BOOKING] Payment successful, booking created:",
            paymentResult
          );
          setStep("success");

          // Call onSuccess callback if provided
          if (onSuccess) {
            // For queue bookings, call onSuccess immediately
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } else {
            // Auto-close after 3 seconds for single bookings
            setTimeout(() => {
              handleClose();
            }, 3000);
          }
        },
        // Payment failure callback
        (error) => {
          console.error("❌ [BOOKING] Payment failed:", error);
          setStep("error");
        }
      );
    } catch (error) {
      console.error("❌ [BOOKING] Process error:", error);
      setStep("error");
    }
  };

  if (!timeSlot) return null;

  const availableSpots = timeSlot.maxCapacity - timeSlot.currentBookings;
  const totalPrice = timeSlot.price * (playerCount / timeSlot.maxCapacity);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "confirm" && <Calendar className="h-5 w-5" />}
            {step === "processing" && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {step === "success" && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {step === "error" && (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}

            {step === "confirm" && (
              <div className="flex items-center gap-2">
                <span>Confirm Booking</span>
                {queueInfo && (
                  <Badge variant="secondary" className="text-xs">
                    {queueInfo.current} of {queueInfo.total}
                  </Badge>
                )}
              </div>
            )}
            {step === "processing" && "Processing Payment..."}
            {step === "success" && "Payment Successful!"}
            {step === "error" && "Payment Failed"}
          </DialogTitle>
          <DialogDescription>
            {step === "confirm" &&
              "Review your booking details before confirming."}
            {step === "processing" &&
              "Please wait while we process your payment."}
            {step === "success" &&
              "Your payment was successful and booking is confirmed."}
            {step === "error" && "There was an issue processing your payment."}
          </DialogDescription>

          {/* Queue Info - Outside DialogDescription to avoid nesting issues */}
          {queueInfo && queueInfo.total > 1 && (
            <div className="text-sm text-muted-foreground -mt-2 mb-4">
              {step === "confirm" && (
                <span>
                  This is booking {queueInfo.current} of {queueInfo.total}.
                  You'll be prompted for each booking.
                </span>
              )}
              {step === "success" && queueInfo.current < queueInfo.total && (
                <span className="text-green-600">
                  Proceeding to booking {queueInfo.current + 1} of{" "}
                  {queueInfo.total}...
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        {step === "confirm" && (
          <div className="space-y-4">
            {/* Booking Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{timeSlot.venueName}</p>
                  <p className="text-sm text-muted-foreground">
                    {timeSlot.venueAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{timeSlot.courtName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(timeSlot.date), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {timeSlot.startTime} - {timeSlot.endTime}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Player Count */}
            <div className="space-y-2">
              <Label htmlFor="playerCount">Number of Players</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
                  disabled={playerCount <= 1}
                >
                  -
                </Button>
                <Input
                  id="playerCount"
                  type="number"
                  value={playerCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setPlayerCount(
                      Math.min(Math.max(1, value), availableSpots)
                    );
                  }}
                  className="w-20 text-center"
                  min="1"
                  max={availableSpots}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPlayerCount(Math.min(availableSpots, playerCount + 1))
                  }
                  disabled={playerCount >= availableSpots}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground">
                  (Max {availableSpots} available)
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {timeSlot.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Players:</span>
                <span>{playerCount}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Processing your payment...
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Payment Successful!</p>
            <p className="text-muted-foreground">
              Your booking is confirmed. You will receive a confirmation email
              shortly.
            </p>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Payment Failed</p>
            <p className="text-muted-foreground">
              {createBookingMutation.error?.message ||
                conflictCheckMutation.error?.message ||
                "Payment was unsuccessful. Please try again or contact support."}
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={
                  playerCount > availableSpots ||
                  playerCount < 1 ||
                  isPaymentLoading ||
                  isPaymentProcessing ||
                  createBookingMutation.isPending ||
                  conflictCheckMutation.isPending
                }
              >
                {isPaymentLoading ||
                isPaymentProcessing ||
                createBookingMutation.isPending ||
                conflictCheckMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay & Confirm Booking"
                )}
              </Button>
            </>
          )}
          {step === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setStep("confirm")}>Try Again</Button>
            </>
          )}
          {(step === "processing" || step === "success") && (
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={step === "processing"}
            >
              {step === "success" ? "Close" : "Cancel"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
