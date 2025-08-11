"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  AlertTriangle,
  Mail,
  Calendar,
  Shield,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BannedPage() {
  const searchParams = useSearchParams();
  const [banInfo, setBanInfo] = useState({
    reason: "",
    bannedAt: "",
    email: "",
  });

  useEffect(() => {
    // Get ban information from URL parameters
    const reason = searchParams.get("reason") || "";
    const bannedAt = searchParams.get("bannedAt") || "";
    const email = searchParams.get("email") || "";
    const error = searchParams.get("error");

    // Check if this is a NextAuth error redirect
    if (error === "AccessDenied" && !reason && !bannedAt && !email) {
      // This is a NextAuth error redirect, show generic banned message
      setBanInfo({
        reason: "Account access has been restricted due to policy violations.",
        bannedAt: "",
        email: "",
      });
      return;
    }

    if (reason || bannedAt || email) {
      // Use URL parameters if available
      setBanInfo({
        reason: reason ? decodeURIComponent(reason) : "",
        bannedAt: bannedAt ? decodeURIComponent(bannedAt) : "",
        email: email ? decodeURIComponent(email) : "",
      });
    } else {
      // Try to get email from session storage or recent sign-in attempt
      const lastSignInEmail = sessionStorage.getItem("lastSignInEmail");
      if (lastSignInEmail) {
        // Fetch ban information from API
        fetch(`/api/auth/ban-info?email=${encodeURIComponent(lastSignInEmail)}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.isBanned) {
              setBanInfo({
                reason: data.banReason || "",
                bannedAt: data.bannedAt || "",
                email: data.email || "",
              });
            }
            // Clean up session storage
            sessionStorage.removeItem("lastSignInEmail");
          })
          .catch((error) => {
            console.error("Failed to fetch ban info:", error);
            // Set minimal info for display
            setBanInfo({
              reason: "",
              bannedAt: "",
              email: lastSignInEmail,
            });
            sessionStorage.removeItem("lastSignInEmail");
          });
      }
    }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-950 dark:via-gray-900 dark:to-orange-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Account Suspended
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your QuickCourt account has been temporarily suspended
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Account Access Restricted
            </CardTitle>
            <CardDescription>
              We&apos;ve temporarily restricted access to your account due to a
              policy violation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ban Details */}
            <div className="space-y-4">
              {banInfo.reason && (
                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Reason for Suspension:
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    {banInfo.reason}
                  </p>
                </div>
              )}

              {banInfo.bannedAt && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Suspended On:</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(banInfo.bannedAt)}
                    </p>
                  </div>
                </div>
              )}

              {banInfo.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Email:</p>
                    <p className="text-sm text-muted-foreground">
                      {banInfo.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* What This Means */}
            <div className="space-y-3">
              <h3 className="font-semibold">What this means:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  You cannot access your QuickCourt account
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  You cannot make new bookings or reservations
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  You cannot manage venues (if you&apos;re a venue owner)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  All QuickCourt services are temporarily unavailable
                </li>
              </ul>
            </div>

            {/* Appeal Process */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Think this is a mistake?
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                If you believe your account was suspended in error, you can
                contact our support team to appeal this decision.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <a href="mailto:support@quickcourt.com?subject=Account Suspension Appeal">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://help.quickcourt.com/appeals"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Appeal Guidelines
                  </a>
                </Button>
              </div>
            </div>

            {/* Back to Sign In */}
            <div className="pt-4 border-t">
              <Button variant="ghost" asChild className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            For immediate assistance, please contact our support team at{" "}
            <a
              href="mailto:support@quickcourt.com"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              support@quickcourt.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
