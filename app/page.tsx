"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Users,
  Zap,
  Shield,
  Calendar,
} from "lucide-react";

// Mock data for featured venues
const featuredVenues = [
  {
    id: 1,
    name: "Elite Sports Complex",
    location: "Downtown, Mumbai",
    rating: 4.8,
    reviewCount: 124,
    image: "/api/placeholder/400/300",
    sports: ["Basketball", "Tennis", "Badminton"],
    priceRange: "₹500-1200/hr",
  },
  {
    id: 2,
    name: "Champions Arena",
    location: "Bandra, Mumbai",
    rating: 4.6,
    reviewCount: 89,
    image: "/api/placeholder/400/300",
    sports: ["Football", "Cricket", "Volleyball"],
    priceRange: "₹800-1500/hr",
  },
  {
    id: 3,
    name: "Victory Courts",
    location: "Andheri, Mumbai",
    rating: 4.7,
    reviewCount: 156,
    image: "/api/placeholder/400/300",
    sports: ["Tennis", "Squash", "Table Tennis"],
    priceRange: "₹400-900/hr",
  },
];

const popularSports = [
  { name: "Basketball", icon: "🏀", venues: 45 },
  { name: "Tennis", icon: "🎾", venues: 38 },
  { name: "Football", icon: "⚽", venues: 52 },
  { name: "Badminton", icon: "🏸", venues: 67 },
  { name: "Cricket", icon: "🏏", venues: 29 },
  { name: "Swimming", icon: "🏊", venues: 18 },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/venues?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSportClick = (sport: string) => {
    router.push(`/venues?sport=${encodeURIComponent(sport)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-pulse">
                🏆 India's #1 Sports Venue Booking Platform
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
                Find & Book Your Perfect
                <span className="text-gradient-primary block mt-2">
                  {" "}
                  Sports Venue
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Discover amazing sports facilities near you. Book courts,
                fields, and venues with just a few clicks.{" "}
                <span className="text-primary font-semibold">
                  Play more, worry less.
                </span>
              </p>

              {/* Enhanced Search Bar */}
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative flex gap-3 p-2 bg-white rounded-2xl shadow-primary-lg border border-primary/10">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Search for venues, sports, or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-14 px-8 bg-gradient-primary hover:shadow-primary text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </form>

              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/10 hover-lift">
                    <div className="text-3xl font-bold text-gradient-primary mb-1">
                      500+
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Premium Venues
                    </div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/10 hover-lift">
                    <div className="text-3xl font-bold text-gradient-primary mb-1">
                      50k+
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Happy Bookings
                    </div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/10 hover-lift">
                    <div className="text-3xl font-bold text-gradient-primary mb-1">
                      25+
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Sports Available
                    </div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/10 hover-lift">
                    <div className="text-3xl font-bold text-gradient-primary mb-1">
                      4.8★
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      User Rating
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Popular Sports Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                🏃‍♂️ Choose Your Sport
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Popular <span className="text-gradient-primary">Sports</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose from a wide variety of sports and activities available at
                premium venues
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {popularSports.map((sport, index) => (
                <Card
                  key={sport.name}
                  className="cursor-pointer hover-lift group border-primary/10 bg-white/80 backdrop-blur-sm"
                  onClick={() => handleSportClick(sport.name)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
                      {sport.icon}
                    </div>
                    <h3 className="font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {sport.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {sport.venues} venues
                    </p>
                    <div className="mt-3 w-full h-1 bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all duration-500 group-hover:w-full"
                        style={{
                          width: `${Math.min((sport.venues / 70) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Venues Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Venues</h2>
              <p className="text-muted-foreground">
                Top-rated sports facilities in your area
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVenues.map((venue) => (
                <Card
                  key={venue.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <Badge className="mb-2">{venue.priceRange}</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{venue.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {venue.location}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {venue.rating}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({venue.reviewCount})
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {venue.sports.map((sport) => (
                        <Badge
                          key={sport}
                          variant="secondary"
                          className="text-xs"
                        >
                          {sport}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/venues/${venue.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/venues")}
              >
                View All Venues
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Choose QuickCourt?
              </h2>
              <p className="text-muted-foreground">
                The easiest way to book sports facilities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Booking</h3>
                <p className="text-muted-foreground">
                  Book your favorite courts instantly with real-time
                  availability
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
                <p className="text-muted-foreground">
                  Safe and secure payment processing with multiple payment
                  options
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community</h3>
                <p className="text-muted-foreground">
                  Connect with other players and join sports communities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of players who trust QuickCourt for their sports
                booking needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => router.push("/venues")}>
                  Find Venues
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign Up Now
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
