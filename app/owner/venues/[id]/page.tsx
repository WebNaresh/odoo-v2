"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
  Share2,
  Download,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Navigation,
} from "lucide-react";
import { AddCourtModal } from "@/components/courts/AddCourtModal";
import { CourtList } from "@/components/courts/CourtList";
import { VenueResubmissionButton } from "@/components/venues/VenueResubmissionButton";

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
  rejectionReason?: string;
  resubmissionCount: number;
  lastResubmissionAt?: string;
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
    pricePerHour: number;
    capacity: number;
    operatingHours: any;
    slotConfig?: any;
    excludedTimes?: any;
    slotDuration: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    venue?: {
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
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left side - Main info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <div className="w-16 h-16 bg-gradient-to-br from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{venue.address}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {getApprovalStatusBadge(venue.approvalStatus)}
                  <Badge variant={venue.isActive ? "default" : "secondary"} className={venue.isActive ? "bg-[#00884d] hover:bg-[#00a855]" : ""}>
                    {venue.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {venue.rating > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{venue.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({venue._count.reviews} reviews)</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{venue._count.courts} courts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{venue.sports?.length || 0} sports</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Since {new Date(venue.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Quick actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
              <Button
                onClick={() => router.push(`/owner/venues/${venueId}/edit`)}
                className="bg-[#00884d] hover:bg-[#00a855] flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Venue</span>
                <span className="sm:hidden">Edit</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Share</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Preview</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{venue._count.courts}</p>
                  <p className="text-xs text-gray-500">Courts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{venue.rating > 0 ? venue.rating.toFixed(1) : '0.0'}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{venue._count.reviews}</p>
                  <p className="text-xs text-gray-500">Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00884d]/10 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-[#00884d]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{venue.sports?.length || 0}</p>
                  <p className="text-xs text-gray-500">Sports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Action Bar */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="courts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Courts</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#00884d]" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">Description</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {venue.description || "No description provided"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900">
                        <MapPin className="h-4 w-4 text-[#00884d]" />
                        Location & Address
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 font-medium">{venue.address}</p>
                        {venue.location && (
                          <div className="flex items-center gap-2 mt-2">
                            <Navigation className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {venue.location.coordinates[1].toFixed(6)}, {venue.location.coordinates[0].toFixed(6)}
                            </p>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[#00884d]">
                              View on Map
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Amenities & Facilities</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {venue.amenities.length > 0 ? (
                          venue.amenities.map((amenity, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="justify-center py-2 border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                            >
                              {amenity}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm col-span-full">
                            No amenities listed
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <Trophy className="h-4 w-4 text-[#00884d]" />
                        Sports Available
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {venue.sports && venue.sports.length > 0 ? (
                          venue.sports.map((sport, index) => (
                            <Badge
                              key={index}
                              className="bg-[#00884d]/10 text-[#00884d] hover:bg-[#00884d]/20"
                            >
                              {sport}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No sports configured yet
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Resubmission Section - Only for rejected venues */}
                {venue.approvalStatus === "REJECTED" && (
                  <VenueResubmissionButton
                    venueId={venueId}
                    approvalStatus={venue.approvalStatus}
                    rejectionReason={venue.rejectionReason}
                  />
                )}

                {/* Operating Hours */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#00884d]" />
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formatOperatingHours(venue.operatingHours)}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                {venue.reviews.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-[#00884d]" />
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
                            <p className="text-sm text-gray-600">
                              {review.comment}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {venue._count.reviews > 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
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

                {/* Venue Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Venue Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <Badge variant={venue.isActive ? "default" : "secondary"} className={venue.isActive ? "bg-[#00884d]" : ""}>
                        {venue.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Approval</span>
                      {getApprovalStatusBadge(venue.approvalStatus)}
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm text-gray-500">Created</span>
                      <p className="text-sm font-medium">
                        {new Date(venue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <p className="text-sm font-medium">
                        {new Date(venue.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Venue ID</span>
                      <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">{venue.id}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Courts Tab */}
          <TabsContent value="courts" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#00884d]" />
                    Courts Management ({venue._count.courts})
                  </CardTitle>
                  <Button
                    onClick={() => setIsAddCourtModalOpen(true)}
                    className="bg-[#00884d] hover:bg-[#00a855]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Court
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CourtList
                  courts={venue.courts}
                  onCourtUpdated={handleCourtUpdated}
                  onCourtDeleted={handleCourtDeleted}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-[#00884d]" />
                    Photo Gallery ({venue.photoUrls.length})
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/owner/venues/${venueId}/edit`)}
                    className="border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {venue.photoUrls.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {venue.photoUrls.map((url, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <Image
                          src={url}
                          alt={`${venue.name} photo ${index + 1}`}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover transition-none"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Eye className="h-5 w-5 text-gray-700" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Click to enlarge
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-[#00884d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Camera className="h-10 w-10 text-[#00884d]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No photos uploaded yet</h3>
                    <p className="text-gray-600 mb-6">
                      Add photos to showcase your venue to potential customers
                    </p>
                    <Button
                      onClick={() => router.push(`/owner/venues/${venueId}/edit`)}
                      className="bg-[#00884d] hover:bg-[#00a855]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Photo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#00884d]" />
                    Venue Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Venue Status</p>
                      <p className="text-sm text-gray-500">Control venue visibility</p>
                    </div>
                    <Badge variant={venue.isActive ? "default" : "secondary"} className={venue.isActive ? "bg-[#00884d]" : ""}>
                      {venue.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Approval Status</p>
                      <p className="text-sm text-gray-500">Current approval state</p>
                    </div>
                    {getApprovalStatusBadge(venue.approvalStatus)}
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                      onClick={() => router.push(`/owner/venues/${venueId}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Venue Details
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/owner/venues/${venueId}/analytics`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Delete Venue</h4>
                      <p className="text-sm text-red-600 mb-4">
                        Permanently delete this venue and all associated data. This action cannot be undone.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
