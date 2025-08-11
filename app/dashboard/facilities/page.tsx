"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  MapPin, 
  Star, 
  Calendar, 
  IndianRupee,
  Building2,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

// Mock facilities data
const mockFacilities = [
  {
    id: 1,
    name: "Elite Sports Complex",
    location: "Downtown, Mumbai",
    address: "123 Sports Street, Downtown, Mumbai",
    status: "active",
    courts: 5,
    sports: ["Basketball", "Tennis", "Badminton"],
    rating: 4.8,
    reviewCount: 124,
    totalBookings: 1250,
    monthlyRevenue: 15600,
    occupancyRate: 85,
    createdAt: "2023-06-15",
    lastUpdated: "2024-01-15",
    images: ["/api/placeholder/300/200"],
    amenities: ["Parking", "Changing Rooms", "Cafeteria", "WiFi"],
  },
  {
    id: 2,
    name: "Victory Courts",
    location: "Andheri, Mumbai",
    address: "456 Victory Road, Andheri, Mumbai",
    status: "active",
    courts: 3,
    sports: ["Tennis", "Squash", "Table Tennis"],
    rating: 4.7,
    reviewCount: 89,
    totalBookings: 890,
    monthlyRevenue: 8400,
    occupancyRate: 72,
    createdAt: "2023-08-20",
    lastUpdated: "2024-01-10",
    images: ["/api/placeholder/300/200"],
    amenities: ["Parking", "Changing Rooms", "Equipment Rental"],
  },
  {
    id: 3,
    name: "Champions Arena",
    location: "Bandra, Mumbai",
    address: "789 Champions Lane, Bandra, Mumbai",
    status: "pending_approval",
    courts: 4,
    sports: ["Football", "Cricket", "Volleyball"],
    rating: 0,
    reviewCount: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    createdAt: "2024-01-10",
    lastUpdated: "2024-01-10",
    images: ["/api/placeholder/300/200"],
    amenities: ["Parking", "Changing Rooms", "Cafeteria"],
  },
  {
    id: 4,
    name: "Sports Hub",
    location: "Powai, Mumbai",
    address: "321 Hub Street, Powai, Mumbai",
    status: "inactive",
    courts: 2,
    sports: ["Badminton", "Table Tennis"],
    rating: 4.5,
    reviewCount: 45,
    totalBookings: 320,
    monthlyRevenue: 0,
    occupancyRate: 0,
    createdAt: "2023-12-01",
    lastUpdated: "2024-01-05",
    images: ["/api/placeholder/300/200"],
    amenities: ["Parking", "Changing Rooms"],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending_approval":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4" />;
    case "pending_approval":
      return <Clock className="h-4 w-4" />;
    case "inactive":
      return <XCircle className="h-4 w-4" />;
    case "draft":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function FacilitiesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredFacilities = mockFacilities.filter((facility) => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || facility.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteFacility = (facilityId: number) => {
    toast.success("Facility deleted successfully");
    setIsDeleteDialogOpen(false);
    setSelectedFacility(null);
  };

  const handleToggleStatus = (facilityId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    toast.success(`Facility ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
  };

  const FacilityCard = ({ facility }: { facility: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative rounded-t-lg">
        <div className="absolute top-4 left-4">
          <Badge className={getStatusColor(facility.status)}>
            {getStatusIcon(facility.status)}
            <span className="ml-1 capitalize">{facility.status.replace('_', ' ')}</span>
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage {facility.name}</DialogTitle>
                <DialogDescription>
                  Choose an action for this facility
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/facilities/${facility.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/facilities/${facility.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Facility
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleToggleStatus(facility.id, facility.status)}
                >
                  {facility.status === "active" ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedFacility(facility);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Facility
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{facility.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {facility.location}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Courts:</span>
              <p className="font-medium">{facility.courts}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sports:</span>
              <p className="font-medium">{facility.sports.length}</p>
            </div>
            {facility.status === "active" && (
              <>
                <div>
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{facility.rating}</span>
                    <span className="text-muted-foreground">({facility.reviewCount})</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Occupancy:</span>
                  <p className="font-medium">{facility.occupancyRate}%</p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {facility.sports.slice(0, 3).map((sport: string) => (
              <Badge key={sport} variant="secondary" className="text-xs">
                {sport}
              </Badge>
            ))}
            {facility.sports.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{facility.sports.length - 3} more
              </Badge>
            )}
          </div>

          {facility.status === "active" && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly Revenue:</span>
                <span className="font-semibold">₹{facility.monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/facilities/${facility.id}`)}
            >
              View Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/dashboard/facilities/${facility.id}/edit`)}
            >
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      title="My Facilities"
      description="Manage your sports facilities and venues"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search facilities..."
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
                <SelectItem value="all">All Facilities</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => router.push("/dashboard/facilities/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Facility
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockFacilities.length}</div>
              <p className="text-xs text-muted-foreground">
                {mockFacilities.filter(f => f.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockFacilities.reduce((sum, f) => sum + f.courts, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all facilities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{mockFacilities.reduce((sum, f) => sum + f.monthlyRevenue, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From active facilities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(mockFacilities.filter(f => f.rating > 0).reduce((sum, f) => sum + f.rating, 0) / 
                  mockFacilities.filter(f => f.rating > 0).length).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across rated facilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Facilities Grid */}
        {filteredFacilities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No facilities found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first sports facility"
                }
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => router.push("/dashboard/facilities/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Facility
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Facility</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedFacility?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Deleting this facility will also remove all associated bookings, reviews, and data.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteFacility(selectedFacility?.id)}
                className="flex-1"
              >
                Delete Facility
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
