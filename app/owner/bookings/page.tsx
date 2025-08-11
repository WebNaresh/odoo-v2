"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  RefreshCw,
  Download,
  User,
  MapPin,
  Clock,
  IndianRupee,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Grid3X3,
  List,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  venue: {
    id: string;
    name: string;
    address: string;
  };
  court: {
    id: string;
    name: string;
    type: string;
    pricePerHour: number;
  };
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface Venue {
  id: string;
  name: string;
  courts: {
    id: string;
    name: string;
  }[];
}

export default function OwnerBookingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  // Dialog state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchBookings = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });

        if (statusFilter && statusFilter !== "all")
          params.append("status", statusFilter);
        if (venueFilter && venueFilter !== "all")
          params.append("venueId", venueFilter);
        if (dateFilter) params.append("startDate", dateFilter);

        const response = await fetch(`/api/owner/bookings?${params}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBookings(data.bookings);
            setVenues(data.venues || []);
            setCurrentPage(data.pagination.page);
            setTotalPages(data.pagination.totalPages);
            setTotalBookings(data.pagination.total);
          } else {
            throw new Error(data.error || "Failed to fetch bookings");
          }
        } else {
          throw new Error("Failed to fetch bookings");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, venueFilter, dateFilter]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      setUpdating(bookingId);

      const response = await fetch("/api/owner/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the booking in the list
          setBookings((prev) =>
            prev.map((booking) =>
              booking.id === bookingId
                ? { ...booking, status: newStatus.toLowerCase() }
                : booking
            )
          );
          setDialogOpen(false);
        } else {
          throw new Error(data.error || "Failed to update booking");
        }
      } else {
        throw new Error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      setError("Failed to update booking. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "refunded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.customer.name.toLowerCase().includes(query) ||
        booking.venue.name.toLowerCase().includes(query) ||
        booking.court.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: totalBookings,
    pending: filteredBookings.filter(b => b.status.toLowerCase() === 'pending').length,
    confirmed: filteredBookings.filter(b => b.status.toLowerCase() === 'confirmed').length,
    completed: filteredBookings.filter(b => b.status.toLowerCase() === 'completed').length,
    cancelled: filteredBookings.filter(b => b.status.toLowerCase() === 'cancelled').length,
    totalRevenue: filteredBookings
      .filter(b => b.paymentStatus.toLowerCase() === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Booking Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage all bookings across your venues
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{stats.total} total bookings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>₹{stats.totalRevenue.toLocaleString()} revenue</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={viewMode === 'cards' ? 'bg-[#00884d] hover:bg-[#00a855]' : ''}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-[#00884d] hover:bg-[#00a855]' : ''}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBookings(currentPage)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline ml-2">Refresh</span>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
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
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                  <p className="text-xs text-gray-500">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00884d]/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#00884d]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50 border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Filters with Tabs */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#00884d]" />
                Filters & Search
              </CardTitle>

              {/* Status Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-5 sm:w-auto">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                  <TabsTrigger value="confirmed" className="text-xs">Confirmed</TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search customer, venue, court..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-gray-200 focus:border-[#00884d]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-[#00884d]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Venue</Label>
                <Select value={venueFilter} onValueChange={setVenueFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-[#00884d]">
                    <SelectValue placeholder="All venues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All venues</SelectItem>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border-gray-200 focus:border-[#00884d]"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || statusFilter !== 'all' || venueFilter !== 'all' || dateFilter) && (
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
                {venueFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-[#00884d]/10 text-[#00884d]">
                    Venue: {venues.find(v => v.id === venueFilter)?.name}
                  </Badge>
                )}
                {dateFilter && (
                  <Badge variant="secondary" className="bg-[#00884d]/10 text-[#00884d]">
                    Date: {new Date(dateFilter).toLocaleDateString()}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setVenueFilter('all');
                    setDateFilter('');
                    setActiveTab('all');
                  }}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Bookings Display */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Bookings ({totalBookings})</CardTitle>
                <CardDescription>
                  Showing {filteredBookings.length} of {totalBookings} bookings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {/* Cards View (Mobile-First) */}
                {viewMode === 'cards' && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBookings.map((booking) => (
                      <Card
                        key={booking.id}
                        className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setDialogOpen(true);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {/* Header with Status */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#00884d]/10 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-[#00884d]" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {booking.customer.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {booking.customer.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                                <Badge
                                  className={getPaymentStatusColor(booking.paymentStatus)}
                                >
                                  {booking.paymentStatus}
                                </Badge>
                              </div>
                            </div>

                            {/* Venue & Court Info */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                  <Calendar className="h-3 w-3 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{booking.venue.name}</p>
                                  <p className="text-xs text-gray-500">{booking.court.name} • {booking.court.type}</p>
                                </div>
                              </div>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">
                                    {new Date(booking.bookingDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#00884d]">₹{booking.totalPrice}</p>
                                <p className="text-xs text-gray-500">{booking.duration} min</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                  setDialogOpen(true);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                  setDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Table View (Desktop) */}
                {viewMode === 'table' && (
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Venue & Court</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#00884d]/10 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-[#00884d]" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {booking.customer.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {booking.customer.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{booking.venue.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {booking.court.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {booking.court.type}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {new Date(booking.bookingDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                                  {new Date(booking.endTime).toLocaleTimeString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {booking.duration} min
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">
                                  ₹{booking.totalPrice}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getPaymentStatusColor(
                                  booking.paymentStatus
                                )}
                              >
                                {booking.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchBookings(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchBookings(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter || venueFilter || dateFilter
                  ? "Try adjusting your filters to see more results."
                  : "No bookings have been made yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View and manage booking information
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedBooking.customer.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedBooking.customer.email}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Booking Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Venue:</span>{" "}
                      {selectedBooking.venue.name}
                    </p>
                    <p>
                      <span className="font-medium">Court:</span>{" "}
                      {selectedBooking.court.name}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedBooking.court.type}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Schedule</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(
                        selectedBooking.bookingDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {new Date(selectedBooking.startTime).toLocaleTimeString()}{" "}
                      - {new Date(selectedBooking.endTime).toLocaleTimeString()}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {selectedBooking.duration} minutes
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Payment</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Amount:</span> ₹
                      {selectedBooking.totalPrice}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <Badge
                        className={`ml-2 ${getPaymentStatusColor(
                          selectedBooking.paymentStatus
                        )}`}
                      >
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Update Status</h4>
                <div className="flex gap-2">
                  {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
                    (status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          selectedBooking.status.toUpperCase() === status
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleStatusUpdate(selectedBooking.id, status)
                        }
                        disabled={updating === selectedBooking.id}
                        style={
                          selectedBooking.status.toUpperCase() === status
                            ? { backgroundColor: "#00884d" }
                            : {}
                        }
                      >
                        {updating === selectedBooking.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : null}
                        {status}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
