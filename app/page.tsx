"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Users, Zap, Shield, Calendar } from "lucide-react";

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
        {/* Enhanced Responsive Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 xl:py-40 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          {/* Responsive Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-primary/10 rounded-full blur-2xl sm:blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-primary/5 rounded-full blur-2xl sm:blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-primary/5 rounded-full blur-2xl sm:blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-6xl mx-auto">
              {/* Responsive Badge */}
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-pulse">
                <span className="hidden sm:inline">🏆 India's #1 Sports Venue Booking Platform</span>
                <span className="sm:hidden">🏆 #1 Sports Booking Platform</span>
              </div>

              {/* Responsive Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
                <span className="block">Find & Book Your Perfect</span>
                <span className="text-gradient-primary block mt-1 sm:mt-2"> Sports Venue</span>
              </h1>

              {/* Responsive Description */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 lg:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
                Discover amazing sports facilities near you. Book courts, fields, and venues
                with just a few clicks. <span className="text-primary font-semibold">Play more, worry less.</span>
              </p>

              {/* Enhanced Responsive Search Bar */}
              <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12 px-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-primary rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-2 bg-white rounded-xl sm:rounded-2xl shadow-primary-lg border border-primary/10">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                      <Input
                        type="text"
                        placeholder="Search venues, sports, locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-primary hover:shadow-primary text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                    >
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                      <span className="hidden sm:inline">Search</span>
                      <span className="sm:hidden">Find Venues</span>
                    </Button>
                  </div>
                </div>
              </form>

              {/* Enhanced Responsive Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto px-2">
                <div className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-primary/10 hover-lift">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary mb-1">500+</div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Premium Venues</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-primary/10 hover-lift">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary mb-1">50k+</div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Happy Bookings</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-primary/10 hover-lift">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary mb-1">25+</div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Sports Available</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-primary/10 hover-lift">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary mb-1">4.8★</div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Responsive Popular Sports Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
          {/* Responsive Background decoration */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-primary/5 rounded-full blur-2xl sm:blur-3xl"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                🏃‍♂️ Choose Your Sport
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">
                Popular <span className="text-gradient-primary">Sports</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
                Choose from a wide variety of sports and activities available at premium venues
              </p>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {popularSports.map((sport, index) => (
                <Card
                  key={sport.name}
                  className="cursor-pointer hover-lift group border-primary/10 bg-white/80 backdrop-blur-sm"
                  onClick={() => handleSportClick(sport.name)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-200">
                      {sport.icon}
                    </div>
                    <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {sport.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      {sport.venues} venues
                    </p>
                    <div className="w-full h-0.5 sm:h-1 bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all duration-500 group-hover:w-full"
                        style={{ width: `${Math.min(sport.venues / 70 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Responsive Featured Venues Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                ⭐ Premium Selection
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">
                Featured <span className="text-gradient-primary">Venues</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
                Top-rated sports facilities handpicked for exceptional quality and service
              </p>
            </div>

            {/* Responsive Venue Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredVenues.map((venue, index) => (
                <Card
                  key={venue.id}
                  className="overflow-hidden hover-lift cursor-pointer border-primary/10 bg-white/80 backdrop-blur-sm group"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Featured badge */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <Badge className="bg-gradient-primary text-white border-0 shadow-lg text-xs sm:text-sm">
                        <span className="hidden sm:inline">⭐ Featured</span>
                        <span className="sm:hidden">⭐</span>
                      </Badge>
                    </div>

                    {/* Price badge */}
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
                      <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs sm:text-sm">
                        {venue.priceRange}
                      </Badge>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors truncate">
                          {venue.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1 sm:mt-2 text-sm sm:text-base">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                          <span className="truncate">{venue.location}</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex-shrink-0">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-bold">{venue.rating}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">({venue.reviewCount})</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 p-3 sm:p-6">
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                      {venue.sports.slice(0, 3).map((sport) => (
                        <Badge key={sport} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                          {sport}
                        </Badge>
                      ))}
                      {venue.sports.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{venue.sports.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Button
                      className="w-full bg-gradient-primary hover:shadow-primary text-white font-semibold h-10 sm:h-11 rounded-xl transition-all duration-200 group-hover:scale-105 text-sm sm:text-base"
                      onClick={() => router.push(`/venues/${venue.id}`)}
                    >
                      <span className="sm:hidden">View</span>
                      <span className="hidden sm:inline">View Details</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                className="border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-200 px-8 py-3 rounded-xl font-semibold"
                onClick={() => router.push("/venues")}
              >
                View All Venues
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Enhanced Responsive Features Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
          {/* Responsive Background decorations */}
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-primary/5 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-primary/5 rounded-full blur-2xl sm:blur-3xl"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                🚀 Why Choose Us
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">
                Why Choose <span className="text-gradient-primary">QuickCourt?</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
                The smartest and easiest way to book premium sports facilities
              </p>
            </div>

            {/* Responsive Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-primary-lg group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-primary rounded-xl sm:rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-primary transition-colors">Instant Booking</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed px-2">
                  Book your favorite courts instantly with real-time availability and instant confirmation
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-primary-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-primary rounded-xl sm:rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-primary transition-colors">Secure Payments</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed px-2">
                  Safe and secure payment processing with multiple payment options and instant refunds
                </p>
              </div>

              <div className="text-center group md:col-span-2 lg:col-span-1">
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-primary-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-primary rounded-xl sm:rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-primary transition-colors">Community</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed px-2">
                  Connect with other players, join sports communities, and find your perfect playing partners
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Responsive CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-primary relative overflow-hidden">
          {/* Responsive Background decorations */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-2xl sm:blur-3xl"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/20 text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm">
                🎯 Join the Community
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                Ready to <span className="text-white/90">Play?</span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 lg:mb-10 leading-relaxed px-2">
                Join thousands of players who trust QuickCourt for their sports booking needs.
                <br className="hidden sm:block" />
                <span className="font-semibold">Start your journey today!</span>
              </p>

              {/* Responsive Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-lg mx-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={() => router.push("/venues")}
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="sm:hidden">Find Venues</span>
                  <span className="hidden sm:inline">Find Venues Now</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg transition-all duration-200 hover:scale-105"
                  onClick={() => router.push("/auth/signin")}
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="sm:hidden">Sign Up</span>
                  <span className="hidden sm:inline">Sign Up Free</span>
                </Button>
              </div>

              {/* Responsive Trust indicators */}
              <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-white/80 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full"></div>
                  <span className="text-xs sm:text-sm">Free to join</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full"></div>
                  <span className="text-xs sm:text-sm">Instant booking</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full"></div>
                  <span className="text-xs sm:text-sm">Secure payments</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full"></div>
                  <span className="text-xs sm:text-sm">24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
