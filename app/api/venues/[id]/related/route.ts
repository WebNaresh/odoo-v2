import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filterCompleteVenues } from "@/lib/venue-validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    // Validate venue ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid venue ID"
        },
        { status: 400 }
      );
    }

    // Check if the current venue exists
    const currentVenue = await prisma.venue.findUnique({
      where: { id },
      select: { id: true, sports: true }
    });

    if (!currentVenue) {
      return NextResponse.json(
        {
          success: false,
          error: "Venue not found"
        },
        { status: 404 }
      );
    }

    // Fetch other venues (excluding current one) with related data
    const venues = await prisma.venue.findMany({
      where: {
        id: { not: id }, // Exclude current venue
        isActive: true,
        approvalStatus: "APPROVED",
      },
      include: {
        courts: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            courtType: true,
            pricePerHour: true,
            isActive: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
          }
        }
      },
      orderBy: [
        // Prioritize venues with similar sports
        { updatedAt: 'desc' }
      ],
      take: limit * 2, // Fetch more than needed to account for filtering
    });

    // Filter venues to only include complete ones
    const completeVenues = filterCompleteVenues(venues.map(venue => ({
      ...venue,
      courts: venue.courts || []
    })));

    // Calculate additional fields for each venue
    const venuesWithDetails = completeVenues.map(venue => {
      // Calculate min price from courts
      const minPrice = venue.courts && venue.courts.length > 0 
        ? Math.min(...venue.courts.map(court => court.pricePerHour))
        : null;

      // Calculate price range
      const prices = venue.courts?.map(court => court.pricePerHour) || [];
      const priceRange = prices.length > 0 
        ? `₹${Math.min(...prices)} - ₹${Math.max(...prices)}`
        : 'Price on request';

      // Calculate average rating
      const ratings = venue.reviews?.map(review => review.rating) || [];
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      return {
        id: venue.id,
        name: venue.name,
        description: venue.description,
        address: venue.address,
        photoUrls: venue.photoUrls,
        sports: venue.sports,
        amenities: venue.amenities,
        rating: Number(averageRating.toFixed(1)),
        reviewCount: venue.reviews?.length || 0,
        minPrice,
        priceRange,
        isActive: venue.isActive,
        courts: venue.courts,
        owner: venue.owner,
      };
    });

    // Sort venues by relevance (similar sports first, then by rating)
    const sortedVenues = venuesWithDetails.sort((a, b) => {
      // Calculate sport similarity score
      const aSimilarity = a.sports.filter(sport => 
        currentVenue.sports.includes(sport)
      ).length;
      const bSimilarity = b.sports.filter(sport => 
        currentVenue.sports.includes(sport)
      ).length;

      // First sort by sport similarity
      if (aSimilarity !== bSimilarity) {
        return bSimilarity - aSimilarity;
      }

      // Then by rating
      return b.rating - a.rating;
    });

    // Limit the final results
    const limitedVenues = sortedVenues.slice(0, limit);

    return NextResponse.json({
      success: true,
      venues: limitedVenues,
      total: limitedVenues.length,
      hasMore: completeVenues.length > limit,
    });

  } catch (error) {
    console.error("Error fetching related venues:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch related venues"
      },
      { status: 500 }
    );
  }
}
