import { z } from "zod";
import { UserRole } from "@prisma/client";

export const userInfoSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  role: z
    .nativeEnum(UserRole, {
      errorMap: () => ({ message: "Please select a valid role" }),
    })
    .default(UserRole.USER),
});

export type UserInfoFormData = z.infer<typeof userInfoSchema>;
