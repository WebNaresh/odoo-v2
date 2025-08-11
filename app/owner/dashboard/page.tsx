"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  BarChart3,
  Clock,
  MapPin,
  Star
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
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
    totalVenues: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });
  const [recentVenues, setRecentVenues] = useState<RecentVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await fetch("/api/owner/dashboard/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats || stats);
        }

        // Fetch recent venues
        const venuesResponse = await fetch("/api/owner/venues?limit=3");
        if (venuesResponse.ok) {
          const venuesData = await venuesResponse.json();
          setRecentVenues(venuesData.venues || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name || "Owner"}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your sports venue business
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => router.push("/owner/venues/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Venue
        </Button>
        <Button variant="outline" onClick={() => router.push("/owner/venues")} className="gap-2">
          <Eye className="h-4 w-4" />
          View All Venues
        </Button>
        <Button variant="outline" onClick={() => router.push("/owner/analytics")} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVenues}</div>
            <p className="text-xs text-muted-foreground">
              Active sports venues
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
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Regular customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Venues */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Venues</CardTitle>
          <CardDescription>
            Your latest venues and their status
          </CardDescription>
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
                <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    <p className="text-sm font-medium">{venue.bookingsCount} bookings</p>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Court A - Basketball</p>
                    <p className="text-xs text-muted-foreground">Today, 2:00 PM</p>
                  </div>
                </div>
                <Badge variant="secondary">Confirmed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Court B - Tennis</p>
                    <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View All Bookings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>This week&apos;s performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Occupancy Rate</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.6</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-medium">< 2 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="text-sm font-medium">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
