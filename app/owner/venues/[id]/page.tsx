"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Users,
  Star,
  Edit,
  Trash2,
  Plus,
  Calendar,
  BarChart3,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Trophy,
} from "lucide-react";
import { AddCourtModal } from "@/components/courts/AddCourtModal";
import { CourtList } from "@/components/courts/CourtList";

interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  amenities: string[];
  sports: string[];
  photoUrls: string[];
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  isActive: boolean;
  rating: number;
  reviewCount: number;
  operatingHours: {
    [key: string]: {
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  _count: {
    courts: number;
    reviews: number;
  };
  courts: Array<{
    id: string;
    name: string;
    courtType: string;
    venueId: string;
    sportId: string;
    pricePerHour: number;
    operatingHours: any;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    venue?: {
      id: string;
      name: string;
    };
    sport?: {
      id: string;
      name: string;
    };
    _count?: {
      bookings: number;
      timeSlots: number;
    };
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      name: string;
    };
  }>;
}

export default function VenueDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Court management state
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false);
  const [courtsRefreshKey, setCourtsRefreshKey] = useState(0);

  // Fetch venue details
  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        console.log(
          "🔍 [VENUE DETAILS] Fetching venue details for ID:",
          venueId
        );
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/owner/venues/${venueId}`);
        const data = await response.json();

        console.log("📋 [VENUE DETAILS] API response:", data);

        if (data.success) {
          setVenue(data.venue);
          console.log("✅ [VENUE DETAILS] Venue details loaded successfully");
        } else {
          console.log("❌ [VENUE DETAILS] Failed to fetch venue:", data.error);
          setError(data.error || "Failed to fetch venue details");
        }
      } catch (error) {
        console.error("💥 [VENUE DETAILS] Error fetching venue:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (venueId) {
      fetchVenueDetails();
    }
  }, [venueId]);

  // Handle venue deletion
  const handleDeleteVenue = async () => {
    try {
      console.log(
        "🗑️ [VENUE DETAILS] Starting venue deletion for ID:",
        venueId
      );
      setIsDeleting(true);

      const response = await fetch(`/api/owner/venues/${venueId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log("📋 [VENUE DETAILS] Delete response:", data);

      if (data.success) {
        console.log("✅ [VENUE DETAILS] Venue deleted successfully");
        toast.success("Venue deleted successfully!");
        router.push("/owner/venues");
      } else {
        console.log("❌ [VENUE DETAILS] Failed to delete venue:", data.error);
        toast.error(data.error || "Failed to delete venue");
      }
    } catch (error) {
      console.error("💥 [VENUE DETAILS] Error deleting venue:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get approval status styling
  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  // Format operating hours
  const formatOperatingHours = (hours: Venue["operatingHours"]) => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return days.map((day, index) => {
      const dayHours = hours[day];
      return (
        <div key={day} className="flex justify-between items-center py-1">
          <span className="font-medium text-sm">{dayNames[index]}</span>
          <span className="text-sm text-muted-foreground">
            {dayHours?.isOpen
              ? `${dayHours.openTime} - ${dayHours.closeTime}`
              : "Closed"}
          </span>
        </div>
      );
    });
  };

  // Court management functions
  const handleCourtAdded = () => {
    // Refresh venue data to update court count and list
    setCourtsRefreshKey((prev) => prev + 1);
    // Re-fetch venue details to update court count
    const fetchVenueDetails = async () => {
      try {
        const response = await fetch(`/api/owner/venues/${venueId}`);
        const data = await response.json();
        if (data.success) {
          setVenue(data.venue);
        }
      } catch (error) {
        console.error("Error refreshing venue details:", error);
      }
    };
    fetchVenueDetails();
  };

  const handleCourtUpdated = () => {
    // Refresh venue data
    handleCourtAdded();
  };

  const handleCourtDeleted = () => {
    // Refresh venue data
    handleCourtAdded();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading venue details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Venue Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error ||
                  "The venue you're looking for doesn't exist or you don't have permission to view it."}
              </p>
              <Button onClick={() => router.push("/owner/venues")}>
                Go to Venues
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{venue.name}</h1>
              <p className="text-muted-foreground">
                Venue Details & Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getApprovalStatusBadge(venue.approvalStatus)}
            <Badge variant={venue.isActive ? "default" : "secondary"}>
              {venue.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => router.push(`/owner/venues/${venueId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Venue
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/owner/venues/${venueId}/courts`)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Manage Courts ({venue._count.courts})
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/owner/venues/${venueId}/bookings`)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            View Bookings
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/owner/venues/${venueId}/analytics`)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Venue
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{venue.name}"? This action
                  cannot be undone. All associated courts, bookings, and reviews
                  will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteVenue}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Venue"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Description</h3>
                  <p className="text-muted-foreground">
                    {venue.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h3>
                  <p className="text-muted-foreground">{venue.address}</p>
                  {venue.location && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Coordinates: {venue.location.coordinates[1]},{" "}
                      {venue.location.coordinates[0]}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.length > 0 ? (
                      venue.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No amenities listed
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Sports Available
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {venue.sports && venue.sports.length > 0 ? (
                      venue.sports.map((sport, index) => (
                        <Badge key={index} variant="secondary">
                          {sport}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No sports configured yet
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                {venue.photoUrls.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {venue.photoUrls.map((url, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={url}
                          alt={`${venue.name} photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(url, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No photos uploaded yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        router.push(`/owner/venues/${venueId}/edit`)
                      }
                    >
                      Add Photos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Courts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Courts ({venue._count.courts})
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsAddCourtModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Court
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourtList
                  courts={venue.courts}
                  onCourtUpdated={handleCourtUpdated}
                  onCourtDeleted={handleCourtDeleted}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Courts
                  </span>
                  <span className="font-semibold">{venue._count.courts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Reviews
                  </span>
                  <span className="font-semibold">{venue._count.reviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Average Rating
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {venue.rating > 0
                        ? venue.rating.toFixed(1)
                        : "No ratings"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={venue.isActive ? "default" : "secondary"}>
                    {venue.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Approval
                  </span>
                  {getApprovalStatusBadge(venue.approvalStatus)}
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatOperatingHours(venue.operatingHours)}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            {venue.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Recent Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venue.reviews.slice(0, 3).map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-3 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {review.user.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {venue._count.reviews > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          router.push(`/owner/venues/${venueId}/reviews`)
                        }
                      >
                        View All Reviews ({venue._count.reviews})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Venue Info */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Created</span>
                  <p className="text-sm font-medium">
                    {new Date(venue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Last Updated
                  </span>
                  <p className="text-sm font-medium">
                    {new Date(venue.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Venue ID
                  </span>
                  <p className="text-sm font-mono">{venue.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Court Modal */}
        <AddCourtModal
          isOpen={isAddCourtModalOpen}
          onClose={() => setIsAddCourtModalOpen(false)}
          venueId={venueId}
          onCourtAdded={handleCourtAdded}
        />
      </div>
    </div>
  );
}
