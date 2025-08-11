"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to facilities page for now
    // Later this can be a proper dashboard
    router.replace("/owner/facilities");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to your facilities</p>
      </div>
    </div>
  );
}
