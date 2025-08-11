"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Star, Plus, Activity, TrendingUp, Users } from "lucide-react";

// Mock data for user dashboard
const recentBookings = [
  {
    id: 1,
    venueName: "Elite Sports Complex",
    courtName: "Basketball Court 1",
    date: "2024-01-15",
    time: "18:00 - 19:00",
    status: "confirmed",
    price: "₹800",
  },
  {
    id: 2,
    venueName: "Victory Courts",
    courtName: "Tennis Court 2",
    date: "2024-01-18",
    time: "16:00 - 17:00",
    status: "pending",
    price: "₹600",
  },
  {
    id: 3,
    venueName: "Champions Arena",
    courtName: "Football Field",
    date: "2024-01-20",
    time: "19:00 - 20:00",
    status: "completed",
    price: "₹1200",
  },
];

const upcomingBookings = [
  {
    id: 4,
    venueName: "Elite Sports Complex",
    courtName: "Badminton Court 3",
    date: "2024-01-22",
    time: "17:00 - 18:00",
    status: "confirmed",
    price: "₹500",
  },
  {
    id: 5,
    venueName: "Victory Courts",
    courtName: "Squash Court 1",
    date: "2024-01-25",
    time: "15:00 - 16:00",
    status: "confirmed",
    price: "₹700",
  },
];

const favoriteVenues = [
  {
    id: 1,
    name: "Elite Sports Complex",
    location: "Downtown, Mumbai",
    rating: 4.8,
    image: "/api/placeholder/300/200",
    lastVisited: "2024-01-10",
  },
  {
    id: 2,
    name: "Victory Courts",
    location: "Andheri, Mumbai",
    rating: 4.7,
    image: "/api/placeholder/300/200",
    lastVisited: "2024-01-08",
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
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function DashboardPage() {
  const router = useRouter();

  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back! Here's what's happening with your bookings."
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Played</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +4 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹8,400</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Venues</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Venues you love
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your next booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => router.push("/venues")}>
                <Plus className="mr-2 h-4 w-4" />
                Book a Venue
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/bookings")}>
                <Calendar className="mr-2 h-4 w-4" />
                View All Bookings
              </Button>
              <Button variant="outline" onClick={() => router.push("/venues?filter=favorites")}>
                <Star className="mr-2 h-4 w-4" />
                Browse Favorites
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>
                Your next scheduled games
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.venueName}</p>
                      <p className="text-sm text-muted-foreground">{booking.courtName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {booking.date}
                        <Clock className="h-3 w-3" />
                        {booking.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{booking.price}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming bookings</p>
                  <Button className="mt-2" onClick={() => router.push("/venues")}>
                    Book Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest bookings and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{booking.venueName}</p>
                    <p className="text-sm text-muted-foreground">{booking.courtName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {booking.date}
                      <Clock className="h-3 w-3" />
                      {booking.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">{booking.price}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Favorite Venues */}
        <Card>
          <CardHeader>
            <CardTitle>Your Favorite Venues</CardTitle>
            <CardDescription>
              Venues you've bookmarked and love to play at
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteVenues.map((venue) => (
                <div key={venue.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-video bg-muted rounded-md mb-3" />
                  <h3 className="font-medium">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {venue.location}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{venue.rating}</span>
                    </div>
                    <Button size="sm" onClick={() => router.push(`/venues/${venue.id}`)}>
                      Book Now
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
