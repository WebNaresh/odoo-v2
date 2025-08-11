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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navigationItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Find Venues",
    href: "/venues",
    icon: MapPin,
  },
  {
    title: "My Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
    roles: ["USER", "FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "My Facilities",
    href: "/dashboard/facilities",
    icon: Building2,
    roles: ["FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "Admin Panel",
    href: "/admin",
    icon: Shield,
    roles: ["ADMIN"],
  },
];

export function MainNav() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const userRole = session?.user?.role;

  const filteredNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    if (!session) return false;
    return item.roles.includes(userRole || "");
  });

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        {/* Enhanced Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-lg">Q</span>
          </div>
          <span className="font-bold text-2xl text-gradient-primary">QuickCourt</span>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 text-sm font-medium ml-8">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-primary/10",
                  isActive
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-foreground/70 hover:text-primary"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Search Button */}
          <Button
            variant="outline"
            size="sm"
            className="relative h-9 w-9 p-0 md:h-10 md:w-60 md:justify-start md:px-3 md:py-2"
            onClick={() => router.push("/search")}
          >
            <Search className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline-flex">Search venues...</span>
          </Button>

          {/* User Menu */}
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || ""}
                    />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {session.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Role: {session.user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSignIn}
                variant="ghost"
                className="text-primary hover:bg-primary/10 font-semibold"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/auth/signup")}
                className="bg-gradient-primary hover:shadow-primary text-white font-semibold px-6 rounded-xl transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Enhanced Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden h-10 w-10 p-0 hover:bg-primary/10 text-primary"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-2 mt-8">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                        isActive
                          ? "text-primary bg-primary/10 font-semibold"
                          : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{item.title}</span>
                    </Link>
                  );
                })}

                {/* Mobile Auth Buttons */}
                {!session && (
                  <div className="flex flex-col space-y-3 mt-8 pt-6 border-t border-primary/10">
                    <Button
                      onClick={() => {
                        handleSignIn();
                        setIsOpen(false);
                      }}
                      variant="outline"
                      className="border-primary/20 text-primary hover:bg-primary/10 font-semibold"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        router.push("/auth/signup");
                        setIsOpen(false);
                      }}
                      className="bg-gradient-primary text-white font-semibold"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
