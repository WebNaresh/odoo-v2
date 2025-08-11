import { PrismaClient } from "@prisma/client";

// Use a global variable for Prisma to prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Create PrismaNeon adapter instance

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [],
  });

// Save Prisma instance to the global object in non-production environments
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Create 2dsphere index on address field for User collection (MongoDB only)
async function ensure2dSphereIndex() {
  try {
    if (prisma.$runCommandRaw) {
      await prisma.$runCommandRaw({
        createIndexes: "Venue",
        indexes: [
          {
            key: { location: "2dsphere" },
            name: "location_2dsphere",
          },

        ],
      });

    } else {
      console.error("prisma.$runCommandRaw is not available.");
    }
  } catch (e) {
    console.warn("Could not create 2dsphere index on User.address:", e);
  }
}

// Only run in development
ensure2dSphereIndex()

  .catch((e) => {
    console.error("Error ensuring 2dsphere index:", e);
  });