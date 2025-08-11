"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RefreshCw,
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useVenueResubmission } from "@/hooks/useVenueResubmission";

interface VenueResubmissionButtonProps {
  venueId: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export function VenueResubmissionButton({
  venueId,
  approvalStatus,
  rejectionReason,
}: VenueResubmissionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    resubmit,
    isResubmitting,
    canResubmit,
    attemptsRemaining,
    cooldownEndsAt,
    formatCooldownTime,
    getButtonState,
    resubmissionStatus,
    isLoadingStatus,
  } = useVenueResubmission(venueId);

  // Only show for rejected venues
  if (approvalStatus !== "REJECTED") {
    return null;
  }

  const buttonState = getButtonState();

  const handleResubmit = () => {
    resubmit();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Rejection Information Card */}
      {rejectionReason && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Venue Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-700 text-sm mb-3">
              <strong>Reason:</strong> {rejectionReason}
            </div>
            <div className="text-red-600 text-xs">
              Please address the issues mentioned above before resubmitting your
              venue for review.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resubmission Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Resubmission Status
          </CardTitle>
          <CardDescription>
            Track your venue resubmission attempts and cooldown periods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Attempts Remaining
            </span>
            <Badge
              variant={
                attemptsRemaining > 2
                  ? "default"
                  : attemptsRemaining > 0
                  ? "secondary"
                  : "destructive"
              }
            >
              {attemptsRemaining} / 5
            </Badge>
          </div>

          {cooldownEndsAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Cooldown
              </span>
              <span className="text-sm font-medium">
                {formatCooldownTime(cooldownEndsAt)}
              </span>
            </div>
          )}

          {canResubmit && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Ready to resubmit</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resubmission Button */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant={buttonState.variant}
            disabled={buttonState.disabled || isLoadingStatus}
            className="w-full flex items-center gap-2"
          >
            {isResubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {buttonState.text}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Resubmit Venue for Review
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  You are about to resubmit your venue for admin review. Please
                  ensure you have:
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    Addressed all issues mentioned in the rejection reason
                  </li>
                  <li>
                    Updated venue information, photos, and descriptions as
                    needed
                  </li>
                  <li>Verified all venue details are accurate and complete</li>
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <div className="font-medium mb-1">Important Notice:</div>
                      <div>
                        Repeated submissions without addressing feedback may
                        result in account restrictions. You have{" "}
                        <strong>{attemptsRemaining} attempts remaining</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResubmit}
              disabled={isResubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isResubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resubmitting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Confirm Resubmission
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
