"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBooking, cancelBooking, getUserBookings } from "@/lib/actions/booking-actions";
import { toast } from "react-hot-toast";

// Query keys for React Query
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  user: () => [...bookingKeys.all, 'user'] as const,
  venue: (venueId: string) => [...bookingKeys.all, 'venue', venueId] as const,
  court: (courtId: string) => [...bookingKeys.all, 'court', courtId] as const,
  timeSlot: (timeSlotId: string) => [...bookingKeys.all, 'timeSlot', timeSlotId] as const,
};

// Types for booking operations
export interface CreateBookingData {
  courtId: string;
  timeSlotId: string;
  playerCount: number;
  notes?: string;
}

export interface CancelBookingData {
  bookingId: string;
  cancellationReason?: string;
}

// Hook for creating bookings
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Booking created successfully!");
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: bookingKeys.user() });
        queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        
        // Invalidate venue-related queries to update time slot availability
        if (data.booking?.court?.venue?.id) {
          queryClient.invalidateQueries({ 
            queryKey: ['venues', 'details', data.booking.court.venue.id] 
          });
        }
        
        // Invalidate time slot queries
        if (data.booking?.timeSlotId) {
          queryClient.invalidateQueries({ 
            queryKey: bookingKeys.timeSlot(data.booking.timeSlotId) 
          });
        }
      } else {
        toast.error(data.error || "Failed to create booking");
      }
    },
    onError: (error) => {
      console.error("Create booking mutation error:", error);
      toast.error("An unexpected error occurred while creating the booking");
    },
  });
}

// Hook for cancelling bookings
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Booking cancelled successfully!");
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: bookingKeys.user() });
        queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        
        // Invalidate venue-related queries to update time slot availability
        if (data.booking?.court?.venue?.id) {
          queryClient.invalidateQueries({ 
            queryKey: ['venues', 'details', data.booking.court.venue.id] 
          });
        }
        
        // Invalidate time slot queries
        if (data.booking?.timeSlotId) {
          queryClient.invalidateQueries({ 
            queryKey: bookingKeys.timeSlot(data.booking.timeSlotId) 
          });
        }
      } else {
        toast.error(data.error || "Failed to cancel booking");
      }
    },
    onError: (error) => {
      console.error("Cancel booking mutation error:", error);
      toast.error("An unexpected error occurred while cancelling the booking");
    },
  });
}

// Hook for fetching user bookings
export function useUserBookings() {
  return useQuery({
    queryKey: bookingKeys.user(),
    queryFn: getUserBookings,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => {
      if (data.success) {
        return data.bookings;
      }
      return [];
    },
  });
}

// Hook for optimistic booking updates
export function useOptimisticBooking() {
  const queryClient = useQueryClient();

  const optimisticCreate = (bookingData: CreateBookingData) => {
    // Create optimistic booking object
    const optimisticBooking = {
      id: `temp-${Date.now()}`,
      ...bookingData,
      status: "PENDING" as const,
      paymentStatus: "PENDING" as const,
      createdAt: new Date(),
      isOptimistic: true,
    };

    // Update cache optimistically
    queryClient.setQueryData(bookingKeys.user(), (oldData: any) => {
      if (oldData) {
        return [optimisticBooking, ...oldData];
      }
      return [optimisticBooking];
    });

    return optimisticBooking;
  };

  const revertOptimistic = (tempId: string) => {
    queryClient.setQueryData(bookingKeys.user(), (oldData: any) => {
      if (oldData) {
        return oldData.filter((booking: any) => booking.id !== tempId);
      }
      return oldData;
    });
  };

  return {
    optimisticCreate,
    revertOptimistic,
  };
}

// Hook for checking booking conflicts
export function useBookingConflictCheck() {
  return useMutation({
    mutationFn: async ({ timeSlotId, playerCount }: { timeSlotId: string; playerCount: number }) => {
      // This would typically call an API endpoint to check for conflicts
      // For now, we'll implement basic client-side validation
      const response = await fetch(`/api/bookings/check-conflict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSlotId, playerCount }),
      });

      if (!response.ok) {
        throw new Error('Failed to check booking conflicts');
      }

      return response.json();
    },
    onError: (error) => {
      console.error("Conflict check error:", error);
      toast.error("Failed to verify booking availability");
    },
  });
}

// Hook for real-time booking status updates
export function useBookingStatusUpdates(bookingId?: string) {
  return useQuery({
    queryKey: [...bookingKeys.all, 'status', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      
      const response = await fetch(`/api/bookings/${bookingId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking status');
      }
      return response.json();
    },
    enabled: !!bookingId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // 10 seconds
  });
}

// Utility function to format booking data for display
export function formatBookingForDisplay(booking: any) {
  return {
    id: booking.id,
    reference: booking.bookingReference,
    venueName: booking.court?.venue?.name || 'Unknown Venue',
    courtName: booking.court?.name || 'Unknown Court',
    date: new Date(booking.bookingDate).toLocaleDateString(),
    startTime: new Date(booking.startTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    endTime: new Date(booking.endTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    duration: booking.duration,
    playerCount: booking.playerCount,
    totalPrice: booking.totalPrice,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    canCancel: booking.status === 'PENDING' || booking.status === 'CONFIRMED',
    isUpcoming: new Date(booking.startTime) > new Date(),
  };
}

// Export types for convenience
export type { CreateBookingData, CancelBookingData };
