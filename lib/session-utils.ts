import { Session } from "next-auth";
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
    default:
      return "Unknown";
  }
}
