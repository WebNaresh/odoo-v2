import { Venue } from "@/types/venue";
import axios from "axios";

export interface VenueFilters {
  search?: string;
  sport?: string;
  amenities?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "rating" | "reviewCount" | "name" | "createdAt";
  limit?: number;
  offset?: number;
}

export interface VenueResponse {
  success: boolean;
  venues: PublicVenue[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface PublicVenue extends Omit<Venue, 'ownerId'> {
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  courtCount: number;
  owner: {
    id: string;
    name: string;
  };
}

export interface VenueDetails extends PublicVenue {
  totalCourts: number;
  courts: Array<{
    id: string;
    name: string;
    courtType: string;
    pricePerHour: number;
    isActive: boolean;
    operatingHours: any;
    features: string[];
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }>;
  owner: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface VenueDetailsResponse {
  success: boolean;
  venue?: VenueDetails;
  error?: string;
}

export class VenueService {
  private static baseUrl = '/api/venues';

  static async getVenues(_filters: VenueFilters = {}): Promise<VenueResponse> {
    try {
      // Simple axios request without any query parameters for now
      // TODO: Implement filters later
      const response = await axios.get(this.baseUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching venues:', error);

      // Handle axios error
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        return {
          success: false,
          venues: [],
          pagination: {
            total: 0,
            limit: 0,
            offset: 0,
            hasMore: false,
          },
          error: errorMessage,
        };
      }

      return {
        success: false,
        venues: [],
        pagination: {
          total: 0,
          limit: 0,
          offset: 0,
          hasMore: false,
        },
        error: error instanceof Error ? error.message : 'Failed to fetch venues',
      };
    }
  }

  static async getFeaturedVenues(limit: number = 6): Promise<PublicVenue[]> {
    try {
      const response = await this.getVenues({
        sortBy: 'rating',
        limit,
      });

      if (response.success) {
        return response.venues;
      }

      return [];
    } catch (error) {
      console.error('Error fetching featured venues:', error);
      return [];
    }
  }

  static async searchVenues(query: string, limit: number = 20): Promise<PublicVenue[]> {
    try {
      const response = await this.getVenues({
        search: query,
        limit,
        sortBy: 'rating',
      });

      if (response.success) {
        return response.venues;
      }

      return [];
    } catch (error) {
      console.error('Error searching venues:', error);
      return [];
    }
  }

  static async getVenuesBySport(sport: string, limit: number = 20): Promise<PublicVenue[]> {
    try {
      const response = await this.getVenues({
        sport,
        limit,
        sortBy: 'rating',
      });

      if (response.success) {
        return response.venues;
      }

      return [];
    } catch (error) {
      console.error('Error fetching venues by sport:', error);
      return [];
    }
  }

  static async getVenuesByAmenities(amenities: string[], limit: number = 20): Promise<PublicVenue[]> {
    try {
      const response = await this.getVenues({
        amenities,
        limit,
        sortBy: 'rating',
      });

      if (response.success) {
        return response.venues;
      }

      return [];
    } catch (error) {
      console.error('Error fetching venues by amenities:', error);
      return [];
    }
  }

  static async getVenuesByPriceRange(minPrice: number, maxPrice: number, limit: number = 20): Promise<PublicVenue[]> {
    try {
      const response = await this.getVenues({
        minPrice,
        maxPrice,
        limit,
        sortBy: 'rating',
      });

      if (response.success) {
        return response.venues;
      }

      return [];
    } catch (error) {
      console.error('Error fetching venues by price range:', error);
      return [];
    }
  }

  // Helper function to get unique sports from venues
  static async getAvailableSports(): Promise<string[]> {
    try {
      const response = await this.getVenues({ limit: 1000 }); // Get all venues

      if (response.success) {
        const sportsSet = new Set<string>();
        response.venues.forEach(venue => {
          venue.sports.forEach(sport => sportsSet.add(sport));
        });
        return Array.from(sportsSet).sort();
      }

      return [];
    } catch (error) {
      console.error('Error fetching available sports:', error);
      return [];
    }
  }

  // Helper function to get unique amenities from venues
  static async getAvailableAmenities(): Promise<string[]> {
    try {
      const response = await this.getVenues({ limit: 1000 }); // Get all venues

      if (response.success) {
        const amenitiesSet = new Set<string>();
        response.venues.forEach(venue => {
          venue.amenities.forEach(amenity => amenitiesSet.add(amenity));
        });
        return Array.from(amenitiesSet).sort();
      }

      return [];
    } catch (error) {
      console.error('Error fetching available amenities:', error);
      return [];
    }
  }

  // Get venue details by ID
  static async getVenueDetails(id: string): Promise<VenueDetailsResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching venue details:', error);

      // Handle axios error
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch venue details',
      };
    }
  }
}
