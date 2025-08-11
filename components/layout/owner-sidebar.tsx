"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserProfileSection } from "@/components/layout/user-profile-section";
import {
  Building2,
  BarChart3,
  ClipboardList,
  Settings,
  Home,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  category?: string;
  isNew?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/owner/dashboard",
    icon: Home,
    description: "Overview and quick actions",
    category: "main",
  },
  {
    title: "My Venues",
    href: "/owner/venues",
    icon: Building2,
    description: "Manage your sports venues",
    category: "main",
  },
  {
    title: "Bookings",
    href: "/owner/bookings",
    icon: ClipboardList,
    description: "Manage bookings and schedules",
    category: "main",
    badge: "3", // This would be dynamic in real app
  },
  {
    title: "Analytics",
    href: "/owner/analytics",
    icon: BarChart3,
    description: "View performance metrics",
    category: "insights",
  },
  {
    title: "Customers",
    href: "/owner/customers",
    icon: Users,
    description: "View customer insights",
    category: "insights",
    isNew: true,
  },
  {
    title: "Reports",
    href: "/owner/reports",
    icon: TrendingUp,
    description: "Generate detailed reports",
    category: "insights",
  },
  {
    title: "Settings",
    href: "/owner/settings",
    icon: Settings,
    description: "Account and venue settings",
    category: "account",
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

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Group items by category
  const groupedItems = {
    main: sidebarItems.filter(item => item.category === 'main'),
    insights: sidebarItems.filter(item => item.category === 'insights'),
    account: sidebarItems.filter(item => item.category === 'account'),
  };

  return (
    <>
      {/* Enhanced Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Enhanced Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Enhanced Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 bg-gradient-to-r from-[#00884d] to-[#00a855]">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">QuickCourt</span>
                  <div className="text-xs text-white/80">Owner Portal</div>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex text-white hover:bg-white/20"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Enhanced Quick Actions */}
          {!isCollapsed && (
            <div className="p-4 space-y-3">
              <Button
                onClick={() => handleNavigation("/owner/venues/new")}
                className="w-full justify-start gap-3 h-10 bg-[#00884d] hover:bg-[#00a855] text-white shadow-sm"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add New Venue
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation("/owner/bookings")}
                  className="text-xs border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Bookings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation("/owner/analytics")}
                  className="text-xs border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analytics
                </Button>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="p-2">
              <Button
                onClick={() => handleNavigation("/owner/venues/new")}
                size="sm"
                className="w-full h-10 bg-[#00884d] hover:bg-[#00a855] text-white"
                title="Add New Venue"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Separator className="bg-gray-100" />

          {/* Enhanced Navigation Items */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-6">
              {/* Main Section */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Main
                  </h3>
                )}
                {groupedItems.main.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200",
                        isCollapsed && "justify-center px-2",
                        active
                          ? "bg-[#00884d]/10 text-[#00884d] font-medium border-r-2 border-[#00884d] hover:bg-[#00884d]/15"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => handleNavigation(item.href)}
                      title={isCollapsed ? `${item.title} - ${item.description}` : undefined}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        active ? "text-[#00884d]" : "text-gray-500"
                      )} />
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 text-left">
                            <div className="truncate font-medium">{item.title}</div>
                            <div className="text-xs text-gray-500 truncate">{item.description}</div>
                          </div>
                          {item.badge && (
                            <Badge className="ml-auto bg-[#00884d] text-white text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {item.isNew && (
                            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 text-xs">
                              New
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Insights Section */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Insights
                  </h3>
                )}
                {groupedItems.insights.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200",
                        isCollapsed && "justify-center px-2",
                        active
                          ? "bg-[#00884d]/10 text-[#00884d] font-medium border-r-2 border-[#00884d] hover:bg-[#00884d]/15"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => handleNavigation(item.href)}
                      title={isCollapsed ? `${item.title} - ${item.description}` : undefined}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        active ? "text-[#00884d]" : "text-gray-500"
                      )} />
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 text-left">
                            <div className="truncate font-medium">{item.title}</div>
                            <div className="text-xs text-gray-500 truncate">{item.description}</div>
                          </div>
                          {item.badge && (
                            <Badge className="ml-auto bg-[#00884d] text-white text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {item.isNew && (
                            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 text-xs">
                              New
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Account Section */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </h3>
                )}
                {groupedItems.account.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200",
                        isCollapsed && "justify-center px-2",
                        active
                          ? "bg-[#00884d]/10 text-[#00884d] font-medium border-r-2 border-[#00884d] hover:bg-[#00884d]/15"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => handleNavigation(item.href)}
                      title={isCollapsed ? `${item.title} - ${item.description}` : undefined}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        active ? "text-[#00884d]" : "text-gray-500"
                      )} />
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 text-left">
                            <div className="truncate font-medium">{item.title}</div>
                            <div className="text-xs text-gray-500 truncate">{item.description}</div>
                          </div>
                          {item.badge && (
                            <Badge className="ml-auto bg-[#00884d] text-white text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {item.isNew && (
                            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 text-xs">
                              New
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* Enhanced User Profile Section */}
          <div className="border-t border-gray-100 bg-gray-50/50">
            <UserProfileSection isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>

      {/* Content Spacer for Desktop */}
      <div
        className={cn(
          "hidden md:block transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-72"
        )}
      />
    </>
  );
}
