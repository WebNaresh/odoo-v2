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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Facility Owner navigation moved to dedicated sidebar

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
    href: "/admin/venues",
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
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 lg:h-18 items-center justify-between">
          {/* Enhanced Responsive Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0"
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-sm sm:text-lg lg:text-xl">
                Q
              </span>
            </div>
            <span className="font-bold text-lg sm:text-xl lg:text-2xl text-gradient-primary hidden xs:block">
              QuickCourt
            </span>
          </Link>

          {/* Enhanced Responsive Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-sm font-medium flex-1 justify-center max-w-2xl mx-8">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-primary/10 whitespace-nowrap",
                    isActive
                      ? "text-primary bg-primary/10 font-semibold shadow-sm"
                      : "text-foreground/70 hover:text-primary"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  <span className="hidden xl:inline">{item.title}</span>
                  <span className="xl:hidden">{item.title.split(" ")[0]}</span>
                </Link>
              );
            })}
          </nav>

          {/* Enhanced Responsive Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Enhanced Responsive Search Button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "relative transition-all duration-200 border-primary/20 hover:bg-primary/10 hover:border-primary/30",
                "h-8 w-8 p-0 sm:h-9 sm:w-9 md:h-10 md:w-10",
                "lg:w-48 xl:w-60 lg:justify-start lg:px-3 lg:py-2"
              )}
              onClick={() => router.push("/search")}
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2 text-primary" />
              <span className="hidden lg:inline-flex text-muted-foreground">
                {userRole === "FACILITY_OWNER"
                  ? "Search venues..."
                  : userRole === "ADMIN"
                  ? "Search platform..."
                  : "Search venues..."}
              </span>
            </Button>

            {/* Enhanced Responsive User Menu */}
            {status === "loading" ? (
              <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-muted animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 border-2 border-primary/20">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm sm:text-base">
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs leading-none text-muted-foreground">
                          {roleInfo.greeting}
                        </span>
                        {userRole === "FACILITY_OWNER" && (
                          <Building2 className="h-3 w-3 text-blue-500" />
                        )}
                        {userRole === "ADMIN" && (
                          <Shield className="h-3 w-3 text-red-500" />
                        )}
                        {userRole === "USER" && (
                          <User className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Role-specific dashboard link */}
                  <DropdownMenuItem
                    onClick={() => router.push(roleInfo.dashboardLink)}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>{roleInfo.primaryAction}</span>
                  </DropdownMenuItem>

                  {/* Common profile and settings */}
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  {/* Role-specific quick actions */}
                  {/* Facility Owner navigation moved to dedicated sidebar */}

                  {userRole === "USER" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push("/bookings")}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>My Bookings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/venues")}>
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>Browse Venues</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  {userRole === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/users")}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>User Management</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/venues")}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Venue Approval</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button
                  onClick={handleSignIn}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 font-semibold hidden sm:flex"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/auth/signup")}
                  size="sm"
                  className="bg-gradient-primary hover:shadow-primary text-white font-semibold px-3 sm:px-4 lg:px-6 rounded-xl transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                >
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
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-primary/10">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
                        <span className="text-white font-bold text-sm sm:text-lg">
                          Q
                        </span>
                      </div>
                      <span className="font-bold text-lg sm:text-xl text-gradient-primary">
                        QuickCourt
                      </span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-1 p-4 sm:p-6 flex-1">
                    {filteredNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center space-x-3 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium transition-all duration-200",
                            isActive
                              ? "text-primary bg-primary/10 font-semibold shadow-sm"
                              : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {Icon && (
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                          )}
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}

                    {/* Mobile Search */}
                    <Button
                      variant="outline"
                      className="flex items-center justify-start space-x-3 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium border-primary/20 hover:bg-primary/5 mt-4"
                      onClick={() => {
                        router.push("/search");
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
                          router.push("/auth/signup");
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
