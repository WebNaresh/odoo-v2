import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

export type UserRole = "ADMIN" | "USER" | "FACILITY_OWNER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      googleId: string;
      email: string;
      name: string | null;
      image: string | null;
      emailVerified: Date | null;
      role: UserRole;
      createdAt: Date;
      updatedAt: Date;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    googleId: string;
    emailVerified: Date | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    googleId: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: Date | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }
}
