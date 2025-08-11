"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, getSession } from "next-auth/react";
import { refreshSessionAndWaitForRole } from "@/lib/session-utils";
import { useRouter } from "next/navigation";
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Loader2,
  Users,
  Building2,
  ArrowLeft,
  CheckCircle,
  Play,
  Star,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

type AuthStep = "signin" | "role-selection" | "completing";
type UserRole = "USER" | "FACILITY_OWNER";

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  description: string;
  features: string[];
}

const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    image: "/sports-center.jpg",
    title: "Premium Sports Facilities",
    description: "Book world-class sports venues with state-of-the-art equipment and professional-grade facilities.",
    features: ["Professional Equipment", "Modern Facilities", "Expert Staff"]
  },
  {
    id: 2,
    image: "/indoors-tennis-court.jpg",
    title: "Indoor Tennis Courts",
    description: "Experience premium indoor tennis courts with perfect lighting and climate control for year-round play.",
    features: ["Climate Controlled", "Professional Courts", "Equipment Rental"]
  },
  {
    id: 3,
    image: "/empty-stadium-day.jpg",
    title: "Stadium Experiences",
    description: "Access to premium stadium facilities for tournaments, events, and professional training sessions.",
    features: ["Tournament Ready", "Large Capacity", "Event Hosting"]
  }
];

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
      description: "Book sports venues and manage your reservations",
      icon: Users,
    },
    {
      value: "FACILITY_OWNER",
      label: "Facility Owner",
      description: "List your sports venues and manage bookings",
      icon: Building2,
    },
  ];

  const checkUserStatus = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.user?.email) {
        router.push("/");
        return;
      }

      // Check user creation time
      const checkResponse = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!checkResponse.ok) {
        router.push("/");
        return;
      }

      const responseData = await checkResponse.json();

      const { user } = responseData;

      if (!user) {
        router.push("/");
        return;
      }

      const now = new Date();
      const userCreated = new Date(user.createdAt);
      const timeDiff = now.getTime() - userCreated.getTime();

      // If user was created within the last 10 minutes, show role selection
      // This gives enough time for the OAuth flow and any delays
      if (timeDiff < 600000) {
        setIsNewUser(true);
        setAuthStep("role-selection");
        return;
      }

      router.push("/");
    } catch (err) {
      console.error("Error checking user status:", err);
      router.push("/");
    }
  }, [router, setIsNewUser, setAuthStep]);

  useEffect(() => {
    // Check if user is already signed in, but don't redirect if we're in the middle of role selection flow
    const checkSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const stepParam = urlParams.get("step");

      // If we have step=check, let the role selection flow handle the redirect
      if (stepParam === "check") {
        return;
      }

      const session = await getSession();
      if (session) {
        router.push("/");
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
      }, 3000);
    }
  }, [checkUserStatus]);

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
        // Always check user status after successful sign-in
        setTimeout(async () => {
          await checkUserStatus();
        }, 3000);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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

      // Force session refresh to get updated user data with new role
      try {
        console.log("Refreshing session and waiting for role update...");
        const updatedSession = await refreshSessionAndWaitForRole(
          selectedRole as any,
          3,
          15000
        );
        console.log(
          "Session successfully updated with new role:",
          updatedSession?.user?.role
        );
      } catch (error) {
        console.error("Failed to refresh session with new role:", error);
        // Fallback to basic session refresh
        await getSession({ event: "storage" });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const fallbackSession = await getSession();
        console.log("Fallback session:", fallbackSession);
      }

      // Redirect based on user role and if they're new
      if (selectedRole === "FACILITY_OWNER" && isNewUser) {
        router.push("/owner/venues/new");
      } else {
        router.push("/");
      }
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
    <div className="w-full max-w-md mx-auto">
      {/* Mobile Logo - only visible on small screens */}
      <div className="lg:hidden text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-[#00884d] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">QC</span>
          </div>
          <span className="font-bold text-3xl text-foreground">QuickCourt</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-lg text-muted-foreground">
          Sign in to access your sports booking platform
        </p>
      </div>

      <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20 px-4 py-3 text-sm flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 text-base font-semibold bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200 group"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
            ) : (
              <svg className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
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

          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-border/50"></div>
            <span className="px-4 text-sm text-muted-foreground font-medium bg-background">
              Or
            </span>
            <div className="flex-1 border-t border-border/50"></div>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          By signing in, you agree to our{" "}
          <span className="text-[#00884d] hover:underline cursor-pointer font-medium">
            terms of service
          </span>{" "}
          and{" "}
          <span className="text-[#00884d] hover:underline cursor-pointer font-medium">
            privacy policy
          </span>
          .
        </p>
      </div>

      {/* Features highlight for mobile */}
      <div className="lg:hidden mt-12 grid grid-cols-3 gap-4 text-center">
        <div className="space-y-2">
          <div className="h-12 w-12 rounded-full bg-[#00884d]/10 flex items-center justify-center mx-auto">
            <Play className="h-6 w-6 text-[#00884d]" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Easy Booking</p>
        </div>
        <div className="space-y-2">
          <div className="h-12 w-12 rounded-full bg-[#00884d]/10 flex items-center justify-center mx-auto">
            <MapPin className="h-6 w-6 text-[#00884d]" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Find Venues</p>
        </div>
        <div className="space-y-2">
          <div className="h-12 w-12 rounded-full bg-[#00884d]/10 flex items-center justify-center mx-auto">
            <Star className="h-6 w-6 text-[#00884d]" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Top Quality</p>
        </div>
      </div>
    </div>
  );

  // Image Carousel Component
  const ImageCarousel = () => (
    <div className="relative h-full w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="h-full w-full"
      >
        <CarouselContent className="h-full">
          {carouselSlides.map((slide) => (
            <CarouselItem key={slide.id} className="h-full">
              <div className="relative h-full w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={slide.id === 1}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">{slide.title}</h3>
                  <p className="text-lg mb-4 opacity-90">{slide.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {slide.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm"
                      >
                        <Star className="h-3 w-3" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" />
        <CarouselNext className="right-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" />
      </Carousel>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {authStep === "signin" ? (
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Left side - Image Carousel */}
          <div className="hidden lg:block relative">
            <ImageCarousel />
            {/* QuickCourt Logo Overlay */}
            <div className="absolute top-8 left-8 z-10">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-[#00884d] flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">QC</span>
                </div>
                <span className="font-bold text-2xl text-white drop-shadow-lg">QuickCourt</span>
              </div>
            </div>
          </div>

          {/* Right side - Sign in form */}
          <div className="flex items-center justify-center p-6 lg:p-12">
            {renderSignIn()}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen p-6">
          {authStep === "role-selection" && renderRoleSelection()}
          {authStep === "completing" && renderCompleting()}
        </div>
      )}
    </div>
  );
}
