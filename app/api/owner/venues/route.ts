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
    console.log("🚀 [VENUE API] Starting venue creation request");

    const session = await getServerSession(authOptions);
    console.log("👤 [VENUE API] Session user:", {
      id: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    });

    if (!session?.user?.email) {
      console.log("❌ [VENUE API] Unauthorized - no session");
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
      console.log("❌ [VENUE API] Forbidden - user role:", session.user.role);
      return NextResponse.json(
        {
          success: false,
          error: "Only facility owners can create venues"
        },
        { status: 403 }
      );
    }

    const body = await request.json();


    console.log("📦 [VENUE API] Raw request body:", JSON.stringify(body, null, 2));
    console.log("🖼️ [VENUE API] Image data received:", {
      photoUrls: body.photoUrls,
      photoUrlsType: typeof body.photoUrls,
      photoUrlsLength: Array.isArray(body.photoUrls) ? body.photoUrls.length : 'not array',
      photoUrlsContent: body.photoUrls
    });

    // Validate request data
    console.log("🔍 [VENUE API] Starting validation with createVenueSchema");
    const validationResult = createVenueSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("❌ [VENUE API] Validation failed:");
      console.log("📋 [VENUE API] Validation errors:", JSON.stringify(validationResult.error.issues, null, 2));
      console.log("🔧 [VENUE API] Expected schema fields:", Object.keys(createVenueSchema.shape || {}));
      console.log("📝 [VENUE API] Received fields:", Object.keys(body));

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.issues,
          receivedFields: Object.keys(body),
          expectedFields: Object.keys(createVenueSchema.shape || {})
        },
        { status: 400 }
      );
    }

    console.log("✅ [VENUE API] Validation successful");
    console.log("📋 [VENUE API] Validated data:", JSON.stringify(validationResult.data, null, 2));

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

    console.log("🏗️ [VENUE API] Extracted venue data:", {
      name,
      description: description?.substring(0, 50) + "...",
      address,
      location,
      amenities,
      sportIds,
      operatingHours: Object.keys(operatingHours || {}),
      photoUrls,
      photoUrlsCount: photoUrls?.length || 0
    });

    // Skip sport validation since sports are handled at court level
    console.log("ℹ️ [VENUE API] Skipping sport validation - sports will be configured at court level");

    // Create venue
    console.log("💾 [VENUE API] Creating venue in database with data:", {
      name,
      description: description?.substring(0, 50) + "...",
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
    });

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

    console.log("✅ [VENUE API] Venue created successfully:", {
      id: venue.id,
      name: venue.name,
      photoUrls: venue.photoUrls,
      photoUrlsCount: venue.photoUrls?.length || 0
    });

    return NextResponse.json({
      success: true,
      venue,
    });
  } catch (error) {
    console.error("💥 [VENUE API] Error creating venue:", error);
    console.error("🔍 [VENUE API] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create venue",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
