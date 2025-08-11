import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized"
        },
        { status: 401 }
      );
    }

    // Only allow FACILITY_OWNER users
    if (session.user.role !== "FACILITY_OWNER") {
      return NextResponse.json(
        {
          success: false,
          error: "Only facility owners can access this endpoint"
        },
        { status: 403 }
      );
    }

    const ownerId = session.user.id;

    // Get current date and calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get owner's venues
    const venues = await prisma.venue.findMany({
      where: {
        ownerId: ownerId,
        isActive: true
      },
      include: {
        courts: {
          where: { isActive: true },
          include: {
            bookings: {
              where: {
                status: { in: ["CONFIRMED", "COMPLETED"] },
                paymentStatus: "PAID"
              }
            }
          }
        },
        reviews: true,
        _count: {
          select: {
            courts: true,
            reviews: true
          }
        }
      }
    });

    // Calculate total facilities
    const totalFacilities = venues.length;

    // Calculate total courts
    const totalCourts = venues.reduce((sum, venue) => sum + venue.courts.length, 0);

    // Get all bookings for owner's venues
    const allBookings = venues.flatMap(venue => 
      venue.courts.flatMap(court => court.bookings)
    );

    // Calculate current month stats
    const currentMonthBookings = allBookings.filter(booking => 
      booking.createdAt >= startOfMonth
    );

    const currentMonthRevenue = currentMonthBookings.reduce((sum, booking) => 
      sum + booking.totalPrice, 0
    );

    // Calculate last month stats for growth comparison
    const lastMonthBookings = allBookings.filter(booking => 
      booking.createdAt >= startOfLastMonth && booking.createdAt <= endOfLastMonth
    );

    const lastMonthRevenue = lastMonthBookings.reduce((sum, booking) => 
      sum + booking.totalPrice, 0
    );

    // Calculate growth percentages
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    const bookingGrowth = lastMonthBookings.length > 0 
      ? ((currentMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100 
      : 0;

    // Calculate average rating
    const allReviews = venues.flatMap(venue => venue.reviews);
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : 0;

    // Calculate occupancy rate (simplified - based on bookings vs available slots)
    const totalBookingsThisMonth = currentMonthBookings.length;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const operatingHoursPerDay = 12; // Assuming 12 hours operation per day
    const totalAvailableSlots = totalCourts * daysInMonth * operatingHoursPerDay;
    const occupancyRate = totalAvailableSlots > 0 
      ? (totalBookingsThisMonth / totalAvailableSlots) * 100 
      : 0;

    // Calculate total revenue (all time)
    const totalRevenue = allBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Calculate total bookings (all time)
    const totalBookings = allBookings.length;

    // Get recent bookings for activity feed
    const recentBookings = allBookings
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(booking => {
        const venue = venues.find(v => v.courts.some(c => c.id === booking.courtId));
        const court = venue?.courts.find(c => c.id === booking.courtId);
        return {
          id: booking.id,
          customerName: "Customer", // We don't have user details in this query
          venueName: venue?.name || "Unknown Venue",
          courtName: court?.name || "Unknown Court",
          date: booking.bookingDate.toISOString().split('T')[0],
          time: `${booking.startTime.toLocaleTimeString()} - ${booking.endTime.toLocaleTimeString()}`,
          amount: booking.totalPrice,
          status: booking.status.toLowerCase(),
          createdAt: booking.createdAt
        };
      });

    // Prepare stats response
    const stats = {
      totalRevenue: Math.round(totalRevenue),
      monthlyGrowth: Math.round(revenueGrowth * 100) / 100,
      totalBookings,
      bookingGrowth: Math.round(bookingGrowth * 100) / 100,
      totalFacilities,
      totalCourts,
      averageRating: Math.round(averageRating * 10) / 10,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      currentMonthRevenue: Math.round(currentMonthRevenue),
      currentMonthBookings: currentMonthBookings.length,
      lastMonthRevenue: Math.round(lastMonthRevenue),
      lastMonthBookings: lastMonthBookings.length,
      totalReviews: allReviews.length
    };

    return NextResponse.json({
      success: true,
      stats,
      recentBookings,
      venues: venues.map(venue => ({
        id: venue.id,
        name: venue.name,
        courtsCount: venue.courts.length,
        rating: venue.rating || 0,
        reviewCount: venue._count.reviews,
        status: venue.approvalStatus.toLowerCase(),
        bookingsToday: venue.courts.flatMap(court => 
          court.bookings.filter(booking => 
            booking.bookingDate.toDateString() === now.toDateString()
          )
        ).length
      }))
    });

  } catch (error) {
    console.error("Error fetching owner dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard stats"
      },
      { status: 500 }
    );
  }
}
