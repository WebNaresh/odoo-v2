"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Calendar, User, Settings, Shield, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string;
}

const userNavItems: SidebarNavItem[] = [
  {
    title: "My Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
    roles: ["USER", "FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["USER", "FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["USER", "FACILITY_OWNER", "ADMIN"],
  },
];

const facilityOwnerNavItems: SidebarNavItem[] = [
  {
    title: "Owner Portal",
    href: "/owner",
    icon: Settings,
    roles: ["FACILITY_OWNER"],
  },
];

const adminNavItems: SidebarNavItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    roles: ["ADMIN"],
  },
  {
    title: "Venue Approvals",
    href: "/admin/approvals",
    icon: CheckCircle,
    roles: ["ADMIN"],
  },
];

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [pendingVenuesCount, setPendingVenuesCount] = useState<number>(0);

  if (!session) return null;

  const userRole = session.user?.role;

  // Fetch pending venues count for admin badge
  useEffect(() => {
    const fetchPendingVenuesCount = async () => {
      if (userRole === "ADMIN") {
        try {
          const response = await fetch("/api/admin/venues?status=PENDING");
          if (response.ok) {
            const data = await response.json();
            setPendingVenuesCount(data.total || 0);
          }
        } catch (error) {
          console.error("Failed to fetch pending venues count:", error);
        }
      }
    };

    fetchPendingVenuesCount();
  }, [userRole]);

  const getNavItems = () => {
    let items: SidebarNavItem[] = [...userNavItems];

    if (userRole === "FACILITY_OWNER" || userRole === "ADMIN") {
      items = [...items, ...facilityOwnerNavItems];
    }

    if (userRole === "ADMIN") {
      // Add dynamic badge to venue approvals
      const adminItemsWithBadge = adminNavItems.map((item) => {
        if (item.href === "/admin/approvals" && pendingVenuesCount > 0) {
          return { ...item, badge: pendingVenuesCount.toString() };
        }
        return item;
      });
      items = [...items, ...adminItemsWithBadge];
    }

    return items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole || "");
    });
  };

  const navItems = getNavItems();

  const groupedItems = {
    user: navItems.filter((item) => userNavItems.includes(item)),
    owner: navItems.filter((item) => facilityOwnerNavItems.includes(item)),
    admin: navItems.filter((item) => adminNavItems.includes(item)),
  };

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {/* User Section */}
      {groupedItems.user.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground px-3 py-2">
            Personal
          </h4>
          {groupedItems.user.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-1 font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Facility Owner Section */}
      {groupedItems.owner.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground px-3 py-2 mt-4">
            Venue Management
          </h4>
          {groupedItems.owner.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-1 font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Admin Section */}
      {groupedItems.admin.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground px-3 py-2 mt-4">
            Administration
          </h4>
          {groupedItems.admin.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
