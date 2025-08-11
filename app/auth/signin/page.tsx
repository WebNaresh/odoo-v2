"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Users,
  Building2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

type AuthStep = "signin" | "role-selection" | "completing";
type UserRole = "USER" | "FACILITY_OWNER";

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  const roleOptions: RoleOption[] = [
    {
      value: "USER",
      label: "User",
      description: "Book sports facilities and manage your reservations",
      icon: Users,
    },
    {
      value: "FACILITY_OWNER",
      label: "Facility Owner",
      description: "List your sports facilities and manage bookings",
      icon: Building2,
    },
  ];

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push(callbackUrl);
      }
    };
    checkSession();
  }, [router]);

  // Check if user needs role selection after Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get("step");

    if (stepParam === "check") {
      // Clean up URL first
      window.history.replaceState({}, document.title, window.location.pathname);
      // Check user status after a brief delay
      setTimeout(() => {
        checkUserStatus();
      }, 2000);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await signIn("google", {
        callbackUrl: "/auth/signin?step=check",
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to sign in. Please try again.");
      } else if (result?.url) {
        // Check if we need to handle role selection
        if (result.url.includes("step=check")) {
          // Wait a moment for session to be established
          setTimeout(async () => {
            await checkUserStatus();
          }, 2000);
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // This would be implemented with a custom email/password provider
      // For now, we'll show a message that it's not implemented
      toast.error(
        "Email/password sign-in not implemented yet. Please use Google sign-in."
      );
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const checkUserStatus = async () => {
    try {
      const session = await getSession();

      if (session?.user?.email) {
        // Use the timing-based approach as fallback
        const checkResponse = await fetch("/api/auth/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });

        if (checkResponse.ok) {
          const { user } = await checkResponse.json();
          const now = new Date();
          const userCreated = new Date(user?.createdAt);
          const timeDiff = now.getTime() - userCreated.getTime();

          // If user was created within the last 60 seconds, show role selection
          if (timeDiff < 60000) {
            setIsNewUser(true);
            setAuthStep("role-selection");
            return;
          }
        }
      }

      // Existing user or role selection not needed
      router.push("/");
    } catch (err) {
      console.error("Error checking user status:", err);
      // Fallback to home page
      router.push("/");
    }
  };

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAuthStep("completing");

      const response = await fetch("/api/auth/select-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      // Role updated successfully, redirect to home
      router.push("/");
    } catch (err) {
      console.error("Role selection error:", err);
      setError("Failed to update your role. Please try again.");
      setAuthStep("role-selection");
    } finally {
      setLoading(false);
    }
  };

  // Render role selection step
  const renderRoleSelection = () => (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Choose Your Role
        </h1>
        <p className="text-foreground/70">
          Select how you&apos;ll be using QuickCourt to get started
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Account Created Successfully
          </CardTitle>
          <CardDescription>
            Now choose your role to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRole === option.value
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedRole(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{option.label}</h3>
                          {selectedRole === option.value && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground/70">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setAuthStep("signin")}
              disabled={loading}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleRoleSelection}
              disabled={!selectedRole || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render completing step
  const renderCompleting = () => (
    <div className="w-full max-w-md">
      <div className="text-center">
        <div className="mb-6">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Setting up your account</h1>
        <p className="text-foreground/70">
          Please wait while we complete your registration...
        </p>
      </div>
    </div>
  );

  // Render sign-in step
  const renderSignIn = () => (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Welcome to QuickCourt
        </h1>
        <p className="text-foreground/70">
          Sign in to book sports facilities or manage your venue
        </p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-3"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-3 text-xs text-muted-foreground uppercase tracking-wide">
              Or
            </span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      {authStep === "role-selection" && renderRoleSelection()}
      {authStep === "completing" && renderCompleting()}
      {authStep === "signin" && renderSignIn()}
    </div>
  );
}
