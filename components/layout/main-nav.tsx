"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  Calendar,
  Building2,
  Shield,
  Home,
  MapPin,
  BarChart3,
  Users,
  ClipboardList,
  Trophy,
  BookOpen,
  CreditCard,
  Bell,
  Heart,
  Star,
  ChevronDown,
  X,
  Zap,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: string[];
  description?: string;
}

// Define navigation items for different user roles
const navigationItems: NavItem[] = [
  // Public navigation items (visible to all users)
  {
    title: "Home",
    href: "/",
    icon: Home,
    description: "Return to homepage",
  },

  // Customer (USER) specific navigation
  {
    title: "Browse Venues",
    href: "/venues",
    icon: MapPin,
    roles: ["USER"],
    description: "Find and book sports facilities",
  },
  {
    title: "My Bookings",
    href: "/bookings",
    icon: Calendar,
    roles: ["USER"],
    description: "View and manage your reservations",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    roles: ["USER"],
    description: "Manage your account settings",
  },

  // Facility Owner specific navigation
  {
    title: "Dashboard",
    href: "/owner/dashboard",
    icon: BarChart3,
    roles: ["FACILITY_OWNER"],
    description: "View analytics and insights",
  },
  {
    title: "My Venues",
    href: "/owner/venues",
    icon: Building2,
    roles: ["FACILITY_OWNER"],
    description: "Manage your venues",
  },

  // Admin specific navigation
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    roles: ["ADMIN"],
    description: "System administration panel",
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
    description: "Manage platform users",
  },
  {
    title: "Venue Approval",
    href: "/admin/approvals",
    icon: Building2,
    roles: ["ADMIN"],
    description: "Review and approve venues",
  },
];

// Type for user roles
type UserRole = "USER" | "FACILITY_OWNER" | "ADMIN";

// Extended session type to include role
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

