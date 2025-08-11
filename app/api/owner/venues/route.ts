import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createVenueSchema } from "@/types/venue";

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

    // Get venues owned by the authenticated user
    const venues = await prisma.venue.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        supportedSports: {
          select: {
            id: true,
            name: true,
            category: true,
            isPopular: true,
          }
        },
        courts: {
          select: {
            id: true,
            name: true,
            isActive: true,
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
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      venues,
    });
  } catch (error) {
    console.error("Error fetching owner venues:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch venues" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
          error: "Only facility owners can create venues" 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request data
    const validationResult = createVenueSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { 
      name, 
      description, 
      address, 
      location, 
      amenities, 
      sportIds, 
      operatingHours, 
      photoUrls 
    } = validationResult.data;

    // Verify that all sportIds exist
    const existingSports = await prisma.sport.findMany({
      where: {
        id: { in: sportIds }
      },
      select: { id: true }
    });

    if (existingSports.length !== sportIds.length) {
      return NextResponse.json(
        { 
          success: false,
          error: "One or more selected sports do not exist" 
        },
        { status: 400 }
      );
    }

    // Create venue
    const venue = await prisma.venue.create({
      data: {
        name,
        description,
        address,
        location,
        ownerId: session.user.id,
        amenities,
        photoUrls,
        operatingHours,
        sportIds,
        approvalStatus: "PENDING",
        isActive: true,
        reviewCount: 0,
      },
      include: {
        supportedSports: {
          select: {
            id: true,
            name: true,
            category: true,
            isPopular: true,
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      venue,
    });
  } catch (error) {
    console.error("Error creating venue:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create venue" 
      },
      { status: 500 }
    );
  }
}
