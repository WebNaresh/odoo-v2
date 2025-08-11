"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Clock, Users, IndianRupee } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
  isPopular?: boolean;
  courtName?: string;
}

interface TimeSlotPickerProps {
  courtId?: string;
  onSlotSelect: (slot: TimeSlot, date: Date) => void;
  selectedSlot?: TimeSlot;
  selectedDate?: Date;
  className?: string;
}

// Mock time slots data
const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const basePrice = isWeekend ? 800 : 600;
  
  // Generate slots from 6 AM to 11 PM
  for (let hour = 6; hour < 23; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    // Peak hours (6-9 PM) cost more
    const isPeakHour = hour >= 18 && hour <= 21;
    const price = isPeakHour ? basePrice + 200 : basePrice;
    
    // Random availability for demo
    const isAvailable = Math.random() > 0.3;
    
    slots.push({
      id: `slot-${hour}`,
      startTime,
      endTime,
      price,
      isAvailable,
      isPopular: isPeakHour && isAvailable,
      courtName: `Court ${Math.floor(Math.random() * 3) + 1}`,
    });
  }
  
  return slots;
};

export function TimeSlotPicker({ 
  courtId, 
  onSlotSelect, 
  selectedSlot, 
  selectedDate,
  className 
}: TimeSlotPickerProps) {
  const [date, setDate] = useState<Date>(selectedDate || new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots(date));

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setTimeSlots(generateTimeSlots(newDate));
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      onSlotSelect(slot, date);
    }
  };

  const availableSlots = timeSlots.filter(slot => slot.isAvailable);
  const unavailableSlots = timeSlots.filter(slot => !slot.isAvailable);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
          <CardDescription>
            Choose your preferred date for booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
            className="rounded-md border"
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Selected: {format(date, "EEEE, MMMM d, yyyy")}</p>
            <p>{availableSlots.length} slots available</p>
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
          <CardDescription>
            Select your preferred time slot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableSlots.length > 0 ? (
            <>
              {/* Morning Slots */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                  Morning (6 AM - 12 PM)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSlots
                    .filter(slot => parseInt(slot.startTime.split(':')[0]) < 12)
                    .map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className={cn(
                          "h-auto p-3 flex flex-col items-start",
                          selectedSlot?.id === slot.id && "ring-2 ring-primary"
                        )}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {slot.isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <IndianRupee className="h-3 w-3" />
                          <span>{slot.price}</span>
                        </div>
                        {slot.courtName && (
                          <span className="text-xs text-muted-foreground">
                            {slot.courtName}
                          </span>
                        )}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                  Afternoon (12 PM - 6 PM)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSlots
                    .filter(slot => {
                      const hour = parseInt(slot.startTime.split(':')[0]);
                      return hour >= 12 && hour < 18;
                    })
                    .map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className={cn(
                          "h-auto p-3 flex flex-col items-start",
                          selectedSlot?.id === slot.id && "ring-2 ring-primary"
                        )}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {slot.isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <IndianRupee className="h-3 w-3" />
                          <span>{slot.price}</span>
                        </div>
                        {slot.courtName && (
                          <span className="text-xs text-muted-foreground">
                            {slot.courtName}
                          </span>
                        )}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Evening Slots */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground flex items-center gap-2">
                  Evening (6 PM - 11 PM)
                  <Badge variant="outline" className="text-xs">
                    Peak Hours
                  </Badge>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSlots
                    .filter(slot => parseInt(slot.startTime.split(':')[0]) >= 18)
                    .map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className={cn(
                          "h-auto p-3 flex flex-col items-start",
                          selectedSlot?.id === slot.id && "ring-2 ring-primary",
                          slot.isPopular && "border-orange-200 bg-orange-50 hover:bg-orange-100"
                        )}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {slot.isPopular && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <IndianRupee className="h-3 w-3" />
                          <span>{slot.price}</span>
                        </div>
                        {slot.courtName && (
                          <span className="text-xs text-muted-foreground">
                            {slot.courtName}
                          </span>
                        )}
                      </Button>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No slots available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                All time slots are booked for {format(date, "MMMM d, yyyy")}
              </p>
              <Button
                variant="outline"
                onClick={() => handleDateSelect(addDays(date, 1))}
              >
                Try Next Day
              </Button>
            </div>
          )}

          {/* Unavailable Slots Info */}
          {unavailableSlots.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Unavailable Slots</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {unavailableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="text-xs text-muted-foreground text-center p-2 bg-muted rounded border-dashed border"
                  >
                    {slot.startTime}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                These slots are already booked or unavailable
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-primary rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded" />
              <span>Popular</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted border-dashed border rounded" />
              <span>Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
