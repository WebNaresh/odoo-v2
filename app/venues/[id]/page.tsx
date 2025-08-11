"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useSession } from "next-auth/react";
import { useRazorpay } from "@/hooks/useRazorpay";
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
  const { data: session, status } = useSession();
  const { processPayment, restoreBodyPointerEvents } = useRazorpay();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Direct payment - no booking dialog state needed

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

  // Debug time slot selection changes
  useEffect(() => {
    console.log("🔄 [VENUE PAGE] selectedTimeSlots changed:", {
      count: selectedTimeSlots.length,
      slots: selectedTimeSlots.map((s) => ({
        id: s.id,
        courtId: s.courtId,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    });
  }, [selectedTimeSlots]);

  // Direct payment - no queue management needed

  // State for member count
  const [memberCount, setMemberCount] = useState(1);

  // Handle direct payment without booking dialog
  const handleDirectPayment = async (
    timeSlots: {
      id: string;
      courtId: string;
      startTime: string;
      endTime: string;
      date: string;
      price: number;
    }[]
  ) => {
    if (!venue || !session?.user) {
      toast.error("Please log in to book a venue");
      return;
    }

    console.log(
      "🚀 [VENUE PAGE] Starting direct Razorpay payment for",
      timeSlots.length,
      "slots"
    );

    try {
      // Process each slot individually for now (can be enhanced for bulk processing)
      for (let i = 0; i < timeSlots.length; i++) {
        const timeSlot = timeSlots[i];
        const court = venue.courts?.find((c) => c.id === timeSlot.courtId);

        if (!court) {
          toast.error(`Court not found for slot ${timeSlot.startTime}`);
          return;
        }

        // Validation: Check member count against court capacity
        const courtCapacity = (court as any).capacity || 10;
        if (memberCount > courtCapacity) {
          toast.error(
            `Member count exceeds court capacity (${courtCapacity} max) for ${court.name}. Please reduce the number of players.`
          );
          return;
        }

        console.log(
          `💳 [VENUE PAGE] Processing payment ${i + 1}/${
            timeSlots.length
          } for slot:`,
          {
            slotId: timeSlot.id,
            courtName: court.name,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          }
        );

        // Process payment directly
        await processPayment(
          {
            timeSlotId: timeSlot.id,
            courtId: timeSlot.courtId,
            playerCount: memberCount,
            venueName: venue.name,
            courtName: court.name,
            notes: `Booking for ${court.name} at ${venue.name}`,
          },
          {
            name: session.user.name || "User",
            email: session.user.email || "",
            contact: undefined, // Phone number not available in session
          },
          // Payment success callback
          (paymentResult) => {
            console.log(
              "✅ [VENUE PAGE] Payment successful, booking created:",
              paymentResult
            );
            toast.success(
              `Payment successful! Booking confirmed for ${court.name}. Redirecting to your bookings...`
            );

            // Reset selections after successful payment
            setSelectedTimeSlots([]);
            setSelectedCourtIds("");

            // Refetch venue details and time slot availability
            console.log(
              "🔄 [VENUE PAGE] Refetching venue details and time slot availability"
            );
            refetchVenueDetails();

            // Also refetch time slots to update availability immediately
            if (
              typeof window !== "undefined" &&
              (window as any).refetchTimeSlots
            ) {
              console.log("🔄 [VENUE PAGE] Refetching time slot availability");
              (window as any).refetchTimeSlots();
            }

            // Redirect to bookings page after successful payment
            setTimeout(() => {
              console.log("🔄 [VENUE PAGE] Redirecting to bookings page");
              router.push('/bookings');
            }, 2000); // 2 second delay to show success message
          },
          // Payment failure callback
          (error) => {
            console.error("❌ [VENUE PAGE] Payment failed:", error);
            toast.error("Payment failed. Please try again.");
          }
        );

        // For multiple slots, add a small delay between payments
        if (i < timeSlots.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error("❌ [VENUE PAGE] Direct payment error:", error);
      toast.error("Payment process failed. Please try again.");
    }
  };

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
    refetch: refetchVenueDetails,
  } = useVenueDetails(params.id as string);

  const venue = venueResponse?.success ? venueResponse.venue : null;

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
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Enhanced Back Button */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="outline"
            className="border-[#00884d]/20 text-[#00884d] bg-white shadow-sm"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to venues
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Enhanced Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Enhanced Image Gallery */}
            <Card className="overflow-hidden border-0 shadow-lg bg-white">
              <div className="relative aspect-video sm:aspect-[16/10] lg:aspect-video">
                {images[currentImageIndex] ? (
                  <Image
                    width={1800}
                    height={800}
                    src={images[currentImageIndex]}
                    alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">🏟️</span>
                      <p className="text-gray-500 font-medium">No image available</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/95 border-0 shadow-lg backdrop-blur-sm"
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
                    className="bg-white/95 border-0 shadow-lg backdrop-blur-sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                {/* Enhanced Image Navigation */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 border-0 shadow-lg backdrop-blur-sm"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 border-0 shadow-lg backdrop-blur-sm"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Enhanced Image Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          index === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
            </Card>

            {/* Enhanced Venue Info */}
            <Card className="border-0 shadow-lg bg-white p-6 lg:p-8">
              <div className="space-y-6">
                {/* Header Section */}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {venue.name}
                  </h1>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-5 h-5 bg-[#00884d]/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-3 w-3 text-[#00884d]" />
                      </div>
                      <span className="text-sm sm:text-base font-medium">{venue.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">{venue.rating}</span>
                        <span className="text-sm text-gray-600">({venue.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                    {venue.description}
                  </p>
                </div>

                {/* Sports Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#00884d]/10 rounded-lg flex items-center justify-center">
                      <span className="text-[#00884d] text-sm">🏃</span>
                    </div>
                    Available Sports
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {venue.sports.map((sport) => (
                      <Badge
                        key={sport}
                        className="bg-[#00884d]/10 text-[#00884d] border-[#00884d]/20 px-4 py-2 text-sm font-semibold"
                      >
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Amenities Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#00884d]/10 rounded-lg flex items-center justify-center">
                      <span className="text-[#00884d] text-sm">✨</span>
                    </div>
                    Amenities & Facilities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venue.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity];
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            {Icon ? (
                              <Icon className="h-4 w-4 text-[#00884d]" />
                            ) : (
                              <span className="text-[#00884d] text-sm">•</span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Enhanced Tabs */}
            <Card className="border-0 shadow-lg bg-white">
              <Tabs defaultValue="courts" className="w-full">
                <div className="border-b border-gray-100 px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-xl">
                    <TabsTrigger
                      value="courts"
                      className="data-[state=active]:bg-white data-[state=active]:text-[#00884d] data-[state=active]:shadow-sm font-semibold"
                    >
                      Courts & Pricing
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-white data-[state=active]:text-[#00884d] data-[state=active]:shadow-sm font-semibold"
                    >
                      Reviews ({venue.reviewCount})
                    </TabsTrigger>
                    <TabsTrigger
                      value="info"
                      className="data-[state=active]:bg-white data-[state=active]:text-[#00884d] data-[state=active]:shadow-sm font-semibold"
                    >
                      Information
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="courts" className="p-6 space-y-6">
                  {venue.courts && venue.courts.length > 0 ? (
                    <div className="space-y-4">
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Select Courts</h3>
                        <p className="text-gray-600 text-sm">Choose one or more courts to view available time slots</p>
                      </div>

                      {venue.courts.map((court) => (
                        <Card
                          key={court.id}
                          className={`cursor-pointer border-2 ${
                            selectedCourtIdsArray.includes(court.id)
                              ? "border-[#00884d] bg-[#00884d]/5 shadow-lg"
                              : "border-gray-200 bg-white"
                          }`}
                          onClick={() => handleCourtSelect(court.id)}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={selectedCourtIdsArray.includes(court.id)}
                                      onChange={() => handleCourtSelect(court.id)}
                                      className="h-5 w-5 text-[#00884d] focus:ring-[#00884d] border-gray-300 rounded"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div>
                                    <CardTitle className="text-xl font-bold text-gray-900">
                                      {court.name}
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 font-medium mt-1">
                                      {court.courtType}
                                    </CardDescription>
                                  </div>
                                  {selectedCourtIdsArray.includes(court.id) && (
                                    <Badge className="bg-[#00884d] text-white border-0 ml-auto">
                                      ✓ Selected
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="text-right ml-4">
                                <div className="flex items-center gap-1 text-2xl font-bold text-[#00884d]">
                                  <IndianRupee className="h-5 w-5" />
                                  {court.pricePerHour}
                                </div>
                                <div className="text-sm text-gray-500 font-medium">
                                  per hour
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                    court.isActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}>
                                    <span className={`w-2 h-2 rounded-full ${
                                      court.isActive ? "bg-green-500" : "bg-red-500"
                                    }`} />
                                    {court.isActive ? "Available" : "Unavailable"}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                  <Users className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Max {(court as any).capacity || 10} players
                                  </span>
                                </div>
                              </div>

                              {court.features && court.features.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Court Features:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {court.features.map((feature, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="border-[#00884d]/20 text-[#00884d] bg-[#00884d]/5 text-xs"
                                      >
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Enhanced Capacity Warning */}
                              {memberCount > ((court as any).capacity || 10) && (
                                <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
                                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">Capacity Exceeded</p>
                                    <p className="text-xs text-red-600">
                                      This court has a maximum capacity of {(court as any).capacity || 10} players
                                    </p>
                                  </div>
                                </div>
                              )}

                              <Button
                                variant={selectedCourtIdsArray.includes(court.id) ? "default" : "outline"}
                                size="lg"
                                className={`w-full font-semibold ${
                                  selectedCourtIdsArray.includes(court.id)
                                    ? "bg-[#00884d] text-white"
                                    : "border-[#00884d] text-[#00884d]"
                                }`}
                                disabled={!court.isActive}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCourtSelect(court.id);
                                }}
                              >
                                {selectedCourtIdsArray.includes(court.id)
                                  ? "✓ Court Selected"
                                  : "Select This Court"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <span className="text-4xl">🏟️</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          No courts available
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          This venue doesn't have any active courts at the moment. Please check back later or contact the venue directly.
                        </p>
                      </div>
                    )}
                </TabsContent>

                <TabsContent value="reviews" className="p-6 space-y-6">
                  {venue.reviews && venue.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {venue.reviews.map((review) => (
                        <Card key={review.id} className="border-0 shadow-sm bg-gray-50">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                <AvatarImage src={review.user.image || undefined} />
                                <AvatarFallback className="bg-[#00884d] text-white font-bold">
                                  {review.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-bold text-gray-900">
                                      {review.user.name}
                                    </h4>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full mt-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < review.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500 font-medium">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">💬</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Be the first to review this venue and help other players make informed decisions!
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="info" className="p-6 space-y-6">
                  <Card className="border-0 shadow-sm bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#00884d]/10 rounded-lg flex items-center justify-center">
                          <Phone className="h-4 w-4 text-[#00884d]" />
                        </div>
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                            <p className="text-gray-600 leading-relaxed">
                              {venue.address}
                            </p>
                          </div>
                        </div>

                        {venue.owner.email && (
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Mail className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                              <p className="text-gray-600">
                                {venue.owner.email}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Venue Owner</h4>
                            <p className="text-gray-600">
                              {venue.owner.name}
                            </p>
                          </div>
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
          </Card>
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
                onBookingRequest={(timeSlots) => {
                  console.log(
                    "🎯 [VENUE PAGE] Received direct payment request from VenueTimingDisplay:",
                    timeSlots
                  );
                  // Set the selected time slots and trigger direct Razorpay payment
                  setSelectedTimeSlots(timeSlots);
                  // Trigger direct payment process
                  setTimeout(() => {
                    handleDirectPayment(timeSlots);
                  }, 100);
                }}
                onRefetchAvailability={() => {
                  console.log(
                    "🔄 [VENUE PAGE] Refetching time slot availability"
                  );
                  // This will be called by the VenueTimingDisplay component
                  // The actual refetch function will be set by the component
                }}
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

      {/* Direct Razorpay payment - no booking dialog needed */}
    </div>
  );
}
