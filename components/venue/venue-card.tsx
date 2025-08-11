"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface VenueCardProps {
  venue: {
    id: number;
    name: string;
    location: string;
    rating: number;
    reviewCount: number;
    image?: string;
    sports: string[];
    priceRange: string;
    amenities?: string[];
    distance?: string;
    isOpen?: boolean;
    nextAvailable?: string;
  };
  variant?: "default" | "compact" | "featured";
  showFavorite?: boolean;
  className?: string;
}

export function VenueCard({ 
  venue, 
  variant = "default", 
  showFavorite = true,
  className 
}: VenueCardProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      toast.error("Failed to update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue.name,
          text: `Check out ${venue.name} on QuickCourt`,
          url: `${window.location.origin}/venues/${venue.id}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/venues/${venue.id}`);
        toast.success("Link copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleCardClick = () => {
    router.push(`/venues/${venue.id}`);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/venues/${venue.id}/book`);
  };

  if (variant === "compact") {
    return (
      <Card 
        className={cn(
          "cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
          className
        )}
        onClick={handleCardClick}
      >
        <div className="flex">
          <div className="w-24 h-24 bg-muted rounded-l-lg flex-shrink-0" />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">{venue.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {venue.location}
                  {venue.distance && <span>• {venue.distance}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{venue.rating}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">{venue.priceRange}</span>
              <Button size="sm" className="h-6 text-xs px-2">
                Book
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card 
        className={cn(
          "cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden",
          className
        )}
        onClick={handleCardClick}
      >
        <div className="relative">
          <div className="aspect-video bg-muted relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              {showFavorite && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={handleFavoriteToggle}
                  disabled={isLoading}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4",
                      isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                    )} 
                  />
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <Badge variant="secondary" className="mb-2">
                {venue.priceRange}
              </Badge>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg mb-1">{venue.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {venue.location}
                {venue.distance && <span>• {venue.distance}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{venue.rating}</span>
              <span className="text-sm text-muted-foreground">({venue.reviewCount})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {venue.sports.slice(0, 3).map((sport) => (
              <Badge key={sport} variant="secondary" className="text-xs">
                {sport}
              </Badge>
            ))}
            {venue.sports.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.sports.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className={venue.isOpen ? "text-green-600" : "text-red-600"}>
                  {venue.isOpen ? "Open now" : "Closed"}
                </span>
              </div>
              {venue.nextAvailable && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Next: {venue.nextAvailable}</span>
                </div>
              )}
            </div>
            <Button onClick={handleBookNow} className="px-6">
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-video bg-muted relative">
          <div className="absolute top-4 right-4 flex gap-2">
            {showFavorite && (
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleFavoriteToggle}
                disabled={isLoading}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4",
                    isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                  )} 
                />
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-white/90 text-gray-900">
              {venue.priceRange}
            </Badge>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{venue.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {venue.location}
              {venue.distance && <span>• {venue.distance}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{venue.rating}</span>
            <span className="text-sm text-muted-foreground">({venue.reviewCount})</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {venue.sports.slice(0, 3).map((sport) => (
            <Badge key={sport} variant="secondary" className="text-xs">
              {sport}
            </Badge>
          ))}
          {venue.sports.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{venue.sports.length - 3} more
            </Badge>
          )}
        </div>

        {venue.amenities && (
          <div className="flex flex-wrap gap-1 mb-4">
            {venue.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {venue.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className={venue.isOpen ? "text-green-600" : "text-red-600"}>
              {venue.isOpen ? "Open now" : "Closed"}
            </span>
          </div>
          <Button onClick={handleBookNow} size="sm">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
