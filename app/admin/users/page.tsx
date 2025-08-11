"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  Filter,
  UserX,
  UserCheck,
  Shield,
  Building2,
  Calendar,
  Star,
  Loader2,
  AlertCircle,
  Ban,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  useAdminUsers,
  useBanUser,
  useUnbanUser,
  type AdminUser,
} from "@/hooks/use-admin-users";

export default function AdminUsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [banStatusFilter, setBanStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  // React Query hooks
  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useAdminUsers({
    page: currentPage,
    limit: 20,
    search: searchQuery,
    role: roleFilter === "ALL" ? undefined : roleFilter,
    banStatus: banStatusFilter === "ALL" ? undefined : banStatusFilter,
  });

  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleBanStatusFilter = (value: string) => {
    setBanStatusFilter(value);
    setCurrentPage(1);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      await banUserMutation.mutateAsync({
        userId: selectedUser.id,
        reason: banReason.trim() || undefined,
      });
      toast.success(
        `User ${selectedUser.name || selectedUser.email} has been banned`
      );
      setIsBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    try {
      await unbanUserMutation.mutateAsync(selectedUser.id);
      toast.success(
        `User ${selectedUser.name || selectedUser.email} has been unbanned`
      );
      setIsUnbanDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
  };

  const openBanDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setIsBanDialogOpen(true);
  };

  const openUnbanDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setIsUnbanDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "FACILITY_OWNER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "USER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getBanStatusBadge = (user: AdminUser) => {
    if (user.isBanned) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <UserX className="h-3 w-3 mr-1" />
          Banned
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="User Management"
        description="Manage users and their access"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Loading users...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout
        title="User Management"
        description="Manage users and their access"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load users</h3>
          <p className="text-muted-foreground text-center mb-6">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  const { users = [], pagination, statistics } = usersData || {};

  return (
    <DashboardLayout
      title="User Management"
      description="Manage users and their access"
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics?.activeUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Banned Users
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics?.bannedUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statistics?.adminCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={handleRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="FACILITY_OWNER">Facility Owner</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={banStatusFilter}
                onValueChange={handleBanStatusFilter}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({pagination?.total || 0})</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ||
                  roleFilter !== "ALL" ||
                  banStatusFilter !== "ALL"
                    ? "Try adjusting your search criteria"
                    : "No users have been registered yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      user.isBanned ? "bg-red-50 border-red-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.image || ""}
                          alt={user.name || ""}
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0) ||
                            user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            {user.name || "No name"}
                          </h4>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role === "FACILITY_OWNER"
                              ? "Owner"
                              : user.role}
                          </Badge>
                          {getBanStatusBadge(user)}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>

                        {user.isBanned && user.banReason && (
                          <p className="text-sm text-red-600 mt-1">
                            <strong>Ban Reason:</strong> {user.banReason}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          {user._count.ownedVenues > 0 && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {user._count.ownedVenues} venues
                            </span>
                          )}
                          {user._count.reviews > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {user._count.reviews} reviews
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUnbanDialog(user)}
                          disabled={unbanUserMutation.isPending}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Unban
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBanDialog(user)}
                          disabled={banUserMutation.isPending}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Ban
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ban User Dialog */}
        <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                Are you sure you want to ban{" "}
                {selectedUser?.name || selectedUser?.email}? This will prevent
                them from accessing the application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Reason for ban (optional)
                </label>
                <Textarea
                  placeholder="Enter the reason for banning this user..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBanDialogOpen(false)}
                disabled={banUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBanUser}
                disabled={banUserMutation.isPending}
              >
                {banUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Banning...
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unban User Dialog */}
        <Dialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unban User</DialogTitle>
              <DialogDescription>
                Are you sure you want to unban{" "}
                {selectedUser?.name || selectedUser?.email}? This will restore
                their access to the application.
              </DialogDescription>
            </DialogHeader>
            {selectedUser?.banReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm">
                  <strong>Original ban reason:</strong> {selectedUser.banReason}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUnbanDialogOpen(false)}
                disabled={unbanUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnbanUser}
                disabled={unbanUserMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {unbanUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Unbanning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Unban User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
