# QuickCourt - Local Sports Booking Platform

A full-stack web application that enables sports enthusiasts to book local sports facilities (badminton courts, turf grounds, tennis tables) and create/join matches with others in their area.

🌐 **Live Demo:** [https://oddoohackathon.vercel.app/](https://oddoohackathon.vercel.app/)

## 👥 Team Members

- **Naresh Bhosale** - [GitHub Profile](https://github.com/WebNaresh)
- **Vivek Bhos** - [GitHub Profile](https://github.com/bhos1242)

## 🏆 Project Overview

QuickCourt is a comprehensive sports facility booking platform designed to connect sports enthusiasts with local venues. The platform supports multiple user roles including customers, facility owners, and administrators, providing a complete ecosystem for sports facility management and booking.

**Reference Mockups:** [View Design](https://link.excalidraw.com/l/65VNwvy7c4X/AU4FuaybEgm)

## 🚀 Technology Stack

- **Framework:** Next.js 15.4.6 with App Router
- **Frontend:** React 19.1.0, TypeScript 5
- **Styling:** Tailwind CSS v4, shadcn/ui components (New York style)
- **Database:** MongoDB with Prisma ORM v6.13.0
- **Authentication:** NextAuth.js v4.24.11 with Google OAuth
- **UI Components:** Radix UI primitives, Lucide icons
- **Package Manager:** Yarn
- **Development:** Turbopack for fast development builds

## ✨ Features & Functionalities

### 👤 Customer Features

- **Authentication System** - Secure Google OAuth login with user profile management
- **Home Page** - Welcome banner, popular venues/sports showcase, search functionality
- **Venues Page** - Advanced filtering (sport type, price, venue type, rating) with pagination
- **Single Venue Page** - Detailed venue information, photo gallery, reviews, and "Book Now" functionality
- **Court Booking Page** - Interactive time slot selection with simulated payment processing
- **My Bookings Page** - Complete booking history with real-time status tracking
- **Profile Page** - User details management and preferences

### 🏢 Facility Owner Features

- **Owner Dashboard** - KPIs overview (Total Bookings, Active Courts, Earnings, Booking Calendar)
- **Analytics Charts** - Daily/Weekly/Monthly trends, earnings summary, peak hours heatmap
- **Facility Management** - Add/edit facility details, sports supported, amenities, photo uploads
- **Court Management** - Add/edit courts, pricing configuration, operating hours setup
- **Time Slot Management** - Set availability, block maintenance slots, manage schedules
- **Booking Overview** - View all bookings with comprehensive status tracking

### 🛡️ Admin Features

- **Admin Dashboard** - Global statistics and comprehensive analytics charts
- **Facility Approval** - Approve/reject pending facility registrations
- **User Management** - Search, filter, ban/unban users with role management
- **Reports & Moderation** - System monitoring and content moderation tools

## 🗄️ Database Schema

The application uses a comprehensive MongoDB schema with Prisma ORM supporting:

- **User Management** - Three roles: USER, FACILITY_OWNER, ADMIN
- **Venue System** - Facilities with sports support, amenities, and approval workflow
- **Court Management** - Individual bookable units with pricing and availability
- **Booking System** - Complete reservation lifecycle with payment status tracking
- **Review System** - User feedback and rating aggregation
- **Time Slot Management** - Availability scheduling and maintenance blocking

Key models: `User`, `Sport`, `Venue`, `Court`, `TimeSlot`, `Booking`, `Review`

### 🏟️ Court Model Analysis

The **Court** model serves as the core bookable unit in the QuickCourt platform, representing individual courts within sports venues:

```prisma
model Court {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  name           String          // Court identifier (e.g., "Court A", "Badminton Court 1")
  courtType      String          // Type specification (e.g., "Indoor", "Outdoor", "Premium")
  venueId        String   @db.ObjectId  // Parent venue reference
  sportId        String   @db.ObjectId  // Supported sport reference
  pricePerHour   Float           // Hourly booking rate
  operatingHours Json            // Flexible schedule (different hours per day)
  isActive       Boolean  @default(true)  // Availability status
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  venue     Venue      @relation(fields: [venueId], references: [id])
  sport     Sport      @relation(fields: [sportId], references: [id])
  timeSlots TimeSlot[] // Available booking slots
  bookings  Booking[]  // Historical and active bookings
}
```

**Key Relationships:**

- **Venue → Court**: One-to-many (venues contain multiple courts)
- **Sport → Court**: One-to-many (sports can be played on multiple courts)
- **Court → TimeSlot**: One-to-many (courts have multiple time slots)
- **Court → Booking**: One-to-many (courts can have multiple bookings)

**Business Logic:**

- Courts are the actual bookable entities that customers reserve
- Pricing is set per court, allowing venue owners flexible pricing strategies
- Operating hours stored as JSON for complex scheduling (different hours per day)
- Active/inactive status allows temporary court closure without deletion

## �️ Pages & Navigation Architecture

### Current Implementation Status

The QuickCourt application follows Next.js 15 App Router patterns with role-based access control. Below is the comprehensive page structure:

### 📱 Public Pages (No Authentication Required)

```
/                           # Home Page
├── Welcome banner & hero section
├── Popular venues showcase
├── Sports categories
├── Search functionality
└── Call-to-action for registration

/auth/signin               # Authentication Page
├── Google OAuth login
├── Role-based redirection
└── Session management

/access-denied             # Access Denied Page
├── Permission error display
├── User role information
└── Navigation options
```

### 👤 Customer Pages (USER Role Required)

```
/dashboard                 # Customer Dashboard
├── Booking overview
├── Favorite venues
├── Recent activity
└── Quick booking access

/venues                    # Venues Listing Page
├── Advanced filtering (sport, price, rating)
├── Search functionality
├── Pagination
└── Map view integration

/venues/[id]              # Single Venue Page
├── Venue details & gallery
├── Court listings
├── Reviews & ratings
├── Booking interface
└── Amenities showcase

/venues/[id]/book         # Court Booking Page
├── Court selection
├── Time slot picker
├── Duration selection
├── Payment simulation
└── Booking confirmation

/bookings                 # My Bookings Page
├── Active bookings
├── Booking history
├── Status tracking
├── Cancellation options
└── Receipt downloads

/profile                  # User Profile Page
├── Personal information
├── Preferences
├── Notification settings
└── Account management
```

### 🏢 Facility Owner Pages (FACILITY_OWNER Role Required)

```
/owner/dashboard          # Owner Dashboard
├── KPIs overview
├── Booking calendar
├── Revenue analytics
└── Quick actions

/owner/analytics          # Analytics & Reports
├── Daily/Weekly/Monthly trends
├── Revenue charts
├── Peak hours analysis
└── Customer insights

/owner/facilities         # Facility Management
├── Add/edit facilities
├── Sports configuration
├── Amenities management
├── Photo gallery
└── Approval status

/owner/courts            # Court Management
├── Add/edit courts
├── Pricing configuration
├── Operating hours
└── Availability settings

/owner/timeslots         # Time Slot Management
├── Availability calendar
├── Maintenance blocking
├── Bulk operations
└── Schedule templates

/owner/bookings          # Booking Overview
├── All bookings view
├── Status management
├── Customer communication
└── Revenue tracking
```

### 🛡️ Admin Pages (ADMIN Role Required)

```
/admin                    # Admin Dashboard
├── Global statistics
├── System analytics
├── User activity
└── Platform metrics

/admin/facilities         # Facility Approval
├── Pending registrations
├── Approval workflow
├── Facility verification
└── Rejection management

/admin/users             # User Management
├── User search & filter
├── Role management
├── Ban/unban users
└── Account verification

/admin/reports           # Reports & Moderation
├── System reports
├── Content moderation
├── Abuse reports
└── Platform monitoring
```

### 🔌 API Routes Structure

```
/api/auth/[...nextauth]   # NextAuth.js Authentication
├── Google OAuth handling
├── Session management
├── Token generation
└── User creation/updates

/api/venues              # Venue Management
├── GET /api/venues - List venues with filters
├── POST /api/venues - Create new venue
├── GET /api/venues/[id] - Get venue details
└── PUT /api/venues/[id] - Update venue

/api/courts              # Court Management
├── GET /api/courts - List courts by venue
├── POST /api/courts - Create new court
└── PUT /api/courts/[id] - Update court

/api/bookings            # Booking Management
├── GET /api/bookings - User bookings
├── POST /api/bookings - Create booking
├── PUT /api/bookings/[id] - Update booking
└── DELETE /api/bookings/[id] - Cancel booking

/api/timeslots           # Time Slot Management
├── GET /api/timeslots - Available slots
├── POST /api/timeslots - Create slots
└── PUT /api/timeslots/[id] - Update availability

/api/reviews             # Review System
├── GET /api/reviews - Venue reviews
├── POST /api/reviews - Submit review
└── PUT /api/reviews/[id] - Update review
```

### 🔄 User Journey & Navigation Flow

#### Customer Booking Journey

```
Home (/) → Venues (/venues) → Venue Details (/venues/[id]) →
Book Court (/venues/[id]/book) → Confirmation → My Bookings (/bookings)
```

#### Facility Owner Management Flow

```
Owner Dashboard (/owner/dashboard) → Facility Management (/owner/facilities) →
Court Setup (/owner/courts) → Time Slot Configuration (/owner/timeslots) →
Booking Monitoring (/owner/bookings)
```

#### Admin Oversight Flow

```
Admin Dashboard (/admin) → Facility Approval (/admin/facilities) →
User Management (/admin/users) → System Reports (/admin/reports)
```

### 🔐 Route Protection & Middleware

The application uses Next.js middleware for comprehensive route protection:

- **Public Routes**: `/`, `/auth/signin`, `/api/auth/*`
- **User Routes**: `/dashboard`, `/venues/*`, `/bookings`, `/profile`
- **Owner Routes**: `/owner/*` (requires FACILITY_OWNER role)
- **Admin Routes**: `/admin/*` (requires ADMIN role)
- **Protected API**: All `/api/*` routes except auth require authentication

### 📋 Implementation Status

**✅ Currently Implemented:**

- Authentication system (`/auth/signin`, `/access-denied`)
- Basic home page (`/`)
- Role-based middleware protection
- API route structure for NextAuth.js

**🚧 Planned Implementation:**

- All customer-facing pages (venues, booking, dashboard)
- Facility owner management interface
- Admin panel and user management
- Complete API endpoints for all features

## �🚀 Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Database Setup

This project uses MongoDB with Prisma ORM. Choose one of the following options:

**Option A: Local MongoDB**

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/quickcourt`

**Option B: MongoDB Atlas (Recommended)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `<password>` and `<dbname>` in the connection string

### 3. Environment Setup

Create a `.env` file in the root directory and configure your variables:

```bash
cp .env.example .env
```

### 4. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:2222/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret to your `.env` file

### 5. Configure Environment Variables

Update your `.env` file with the following:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/quickcourt"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/quickcourt"

# NextAuth
NEXTAUTH_URL=http://localhost:2222
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Note:** Generate a secure secret for `NEXTAUTH_SECRET` using:

```bash
openssl rand -base64 32
```

### 6. Generate Prisma Client and Setup Database

```bash
# Generate Prisma client
yarn prisma generate

# Push schema to database (for development)
yarn prisma db push

# Optional: View your data in Prisma Studio
yarn prisma studio
```

### 7. Run the Development Server

```bash
yarn dev
```

The application will be available at [http://localhost:2222](http://localhost:2222) with Turbopack for fast development builds.

## 🏗️ Project Structure

```
quickcourt/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema file
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── middleware.ts         # Next.js middleware
```

## 🔐 Authentication & Security Features

- **Multi-Role Authentication**: Support for USER, FACILITY_OWNER, and ADMIN roles
- **Google OAuth Integration**: Secure authentication using Google OAuth 2.0
- **Database Persistence**: User data stored securely in MongoDB with Prisma ORM
- **Session Management**: Persistent login sessions with JWT tokens
- **Protected Routes**: Role-based access control and automatic redirects
- **Data Validation**: Comprehensive input validation using Zod schemas

## 🎯 Key Features Implementation

- **Real-time Booking System**: Interactive time slot selection with conflict prevention
- **Payment Simulation**: Mock payment processing for booking confirmations
- **Advanced Search & Filtering**: Multi-criteria venue discovery
- **Analytics Dashboard**: Comprehensive business intelligence for facility owners
- **Review & Rating System**: User feedback and venue rating aggregation
- **Responsive Design**: Mobile-first approach with Tailwind CSS v4

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js 15 Documentation](https://nextjs.org/docs) - Learn about Next.js features and App Router
- [Prisma Documentation](https://www.prisma.io/docs) - Database toolkit and ORM
- [NextAuth.js Documentation](https://next-auth.js.org) - Authentication for Next.js
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [shadcn/ui Documentation](https://ui.shadcn.com) - Re-usable components built with Radix UI

## 🚀 Deployment

**Live Demo:** [https://oddoohackathon.vercel.app/](https://oddoohackathon.vercel.app/)

The application can be deployed on various platforms:

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Other Platforms

- **Netlify**: Configure build settings for Next.js
- **Railway**: One-click deployment with database hosting
- **DigitalOcean App Platform**: Container-based deployment

**Important**: Ensure all environment variables are properly configured in your deployment platform.

## 👥 Contributing

This project was developed by:

- **Naresh Bhosale** - Full-stack development, database design
- **Vivek Bhos** - Frontend development, UI/UX implementation

## 📄 License

This project is developed for educational and portfolio purposes.
