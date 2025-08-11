# Naresh Bhosale - Developer Portfolio

This is a [Next.js](https://nextjs.org) project featuring a modern developer portfolio with Google authentication and PDF export functionality.

## Features

- 🎨 **Modern Portfolio Design** - Clean, responsive design using Tailwind CSS v4
- 🔐 **Google Authentication** - Secure login with NextAuth.js and database persistence
- 📄 **PDF Export** - Download portfolio as PDF using html2canvas-pro
- 🗄️ **Database Integration** - User data persistence with Prisma and MongoDB
- 🌙 **Dark Mode Support** - Automatic dark/light theme detection
- 📱 **Mobile Responsive** - Optimized for all device sizes

## Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Database Setup

This project uses MongoDB with Prisma. You can use either:

**Option A: Local MongoDB**

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/portfolio`

**Option B: MongoDB Atlas (Recommended)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `<password>` and `<dbname>` in the connection string

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

### 4. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret to your `.env.local` file

### 5. Configure Environment Variables

Update your `.env.local` file with the following:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/portfolio"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/portfolio"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
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

# Optional: Push schema to database (for development)
yarn prisma db push
```

### 7. Run the Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication & Database Features

- **Google Sign-In**: Secure authentication using Google OAuth
- **Database Persistence**: User data stored in MongoDB with Prisma ORM
- **Session Management**: Persistent login sessions with JWT
- **User Creation/Retrieval**: Automatic user creation on first login
- **Data Synchronization**: User profile updates from Google account
- **Protected Routes**: Automatic redirects for authenticated users

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
