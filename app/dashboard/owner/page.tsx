"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Building2, 
  Clock, 
  Star,
  Plus,
  BarChart3,
  Activity,
  AlertCircle
} from "lucide-react";

// Mock data for facility owner dashboard
const dashboardStats = {
  totalRevenue: 45600,
  monthlyGrowth: 12.5,
  totalBookings: 156,
  bookingGrowth: 8.3,
  totalFacilities: 3,
  averageRating: 4.7,
  occupancyRate: 78,
  activeHours: 142,
};

const recentBookings = [
  {
    id: 1,
    customerName: "Rahul Sharma",
    venueName: "Elite Sports Complex",
    courtName: "Basketball Court 1",
    date: "2024-01-22",
    time: "18:00 - 19:00",
    amount: 800,
    status: "confirmed",
  },
  {
    id: 2,
    customerName: "Priya Patel",
    venueName: "Elite Sports Complex",
    courtName: "Tennis Court A",
    date: "2024-01-22",
    time: "16:00 - 17:00",
    amount: 600,
    status: "pending",
  },
  {
    id: 3,
    customerName: "Amit Kumar",
    venueName: "Victory Courts",
    courtName: "Badminton Court 1",
    date: "2024-01-21",
    time: "19:00 - 20:00",
    amount: 500,
    status: "completed",
  },
];

const facilities = [
  {
    id: 1,
    name: "Elite Sports Complex",
    location: "Downtown, Mumbai",
    courts: 5,
    rating: 4.8,
    bookingsToday: 12,
    revenue: 15600,
    occupancy: 85,
    status: "active",
  },
  {
    id: 2,
    name: "Victory Courts",
    location: "Andheri, Mumbai",
    courts: 3,
    rating: 4.7,
    bookingsToday: 8,
    revenue: 8400,
    occupancy: 72,
    status: "active",
  },
  {
    id: 3,
    name: "Champions Arena",
    location: "Bandra, Mumbai",
    courts: 4,
    rating: 4.6,
    bookingsToday: 6,
    revenue: 7200,
    occupancy: 65,
    status: "pending_approval",
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: "Court maintenance scheduled",
    description: "Basketball Court 1 - Elite Sports Complex",
    time: "Tomorrow, 10:00 AM",
    priority: "high",
  },
  {
    id: 2,
    title: "New booking request",
    description: "Corporate event booking for 5 courts",
    time: "Today, 3:00 PM",
    priority: "medium",
  },
  {
    id: 3,
    title: "Payment pending",
    description: "Invoice #1234 - ₹2,400",
    time: "Due in 2 days",
    priority: "low",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending_approval":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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

export default function OwnerDashboardPage() {
  const router = useRouter();

  return (
    <DashboardLayout
      title="Business Dashboard"
      description="Overview of your sports facilities and bookings"
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{dashboardStats.monthlyGrowth}%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{dashboardStats.bookingGrowth}%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facilities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalFacilities}</div>
              <p className="text-xs text-muted-foreground">
                Active facilities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Across all facilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your facilities and bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => router.push("/dashboard/facilities/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Facility
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/owner/bookings")}>
                <Calendar className="mr-2 h-4 w-4" />
                Manage Bookings
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/owner/analytics")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/schedule")}>
                <Clock className="mr-2 h-4 w-4" />
                Schedule Management
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Latest bookings across your facilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-sm text-muted-foreground">{booking.venueName}</p>
                    <p className="text-sm text-muted-foreground">{booking.courtName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {booking.date} • {booking.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">₹{booking.amount}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/owner/bookings")}>
                View All Bookings
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>
                Important tasks and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{task.description}</p>
                    <p className="text-xs text-muted-foreground">{task.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Facilities Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Facilities</CardTitle>
            <CardDescription>
              Performance overview of all your sports facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facilities.map((facility) => (
                <div key={facility.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{facility.name}</h3>
                      <p className="text-sm text-muted-foreground">{facility.location}</p>
                    </div>
                    <Badge className={getStatusColor(facility.status)}>
                      {facility.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Courts</p>
                      <p className="font-medium">{facility.courts}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{facility.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Bookings</p>
                      <p className="font-medium">{facility.bookingsToday}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-medium">₹{facility.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Occupancy</p>
                      <div className="flex items-center gap-2">
                        <Progress value={facility.occupancy} className="flex-1" />
                        <span className="text-sm font-medium">{facility.occupancy}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/facilities/${facility.id}`)}>
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/facilities/${facility.id}/edit`)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/facilities/${facility.id}/analytics`)}>
                      Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
