"use client";

import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfDay } from "date-fns";

export interface TimeSlot {
  id: string;
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  date: string;
  price: number;
  isAvailable: boolean;
  isPopular?: boolean;
  duration: number; // in minutes
}

export interface CourtWithTimeSlots {
  id: string;
  name: string;
  courtType: string;
  pricePerHour: number;
  capacity: number;
  slotDuration: number;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

// Generate time slots based on court configuration
function generateTimeSlots(
  court: any,
  selectedDate: Date = new Date(),
  availability?: Record<string, {
    courtId: string;
    courtName: string;
    capacity: number;
    bookedSlots: Array<{
      startTime: string;
      endTime: string;
      bookedPlayers: number;
      availableSpots: number;
      isFullyBooked: boolean;
    }>;
  }>
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Use default values if slotConfig is not available
  const slotConfig = court.slotConfig || {
    startTime: "08:00",
    endTime: "21:00",
    isEnabled: true
  };

  if (!slotConfig.isEnabled) {
    return slots;
  }

  const { startTime, endTime } = slotConfig;
  const slotDuration = court.slotDuration || 60; // Default 60 minutes
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Generate slots
  for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += slotDuration) {
    const slotEndMinutes = currentMinutes + slotDuration;

    if (slotEndMinutes > endMinutes) break;

    const startHour = Math.floor(currentMinutes / 60);
    const startMin = currentMinutes % 60;
    const endHour = Math.floor(slotEndMinutes / 60);
    const endMin = slotEndMinutes % 60;

    const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    // Check if this slot is excluded (break periods)
    const isExcluded = court.excludedTimes?.some((excludedTime: any) => {
      const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
      if (!excludedTime.days.includes(dayOfWeek)) return false;

      const excludedStart = excludedTime.startTime;
      const excludedEnd = excludedTime.endTime;

      return (
        (startTimeStr >= excludedStart && startTimeStr < excludedEnd) ||
        (endTimeStr > excludedStart && endTimeStr <= excludedEnd) ||
        (startTimeStr <= excludedStart && endTimeStr >= excludedEnd)
      );
    });

    if (!isExcluded) {
      // Check availability against real booking data
      let isAvailable = true;

      console.log(`🔍 [TIME SLOTS] Checking slot ${startTimeStr}-${endTimeStr} for court ${court.id}:`, {
        hasAvailabilityData: !!(availability && availability[court.id]),
        availabilityKeys: availability ? Object.keys(availability) : [],
        courtId: court.id,
        startTimeStr,
        endTimeStr,
      });

      if (availability && availability[court.id]) {
        const courtAvailability = availability[court.id];
        console.log(`📊 [TIME SLOTS] Court ${court.id} availability data:`, {
          courtName: courtAvailability.courtName,
          capacity: courtAvailability.capacity,
          bookedSlotsCount: courtAvailability.bookedSlots.length,
          bookedSlots: courtAvailability.bookedSlots,
        });

        const bookedSlot = courtAvailability.bookedSlots.find(
          slot => slot.startTime === startTimeStr && slot.endTime === endTimeStr
        );

        console.log(`🔍 [TIME SLOTS] Looking for slot ${startTimeStr}-${endTimeStr}:`, {
          found: !!bookedSlot,
          bookedSlot,
          searchingFor: { startTime: startTimeStr, endTime: endTimeStr },
        });

        if (bookedSlot) {
          // Disable slot if it has any bookings (regardless of capacity)
          isAvailable = false;
          console.log(`❌ [TIME SLOTS] DISABLING slot ${startTimeStr}-${endTimeStr} for court ${court.id}:`, {
            bookedPlayers: bookedSlot.bookedPlayers,
            availableSpots: bookedSlot.availableSpots,
            isFullyBooked: bookedSlot.isFullyBooked,
            isAvailable,
            reason: "Slot has existing bookings - disabled",
          });
        } else {
          console.log(`✅ [TIME SLOTS] Slot ${startTimeStr}-${endTimeStr} is available (no bookings found)`);
        }
      } else {
        console.log(`📊 [TIME SLOTS] No availability data for court ${court.id}, defaulting to available`);
      }

      slots.push({
        id: `${court.id}-${dateStr}-${startTimeStr}`,
        courtId: court.id,
        courtName: court.name,
        startTime: startTimeStr,
        endTime: endTimeStr,
        date: dateStr,
        price: court.pricePerHour,
        isAvailable,
        duration: slotDuration,
        isPopular: startHour >= 18 && startHour <= 21, // Evening slots are popular
      });
    }
  }

