"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Star, 
  IndianRupee, 
  Building2,
  Loader2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRelatedVenues } from "@/hooks/use-venues";
import { cn } from "@/lib/utils";

interface RelatedVenuesProps {
  currentVenueId: string;
  limit?: number;
  className?: string;
}

interface RelatedVenue {
  id: string;
  name: string;
  description?: string;
  address: string;
  photoUrls: string[];
  sports: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  minPrice?: number;
  priceRange: string;
  isActive: boolean;
}

export function RelatedVenues({ 
  currentVenueId, 
  limit = 8, 
  className 
}: RelatedVenuesProps) {
  const router = useRouter();
  const { data: response, isLoading, isError, error } = useRelatedVenues(currentVenueId, limit);

  const venues: RelatedVenue[] = response?.success ? response.venues : [];

  const handleVenueClick = (venueId: string) => {
    router.push(`/venues/${venueId}`);
  };

  const handleViewAll = () => {
    router.push('/venues');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Explore More Venues</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading related venues...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Explore More Venues</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Failed to load related venues"}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleViewAll}
            >
              Browse All Venues
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No venues found
  if (!venues || venues.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Explore More Venues</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏟️</div>
          <h3 className="text-lg font-semibold mb-2">No other venues found</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for more venues in your area.
          </p>
          <Button onClick={handleViewAll}>
            Browse All Venues
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Explore More Venues</h2>
          <p className="text-muted-foreground">
            Discover other great sports venues near you
          </p>
        </div>
        {venues.length >= limit && (
          <Button 
            variant="outline" 
            onClick={handleViewAll}
            className="flex items-center gap-2"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Venues Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {venues.map((venue) => (
          <VenueCard 
            key={venue.id} 
            venue={venue} 
            onClick={() => handleVenueClick(venue.id)}
          />
        ))}
      </div>

      {/* View All Button (mobile) */}
      {venues.length >= limit && (
        <div className="text-center md:hidden">
          <Button 
            variant="outline" 
            onClick={handleViewAll}
            className="flex items-center gap-2 mx-auto"
          >
            View All Venues
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Individual venue card component
function VenueCard({ 
  venue, 
  onClick 
}: { 
  venue: RelatedVenue; 
  onClick: () => void;
}) {
  const primaryImage = venue.photoUrls && venue.photoUrls.length > 0 
    ? venue.photoUrls[0] 
    : null;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden group"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={venue.name}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-gray-900 font-medium">
            {venue.priceRange}
          </Badge>
        </div>
      </div>
      
      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{venue.address}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{venue.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({venue.reviewCount})
            </span>
          </div>
        </div>

        {/* Sports */}
        <div className="flex flex-wrap gap-1">
          {venue.sports.slice(0, 3).map((sport) => (
            <Badge key={sport} variant="secondary" className="text-xs">
              {sport}
            </Badge>
          ))}
          {venue.sports.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{venue.sports.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
