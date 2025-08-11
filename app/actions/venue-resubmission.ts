"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Cooldown period in milliseconds (24 hours)
const RESUBMISSION_COOLDOWN = 24 * 60 * 60 * 1000;

// Maximum resubmission attempts allowed
const MAX_RESUBMISSION_ATTEMPTS = 5;

export interface ResubmissionResult {
  success: boolean;
  error?: string;
  cooldownEndsAt?: Date;
  attemptsRemaining?: number;
}

export async function resubmitVenueForReview(venueId: string): Promise<ResubmissionResult> {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Authentication required. Please sign in to continue.",
      };
    }

    // Find the venue and verify ownership
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        owner: true,
      },
    });

    if (!venue) {
      return {
        success: false,
        error: "Venue not found.",
      };
    }

    // Verify ownership
    if (venue.owner.email !== session.user.email) {
      return {
        success: false,
        error: "You don't have permission to resubmit this venue.",
      };
    }

    // Check if venue is in REJECTED status
    if (venue.approvalStatus !== "REJECTED") {
      return {
        success: false,
        error: "Only rejected venues can be resubmitted for review.",
      };
    }

    // Check resubmission attempts limit
    if (venue.resubmissionCount >= MAX_RESUBMISSION_ATTEMPTS) {
      return {
        success: false,
        error: `Maximum resubmission attempts (${MAX_RESUBMISSION_ATTEMPTS}) reached. Please contact support for assistance.`,
      };
    }

    // Check cooldown period
    if (venue.lastResubmissionAt) {
      const timeSinceLastResubmission = Date.now() - venue.lastResubmissionAt.getTime();
      if (timeSinceLastResubmission < RESUBMISSION_COOLDOWN) {
        const cooldownEndsAt = new Date(venue.lastResubmissionAt.getTime() + RESUBMISSION_COOLDOWN);
        const hoursRemaining = Math.ceil((cooldownEndsAt.getTime() - Date.now()) / (1000 * 60 * 60));

        return {
          success: false,
          error: `Please wait ${hoursRemaining} hours before resubmitting. You can resubmit after ${cooldownEndsAt.toLocaleString()}.`,
          cooldownEndsAt,
        };
      }
    }

    // Update venue status and tracking fields
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: {
        approvalStatus: "PENDING",
        rejectionReason: null, // Clear previous rejection reason
        resubmissionCount: venue.resubmissionCount + 1,
        lastResubmissionAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate the venue details page
    revalidatePath(`/owner/venues/${venueId}`);
    revalidatePath("/owner/venues");

    console.log(`✅ [VENUE RESUBMISSION] Venue ${venueId} resubmitted successfully by ${session.user.email}`);

    return {
      success: true,
      attemptsRemaining: MAX_RESUBMISSION_ATTEMPTS - updatedVenue.resubmissionCount,
    };

  } catch (error) {
    console.error("❌ [VENUE RESUBMISSION] Error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function getResubmissionStatus(venueId: string): Promise<{
  canResubmit: boolean;
  cooldownEndsAt?: Date;
  attemptsRemaining: number;
  error?: string;
}> {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        canResubmit: false,
        attemptsRemaining: 0,
        error: "Authentication required.",
      };
    }

    // Find the venue and verify ownership
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        owner: true,
      },
    });

    if (!venue) {
      return {
        canResubmit: false,
        attemptsRemaining: 0,
        error: "Venue not found.",
      };
    }

    // Verify ownership
    if (venue.owner.email !== session.user.email) {
      return {
        canResubmit: false,
        attemptsRemaining: 0,
        error: "Access denied.",
      };
    }

    // Check if venue is rejected
    if (venue.approvalStatus !== "REJECTED") {
      return {
        canResubmit: false,
        attemptsRemaining: MAX_RESUBMISSION_ATTEMPTS - venue.resubmissionCount,
      };
    }

    // Check attempts limit
    const attemptsRemaining = MAX_RESUBMISSION_ATTEMPTS - venue.resubmissionCount;
    if (attemptsRemaining <= 0) {
      return {
        canResubmit: false,
        attemptsRemaining: 0,
        error: "Maximum resubmission attempts reached.",
      };
    }

    // Check cooldown
    if (venue.lastResubmissionAt) {
      const timeSinceLastResubmission = Date.now() - venue.lastResubmissionAt.getTime();
      if (timeSinceLastResubmission < RESUBMISSION_COOLDOWN) {
        const cooldownEndsAt = new Date(venue.lastResubmissionAt.getTime() + RESUBMISSION_COOLDOWN);
        return {
          canResubmit: false,
          cooldownEndsAt,
          attemptsRemaining,
        };
      }
    }

    return {
      canResubmit: true,
      attemptsRemaining,
    };

  } catch (error) {
    console.error("❌ [RESUBMISSION STATUS] Error:", error);
    return {
      canResubmit: false,
      attemptsRemaining: 0,
      error: "Failed to check resubmission status.",
    };
  }
}
