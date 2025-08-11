"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Building2, 
  Users, 
  Star,
  Calendar,
  AlertCircle,
  FileText,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "react-hot-toast";

// Mock pending approvals data
const mockApprovals = [
  {
    id: 1,
    facilityName: "Champions Arena",
    ownerName: "Rajesh Kumar",
    ownerEmail: "rajesh@championsarena.com",
    ownerPhone: "+91 98765 43210",
    location: "Bandra, Mumbai",
    address: "123 Champions Lane, Bandra West, Mumbai 400050",
    submittedDate: "2024-01-20",
    status: "pending_review",
    courts: 4,
    sports: ["Football", "Cricket", "Volleyball"],
    amenities: ["Parking", "Changing Rooms", "Cafeteria", "Equipment Rental"],
    operatingHours: "6:00 AM - 11:00 PM",
    priceRange: "₹800-1500/hr",
    documents: [
      { name: "Business License", status: "verified" },
      { name: "Property Documents", status: "verified" },
      { name: "Insurance Certificate", status: "pending" },
      { name: "Safety Compliance", status: "verified" },
    ],
    images: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
    description: "State-of-the-art sports facility with professional-grade courts and modern amenities.",
    notes: "All documents look good. Insurance certificate pending verification.",
  },
  {
    id: 2,
    facilityName: "Sports Hub",
    ownerName: "Priya Sharma",
    ownerEmail: "priya@sportshub.com",
    ownerPhone: "+91 87654 32109",
    location: "Powai, Mumbai",
    address: "456 Hub Street, Powai, Mumbai 400076",
    submittedDate: "2024-01-19",
    status: "pending_documents",
    courts: 2,
    sports: ["Badminton", "Table Tennis"],
    amenities: ["Parking", "Changing Rooms"],
    operatingHours: "7:00 AM - 10:00 PM",
    priceRange: "₹400-800/hr",
    documents: [
      { name: "Business License", status: "verified" },
      { name: "Property Documents", status: "pending" },
      { name: "Insurance Certificate", status: "pending" },
      { name: "Safety Compliance", status: "verified" },
    ],
    images: ["/api/placeholder/400/300"],
    description: "Compact sports facility focusing on indoor games with quality equipment.",
    notes: "Property documents and insurance certificate required.",
  },
  {
    id: 3,
    facilityName: "Elite Fitness Center",
    ownerName: "Amit Patel",
    ownerEmail: "amit@elitefitness.com",
    ownerPhone: "+91 76543 21098",
    location: "Andheri, Mumbai",
    address: "789 Elite Road, Andheri East, Mumbai 400069",
    submittedDate: "2024-01-18",
    status: "pending_review",
    courts: 6,
    sports: ["Basketball", "Tennis", "Squash"],
    amenities: ["Parking", "Changing Rooms", "Cafeteria", "WiFi", "Shower", "Locker"],
    operatingHours: "5:00 AM - 12:00 AM",
    priceRange: "₹600-1200/hr",
    documents: [
      { name: "Business License", status: "verified" },
      { name: "Property Documents", status: "verified" },
      { name: "Insurance Certificate", status: "verified" },
      { name: "Safety Compliance", status: "verified" },
    ],
    images: ["/api/placeholder/400/300", "/api/placeholder/400/300", "/api/placeholder/400/300"],
    description: "Premium sports facility with multiple courts and comprehensive amenities.",
    notes: "Excellent facility with all documents in order. Ready for approval.",
  },
];

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

