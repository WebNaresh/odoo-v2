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
  AlertCircle
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

  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      });

      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (venueFilter && venueFilter !== "all") params.append("venueId", venueFilter);
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
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, venueFilter, dateFilter]);

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
          setBookings(prev => 
            prev.map(booking => 
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

  const filteredBookings = bookings.filter(booking => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">
            Manage all bookings across your venues
          </p>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
              <Label>Venue</Label>
              <Select value={venueFilter} onValueChange={setVenueFilter}>
                <SelectTrigger>
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Bookings ({totalBookings})
          </CardTitle>
          <CardDescription>
            Showing {filteredBookings.length} of {totalBookings} bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
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
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.customer.name}</p>
                            <p className="text-xs text-muted-foreground">{booking.customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.venue.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.court.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.court.type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{booking.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">₹{booking.totalPrice}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
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
                    <p><span className="font-medium">Name:</span> {selectedBooking.customer.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.customer.email}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Booking Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Venue:</span> {selectedBooking.venue.name}</p>
                    <p><span className="font-medium">Court:</span> {selectedBooking.court.name}</p>
                    <p><span className="font-medium">Type:</span> {selectedBooking.court.type}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Schedule</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Date:</span> {new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Time:</span> {new Date(selectedBooking.startTime).toLocaleTimeString()} - {new Date(selectedBooking.endTime).toLocaleTimeString()}</p>
                    <p><span className="font-medium">Duration:</span> {selectedBooking.duration} minutes</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Payment</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Amount:</span> ₹{selectedBooking.totalPrice}</p>
                    <p><span className="font-medium">Status:</span>
                      <Badge className={`ml-2 ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Update Status</h4>
                <div className="flex gap-2">
                  {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedBooking.status.toUpperCase() === status ? "default" : "outline"}
                      onClick={() => handleStatusUpdate(selectedBooking.id, status)}
                      disabled={updating === selectedBooking.id}
                      style={selectedBooking.status.toUpperCase() === status ? { backgroundColor: "#00884d" } : {}}
                    >
                      {updating === selectedBooking.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      {status}
                    </Button>
                  ))}
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
  );
}
