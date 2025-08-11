import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [ADMIN VENUES API] Starting venue fetch request");

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("❌ [ADMIN VENUES API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 [ADMIN VENUES API] Session user:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      console.log("❌ [ADMIN VENUES API] Forbidden - user role:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    console.log("🔍 [ADMIN VENUES API] Fetching venues with status:", status);

    // Fetch venues with the specified approval status
    const venues = await prisma.venues.findMany({
      where: {
        approvalStatus: status as any,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            courts: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("✅ [ADMIN VENUES API] Found venues:", venues.length);

    // Transform the data for the frontend
    const transformedVenues = venues.map((venue) => ({
      id: venue.id,
      name: venue.name,
      description: venue.description,
      address: venue.address,
      location: venue.location,
      sports: venue.sports,
      amenities: venue.amenities,
      photoUrls: venue.photoUrls,
      operatingHours: venue.operatingHours,
      approvalStatus: venue.approvalStatus,
      rating: venue.rating,
      reviewCount: venue.reviewCount,
      isActive: venue.isActive,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      owner: venue.owner,
      courtsCount: venue._count.courts,
      reviewsCount: venue._count.reviews,
    }));

    return NextResponse.json({
      venues: transformedVenues,
      total: venues.length,
    });
  } catch (error) {
    console.error("❌ [ADMIN VENUES API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
