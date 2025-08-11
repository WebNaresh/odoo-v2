"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";

// Mock venue data
const mockVenue = {
  id: 1,
  name: "Elite Sports Complex",
  location: "Downtown, Mumbai",
  address: "123 Sports Street, Downtown, Mumbai, Maharashtra 400001",
  rating: 4.8,
  reviewCount: 124,
  description: "Premier sports facility with state-of-the-art courts and amenities. Perfect for both casual players and serious athletes.",
  images: [
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
  ],
  amenities: ["Parking", "Changing Rooms", "Cafeteria", "WiFi", "Equipment Rental", "Shower", "Locker"],
  sports: ["Basketball", "Tennis", "Badminton", "Squash"],
  operatingHours: {
    weekdays: "6:00 AM - 11:00 PM",
    weekends: "6:00 AM - 12:00 AM",
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
      features: ["Professional flooring", "LED lighting", "Sound system"],
    },
    {
      id: "court-2",
      name: "Tennis Court A",
      sport: "Tennis",
      pricePerHour: 600,
      features: ["Clay surface", "Floodlights", "Ball machine available"],
    },
    {
      id: "court-3",
      name: "Badminton Court 1",
      sport: "Badminton",
      pricePerHour: 500,
      features: ["Wooden flooring", "Professional nets", "Shuttlecock included"],
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
      comment: "Excellent facility with great courts and amenities. Staff is very helpful and the booking process is smooth.",
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
      comment: "Good courts and clean facilities. Parking can be a bit crowded during peak hours but overall great experience.",
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
      comment: "Love playing here! The basketball court is professional grade and the lighting is perfect for evening games.",
      date: "2024-01-05",
      helpful: 15,
    },
  ],
};

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Parking": Car,
  "WiFi": Wifi,
  "Cafeteria": Coffee,
  "Changing Rooms": Users,
  "Equipment Rental": Users,
  "Shower": Users,
  "Locker": Users,
};

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const venue = mockVenue; // In real app, fetch based on params.id

  const handleBookNow = () => {
    router.push(`/venues/${venue.id}/book`);
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to venues
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                <div className="absolute inset-0 bg-muted" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={handleFavoriteToggle}
                  >
                    <Heart 
                      className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} 
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
                {venue.images.length > 1 && (
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
                  {venue.images.map((_, index) => (
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
                    {venue.location}
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
                      <div key={amenity} className="flex items-center gap-2 text-sm">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
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
                <TabsTrigger value="reviews">Reviews ({venue.reviewCount})</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
              </TabsList>

              <TabsContent value="courts" className="space-y-4">
                {venue.courts.map((court) => (
                  <Card key={court.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{court.name}</CardTitle>
                          <CardDescription>{court.sport}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-lg font-bold">
                            <IndianRupee className="h-4 w-4" />
                            {court.pricePerHour}
                          </div>
                          <div className="text-sm text-muted-foreground">per hour</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Features:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {court.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {venue.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.user.avatar} />
                          <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{review.user.name}</h4>
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
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-sm mb-2">{review.comment}</p>
                          <div className="text-xs text-muted-foreground">
                            {review.helpful} people found this helpful
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                        <p className="text-sm text-muted-foreground">{venue.address}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Phone</h4>
                        <p className="text-sm text-muted-foreground">{venue.contact.phone}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Email</h4>
                        <p className="text-sm text-muted-foreground">{venue.contact.email}</p>
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
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>{venue.operatingHours.weekdays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday - Sunday</span>
                        <span>{venue.operatingHours.weekends}</span>
                      </div>
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
                    500
                  </div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>
                
                <Button className="w-full" size="lg" onClick={handleBookNow}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
                
                <div className="text-center text-xs text-muted-foreground">
                  Free cancellation up to 2 hours before
                </div>
              </CardContent>
            </Card>

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
      </main>
    </div>
  );
}
