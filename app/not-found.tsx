import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  MapPin, 
  Calendar,
  Building2,
  ArrowLeft,
  ExternalLink,
  Star,
  Users,
  Zap
} from "lucide-react";

export default function NotFound() {
  const popularPages = [
    {
      title: "Find Venues",
      description: "Browse all available sports venues",
      href: "/venues",
      icon: Building2,
      color: "bg-[#00884d]",
    },
    {
      title: "My Bookings",
      description: "View your current and past bookings",
      href: "/dashboard/bookings",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Dashboard",
      description: "Your personal sports dashboard",
      href: "/dashboard",
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  const quickStats = [
    { label: "Active Venues", value: "500+", icon: MapPin },
    { label: "Happy Players", value: "10K+", icon: Users },
    { label: "Successful Bookings", value: "50K+", icon: Calendar },
    { label: "Average Rating", value: "4.9", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#00884d]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {/* 404 Visual */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-[#00884d]/20 mb-4">404</div>
            <div className="relative">
              <div className="text-6xl mb-4">🏟️</div>
              <Badge variant="secondary" className="text-sm">
                Oops! This court is out of bounds
              </Badge>
            </div>
          </div>

          {/* Header */}
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
          Coming Soon....
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The page you're looking for doesn't exist. But don't worry, there are plenty of 
            amazing sports venues waiting for you to discover!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button  size="lg" className="bg-gradient-to-r from-[#00884d] to-[#00a855] hover:from-[#00a855] hover:to-[#00884d] text-white font-semibold">
              <Link href="/">
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button  variant="outline" size="lg" className="border-[#00884d]/20 hover:bg-[#00884d]/5">
              <Link href="/venues">
                <Search className="h-5 w-5 mr-2" />
                Find Venues
              </Link>
            </Button>
          </div>
        </div>

        {/* Popular Pages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Destinations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {popularPages.map((page, index) => {
              const Icon = page.icon;
              return (
                <Card key={index} className="border-[#00884d]/10 hover:border-[#00884d]/20 transition-all hover:shadow-lg group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`h-12 w-12 rounded-lg ${page.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-[#00884d] transition-colors">
                          {page.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {page.description}
                        </p>
                        <Button  variant="ghost" size="sm" className="p-0 h-auto text-[#00884d] hover:text-[#00a855]">
                          <Link href={page.href} className="flex items-center">
                            Visit Page
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose QuickCourt?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-[#00884d]/10 hover:border-[#00884d]/20 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-lg bg-[#00884d]/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-[#00884d]" />
                    </div>
                    <div className="text-2xl font-bold text-[#00884d] mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-[#00884d]/5 to-[#00a855]/5 border-[#00884d]/20">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Zap className="h-12 w-12 text-[#00884d] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                If you were looking for something specific, try using our search feature or 
                browse our venue categories. Our support team is also here to help!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button  variant="outline" className="border-[#00884d]/20 hover:bg-[#00884d]/5">
                <Link href="/venues?search=">
                  <Search className="h-4 w-4 mr-2" />
                  Search Venues
                </Link>
              </Button>
              <Button  variant="ghost" className="text-[#00884d] hover:text-[#00a855] hover:bg-[#00884d]/5">
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 QuickCourt. Making sports accessible for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