const getDocumentStatusColor = (status: string) => {
  switch (status) {
    case "verified":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function ApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");
  const [approvalNotes, setApprovalNotes] = useState("");

  const filteredApprovals = mockApprovals.filter((approval) => {
    const matchesSearch = approval.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         approval.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         approval.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || approval.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprovalAction = (action: "approve" | "reject") => {
    setApprovalAction(action);
    setIsApprovalDialogOpen(true);
  };

  const handleSubmitApproval = () => {
    const actionText = approvalAction === "approve" ? "approved" : "rejected";
    toast.success(`Facility ${actionText} successfully`);
    setIsApprovalDialogOpen(false);
    setIsDetailDialogOpen(false);
    setApprovalNotes("");
  };

  const ApprovalCard = ({ approval }: { approval: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{approval.facilityName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              {approval.location}
            </div>
            <p className="text-sm text-muted-foreground">Owner: {approval.ownerName}</p>
          </div>
          <Badge className={getStatusColor(approval.status)}>
            {approval.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">Courts:</span>
            <p className="font-medium">{approval.courts}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Sports:</span>
            <p className="font-medium">{approval.sports.length}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Submitted:</span>
            <p className="font-medium">{approval.submittedDate}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Price Range:</span>
            <p className="font-medium">{approval.priceRange}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {approval.sports.slice(0, 3).map((sport: string) => (
            <Badge key={sport} variant="secondary" className="text-xs">
              {sport}
            </Badge>
          ))}
          {approval.sports.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{approval.sports.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedApproval(approval);
              setIsDetailDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Review Details
          </Button>
          {approval.status === "pending_review" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => {
                  setSelectedApproval(approval);
                  handleApprovalAction("approve");
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => {
                  setSelectedApproval(approval);
                  handleApprovalAction("reject");
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      title="Facility Approvals"
      description="Review and approve new facility registrations"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search facilities, owners, or locations..."
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
                  <SelectItem value="all">All Submissions</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="pending_documents">Pending Documents</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockApprovals.filter(a => a.status.includes("pending")).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockApprovals.filter(a => a.status === "pending_review").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockApprovals.filter(a => a.status === "pending_documents").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockApprovals.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Approvals List */}
        {filteredApprovals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredApprovals.map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No approvals found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "No pending facility approvals at the moment"
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Facility Review: {selectedApproval?.facilityName}</DialogTitle>
              <DialogDescription>
                Complete facility details and documentation review
              </DialogDescription>
            </DialogHeader>
            
            {selectedApproval && (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Facility Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="owner">Owner Info</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{selectedApproval.facilityName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{selectedApproval.location}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p className="font-medium">{selectedApproval.address}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Operating Hours:</span>
                          <p className="font-medium">{selectedApproval.operatingHours}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Facility Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Courts:</span>
                          <p className="font-medium">{selectedApproval.courts}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sports:</span>
                          <p className="font-medium">{selectedApproval.sports.join(", ")}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Price Range:</span>
                          <p className="font-medium">{selectedApproval.priceRange}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amenities:</span>
                          <p className="font-medium">{selectedApproval.amenities.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedApproval.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Images</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedApproval.images.map((image: string, index: number) => (
                        <div key={index} className="aspect-video bg-muted rounded" />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="space-y-3">
                    {selectedApproval.documents.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        <Badge className={getDocumentStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  {selectedApproval.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Review Notes</h4>
                      <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                        {selectedApproval.notes}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="owner" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{selectedApproval.ownerName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedApproval.ownerEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedApproval.ownerPhone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Submission Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <p className="font-medium">{selectedApproval.submittedDate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={getStatusColor(selectedApproval.status)}>
                            {selectedApproval.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            {selectedApproval?.status === "pending_review" && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => handleApprovalAction("approve")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Facility
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleApprovalAction("reject")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Facility
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approval Action Dialog */}
        <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {approvalAction === "approve" ? "Approve" : "Reject"} Facility
              </DialogTitle>
              <DialogDescription>
                {approvalAction === "approve" 
                  ? "This facility will be approved and made available on the platform."
                  : "This facility will be rejected and the owner will be notified."
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {approvalAction === "approve" ? "Approval" : "Rejection"} Notes
                </label>
                <Textarea
                  placeholder={`Add notes for the ${approvalAction} decision...`}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The facility owner will be notified via email about this decision.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsApprovalDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitApproval}
                className={`flex-1 ${approvalAction === "reject" ? "bg-red-600 hover:bg-red-700" : ""}`}
              >
                {approvalAction === "approve" ? "Approve" : "Reject"} Facility
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
