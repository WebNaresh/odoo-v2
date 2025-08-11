import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VenueService } from '@/lib/services/venue-service';
import { type Venue } from '@/types/venue';
import axios from 'axios';

// Query keys for owner venues
export const ownerVenueKeys = {
  all: ['owner-venues'] as const,
  lists: () => [...ownerVenueKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...ownerVenueKeys.lists(), { filters }] as const,
  details: () => [...ownerVenueKeys.all, 'detail'] as const,
  detail: (id: string) => [...ownerVenueKeys.details(), id] as const,
};

// Hook for fetching owner venues
export function useOwnerVenues() {
  return useQuery({
    queryKey: ownerVenueKeys.lists(),
    queryFn: () => VenueService.getOwnerVenues(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for deleting a venue
export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venueId: string) => {
      const response = await axios.delete(`/api/owner/venues/${venueId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch owner venues
      queryClient.invalidateQueries({ queryKey: ownerVenueKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting venue:', error);
    },
  });
}

// Hook for fetching single owner venue details
export function useOwnerVenueDetails(id: string) {
  return useQuery({
    queryKey: ownerVenueKeys.detail(id),
    queryFn: async () => {
      const response = await axios.get(`/api/owner/venues/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Type exports for convenience
export type { Venue };
