"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-6 p-6">
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-foreground/70">
            You don&apos;t have permission to access this page.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-foreground/80">
              {session?.user ? (
                <>
                  Signed in as: <strong>{session.user.email}</strong>
                  <br />
                  Role: <strong>{session.user.role}</strong>
                </>
              ) : (
                "You are not signed in."
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </div>
        </div>

        <div className="text-xs text-foreground/60">
          If you believe this is an error, please contact an administrator.
        </div>
      </div>
    </div>
  );
}
