import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCourtSchema } from "@/types/court";

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
    const venueId = searchParams.get("venueId");

    // Build where clause
    const whereClause: any = {
      venue: {
        ownerId: session.user.id, // Ensure user owns the venue
      }
    };

    if (venueId) {
      whereClause.venueId = venueId;
    }

    console.log("🏟️ [COURTS API] Fetching courts for owner:", session.user.id);

    const courts = await prisma.court.findMany({
      where: whereClause,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            bookings: true,
            timeSlots: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("✅ [COURTS API] Courts fetched successfully:", {
      count: courts.length,
      venueId: venueId || "all venues"
    });

    return NextResponse.json({
      success: true,
      courts,
    });
  } catch (error) {
    console.error("❌ [COURTS API] Error fetching courts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courts",
        details: error instanceof Error ? error.message : String(error)
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
          error: "Only facility owners can create courts"
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("🏟️ [COURTS API] Creating court with data:", body);

    // Validate request data
    const validationResult = createCourtSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("❌ [COURTS API] Validation failed:", validationResult.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { name, courtType, venueId, sportId, pricePerHour, operatingHours, isActive } = validationResult.data;

    // Verify that the venue belongs to the authenticated user
    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        ownerId: session.user.id,
      }
    });

    if (!venue) {
      return NextResponse.json(
        {
          success: false,
          error: "Venue not found or you don't have permission to add courts to it"
        },
        { status: 404 }
      );
    }

    // Note: sportId validation could be added here if a Sport model exists in the future

    // Check if court name already exists in this venue
    const existingCourt = await prisma.court.findFirst({
      where: {
        name,
        venueId,
      }
    });

    if (existingCourt) {
      return NextResponse.json(
        {
          success: false,
          error: "A court with this name already exists in this venue"
        },
        { status: 409 }
      );
    }

    // Create the court
    const court = await prisma.court.create({
      data: {
        name,
        courtType,
        venueId,
        sportId,
        pricePerHour,
        operatingHours,
        isActive,
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            bookings: true,
            timeSlots: true,
          }
        }
      }
    });

    console.log("✅ [COURTS API] Court created successfully:", {
      id: court.id,
      name: court.name,
      venueId: court.venueId
    });

    return NextResponse.json({
      success: true,
      court,
    });
  } catch (error) {
    console.error("❌ [COURTS API] Error creating court:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create court",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
