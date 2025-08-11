"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Star, Search, Filter, MoreHorizontal, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

// Mock bookings data
const mockBookings = [
  {
    id: 1,
    venueName: "Elite Sports Complex",
    venueLocation: "Downtown, Mumbai",
    courtName: "Basketball Court 1",
    sport: "Basketball",
    date: "2024-01-22",
    time: "18:00 - 19:00",
    status: "confirmed",
    price: "₹800",
    bookingDate: "2024-01-15",
    paymentStatus: "paid",
    venueRating: 4.8,
  },
  {
    id: 2,
    venueName: "Victory Courts",
    venueLocation: "Andheri, Mumbai",
    courtName: "Tennis Court 2",
    sport: "Tennis",
    date: "2024-01-25",
    time: "16:00 - 17:00",
    status: "pending",
    price: "₹600",
    bookingDate: "2024-01-18",
    paymentStatus: "pending",
    venueRating: 4.7,
  },
  {
    id: 3,
    venueName: "Champions Arena",
    venueLocation: "Bandra, Mumbai",
    courtName: "Football Field",
    sport: "Football",
    date: "2024-01-20",
    time: "19:00 - 20:00",
    status: "completed",
    price: "₹1200",
    bookingDate: "2024-01-12",
    paymentStatus: "paid",
    venueRating: 4.6,
  },
  {
    id: 4,
    venueName: "Elite Sports Complex",
    venueLocation: "Downtown, Mumbai",
    courtName: "Badminton Court 3",
    sport: "Badminton",
    date: "2024-01-18",
    time: "17:00 - 18:00",
    status: "cancelled",
    price: "₹500",
    bookingDate: "2024-01-10",
    paymentStatus: "refunded",
    venueRating: 4.8,
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function BookingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch = booking.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.courtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingBookings = filteredBookings.filter(booking => 
    new Date(booking.date) >= new Date() && booking.status !== "cancelled"
  );
  
  const pastBookings = filteredBookings.filter(booking => 
    new Date(booking.date) < new Date() || booking.status === "cancelled"
  );

  const handleCancelBooking = (bookingId: number) => {
    toast.success("Booking cancelled successfully");
    setIsDialogOpen(false);
  };

  const handleRescheduleBooking = (bookingId: number) => {
    toast.info("Reschedule feature coming soon");
    setIsDialogOpen(false);
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{booking.venueName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {booking.venueLocation}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{booking.venueRating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(booking.status)}>
              {getStatusIcon(booking.status)}
              <span className="ml-1 capitalize">{booking.status}</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedBooking(booking);
                setIsDialogOpen(true);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Court:</span>
            <span className="text-sm font-medium">{booking.courtName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sport:</span>
            <span className="text-sm font-medium">{booking.sport}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Date & Time:</span>
            <span className="text-sm font-medium">{booking.date} • {booking.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-sm font-medium">{booking.price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment:</span>
            <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"}>
              {booking.paymentStatus}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/venues/${booking.id}`)}
          >
            View Venue
          </Button>
          {booking.status === "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Review feature coming soon")}
            >
              Write Review
            </Button>
          )}
          {booking.status === "confirmed" && new Date(booking.date) > new Date() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRescheduleBooking(booking.id)}
            >
              Reschedule
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      title="My Bookings"
      description="Manage your venue bookings and view booking history"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any upcoming bookings. Book a venue to get started!
                  </p>
                  <Button onClick={() => router.push("/venues")}>
                    Browse Venues
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No past bookings</h3>
                  <p className="text-muted-foreground">
                    Your booking history will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Manage your booking for {selectedBooking?.venueName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Venue:</span>
                    <p className="font-medium">{selectedBooking.venueName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Court:</span>
                    <p className="font-medium">{selectedBooking.courtName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{selectedBooking.date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{selectedBooking.time}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-medium">{selectedBooking.price}</p>
                  </div>
                </div>

                {selectedBooking.status === "confirmed" && new Date(selectedBooking.date) > new Date() && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You can cancel this booking up to 2 hours before the scheduled time.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/venues/${selectedBooking.id}`)}
                  >
                    View Venue
                  </Button>
                  
                  {selectedBooking.status === "confirmed" && new Date(selectedBooking.date) > new Date() && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleRescheduleBooking(selectedBooking.id)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelBooking(selectedBooking.id)}
                      >
                        Cancel Booking
                      </Button>
                    </>
                  )}
                  
                  {selectedBooking.status === "completed" && (
                    <Button
                      onClick={() => toast.info("Review feature coming soon")}
                    >
                      Write Review
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
