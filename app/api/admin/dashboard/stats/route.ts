import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [ADMIN DASHBOARD STATS API] Starting stats fetch request");

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("❌ [ADMIN DASHBOARD STATS API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 [ADMIN DASHBOARD STATS API] Session user:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      console.log("❌ [ADMIN DASHBOARD STATS API] Forbidden - user role:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("📊 [ADMIN DASHBOARD STATS API] Fetching dashboard statistics...");

    // Get current date and 30 days ago for growth calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch platform statistics
    const [
      totalUsers,
      totalVenues,
      totalBookings,
      pendingVenues,
      approvedVenues,
      rejectedVenues,
      usersLastMonth,
      venuesLastMonth,
      bookingsLastMonth,
      recentVenues,
      topVenues
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total venues
      prisma.venue.count(),
      
      // Total bookings (placeholder - will need booking model)
      Promise.resolve(0), // TODO: Implement when booking model is available
      
      // Pending venues
      prisma.venue.count({
        where: { approvalStatus: "PENDING" }
      }),
      
      // Approved venues
      prisma.venue.count({
        where: { approvalStatus: "APPROVED" }
      }),
      
      // Rejected venues
      prisma.venue.count({
        where: { approvalStatus: "REJECTED" }
      }),
      
      // Users from last month for growth calculation
      prisma.user.count({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      }),
      
      // Venues from last month for growth calculation
      prisma.venue.count({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      }),
      
      // Bookings from last month (placeholder)
      Promise.resolve(0), // TODO: Implement when booking model is available
      
      // Recent venues for activities
      prisma.venue.findMany({
        where: {
          approvalStatus: "PENDING"
        },
        include: {
          owner: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      }),
      
      // Top performing venues (by rating)
      prisma.venue.findMany({
        where: {
          approvalStatus: "APPROVED",
          isActive: true
        },
        include: {
          owner: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              courts: true,
              reviews: true
            }
          }
        },
        orderBy: [
          { rating: "desc" },
          { reviewCount: "desc" }
        ],
        take: 5
      })
    ]);

    // Calculate growth percentages
    const userGrowth = usersLastMonth > 0 
      ? ((totalUsers - usersLastMonth) / usersLastMonth * 100) 
      : 0;
    
    const venueGrowth = venuesLastMonth > 0 
      ? ((totalVenues - venuesLastMonth) / venuesLastMonth * 100) 
      : 0;
    
    const bookingGrowth = bookingsLastMonth > 0 
      ? ((totalBookings - bookingsLastMonth) / bookingsLastMonth * 100) 
      : 0;

    // Transform recent venues into activities
    const recentActivities = recentVenues.map((venue, index) => ({
      id: `venue_${venue.id}`,
      type: "facility_approval",
      title: "New venue pending approval",
      description: `${venue.name} - ${venue.address}`,
      time: getTimeAgo(venue.createdAt),
      priority: "high",
      venueId: venue.id
    }));

    // Transform top venues
    const topFacilities = topVenues.map((venue) => ({
      id: venue.id,
      name: venue.name,
      location: venue.address,
      rating: venue.rating || 0,
      bookings: 0, // TODO: Implement when booking model is available
      revenue: 0, // TODO: Implement when booking model is available
      growth: 0, // TODO: Implement when booking model is available
      courtCount: venue._count.courts,
      reviewCount: venue._count.reviews
    }));

    // Prepare response data
    const dashboardStats = {
      platformStats: {
        totalUsers,
        userGrowth: Math.round(userGrowth * 10) / 10,
        totalFacilities: totalVenues,
        facilityGrowth: Math.round(venueGrowth * 10) / 10,
        totalBookings,
        bookingGrowth: Math.round(bookingGrowth * 10) / 10,
        totalRevenue: 0, // TODO: Implement when booking/payment model is available
        revenueGrowth: 0, // TODO: Implement when booking/payment model is available
        pendingApprovals: pendingVenues,
        approvedVenues,
        rejectedVenues,
        activeReports: 0 // TODO: Implement when report model is available
      },
      recentActivities,
      topFacilities,
      pendingApprovals: recentVenues.map((venue) => ({
        id: venue.id,
        facilityName: venue.name,
        ownerName: venue.owner?.name || "Unknown",
        location: venue.address,
        submittedDate: venue.createdAt.toISOString().split('T')[0],
        courts: venue._count?.courts || 0,
        sports: venue.sports || [],
        status: venue.approvalStatus.toLowerCase()
      }))
    };

    console.log("✅ [ADMIN DASHBOARD STATS API] Stats compiled successfully");

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("❌ [ADMIN DASHBOARD STATS API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${Math.max(1, diffInMinutes)} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
}
