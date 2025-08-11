import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [ADMIN USERS API] Starting user fetch request");

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("❌ [ADMIN USERS API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 [ADMIN USERS API] Session user:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      console.log("❌ [ADMIN USERS API] Forbidden - user role:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const banStatus = searchParams.get("banStatus") || "";

    console.log("🔍 [ADMIN USERS API] Query params:", {
      page,
      limit,
      search,
      role,
      banStatus,
    });

    // Build where clause for filtering
    const whereClause: any = {};

    // Search by name or email
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role && role !== "ALL") {
      whereClause.role = role;
    }

    // Filter by ban status
    if (banStatus === "BANNED") {
      whereClause.isBanned = true;
    } else if (banStatus === "ACTIVE") {
      whereClause.isBanned = false;
    }

    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isBanned: true,
          bannedAt: true,
          banReason: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ownedVenues: true,
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Get user statistics
    const [totalUsers, bannedUsers, adminCount, ownerCount, userCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "FACILITY_OWNER" } }),
      prisma.user.count({ where: { role: "USER" } }),
    ]);

    console.log("✅ [ADMIN USERS API] Users fetched successfully:", {
      count: users.length,
      totalCount,
      page,
      limit,
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + users.length < totalCount,
      },
      statistics: {
        totalUsers,
        bannedUsers,
        activeUsers: totalUsers - bannedUsers,
        adminCount,
        ownerCount,
        userCount,
      },
    });
  } catch (error) {
    console.error("❌ [ADMIN USERS API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
