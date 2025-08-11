"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Star,
  Trophy,
  Clock,
  CreditCard,
  Settings,
  Edit3,
  Save,
  X,
  Shield,
  Building2,
  Users,
  Activity,
  TrendingUp,
  Heart,
  BookOpen,
  Phone,
  Globe,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface UserStats {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  favoriteVenues: number;
  reviewsGiven: number;
  memberSince: string;
}

interface RecentBooking {
  id: string;
  venueName: string;
  courtName: string;
  date: string;
  time: string;
  status: string;
  amount: number;
  paymentStatus: string;
}

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    isBanned: boolean;
  };
  stats: UserStats;
  recentBookings: RecentBooking[];
  ownedVenues: Array<{
    id: string;
    name: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Form state for editing profile
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      // Fetch user profile data
      fetchUserData();
    }
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      setFetchLoading(true);
      console.log("🔄 [PROFILE PAGE] Fetching profile data");

      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data: ProfileData = await response.json();
      console.log("✅ [PROFILE PAGE] Profile data received:", data);

      setProfileData(data);

      // Update form data with real user data
      setFormData({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: "", // TODO: Add to user model
        bio: "", // TODO: Add to user model
        location: "", // TODO: Add to user model
        website: "", // TODO: Add to user model
      });
    } catch (error) {
      console.error("❌ [PROFILE PAGE] Error fetching user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      console.log("🔄 [PROFILE PAGE] Updating profile data");

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      console.log("✅ [PROFILE PAGE] Profile updated successfully:", result);

      toast.success("Profile updated successfully!");
      setIsEditing(false);

      // Refresh profile data
      await fetchUserData();
    } catch (error) {
      console.error("❌ [PROFILE PAGE] Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (profileData) {
      setFormData({
        name: profileData.user.name || "",
        email: profileData.user.email || "",
        phone: "",
        bio: "",
        location: "",
        website: "",
      });
    }
    setIsEditing(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "FACILITY_OWNER":
        return <Building2 className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-green-500" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "FACILITY_OWNER":
        return "Facility Owner";
      default:
        return "Player";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Confirmed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Pending</Badge>;
    }
  };

  if (status === "loading" || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#00884d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user || !profileData) {
    return null;
  }

  const user = profileData.user;
  const stats = profileData.stats;
  const recentBookings = profileData.recentBookings;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg bg-white mb-8">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-[#00884d]/20">
                  <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-[#00884d] to-[#00a855] text-white text-2xl lg:text-3xl font-bold">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {user.name || "User"}
                    </h1>
                    <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      {getRoleIcon(user.role)}
                      <span className="text-sm font-medium text-gray-700">
                        {getRoleName(user.role)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/bookings")}
                  className="border-[#00884d]/20 text-[#00884d]"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Bookings
                </Button>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-[#00884d] text-white"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#00884d] data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[#00884d] data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="data-[state=active]:bg-[#00884d] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#00884d] data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Star className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.reviewsGiven}</p>
                      <p className="text-sm text-gray-600">Reviews Given</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#00884d]" />
                  Recent Bookings
                </CardTitle>
                <CardDescription>Your latest booking activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#00884d]/10 rounded-lg flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-[#00884d]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{booking.venueName}</h4>
                              <p className="text-sm text-gray-600">{booking.courtName} • {booking.date} • {booking.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900">₹{booking.amount.toLocaleString()}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/bookings")}
                        className="border-[#00884d]/20 text-[#00884d]"
                      >
                        View All Bookings
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring venues and make your first booking!</p>
                    <Button
                      onClick={() => router.push("/venues")}
                      className="bg-[#00884d] text-white"
                    >
                      Browse Venues
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your personal details and preferences</CardDescription>
                  </div>
                  {isEditing && (
                    <Button onClick={handleSaveProfile} disabled={loading} className="bg-[#00884d] text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className={isEditing ? "border-[#00884d]/20" : "bg-gray-50"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className={isEditing ? "border-[#00884d]/20" : "bg-gray-50"}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      className={isEditing ? "border-[#00884d]/20" : "bg-gray-50"}
                      placeholder="Enter your city/location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!isEditing}
                      className={isEditing ? "border-[#00884d]/20" : "bg-gray-50"}
                      placeholder="Enter your website URL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    className={isEditing ? "border-[#00884d]/20" : "bg-gray-50"}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>View and manage all your bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed booking history coming soon</h3>
                  <p className="text-gray-600 mb-6">For now, you can view your bookings on the dedicated bookings page.</p>
                  <Button
                    onClick={() => router.push("/bookings")}
                    className="bg-[#00884d] text-white"
                  >
                    Go to Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced settings coming soon</h3>
                  <p className="text-gray-600">We're working on additional settings and preferences for your account.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
