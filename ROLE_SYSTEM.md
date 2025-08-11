# Role-Based Access Control System

This application implements a comprehensive role-based access control (RBAC) system using Next.js 13+ App Router, NextAuth.js, and Prisma with MongoDB.

## Features

- **Two-tier role system**: `USER` (default) and `ADMIN`
- **Route-level protection**: Middleware-based access control
- **Component-level visibility**: Role-based UI rendering
- **Type-safe implementation**: Full TypeScript support
- **Database persistence**: Roles stored in MongoDB via Prisma

## User Roles

### USER (Default)
- Access to dashboard and profile pages
- Can view and edit their own profile
- Standard user functionality

### ADMIN
- All USER permissions
- Access to admin panel (`/admin`)
- Administrative functionality
- Distinguished UI indicators (red color scheme)

## Protected Routes

### Public Routes (No authentication required)
- `/` - Home page
- `/auth/signin` - Sign-in page
- `/api/auth/*` - NextAuth API routes

### User Routes (USER or ADMIN role required)
- `/dashboard` - User dashboard
- `/dashboard/profile` - User profile
- `/dashboard/settings` - User settings

### Admin Routes (ADMIN role only)
- `/admin` - Admin panel
- `/admin/*` - Admin sub-pages

### Special Routes
- `/access-denied` - Shown when user lacks required permissions

## Implementation Details

### 1. Database Schema (Prisma)

```prisma
enum UserRole {
  ADMIN
  USER
}

model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  googleId      String    @unique
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  role          UserRole  @default(USER)  // New field
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}
```

### 2. NextAuth Configuration

The auth configuration includes role in JWT tokens and sessions:

```typescript
// JWT callback - includes role from database
async jwt({ token, account, profile }) {
  if (account?.provider === "google" && profile?.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { googleId: profile.sub },
    });
    if (dbUser) {
      token.role = dbUser.role; // Include role in token
    }
  }
  return token;
}

// Session callback - includes role in session
async session({ session, token }) {
  if (token && session.user) {
    session.user.role = token.role; // Include role in session
  }
  return session;
}
```

### 3. Middleware Protection

The `middleware.ts` file handles route-level protection:

```typescript
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const userRole = req.nextauth.token?.role;

    // Admin route protection
    if (isAdminRoute(pathname) && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }

    // User route protection
    if (isUserRoute(pathname) && !["USER", "ADMIN"].includes(userRole)) {
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }

    return NextResponse.next();
  }
);
```

### 4. TypeScript Types

Full type safety with custom NextAuth types:

```typescript
export type UserRole = "ADMIN" | "USER";

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      // ... other fields
    } & DefaultSession["user"];
  }
}
```

## Usage Examples

### Checking User Role in Components

```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session } = useSession();
  
  // Check if user is admin
  const isAdmin = session?.user?.role === "ADMIN";
  
  return (
    <div>
      {isAdmin && <AdminOnlyButton />}
      {session && <UserContent />}
    </div>
  );
}
```

### Using Session Utilities

```typescript
import { isAdmin, isUser, getUserRole } from "@/lib/session-utils";

function Dashboard() {
  const { data: session } = useSession();
  
  if (isAdmin(session)) {
    // Show admin features
  }
  
  if (isUser(session)) {
    // Show user features
  }
}
```

## Administration

### Creating Admin Users

1. **First-time setup**: User must sign in with Google to create account
2. **Promote to admin**: Use the admin creation script

```bash
# Promote user to admin role
npx tsx scripts/create-admin.ts user@example.com
```

### Managing Roles

Roles can be managed through:
- Database direct access
- Admin panel (when implemented)
- Scripts in the `/scripts` directory

## Security Considerations

1. **Middleware Protection**: Routes are protected at the middleware level
2. **Component-level Checks**: UI elements respect role permissions
3. **API Protection**: API routes should implement similar role checks
4. **Token Security**: Roles are stored in secure JWT tokens
5. **Database Validation**: Role changes require database updates

## Testing the System

1. **Sign in as regular user**:
   - Access `/dashboard` ✅
   - Try to access `/admin` ❌ (redirected to access-denied)

2. **Promote user to admin**:
   ```bash
   npx tsx scripts/create-admin.ts your-email@gmail.com
   ```

3. **Sign in as admin**:
   - Access `/dashboard` ✅
   - Access `/admin` ✅
   - See admin navigation items ✅

## File Structure

```
├── middleware.ts                 # Route protection
├── app/
│   ├── admin/                   # Admin-only pages
│   ├── dashboard/               # User pages
│   └── access-denied/           # Access denied page
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   └── session-utils.ts         # Role utility functions
├── types/
│   └── next-auth.d.ts          # TypeScript type definitions
├── scripts/
│   └── create-admin.ts         # Admin creation script
└── prisma/
    └── schema.prisma           # Database schema with roles
```

## Next Steps

- Implement more granular permissions
- Add role management UI in admin panel
- Create audit logs for role changes
- Add more user roles as needed
- Implement API route protection
