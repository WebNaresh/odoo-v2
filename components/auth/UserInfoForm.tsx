"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  User,
  Mail,
  UserCheck,
  ArrowLeft,
  Shield,
} from "lucide-react";
import InputField from "@/components/AppInputFields/InputField";
import {
  userInfoSchema,
  type UserInfoFormData,
} from "@/lib/validations/user-info";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { toast } from "react-hot-toast";

type FormStep = "user-info" | "otp-verification" | "success";

interface UserInfoFormProps {
  onSubmit?: (data: UserInfoFormData) => void;
  loading?: boolean;
}

// OTP form schema
const otpSchema = z.object({
  otp: z.string().length(4, "OTP must be 4 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function UserInfoForm({
  onSubmit,
  loading = false,
}: UserInfoFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("user-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userFormData, setUserFormData] = useState<UserInfoFormData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const userForm = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.USER,
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleUserInfoSubmit = async (data: UserInfoFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Send OTP to user's email
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to send OTP");
      }

      // Store user data and move to OTP step
      setUserFormData(data);
      setCurrentStep("otp-verification");

      // Show success message
      if (process.env.NODE_ENV === "development" && result.otp) {
        console.log("Development OTP:", result.otp);
        toast.success(
          `OTP sent! Check your email or use development OTP: ${result.otp}`
        );
      } else {
        toast.success(
          "OTP sent to your email successfully! Please check your inbox."
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    if (!userFormData) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Verify OTP
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userFormData.email,
          otp: data.otp,
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        throw new Error(verifyResult.message || "Invalid OTP");
      }

      // Create user in database
      const createResponse = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userFormData),
      });

      const createResult = await createResponse.json();

      if (!createResult.success) {
        throw new Error(createResult.message || "Failed to create user");
      }

      // Success - move to success step
      setCurrentStep("success");
      toast.success("Account created successfully! You can now sign in.");

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(userFormData);
      }
    } catch (error) {
      console.error("Error verifying OTP or creating user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToUserInfo = () => {
    setCurrentStep("user-info");
    setError(null);
    otpForm.reset();
  };

  const handleResendOtp = async () => {
    if (!userFormData) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userFormData.email }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to resend OTP");
      }

      // Show success message
      if (process.env.NODE_ENV === "development" && result.otp) {
        console.log("Development OTP (resent):", result.otp);
        toast.success(
          `OTP resent! Check your email or use development OTP: ${result.otp}`
        );
      } else {
        toast.success(
          "OTP resent to your email successfully! Please check your inbox."
        );
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: UserRole.USER, label: "User" },
    { value: UserRole.FACILITY_OWNER, label: "Venue Owner" },
  ];

  const renderUserInfoStep = () => (
    <FormProvider {...userForm}>
      <form
        onSubmit={userForm.handleSubmit(handleUserInfoSubmit)}
        className="space-y-4"
      >
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
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>
    </FormProvider>
  );

  const renderOtpStep = () => (
    <FormProvider {...otpForm}>
      <form
        onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
        className="space-y-4"
      >
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a 4-digit OTP to{" "}
            <span className="font-medium text-foreground">
              {userFormData?.email}
            </span>
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isSubmitting}
            className="text-sm text-[#00884d] hover:text-[#00a855] underline mt-2 disabled:opacity-50"
          >
            Resend OTP
          </button>
        </div>

        <InputField
          name="otp"
          label="Enter OTP"
          type="OTP"
          description="Please enter the 4-digit code sent to your email"
          Icon={Shield}
          required
          onComplete={(otp) => {
            // Auto-submit when OTP is complete
            if (otp.length === 4) {
              otpForm.setValue("otp", otp);
              otpForm.handleSubmit(handleOtpSubmit)();
            }
          }}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackToUserInfo}
            disabled={isSubmitting}
            className="flex-1 h-12"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="flex-1 h-12 text-base font-semibold bg-[#00884d] hover:bg-[#00a855] text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Shield className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-600 mb-2">
          Account Created Successfully!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your account has been created and verified. You can now sign in to
          access your dashboard.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">
            {currentStep === "user-info" && "Complete Your Profile"}
            {currentStep === "otp-verification" && "Verify Your Email"}
            {currentStep === "success" && "Welcome to QuickCourt!"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentStep === "user-info" &&
              "Please provide your information to get started"}
            {currentStep === "otp-verification" &&
              "Enter the verification code sent to your email"}
            {currentStep === "success" && "Your account is ready to use"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20 px-4 py-3 text-sm flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        {currentStep === "user-info" && renderUserInfoStep()}
        {currentStep === "otp-verification" && renderOtpStep()}
        {currentStep === "success" && renderSuccessStep()}
      </CardContent>
    </Card>
  );
}
