"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  BarChart3,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { type Venue } from "@/types/venue";
import { useOwnerVenues, useDeleteVenue } from "@/hooks/use-owner-venues";

export default function VenuesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState("name");

  // Use React Query for data fetching
  const { data: venuesResponse, isLoading, isError, error } = useOwnerVenues();

  // Use React Query mutation for deleting venues
  const deleteVenueMutation = useDeleteVenue();

  // Extract venues from response
  const venues = venuesResponse?.success ? venuesResponse.venues : [];

  // Filter and sort venues
  const filteredVenues = venues
    .filter((venue: Venue) => {
      const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || venue.approvalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a: Venue, b: Venue) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.approvalStatus.localeCompare(b.approvalStatus);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: venues.length,
    approved: venues.filter((v: Venue) => v.approvalStatus === 'APPROVED').length,
    pending: venues.filter((v: Venue) => v.approvalStatus === 'PENDING').length,
    rejected: venues.filter((v: Venue) => v.approvalStatus === 'REJECTED').length,
    totalCourts: venues.reduce((sum: number, v: Venue) => sum + ((v as any)._count?.courts || 0), 0),
    averageRating: venues.length > 0
      ? venues.reduce((sum: number, v: Venue) => sum + (v.rating || 0), 0) / venues.length
      : 0,
  };

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
      await deleteVenueMutation.mutateAsync(venueId);
      toast.success("Venue deleted successfully");
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Failed to delete venue");
    }
  };

  // Handle loading state
  if (isLoading) {
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

  // Handle error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load venues
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Venues
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your sports venues and track their performance
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{stats.total} venues</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>{stats.totalCourts} courts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{stats.averageRating.toFixed(1)} avg rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#00884d] hover:bg-[#00a855]' : ''}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#00884d] hover:bg-[#00a855]' : ''}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>

              <Button
                onClick={() => router.push("/owner/venues/new")}
                className="bg-[#00884d] hover:bg-[#00a855] flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add New Venue</span>
                <span className="sm:hidden">Add Venue</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total Venues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00884d]/10 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#00884d]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#00884d]" />
                Search & Filter
              </CardTitle>

              {/* Status Tabs */}
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="APPROVED" className="text-xs">Approved</TabsTrigger>
                  <TabsTrigger value="PENDING" className="text-xs">Pending</TabsTrigger>
                  <TabsTrigger value="REJECTED" className="text-xs">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search venues by name or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-gray-200 focus:border-[#00884d]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-[#00884d]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-gray-200 focus:border-[#00884d]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="rating">Rating (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || statusFilter !== 'all' || sortBy !== 'name') && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="bg-[#00884d]/10 text-[#00884d]">
                    Search: {searchQuery}
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-[#00884d]/10 text-[#00884d]">
                    Status: {statusFilter}
                  </Badge>
                )}
                {sortBy !== 'name' && (
                  <Badge variant="secondary" className="bg-[#00884d]/10 text-[#00884d]">
                    Sort: {sortBy}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSortBy('name');
                  }}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Venues Display */}
        {filteredVenues.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-[#00884d]/10 rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-10 w-10 text-[#00884d]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {venues.length === 0 ? "No venues yet" : "No venues found"}
              </h3>
              <p className="text-gray-600 text-center mb-8 max-w-md">
                {venues.length === 0
                  ? "Get started by adding your first sports venue and start accepting bookings from customers"
                  : "Try adjusting your search criteria or filters to find the venues you're looking for"}
              </p>
              {venues.length === 0 && (
                <Button
                  onClick={() => router.push("/owner/venues/new")}
                  className="bg-[#00884d] hover:bg-[#00a855] flex items-center gap-2 px-6 py-3"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Venue
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Venues ({filteredVenues.length})
                </CardTitle>
                <div className="text-sm text-gray-500">
                  Showing {filteredVenues.length} of {venues.length} venues
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredVenues.map((venue) => (
                    <Card
                      key={venue.id}
                      className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1 group-hover:text-[#00884d] transition-colors">
                              {venue.name}
                            </CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{venue.address}</span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                            {venue.approvalStatus === 'APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {venue.approvalStatus === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                            {venue.approvalStatus === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
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

                      {/* Enhanced Venue Image */}
                      <div className="px-6 pb-4">
                        <div className="w-full h-48 bg-muted rounded-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-200">
                          {venue.photoUrls && venue.photoUrls.length > 0 ? (
                            <Image
                              src={venue.photoUrls[0]}
                              alt={venue.name}
                              width={400}
                              height={192}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#00884d]/10">
                              <Building2 className="h-12 w-12 text-[#00884d]" />
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
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                <TrendingUp className="h-3 w-3 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{venue.sports?.length || 0}</p>
                                <p className="text-xs text-gray-500">Sports</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                <BarChart3 className="h-3 w-3 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{(venue as any)._count?.courts || 0}</p>
                                <p className="text-xs text-gray-500">Courts</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-3">
                            {venue.sports?.slice(0, 3).map((sport) => (
                              <Badge
                                key={sport}
                                variant="secondary"
                                className="text-xs bg-[#00884d]/10 text-[#00884d]"
                              >
                                {sport}
                              </Badge>
                            ))}
                            {venue.sports && venue.sports.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                +{venue.sports.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                            onClick={() => handleViewVenue(venue.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
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

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredVenues.map((venue) => (
                    <Card
                      key={venue.id}
                      className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Image */}
                          <div className="w-full md:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {venue.photoUrls && venue.photoUrls.length > 0 ? (
                              <Image
                                src={venue.photoUrls[0]}
                                alt={venue.name}
                                width={192}
                                height={128}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#00884d]/10">
                                <Building2 className="h-8 w-8 text-[#00884d]" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-semibold group-hover:text-[#00884d] transition-colors">
                                  {venue.name}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {venue.address}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(venue.approvalStatus)}>
                                  {venue.approvalStatus}
                                </Badge>
                                {venue.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">{venue.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {venue.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {venue.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                  <span>{venue.sports?.length || 0} sports</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="h-4 w-4 text-green-600" />
                                  <span>{(venue as any)._count?.courts || 0} courts</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewVenue(venue.id)}
                                  className="border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditVenue(venue.id)}
                                  className="border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
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
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
