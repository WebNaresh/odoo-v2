/**
 * Utility functions for validating venue completeness
 */

export interface VenueForValidation {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  photoUrls: string[];
  sports: string[];
  amenities: string[];
  operatingHours: any;
  isActive: boolean;
  approvalStatus: string;
  courts?: Array<{
    id: string;
    name: string;
    courtType: string;
    pricePerHour: number;
    isActive: boolean;
  }>;
}

/**
 * Validates if a venue has complete information required for display
 * @param venue - The venue object to validate
 * @returns boolean - true if venue is complete, false otherwise
 */
export function isVenueComplete(venue: VenueForValidation): boolean {
  // Check basic required fields
  if (!venue.name || venue.name.trim().length < 2) {
    return false;
  }

  if (!venue.address || venue.address.trim().length < 10) {
    return false;
  }

  // Check if venue has description (optional but recommended for complete venues)
  if (!venue.description || venue.description.trim().length < 10) {
    return false;
  }

  // Check if venue has at least one photo
  if (!venue.photoUrls || venue.photoUrls.length === 0) {
    return false;
  }

  // Check if venue has at least one sport
  if (!venue.sports || venue.sports.length === 0) {
    return false;
  }

  // Check if venue has at least one amenity
  if (!venue.amenities || venue.amenities.length === 0) {
    return false;
  }

  // Check operating hours - ensure at least one day is open
  if (!venue.operatingHours) {
    return false;
  }

  const hasOpenDay = Object.values(venue.operatingHours as Record<string, any>).some(
    (day: any) => day?.isOpen === true && day?.openTime && day?.closeTime
  );

  if (!hasOpenDay) {
    return false;
  }

  // Check if venue has at least one active court
  if (!venue.courts || venue.courts.length === 0) {
    return false;
  }

  const hasActiveCourt = venue.courts.some(court => 
    court.isActive && 
    court.name && 
    court.courtType && 
    court.pricePerHour > 0
  );

  if (!hasActiveCourt) {
    return false;
  }

  // Check venue status
  if (!venue.isActive || venue.approvalStatus !== 'APPROVED') {
    return false;
  }

  return true;
}

/**
 * Filters an array of venues to only include complete ones
 * @param venues - Array of venues to filter
 * @returns Array of complete venues
 */
export function filterCompleteVenues(venues: VenueForValidation[]): VenueForValidation[] {
  return venues.filter(isVenueComplete);
}

/**
 * Gets validation details for a venue (useful for debugging)
 * @param venue - The venue to validate
 * @returns Object with validation details
 */
export function getVenueValidationDetails(venue: VenueForValidation) {
  return {
    hasName: !!(venue.name && venue.name.trim().length >= 2),
    hasAddress: !!(venue.address && venue.address.trim().length >= 10),
    hasDescription: !!(venue.description && venue.description.trim().length >= 10),
    hasPhotos: !!(venue.photoUrls && venue.photoUrls.length > 0),
    hasSports: !!(venue.sports && venue.sports.length > 0),
    hasAmenities: !!(venue.amenities && venue.amenities.length > 0),
    hasOperatingHours: !!venue.operatingHours,
    hasOpenDay: venue.operatingHours ? Object.values(venue.operatingHours as Record<string, any>).some(
      (day: any) => day?.isOpen === true && day?.openTime && day?.closeTime
    ) : false,
    hasCourts: !!(venue.courts && venue.courts.length > 0),
    hasActiveCourt: venue.courts ? venue.courts.some(court => 
      court.isActive && 
      court.name && 
      court.courtType && 
      court.pricePerHour > 0
    ) : false,
    isActive: venue.isActive,
    isApproved: venue.approvalStatus === 'APPROVED',
  };
}
