/**
 * Script to promote a user to admin role
 * Usage: npx tsx scripts/create-admin.ts <email>
 */

import { prisma } from "../lib/prisma";

async function createAdmin(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      console.log("Please sign in with Google first to create the user account.");
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    if (user.role === "ADMIN") {
      console.log("User is already an admin!");
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully promoted ${updatedUser.name} to admin role!`);
    console.log(`Updated role: ${updatedUser.role}`);
  } catch (error) {
    console.error("Error promoting user to admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address:");
  console.error("Usage: npx tsx scripts/create-admin.ts <email>");
  process.exit(1);
}

createAdmin(email);
