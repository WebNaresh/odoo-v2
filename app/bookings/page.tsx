"use client";

import { useState } from "react";
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
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  IndianRupee,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  RefreshCw,
  Star,
  Phone,
  Mail,
  Navigation,
  CreditCard,
  Trophy,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserBookings, useCancelBooking, formatBookingForDisplay } from "@/hooks/use-bookings";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BookingsPage() {
  const { data: bookings, isLoading, isError, error, refetch } = useUserBookings();
  const cancelBookingMutation = useCancelBooking();
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success("Bookings refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh bookings");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingBookingId(bookingId);
    try {
      await cancelBookingMutation.mutateAsync({
        bookingId,
        cancellationReason: "Cancelled by user",
      });
      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00884d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-8 w-8 animate-spin text-[#00884d]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading your bookings</h3>
              <p className="text-gray-600">Please wait while we fetch your booking history...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Failed to load bookings</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error instanceof Error ? error.message : "There was an error loading your bookings. Please try again."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#00884d] text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/venues"}
                className="border-[#00884d] text-[#00884d]"
              >
                Browse Venues
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formattedBookings = bookings?.map(formatBookingForDisplay) || [];

  // Filter bookings based on search and status
  const filteredBookings = formattedBookings.filter(booking => {
    const matchesSearch = searchQuery === "" ||
      booking.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.courtName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const upcomingBookings = filteredBookings.filter(b => b.isUpcoming);
  const pastBookings = filteredBookings.filter(b => !b.isUpcoming);

  // Calculate statistics
  const totalBookings = formattedBookings.length;
  const completedBookings = formattedBookings.filter(b => b.status === "COMPLETED").length;
  const totalSpent = formattedBookings
    .filter(b => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
                <p className="text-gray-600 text-lg">
                  Manage your venue bookings and view booking history
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    <span>{totalBookings} total bookings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{completedBookings} completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    <span>₹{totalSpent.toLocaleString()} spent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-[#00884d]/20 text-[#00884d]"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button
                onClick={() => window.location.href = "/venues"}
                className="bg-[#00884d] text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Book New Venue
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        {formattedBookings.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by venue or court name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base border-gray-200 focus:border-[#00884d] rounded-xl"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12 border-gray-200 focus:border-[#00884d] rounded-xl">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="CONFIRMED">✅ Confirmed</SelectItem>
                  <SelectItem value="PENDING">⏳ Pending</SelectItem>
                  <SelectItem value="COMPLETED">🏆 Completed</SelectItem>
                  <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || statusFilter !== "all") && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium">
                  Showing {filteredBookings.length} of {formattedBookings.length} bookings
                </span>
                {(searchQuery || statusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {formattedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border text-center">
            <div className="w-24 h-24 bg-[#00884d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-[#00884d]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No bookings yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start your sports journey by booking a venue for your next game! Discover amazing facilities near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.href = "/venues"}
                className="bg-[#00884d] text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Venues
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/profile"}
                className="border-[#00884d]/20 text-[#00884d]"
              >
                <Users className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border">
            <Tabs defaultValue="upcoming" className="w-full">
              <div className="border-b border-gray-100 px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-xl">
                  <TabsTrigger
                    value="upcoming"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#00884d] data-[state=active]:shadow-sm font-semibold"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Upcoming ({upcomingBookings.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#00884d] data-[state=active]:shadow-sm font-semibold"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Past ({pastBookings.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upcoming" className="p-6 space-y-6">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming bookings</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchQuery || statusFilter !== "all"
                        ? "No bookings match your current filters. Try adjusting your search criteria."
                        : "Book a venue to see your upcoming reservations here. Start exploring amazing sports facilities!"
                      }
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <Button
                        onClick={() => window.location.href = "/venues"}
                        className="bg-[#00884d] text-white"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Browse Venues
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        isCancelling={cancellingBookingId === booking.id}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="p-6 space-y-6">
                {pastBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No past bookings</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchQuery || statusFilter !== "all"
                        ? "No past bookings match your current filters. Try adjusting your search criteria."
                        : "Your completed and cancelled bookings will appear here once you start using our platform."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        isCancelling={cancellingBookingId === booking.id}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}

// Individual booking card component
function BookingCard({
  booking,
  onCancel,
  isCancelling,
  getStatusIcon,
  getStatusColor,
}: {
  booking: any;
  onCancel: (id: string) => void;
  isCancelling: boolean;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}) {
  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <CardTitle className="text-xl font-bold text-gray-900">{booking.venueName}</CardTitle>
              <Badge className={`${getStatusColor(booking.status)} border-0 font-semibold`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </div>
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 bg-[#00884d]/10 rounded-full flex items-center justify-center">
                <MapPin className="h-3 w-3 text-[#00884d]" />
              </div>
              <span className="font-medium">{booking.courtName}</span>
            </div>
          </div>

          {booking.canCancel && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-200">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onCancel(booking.id)}
                  disabled={isCancelling}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Date</p>
              <p className="text-sm font-semibold text-gray-900">{booking.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Time</p>
              <p className="text-sm font-semibold text-gray-900">{booking.startTime} - {booking.endTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Players</p>
              <p className="text-sm font-semibold text-gray-900">{booking.playerCount} players</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-[#00884d]/10 rounded-lg flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-[#00884d]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Amount</p>
              <p className="text-sm font-semibold text-gray-900">₹{booking.totalPrice?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Booking ID:</span> {booking.reference}
          </div>
          {booking.paymentStatus && (
            <Badge
              variant="outline"
              className={`text-xs ${
                booking.paymentStatus === 'PAID'
                  ? 'border-green-200 text-green-700 bg-green-50'
                  : 'border-yellow-200 text-yellow-700 bg-yellow-50'
              }`}
            >
              {booking.paymentStatus === 'PAID' ? '✅ Paid' : '⏳ Pending Payment'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
