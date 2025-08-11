import { z } from "zod";

// Time slot configuration types
export interface TimeSlotConfig {
  startTime: string; // e.g., "08:00"
  endTime: string;   // e.g., "21:00"
  isEnabled: boolean;
}

export interface ExcludedTimeRange {
  id: string;
  name: string;      // e.g., "Lunch Break", "Maintenance"
  startTime: string; // e.g., "12:00"
  endTime: string;   // e.g., "13:00"
  days: string[];    // e.g., ["monday", "tuesday", "wednesday"]
}

// Slot duration options (in minutes)
export const SLOT_DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
] as const;

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

// Time slot configuration schema
export const timeSlotConfigSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  isEnabled: z.boolean(),
});

export const excludedTimeRangeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  days: z.array(z.string()),
});

// Court creation schema
export const createCourtSchema = z.object({
  name: z.string().min(1, "Court name is required").max(100, "Court name must be less than 100 characters"),
  courtType: z.enum(COURT_TYPES),
  venueId: z.string().min(1, "Venue ID is required"),
  pricePerHour: z.number().min(0, "Price must be a positive number").max(10000, "Price must be reasonable"),
  capacity: z.number().min(1, "Capacity must be at least 1").max(100, "Capacity must be reasonable"),
  operatingHours: operatingHoursSchema,
  slotConfig: timeSlotConfigSchema.optional(),
  excludedTimes: z.array(excludedTimeRangeSchema).optional(),
  slotDuration: z.number().min(15, "Slot duration must be at least 15 minutes").max(480, "Slot duration must be less than 8 hours"),
  isActive: z.boolean(),
});

// Court update schema (all fields optional except ID)
export const updateCourtSchema = z.object({
  id: z.string().min(1, "Court ID is required"),
  name: z.string().min(1, "Court name is required").max(100, "Court name must be less than 100 characters").optional(),
  courtType: z.enum(COURT_TYPES).optional(),
  pricePerHour: z.number().min(0, "Price must be a positive number").max(10000, "Price must be reasonable").optional(),
  capacity: z.number().min(1, "Capacity must be at least 1").max(100, "Capacity must be reasonable").optional(),
  operatingHours: operatingHoursSchema.optional(),
  slotConfig: timeSlotConfigSchema.optional(),
  excludedTimes: z.array(excludedTimeRangeSchema).optional(),
  slotDuration: z.number().min(15, "Slot duration must be at least 15 minutes").max(480, "Slot duration must be less than 8 hours").optional(),
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
  pricePerHour: number;
  capacity: number;
  operatingHours: OperatingHours;
  slotConfig?: TimeSlotConfig;
  excludedTimes?: ExcludedTimeRange[];
  slotDuration: number;
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
  _count?: {
    bookings: number;
    timeSlots: number;
  };
}

// Form data interface for court creation/editing
export interface CourtFormData {
  name: string;
  courtType: CourtType;
  pricePerHour: number;
  capacity: number;
  operatingHours: OperatingHours;
  slotConfig?: TimeSlotConfig;
  excludedTimes?: ExcludedTimeRange[];
  slotDuration: number;
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

// Default time slot configuration
export const DEFAULT_TIME_SLOT_CONFIG: TimeSlotConfig = {
  startTime: "08:00",
  endTime: "21:00",
  isEnabled: true,
};

// Default excluded times (empty array)
export const DEFAULT_EXCLUDED_TIMES: ExcludedTimeRange[] = [];

// Default slot duration (60 minutes)
export const DEFAULT_SLOT_DURATION = 60;

// Default capacity
export const DEFAULT_CAPACITY = 10;
