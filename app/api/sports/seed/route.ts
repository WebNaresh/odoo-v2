import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const INITIAL_SPORTS = [
  {
    name: "Basketball",
    category: "Indoor",
    description: "Fast-paced team sport played on a court with hoops",
    isPopular: true,
  },
  {
    name: "Tennis",
    category: "Outdoor",
    description: "Racket sport played on a court with a net",
    isPopular: true,
  },
  {
    name: "Football",
    category: "Outdoor", 
    description: "Team sport played on a large field with goals",
    isPopular: true,
  },
  {
    name: "Badminton",
    category: "Indoor",
    description: "Racket sport played with a shuttlecock",
    isPopular: true,
  },
  {
    name: "Cricket",
    category: "Outdoor",
    description: "Bat-and-ball game played between two teams",
    isPopular: true,
  },
  {
    name: "Swimming",
    category: "Aquatic",
    description: "Water sport and recreational activity",
    isPopular: false,
  },
  {
    name: "Volleyball",
    category: "Indoor/Outdoor",
    description: "Team sport played with a ball over a net",
    isPopular: false,
  },
  {
    name: "Squash",
    category: "Indoor",
    description: "Racket sport played in a four-walled court",
    isPopular: false,
  },
  {
    name: "Table Tennis",
    category: "Indoor",
    description: "Paddle sport played on a table with a net",
    isPopular: false,
  },
  {
    name: "Hockey",
    category: "Outdoor",
    description: "Team sport played with sticks and a ball or puck",
    isPopular: false,
  },
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow seeding for development - in production, you might want to restrict this
    if (process.env.NODE_ENV === "production" && (!session || session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { 
          success: false,
          error: "Unauthorized" 
        },
        { status: 401 }
      );
    }

    // Check if sports already exist
    const existingSportsCount = await prisma.sport.count();
    
    if (existingSportsCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Sports already seeded",
        count: existingSportsCount,
      });
    }

    // Create sports
    const createdSports = await prisma.sport.createMany({
      data: INITIAL_SPORTS,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: "Sports seeded successfully",
      count: createdSports.count,
    });
  } catch (error) {
    console.error("Error seeding sports:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to seed sports" 
      },
      { status: 500 }
    );
  }
}
