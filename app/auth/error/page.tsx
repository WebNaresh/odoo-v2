"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    // If this is an AccessDenied error (banned user), redirect to banned page
    if (error === "AccessDenied") {
      // Try to get email from URL or session to fetch ban info
      const email =
        searchParams.get("email") || sessionStorage.getItem("lastSignInEmail");

      if (email) {
        // Fetch ban information from API
        fetch(`/api/auth/ban-info?email=${encodeURIComponent(email)}`)
          .then((response) => response.json())
          .then((banInfo) => {
            if (banInfo.isBanned) {
              const banParams = new URLSearchParams();

              if (banInfo.banReason) {
                banParams.append("reason", banInfo.banReason);
              }
              if (banInfo.bannedAt) {
                banParams.append("bannedAt", banInfo.bannedAt);
              }
              if (banInfo.email) {
                banParams.append("email", banInfo.email);
              }

              // Clean up session storage
              sessionStorage.removeItem("lastSignInEmail");

              // Redirect to banned page with information
              router.replace(`/auth/banned?${banParams.toString()}`);
              return;
            }
          })
          .catch((error) => {
            console.error("Failed to fetch ban info:", error);
            // Fallback to banned page without parameters
            router.replace("/auth/banned");
          });
      } else {
        // Fallback redirect to banned page without parameters
        router.replace("/auth/banned");
      }
      return;
    }
  }, [error, router, searchParams]);

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case "Configuration":
        return {
          title: "Configuration Error",
          description: "There is a problem with the server configuration.",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You do not have permission to sign in.",
        };
      case "Verification":
        return {
          title: "Verification Error",
          description:
            "The verification token has expired or has already been used.",
        };
      case "Default":
      default:
        return {
          title: "Authentication Error",
          description:
            "An error occurred during authentication. Please try again.",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {errorInfo.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {errorInfo.description}
            </p>
          </div>
        </div>

        {/* Error Card */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="text-center">
            <CardTitle className="text-red-700 dark:text-red-400">
              Unable to Sign In
            </CardTitle>
            <CardDescription>
              We encountered an issue while trying to authenticate your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Error Code:</strong> {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">What you can try:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  Clear your browser cache and cookies
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  Try signing in with a different browser
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  Check your internet connection
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  Contact support if the problem persists
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <a
              href="mailto:support@quickcourt.com"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
