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
import {
  Building2,
  Calendar,
  Plus,
  Eye,
  BarChart3,
  MapPin,
  Star,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  Loader2
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name || "Owner"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your sports venue business
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => router.push("/owner/venues/new")}
          className="gap-2"
          style={{ backgroundColor: "#00884d" }}
        >
          <Plus className="h-4 w-4" />
          Add New Venue
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/owner/venues")}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          View All Venues
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/owner/analytics")}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/owner/bookings")}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Manage Bookings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.monthlyGrowth >= 0 ? "+" : ""}{(stats.monthlyGrowth || 0).toFixed(1)}%
              </span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.bookingGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.bookingGrowth >= 0 ? "+" : ""}{(stats.bookingGrowth || 0).toFixed(1)}%
              </span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFacilities}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCourts} courts total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.averageRating || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Venues */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Venues</CardTitle>
          <CardDescription>Your latest venues and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentVenues.length > 0 ? (
            <div className="space-y-4">
              {recentVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {venue.address}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(venue.status)}>
                          {venue.status}
                        </Badge>
                        {venue.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{venue.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {venue.bookingsCount} bookings
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/venues/${venue.id}`)}
                      className="mt-2"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => router.push("/owner/venues")}
                className="w-full"
              >
                View All Venues
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No venues yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first sports venue
              </p>
              <Button onClick={() => router.push("/owner/venues/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Venue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                <>
                  {recentBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{booking.courtName} - {booking.venueName}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.date} • {booking.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">₹{booking.amount}</p>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push("/owner/bookings")}
                  >
                    View All Bookings
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent bookings</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Current month metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Occupancy Rate</span>
                <div className="flex items-center gap-2">
                  <Progress value={stats.occupancyRate} className="w-16" />
                  <span className="text-sm font-medium">{stats.occupancyRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{stats.averageRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Revenue</span>
                <span className="text-sm font-medium">₹{stats.currentMonthRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Bookings</span>
                <span className="text-sm font-medium">{stats.currentMonthBookings}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push("/owner/analytics")}
              >
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Venue Overview */}
      {venueOverviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Venue Performance</CardTitle>
            <CardDescription>Overview of all your venues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {venueOverviews.map((venue) => (
                <div key={venue.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{venue.name}</h3>
                      <p className="text-sm text-muted-foreground">{venue.courtsCount} courts</p>
                    </div>
                    <Badge className={getStatusColor(venue.status.toUpperCase())}>
                      {venue.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{venue.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({venue.reviewCount})</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Bookings</p>
                      <p className="font-medium">{venue.bookingsToday}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/owner/venues/${venue.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
