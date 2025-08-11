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
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Calendar,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Activity,
  Shield,
  BarChart3,
  UserCheck,
  FileText,
  Loader2,
} from "lucide-react";

// Interfaces for dashboard data
interface PlatformStats {
  totalUsers: number;
  userGrowth: number;
  totalFacilities: number;
  facilityGrowth: number;
  totalBookings: number;
  bookingGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  pendingApprovals: number;
  approvedVenues: number;
  rejectedVenues: number;
  activeReports: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  priority: string;
  venueId?: string;
}

interface PendingApproval {
  id: string;
  facilityName: string;
  ownerName: string;
  location: string;
  submittedDate: string;
  courts: number;
  sports: string[];
  status: string;
}

interface TopFacility {
  id: string;
  name: string;
  location: string;
  rating: number;
  bookings: number;
  revenue: number;
  growth: number;
  courtCount: number;
  reviewCount: number;
}

interface DashboardData {
  platformStats: PlatformStats;
  recentActivities: Activity[];
  pendingApprovals: PendingApproval[];
  topFacilities: TopFacility[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "facility_approval":
      return <Building2 className="h-4 w-4" />;
    case "user_report":
      return <AlertCircle className="h-4 w-4" />;
    case "payment_issue":
      return <IndianRupee className="h-4 w-4" />;
    case "new_user":
      return <Users className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "low":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending_review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "pending_documents":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/dashboard/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        description="Platform overview and management tools"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error || !dashboardData) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        description="Platform overview and management tools"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">
              {error || "Failed to load dashboard data"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { platformStats, recentActivities, pendingApprovals, topFacilities } =
    dashboardData;

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description="Platform overview and management tools"
    >
      <div className="space-y-6">
        {/* Platform Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{platformStats.userGrowth}%
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Facilities
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformStats.totalFacilities}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{platformStats.facilityGrowth}%
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformStats.totalBookings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{platformStats.bookingGrowth}%
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Revenue
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(platformStats.totalRevenue / 100000).toFixed(1)}L
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{platformStats.revenueGrowth}%
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => router.push("/admin/approvals")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Facility Approvals ({platformStats.pendingApprovals})
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/users")}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                User Management
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/reports")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Reports & Analytics
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/moderation")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Content Moderation ({platformStats.activeReports})
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest platform activities requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="p-2 bg-muted rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <Badge
                        className={getPriorityColor(activity.priority)}
                        variant="secondary"
                      >
                        {activity.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/admin/approvals")}
              >
                View All Activities
              </Button>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Facility Approvals</CardTitle>
              <CardDescription>Facilities waiting for approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.slice(0, 3).map((approval) => (
                <div key={approval.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{approval.facilityName}</h4>
                    <Badge className={getStatusColor(approval.status)}>
                      {approval.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Owner: {approval.ownerName}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Location: {approval.location}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {approval.courts} courts • {approval.sports.length} sports
                    </span>
                    <span className="text-muted-foreground">
                      {approval.submittedDate}
                    </span>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/admin/approvals")}
              >
                View All Approvals ({platformStats.pendingApprovals})
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Facilities</CardTitle>
            <CardDescription>
              Highest performing facilities on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFacilities.map((facility, index) => (
                <div
                  key={facility.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{facility.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {facility.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {facility.rating}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {facility.bookings} bookings
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₹{(facility.revenue / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-green-600">
                      +{facility.growth}%
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/admin/facilities/${facility.id}`)
                    }
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Server Performance</span>
                  <span>98%</span>
                </div>
                <Progress value={98} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Database Health</span>
                  <span>95%</span>
                </div>
                <Progress value={95} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>API Response Time</span>
                  <span>92%</span>
                </div>
                <Progress value={92} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Daily Active Users</span>
                  <span>2,450</span>
                </div>
                <Progress value={85} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Booking Conversion</span>
                  <span>68%</span>
                </div>
                <Progress value={68} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>User Retention</span>
                  <span>74%</span>
                </div>
                <Progress value={74} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Growth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>New Users</span>
                  <span>+15.2%</span>
                </div>
                <Progress value={76} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>New Facilities</span>
                  <span>+8.7%</span>
                </div>
                <Progress value={44} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Revenue Growth</span>
                  <span>+18.5%</span>
                </div>
                <Progress value={93} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
