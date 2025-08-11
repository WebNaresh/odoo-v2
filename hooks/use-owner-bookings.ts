import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Query keys for owner bookings
export const ownerBookingKeys = {
  all: ['owner-bookings'] as const,
  lists: () => [...ownerBookingKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...ownerBookingKeys.lists(), { filters }] as const,
  counts: () => [...ownerBookingKeys.all, 'counts'] as const,
  pendingCount: () => [...ownerBookingKeys.counts(), 'pending'] as const,
};

// Hook for fetching pending bookings count
export function usePendingBookingsCount() {
  return useQuery({
    queryKey: ownerBookingKeys.pendingCount(),
    queryFn: async () => {
      const response = await axios.get('/api/owner/bookings?status=PENDING&limit=1');
      return response.data.pagination?.total || 0;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Hook for fetching all owner bookings with filters
export function useOwnerBookings(filters: {
  status?: string;
  venueId?: string;
  courtId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
} = {}) {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  return useQuery({
    queryKey: ownerBookingKeys.list(filters),
    queryFn: async () => {
      const response = await axios.get(`/api/owner/bookings?${queryParams.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
