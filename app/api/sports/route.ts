import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get all sports - this endpoint can be public for venue creation
    const sports = await prisma.sport.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isPopular: true,
      },
      orderBy: [
        { isPopular: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      sports,
    });
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch sports" 
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

    // Only allow ADMIN users to create new sports
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { 
          success: false,
          error: "Only administrators can create new sports" 
        },
        { status: 403 }
      );
    }

    const { name, category, description, isPopular } = await request.json();

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { 
          success: false,
          error: "Name and category are required" 
        },
        { status: 400 }
      );
    }

    // Check if sport already exists
    const existingSport = await prisma.sport.findUnique({
      where: { name }
    });

    if (existingSport) {
      return NextResponse.json(
        { 
          success: false,
          error: "A sport with this name already exists" 
        },
        { status: 409 }
      );
    }

    // Create new sport
    const sport = await prisma.sport.create({
      data: {
        name,
        category,
        description,
        isPopular: isPopular || false,
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isPopular: true,
      }
    });

    return NextResponse.json({
      success: true,
      sport,
    });
  } catch (error) {
    console.error("Error creating sport:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create sport" 
      },
      { status: 500 }
    );
  }
}
