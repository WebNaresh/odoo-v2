"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const createBookingSchema = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  timeSlotId: z.string().min(1, "Time slot ID is required"),
  playerCount: z.number().min(1, "At least 1 player required").max(50, "Maximum 50 players allowed"),
  notes: z.string().optional(),
});

const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  cancellationReason: z.string().optional(),
});

// Generate unique booking reference
function generateBookingReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BK${timestamp}${random}`.toUpperCase();
}

// Create booking action
export async function createBooking(data: z.infer<typeof createBookingSchema>) {
  try {
    // Validate input
    const validatedData = createBookingSchema.parse(data);

    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Start transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Parse dynamic time slot ID (format: courtId-date-time)
      let courtId: string;
      let slotDate: string;
      let slotStartTime: string;
      let slotEndTime: string;
      let timeSlotPrice: number = 500; // Default price

      if (validatedData.timeSlotId.includes('-') && validatedData.timeSlotId.split('-').length >= 3) {
        // Dynamic time slot ID
        const parts = validatedData.timeSlotId.split('-');
        courtId = parts[0];
        slotDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
        slotStartTime = parts[4];

        // Calculate end time (assume 1 hour slots)
        const startHour = parseInt(slotStartTime.split(':')[0]);
        slotEndTime = `${String(startHour + 1).padStart(2, '0')}:${slotStartTime.split(':')[1]}`;

        console.log("🔍 [BOOKING] Parsed dynamic time slot:", {
          timeSlotId: validatedData.timeSlotId,
          courtId,
          slotDate,
          slotStartTime,
          slotEndTime,
        });

        // Check if court matches
        if (courtId !== validatedData.courtId) {
          throw new Error("Court and time slot mismatch");
        }

        // Get court details
        const court = await tx.court.findUnique({
          where: { id: courtId },
          include: {
            venue: true,
          },
        });

        if (!court) {
          throw new Error("Court not found");
        }

        if (!court.isActive) {
          throw new Error("Court is not active");
        }

        timeSlotPrice = court.pricePerHour;

        // Check for existing bookings for this time slot
        const slotDateTime = new Date(`${slotDate}T${slotStartTime}:00`);
        const slotEndDateTime = new Date(`${slotDate}T${slotEndTime}:00`);

        const existingBookings = await tx.booking.findMany({
          where: {
            courtId: courtId,
            startTime: {
              gte: slotDateTime,
              lt: slotEndDateTime,
            },
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        });

        // Check capacity
        const maxCapacity = court.capacity;
        const currentBookedPlayers = existingBookings.reduce(
          (total, booking) => total + booking.playerCount,
          0
        );

        if (currentBookedPlayers + validatedData.playerCount > maxCapacity) {
          throw new Error(
            `Insufficient capacity. Available spots: ${maxCapacity - currentBookedPlayers}`
          );
        }

        // Check for existing booking by same user for same slot
        const userExistingBooking = existingBookings.find(
          booking => booking.userId === session.user.id
        );

        if (userExistingBooking) {
          throw new Error("You already have a booking for this time slot");
        }

        // Create the booking data for dynamic slots
        const bookingData = {
          userId: session.user.id,
          courtId: validatedData.courtId,
          timeSlotId: null, // No database time slot for dynamic slots
          bookingDate: slotDateTime,
          startTime: slotDateTime,
          endTime: slotEndDateTime,
          duration: 60, // 1 hour
          totalPrice: timeSlotPrice * validatedData.playerCount,
          playerCount: validatedData.playerCount,
          bookingReference: generateBookingReference(),
          notes: validatedData.notes,
          status: "PENDING" as const,
          paymentStatus: "PENDING" as const,
        };

        const booking = await tx.booking.create({
          data: bookingData,
          include: {
            court: {
              include: {
                venue: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return booking;

      } else {
        // Database time slot ID - use existing logic
        const timeSlot = await tx.timeSlot.findUnique({
          where: { id: validatedData.timeSlotId },
          include: {
            court: {
              include: {
                venue: true,
              },
            },
            bookings: {
              where: {
                status: {
                  in: ["PENDING", "CONFIRMED"],
                },
              },
            },
          },
        });

        if (!timeSlot) {
          throw new Error("Time slot not found");
        }

        if (!timeSlot.isAvailable || timeSlot.status !== "AVAILABLE") {
          throw new Error("Time slot is not available");
        }

        // Check if court matches
        if (timeSlot.courtId !== validatedData.courtId) {
          throw new Error("Court and time slot mismatch");
        }

        // Check capacity
        const maxCapacity = timeSlot.maxCapacity || timeSlot.court.capacity;
        const currentBookedPlayers = timeSlot.bookings.reduce(
          (total, booking) => total + booking.playerCount,
          0
        );

        if (currentBookedPlayers + validatedData.playerCount > maxCapacity) {
          throw new Error(
            `Insufficient capacity. Available spots: ${maxCapacity - currentBookedPlayers}`
          );
        }

        // Check for existing booking by same user for same slot
        const existingBooking = await tx.booking.findFirst({
          where: {
            userId: session.user.id,
            timeSlotId: validatedData.timeSlotId,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        });

        if (existingBooking) {
          throw new Error("You already have a booking for this time slot");
        }

        // Calculate total price
        const totalPrice = timeSlot.price * (validatedData.playerCount / timeSlot.court.capacity);

        // Create booking
        const booking = await tx.booking.create({
          data: {
            userId: session.user.id,
            courtId: validatedData.courtId,
            timeSlotId: validatedData.timeSlotId,
            bookingDate: timeSlot.date,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            duration: Math.round(
              (timeSlot.endTime.getTime() - timeSlot.startTime.getTime()) / (1000 * 60)
            ),
            totalPrice,
            playerCount: validatedData.playerCount,
            bookingReference: generateBookingReference(),
            notes: validatedData.notes,
            status: "PENDING",
            paymentStatus: "PENDING",
          },
          include: {
            court: {
              include: {
                venue: true,
              },
            },
            timeSlot: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Update time slot booking count
        await tx.timeSlot.update({
          where: { id: validatedData.timeSlotId },
          data: {
            currentBookings: {
              increment: 1,
            },
            // Mark as booked if at capacity
            status: currentBookedPlayers + validatedData.playerCount >= maxCapacity ? "BOOKED" : "AVAILABLE",
            isAvailable: currentBookedPlayers + validatedData.playerCount < maxCapacity,
          },
        });

        return booking;
      }
    });

    // Revalidate relevant paths
    revalidatePath(`/venues/${result.court.venue.id}`);
    revalidatePath("/bookings");

    return {
      success: true,
      booking: result,
      message: "Booking created successfully",
    };
  } catch (error) {
    console.error("Create booking error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create booking",
    };
  }
}

// Cancel booking action
export async function cancelBooking(data: z.infer<typeof cancelBookingSchema>) {
  try {
    // Validate input
    const validatedData = cancelBookingSchema.parse(data);

    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get booking with related data
      const booking = await tx.booking.findUnique({
        where: { id: validatedData.bookingId },
        include: {
          timeSlot: true,
          court: {
            include: {
              venue: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Check ownership
      if (booking.userId !== session.user.id) {
        throw new Error("You can only cancel your own bookings");
      }

      // Check if booking can be cancelled
      if (booking.status === "CANCELLED") {
        throw new Error("Booking is already cancelled");
      }

      if (booking.status === "COMPLETED") {
        throw new Error("Cannot cancel completed booking");
      }

      // Check cancellation policy (e.g., can't cancel within 2 hours)
      const now = new Date();
      const bookingTime = new Date(booking.startTime);
      const timeDiff = bookingTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 2) {
        throw new Error("Cannot cancel booking within 2 hours of start time");
      }

      // Update booking
      const updatedBooking = await tx.booking.update({
        where: { id: validatedData.bookingId },
        data: {
          status: "CANCELLED",
          cancellationReason: validatedData.cancellationReason,
          updatedAt: new Date(),
        },
        include: {
          court: {
            include: {
              venue: true,
            },
          },
          timeSlot: true,
        },
      });

      // Update time slot availability
      if (booking.timeSlot) {
        await tx.timeSlot.update({
          where: { id: booking.timeSlotId! },
          data: {
            currentBookings: {
              decrement: 1,
            },
            status: "AVAILABLE",
            isAvailable: true,
          },
        });
      }

      return updatedBooking;
    });

    // Revalidate relevant paths
    revalidatePath(`/venues/${result.court.venue.id}`);
    revalidatePath("/bookings");

    return {
      success: true,
      booking: result,
      message: "Booking cancelled successfully",
    };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel booking",
    };
  }
}

// Get user bookings
export async function getUserBookings() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        court: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
                photoUrls: true,
              },
            },
          },
        },
        timeSlot: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      bookings,
    };
  } catch (error) {
    console.error("Get user bookings error:", error);
    return {
      success: false,
      error: "Failed to fetch bookings",
    };
  }
}