export function MainNav() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Type-safe role extraction
  const userRole = (session as ExtendedSession)?.user?.role;
  const isAuthenticated = !!session;

  // Filter navigation items based on user role and authentication status
  const filteredNavItems = navigationItems.filter((item) => {
    // If no roles specified, show to everyone
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    // If user is not authenticated, don't show role-specific items
    if (!isAuthenticated) {
      return false;
    }

    // Show item if user's role is in the allowed roles
    return userRole && item.roles.includes(userRole);
  });

  // Get role-specific greeting and dashboard link
  const getRoleSpecificInfo = () => {
    switch (userRole) {
      case "FACILITY_OWNER":
        return {
          greeting: "Facility Owner",
          dashboardLink: "/owner/dashboard",
          primaryAction: "Dashboard",
        };
      case "ADMIN":
        return {
          greeting: "Administrator",
          dashboardLink: "/admin",
          primaryAction: "Admin Panel",
        };
      case "USER":
      default:
        return {
          greeting: "Customer",
          dashboardLink: "/dashboard",
          primaryAction: "My Dashboard",
        };
    }
  };

  const roleInfo = getRoleSpecificInfo();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#00884d]/10 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-18 lg:h-20 items-center justify-between">
          {/* Enhanced Responsive Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 group flex-shrink-0 hover:scale-105 transition-all duration-300"
          >
            {/* Responsive Logo Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Image
                  src="/bg-logo.png"
                  alt="QuickCourt Logo"
                  width={40}
                  height={40}
                  className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                  priority
                />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#00884d] to-[#00a855] rounded-xl sm:rounded-2xl lg:rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>

            {/* Responsive Text */}
            <div className="flex flex-col">
              {/* Main Logo Text - Always visible but responsive */}
              <span className="font-bold text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent leading-tight">
                QuickCourt
              </span>

              {/* Tagline - Hidden on very small screens */}
              <div className="hidden xs:block text-[10px] xs:text-xs sm:text-sm md:text-sm lg:text-base text-gray-500 font-medium leading-tight -mt-1">
                Sports Booking Platform
              </div>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4 text-sm font-medium flex-1 justify-center max-w-3xl mx-8">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 whitespace-nowrap",
                    isActive
                      ? "text-white bg-gradient-to-r from-[#00884d] to-[#00a855] font-semibold shadow-lg"
                      : "text-gray-600 hover:text-[#00884d] hover:bg-[#00884d]/5"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  <span className="hidden xl:inline font-medium">
                    {item.title}
                  </span>
                  <span className="xl:hidden font-medium">
                    {item.title.split(" ")[0]}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00884d] to-[#00a855] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              );
            })}
          </nav>

          {/* Enhanced Right Actions */}
          <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Enhanced Search Button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "relative group transition-all duration-300 border-[#00884d]/20 hover:bg-[#00884d]/5 hover:border-[#00884d]/40 hover:scale-105",
                "h-10 w-10 p-0 sm:h-11 sm:w-11",
                "lg:w-56 xl:w-64 lg:justify-start lg:px-4 lg:py-3"
              )}
              onClick={() => router.push("/venues")}
            >
              <Search className="h-4 w-4 lg:mr-3 text-[#00884d] group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden lg:inline-flex text-gray-500 group-hover:text-[#00884d] transition-colors duration-200">
                {userRole === "FACILITY_OWNER"
                  ? "Search your venues..."
                  : userRole === "ADMIN"
                  ? "Search platform..."
                  : "Search venues & sports..."}
              </span>
              <div className="hidden lg:block absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border">
                  ⌘K
                </kbd>
              </div>
            </Button>

            {/* Notifications (for authenticated users) */}
            {session && (
              <Button
                variant="outline"
                size="sm"
                className="relative h-10 w-10 p-0 border-[#00884d]/20 hover:bg-[#00884d]/5 hover:border-[#00884d]/40 hover:scale-105 transition-all duration-300"
                onClick={() => router.push("/bookings")}
              >
                <Bell className="h-4 w-4 text-[#00884d]" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">
                    &nbsp;
                  </span>
                </span>
              </Button>
            )}

            {/* Enhanced User Menu */}
            {status === "loading" ? (
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-[#00884d]/10 transition-all duration-300 hover:scale-105 group"
                  >
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-[#00884d]/20 group-hover:border-[#00884d]/40 transition-colors duration-300">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#00884d] to-[#00a855] text-white font-bold text-sm sm:text-base">
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-80 p-2"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12 border-2 border-[#00884d]/20">
                        <AvatarImage
                          src={session.user?.image || ""}
                          alt={session.user?.name || ""}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#00884d] to-[#00a855] text-white font-bold">
                          {session.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-base font-semibold leading-none text-gray-900">
                          {session.user?.name}
                        </p>
                        <p className="text-sm leading-none text-gray-500">
                          {session.user?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#00884d]/10 rounded-full">
                            {userRole === "FACILITY_OWNER" && (
                              <Building2 className="h-3 w-3 text-[#00884d]" />
                            )}
                            {userRole === "ADMIN" && (
                              <Shield className="h-3 w-3 text-[#00884d]" />
                            )}
                            {userRole === "USER" && (
                              <User className="h-3 w-3 text-[#00884d]" />
                            )}
                            <span className="text-xs font-medium text-[#00884d]">
                              {roleInfo.greeting}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />

                  {/* Enhanced Menu Items */}
                  <div className="px-2 py-1">
                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                      className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-[#00884d]/5 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          Profile
                        </span>
                        <p className="text-xs text-gray-500">
                          Manage your account details
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </div>

                  {/* Role-specific quick actions */}
                  {userRole === "USER" && (
                    <>
                      <DropdownMenuSeparator className="my-2" />
                      <div className="px-2 py-1">
                        <DropdownMenuItem
                          onClick={() => router.push("/bookings")}
                          className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-[#00884d]/5 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              My Bookings
                            </span>
                            <p className="text-xs text-gray-500">
                              View your reservations
                            </p>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/venues")}
                          className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-[#00884d]/5 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              Browse Venues
                            </span>
                            <p className="text-xs text-gray-500">
                              Find sports facilities
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </>
                  )}

                  {userRole === "FACILITY_OWNER" && (
                    <>
                      <DropdownMenuSeparator className="my-2" />
                      <div className="px-2 py-1">
                        <DropdownMenuItem
                          onClick={() => router.push("/owner/dashboard")}
                          className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-[#00884d]/5 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              Dashboard
                            </span>
                            <p className="text-xs text-gray-500">
                              View analytics and insights
                            </p>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/owner/venues")}
                          className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-[#00884d]/5 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              My Venues
                            </span>
                            <p className="text-xs text-gray-500">
                              Manage your venues
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </>
                  )}

                  {userRole === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator className="my-2" />
                      <div className="px-2 py-1">
                        <DropdownMenuItem
                          onClick={() => router.push("/admin/users")}
                          className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-[#00884d]/5 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Users className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              User Management
                            </span>
                            <p className="text-xs text-gray-500">
                              Manage platform users
                            </p>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/admin/venues")}
                          className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-[#00884d]/5 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              Venue Approval
                            </span>
                            <p className="text-xs text-gray-500">
                              Review venue submissions
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </>
                  )}

                  <DropdownMenuSeparator className="my-2" />
                  <div className="px-2 py-1">
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors duration-200 cursor-pointer text-red-600"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">Sign Out</span>
                        <p className="text-xs text-red-500">End your session</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleSignIn}
                  variant="ghost"
                  size="sm"
                  className="text-[#00884d] hover:bg-[#00884d]/10 font-semibold hidden sm:flex px-4 py-2 rounded-xl transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/auth/signin")}
                  size="sm"
                  className="bg-gradient-to-r from-[#00884d] to-[#00a855] hover:from-[#00a855] hover:to-[#00884d] text-white font-bold px-4 sm:px-6 lg:px-8 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg text-sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  <span className="sm:hidden">Join</span>
                  <span className="hidden sm:inline">Get Started</span>
                </Button>
              </div>
            )}

            {/* Enhanced Responsive Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-primary/10 text-primary"
                  onClick={() => setIsOpen(true)}
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] sm:w-[350px] md:w-[400px] p-0"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  {/* Enhanced Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00884d] to-[#00a855] flex items-center justify-center shadow-xl">
                          <span className="text-white font-bold text-xl">
                            Q
                          </span>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-[#00884d] to-[#00a855] rounded-2xl blur opacity-20"></div>
                      </div>
                      <div>
                        <span className="font-bold text-2xl bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent">
                          QuickCourt
                        </span>
                        <div className="text-sm text-gray-500 font-medium">
                          Sports Booking Platform
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>

                  {/* Enhanced Mobile Navigation */}
                  <nav className="flex flex-col space-y-2 p-6 flex-1 bg-gradient-to-b from-white to-gray-50">
                    {filteredNavItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center space-x-4 px-4 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-[1.02]",
                            isActive
                              ? "text-white bg-gradient-to-r from-[#00884d] to-[#00a855] shadow-lg"
                              : "text-gray-700 hover:text-[#00884d] hover:bg-[#00884d]/5"
                          )}
                          onClick={() => setIsOpen(false)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                              isActive
                                ? "bg-white/20"
                                : "bg-gray-100 group-hover:bg-[#00884d]/10"
                            )}
                          >
                            {Icon && (
                              <Icon
                                className={cn(
                                  "h-5 w-5 transition-colors duration-300",
                                  isActive
                                    ? "text-white"
                                    : "text-gray-600 group-hover:text-[#00884d]"
                                )}
                              />
                            )}
                          </div>
                          <span className="flex-1">{item.title}</span>
                          {isActive && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </Link>
                      );
                    })}

                    {/* Mobile Search */}
                    <Button
                      variant="outline"
                      className="flex items-center justify-start space-x-3 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium border-primary/20 hover:bg-primary/5 mt-4"
                      onClick={() => {
                        router.push("/venues");
                        setIsOpen(false);
                      }}
                    >
                      <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      <span>
                        {userRole === "FACILITY_OWNER"
                          ? "Search Venues"
                          : userRole === "ADMIN"
                          ? "Search Platform"
                          : "Search Venues"}
                      </span>
                    </Button>
                  </nav>

                  {/* Mobile Auth Buttons */}
                  {!session && (
                    <div className="p-4 sm:p-6 border-t border-primary/10 space-y-3">
                      <Button
                        onClick={() => {
                          handleSignIn();
                          setIsOpen(false);
                        }}
                        variant="outline"
                        className="w-full border-primary/20 text-primary hover:bg-primary/10 font-semibold py-3 text-base"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          router.push("/auth/signin");
                          setIsOpen(false);
                        }}
                        className="w-full bg-gradient-primary text-white font-semibold py-3 text-base"
                      >
                        Get Started Free
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
