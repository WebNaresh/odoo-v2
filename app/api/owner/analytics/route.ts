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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // day, week, month, year
    const venueId = searchParams.get("venueId");

    const ownerId = session.user.id;

    // Get date ranges based on period
    const now = new Date();
    let startDate: Date;
    let groupByFormat: string;

    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        groupByFormat = "day";
        break;
      case "week":
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        groupByFormat = "week";
        break;
      case "year":
        startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000); // Last 5 years
        groupByFormat = "year";
        break;
      default: // month
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        groupByFormat = "month";
        break;
    }

    // Get owner's venues
    const venueFilter = venueId ? { id: venueId, ownerId } : { ownerId };
    
    const venues = await prisma.venue.findMany({
      where: {
        ...venueFilter,
        isActive: true
      },
      include: {
        courts: {
          where: { isActive: true },
          include: {
            bookings: {
              where: {
                createdAt: { gte: startDate },
                status: { in: ["CONFIRMED", "COMPLETED"] },
                paymentStatus: "PAID"
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          where: {
            createdAt: { gte: startDate }
          }
        }
      }
    });

    // Get all bookings for analytics
    const allBookings = venues.flatMap(venue => 
      venue.courts.flatMap(court => court.bookings)
    );

    // Revenue trends
    const revenueTrends = generateTimeSeries(allBookings, startDate, now, groupByFormat, "revenue");
    
    // Booking trends
    const bookingTrends = generateTimeSeries(allBookings, startDate, now, groupByFormat, "count");

    // Peak hours analysis
    const peakHours = generatePeakHoursAnalysis(allBookings);

    // Venue performance comparison
    const venuePerformance = venues.map(venue => {
      const venueBookings = venue.courts.flatMap(court => court.bookings);
      const revenue = venueBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const bookingCount = venueBookings.length;
      const avgRating = venue.reviews.length > 0 
        ? venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length 
        : 0;

      return {
        id: venue.id,
        name: venue.name,
        revenue,
        bookingCount,
        avgRating: Math.round(avgRating * 10) / 10,
        courtsCount: venue.courts.length,
        occupancyRate: calculateOccupancyRate(venue.courts, startDate, now)
      };
    });

    // Customer insights
    const customerInsights = generateCustomerInsights(allBookings);

    // Sport popularity
    const sportPopularity = generateSportPopularity(venues, allBookings);

    // Monthly comparison
    const monthlyComparison = generateMonthlyComparison(allBookings);

    return NextResponse.json({
      success: true,
      analytics: {
        period,
        dateRange: {
          start: startDate,
          end: now
        },
        revenueTrends,
        bookingTrends,
        peakHours,
        venuePerformance,
        customerInsights,
        sportPopularity,
        monthlyComparison,
        summary: {
          totalRevenue: allBookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
          totalBookings: allBookings.length,
          avgBookingValue: allBookings.length > 0 
            ? allBookings.reduce((sum, booking) => sum + booking.totalPrice, 0) / allBookings.length 
            : 0,
          uniqueCustomers: new Set(allBookings.map(booking => booking.user.id)).size
        }
      }
    });

  } catch (error) {
    console.error("Error fetching owner analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics"
      },
      { status: 500 }
    );
  }
}

// Helper functions
function generateTimeSeries(bookings: any[], startDate: Date, endDate: Date, groupBy: string, metric: "revenue" | "count") {
  const series: { date: string; value: number }[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    let nextPeriod: Date;
    let dateKey: string;

    switch (groupBy) {
      case "day":
        nextPeriod = new Date(current.getTime() + 24 * 60 * 60 * 1000);
        dateKey = current.toISOString().split('T')[0];
        break;
      case "week":
        nextPeriod = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
        dateKey = `${current.getFullYear()}-W${Math.ceil((current.getTime() - new Date(current.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
        break;
      case "year":
        nextPeriod = new Date(current.getFullYear() + 1, 0, 1);
        dateKey = current.getFullYear().toString();
        break;
      default: // month
        nextPeriod = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        dateKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
    }

    const periodBookings = bookings.filter(booking => 
      booking.createdAt >= current && booking.createdAt < nextPeriod
    );

    const value = metric === "revenue" 
      ? periodBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
      : periodBookings.length;

    series.push({ date: dateKey, value });
    current.setTime(nextPeriod.getTime());
  }

  return series;
}

function generatePeakHoursAnalysis(bookings: any[]) {
  const hourCounts: { [hour: number]: number } = {};
  
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }

  bookings.forEach(booking => {
    const hour = booking.startTime.getHours();
    hourCounts[hour]++;
  });

  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour),
    bookings: count,
    label: `${hour.padStart(2, '0')}:00`
  }));
}

function calculateOccupancyRate(courts: any[], startDate: Date, endDate: Date) {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const operatingHoursPerDay = 12; // Assuming 12 hours operation
  const totalAvailableSlots = courts.length * totalDays * operatingHoursPerDay;
  
  const totalBookings = courts.flatMap(court => court.bookings).length;
  
  return totalAvailableSlots > 0 ? (totalBookings / totalAvailableSlots) * 100 : 0;
}

function generateCustomerInsights(bookings: any[]) {
  const customerData: { [customerId: string]: { name: string; bookings: number; revenue: number } } = {};

  bookings.forEach(booking => {
    const customerId = booking.user.id;
    if (!customerData[customerId]) {
      customerData[customerId] = {
        name: booking.user.name || "Unknown",
        bookings: 0,
        revenue: 0
      };
    }
    customerData[customerId].bookings++;
    customerData[customerId].revenue += booking.totalPrice;
  });

  const topCustomers = Object.entries(customerData)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    totalCustomers: Object.keys(customerData).length,
    topCustomers,
    avgBookingsPerCustomer: Object.values(customerData).reduce((sum, customer) => sum + customer.bookings, 0) / Object.keys(customerData).length,
    avgRevenuePerCustomer: Object.values(customerData).reduce((sum, customer) => sum + customer.revenue, 0) / Object.keys(customerData).length
  };
}

function generateSportPopularity(venues: any[], bookings: any[]) {
  const sportData: { [sportId: string]: { name: string; bookings: number; revenue: number } } = {};

  venues.forEach(venue => {
    venue.courts.forEach((court: any) => {
      const sportId = court.sportId;
      const courtBookings = court.bookings;
      
      if (!sportData[sportId]) {
        sportData[sportId] = {
          name: court.sport?.name || "Unknown Sport",
          bookings: 0,
          revenue: 0
        };
      }
      
      sportData[sportId].bookings += courtBookings.length;
      sportData[sportId].revenue += courtBookings.reduce((sum: number, booking: any) => sum + booking.totalPrice, 0);
    });
  });

  return Object.entries(sportData)
    .map(([id, data]) => ({ sportId: id, ...data }))
    .sort((a, b) => b.revenue - a.revenue);
}

function generateMonthlyComparison(bookings: any[]) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const currentMonthBookings = bookings.filter(booking => booking.createdAt >= currentMonth);
  const lastMonthBookings = bookings.filter(booking => 
    booking.createdAt >= lastMonth && booking.createdAt <= endOfLastMonth
  );

  const currentRevenue = currentMonthBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const lastRevenue = lastMonthBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  return {
    current: {
      bookings: currentMonthBookings.length,
      revenue: currentRevenue
    },
    previous: {
      bookings: lastMonthBookings.length,
      revenue: lastRevenue
    },
    growth: {
      bookings: lastMonthBookings.length > 0 
        ? ((currentMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100 
        : 0,
      revenue: lastRevenue > 0 
        ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 
        : 0
    }
  };
}
