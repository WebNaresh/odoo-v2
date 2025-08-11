import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Venue ID is required" },
        { status: 400 }
      );
    }

    // Fetch venue with all related data
    const venue = await prisma.venue.findUnique({
      where: {
        id: id,
        isActive: true,
      },
      include: {
        courts: {
          select: {
            id: true,
            name: true,
            courtType: true,
            pricePerHour: true,
            isActive: true,
            operatingHours: true,
          },
          where: {
            isActive: true,
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 10 // Latest 10 reviews
        },
        _count: {
          select: {
            reviews: true,
            courts: true,
          }
        }
      },
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: "Venue not found" },
        { status: 404 }
      );
    }

    // Calculate pricing information
    const prices = venue.courts.map(court => court.pricePerHour);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Calculate average rating from reviews
    const reviewRatings = venue.reviews.map(review => review.rating);
    const calculatedRating = reviewRatings.length > 0
      ? reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length
      : venue.rating || 0;

    // Transform venue data for frontend
    const transformedVenue = {
      id: venue.id,
      name: venue.name,
      description: venue.description,
      address: venue.address,
      location: venue.address, // Use address as location string for now
      amenities: venue.amenities,
      sports: venue.sports,
      photoUrls: venue.photoUrls,
      rating: calculatedRating,
      reviewCount: venue._count.reviews,
      operatingHours: venue.operatingHours,
      isActive: venue.isActive,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      priceRange: prices.length > 0 ? `₹${minPrice}${minPrice !== maxPrice ? `-${maxPrice}` : ''}/hr` : "Price on request",
      minPrice,
      maxPrice,
      courtCount: venue.courts.length,
      totalCourts: venue._count.courts,
      owner: venue.owner,
      courts: venue.courts.map(court => ({
        id: court.id,
        name: court.name,
        courtType: court.courtType,
        pricePerHour: court.pricePerHour,
        isActive: court.isActive,
        operatingHours: court.operatingHours,
        features: [], // TODO: Add features field to Court model if needed
      })),
      reviews: venue.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: review.user.name,
          image: review.user.image,
        },
      })),
    };

    return NextResponse.json({
      success: true,
      venue: transformedVenue,
    });
  } catch (error) {
    console.error("Error fetching venue details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch venue details",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
