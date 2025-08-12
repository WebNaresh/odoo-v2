"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, Mail, UserCheck } from "lucide-react";
import InputField from "@/components/AppInputFields/InputField";
import { userInfoSchema, type UserInfoFormData } from "@/lib/validations/user-info";
import { UserRole } from "@prisma/client";

interface UserInfoFormProps {
  onSubmit?: (data: UserInfoFormData) => void;
  loading?: boolean;
}

export default function UserInfoForm({ onSubmit, loading = false }: UserInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.USER,
    },
  });

  const handleSubmit = async (data: UserInfoFormData) => {
    setIsSubmitting(true);
    try {
      // Dummy mutation function - just console.log the data
      console.log("User Info Form Data:", data);
      
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting user info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: UserRole.USER, label: "User" },
    { value: UserRole.FACILITY_OWNER, label: "Venue Owner" },
    { value: UserRole.ADMIN, label: "Admin" },
  ];

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
          <p className="text-sm text-muted-foreground">
            Please provide your information to get started
          </p>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <InputField
              name="name"
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              Icon={User}
              required
            />

            <InputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              Icon={Mail}
              required
            />

            <InputField
              name="role"
              label="Account Type"
              type="select"
              placeholder="Select your account type"
              Icon={UserCheck}
              options={roleOptions}
              required
            />

            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full h-12 text-base font-semibold bg-[#00884d] hover:bg-[#00a855] text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
