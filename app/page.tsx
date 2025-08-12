"use client";

import { useRouter } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import VenueSearchComponent from "@/app/venues/_components/venue-search-component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Users, Zap, Shield } from "lucide-react";
import { useFeaturedVenues } from "@/hooks/use-venues";
import Link from "next/link";

const popularSports = [
  { name: "Basketball", icon: "🏀", venues: 45 },
  { name: "Tennis", icon: "🎾", venues: 38 },
  { name: "Football", icon: "⚽", venues: 52 },
  { name: "Badminton", icon: "🏸", venues: 67 },
  { name: "Cricket", icon: "🏏", venues: 29 },
  { name: "Swimming", icon: "🏊", venues: 18 },
];

export default function Home() {
  const router = useRouter();

  // Use React Query hook for featured venues
  const {
    data: featuredVenues = [],
    isLoading: loading,
    isError,
  } = useFeaturedVenues(6);

  const handleSportClick = (sport: string) => {
    router.push(`/venues?sport=${encodeURIComponent(sport)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main>
        {/* Enhanced Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#00884d]/5">
          {/* Enhanced Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00884d]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00884d]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00884d]/5 rounded-full blur-3xl animate-pulse delay-500"></div>

            {/* Floating elements */}
            <div className="absolute top-20 left-10 w-4 h-4 bg-[#00884d]/20 rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-40 right-20 w-6 h-6 bg-[#00884d]/15 rounded-full animate-bounce delay-700"></div>
            <div className="absolute bottom-32 left-20 w-3 h-3 bg-[#00884d]/25 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute bottom-20 right-32 w-5 h-5 bg-[#00884d]/10 rounded-full animate-bounce delay-200"></div>
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="text-center max-w-6xl mx-auto">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#00884d]/10 to-[#00a855]/10 border border-[#00884d]/20 text-[#00884d] text-xs sm:text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <span className="animate-pulse mr-2">🏆</span>
                India's #1 Sports Venue Booking Platform
                <span className="ml-2 bg-[#00884d] text-white px-2 py-1 rounded-full text-xs">
                  NEW
                </span>
              </div>

              {/* Enhanced Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight">
                <span className="block">Find & Book Your</span>
                <span className="block bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent mt-2">
                  Perfect Sports Venue
                </span>
              </h1>

              {/* Enhanced Description */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Discover amazing sports facilities near you. Book courts,
                fields, and venues with just a few clicks.
                <span className="block mt-2 text-[#00884d] font-semibold text-xl md:text-2xl">
                  🎯 Play more, worry less.
                </span>
              </p>

              {/* Enhanced Location Search */}
              <VenueSearchComponent />

              {/* Quick Search Suggestions */}
              <div className="max-w-4xl mx-auto mb-16">
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="text-sm text-gray-500 font-medium">
                    Popular searches:
                  </span>
                  {["Basketball", "Tennis", "Football", "Swimming"].map(
                    (sport) => (
                      <button
                        key={sport}
                        onClick={() => handleSportClick(sport)}
                        className="px-4 py-2 bg-white/80 hover:bg-[#00884d]/10 border border-[#00884d]/20 rounded-full text-sm font-medium text-[#00884d] hover:text-[#00a855] transition-all duration-200 hover:scale-105"
                      >
                        {sport}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Enhanced Stats Section */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                <div className="group">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-[#00884d]/10 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-[#00884d]/20">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">🏟️</span>
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent mb-2">
                      500+
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-600">
                      Premium Venues
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-[#00884d]/10 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-[#00884d]/20">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">📅</span>
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent mb-2">
                      50k+
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-600">
                      Happy Bookings
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-[#00884d]/10 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-[#00884d]/20">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">🏆</span>
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent mb-2">
                      25+
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-600">
                      Sports Available
                    </div>
                  </div>
                </div>

                <div className="group col-span-2 lg:col-span-1">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-[#00884d]/10 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-[#00884d]/20">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">⭐</span>
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent mb-2">
                      4.8★
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-600">
                      User Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button
                  size="lg"
                  onClick={() => router.push("/venues")}
                  className="h-12 px-6 bg-gradient-to-r from-[#00884d] to-[#00a855] hover:from-[#00a855] hover:to-[#00884d] text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg text-base"
                >
                  🎯 Find Venues Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/auth/signin")}
                  className="h-12 px-6 border-2 border-[#00884d] text-[#00884d] hover:bg-[#00884d] hover:text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 text-base"
                >
                  🚀 Join QuickCourt
                </Button>
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

        {/* Enhanced Featured Venues Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-[#00884d]/5 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-32 h-32 bg-[#00884d]/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#00884d]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#00884d]/10 text-[#00884d] text-sm font-semibold mb-6">
                🏆 Premium Selection
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Featured{" "}
                <span className="bg-gradient-to-r from-[#00884d] to-[#00a855] bg-clip-text text-transparent">
                  Venues
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover top-rated sports facilities handpicked for their
                quality, amenities, and customer satisfaction
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-300/50 to-transparent" />
                    </div>
                    <CardHeader className="pb-3">
                      <div className="space-y-3">
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-lg" />
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-lg w-3/4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-full w-16" />
                          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-full w-20" />
                          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-full w-14" />
                        </div>
                        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-xl" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Unable to load venues
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  There was an error loading featured venues. Please check your
                  connection and try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-[#00884d] hover:bg-[#00a855]"
                  >
                    🔄 Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/venues")}
                    className="border-[#00884d] text-[#00884d] hover:bg-[#00884d]/5"
                  >
                    Browse All Venues
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredVenues.map((venue, index) => (
                  <Card
                    key={venue.id}
                    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {venue.photoUrls && venue.photoUrls.length > 0 ? (
                        <img
                          src={venue.photoUrls[0]}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#00884d]/20 to-[#00a855]/10 flex items-center justify-center">
                          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                            🏟️
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Enhanced overlay content */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-end justify-between">
                          <div>
                            {venue.priceRange && (
                              <Badge className="mb-2 bg-[#00884d]/90 hover:bg-[#00884d] text-white border-0">
                                {venue.priceRange}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-sm font-medium">
                              {venue.rating ? venue.rating.toFixed(1) : "New"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[#00884d]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 px-4 py-2 rounded-full text-[#00884d] font-semibold text-sm">
                          View Details →
                        </div>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="space-y-3">
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#00884d] transition-colors duration-200 line-clamp-1">
                            {venue.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-2 text-gray-600">
                            <MapPin className="h-4 w-4 text-[#00884d]" />
                            <span className="line-clamp-1">
                              {venue.address}
                            </span>
                          </CardDescription>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-900">
                              {venue.rating ? venue.rating.toFixed(1) : "New"}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({venue.reviewCount} reviews)
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              Starting from
                            </div>
                            <div className="text-sm font-bold text-[#00884d]">
                              ₹500/hr
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {venue.sports.slice(0, 3).map((sport) => (
                            <Badge
                              key={sport}
                              className="text-xs bg-[#00884d]/10 text-[#00884d] hover:bg-[#00884d]/20 border-0"
                            >
                              {sport}
                            </Badge>
                          ))}
                          {venue.sports.length > 3 && (
                            <Badge className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
                              +{venue.sports.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <Link href={`/venues/${venue.id}`} className="block">
                          <Button className="w-full bg-gradient-to-r from-[#00884d] to-[#00a855] hover:from-[#00a855] hover:to-[#00884d] text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                            <span className="mr-2">View Details</span>
                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                              →
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Enhanced CTA Section */}
            <div className="text-center mt-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#00884d]/10 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Discover More Amazing Venues
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore our complete collection of premium sports facilities
                  across the city
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => router.push("/venues")}
                    className="bg-gradient-to-r from-[#00884d] to-[#00a855] hover:from-[#00a855] hover:to-[#00884d] text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    🏟️ View All Venues
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/venues?filter=nearby")}
                    className="border-2 border-[#00884d] text-[#00884d] hover:bg-[#00884d] hover:text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    📍 Find Nearby
                  </Button>
                </div>
              </div>
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
