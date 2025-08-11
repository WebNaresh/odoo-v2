"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { resubmitVenueForReview, getResubmissionStatus } from "@/app/actions/venue-resubmission";

export function useVenueResubmission(venueId: string) {
  const queryClient = useQueryClient();

  // Query to get resubmission status
  const {
    data: resubmissionStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: ["venue-resubmission-status", venueId],
    queryFn: () => getResubmissionStatus(venueId),
    enabled: !!venueId,
    refetchInterval: 60000, // Refetch every minute to update cooldown
  });

  // Mutation for resubmitting venue
  const resubmissionMutation = useMutation({
    mutationFn: () => resubmitVenueForReview(venueId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Venue resubmitted for review successfully!");
        
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: ["venue-resubmission-status", venueId] });
        queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
        queryClient.invalidateQueries({ queryKey: ["venues"] });
        
        // Optimistically update the venue status
        queryClient.setQueryData(["venue", venueId], (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              approvalStatus: "PENDING",
              rejectionReason: null,
              updatedAt: new Date().toISOString(),
            };
          }
          return oldData;
        });
      } else {
        toast.error(result.error || "Failed to resubmit venue");
      }
    },
    onError: (error) => {
      console.error("Resubmission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    },
  });

  // Helper function to format cooldown time
  const formatCooldownTime = (cooldownEndsAt: Date) => {
    const now = new Date();
    const timeDiff = cooldownEndsAt.getTime() - now.getTime();
    
    if (timeDiff <= 0) return "Available now";
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  // Helper function to get button state
  const getButtonState = () => {
    if (isLoadingStatus) {
      return {
        disabled: true,
        text: "Checking...",
        variant: "outline" as const,
      };
    }

    if (resubmissionMutation.isPending) {
      return {
        disabled: true,
        text: "Resubmitting...",
        variant: "default" as const,
      };
    }

    if (!resubmissionStatus?.canResubmit) {
      if (resubmissionStatus?.cooldownEndsAt) {
        return {
          disabled: true,
          text: `Available in ${formatCooldownTime(resubmissionStatus.cooldownEndsAt)}`,
          variant: "outline" as const,
        };
      }
      
      if (resubmissionStatus?.attemptsRemaining === 0) {
        return {
          disabled: true,
          text: "Max attempts reached",
          variant: "outline" as const,
        };
      }

      return {
        disabled: true,
        text: "Cannot resubmit",
        variant: "outline" as const,
      };
    }

    return {
      disabled: false,
      text: "Resubmit for Review",
      variant: "default" as const,
    };
  };

  return {
    // Status data
    resubmissionStatus,
    isLoadingStatus,
    statusError,
    
    // Mutation
    resubmit: resubmissionMutation.mutate,
    isResubmitting: resubmissionMutation.isPending,
    resubmissionError: resubmissionMutation.error,
    
    // Helper functions
    formatCooldownTime,
    getButtonState,
    
    // Computed values
    canResubmit: resubmissionStatus?.canResubmit ?? false,
    attemptsRemaining: resubmissionStatus?.attemptsRemaining ?? 0,
    cooldownEndsAt: resubmissionStatus?.cooldownEndsAt,
  };
}
