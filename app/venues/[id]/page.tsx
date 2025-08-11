"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Wifi,
  Car,
  Coffee,
  Users,
  Heart,
  Share2,
  Calendar,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useVenueDetails } from "@/hooks/use-venues";
import { VenueTimingDisplay } from "@/components/venues/VenueTimingDisplay";
import { RelatedVenues } from "@/components/venues/RelatedVenues";
import Image from "next/image";

// Mock venue data
const mockVenue = {
  id: 1,
  name: "Elite Sports Complex",
  location: "Downtown, Mumbai",
  address: "123 Sports Street, Downtown, Mumbai, Maharashtra 400001",
  rating: 4.8,
  reviewCount: 124,
  description:
    "Premier sports facility with state-of-the-art courts and amenities. Perfect for both casual players and serious athletes.",
  images: [
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
  ],
  amenities: [
    "Parking",
    "Changing Rooms",
    "Cafeteria",
    "WiFi",
    "Equipment Rental",
    "Shower",
    "Locker",
  ],
  sports: ["Basketball", "Tennis", "Badminton", "Squash"],
  operatingHours: {
    monday: { isOpen: true, openTime: "06:00", closeTime: "23:00" },
    tuesday: { isOpen: true, openTime: "06:00", closeTime: "23:00" },
    wednesday: { isOpen: true, openTime: "06:00", closeTime: "23:00" },
    thursday: { isOpen: true, openTime: "06:00", closeTime: "23:00" },
    friday: { isOpen: true, openTime: "06:00", closeTime: "23:00" },
    saturday: { isOpen: true, openTime: "06:00", closeTime: "00:00" },
    sunday: { isOpen: true, openTime: "06:00", closeTime: "00:00" },
  },
  contact: {
    phone: "+91 98765 43210",
    email: "info@elitesports.com",
  },
  courts: [
    {
      id: "court-1",
      name: "Basketball Court 1",
      sport: "Basketball",
      pricePerHour: 800,
      capacity: 10,
      features: ["Professional flooring", "LED lighting", "Sound system"],
    },
    {
      id: "court-2",
      name: "Tennis Court A",
      sport: "Tennis",
      pricePerHour: 600,
      capacity: 4,
      features: ["Clay surface", "Floodlights", "Ball machine available"],
    },
    {
      id: "court-3",
      name: "Badminton Court 1",
      sport: "Badminton",
      pricePerHour: 500,
      capacity: 4,
      features: [
        "Wooden flooring",
        "Professional nets",
        "Shuttlecock included",
      ],
    },
  ],
  reviews: [
    {
      id: 1,
      user: {
        name: "Rahul Sharma",
        avatar: "/api/placeholder/40/40",
      },
      rating: 5,
      comment:
        "Excellent facility with great courts and amenities. Staff is very helpful and the booking process is smooth.",
      date: "2024-01-10",
      helpful: 12,
    },
    {
      id: 2,
      user: {
        name: "Priya Patel",
        avatar: "/api/placeholder/40/40",
      },
      rating: 4,
      comment:
        "Good courts and clean facilities. Parking can be a bit crowded during peak hours but overall great experience.",
      date: "2024-01-08",
      helpful: 8,
    },
    {
      id: 3,
      user: {
        name: "Amit Kumar",
        avatar: "/api/placeholder/40/40",
      },
      rating: 5,
      comment:
        "Love playing here! The basketball court is professional grade and the lighting is perfect for evening games.",
      date: "2024-01-05",
      helpful: 15,
    },
  ],
};

const amenityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Parking: Car,
  WiFi: Wifi,
  Cafeteria: Coffee,
  "Changing Rooms": Users,
  "Equipment Rental": Users,
  Shower: Users,
  Locker: Users,
};

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // URL state management for selected courts (multiple selection)
  const [selectedCourtIds, setSelectedCourtIds] = useQueryState(
    "selectedCourts",
    {
      defaultValue: "",
    }
  );

  // Convert string to array for multiple court selection
  const selectedCourtIdsArray = selectedCourtIds
    ? selectedCourtIds.split(",")
    : [];

  const updateSelectedCourts = (courtIds: string[]) => {
    setSelectedCourtIds(courtIds.join(","));
  };

  // State for selected time slots (multiple selection)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<
    {
      id: string;
      courtId: string;
      startTime: string;
      endTime: string;
      date: string;
      price: number;
    }[]
  >([]);

  // State for member count
  const [memberCount, setMemberCount] = useState(1);

  // Convert 24-hour format to 12-hour format
  const formatTime = (time: string) => {
    if (!time) return "";

    const [hourStr, minute] = time.split(":");
    const hour = parseInt(hourStr);

    if (hour === 0) return `12:${minute} AM`;
    if (hour < 12) return `${hour}:${minute} AM`;
    if (hour === 12) return `12:${minute} PM`;
    return `${hour - 12}:${minute} PM`;
  };

  // Fetch venue details using the ID from params
  const {
    data: venueResponse,
    isLoading,
    isError,
    error,
  } = useVenueDetails(params.id as string);

  const venue = venueResponse?.success ? venueResponse.venue : null;

  const handleBookNow = () => {
    if (!venue) return;

    // Validation: Check if at least one court is selected
    if (selectedCourtIdsArray.length === 0) {
      toast.error("Please select at least one court first");
      return;
    }

    // Validation: Check if time slots are selected
    if (selectedTimeSlots.length === 0) {
      toast.error("Please select at least one time slot first");
      return;
    }

    // Validation: Check member count against court capacity
    const selectedCourts = venue.courts?.filter((court) =>
      selectedCourtIdsArray.includes(court.id)
    );

    const hasCapacityIssue = selectedCourts?.some((court) => {
      const courtCapacity = (court as any).capacity || 10;
      return memberCount > courtCapacity;
    });

    if (hasCapacityIssue) {
      toast.error(
        `Member count exceeds court capacity. Please reduce the number of players or select different courts.`
      );
      return;
    }

    // Navigate to booking page with selected courts, time slots, and member count
    const timeSlotParams = selectedTimeSlots
      .map(
        (slot) =>
          `timeSlots[]=${encodeURIComponent(
            JSON.stringify({
              id: slot.id,
              courtId: slot.courtId,
              startTime: slot.startTime,
              endTime: slot.endTime,
              date: slot.date,
              price: slot.price,
            })
          )}`
      )
      .join("&");

    router.push(
      `/venues/${venue.id}/book?courtIds=${selectedCourtIds}&${timeSlotParams}&memberCount=${memberCount}`
    );
  };

  const handleCourtSelect = (courtId: string) => {
    const currentSelection = [...selectedCourtIdsArray];
    const isSelected = currentSelection.includes(courtId);

    if (isSelected) {
      // Remove court from selection
      const newSelection = currentSelection.filter((id) => id !== courtId);
      updateSelectedCourts(newSelection);
    } else {
      // Add court to selection
      const newSelection = [...currentSelection, courtId];
      updateSelectedCourts(newSelection);
    }

    // Reset time slots when court selection changes
    setSelectedTimeSlots([]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading venue details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (isError || !venue) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to venues
          </Button>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold mb-2">Venue not found</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "The venue you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => router.push("/venues")}>
              Browse All Venues
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    toast.success(
      isFavorited ? "Removed from favorites" : "Added to favorites"
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue.name,
          text: `Check out ${venue.name} on QuickCourt`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const images =
    venue?.photoUrls && venue.photoUrls.length > 0
      ? venue.photoUrls
      : ["/api/placeholder/800/600"]; // Fallback image

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to venues
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                {images[currentImageIndex] ? (
                  <Image
                    width={1800}
                    height={800}
                    src={images[currentImageIndex]}
                    alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <span className="text-4xl">🏟️</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={handleFavoriteToggle}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isFavorited
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Venue Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {venue.address}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{venue.rating}</span>
                    <span>({venue.reviewCount} reviews)</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{venue.description}</p>
              </div>

              {/* Sports */}
              <div>
                <h3 className="font-semibold mb-2">Available Sports</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.sports.map((sport) => (
                    <Badge key={sport} variant="secondary">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {venue.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity];
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm"
                      >
                        {Icon && (
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                        {amenity}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="courts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="courts">Courts & Pricing</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({venue.reviewCount})
                </TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
              </TabsList>

              <TabsContent value="courts" className="space-y-4">
                {venue.courts && venue.courts.length > 0 ? (
                  venue.courts.map((court) => (
                    <Card
                      key={court.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedCourtIdsArray.includes(court.id)
                          ? "ring-2 ring-primary ring-offset-2 shadow-lg"
                          : ""
                      }`}
                      onClick={() => handleCourtSelect(court.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedCourtIdsArray.includes(
                                  court.id
                                )}
                                onChange={() => handleCourtSelect(court.id)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <CardTitle className="text-lg truncate">
                                {court.name}
                              </CardTitle>
                              {selectedCourtIdsArray.includes(court.id) && (
                                <Badge variant="default" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="ml-6">
                              {court.courtType}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-bold">
                              <IndianRupee className="h-4 w-4" />
                              {court.pricePerHour}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              per hour
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  court.isActive ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              <span>
                                {court.isActive ? "Available" : "Unavailable"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>
                                Max {(court as any).capacity || 10} players
                              </span>
                            </div>
                          </div>

                          {court.features && court.features.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm">Features:</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {court.features.map((feature, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Capacity Warning */}
                          {memberCount > ((court as any).capacity || 10) && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                              <AlertCircle className="h-4 w-4" />
                              <span>
                                Exceeds capacity (
                                {(court as any).capacity || 10} max)
                              </span>
                            </div>
                          )}

                          <Button
                            variant={
                              selectedCourtIdsArray.includes(court.id)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="w-full"
                            disabled={!court.isActive}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCourtSelect(court.id);
                            }}
                          >
                            {selectedCourtIdsArray.includes(court.id)
                              ? "Selected"
                              : "Select Court"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏟️</div>
                    <h3 className="text-lg font-semibold mb-2">
                      No courts available
                    </h3>
                    <p className="text-muted-foreground">
                      This venue doesn't have any active courts at the moment.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {venue.reviews && venue.reviews.length > 0 ? (
                  venue.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.user.image || undefined} />
                            <AvatarFallback>
                              {review.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium">
                                  {review.user.name}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-muted-foreground">
                      Be the first to review this venue!
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Address</h4>
                        <p className="text-sm text-muted-foreground">
                          {venue.address}
                        </p>
                      </div>
                      {venue.owner.email && (
                        <div>
                          <h4 className="font-medium mb-1">Email</h4>
                          <p className="text-sm text-muted-foreground">
                            {venue.owner.email}
                          </p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium mb-1">Owner</h4>
                        <p className="text-sm text-muted-foreground">
                          {venue.owner.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Operating Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {venue.operatingHours &&
                      typeof venue.operatingHours === "object" ? (
                        Object.entries(
                          venue.operatingHours as Record<string, any>
                        ).map(([day, hours]) => {
                          // Convert 24-hour format to 12-hour format
                          const formatTime = (time: string) => {
                            if (!time || time === "N/A") return "N/A";

                            const [hourStr, minute] = time.split(":");
                            const hour = parseInt(hourStr);

                            if (hour === 0) return `12:${minute} AM`;
                            if (hour < 12) return `${hour}:${minute} AM`;
                            if (hour === 12) return `12:${minute} PM`;
                            return `${hour - 12}:${minute} PM`;
                          };

                          return (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}</span>
                              <span>
                                {hours?.isOpen
                                  ? `${formatTime(
                                      hours.openTime
                                    )} - ${formatTime(hours.closeTime)}`
                                  : "Closed"}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Operating hours not available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Book Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book Now</CardTitle>
                <CardDescription>
                  Reserve your spot at {venue.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">Starting from</div>
                  <div className="flex items-center justify-center gap-1 text-3xl font-bold text-primary">
                    <IndianRupee className="h-6 w-6" />
                    {venue.minPrice || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                  {venue.priceRange && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Range: {venue.priceRange}
                    </div>
                  )}
                </div>

                {/* Member Count Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Players
                  </label>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMemberCount(Math.max(1, memberCount - 1))
                      }
                      disabled={memberCount <= 1}
                      className="h-8 w-8 p-0"
                    >
                      -
                    </Button>
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        value={memberCount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const maxCapacity =
                            selectedCourtIdsArray.length > 0
                              ? Math.max(
                                  ...selectedCourtIdsArray.map((courtId) => {
                                    const court = venue?.courts?.find(
                                      (c) => c.id === courtId
                                    );
                                    return (court as any)?.capacity || 10;
                                  })
                                )
                              : 100; // Default max if no courts selected
                          setMemberCount(
                            Math.min(Math.max(1, value), maxCapacity)
                          );
                        }}
                        className="text-2xl font-bold text-center w-16 bg-transparent border-none outline-none"
                        min="1"
                        max="100"
                      />
                      <span className="text-xs text-muted-foreground">
                        {memberCount === 1 ? "player" : "players"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const maxCapacity =
                          selectedCourtIdsArray.length > 0
                            ? Math.max(
                                ...selectedCourtIdsArray.map((courtId) => {
                                  const court = venue?.courts?.find(
                                    (c) => c.id === courtId
                                  );
                                  return (court as any)?.capacity || 10;
                                })
                              )
                            : 100;
                        setMemberCount(Math.min(memberCount + 1, maxCapacity));
                      }}
                      className="h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                  {selectedCourtIdsArray.length > 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                      Max capacity:{" "}
                      {Math.max(
                        ...selectedCourtIdsArray.map((courtId) => {
                          const court = venue?.courts?.find(
                            (c) => c.id === courtId
                          );
                          return (court as any)?.capacity || 10;
                        })
                      )}{" "}
                      players for selected courts
                    </div>
                  )}
                  {selectedCourtIdsArray.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                      Select courts to see capacity limits
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                {(selectedCourtIdsArray.length > 0 ||
                  selectedTimeSlots.length > 0) && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                    <h4 className="font-medium text-sm">Current Selection</h4>
                    {selectedCourtIdsArray.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Courts:</span>{" "}
                        {selectedCourtIdsArray.length} selected
                      </div>
                    )}
                    {selectedTimeSlots.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Time Slots:</span>{" "}
                        {selectedTimeSlots.length} selected
                        {selectedTimeSlots.length <= 3 && (
                          <div className="mt-1 space-y-1">
                            {selectedTimeSlots.map((slot, index) => (
                              <div key={slot.id} className="text-xs">
                                {index + 1}. {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Players:</span>{" "}
                      {memberCount}
                    </div>
                    {selectedTimeSlots.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Total Cost:</span> ₹
                        {selectedTimeSlots.reduce(
                          (total, slot) => total + slot.price,
                          0
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Court Timing Display */}
            {selectedCourtIdsArray.length > 0 && venue && venue.courts && (
              <VenueTimingDisplay
                venueId={venue.id}
                venueName={venue.name}
                courts={venue.courts}
                selectedCourtIds={selectedCourtIdsArray}
                onTimeSlotsSelect={setSelectedTimeSlots}
                selectedTimeSlots={selectedTimeSlots}
              />
            )}

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-green-600 font-medium">Open now</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Usually busy 6-9 PM</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>Free parking available</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Venues Section */}
        <div className="mt-12 pt-8 border-t">
          <RelatedVenues currentVenueId={venue.id} limit={8} />
        </div>
      </main>
    </div>
  );
}
