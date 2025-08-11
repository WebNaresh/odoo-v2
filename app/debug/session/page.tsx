"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, User, Shield, Building2 } from "lucide-react";

export default function SessionDebugPage() {
  const { data: session, status, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      await update();
      console.log("Session refreshed");
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "FACILITY_OWNER":
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case "USER":
      default:
        return <User className="h-4 w-4 text-green-500" />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "FACILITY_OWNER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "USER":
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Session Debug</h1>
            <p className="text-muted-foreground">
              Debug session data and role information
            </p>
          </div>
          
          <Button 
            onClick={handleRefreshSession}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Session
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle>Session Status</CardTitle>
              <CardDescription>Current authentication status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={status === "authenticated" ? "default" : "secondary"}>
                    {status}
                  </Badge>
                </div>
                
                {session?.user?.role && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(session.user.role)}
                      <Badge className={getRoleColor(session.user.role)}>
                        {session.user.role}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Current user details from session</CardDescription>
            </CardHeader>
            <CardContent>
              {session?.user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{session.user.name}</p>
                      <p className="text-sm text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>
                  
                  {(session.user as any).id && (
                    <div className="text-xs text-muted-foreground">
                      ID: {(session.user as any).id}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No user data available</p>
              )}
            </CardContent>
          </Card>

          {/* Raw Session Data */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Raw Session Data</CardTitle>
              <CardDescription>Complete session object for debugging</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(session, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Navigation Test */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Navigation Test</CardTitle>
              <CardDescription>Test role-based navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = "/"}
                >
                  Home
                </Button>
                
                {session?.user?.role === "FACILITY_OWNER" && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = "/owner/facilities"}
                    >
                      My Facilities
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = "/owner/facilities/new"}
                    >
                      Add Facility
                    </Button>
                  </>
                )}
                
                {session?.user?.role === "ADMIN" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = "/admin"}
                  >
                    Admin Panel
                  </Button>
                )}
                
                {session?.user?.role === "USER" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = "/dashboard"}
                  >
                    Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
