"use client";

import { useQuery } from "@tanstack/react-query";
import { VenueService, VenueFilters, PublicVenue } from "@/lib/services/venue-service";

// Query keys for React Query
export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (filters: VenueFilters) => [...venueKeys.lists(), filters] as const,
  featured: () => [...venueKeys.all, 'featured'] as const,
  search: (query: string) => [...venueKeys.all, 'search', query] as const,
  sport: (sport: string) => [...venueKeys.all, 'sport', sport] as const,
  amenities: (amenities: string[]) => [...venueKeys.all, 'amenities', amenities] as const,
  priceRange: (minPrice: number, maxPrice: number) => [...venueKeys.all, 'priceRange', minPrice, maxPrice] as const,
  related: (venueId: string, limit?: number) => [...venueKeys.all, 'related', venueId, limit] as const,
};

// Hook for fetching venues with filters
export function useVenues(filters: VenueFilters = {}) {
  return useQuery({
    queryKey: venueKeys.list(filters),
    queryFn: () => VenueService.getVenues(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching featured venues - simplified to just fetch all venues
export function useFeaturedVenues(_limit: number = 6) {
  return useQuery({
    queryKey: venueKeys.featured(),
    queryFn: async () => {
      const response = await VenueService.getVenues();
      // Return just the venues array for featured venues
      return response.success ? response.venues : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for searching venues
export function useSearchVenues(query: string, limit: number = 20) {
  return useQuery({
    queryKey: venueKeys.search(query),
    queryFn: () => VenueService.searchVenues(query, limit),
    enabled: query.length > 0, // Only run query if there's a search term
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching venues by sport
export function useVenuesBySport(sport: string, limit: number = 20) {
  return useQuery({
    queryKey: venueKeys.sport(sport),
    queryFn: () => VenueService.getVenuesBySport(sport, limit),
    enabled: sport.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching venues by amenities
export function useVenuesByAmenities(amenities: string[], limit: number = 20) {
  return useQuery({
    queryKey: venueKeys.amenities(amenities),
    queryFn: () => VenueService.getVenuesByAmenities(amenities, limit),
    enabled: amenities.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching venues by price range
export function useVenuesByPriceRange(minPrice: number, maxPrice: number, limit: number = 20) {
  return useQuery({
    queryKey: venueKeys.priceRange(minPrice, maxPrice),
    queryFn: () => VenueService.getVenuesByPriceRange(minPrice, maxPrice, limit),
    enabled: minPrice >= 0 && maxPrice > minPrice,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for getting available sports
export function useAvailableSports() {
  return useQuery({
    queryKey: [...venueKeys.all, 'availableSports'],
    queryFn: () => VenueService.getAvailableSports(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for getting available amenities
export function useAvailableAmenities() {
  return useQuery({
    queryKey: [...venueKeys.all, 'availableAmenities'],
    queryFn: () => VenueService.getAvailableAmenities(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Custom hook for venues - simplified to just fetch all venues
export function useVenuesWithFilters(
  _searchQuery: string,
  _selectedSports: string[],
  _selectedAmenities: string[],
  _priceRange: [number, number],
  _sortBy: string,
  _limit: number = 50
) {
  // For now, ignore all filters and just fetch all venues
  return useQuery({
    queryKey: venueKeys.all,
    queryFn: async () => {
      const response = await VenueService.getVenues();
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    // Add some additional options for better UX
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

// Hook for fetching venue details by ID
export function useVenueDetails(id: string) {
  return useQuery({
    queryKey: [...venueKeys.all, 'details', id],
    queryFn: () => VenueService.getVenueDetails(id),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching related venues
export function useRelatedVenues(venueId: string, limit: number = 8) {
  return useQuery({
    queryKey: venueKeys.related(venueId, limit),
    queryFn: async () => {
      const response = await fetch(`/api/venues/${venueId}/related?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch related venues');
      }
      return response.json();
    },
    enabled: !!venueId, // Only run query if venue ID is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Type exports for convenience
export type { VenueFilters, PublicVenue };
