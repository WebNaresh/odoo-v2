"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Star,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { type Venue } from "@/types/venue";

export default function VenuesPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("/api/owner/venues");
        const data = await response.json();

        if (data.success) {
          setVenues(data.venues);
        } else {
          toast.error("Failed to load venues");
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Failed to load venues");
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Filter venues based on search query
  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleViewVenue = (venueId: string) => {
    router.push(`/owner/venues/${venueId}`);
  };

  const handleEditVenue = (venueId: string) => {
    router.push(`/owner/venues/${venueId}/edit`);
  };

  const handleDeleteVenue = async (venueId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this venue? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/owner/venues/${venueId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Venue deleted successfully");
        setVenues(venues.filter((venue) => venue.id !== venueId));
      } else {
        toast.error(data.error || "Failed to delete venue");
      }
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Failed to delete venue");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading venues...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              My Venues
            </h1>
            <p className="text-muted-foreground">
              Manage your sports venues and track their performance
            </p>
          </div>

          <Button
            onClick={() => router.push("/owner/venues/new")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Venue
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Venues Grid */}
        {filteredVenues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {venues.length === 0 ? "No venues yet" : "No venues found"}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {venues.length === 0
                  ? "Get started by adding your first sports venue"
                  : "Try adjusting your search criteria"}
              </p>
              {venues.length === 0 && (
                <Button
                  onClick={() => router.push("/owner/venues/new")}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Venue
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <Card
                key={venue.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {venue.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {venue.address}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewVenue(venue.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditVenue(venue.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteVenue(venue.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(venue.approvalStatus)}>
                      {venue.approvalStatus}
                    </Badge>
                    {venue.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {venue.rating}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({venue.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                {/* Venue Image */}
                <div className="px-6 pb-4">
                  <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
                    {venue.photoUrls && venue.photoUrls.length > 0 ? (
                      <Image
                        src={venue.photoUrls[0]}
                        alt={venue.name}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Building2 className="h-12 w-12 text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="pt-0">
                  {venue.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {venue.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sports:</span>
                      <span className="font-medium">
                        {venue.sports?.length || 0} sports
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Courts:</span>
                      <span className="font-medium">
                        {(venue as any)._count?.courts || 0} courts
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {venue.sports?.slice(0, 3).map((sport) => (
                        <Badge
                          key={sport}
                          variant="secondary"
                          className="text-xs"
                        >
                          {sport}
                        </Badge>
                      ))}
                      {venue.sports && venue.sports.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{venue.sports.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewVenue(venue.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditVenue(venue.id)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
