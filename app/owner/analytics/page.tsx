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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  IndianRupee,
  Users,
  Clock,
  Star,
  Building2,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle
} from "lucide-react";

interface AnalyticsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  revenueTrends: { date: string; value: number }[];
  bookingTrends: { date: string; value: number }[];
  peakHours: { hour: number; bookings: number; label: string }[];
  venuePerformance: {
    id: string;
    name: string;
    revenue: number;
    bookingCount: number;
    avgRating: number;
    courtsCount: number;
    occupancyRate: number;
  }[];
  customerInsights: {
    totalCustomers: number;
    topCustomers: {
      id: string;
      name: string;
      bookings: number;
      revenue: number;
    }[];
    avgBookingsPerCustomer: number;
    avgRevenuePerCustomer: number;
  };
  sportPopularity: {
    sportId: string;
    name: string;
    bookings: number;
    revenue: number;
  }[];
  monthlyComparison: {
    current: {
      bookings: number;
      revenue: number;
    };
    previous: {
      bookings: number;
      revenue: number;
    };
    growth: {
      bookings: number;
      revenue: number;
    };
  };
  summary: {
    totalRevenue: number;
    totalBookings: number;
    avgBookingValue: number;
    uniqueCustomers: number;
  };
}

const COLORS = ['#00884d', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function OwnerAnalyticsPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("month");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/owner/analytics?period=${period}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.analytics);
        } else {
          throw new Error(data.error || "Failed to fetch analytics");
        }
      } else {
        throw new Error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
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
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Detailed insights into your business performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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

      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{analytics.summary.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {analytics.monthlyComparison.growth.revenue >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={analytics.monthlyComparison.growth.revenue >= 0 ? "text-green-600" : "text-red-600"}>
                    {analytics.monthlyComparison.growth.revenue >= 0 ? "+" : ""}{(analytics.monthlyComparison.growth.revenue || 0).toFixed(1)}%
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.totalBookings}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {analytics.monthlyComparison.growth.bookings >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={analytics.monthlyComparison.growth.bookings >= 0 ? "text-green-600" : "text-red-600"}>
                    {analytics.monthlyComparison.growth.bookings >= 0 ? "+" : ""}{(analytics.monthlyComparison.growth.bookings || 0).toFixed(1)}%
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(analytics.summary.avgBookingValue || 0).toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">
                  Per booking average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.uniqueCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Active customers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue and Booking Trends */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Revenue over time ({period}ly)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#00884d"
                      fill="#00884d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Bookings over time ({period}ly)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [value, 'Bookings']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00884d"
                      strokeWidth={2}
                      dot={{ fill: "#00884d" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Peak Hours and Sport Popularity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
                <CardDescription>Booking distribution by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [value, 'Bookings']}
                    />
                    <Bar dataKey="bookings" fill="#00884d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sport Popularity</CardTitle>
                <CardDescription>Revenue by sport type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.sportPopularity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {analytics.sportPopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Venue Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Performance</CardTitle>
              <CardDescription>Detailed performance metrics for each venue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.venuePerformance.map((venue) => (
                  <div key={venue.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{venue.name}</h3>
                        <p className="text-sm text-muted-foreground">{venue.courtsCount} courts</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{(venue.avgRating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-medium">₹{venue.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bookings</p>
                        <p className="font-medium">{venue.bookingCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Occupancy</p>
                        <p className="font-medium">{(venue.occupancyRate || 0).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg/Booking</p>
                        <p className="font-medium">
                          ₹{venue.bookingCount > 0 ? (venue.revenue / venue.bookingCount).toFixed(0) : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>Customer behavior and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold">{analytics.customerInsights.totalCustomers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Bookings/Customer</p>
                      <p className="text-2xl font-bold">{(analytics.customerInsights.avgBookingsPerCustomer || 0).toFixed(1)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Avg Revenue/Customer</p>
                    <p className="text-xl font-bold">₹{(analytics.customerInsights.avgRevenuePerCustomer || 0).toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest revenue generating customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.customerInsights.topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.bookings} bookings</p>
                        </div>
                      </div>
                      <p className="font-medium">₹{customer.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
