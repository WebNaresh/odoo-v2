import { Metadata } from "next";
import OwnerSidebar from "@/components/layout/owner-sidebar";

export const metadata: Metadata = {
  title: "Owner Portal | Sports Venue Management",
  description: "Manage your sports venues, bookings, and analytics",
};

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <OwnerSidebar />
      <main className="md:pl-64 transition-all duration-300">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
