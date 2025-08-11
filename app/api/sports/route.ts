import { NextRequest, NextResponse } from "next/server";

// Mock sports data since there's no Sport model in the current schema
const MOCK_SPORTS = [
  {
    id: "basketball",
    name: "Basketball",
    category: "Indoor",
    description: "Fast-paced team sport played on a court with hoops",
    isPopular: true,
  },
  {
    id: "tennis",
    name: "Tennis",
    category: "Outdoor",
    description: "Racket sport played on a court with a net",
    isPopular: true,
  },
  {
    id: "football",
    name: "Football",
    category: "Outdoor",
    description: "Team sport played on a large field with goals",
    isPopular: true,
  },
  {
    id: "badminton",
    name: "Badminton",
    category: "Indoor",
    description: "Racket sport played with a shuttlecock",
    isPopular: true,
  },
  {
    id: "cricket",
    name: "Cricket",
    category: "Outdoor",
    description: "Bat-and-ball game played between two teams",
    isPopular: true,
  },
  {
    id: "swimming",
    name: "Swimming",
    category: "Aquatic",
    description: "Water sport and recreational activity",
    isPopular: false,
  },
  {
    id: "volleyball",
    name: "Volleyball",
    category: "Indoor/Outdoor",
    description: "Team sport played with a ball over a net",
    isPopular: false,
  },
  {
    id: "squash",
    name: "Squash",
    category: "Indoor",
    description: "Racket sport played in a four-walled court",
    isPopular: false,
  },
  {
    id: "table-tennis",
    name: "Table Tennis",
    category: "Indoor",
    description: "Paddle sport played on a table with a net",
    isPopular: false,
  },
  {
    id: "hockey",
    name: "Hockey",
    category: "Outdoor",
    description: "Team sport played with sticks and a ball or puck",
    isPopular: false,
  },
];

export async function GET(_request: NextRequest) {
  try {
    // Return mock sports data sorted by popularity
    const sports = MOCK_SPORTS.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
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
