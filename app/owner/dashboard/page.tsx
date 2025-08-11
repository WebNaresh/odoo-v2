"use client";

import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Calendar,
  Plus,
  Eye,
  BarChart3,
  Star,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Activity,
  ChevronRight,
  Zap,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalRevenue: number;
  monthlyGrowth: number;
  totalBookings: number;
  bookingGrowth: number;
  totalFacilities: number;
  totalCourts: number;
  averageRating: number;
  occupancyRate: number;
  currentMonthRevenue: number;
  currentMonthBookings: number;
  totalReviews: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  venueName: string;
  courtName: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface VenueOverview {
  id: string;
  name: string;
  courtsCount: number;
  rating: number;
  reviewCount: number;
  status: string;
  bookingsToday: number;
}

interface RecentVenue {
  id: string;
  name: string;
  address: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  bookingsCount: number;
  rating?: number;
  photoUrls: string[];
  sports: string[];
}

export default function OwnerDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    totalBookings: 0,
    bookingGrowth: 0,
    totalFacilities: 0,
    totalCourts: 0,
    averageRating: 0,
    occupancyRate: 0,
    currentMonthRevenue: 0,
    currentMonthBookings: 0,
    totalReviews: 0,
  });
  const [recentVenues, setRecentVenues] = useState<RecentVenue[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [venueOverviews, setVenueOverviews] = useState<VenueOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await fetch("/api/owner/dashboard/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
          setRecentBookings(statsData.recentBookings || []);
          setVenueOverviews(statsData.venues || []);
        }
      } else {
        throw new Error("Failed to fetch dashboard stats");
      }

      // Fetch recent venues
      const venuesResponse = await fetch("/api/owner/venues?limit=3");
      if (venuesResponse.ok) {
        const venuesData = await venuesResponse.json();
        if (venuesData.success) {
          setRecentVenues(venuesData.venues || []);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };



  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Enhanced Header with Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00884d] via-[#00a855] to-[#00b359] p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/20">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {session?.user?.name?.charAt(0) || "O"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  Welcome back, {session?.user?.name || "Owner"}!
                </h1>
                <p className="text-white/90 text-sm md:text-base">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Here's your sports venue business overview
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Data
              </Button>
              <Button
                onClick={() => router.push("/owner/venues/new")}
                className="bg-white text-[#00884d] hover:bg-white/90 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
            </div>
          </div>

          {/* Quick Stats in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-lg md:text-xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-white/80">Total Revenue</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-lg md:text-xl font-bold">{stats.totalBookings}</div>
              <div className="text-xs text-white/80">Total Bookings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-lg md:text-xl font-bold">{stats.totalFacilities}</div>
              <div className="text-xs text-white/80">Venues</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-lg md:text-xl font-bold">{(stats.averageRating || 0).toFixed(1)}</div>
              <div className="text-xs text-white/80">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-[#00884d]" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage your venues and bookings efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => router.push("/owner/venues")}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-[#00884d]/5 hover:border-[#00884d] transition-all group"
            >
              <div className="w-12 h-12 bg-[#00884d]/10 rounded-full flex items-center justify-center group-hover:bg-[#00884d]/20 transition-colors">
                <Eye className="h-6 w-6 text-[#00884d]" />
              </div>
              <div className="text-center">
                <div className="font-medium">View Venues</div>
                <div className="text-xs text-muted-foreground">Manage all venues</div>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/owner/analytics")}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">View insights</div>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/owner/bookings")}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-purple-50 hover:border-purple-200 transition-all group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">Bookings</div>
                <div className="text-xs text-muted-foreground">Manage bookings</div>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/owner/venues/new")}
              className="h-auto p-4 flex flex-col items-center gap-3 bg-[#00884d] hover:bg-[#00a855] transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="text-center text-white">
                <div className="font-medium">Add Venue</div>
                <div className="text-xs text-white/80">Create new venue</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              {stats.monthlyGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.monthlyGrowth >= 0 ? "+" : ""}
                {(stats.monthlyGrowth || 0).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Bookings</CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalBookings}</div>
            <div className="flex items-center gap-1">
              {stats.bookingGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  stats.bookingGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.bookingGrowth >= 0 ? "+" : ""}
                {(stats.bookingGrowth || 0).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Venues</CardTitle>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalFacilities}</div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-purple-600" />
              <span className="text-xs text-muted-foreground">
                {stats.totalCourts} courts total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Average Rating</CardTitle>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(stats.averageRating || 0).toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-yellow-600" />
              <span className="text-xs text-muted-foreground">
                {stats.totalReviews} reviews
              </span>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Enhanced Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#00884d]" />
                  Recent Bookings
                </CardTitle>
                <CardDescription>Latest booking activity across your venues</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/owner/bookings")}
                className="text-[#00884d] hover:text-[#00a855]"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                <>
                  {recentBookings.slice(0, 4).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00884d]/10 to-[#00884d]/5 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-[#00884d]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {booking.courtName}
                          </p>
                          <Badge
                            variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                            className={`text-xs ${
                              booking.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {booking.venueName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {booking.date} • {booking.time}
                          </span>
                          <span className="text-sm font-medium text-[#00884d]">
                            ₹{booking.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                    onClick={() => router.push("/owner/bookings")}
                  >
                    View All Bookings
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#00884d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-[#00884d]" />
                  </div>
                  <h3 className="font-medium mb-1">No recent bookings</h3>
                  <p className="text-sm text-muted-foreground">
                    Bookings will appear here once customers start booking your venues
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#00884d]" />
              Performance
            </CardTitle>
            <CardDescription>Current month metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Occupancy Rate</span>
                  <span className="text-sm font-bold text-[#00884d]">
                    {(stats.occupancyRate || 0).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={stats.occupancyRate || 0}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.occupancyRate >= 70 ? "Excellent" : stats.occupancyRate >= 50 ? "Good" : "Needs improvement"}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Average Rating</span>
                  </div>
                  <span className="font-semibold">{(stats.averageRating || 0).toFixed(1)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Monthly Revenue</span>
                  </div>
                  <span className="font-semibold">₹{stats.currentMonthRevenue.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Monthly Bookings</span>
                  </div>
                  <span className="font-semibold">{stats.currentMonthBookings}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                onClick={() => router.push("/owner/analytics")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Venue Performance Overview */}
      {venueOverviews.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#00884d]" />
                  Venue Performance
                </CardTitle>
                <CardDescription>Detailed overview of all your venues</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/owner/analytics")}
                className="text-[#00884d] hover:text-[#00a855]"
              >
                Analytics
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {venueOverviews.map((venue) => (
                <Card
                  key={venue.id}
                  className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm"
                  onClick={() => router.push(`/owner/venues/${venue.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#00884d] transition-colors">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {venue.courtsCount} courts
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          venue.status.toUpperCase() === 'APPROVED'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : venue.status.toUpperCase() === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {venue.status.toUpperCase() === 'APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {venue.status.toUpperCase() === 'PENDING' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {venue.status.toUpperCase() === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                        {venue.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{(venue.rating || 0).toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {venue.reviewCount} reviews
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="font-semibold text-lg text-[#00884d] mb-1">
                          {venue.bookingsToday}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Today's bookings
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="font-semibold text-lg text-blue-600 mb-1">
                          {((venue.bookingsToday / venue.courtsCount) * 100).toFixed(0)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Utilization
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-muted-foreground">
                        Click to view details
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#00884d] transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <Button
          onClick={() => router.push("/owner/venues/new")}
          size="lg"
          className="w-14 h-14 rounded-full bg-[#00884d] hover:bg-[#00a855] shadow-2xl"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
