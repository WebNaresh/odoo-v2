"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building2,
  Users,
  Star,
  Calendar,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

// Types for venue data
interface VenueOwner {
  id: string;
  name: string;
  email: string;
}

interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  sports: string[];
  amenities: string[];
  photoUrls: string[];
  operatingHours: any;
  approvalStatus: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: VenueOwner;
  courtsCount: number;
  reviewsCount: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "APPROVED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function ApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"APPROVED" | "REJECTED">(
    "APPROVED"
  );
  const [approvalNotes, setApprovalNotes] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch venues data
  const fetchVenues = async (status: string = "PENDING") => {
    try {
      setLoading(true);
      console.log("🔍 [ADMIN APPROVALS] Fetching venues with status:", status);

      const response = await fetch(`/api/admin/venues?status=${status}`);
      if (!response.ok) {
        throw new Error("Failed to fetch venues");
      }

      const data = await response.json();
      console.log("✅ [ADMIN APPROVALS] Fetched venues:", data.venues.length);
      setVenues(data.venues);
    } catch (error) {
      console.error("❌ [ADMIN APPROVALS] Error fetching venues:", error);
      toast.error("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  // Handle venue approval/rejection
  const handleApprovalAction = async () => {
    if (!selectedVenue) return;

    try {
      setProcessing(true);
      console.log(
        "🔍 [ADMIN APPROVALS] Processing action:",
        approvalAction,
        "for venue:",
        selectedVenue.id
      );

      const response = await fetch(
        `/api/admin/venues/${selectedVenue.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: approvalAction,
            notes: approvalNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process venue approval");
      }

      const data = await response.json();
      console.log("✅ [ADMIN APPROVALS] Action processed:", data);

      toast.success(`Venue ${approvalAction.toLowerCase()} successfully`);

      // Refresh the venues list
      await fetchVenues(statusFilter);

      // Close dialogs and reset state
      setIsApprovalDialogOpen(false);
      setSelectedVenue(null);
      setApprovalNotes("");
    } catch (error) {
      console.error("❌ [ADMIN APPROVALS] Error processing approval:", error);
      toast.error("Failed to process venue approval");
    } finally {
      setProcessing(false);
    }
  };

  // Load venues on component mount and when status filter changes
  useEffect(() => {
    fetchVenues(statusFilter);
  }, [statusFilter]);

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleApprovalActionDialog = (action: "APPROVED" | "REJECTED") => {
    setApprovalAction(action);
    setIsApprovalDialogOpen(true);
  };

  const VenueCard = ({ venue }: { venue: Venue }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              {venue.photoUrls && venue.photoUrls.length > 0 ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={venue.photoUrls[0]}
                    alt={venue.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{venue.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  {venue.location?.coordinates
                    ? `${venue.location.coordinates[1]?.toFixed(
                        4
                      )}, ${venue.location.coordinates[0]?.toFixed(4)}`
                    : "Location not available"}
                </div>
                <p className="text-sm text-muted-foreground">
                  Owner: {venue.owner.name}
                </p>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(venue.approvalStatus)}>
            {venue.approvalStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">Courts:</span>
            <p className="font-medium">{venue.courtsCount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Sports:</span>
            <p className="font-medium">{venue.sports.length}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Submitted:</span>
            <p className="font-medium">
              {new Date(venue.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Rating:</span>
            <p className="font-medium">
              {venue.rating > 0 ? `${venue.rating}/5` : "No ratings"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {venue.sports.slice(0, 3).map((sport: string) => (
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

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedVenue(venue);
              setIsDetailDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Review Details
          </Button>
          {venue.approvalStatus === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => {
                  setSelectedVenue(venue);
                  handleApprovalActionDialog("APPROVED");
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => {
                  setSelectedVenue(venue);
                  handleApprovalActionDialog("REJECTED");
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      title="Venue Approvals"
      description="Review and approve new venue registrations"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search venues, owners, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusFilter === "PENDING"
                  ? venues.length
                  : venues.filter((v) => v.approvalStatus === "PENDING").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusFilter === "APPROVED"
                  ? venues.length
                  : venues.filter((v) => v.approvalStatus === "APPROVED")
                      .length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusFilter === "REJECTED"
                  ? venues.length
                  : venues.filter((v) => v.approvalStatus === "REJECTED")
                      .length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Venues List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading venues...</span>
          </div>
        ) : filteredVenues.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No venues found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "PENDING"
                  ? "Try adjusting your search or filters"
                  : "No pending venue approvals at the moment"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Venue Review: {selectedVenue?.name}</DialogTitle>
              <DialogDescription>
                Complete venue details and documentation review
              </DialogDescription>
            </DialogHeader>

            {selectedVenue && (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Venue Details</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="owner">Owner Info</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{selectedVenue.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Location:
                          </span>
                          <p className="font-medium">
                            {selectedVenue.location?.coordinates
                              ? `${selectedVenue.location.coordinates[1]?.toFixed(
                                  4
                                )}, ${selectedVenue.location.coordinates[0]?.toFixed(
                                  4
                                )}`
                              : "Location not available"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Address:
                          </span>
                          <p className="font-medium">{selectedVenue.address}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge
                            className={getStatusColor(
                              selectedVenue.approvalStatus
                            )}
                          >
                            {selectedVenue.approvalStatus}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <p className="font-medium">
                            {new Date(
                              selectedVenue.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Venue Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Courts:</span>
                          <p className="font-medium">
                            {selectedVenue.courtsCount}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sports:</span>
                          <p className="font-medium">
                            {selectedVenue.sports.join(", ")}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rating:</span>
                          <p className="font-medium">
                            {selectedVenue.rating > 0
                              ? `${selectedVenue.rating}/5 (${selectedVenue.reviewCount} reviews)`
                              : "No ratings yet"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Amenities:
                          </span>
                          <p className="font-medium">
                            {selectedVenue.amenities.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedVenue.description}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Venue Photos</h4>
                    {selectedVenue.photoUrls &&
                    selectedVenue.photoUrls.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedVenue.photoUrls.map(
                          (photo: string, index: number) => (
                            <div
                              key={index}
                              className="relative aspect-video rounded-lg overflow-hidden"
                            >
                              <Image
                                src={photo}
                                alt={`${selectedVenue.name} photo ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No photos uploaded
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="owner" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">
                            {selectedVenue.owner.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium">
                            {selectedVenue.owner.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Venue Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Total Courts:
                          </span>
                          <p className="font-medium">
                            {selectedVenue.courtsCount}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Reviews:
                          </span>
                          <p className="font-medium">
                            {selectedVenue.reviewsCount}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Active Status:
                          </span>
                          <p className="font-medium">
                            {selectedVenue.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {selectedVenue?.approvalStatus === "PENDING" && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => handleApprovalActionDialog("APPROVED")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Venue
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleApprovalActionDialog("REJECTED")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Venue
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approval Action Dialog */}
        <Dialog
          open={isApprovalDialogOpen}
          onOpenChange={setIsApprovalDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {approvalAction === "APPROVED" ? "Approve" : "Reject"} Venue
              </DialogTitle>
              <DialogDescription>
                {approvalAction === "APPROVED"
                  ? "This venue will be approved and made available on the platform. The owner will receive an email notification."
                  : "This venue will be rejected and the owner will be notified with your feedback."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {approvalAction === "APPROVED" ? "Approval" : "Rejection"}{" "}
                  Notes {approvalAction === "REJECTED" && "(Required)"}
                </label>
                <Textarea
                  placeholder={
                    approvalAction === "APPROVED"
                      ? "Add congratulatory notes or next steps..."
                      : "Explain the reason for rejection..."
                  }
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="mt-1"
                  required={approvalAction === "REJECTED"}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The venue owner will be notified via email about this decision
                  with your notes included.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsApprovalDialogOpen(false)}
                className="flex-1"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprovalAction}
                disabled={
                  processing ||
                  (approvalAction === "REJECTED" && !approvalNotes.trim())
                }
                className={`flex-1 ${
                  approvalAction === "REJECTED"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${
                    approvalAction === "APPROVED" ? "Approve" : "Reject"
                  } Venue`
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
