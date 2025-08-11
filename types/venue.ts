import { z } from "zod";

// Operating hours schema for each day of the week
export const operatingHoursSchema = z.object({
  monday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  tuesday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  wednesday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  thursday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  friday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  saturday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  sunday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
});

// GeoJSON location schema
export const locationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).length(2), // [longitude, latitude]
}).optional();

// Venue creation schema
export const createVenueSchema = z.object({
  name: z.string()
    .min(2, "Venue name must be at least 2 characters")
    .max(100, "Venue name must be less than 100 characters"),

  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  address: z.string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),

  location: locationSchema.optional(),

  amenities: z.array(z.string())
    .default([]),

  sportIds: z.array(z.string())
    .default([]),

  operatingHours: operatingHoursSchema,

  photoUrls: z.array(z.string())
    .max(10, "Maximum 10 photos allowed")
    .default([]),
});

// TypeScript types derived from schemas
export type OperatingHours = z.infer<typeof operatingHoursSchema>;
export type CreateVenueData = z.infer<typeof createVenueSchema>;
export type VenueLocation = z.infer<typeof locationSchema>;

// Available amenities
export const AVAILABLE_AMENITIES = [
  "Parking",
  "Changing Rooms",
  "Cafeteria",
  "WiFi",
  "Equipment Rental",
  "Shower",
  "Locker",
  "Air Conditioning",
  "First Aid",
  "Security",
  "Lighting",
  "Seating Area",
] as const;

// Day of week type
export type DayOfWeek = keyof OperatingHours;

// Sport interface
export interface Sport {
  id: string;
  name: string;
  category: string;
  description?: string;
  isPopular: boolean;
}

// Venue interface matching Prisma model
export interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  ownerId: string;
  amenities: string[];
  photoUrls: string[];
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rating?: number;
  reviewCount: number;
  operatingHours: OperatingHours;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  supportedSports: Sport[];
  sportIds: string[];
}

// Form data interface for venue creation
export interface VenueFormData {
  name: string;
  description: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  amenities: string[];
  sportIds: string[];
  operatingHours: OperatingHours;
  photos: File[];
}

// API response types
export interface CreateVenueResponse {
  success: boolean;
  venue?: Venue;
  error?: string;
}

export interface SportsResponse {
  success: boolean;
  sports?: Sport[];
  error?: string;
}
