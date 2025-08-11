"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Calendar, 
  Users, 
  Search, 
  Plus, 
  FileText, 
  Star,
  MapPin,
  Clock,
  AlertCircle
} from "lucide-react";

interface EmptyStateProps {
  variant?: "default" | "search" | "bookings" | "facilities" | "users" | "reviews" | "error";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  className?: string;
}

const variantConfig = {
  default: {
    icon: FileText,
    iconColor: "text-muted-foreground",
  },
  search: {
    icon: Search,
    iconColor: "text-muted-foreground",
  },
  bookings: {
    icon: Calendar,
    iconColor: "text-blue-500",
  },
  facilities: {
    icon: Building2,
    iconColor: "text-green-500",
  },
  users: {
    icon: Users,
    iconColor: "text-purple-500",
  },
  reviews: {
    icon: Star,
    iconColor: "text-yellow-500",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
};

export function EmptyState({
  variant = "default",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className={cn("mb-4 p-3 rounded-full bg-muted", config.iconColor)}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            className="min-w-32"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Predefined empty states for common scenarios
export function NoBookingsFound({ onCreateBooking }: { onCreateBooking?: () => void }) {
  return (
    <EmptyState
      variant="bookings"
      title="No bookings found"
      description="You don't have any bookings yet. Start by finding and booking a venue that matches your needs."
      action={onCreateBooking ? {
        label: "Find Venues",
        onClick: onCreateBooking,
      } : undefined}
    />
  );
}

export function NoFacilitiesFound({ onAddFacility }: { onAddFacility?: () => void }) {
  return (
    <EmptyState
      variant="facilities"
      title="No facilities found"
      description="You haven't added any facilities yet. Get started by adding your first sports facility to the platform."
      action={onAddFacility ? {
        label: "Add Facility",
        onClick: onAddFacility,
      } : undefined}
    />
  );
}

export function NoSearchResults({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="We couldn't find any venues matching your search criteria. Try adjusting your filters or search terms."
      action={onClearSearch ? {
        label: "Clear Filters",
        onClick: onClearSearch,
        variant: "outline",
      } : undefined}
    />
  );
}

export function NoUsersFound() {
  return (
    <EmptyState
      variant="users"
      title="No users found"
      description="No users match your current search criteria. Try adjusting your filters or search terms."
    />
  );
}

export function NoReviewsFound() {
  return (
    <EmptyState
      variant="reviews"
      title="No reviews yet"
      description="This venue hasn't received any reviews yet. Be the first to share your experience!"
    />
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description="We encountered an error while loading the data. Please try again or contact support if the problem persists."
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        variant: "outline",
      } : undefined}
    />
  );
}
