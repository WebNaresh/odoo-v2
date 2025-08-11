"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  IndianRupee,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import {
  useCourtTimeSlots,
  type CourtWithTimeSlots,
  type TimeSlot,
} from "@/hooks/useCourtTimeSlots";
import { cn } from "@/lib/utils";

interface VenueTimingDisplayProps {
  venueId: string;
  venueName: string;
  courts: any[];
  selectedCourtId?: string;
  selectedCourtIds?: string[];
  onTimeSlotSelect?: (
    timeSlot: {
      id: string;
      courtId: string;
      startTime: string;
      endTime: string;
      date: string;
      price: number;
    } | null
  ) => void;
  onTimeSlotsSelect?: (
    timeSlots: {
      id: string;
      courtId: string;
      startTime: string;
      endTime: string;
      date: string;
      price: number;
    }[]
  ) => void;
  onBookingRequest?: (
    timeSlots: {
      id: string;
      courtId: string;
      startTime: string;
      endTime: string;
      date: string;
      price: number;
    }[]
  ) => void;
  selectedTimeSlot?: {
    id: string;
    courtId: string;
    startTime: string;
    endTime: string;
    date: string;
    price: number;
  } | null;
  selectedTimeSlots?: {
    id: string;
    courtId: string;
    startTime: string;
    endTime: string;
    date: string;
    price: number;
  }[];
  className?: string;
}

