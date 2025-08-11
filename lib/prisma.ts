import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Creates a 2dsphere index on the venue location field for efficient geospatial queries
 * This enables location-based venue discovery using MongoDB's geospatial features
 */
async function ensure2dSphereIndex() {
  try {
    if (prisma.$runCommandRaw) {
      await prisma.$runCommandRaw({
        createIndexes: "venues",
        indexes: [
          {
            key: { location: "2dsphere" },
            name: "location_2dsphere",
          },
        ],
      });
      console.log("✅ 2dsphere index created successfully on venues.location");
    } else {
      console.error("❌ prisma.$runCommandRaw is not available.");
    }
  } catch (e) {
    console.warn("⚠️ Could not create 2dsphere index on venues.location:", e);
  }
}

/**
 * Initialize database indexes and configurations
 * Call this function during application startup
 */
export async function initializeDatabase() {
  try {
    await ensure2dSphereIndex();
    console.log("✅ Database initialization completed");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
}
