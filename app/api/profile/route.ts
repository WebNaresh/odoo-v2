import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [PROFILE API] Starting profile data request");

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("❌ [PROFILE API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 [PROFILE API] Session user:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Fetch user basic data first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedVenues: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      console.log("❌ [PROFILE API] User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch bookings without venue include to avoid relationship errors
    const rawBookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        court: {
          select: {
            id: true,
            name: true,
            venueId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Get unique venue IDs from courts
    const venueIds = [...new Set(rawBookings.map(b => b.court.venueId))];

    // Fetch venues separately
    const venues = await prisma.venue.findMany({
      where: {
        id: { in: venueIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Create venue lookup map
    const venueMap = new Map(venues.map(v => [v.id, v]));

    // Combine booking data with venue information
    const bookings = rawBookings.map(booking => ({
      ...booking,
      court: {
        ...booking.court,
        venue: venueMap.get(booking.court.venueId) || null,
      },
    }));

    // Fetch reviews with defensive querying
    const rawReviews = await prisma.review.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        rating: true,
        comment: true,
        venueId: true,
        createdAt: true,
      },
    });

    // Get venue data for reviews
    const reviewVenueIds = [...new Set(rawReviews.map(r => r.venueId))];
    const reviewVenues = await prisma.venue.findMany({
      where: {
        id: { in: reviewVenueIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const reviewVenueMap = new Map(reviewVenues.map(v => [v.id, v]));

    // Combine review data with venue information
    const reviews = rawReviews.map(review => ({
      ...review,
      venue: reviewVenueMap.get(review.venueId) || null,
    }));

    // Calculate user statistics
    const validBookings = bookings.filter((booking) => booking.court && booking.court.venue);
    const totalBookings = validBookings.length;
    const completedBookings = validBookings.filter(
      (booking) => booking.status === "COMPLETED"
    ).length;
    const totalSpent = validBookings
      .filter((booking) => booking.paymentStatus === "PAID")
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    const reviewsGiven = reviews.filter((review) => review.venue).length;

    // Get recent bookings with venue and court info
    const recentBookings = bookings
      .slice(0, 5)
      .filter((booking) => booking.court && booking.court.venue) // Filter out bookings with missing venue/court data
      .map((booking) => ({
        id: booking.id,
        venueName: booking.court.venue?.name || "Unknown Venue",
        courtName: booking.court.name,
        date: booking.bookingDate.toISOString().split("T")[0],
        time: `${booking.startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${booking.endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        status: booking.status,
        amount: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
      }));

    // Calculate additional stats
    const memberSince = user.createdAt.toLocaleDateString();
    const favoriteVenues = 0; // TODO: Implement favorites system

    const profileData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isBanned: user.isBanned,
      },
      stats: {
        totalBookings,
        completedBookings,
        totalSpent,
        favoriteVenues,
        reviewsGiven,
        memberSince,
      },
      recentBookings,
      ownedVenues: user.ownedVenues,
    };

    console.log("✅ [PROFILE API] Profile data fetched successfully:", {
      userId: user.id,
      totalBookings,
      completedBookings,
      totalSpent,
    });

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("❌ [PROFILE API] Error fetching profile data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔍 [PROFILE API] Starting profile update request");

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("❌ [PROFILE API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, bio, location, website } = await request.json();

    console.log("📝 [PROFILE API] Update data:", {
      name,
      phone,
      bio,
      location,
      website,
    });

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        // Note: phone, bio, location, website would need to be added to the User model
        // For now, we'll only update the name field
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("✅ [PROFILE API] Profile updated successfully:", {
      userId: updatedUser.id,
      name: updatedUser.name,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ [PROFILE API] Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
