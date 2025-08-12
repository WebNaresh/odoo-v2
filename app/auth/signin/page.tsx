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
  Star,
  Shield,
  Zap,
  Clock,
  Award,
} from "lucide-react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import UserInfoForm from "@/components/auth/UserInfoForm";
import { type UserInfoFormData } from "@/lib/validations/user-info";
import { toast } from "react-hot-toast";

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
    description:
      "Book world-class sports venues with state-of-the-art equipment and professional-grade facilities for an unmatched experience.",
    features: ["Professional Equipment", "Modern Facilities", "Expert Staff"],
  },
  {
    id: 2,
    image: "/indoors-tennis-court.jpg",
    title: "Smart Booking System",
    description:
      "Experience seamless booking with real-time availability, instant confirmations, and flexible scheduling options.",
    features: ["Real-time Booking", "Instant Confirmation", "Flexible Timing"],
  },
  {
    id: 3,
    image: "/empty-stadium-day.jpg",
    title: "Community & Events",
    description:
      "Join a thriving sports community with tournaments, events, and opportunities to connect with fellow athletes.",
    features: ["Tournaments", "Community Events", "Networking"],
  },
];

// Enhanced features for the platform
const platformFeatures = [
  {
    icon: Zap,
    title: "Instant Booking",
    description:
      "Book your favorite courts in seconds with real-time availability",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Safe and secure payment processing with multiple options",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Book anytime, anywhere with our mobile-friendly platform",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Only verified, high-quality venues and facilities",
  },
];

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  // Single check for banned user redirect in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get("callbackUrl");
    const errorParam = urlParams.get("error");

    console.log("🔍 [SIGNIN] Checking for banned user redirect");
    console.log("🔍 [SIGNIN] Callback URL:", callbackUrl);
    console.log("🔍 [SIGNIN] Error param:", errorParam);

    // Check for banned user indicators
    if (errorParam === "AccessDenied") {
      console.log(
        "🔍 [SIGNIN] AccessDenied error detected, redirecting to banned page"
      );
      router.replace("/auth/banned");
      return;
    }

    if (callbackUrl) {
      const decodedCallbackUrl = decodeURIComponent(callbackUrl);
      console.log("🔍 [SIGNIN] Decoded callback URL:", decodedCallbackUrl);

      if (
        decodedCallbackUrl.includes("/auth/banned") ||
        decodedCallbackUrl.includes("error=AccessDenied")
      ) {
        console.log(
          "🔍 [SIGNIN] Banned user callback detected, redirecting to banned page"
        );
        router.replace("/auth/banned");
        return;
      }
    }
  }, [router]);

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
  }, [checkUserStatus, router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await signIn("google", {
        callbackUrl: "/auth/signin?step=check",
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error types
        if (result.error === "AccessDenied") {
          // Redirect directly to banned page
          router.push("/auth/banned");
          return;
        }
        setError("Failed to sign in. Please try again.");
      } else if (result?.url) {
        // Check if this is a redirect to error page for banned users
        if (result.url.includes("/auth/error?error=AccessDenied")) {
          router.push("/auth/banned");
          return;
        }

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

  const handleUserInfoSubmit = async (data: UserInfoFormData) => {
    try {
      setLoading(true);
      setError(null);

      console.log("User created successfully:", data);

      // Show success message and redirect to sign in with Google
      setTimeout(() => {
        toast.success(
          "Account created successfully! Please sign in with Google to continue."
        );
        // Optionally trigger Google sign-in automatically
        // handleGoogleSignIn();
      }, 1000);
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user account. Please try again.");
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
      <div className="lg:hidden text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00884d] to-[#00a855] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">QC</span>
          </div>
          <span className="font-bold text-2xl text-foreground">QuickCourt</span>
        </div>
      </div>

      <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
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
              <svg
                className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-200"
                viewBox="0 0 24 24"
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

          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-border/50"></div>
            <span className="px-4 text-sm text-muted-foreground font-medium bg-background">
              Or
            </span>
            <div className="flex-1 border-t border-border/50"></div>
          </div>

          <div className="mb-6">
            <UserInfoForm onSubmit={handleUserInfoSubmit} loading={loading} />
          </div>

          {/* Trust Indicators - Compact */}
          <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-muted/10 rounded-lg">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-muted-foreground">24/7</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-orange-600" />
              <span className="text-xs text-muted-foreground">Premium</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </Button>
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
      {authStep === "signin" ? (
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Left side - Image Carousel */}
          <div className="hidden lg:block relative overflow-hidden">
            <ImageCarousel />
            {/* QuickCourt Logo Overlay */}
            <div className="absolute top-8 left-8 z-10">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00884d] to-[#00a855] flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-xl">QC</span>
                </div>
                <span className="font-bold text-2xl text-white drop-shadow-lg">
                  QuickCourt
                </span>
              </div>
            </div>

            {/* Enhanced Features Overlay */}
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-white font-semibold text-lg mb-4">
                  Why Choose QuickCourt?
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {platformFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <feature.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {feature.title}
                        </div>
                        <div className="text-white/80 text-xs">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign in form */}
          <div className="flex items-center justify-center p-4 sm:p-6 lg:p-12 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,136,77,0.3) 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              ></div>
            </div>
            <div className="relative z-10 w-full">{renderSignIn()}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
          <div className="w-full max-w-md">
            {authStep === "role-selection" && renderRoleSelection()}
            {authStep === "completing" && renderCompleting()}
          </div>
        </div>
      )}
    </div>
  );
}
