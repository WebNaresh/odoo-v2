"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Star, 
  IndianRupee, 
  Clock, 
  Users,
  CheckCircle,
  Building2
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface VenueSelectionCardProps {
  venue: {
    id: string;
    name: string;
    address: string;
    rating: number;
    reviewCount: number;
    description?: string;
    photoUrls: string[];
    sports: string[];
    amenities: string[];
    minPrice?: number;
    priceRange?: string;
    isActive: boolean;
  };
  isSelected: boolean;
  onSelect: (venueId: string) => void;
  className?: string;
}

export function VenueSelectionCard({ 
  venue, 
  isSelected, 
  onSelect, 
  className 
}: VenueSelectionCardProps) {
  const handleSelect = () => {
    onSelect(venue.id);
  };

  const primaryImage = venue.photoUrls && venue.photoUrls.length > 0 
    ? venue.photoUrls[0] 
    : null;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2 shadow-lg",
        !venue.isActive && "opacity-60",
        className
      )}
      onClick={handleSelect}
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={venue.name}
            fill
            className="object-cover transition-transform duration-200 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={venue.isActive ? "default" : "secondary"}
            className={cn(
              "text-xs",
              venue.isActive ? "bg-green-600 hover:bg-green-700" : "bg-gray-500"
            )}
          >
            {venue.isActive ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{venue.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{venue.address}</span>
            </CardDescription>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{venue.rating}</span>
            <span className="text-muted-foreground">({venue.reviewCount})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {venue.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {venue.description}
          </p>
        )}

        {/* Sports */}
        <div>
          <div className="flex flex-wrap gap-1">
            {venue.sports.slice(0, 3).map((sport) => (
              <Badge key={sport} variant="outline" className="text-xs">
                {sport}
              </Badge>
            ))}
            {venue.sports.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.sports.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Key Amenities */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {venue.amenities.includes("Parking") && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              <span>Parking</span>
            </div>
          )}
          {venue.amenities.includes("WiFi") && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              <span>WiFi</span>
            </div>
          )}
          {venue.amenities.includes("Cafeteria") && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              <span>Cafeteria</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            <span className="font-semibold">
              {venue.minPrice ? `${venue.minPrice}+` : "N/A"}
            </span>
            <span className="text-sm text-muted-foreground">per hour</span>
          </div>
          
          {venue.priceRange && (
            <span className="text-xs text-muted-foreground">
              Range: {venue.priceRange}
            </span>
          )}
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Open now</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Usually busy 6-9 PM</span>
          </div>
        </div>

        {/* Select Button */}
        <Button 
          variant={isSelected ? "default" : "outline"} 
          size="sm" 
          className="w-full mt-3"
          disabled={!venue.isActive}
        >
          {isSelected ? "Selected" : "Select Venue"}
        </Button>
      </CardContent>
    </Card>
  );
}
