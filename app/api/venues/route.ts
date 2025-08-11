import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all active venues with related data
    const venues = await prisma.venue.findMany({
      where: {
        isActive: true,

      },
      include: {
        courts: {
          select: {
            id: true,
            name: true,
            courtType: true,
            pricePerHour: true,
          },

        },
        owner: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            reviews: true,
            courts: true,
          }
        }
      },
      orderBy: {
        rating: "desc"
      },
    });



    // Transform venues for frontend
    const transformedVenues = venues.map(venue => {
      // Calculate pricing information
      const prices = venue.courts.map(court => court.pricePerHour);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        id: venue.id,
        name: venue.name,
        description: venue.description,
        address: venue.address,
        location: venue.address, // Use address as location string
        amenities: venue.amenities,
        sports: venue.sports,
        photoUrls: venue.photoUrls,
        rating: venue.rating || 0,
        reviewCount: venue._count.reviews,
        operatingHours: venue.operatingHours,
        isActive: venue.isActive,
        createdAt: venue.createdAt,
        updatedAt: venue.updatedAt,
        priceRange: prices.length > 0 ? `₹${minPrice}${minPrice !== maxPrice ? `-${maxPrice}` : ''}/hr` : "Price on request",
        minPrice,
        maxPrice,
        courtCount: venue.courts.length,
        owner: venue.owner,
      };
    });

    // Get total count
    const totalCount = await prisma.venue.count({
      where: {
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      venues: transformedVenues,
      pagination: {
        total: totalCount,
        limit: transformedVenues.length,
        offset: 0,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch venues",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
