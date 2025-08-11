import { z } from "zod";

// Court type options
export const COURT_TYPES = [
  "Indoor",
  "Outdoor",
  "Premium",
  "Standard",
  "Professional",
  "Practice",
  "Tournament",
  "Multi-purpose",
] as const;

// Operating hours schema (reused from venue)
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

// Court creation schema
export const createCourtSchema = z.object({
  name: z.string().min(1, "Court name is required").max(100, "Court name must be less than 100 characters"),
  courtType: z.enum(COURT_TYPES),
  venueId: z.string().min(1, "Venue ID is required"),
  sportId: z.string().min(1, "Sport ID is required"),
  pricePerHour: z.number().min(0, "Price must be a positive number").max(10000, "Price must be reasonable"),
  operatingHours: operatingHoursSchema,
  isActive: z.boolean(),
});

// Court update schema (all fields optional except ID)
export const updateCourtSchema = z.object({
  id: z.string().min(1, "Court ID is required"),
  name: z.string().min(1, "Court name is required").max(100, "Court name must be less than 100 characters").optional(),
  courtType: z.enum(COURT_TYPES).optional(),
  sportId: z.string().min(1, "Sport ID is required").optional(),
  pricePerHour: z.number().min(0, "Price must be a positive number").max(10000, "Price must be reasonable").optional(),
  operatingHours: operatingHoursSchema.optional(),
  isActive: z.boolean().optional(),
});

// TypeScript types derived from schemas
export type OperatingHours = z.infer<typeof operatingHoursSchema>;
export type CreateCourtData = z.infer<typeof createCourtSchema>;
export type UpdateCourtData = z.infer<typeof updateCourtSchema>;
export type CourtType = typeof COURT_TYPES[number];

// Court interface matching Prisma model
export interface Court {
  id: string;
  name: string;
  courtType: string;
  venueId: string;
  sportId: string;
  pricePerHour: number;
  operatingHours: OperatingHours;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Court with relations for display
export interface CourtWithRelations extends Court {
  venue?: {
    id: string;
    name: string;
  };
  sport?: {
    id: string;
    name: string;
  };
  _count?: {
    bookings: number;
    timeSlots: number;
  };
}

// Form data interface for court creation/editing
export interface CourtFormData {
  name: string;
  courtType: CourtType;
  sportId: string;
  pricePerHour: number;
  operatingHours: OperatingHours;
  isActive: boolean;
}

// Default operating hours (same as venue)
export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
  tuesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
  wednesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
  thursday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
  friday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
  saturday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
  sunday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
};
