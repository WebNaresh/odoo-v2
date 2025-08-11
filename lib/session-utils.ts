import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { UserRole } from "@/types/next-auth";

/**
 * Utility functions to work with the enhanced NextAuth session
 * that includes complete user data from the database
 */

/**
 * Get the database user ID from the session
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.id || null;
}

/**
 * Get the Google ID from the session
 */
export function getGoogleId(session: Session | null): string | null {
  return session?.user?.googleId || null;
}

/**
 * Get user creation date from the session
 */
export function getUserCreatedAt(session: Session | null): Date | null {
  return session?.user?.createdAt || null;
}

/**
 * Get user last update date from the session
 */
export function getUserUpdatedAt(session: Session | null): Date | null {
  return session?.user?.updatedAt || null;
}

/**
 * Check if user's email is verified
 */
export function isEmailVerified(session: Session | null): boolean {
  return session?.user?.emailVerified !== null;
}

/**
 * Get user's full profile data
 */
export function getUserProfile(session: Session | null) {
  if (!session?.user) return null;

  return {
    id: session.user.id,
    googleId: session.user.googleId,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    emailVerified: session.user.emailVerified,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  };
}

/**
 * Format user creation date for display
 */
export function formatUserJoinDate(session: Session | null): string {
  const createdAt = getUserCreatedAt(session);
  if (!createdAt) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(createdAt));
}

/**
 * Get user role from the session
 */
export function getUserRole(session: Session | null): UserRole | null {
  return session?.user?.role || null;
}

/**
 * Check if user has admin role
 */
export function isAdmin(session: Session | null): boolean {
  return getUserRole(session) === "ADMIN";
}

/**
 * Check if user has user role (includes both USER and ADMIN)
 */
export function isUser(session: Session | null): boolean {
  const role = getUserRole(session);
  return role === "USER" || role === "ADMIN";
}

/**
 * Check if user is a facility owner
 */
export function isFacilityOwner(session: Session | null): boolean {
  return getUserRole(session) === "FACILITY_OWNER";
}

/**
 * Check if user has specific role
 */
export function hasRole(session: Session | null, role: UserRole): boolean {
  return getUserRole(session) === role;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole | null): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "USER":
      return "User";
    case "FACILITY_OWNER":
      return "Facility Owner";
    default:
      return "Unknown";
  }
}

/**
 * Force refresh the NextAuth session to get updated user data from the database
 * This is useful after updating user data (like role) in the database
 */
export async function refreshSession(maxRetries = 3, delayMs = 1000): Promise<Session | null> {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      // Clear any cached session data
      await getSession({ event: 'storage' });

      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, delayMs));

      // Get fresh session data
      const session = await getSession();

      console.log(`Session refresh attempt ${attempts + 1}:`, {
        hasSession: !!session,
        userRole: session?.user?.role,
        userEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });

      return session;
    } catch (error) {
      console.error(`Session refresh attempt ${attempts + 1} failed:`, error);
      attempts++;

      if (attempts >= maxRetries) {
        throw new Error(`Failed to refresh session after ${maxRetries} attempts`);
      }

      // Wait longer before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempts));
    }
  }

  return null;
}

/**
 * Wait for session to have the expected role
 * Useful after role updates to ensure the session reflects the new role
 */
export async function waitForRoleUpdate(
  expectedRole: UserRole,
  maxWaitMs = 10000,
  checkIntervalMs = 500
): Promise<Session | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const session = await getSession();

    if (session?.user?.role === expectedRole) {
      console.log(`Role update confirmed: ${expectedRole}`);
      return session;
    }

    console.log(`Waiting for role update... Current: ${session?.user?.role}, Expected: ${expectedRole}`);
    await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
  }

  throw new Error(`Timeout waiting for role update to ${expectedRole}`);
}

/**
 * Comprehensive session refresh that waits for role update
 */
export async function refreshSessionAndWaitForRole(
  expectedRole: UserRole,
  maxRetries = 3,
  maxWaitMs = 10000
): Promise<Session | null> {
  try {
    // First, refresh the session
    await refreshSession(maxRetries);

    // Then wait for the role to be updated
    const session = await waitForRoleUpdate(expectedRole, maxWaitMs);

    return session;
  } catch (error) {
    console.error("Failed to refresh session and wait for role:", error);
    throw error;
  }
}
