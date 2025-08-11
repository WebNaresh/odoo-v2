"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  User,
  Settings,
  Building2,
  BarChart3,
  Users,
  Shield,
  CheckCircle,
  MessageSquare,
  CreditCard,
  MapPin,
  Clock,
  Star,
  FileText,
} from "lucide-react";

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
    title: "Dashboard",
    href: "/dashboard/owner",
    icon: BarChart3,
    roles: ["FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "My Facilities",
    href: "/dashboard/facilities",
    icon: Building2,
    roles: ["FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "Bookings",
    href: "/dashboard/owner/bookings",
    icon: Calendar,
    roles: ["FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "Courts",
    href: "/dashboard/courts",
    icon: MapPin,
    roles: ["FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "Schedule",
    href: "/dashboard/schedule",
    icon: Clock,
    roles: ["FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
    roles: ["FACILITY_OWNER", "ADMIN"],
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
    roles: ["FACILITY_OWNER", "ADMIN"],
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
    title: "Facility Approvals",
    href: "/admin/approvals",
    icon: CheckCircle,
    roles: ["ADMIN"],
    badge: "3",
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "All Facilities",
    href: "/admin/facilities",
    icon: Building2,
    roles: ["ADMIN"],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
    roles: ["ADMIN"],
  },
  {
    title: "Content Moderation",
    href: "/admin/moderation",
    icon: MessageSquare,
    roles: ["ADMIN"],
  },
];

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const userRole = session.user?.role;

  const getNavItems = () => {
    let items: SidebarNavItem[] = [...userNavItems];

    if (userRole === "FACILITY_OWNER" || userRole === "ADMIN") {
      items = [...items, ...facilityOwnerNavItems];
    }

    if (userRole === "ADMIN") {
      items = [...items, ...adminNavItems];
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
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
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
            Facility Management
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
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
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
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1">
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
