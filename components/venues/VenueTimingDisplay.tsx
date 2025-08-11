"use client";

import { useState } from "react";
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
  selectedTimeSlot: externalSelectedTimeSlot,
  selectedTimeSlots: externalSelectedTimeSlots,
  className,
}: VenueTimingDisplayProps) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [internalSelectedTimeSlot, setInternalSelectedTimeSlot] =
    useState<TimeSlot | null>(null);
  const [internalSelectedTimeSlots, setInternalSelectedTimeSlots] = useState<
    TimeSlot[]
  >([]);

  // Use external selected time slots if provided, otherwise use internal state
  const selectedTimeSlots =
    externalSelectedTimeSlots || internalSelectedTimeSlots;
  const selectedTimeSlot = externalSelectedTimeSlot || internalSelectedTimeSlot;

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
    const slotData = {
      id: timeSlot.id,
      courtId: timeSlot.courtId,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      date: timeSlot.date,
      price: timeSlot.price,
    };

    // Check if slot is already selected
    const isSelected = selectedTimeSlots.some(
      (slot) => slot.id === timeSlot.id
    );

    let newSelectedSlots: TimeSlot[];
    if (isSelected) {
      // Remove slot from selection
      newSelectedSlots = selectedTimeSlots.filter(
        (slot) => slot.id !== timeSlot.id
      );
    } else {
      // Add slot to selection
      newSelectedSlots = [...selectedTimeSlots, timeSlot];
    }

    setInternalSelectedTimeSlots(newSelectedSlots);

    // Call external handlers if provided
    if (onTimeSlotsSelect) {
      onTimeSlotsSelect(
        newSelectedSlots.map((slot) => ({
          id: slot.id,
          courtId: slot.courtId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: slot.date,
          price: slot.price,
        }))
      );
    }

    // For backward compatibility with single slot selection
    if (onTimeSlotSelect) {
      onTimeSlotSelect(newSelectedSlots.length > 0 ? slotData : null);
    }
  };

  const handleBookSlot = () => {
    if (selectedTimeSlot) {
      // Navigate to booking page with selected slot
      window.location.href = `/venues/${venueId}/book?courtId=${selectedTimeSlot.courtId}&date=${selectedTimeSlot.date}&startTime=${selectedTimeSlot.startTime}`;
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

              <Button className="w-full mt-3" onClick={handleBookSlot}>
                <Calendar className="h-4 w-4 mr-2" />
                Book {selectedTimeSlots.length} Slot
                {selectedTimeSlots.length > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
