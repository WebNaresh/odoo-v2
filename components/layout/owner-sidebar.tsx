"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  BarChart3,
  ClipboardList,
  Trophy,
  BookOpen,
  Settings,
  Home,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/owner/dashboard",
    icon: Home,
    description: "Overview and quick actions",
  },
  {
    title: "My Venues",
    href: "/owner/venues",
    icon: Building2,
    description: "Manage your sports venues",
  },
  {
    title: "Court Management",
    href: "/owner/courts",
    icon: Trophy,
    description: "Configure courts and pricing",
  },
  {
    title: "Bookings",
    href: "/owner/bookings",
    icon: ClipboardList,
    description: "Manage bookings and schedules",
  },
  {
    title: "Time Slots",
    href: "/owner/timeslots",
    icon: BookOpen,
    description: "Manage availability and schedules",
  },
  {
    title: "Analytics",
    href: "/owner/analytics",
    icon: BarChart3,
    description: "View performance metrics",
  },
  {
    title: "Settings",
    href: "/owner/settings",
    icon: Settings,
    description: "Account and venue settings",
  },
];

interface OwnerSidebarProps {
  className?: string;
}

export default function OwnerSidebar({ className }: OwnerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/owner/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-background border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-semibold">Owner Portal</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="p-4">
              <Button
                onClick={() => handleNavigation("/owner/venues/new")}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add New Venue
              </Button>
            </div>
          )}

          <Separator />

          {/* Navigation Items */}
          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Button
                    key={item.href}
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      isCollapsed && "justify-center px-2",
                      active && "bg-secondary font-medium"
                    )}
                    onClick={() => handleNavigation(item.href)}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t">
            {!isCollapsed && (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Facility Owner Portal</p>
                <p>Manage your sports venues</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Spacer for Desktop */}
      <div
        className={cn(
          "hidden md:block transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      />
    </>
  );
}
