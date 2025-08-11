import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile & Settings | Owner Portal",
  description: "Manage your profile and account settings",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "FACILITY_OWNER" && session.user.role !== "ADMIN") {
    redirect("/access-denied");
  }

  const user = session.user;

  // Generate initials for fallback avatar
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.name);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your basic account information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-lg font-medium bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {user.role === "FACILITY_OWNER" ? "Facility Owner" : user.role}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={user.name || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              Profile information is managed through your Google account
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">
                    {user.role === "FACILITY_OWNER" ? "Facility Owner" : user.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Full access to venue management features
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Authentication</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Google OAuth</p>
                  <p className="text-sm text-muted-foreground">
                    Secure sign-in with your Google account
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Features we&apos;re working on for future releases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 border rounded-md opacity-60">
                <h4 className="font-medium">Notification Preferences</h4>
                <p className="text-sm text-muted-foreground">
                  Customize email and push notifications
                </p>
              </div>
              <div className="p-3 border rounded-md opacity-60">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Enhanced security for your account
                </p>
              </div>
              <div className="p-3 border rounded-md opacity-60">
                <h4 className="font-medium">API Access</h4>
                <p className="text-sm text-muted-foreground">
                  Generate API keys for integrations
                </p>
              </div>
              <div className="p-3 border rounded-md opacity-60">
                <h4 className="font-medium">Data Export</h4>
                <p className="text-sm text-muted-foreground">
                  Download your venue and booking data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