  return slots;
}

// Updated hook that accepts courts data directly and fetches availability
export function useCourtTimeSlots(courts: any[], selectedDate: Date = new Date(), venueId?: string) {
  return useQuery({
    queryKey: ['court-time-slots', courts?.map(c => c.id).join(','), format(selectedDate, 'yyyy-MM-dd'), venueId],
    queryFn: async (): Promise<CourtWithTimeSlots[]> => {
      if (!courts || courts.length === 0) {
        return [];
      }

      let availability: any = {};

      // Fetch availability data if venueId is provided
      if (venueId) {
        try {
          const courtIds = courts.map(c => c.id).join(',');
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const response = await fetch(`/api/venues/${venueId}/availability?date=${dateStr}&courtIds=${courtIds}`);

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              availability = data.availability || {};
              console.log("📊 [COURT TIME SLOTS] Fetched availability data:", {
                success: data.success,
                date: data.date,
                availabilityKeys: Object.keys(availability),
                fullAvailability: availability,
              });
            } else {
              console.error("❌ [COURT TIME SLOTS] API returned error:", data);
            }
          } else {
            console.error("❌ [COURT TIME SLOTS] API request failed:", response.status, response.statusText);
          }
        } catch (error) {
          console.error("❌ [COURT TIME SLOTS] Failed to fetch availability:", error);
        }
      }

      // Generate time slots for each court with availability data
      const courtsWithTimeSlots: CourtWithTimeSlots[] = courts.map((court: any) => ({
        id: court.id,
        name: court.name,
        courtType: court.courtType,
        pricePerHour: court.pricePerHour,
        capacity: court.capacity || 10,
        slotDuration: court.slotDuration || 60,
        isActive: court.isActive,
        timeSlots: generateTimeSlots(court, selectedDate, availability),
      }));

      return courtsWithTimeSlots.filter(court => court.isActive);
    },
    enabled: !!courts && courts.length > 0,
    staleTime: 30 * 1000, // 30 seconds - shorter for real-time availability
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
  });
}

// Hook to get available time slots for next 7 days
export function useUpcomingTimeSlots(courts: any[], days: number = 7) {
  return useQuery({
    queryKey: ['upcoming-time-slots', courts?.map(c => c.id).join(','), days],
    queryFn: async (): Promise<{ date: Date; courts: CourtWithTimeSlots[] }[]> => {
      if (!courts || courts.length === 0) {
        return [];
      }

      const results = [];

      for (let i = 0; i < days; i++) {
        const date = addDays(startOfDay(new Date()), i);

        try {
          const courtsWithTimeSlots: CourtWithTimeSlots[] = courts.map((court: any) => ({
            id: court.id,
            name: court.name,
            courtType: court.courtType,
            pricePerHour: court.pricePerHour,
            capacity: court.capacity || 10,
            slotDuration: court.slotDuration || 60,
            isActive: court.isActive,
            timeSlots: generateTimeSlots(court, date),
          }));

          results.push({
            date,
            courts: courtsWithTimeSlots.filter(court => court.isActive),
          });
        } catch (error) {
          console.error(`Failed to generate slots for ${format(date, 'yyyy-MM-dd')}:`, error);
        }
      }

      return results;
    },
    enabled: !!courts && courts.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}
