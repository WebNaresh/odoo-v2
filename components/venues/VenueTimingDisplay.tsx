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
  className?: string;
}

export function VenueTimingDisplay({
  venueId,
  venueName,
  courts,
  selectedCourtId,
  className,
}: VenueTimingDisplayProps) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );

  const {
    data: courtsWithTimeSlots,
    isLoading,
    error,
  } = useCourtTimeSlots(courts, selectedDate);

  // Filter courts based on selectedCourtId if provided
  const filteredCourts = selectedCourtId
    ? courtsWithTimeSlots?.filter((court) => court.id === selectedCourtId)
    : courtsWithTimeSlots;

  // Generate next 7 days for date selection
  const availableDates = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfDay(new Date()), i)
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset selected time slot when date changes
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleBookSlot = () => {
    if (selectedTimeSlot) {
      // Navigate to booking page with selected slot
      window.location.href = `/venues/${venueId}/book?courtId=${selectedTimeSlot.courtId}&date=${selectedTimeSlot.date}&startTime=${selectedTimeSlot.startTime}`;
    }
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
          {selectedCourtId ? "Court Time Slots" : "Available Times"}
        </CardTitle>
        <CardDescription>
          {selectedCourtId
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {court.timeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={
                        selectedTimeSlot?.id === slot.id ? "default" : "outline"
                      }
                      size="sm"
                      className={cn(
                        "flex flex-col h-auto py-2 px-3",
                        !slot.isAvailable && "opacity-50 cursor-not-allowed",
                        slot.isPopular &&
                          selectedTimeSlot?.id !== slot.id &&
                          "border-orange-200 bg-orange-50"
                      )}
                      disabled={!slot.isAvailable}
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      <span className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <div className="flex items-center gap-1 text-xs">
                        <IndianRupee className="h-3 w-3" />
                        <span>{slot.price}</span>
                        {slot.isPopular && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            Popular
                          </Badge>
                        )}
                      </div>
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
        {selectedTimeSlot && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Selected Slot</h4>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {selectedTimeSlot.courtName}
                </span>
                <Badge variant="default">Selected</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(selectedDate, "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  <span>{selectedTimeSlot.price}</span>
                </div>
              </div>
              <Button className="w-full mt-3" onClick={handleBookSlot}>
                <Calendar className="h-4 w-4 mr-2" />
                Book This Slot
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
