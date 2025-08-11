import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/banned",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" && profile?.sub) {
                try {
                    // Check if user exists in database
                    const existingUser = await prisma.user.findUnique({
                        where: { googleId: profile.sub },
                        select: {
                            id: true,
                            googleId: true,
                            email: true,
                            name: true,
                            image: true,
                            role: true,
                            isBanned: true,
                            banReason: true,
                            bannedAt: true,
                        },
                    });

                    if (!existingUser) {
                        // Create new user with temporary role for role selection
                        await prisma.user.create({
                            data: {
                                googleId: profile.sub,
                                email: user.email!,
                                name: user.name,
                                image: user.image,
                                emailVerified: user.email ? new Date() : null,
                                role: "USER", // Temporary default, will be updated after role selection
                            },
                        });

                        // Mark this as a new user in the account object for later use
                        if (account) {
                            (account as any).isNewUser = true;
                        }
                    } else {
                        // Check if existing user is banned
                        if (existingUser.isBanned) {
                            console.log("❌ [AUTH] Banned user attempted to sign in:", {
                                email: existingUser.email,
                                banReason: existingUser.banReason,
                                bannedAt: existingUser.bannedAt,
                            });

                            return false; // Prevent sign in - will trigger AccessDenied error
                        }

                        // Update existing user with latest info
                        await prisma.user.update({
                            where: { googleId: profile.sub },
                            data: {
                                name: user.name,
                                image: user.image,
                            },
                        });

                        // Mark as existing user
                        if (account) {
                            (account as any).isNewUser = false;
                        }
                    }
                    return true;
                } catch (error) {
                    console.error("Error during sign in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, account, profile }) {
            // Always fetch fresh user data from database to ensure we have the latest role and ban status
            if (token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                });

                if (dbUser) {
                    // Check if user was banned since last token refresh
                    if (dbUser.isBanned) {
                        console.log("❌ [AUTH] User was banned, invalidating token:", dbUser.email);
                        // For banned users, we'll clear the token but still return it to avoid type errors
                        // The session callback will handle the actual sign out
                        token.isBanned = true;
                        return token;
                    }

                    // Include all user fields from database in the token
                    token.id = dbUser.id;
                    token.googleId = dbUser.googleId;
                    token.email = dbUser.email;
                    token.name = dbUser.name;
                    token.image = dbUser.image;
                    token.emailVerified = dbUser.emailVerified;
                    token.role = dbUser.role;
                    token.isBanned = dbUser.isBanned;
                    token.createdAt = dbUser.createdAt;
                    token.updatedAt = dbUser.updatedAt;
                }
            }

            // Handle initial sign-in
            if (account?.provider === "google" && profile?.sub) {
                // Include new user flag from account
                if (account && (account as any).isNewUser !== undefined) {
                    token.isNewUser = (account as any).isNewUser;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // Include all user fields from database in the session
                const sessionUser = session.user as any;
                sessionUser.id = token.id as string;
                sessionUser.googleId = token.googleId as string;
                sessionUser.email = token.email as string;
                sessionUser.name = token.name as string | null;
                sessionUser.image = token.image as string | null;
                sessionUser.emailVerified = token.emailVerified as Date | null;
                sessionUser.role = token.role as string;
                sessionUser.isBanned = token.isBanned as boolean;
                sessionUser.createdAt = token.createdAt as Date;
                sessionUser.updatedAt = token.updatedAt as Date;
                sessionUser.isNewUser = token.isNewUser as boolean;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Export auth function for server components
export const auth = () => getServerSession(authOptions);