export function VenueTimingDisplay({
  venueId,
  venueName,
  courts,
  selectedCourtId,
  selectedCourtIds,
  onTimeSlotSelect,
  onTimeSlotsSelect,
  onBookingRequest,
  selectedTimeSlot: externalSelectedTimeSlot,
  selectedTimeSlots: externalSelectedTimeSlots,
  className,
}: VenueTimingDisplayProps) {
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [internalSelectedTimeSlot, setInternalSelectedTimeSlot] =
    useState<TimeSlot | null>(null);
  const [internalSelectedTimeSlots, setInternalSelectedTimeSlots] = useState<
    TimeSlot[]
  >([]);

  // Helper function to convert external time slot to internal TimeSlot
  const convertToTimeSlot = (externalSlot: {
    id: string;
    courtId: string;
    startTime: string;
    endTime: string;
    date: string;
    price: number;
  }): TimeSlot => {
    // Find the court to get the court name
    const court = courts.find((c) => c.id === externalSlot.courtId);
    const courtName = court?.name || "Unknown Court";

    // Calculate duration from start and end time
    const startTime = new Date(
      `${externalSlot.date}T${externalSlot.startTime}`
    );
    const endTime = new Date(`${externalSlot.date}T${externalSlot.endTime}`);
    const duration = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );

    return {
      ...externalSlot,
      courtName,
      isAvailable: true, // Assume available if selected
      duration,
    };
  };

  // Convert external selected time slots to internal format
  const convertedExternalSlots =
    externalSelectedTimeSlots?.map(convertToTimeSlot) || [];

  // Use external selected time slots if provided, otherwise use internal state
  const selectedTimeSlots = externalSelectedTimeSlots
    ? convertedExternalSlots
    : internalSelectedTimeSlots;
  const selectedTimeSlot = externalSelectedTimeSlot || internalSelectedTimeSlot;

  // Debug state changes
  useEffect(() => {
    console.log("🔄 [STATE CHANGE] VenueTimingDisplay state updated:", {
      internalSelectedTimeSlots: internalSelectedTimeSlots.length,
      internalSelectedTimeSlotIds: internalSelectedTimeSlots.map((s) => s.id),
      externalSelectedTimeSlots: externalSelectedTimeSlots?.length || 0,
      externalSelectedTimeSlotIds:
        externalSelectedTimeSlots?.map((s) => s.id) || [],
      convertedExternalSlots: convertedExternalSlots.length,
      finalSelectedTimeSlots: selectedTimeSlots.length,
      finalSelectedTimeSlotsIds: selectedTimeSlots.map((s) => s.id),
      selectedTimeSlot: selectedTimeSlot
        ? {
            id: selectedTimeSlot.id,
            courtId: selectedTimeSlot.courtId,
            startTime: selectedTimeSlot.startTime,
          }
        : null,
    });
  }, [
    internalSelectedTimeSlots,
    externalSelectedTimeSlots,
    convertedExternalSlots,
    selectedTimeSlots,
    selectedTimeSlot,
  ]);

  const {
    data: courtsWithTimeSlots,
    isLoading,
    error,
  } = useCourtTimeSlots(courts, selectedDate);

  // Filter courts based on selectedCourtId or selectedCourtIds if provided
  const filteredCourts = (() => {
    if (selectedCourtIds && selectedCourtIds.length > 0) {
      return courtsWithTimeSlots?.filter((court) =>
        selectedCourtIds.includes(court.id)
      );
    }
    if (selectedCourtId) {
      return courtsWithTimeSlots?.filter(
        (court) => court.id === selectedCourtId
      );
    }
    return courtsWithTimeSlots;
  })();

  // Generate next 7 days for date selection
  const availableDates = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfDay(new Date()), i)
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setInternalSelectedTimeSlot(null); // Reset selected time slot when date changes
    setInternalSelectedTimeSlots([]); // Reset selected time slots when date changes

    // Reset external time slots if handlers provided
    if (onTimeSlotSelect) {
      onTimeSlotSelect(null);
    }
    if (onTimeSlotsSelect) {
      onTimeSlotsSelect([]);
    }
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    console.log("🎯 [SLOT SELECTION] Starting slot selection:", {
      slotId: timeSlot.id,
      courtId: timeSlot.courtId,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    });

    const slotData = {
      id: timeSlot.id,
      courtId: timeSlot.courtId,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      date: timeSlot.date,
      price: timeSlot.price,
    };

    // Check if slot is already selected
    const isSelected = internalSelectedTimeSlots.some(
      (slot) => slot.id === timeSlot.id
    );

    console.log("🔍 [SLOT SELECTION] Current state:", {
      isSelected,
      currentInternalSlots: internalSelectedTimeSlots.length,
      currentInternalSlotIds: internalSelectedTimeSlots.map((s) => s.id),
      externalSelectedTimeSlots: externalSelectedTimeSlots?.length || 0,
      externalSlotIds: externalSelectedTimeSlots?.map((s) => s.id) || [],
    });

    let newSelectedSlots: TimeSlot[];
    if (isSelected) {
      // Remove slot from selection
      newSelectedSlots = internalSelectedTimeSlots.filter(
        (slot) => slot.id !== timeSlot.id
      );
      console.log("➖ [SLOT SELECTION] Removing slot from selection");
    } else {
      // Add slot to selection
      newSelectedSlots = [...internalSelectedTimeSlots, timeSlot];
      console.log("➕ [SLOT SELECTION] Adding slot to selection");
    }

    console.log("📊 [SLOT SELECTION] New selection state:", {
      newSlotsCount: newSelectedSlots.length,
      newSlotIds: newSelectedSlots.map((s) => s.id),
    });

    setInternalSelectedTimeSlots(newSelectedSlots);

    // Call external handlers if provided
    if (onTimeSlotsSelect) {
      const slotsForCallback = newSelectedSlots.map((slot) => ({
        id: slot.id,
        courtId: slot.courtId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: slot.date,
        price: slot.price,
      }));

      console.log(
        "📤 [SLOT SELECTION] Calling onTimeSlotsSelect with:",
        slotsForCallback
      );
      onTimeSlotsSelect(slotsForCallback);
    }

    // For backward compatibility with single slot selection
    if (onTimeSlotSelect) {
      // Only pass single slot data if exactly one slot is selected
      const singleSlotData = newSelectedSlots.length === 1 ? slotData : null;
      console.log(
        "📤 [SLOT SELECTION] Calling onTimeSlotSelect with:",
        singleSlotData,
        "| Reason:",
        newSelectedSlots.length === 1
          ? "exactly 1 slot selected"
          : newSelectedSlots.length === 0
          ? "no slots selected"
          : `${newSelectedSlots.length} slots selected (multiple)`
      );
      onTimeSlotSelect(singleSlotData);
    }

    console.log("✅ [SLOT SELECTION] Selection completed");
  };

  const handleBookSlot = () => {
    console.log("🚀 [BOOK SLOT] Starting booking process");

    // Check if user is logged in
    if (status === "loading") {
      console.log("⏳ [BOOK SLOT] Authentication status loading...");
      if (typeof window !== "undefined" && (window as any).showToast) {
        (window as any).showToast(
          "Please wait while we check your login status...",
          "error"
        );
      }
      return;
    }

    if (status === "unauthenticated" || !session?.user) {
      console.log("❌ [BOOK SLOT] User not authenticated");
      if (typeof window !== "undefined") {
        if ((window as any).showToast) {
          (window as any).showToast("Please log in to book a venue", "error");
        }
        // Redirect to login with current page as callback
        window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(
          window.location.href
        )}`;
      }
      return;
    }

    console.log("✅ [BOOK SLOT] User is authenticated:", {
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
    });
    console.log("� [BOOK SLOT] Current state analysis:", {
      selectedTimeSlot: selectedTimeSlot,
      selectedTimeSlots: selectedTimeSlots,
      selectedTimeSlotsCount: selectedTimeSlots.length,
      internalSelectedTimeSlots: internalSelectedTimeSlots,
      internalSelectedTimeSlotsCount: internalSelectedTimeSlots.length,
      externalSelectedTimeSlots: externalSelectedTimeSlots,
      externalSelectedTimeSlotsCount: externalSelectedTimeSlots?.length || 0,
      convertedExternalSlots: convertedExternalSlots,
      convertedExternalSlotsCount: convertedExternalSlots.length,
    });

    // Debug the selectedTimeSlot derivation
    console.log("🔍 [BOOK SLOT] selectedTimeSlot derivation:", {
      externalSelectedTimeSlot: externalSelectedTimeSlot,
      internalSelectedTimeSlot: internalSelectedTimeSlot,
      finalSelectedTimeSlot: selectedTimeSlot,
    });

    if (selectedTimeSlots.length > 0) {
      console.log(
        `✅ [BOOK SLOT] ${selectedTimeSlots.length} slot(s) selected, proceeding with booking`
      );
      console.log(
        "📋 [BOOK SLOT] Available slots:",
        selectedTimeSlots.map((s) => ({
          id: s.id,
          courtId: s.courtId,
          startTime: s.startTime,
          endTime: s.endTime,
        }))
      );

      // Use the callback to let the parent component handle the booking
      if (onBookingRequest) {
        console.log("📤 [BOOK SLOT] Calling parent booking handler");
        onBookingRequest(
          selectedTimeSlots.map((slot) => ({
            id: slot.id,
            courtId: slot.courtId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            date: slot.date,
            price: slot.price,
          }))
        );
      } else {
        console.log(
          "⚠️ [BOOK SLOT] No booking handler provided, using fallback"
        );
        // Fallback for single slot - navigate to booking page
        if (selectedTimeSlots.length === 1) {
          const slot = selectedTimeSlots[0];
          window.location.href = `/venues/${venueId}/book?courtId=${slot.courtId}&date=${slot.date}&startTime=${slot.startTime}`;
        } else {
          // Show error for multiple slots without handler
          if (typeof window !== "undefined" && (window as any).showToast) {
            (window as any).showToast(
              "Multiple slot booking not supported in this context",
              "error"
            );
          }
        }
      }
    } else {
      console.log("❌ [BOOK SLOT] No slots selected");
      // Show error message to user
      if (typeof window !== "undefined" && (window as any).showToast) {
        (window as any).showToast(
          "Please select at least one time slot",
          "error"
        );
      }
    }
  };

  // Convert 24-hour format to 12-hour format
  const formatTime = (time: string) => {
    if (!time) return "";

    const [hourStr, minute] = time.split(":");
    const hour = parseInt(hourStr);

    if (hour === 0) return `12:${minute} AM`;
    if (hour < 12) return `${hour}:${minute} AM`;
    if (hour === 12) return `12:${minute} PM`;
    return `${hour - 12}:${minute} PM`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Times
          </CardTitle>
          <CardDescription>Loading available time slots...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-20 flex-shrink-0" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={j} className="h-10" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Unable to Load Times
          </CardTitle>
          <CardDescription>Failed to load available time slots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "An error occurred while loading time slots"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredCourts || filteredCourts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Times
          </CardTitle>
          <CardDescription>No courts available at {venueName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-4">🏟️</div>
            <h3 className="text-lg font-semibold mb-2">No Courts Available</h3>
            <p className="text-sm text-muted-foreground">
              This venue doesn't have any active courts at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {(selectedCourtIds && selectedCourtIds.length > 0) || selectedCourtId
            ? "Court Time Slots"
            : "Available Times"}
        </CardTitle>
        <CardDescription>
          {selectedCourtIds && selectedCourtIds.length > 0
            ? `Available time slots for ${
                selectedCourtIds.length
              } selected court${
                selectedCourtIds.length > 1 ? "s" : ""
              } at ${venueName}`
            : selectedCourtId
            ? `Available time slots for selected court at ${venueName}`
            : `Select a date and time slot at ${venueName}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div>
          <h4 className="font-medium mb-3">Select Date</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {availableDates.map((date) => (
              <Button
                key={date.toISOString()}
                variant={isSameDay(date, selectedDate) ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0 flex flex-col h-16 w-20"
                onClick={() => handleDateSelect(date)}
              >
                <span className="text-xs">{format(date, "EEE")}</span>
                <span className="text-lg font-bold">{format(date, "d")}</span>
                <span className="text-xs">{format(date, "MMM")}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Time Slots by Court */}
        <div>
          <h4 className="font-medium mb-3">Available Time Slots</h4>

          {filteredCourts.map((court) => (
            <div key={court.id} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium">{court.name}</h5>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{court.courtType}</span>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span>{court.pricePerHour}/hr</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Max {court.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {court.timeSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {court.timeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={
                        selectedTimeSlots.some((s) => s.id === slot.id)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={cn(
                        "flex flex-col h-auto py-3 px-2 min-h-[4.5rem] text-center relative",
                        !slot.isAvailable && "opacity-50 cursor-not-allowed",
                        slot.isPopular &&
                          !selectedTimeSlots.some((s) => s.id === slot.id) &&
                          "border-orange-200 bg-orange-50",
                        selectedTimeSlots.some((s) => s.id === slot.id) &&
                          "ring-2 ring-primary ring-offset-1"
                      )}
                      disabled={!slot.isAvailable}
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      <span className="font-medium text-xs leading-tight">
                        {formatTime(slot.startTime)}
                      </span>
                      <span className="text-xs text-muted-foreground">to</span>
                      <span className="font-medium text-xs leading-tight">
                        {formatTime(slot.endTime)}
                      </span>
                      <div className="flex items-center justify-center gap-1 text-xs mt-1">
                        <IndianRupee className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{slot.price}</span>
                      </div>
                      {slot.isPopular &&
                        !selectedTimeSlots.some((s) => s.id === slot.id) && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 mt-1"
                          >
                            Popular
                          </Badge>
                        )}
                      {selectedTimeSlots.some((s) => s.id === slot.id) && (
                        <Badge
                          variant="default"
                          className="text-[10px] px-1 py-0 mt-1"
                        >
                          Selected
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No available slots for {format(selectedDate, "MMM d, yyyy")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Slot Summary */}
        {selectedTimeSlots.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">
              Selected Slot{selectedTimeSlots.length > 1 ? "s" : ""} (
              {selectedTimeSlots.length})
            </h4>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              {selectedTimeSlots.slice(0, 3).map((slot, index) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{slot.courtName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(slot.startTime)} -{" "}
                        {formatTime(slot.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span>{slot.price}</span>
                    </div>
                  </div>
                </div>
              ))}

              {selectedTimeSlots.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{selectedTimeSlots.length - 3} more slots selected
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total Cost:</span>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-bold">
                      {selectedTimeSlots.reduce(
                        (total, slot) => total + slot.price,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-3"
                onClick={handleBookSlot}
                disabled={status === "loading"}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {status === "loading"
                  ? "Checking login..."
                  : status === "unauthenticated"
                  ? "Login to Book"
                  : `Book ${selectedTimeSlots.length} Slot${
                      selectedTimeSlots.length > 1 ? "s" : ""
                    }`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
